// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";

/**
 * @title ProTrackMPC
 * @dev Enhanced Multi-Party Computation contract for secure supply chain operations
 * Implements threshold signatures, key management, and supply chain-specific features
 */
contract ProTrackMPC is AccessControl, ReentrancyGuard {
    using ECDSA for bytes32;

    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant ORACLE_ROLE = keccak256("ORACLE_ROLE");
    bytes32 public constant MANUFACTURER_ROLE = keccak256("MANUFACTURER_ROLE");
    bytes32 public constant SUPPLIER_ROLE = keccak256("SUPPLIER_ROLE");
    bytes32 public constant DISTRIBUTOR_ROLE = keccak256("DISTRIBUTOR_ROLE");

    struct Key {
        bytes publicKey;
        uint256 threshold;
        address[] authorizedParties;
        mapping(address => bool) isAuthorized;
        bool isActive;
        uint256 lastUsed;
        bytes32 purpose; // e.g., "product_verification", "shipment_approval"
    }

    struct Transaction {
        bytes32 keyId;
        bytes32 operationHash;
        address initiator;
        uint256 timestamp;
        bool isExecuted;
        mapping(address => bool) hasApproved;
        uint256 approvalCount;
    }

    mapping(bytes32 => Key) private _keys;
    mapping(bytes32 => mapping(address => bytes)) private _signatures;
    mapping(bytes32 => uint256) private _signatureCount;
    mapping(bytes32 => Transaction) private _transactions;
    mapping(address => bytes32[]) private _userKeys;
    
    // Supply chain specific mappings
    mapping(bytes32 => mapping(bytes32 => bool)) private _productVerifications;
    mapping(bytes32 => mapping(address => uint256)) private _lastVerificationTime;

    event KeyCreated(bytes32 indexed keyId, bytes publicKey, uint256 threshold, bytes32 purpose);
    event SignatureSubmitted(bytes32 indexed keyId, address indexed party);
    event SignatureVerified(bytes32 indexed keyId, bool success);
    event PartyAuthorized(bytes32 indexed keyId, address indexed party);
    event PartyRevoked(bytes32 indexed keyId, address indexed party);
    event TransactionInitiated(bytes32 indexed txId, bytes32 indexed keyId, address initiator);
    event TransactionApproved(bytes32 indexed txId, address approver);
    event TransactionExecuted(bytes32 indexed txId);
    event ProductVerified(bytes32 indexed productId, bytes32 indexed keyId, bool success);

    constructor() {
        _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _setupRole(ADMIN_ROLE, msg.sender);
    }

    function createKey(
        bytes32 keyId,
        bytes memory publicKey,
        uint256 threshold,
        address[] memory initialParties,
        bytes32 purpose
    ) public onlyRole(ADMIN_ROLE) {
        require(threshold > 0, "Threshold must be greater than 0");
        require(threshold <= initialParties.length, "Threshold exceeds party count");
        require(_keys[keyId].publicKey.length == 0, "Key already exists");

        Key storage newKey = _keys[keyId];
        newKey.publicKey = publicKey;
        newKey.threshold = threshold;
        newKey.purpose = purpose;
        newKey.isActive = true;
        newKey.lastUsed = block.timestamp;

        for (uint i = 0; i < initialParties.length; i++) {
            require(initialParties[i] != address(0), "Invalid party address");
            require(
                hasRole(MANUFACTURER_ROLE, initialParties[i]) ||
                hasRole(SUPPLIER_ROLE, initialParties[i]) ||
                hasRole(DISTRIBUTOR_ROLE, initialParties[i]),
                "Party must have valid supply chain role"
            );
            newKey.authorizedParties.push(initialParties[i]);
            newKey.isAuthorized[initialParties[i]] = true;
            _userKeys[initialParties[i]].push(keyId);
        }

        emit KeyCreated(keyId, publicKey, threshold, purpose);
    }

    function initiateTransaction(
        bytes32 keyId,
        bytes32 operationHash
    ) public returns (bytes32) {
        require(_keys[keyId].publicKey.length > 0, "Key does not exist");
        require(_keys[keyId].isAuthorized[msg.sender], "Not authorized for key");
        require(_keys[keyId].isActive, "Key is not active");

        bytes32 txId = keccak256(abi.encodePacked(keyId, operationHash, block.timestamp));
        Transaction storage newTx = _transactions[txId];
        newTx.keyId = keyId;
        newTx.operationHash = operationHash;
        newTx.initiator = msg.sender;
        newTx.timestamp = block.timestamp;
        newTx.isExecuted = false;
        newTx.approvalCount = 0;

        emit TransactionInitiated(txId, keyId, msg.sender);
        return txId;
    }

    function approveTransaction(bytes32 txId, bytes memory signature) public {
        Transaction storage tx = _transactions[txId];
        require(tx.timestamp > 0, "Transaction does not exist");
        require(!tx.isExecuted, "Transaction already executed");
        require(_keys[tx.keyId].isAuthorized[msg.sender], "Not authorized for key");
        require(!tx.hasApproved[msg.sender], "Already approved");

        bytes32 messageHash = keccak256(abi.encodePacked(tx.operationHash, tx.timestamp));
        bytes32 ethSignedMessageHash = messageHash.toEthSignedMessageHash();
        address signer = ethSignedMessageHash.recover(signature);
        require(signer == msg.sender, "Invalid signature");

        tx.hasApproved[msg.sender] = true;
        tx.approvalCount++;

        emit TransactionApproved(txId, msg.sender);

        if (tx.approvalCount >= _keys[tx.keyId].threshold) {
            tx.isExecuted = true;
            emit TransactionExecuted(txId);
        }
    }

    function submitSignature(bytes32 keyId, bytes memory signature) public {
        require(_keys[keyId].publicKey.length > 0, "Key does not exist");
        require(_keys[keyId].isAuthorized[msg.sender], "Not authorized for key");
        require(_signatures[keyId][msg.sender].length == 0, "Signature already submitted");
        require(_keys[keyId].isActive, "Key is not active");

        _signatures[keyId][msg.sender] = signature;
        _signatureCount[keyId]++;
        _keys[keyId].lastUsed = block.timestamp;

        emit SignatureSubmitted(keyId, msg.sender);
    }

    function verifyProduct(
        bytes32 productId,
        bytes32 keyId,
        bytes memory signature
    ) public returns (bool) {
        require(_keys[keyId].publicKey.length > 0, "Key does not exist");
        require(_keys[keyId].isAuthorized[msg.sender], "Not authorized for key");
        require(_keys[keyId].isActive, "Key is not active");
        require(
            block.timestamp >= _lastVerificationTime[keyId][msg.sender] + 1 minutes,
            "Verification too frequent"
        );

        bytes32 messageHash = keccak256(abi.encodePacked(productId, block.timestamp));
        bytes32 ethSignedMessageHash = messageHash.toEthSignedMessageHash();
        address signer = ethSignedMessageHash.recover(signature);
        
        bool isValid = signer == msg.sender && _keys[keyId].isAuthorized[signer];
        if (isValid) {
            _productVerifications[keyId][productId] = true;
            _lastVerificationTime[keyId][msg.sender] = block.timestamp;
        }

        emit ProductVerified(productId, keyId, isValid);
        return isValid;
    }

    function verifySignatures(bytes32 keyId) public view returns (bool) {
        require(_keys[keyId].publicKey.length > 0, "Key does not exist");
        return _signatureCount[keyId] >= _keys[keyId].threshold;
    }

    function authorizeParty(bytes32 keyId, address party) public onlyRole(ADMIN_ROLE) {
        require(_keys[keyId].publicKey.length > 0, "Key does not exist");
        require(!_keys[keyId].isAuthorized[party], "Party already authorized");
        require(
            hasRole(MANUFACTURER_ROLE, party) ||
            hasRole(SUPPLIER_ROLE, party) ||
            hasRole(DISTRIBUTOR_ROLE, party),
            "Party must have valid supply chain role"
        );

        _keys[keyId].authorizedParties.push(party);
        _keys[keyId].isAuthorized[party] = true;
        _userKeys[party].push(keyId);

        emit PartyAuthorized(keyId, party);
    }

    function revokeParty(bytes32 keyId, address party) public onlyRole(ADMIN_ROLE) {
        require(_keys[keyId].publicKey.length > 0, "Key does not exist");
        require(_keys[keyId].isAuthorized[party], "Party not authorized");

        _keys[keyId].isAuthorized[party] = false;
        
        // Remove party from authorized parties array
        uint256 length = _keys[keyId].authorizedParties.length;
        for (uint i = 0; i < length; i++) {
            if (_keys[keyId].authorizedParties[i] == party) {
                _keys[keyId].authorizedParties[i] = _keys[keyId].authorizedParties[length - 1];
                _keys[keyId].authorizedParties.pop();
                break;
            }
        }

        // Remove key from user's keys
        bytes32[] storage userKeys = _userKeys[party];
        length = userKeys.length;
        for (uint i = 0; i < length; i++) {
            if (userKeys[i] == keyId) {
                userKeys[i] = userKeys[length - 1];
                userKeys.pop();
                break;
            }
        }

        emit PartyRevoked(keyId, party);
    }

    function getKey(bytes32 keyId)
        public
        view
        returns (
            bytes memory publicKey,
            uint256 threshold,
            address[] memory authorizedParties,
            uint256 currentSignatures,
            bool isActive,
            uint256 lastUsed,
            bytes32 purpose
        )
    {
        require(_keys[keyId].publicKey.length > 0, "Key does not exist");
        return (
            _keys[keyId].publicKey,
            _keys[keyId].threshold,
            _keys[keyId].authorizedParties,
            _signatureCount[keyId],
            _keys[keyId].isActive,
            _keys[keyId].lastUsed,
            _keys[keyId].purpose
        );
    }

    function getTransaction(bytes32 txId)
        public
        view
        returns (
            bytes32 keyId,
            bytes32 operationHash,
            address initiator,
            uint256 timestamp,
            bool isExecuted,
            uint256 approvalCount
        )
    {
        Transaction storage tx = _transactions[txId];
        require(tx.timestamp > 0, "Transaction does not exist");
        return (
            tx.keyId,
            tx.operationHash,
            tx.initiator,
            tx.timestamp,
            tx.isExecuted,
            tx.approvalCount
        );
    }

    function getUserKeys(address user)
        public
        view
        returns (bytes32[] memory)
    {
        return _userKeys[user];
    }

    function isAuthorizedForKey(bytes32 keyId, address party)
        public
        view
        returns (bool)
    {
        require(_keys[keyId].publicKey.length > 0, "Key does not exist");
        return _keys[keyId].isAuthorized[party];
    }

    function isProductVerified(bytes32 keyId, bytes32 productId)
        public
        view
        returns (bool)
    {
        require(_keys[keyId].publicKey.length > 0, "Key does not exist");
        return _productVerifications[keyId][productId];
    }

    function clearSignatures(bytes32 keyId) public onlyRole(ADMIN_ROLE) {
        require(_keys[keyId].publicKey.length > 0, "Key does not exist");
        
        address[] memory parties = _keys[keyId].authorizedParties;
        for (uint i = 0; i < parties.length; i++) {
            delete _signatures[keyId][parties[i]];
        }
        _signatureCount[keyId] = 0;
    }

    function deactivateKey(bytes32 keyId) public onlyRole(ADMIN_ROLE) {
        require(_keys[keyId].publicKey.length > 0, "Key does not exist");
        require(_keys[keyId].isActive, "Key already inactive");
        _keys[keyId].isActive = false;
    }

    function reactivateKey(bytes32 keyId) public onlyRole(ADMIN_ROLE) {
        require(_keys[keyId].publicKey.length > 0, "Key does not exist");
        require(!_keys[keyId].isActive, "Key already active");
        _keys[keyId].isActive = true;
        _keys[keyId].lastUsed = block.timestamp;
    }
}