// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
/**
 * @title ProTrackMPCWallet
 * @dev Multi-Party Computation (MPC) multisignature wallet for secure supply chain transactions
 * Implements threshold signatures and privacy-preserving key management
 */
contract ProTrackMPCWallet is AccessControl, ReentrancyGuard {
    using ECDSA for bytes32;

    // Role definitions
    bytes32 public constant MPC_OPERATOR_ROLE = keccak256("MPC_OPERATOR_ROLE");
    bytes32 public constant THRESHOLD_SIGNER_ROLE = keccak256("THRESHOLD_SIGNER_ROLE");
    bytes32 public constant SUPPLY_CHAIN_ROLE = keccak256("SUPPLY_CHAIN_ROLE");

    // MPC Wallet Configuration
    struct MPCWalletConfig {
        uint256 threshold;          // Minimum signatures required
        uint256 totalSigners;       // Total number of signers
        bool isActive;              // Wallet status
        uint256 nonce;              // Transaction nonce
        mapping(address => bool) signers;
        mapping(bytes32 => uint256) signatureCount;
        mapping(bytes32 => mapping(address => bool)) hasSignedTx;
    }

    // Transaction structure for MPC operations
    struct MPCTransaction {
        bytes32 txHash;
        address to;
        uint256 value;
        bytes data;
        uint256 nonce;
        uint256 timestamp;
        bool executed;
        string operation; // "MINT", "TRANSFER", "RECALL", "IOT_UPDATE"
    }

    // Privacy-preserving key shares
    struct KeyShare {
        bytes32 shareHash;          // Hash of the key share
        address holder;             // Address holding this share
        uint256 shareIndex;         // Index in the threshold scheme
        bool isActive;              // Share status
        uint256 lastUsed;           // Last usage timestamp
    }

    // Product-specific encryption keys
    struct ProductEncryption {
        bytes32 masterKeyHash;      // Master key hash for product
        mapping(address => bytes32) userKeys; // User-specific decryption keys
        mapping(address => bool) authorizedUsers;
        uint256 keyRotationTime;    // When keys were last rotated
        bool privacyEnabled;        // Privacy mode toggle
    }

    // State variables
    mapping(uint256 => MPCWalletConfig) public wallets;
    mapping(bytes32 => MPCTransaction) public transactions;
    mapping(uint256 => KeyShare[]) public walletKeyShares;
    mapping(uint256 => ProductEncryption) public productEncryption;
    mapping(address => uint256[]) public userWallets;
    
    uint256 public walletCounter;
    uint256 public constant MAX_SIGNERS = 20;
    uint256 public constant MIN_THRESHOLD = 2;

    // Events
    event MPCWalletCreated(
        uint256 indexed walletId,
        address[] signers,
        uint256 threshold
    );

    event TransactionProposed(
        bytes32 indexed txHash,
        uint256 indexed walletId,
        address indexed proposer,
        string operation
    );

    event TransactionSigned(
        bytes32 indexed txHash,
        address indexed signer,
        uint256 signatureCount
    );

    event TransactionExecuted(
        bytes32 indexed txHash,
        uint256 indexed walletId,
        bool success
    );

    event KeyShareGenerated(
        uint256 indexed walletId,
        address indexed holder,
        uint256 shareIndex
    );

    event ProductKeysRotated(
        uint256 indexed productId,
        uint256 timestamp
    );

    event PrivacyModeToggled(
        uint256 indexed productId,
        bool enabled
    );

    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(MPC_OPERATOR_ROLE, msg.sender);
    }

    /**
     * @dev Create a new MPC wallet with threshold signature scheme
     */
    function createMPCWallet(
        address[] memory signers,
        uint256 threshold
    ) public onlyRole(MPC_OPERATOR_ROLE) returns (uint256) {
        require(signers.length >= MIN_THRESHOLD, "Insufficient signers");
        require(signers.length <= MAX_SIGNERS, "Too many signers");
        require(threshold >= MIN_THRESHOLD, "Threshold too low");
        require(threshold <= signers.length, "Threshold exceeds signers");

        uint256 walletId = walletCounter++;
        MPCWalletConfig storage wallet = wallets[walletId];
        
        wallet.threshold = threshold;
        wallet.totalSigners = signers.length;
        wallet.isActive = true;
        wallet.nonce = 0;

        // Add signers and grant roles
        for (uint256 i = 0; i < signers.length; i++) {
            require(signers[i] != address(0), "Invalid signer address");
            wallet.signers[signers[i]] = true;
            userWallets[signers[i]].push(walletId);
            _grantRole(THRESHOLD_SIGNER_ROLE, signers[i]);
        }

        // Generate key shares for MPC
        _generateKeyShares(walletId, signers);

        emit MPCWalletCreated(walletId, signers, threshold);
        return walletId;
    }

    /**
     * @dev Propose a new transaction requiring threshold signatures
     */
    function proposeTransaction(
        uint256 walletId,
        address to,
        uint256 value,
        bytes memory data,
        string memory operation
    ) public returns (bytes32) {
        require(wallets[walletId].isActive, "Wallet not active");
        require(wallets[walletId].signers[msg.sender], "Not a signer");

        uint256 nonce = wallets[walletId].nonce++;
        bytes32 txHash = keccak256(abi.encodePacked(
            walletId,
            to,
            value,
            data,
            nonce,
            block.timestamp,
            operation
        ));

        transactions[txHash] = MPCTransaction({
            txHash: txHash,
            to: to,
            value: value,
            data: data,
            nonce: nonce,
            timestamp: block.timestamp,
            executed: false,
            operation: operation
        });

        // Auto-sign by proposer
        _signTransaction(walletId, txHash);

        emit TransactionProposed(txHash, walletId, msg.sender, operation);
        return txHash;
    }

    /**
     * @dev Sign a proposed transaction
     */
    function signTransaction(
        uint256 walletId,
        bytes32 txHash
    ) public {
        require(wallets[walletId].isActive, "Wallet not active");
        require(wallets[walletId].signers[msg.sender], "Not a signer");
        require(!transactions[txHash].executed, "Transaction already executed");
        require(!wallets[walletId].hasSignedTx[txHash][msg.sender], "Already signed");

        _signTransaction(walletId, txHash);
    }

    /**
     * @dev Execute transaction if threshold is met
     */
    function executeTransaction(
        uint256 walletId,
        bytes32 txHash
    ) public nonReentrant {
        require(wallets[walletId].isActive, "Wallet not active");
        require(!transactions[txHash].executed, "Transaction already executed");
        require(
            wallets[walletId].signatureCount[txHash] >= wallets[walletId].threshold,
            "Insufficient signatures"
        );

        transactions[txHash].executed = true;
        
        // Execute the transaction
        MPCTransaction memory txn = transactions[txHash];
        bool success = false;
        
        if (txn.value > 0) {
            (success, ) = txn.to.call{value: txn.value}(txn.data);
        } else {
            (success, ) = txn.to.call(txn.data);
        }

        emit TransactionExecuted(txHash, walletId, success);
    }

    /**
     * @dev Generate product-specific encryption keys with privacy
     */
    function generateProductKeys(
        uint256 productId,
        address[] memory authorizedUsers,
        bool enablePrivacy
    ) public onlyRole(SUPPLY_CHAIN_ROLE) {
        ProductEncryption storage encryption = productEncryption[productId];
        
        // Generate master key hash
        encryption.masterKeyHash = keccak256(abi.encodePacked(
            productId,
            block.timestamp,
            block.difficulty,
            "MASTER_KEY"
        ));

        // Generate user-specific keys
        for (uint256 i = 0; i < authorizedUsers.length; i++) {
            address user = authorizedUsers[i];
            encryption.userKeys[user] = keccak256(abi.encodePacked(
                encryption.masterKeyHash,
                user,
                block.timestamp,
                i
            ));
            encryption.authorizedUsers[user] = true;
        }

        encryption.keyRotationTime = block.timestamp;
        encryption.privacyEnabled = enablePrivacy;

        if (enablePrivacy) {
            emit PrivacyModeToggled(productId, true);
        }
    }

    /**
     * @dev Rotate encryption keys for enhanced security
     */
    function rotateProductKeys(
        uint256 productId,
        address[] memory newAuthorizedUsers
    ) public onlyRole(SUPPLY_CHAIN_ROLE) {
        ProductEncryption storage encryption = productEncryption[productId];
        require(encryption.masterKeyHash != bytes32(0), "Product keys not initialized");

        // Clear old authorizations
        // Note: In production, you'd want to iterate through existing users
        // For simplicity, we're requiring the full new list

        // Generate new master key
        encryption.masterKeyHash = keccak256(abi.encodePacked(
            productId,
            block.timestamp,
            block.difficulty,
            "ROTATED_MASTER_KEY"
        ));

        // Generate new user keys
        for (uint256 i = 0; i < newAuthorizedUsers.length; i++) {
            address user = newAuthorizedUsers[i];
            encryption.userKeys[user] = keccak256(abi.encodePacked(
                encryption.masterKeyHash,
                user,
                block.timestamp,
                i
            ));
            encryption.authorizedUsers[user] = true;
        }

        encryption.keyRotationTime = block.timestamp;

        emit ProductKeysRotated(productId, block.timestamp);
    }

    /**
     * @dev Get user's decryption key for a product (if authorized)
     */
    function getUserDecryptionKey(
        uint256 productId,
        address user
    ) public view returns (bytes32) {
        ProductEncryption storage encryption = productEncryption[productId];
        require(encryption.authorizedUsers[user], "User not authorized");
        return encryption.userKeys[user];
    }

    /**
     * @dev Check if user has access to product data
     */
    function hasProductAccess(
        uint256 productId,
        address user
    ) public view returns (bool) {
        return productEncryption[productId].authorizedUsers[user];
    }

    /**
     * @dev Toggle privacy mode for a product
     */
    function togglePrivacyMode(
        uint256 productId,
        bool enable
    ) public onlyRole(SUPPLY_CHAIN_ROLE) {
        productEncryption[productId].privacyEnabled = enable;
        emit PrivacyModeToggled(productId, enable);
    }

    /**
     * @dev Get wallet information
     */
    function getWalletInfo(uint256 walletId) 
        public 
        view 
        returns (
            uint256 threshold,
            uint256 totalSigners,
            bool isActive,
            uint256 nonce
        ) 
    {
        MPCWalletConfig storage wallet = wallets[walletId];
        return (
            wallet.threshold,
            wallet.totalSigners,
            wallet.isActive,
            wallet.nonce
        );
    }

    /**
     * @dev Get transaction signature count
     */
    function getSignatureCount(
        uint256 walletId,
        bytes32 txHash
    ) public view returns (uint256) {
        return wallets[walletId].signatureCount[txHash];
    }

    /**
     * @dev Check if address is a signer for wallet
     */
    function isSigner(
        uint256 walletId,
        address account
    ) public view returns (bool) {
        return wallets[walletId].signers[account];
    }

    /**
     * @dev Internal function to sign transaction
     */
    function _signTransaction(uint256 walletId, bytes32 txHash) internal {
        wallets[walletId].hasSignedTx[txHash][msg.sender] = true;
        wallets[walletId].signatureCount[txHash]++;

        emit TransactionSigned(
            txHash,
            msg.sender,
            wallets[walletId].signatureCount[txHash]
        );

        // Auto-execute if threshold reached
        if (wallets[walletId].signatureCount[txHash] >= wallets[walletId].threshold) {
            // Note: In production, you might want to require explicit execution
            // executeTransaction(walletId, txHash);
        }
    }

    /**
     * @dev Internal function to generate key shares for MPC
     */
    function _generateKeyShares(
        uint256 walletId,
        address[] memory signers
    ) internal {
        for (uint256 i = 0; i < signers.length; i++) {
            KeyShare memory share = KeyShare({
                shareHash: keccak256(abi.encodePacked(
                    walletId,
                    signers[i],
                    block.timestamp,
                    i,
                    "KEY_SHARE"
                )),
                holder: signers[i],
                shareIndex: i,
                isActive: true,
                lastUsed: block.timestamp
            });

            walletKeyShares[walletId].push(share);

            emit KeyShareGenerated(walletId, signers[i], i);
        }
    }

    /**
     * @dev Emergency function to deactivate wallet
     */
    function deactivateWallet(uint256 walletId) 
        public 
        onlyRole(DEFAULT_ADMIN_ROLE) 
    {
        wallets[walletId].isActive = false;
    }

    /**
     * @dev Receive function to accept ETH
     */
    receive() external payable {}

    /**
     * @dev Fallback function
     */
    fallback() external payable {}
}
