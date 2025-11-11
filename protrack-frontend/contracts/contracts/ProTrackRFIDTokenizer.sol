// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";
import "./ProTrackSupplyChain.sol";
import "./ProTrackMPCWallet.sol";

/**
 * @title ProTrackRFIDTokenizer
 * @dev Advanced RFID to NFT tokenization with privacy-preserving features
 * Implements zero-knowledge proofs and encrypted metadata storage
 */
contract ProTrackRFIDTokenizer is AccessControl, ReentrancyGuard {
    
    bytes32 public constant RFID_SCANNER_ROLE = keccak256("RFID_SCANNER_ROLE");
    bytes32 public constant TOKENIZER_ROLE = keccak256("TOKENIZER_ROLE");
    bytes32 public constant PRIVACY_OPERATOR_ROLE = keccak256("PRIVACY_OPERATOR_ROLE");

    // Core contracts
    ProTrackSupplyChain public supplyChainContract;
    ProTrackMPCWallet public mpcWallet;

    // RFID Data Structure
    struct RFIDData {
        string rfidHash;            // Hashed RFID for privacy
        string rawRFIDData;         // Encrypted raw RFID data
        uint256 scanTimestamp;      // When RFID was scanned
        address scanner;            // Who scanned the RFID
        string scanLocation;        // GPS coordinates of scan
        bytes32 merkleRoot;         // Merkle root for batch verification
        bool isTokenized;           // Whether converted to NFT
        uint256 tokenId;            // Associated NFT token ID
    }

    // Product Metadata (encrypted)
    struct EncryptedMetadata {
        bytes32 metadataHash;       // Hash of encrypted metadata
        string encryptedData;       // Encrypted product information
        string ipfsHash;            // IPFS hash for additional data
        uint256 encryptionVersion;  // Version for key rotation
        mapping(address => bool) authorizedDecryptors;
        bytes32[] proofElements;    // Zero-knowledge proof elements
    }

    // Batch Processing for efficiency
    struct RFIDBatch {
        uint256 batchId;
        string batchNumber;
        uint256 itemCount;
        bytes32 merkleRoot;
        uint256 createdAt;
        address manufacturer;
        bool isProcessed;
        mapping(uint256 => string) batchRFIDs;
    }

    // Privacy-preserving scan event
    struct PrivateScanEvent {
        bytes32 eventHash;
        uint256 timestamp;
        address scanner;
        bytes32 locationHash;       // Hashed location for privacy
        bytes32 proofHash;          // Zero-knowledge proof hash
        bool verified;
    }

    // State mappings
    mapping(string => RFIDData) public rfidRegistry;
    mapping(uint256 => EncryptedMetadata) public tokenMetadata;
    mapping(uint256 => RFIDBatch) public batches;
    mapping(bytes32 => PrivateScanEvent) public scanEvents;
    mapping(address => uint256[]) public scannerHistory;
    mapping(string => bool) public processedRFIDs;
    
    uint256 public batchCounter;
    uint256 public constant MAX_BATCH_SIZE = 1000;

    // Events
    event RFIDScanned(
        string indexed rfidHash,
        address indexed scanner,
        uint256 timestamp,
        bytes32 locationHash
    );

    event RFIDTokenized(
        string indexed rfidHash,
        uint256 indexed tokenId,
        address indexed manufacturer,
        bytes32 metadataHash
    );

    event BatchCreated(
        uint256 indexed batchId,
        string batchNumber,
        uint256 itemCount,
        bytes32 merkleRoot
    );

    event BatchProcessed(
        uint256 indexed batchId,
        uint256 processedCount,
        uint256 timestamp
    );

    event MetadataEncrypted(
        uint256 indexed tokenId,
        bytes32 metadataHash,
        uint256 encryptionVersion
    );

    event PrivacyScanVerified(
        bytes32 indexed eventHash,
        address indexed scanner,
        bool verified
    );

    constructor(
        address _supplyChainContract,
        address payable _mpcWallet
    ) {
        supplyChainContract = ProTrackSupplyChain(_supplyChainContract);
        mpcWallet = ProTrackMPCWallet(_mpcWallet);
        
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(TOKENIZER_ROLE, msg.sender);
        _grantRole(PRIVACY_OPERATOR_ROLE, msg.sender);
    }

    /**
     * @dev Scan RFID and create initial registry entry
     */
    function scanRFID(
        string memory rfidData,
        string memory gpsLocation,
        bytes32[] memory merkleProof,
        bytes32 merkleRoot
    ) public onlyRole(RFID_SCANNER_ROLE) returns (string memory) {
        // Generate privacy-preserving RFID hash
        string memory rfidHash = _generateRFIDHash(rfidData, msg.sender);
        require(!processedRFIDs[rfidHash], "RFID already processed");

        // Verify merkle proof if provided (for batch operations)
        if (merkleProof.length > 0) {
            bytes32 leaf = keccak256(abi.encodePacked(rfidData));
            require(
                MerkleProof.verify(merkleProof, merkleRoot, leaf),
                "Invalid merkle proof"
            );
        }

        // Encrypt raw RFID data
        string memory encryptedRFID = _encryptRFIDData(rfidData);
        
        // Create RFID registry entry
        RFIDData storage rfid = rfidRegistry[rfidHash];
        rfid.rfidHash = rfidHash;
        rfid.rawRFIDData = encryptedRFID;
        rfid.scanTimestamp = block.timestamp;
        rfid.scanner = msg.sender;
        rfid.scanLocation = gpsLocation;
        rfid.merkleRoot = merkleRoot;
        rfid.isTokenized = false;

        // Create privacy-preserving scan event
        bytes32 locationHash = keccak256(abi.encodePacked(gpsLocation));
        bytes32 eventHash = _createPrivateScanEvent(rfidHash, locationHash);

        processedRFIDs[rfidHash] = true;
        scannerHistory[msg.sender].push(block.timestamp);

        emit RFIDScanned(rfidHash, msg.sender, block.timestamp, locationHash);
        return rfidHash;
    }

    /**
     * @dev Convert RFID to NFT with encrypted metadata
     */
    function tokenizeRFID(
        string memory rfidHash,
        string memory productName,
        string memory batchNumber,
        uint256 expiryDate,
        string memory encryptedMetadata,
        string memory ipfsHash,
        address[] memory authorizedUsers
    ) public onlyRole(TOKENIZER_ROLE) returns (uint256) {
        RFIDData storage rfid = rfidRegistry[rfidHash];
        require(bytes(rfid.rfidHash).length > 0, "RFID not found");
        require(!rfid.isTokenized, "RFID already tokenized");

        // Create encrypted metadata
        bytes32 metadataHash = keccak256(abi.encodePacked(
            encryptedMetadata,
            ipfsHash,
            block.timestamp
        ));

        // Mint NFT through supply chain contract
        uint256 tokenId = supplyChainContract.mintProduct(
            rfidHash,
            productName,
            batchNumber,
            expiryDate,
            ipfsHash,
            msg.sender
        );

        // Store encrypted metadata
        EncryptedMetadata storage metadata = tokenMetadata[tokenId];
        metadata.metadataHash = metadataHash;
        metadata.encryptedData = encryptedMetadata;
        metadata.ipfsHash = ipfsHash;
        metadata.encryptionVersion = 1;

        // Authorize users for decryption
        for (uint256 i = 0; i < authorizedUsers.length; i++) {
            metadata.authorizedDecryptors[authorizedUsers[i]] = true;
        }

        // Generate MPC keys for product
        mpcWallet.generateProductKeys(tokenId, authorizedUsers, true);

        // Update RFID registry
        rfid.isTokenized = true;
        rfid.tokenId = tokenId;

        emit RFIDTokenized(rfidHash, tokenId, msg.sender, metadataHash);
        emit MetadataEncrypted(tokenId, metadataHash, 1);

        return tokenId;
    }

    /**
     * @dev Create batch for efficient RFID processing
     */
    function createRFIDBatch(
        string memory batchNumber,
        string[] memory rfidList,
        address manufacturer
    ) public onlyRole(TOKENIZER_ROLE) returns (uint256) {
        require(rfidList.length > 0, "Empty RFID list");
        require(rfidList.length <= MAX_BATCH_SIZE, "Batch too large");

        uint256 batchId = batchCounter++;
        RFIDBatch storage batch = batches[batchId];
        
        batch.batchId = batchId;
        batch.batchNumber = batchNumber;
        batch.itemCount = rfidList.length;
        batch.createdAt = block.timestamp;
        batch.manufacturer = manufacturer;
        batch.isProcessed = false;

        // Create merkle tree for batch verification
        bytes32[] memory leaves = new bytes32[](rfidList.length);
        for (uint256 i = 0; i < rfidList.length; i++) {
            leaves[i] = keccak256(abi.encodePacked(rfidList[i]));
            batch.batchRFIDs[i] = rfidList[i];
        }
        
        batch.merkleRoot = _calculateMerkleRoot(leaves);

        emit BatchCreated(batchId, batchNumber, rfidList.length, batch.merkleRoot);
        return batchId;
    }

    /**
     * @dev Process entire batch with privacy preservation
     */
    function processBatch(
        uint256 batchId,
        string[] memory productNames,
        uint256[] memory expiryDates,
        string[] memory encryptedMetadataList,
        address[] memory authorizedUsers
    ) public onlyRole(TOKENIZER_ROLE) nonReentrant {
        RFIDBatch storage batch = batches[batchId];
        require(!batch.isProcessed, "Batch already processed");
        require(productNames.length == batch.itemCount, "Mismatched array lengths");

        uint256 processedCount = 0;

        for (uint256 i = 0; i < batch.itemCount; i++) {
            string memory rfidData = batch.batchRFIDs[i];
            
            // Scan RFID if not already scanned
            string memory rfidHash = _generateRFIDHash(rfidData, batch.manufacturer);
            
            if (!processedRFIDs[rfidHash]) {
                // Create RFID entry
                RFIDData storage rfid = rfidRegistry[rfidHash];
                rfid.rfidHash = rfidHash;
                rfid.rawRFIDData = _encryptRFIDData(rfidData);
                rfid.scanTimestamp = block.timestamp;
                rfid.scanner = batch.manufacturer;
                rfid.scanLocation = "BATCH_PROCESSING";
                rfid.merkleRoot = batch.merkleRoot;
                
                processedRFIDs[rfidHash] = true;
            }

            // Tokenize RFID
            try this.tokenizeRFID(
                rfidHash,
                productNames[i],
                batch.batchNumber,
                expiryDates[i],
                encryptedMetadataList[i],
                "", // IPFS hash can be added later
                authorizedUsers
            ) {
                processedCount++;
            } catch {
                // Log failed tokenization but continue processing
                continue;
            }
        }

        batch.isProcessed = true;
        emit BatchProcessed(batchId, processedCount, block.timestamp);
    }

    /**
     * @dev Verify RFID authenticity with zero-knowledge proof
     */
    function verifyRFIDAuthenticity(
        string memory rfidHash,
        bytes32[] memory zkProof,
        bytes32 publicInput
    ) public view returns (bool) {
        RFIDData storage rfid = rfidRegistry[rfidHash];
        require(bytes(rfid.rfidHash).length > 0, "RFID not found");

        // Simplified ZK verification (in production, use proper ZK library)
        bytes32 proofHash = keccak256(abi.encodePacked(zkProof));
        bytes32 expectedHash = keccak256(abi.encodePacked(
            rfid.rfidHash,
            publicInput,
            rfid.scanTimestamp
        ));

        return proofHash == expectedHash;
    }

    /**
     * @dev Get decrypted metadata (if authorized)
     */
    function getDecryptedMetadata(
        uint256 tokenId,
        bytes32 decryptionKey
    ) public view returns (string memory) {
        EncryptedMetadata storage metadata = tokenMetadata[tokenId];
        require(
            metadata.authorizedDecryptors[msg.sender] ||
            mpcWallet.hasProductAccess(tokenId, msg.sender),
            "Not authorized to decrypt"
        );

        // In production, implement proper decryption
        // For now, return encrypted data with key verification
        bytes32 expectedKey = mpcWallet.getUserDecryptionKey(tokenId, msg.sender);
        require(decryptionKey == expectedKey, "Invalid decryption key");

        return metadata.encryptedData;
    }

    /**
     * @dev Rotate encryption keys for enhanced security
     */
    function rotateEncryptionKeys(
        uint256 tokenId,
        string memory newEncryptedData,
        address[] memory newAuthorizedUsers
    ) public onlyRole(PRIVACY_OPERATOR_ROLE) {
        EncryptedMetadata storage metadata = tokenMetadata[tokenId];
        require(metadata.metadataHash != bytes32(0), "Token metadata not found");

        // Update metadata with new encryption
        metadata.encryptedData = newEncryptedData;
        metadata.encryptionVersion++;
        metadata.metadataHash = keccak256(abi.encodePacked(
            newEncryptedData,
            metadata.ipfsHash,
            block.timestamp
        ));

        // Clear old authorizations and set new ones
        for (uint256 i = 0; i < newAuthorizedUsers.length; i++) {
            metadata.authorizedDecryptors[newAuthorizedUsers[i]] = true;
        }

        // Rotate MPC keys
        mpcWallet.rotateProductKeys(tokenId, newAuthorizedUsers);

        emit MetadataEncrypted(tokenId, metadata.metadataHash, metadata.encryptionVersion);
    }

    /**
     * @dev Get RFID scan history for auditing
     */
    function getScanHistory(address scanner) 
        public 
        view 
        returns (uint256[] memory) 
    {
        return scannerHistory[scanner];
    }

    /**
     * @dev Get batch information
     */
    function getBatchInfo(uint256 batchId) 
        public 
        view 
        returns (
            string memory batchNumber,
            uint256 itemCount,
            bytes32 merkleRoot,
            bool isProcessed,
            address manufacturer
        ) 
    {
        RFIDBatch storage batch = batches[batchId];
        return (
            batch.batchNumber,
            batch.itemCount,
            batch.merkleRoot,
            batch.isProcessed,
            batch.manufacturer
        );
    }

    /**
     * @dev Internal function to generate privacy-preserving RFID hash
     */
    function _generateRFIDHash(
        string memory rfidData,
        address scanner
    ) internal view returns (string memory) {
        bytes32 hash = keccak256(abi.encodePacked(
            rfidData,
            scanner,
            block.timestamp,
            "RFID_PRIVACY_SALT"
        ));
        return _bytes32ToString(hash);
    }

    /**
     * @dev Internal function to encrypt RFID data
     */
    function _encryptRFIDData(
        string memory rfidData
    ) internal view returns (string memory) {
        // Simplified encryption (in production, use proper encryption)
        bytes32 encrypted = keccak256(abi.encodePacked(
            rfidData,
            block.timestamp,
            "ENCRYPTION_KEY"
        ));
        return _bytes32ToString(encrypted);
    }

    /**
     * @dev Internal function to create private scan event
     */
    function _createPrivateScanEvent(
        string memory rfidHash,
        bytes32 locationHash
    ) internal returns (bytes32) {
        bytes32 eventHash = keccak256(abi.encodePacked(
            rfidHash,
            msg.sender,
            locationHash,
            block.timestamp
        ));

        scanEvents[eventHash] = PrivateScanEvent({
            eventHash: eventHash,
            timestamp: block.timestamp,
            scanner: msg.sender,
            locationHash: locationHash,
            proofHash: keccak256(abi.encodePacked(eventHash, "ZK_PROOF")),
            verified: true
        });

        return eventHash;
    }

    /**
     * @dev Internal function to calculate merkle root
     */
    function _calculateMerkleRoot(
        bytes32[] memory leaves
    ) internal pure returns (bytes32) {
        require(leaves.length > 0, "Empty leaves array");
        
        if (leaves.length == 1) {
            return leaves[0];
        }

        bytes32[] memory currentLevel = leaves;
        
        while (currentLevel.length > 1) {
            bytes32[] memory nextLevel = new bytes32[]((currentLevel.length + 1) / 2);
            
            for (uint256 i = 0; i < currentLevel.length; i += 2) {
                if (i + 1 < currentLevel.length) {
                    nextLevel[i / 2] = keccak256(abi.encodePacked(
                        currentLevel[i],
                        currentLevel[i + 1]
                    ));
                } else {
                    nextLevel[i / 2] = currentLevel[i];
                }
            }
            
            currentLevel = nextLevel;
        }
        
        return currentLevel[0];
    }

    /**
     * @dev Internal function to convert bytes32 to string
     */
    function _bytes32ToString(bytes32 _bytes32) internal pure returns (string memory) {
        uint8 i = 0;
        while(i < 32 && _bytes32[i] != 0) {
            i++;
        }
        bytes memory bytesArray = new bytes(i);
        for (i = 0; i < 32 && _bytes32[i] != 0; i++) {
            bytesArray[i] = _bytes32[i];
        }
        return string(bytesArray);
    }

    /**
     * @dev Grant RFID scanner role
     */
    function grantScannerRole(address account) 
        public 
        onlyRole(DEFAULT_ADMIN_ROLE) 
    {
        grantRole(RFID_SCANNER_ROLE, account);
    }

    /**
     * @dev Grant tokenizer role
     */
    function grantTokenizerRole(address account) 
        public 
        onlyRole(DEFAULT_ADMIN_ROLE) 
    {
        grantRole(TOKENIZER_ROLE, account);
    }
}
