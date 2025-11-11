// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

/**
 * @title ProTrackSupplyChain
 * @dev NFT-based supply chain management with RFID integration
 */
contract ProTrackSupplyChain is ERC721, ERC721URIStorage, AccessControl, ReentrancyGuard {
    using Counters for Counters.Counter;

    // Role definitions
    bytes32 public constant MANUFACTURER_ROLE = keccak256("MANUFACTURER_ROLE");
    bytes32 public constant PACKAGER_ROLE = keccak256("PACKAGER_ROLE");
    bytes32 public constant TRANSPORTER_ROLE = keccak256("TRANSPORTER_ROLE");
    bytes32 public constant WHOLESALER_ROLE = keccak256("WHOLESALER_ROLE");
    bytes32 public constant RETAILER_ROLE = keccak256("RETAILER_ROLE");
    bytes32 public constant INSPECTOR_ROLE = keccak256("INSPECTOR_ROLE");
    bytes32 public constant ORACLE_ROLE = keccak256("ORACLE_ROLE");

    // Counters
    Counters.Counter private _tokenIdCounter;
    Counters.Counter private _batchIdCounter;

    // Enums
    enum ProductStatus { 
        Manufactured, 
        Packaged, 
        InTransit, 
        Delivered, 
        Sold, 
        Recalled 
    }

    enum SensorType { 
        Temperature, 
        Humidity, 
        Vibration, 
        GPS, 
        Tamper 
    }

    // Structs
    struct Product {
        uint256 tokenId;
        string rfidHash;
        string productName;
        string batchNumber;
        uint256 manufacturingDate;
        uint256 expiryDate;
        ProductStatus status;
        address currentOwner;
        string ipfsMetadataHash;
        bool isRecalled;
        uint256 lastUpdated;
    }

    struct IoTData {
        SensorType sensorType;
        int256 value;
        uint256 timestamp;
        string gpsCoordinates;
        address oracle;
        bool verified;
    }

    struct SupplyChainEvent {
        uint256 tokenId;
        address from;
        address to;
        ProductStatus newStatus;
        uint256 timestamp;
        string location;
        string notes;
        bytes32 eventHash;
    }

    struct EncryptionKeys {
        bytes32 senderKey;
        bytes32 receiverKey;
        uint256 keyExpiry;
        bool isActive;
    }

    // Mappings
    mapping(uint256 => Product) public products;
    mapping(string => uint256) public rfidToTokenId;
    mapping(uint256 => IoTData[]) public productIoTData;
    mapping(uint256 => SupplyChainEvent[]) public productEvents;
    mapping(uint256 => EncryptionKeys) public productKeys;
    mapping(address => uint256[]) public ownerProducts;
    mapping(uint256 => mapping(address => bool)) public authorizedAccess;

    // Events
    event ProductMinted(
        uint256 indexed tokenId,
        string rfidHash,
        address indexed manufacturer,
        string batchNumber
    );

    event ProductTransferred(
        uint256 indexed tokenId,
        address indexed from,
        address indexed to,
        ProductStatus newStatus
    );

    event IoTDataAdded(
        uint256 indexed tokenId,
        SensorType sensorType,
        int256 value,
        string gpsCoordinates
    );

    event ProductRecalled(
        uint256 indexed tokenId,
        address indexed initiator,
        string reason
    );

    event EncryptionKeysGenerated(
        uint256 indexed tokenId,
        address indexed sender,
        address indexed receiver
    );

    constructor() ERC721("ProTrack Supply Chain", "PTSC") {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ORACLE_ROLE, msg.sender);
    }

    /**
     * @dev Mint a new product NFT with RFID integration
     */
    function mintProduct(
        string memory rfidHash,
        string memory productName,
        string memory batchNumber,
        uint256 expiryDate,
        string memory ipfsMetadataHash,
        address manufacturer
    ) public onlyRole(MANUFACTURER_ROLE) returns (uint256) {
        require(bytes(rfidHash).length > 0, "RFID hash cannot be empty");
        require(rfidToTokenId[rfidHash] == 0, "RFID already exists");
        require(expiryDate > block.timestamp, "Expiry date must be in future");

        uint256 tokenId = _tokenIdCounter.current();
        _tokenIdCounter.increment();

        // Create product
        Product memory newProduct = Product({
            tokenId: tokenId,
            rfidHash: rfidHash,
            productName: productName,
            batchNumber: batchNumber,
            manufacturingDate: block.timestamp,
            expiryDate: expiryDate,
            status: ProductStatus.Manufactured,
            currentOwner: manufacturer,
            ipfsMetadataHash: ipfsMetadataHash,
            isRecalled: false,
            lastUpdated: block.timestamp
        });

        products[tokenId] = newProduct;
        rfidToTokenId[rfidHash] = tokenId;
        ownerProducts[manufacturer].push(tokenId);

        // Mint NFT
        _safeMint(manufacturer, tokenId);
        _setTokenURI(tokenId, ipfsMetadataHash);

        // Log initial event
        _addSupplyChainEvent(
            tokenId,
            address(0),
            manufacturer,
            ProductStatus.Manufactured,
            "Manufacturing facility",
            "Product manufactured and tokenized"
        );

        emit ProductMinted(tokenId, rfidHash, manufacturer, batchNumber);
        return tokenId;
    }

    /**
     * @dev Transfer product with status update and encryption key generation
     */
    function transferProduct(
        uint256 tokenId,
        address to,
        ProductStatus newStatus,
        string memory location,
        string memory notes
    ) public nonReentrant {
        require(_exists(tokenId), "Product does not exist");
        require(ownerOf(tokenId) == msg.sender, "Not the owner");
        require(to != address(0), "Invalid recipient");
        require(!products[tokenId].isRecalled, "Product is recalled");

        address from = msg.sender;
        
        // Generate encryption keys for sender and receiver
        _generateEncryptionKeys(tokenId, from, to);

        // Update product
        products[tokenId].currentOwner = to;
        products[tokenId].status = newStatus;
        products[tokenId].lastUpdated = block.timestamp;

        // Update owner mappings
        _removeFromOwnerProducts(from, tokenId);
        ownerProducts[to].push(tokenId);

        // Grant access to receiver
        authorizedAccess[tokenId][to] = true;

        // Transfer NFT
        _transfer(from, to, tokenId);

        // Log event
        _addSupplyChainEvent(tokenId, from, to, newStatus, location, notes);

        emit ProductTransferred(tokenId, from, to, newStatus);
    }

    /**
     * @dev Add IoT sensor data via oracle
     */
    function addIoTData(
        uint256 tokenId,
        SensorType sensorType,
        int256 value,
        string memory gpsCoordinates
    ) public onlyRole(ORACLE_ROLE) {
        require(_exists(tokenId), "Product does not exist");

        IoTData memory newData = IoTData({
            sensorType: sensorType,
            value: value,
            timestamp: block.timestamp,
            gpsCoordinates: gpsCoordinates,
            oracle: msg.sender,
            verified: true
        });

        productIoTData[tokenId].push(newData);

        emit IoTDataAdded(tokenId, sensorType, value, gpsCoordinates);

        // Check for threshold violations
        _checkThresholds(tokenId, sensorType, value);
    }

    /**
     * @dev Recall a product
     */
    function recallProduct(
        uint256 tokenId,
        string memory reason
    ) public {
        require(_exists(tokenId), "Product does not exist");
        require(
            hasRole(INSPECTOR_ROLE, msg.sender) || 
            hasRole(MANUFACTURER_ROLE, msg.sender),
            "Not authorized to recall"
        );

        products[tokenId].isRecalled = true;
        products[tokenId].status = ProductStatus.Recalled;
        products[tokenId].lastUpdated = block.timestamp;

        _addSupplyChainEvent(
            tokenId,
            address(0),
            address(0),
            ProductStatus.Recalled,
            "System",
            reason
        );

        emit ProductRecalled(tokenId, msg.sender, reason);
    }

    /**
     * @dev Get product by RFID hash
     */
    function getProductByRFID(string memory rfidHash) 
        public 
        view 
        returns (Product memory) 
    {
        uint256 tokenId = rfidToTokenId[rfidHash];
        require(tokenId != 0, "RFID not found");
        return products[tokenId];
    }

    /**
     * @dev Get IoT data for a product
     */
    function getProductIoTData(uint256 tokenId) 
        public 
        view 
        returns (IoTData[] memory) 
    {
        return productIoTData[tokenId];
    }

    /**
     * @dev Get supply chain events for a product
     */
    function getProductEvents(uint256 tokenId) 
        public 
        view 
        returns (SupplyChainEvent[] memory) 
    {
        return productEvents[tokenId];
    }

    /**
     * @dev Check if user has access to product data
     */
    function hasProductAccess(uint256 tokenId, address user) 
        public 
        view 
        returns (bool) 
    {
        return authorizedAccess[tokenId][user] || 
               ownerOf(tokenId) == user ||
               hasRole(INSPECTOR_ROLE, user);
    }

    /**
     * @dev Internal function to generate encryption keys
     */
    function _generateEncryptionKeys(
        uint256 tokenId,
        address sender,
        address receiver
    ) internal {
        bytes32 senderKey = keccak256(abi.encodePacked(
            tokenId, 
            sender, 
            block.timestamp, 
            "SENDER"
        ));
        
        bytes32 receiverKey = keccak256(abi.encodePacked(
            tokenId, 
            receiver, 
            block.timestamp, 
            "RECEIVER"
        ));

        productKeys[tokenId] = EncryptionKeys({
            senderKey: senderKey,
            receiverKey: receiverKey,
            keyExpiry: block.timestamp + 30 days,
            isActive: true
        });

        emit EncryptionKeysGenerated(tokenId, sender, receiver);
    }

    /**
     * @dev Internal function to add supply chain event
     */
    function _addSupplyChainEvent(
        uint256 tokenId,
        address from,
        address to,
        ProductStatus newStatus,
        string memory location,
        string memory notes
    ) internal {
        bytes32 eventHash = keccak256(abi.encodePacked(
            tokenId,
            from,
            to,
            uint256(newStatus),
            block.timestamp,
            location
        ));

        SupplyChainEvent memory newEvent = SupplyChainEvent({
            tokenId: tokenId,
            from: from,
            to: to,
            newStatus: newStatus,
            timestamp: block.timestamp,
            location: location,
            notes: notes,
            eventHash: eventHash
        });

        productEvents[tokenId].push(newEvent);
    }

    /**
     * @dev Check sensor thresholds and trigger alerts
     */
    function _checkThresholds(
        uint256 tokenId,
        SensorType sensorType,
        int256 value
    ) internal {
        // Temperature threshold: -20°C to 40°C
        if (sensorType == SensorType.Temperature) {
            if (value < -20 || value > 40) {
                // Trigger temperature alert
                _addSupplyChainEvent(
                    tokenId,
                    address(0),
                    address(0),
                    products[tokenId].status,
                    "IoT Alert",
                    "Temperature threshold exceeded"
                );
            }
        }
        
        // Humidity threshold: 0% to 95%
        if (sensorType == SensorType.Humidity) {
            if (value < 0 || value > 95) {
                _addSupplyChainEvent(
                    tokenId,
                    address(0),
                    address(0),
                    products[tokenId].status,
                    "IoT Alert",
                    "Humidity threshold exceeded"
                );
            }
        }
    }

    /**
     * @dev Remove token from owner's product list
     */
    function _removeFromOwnerProducts(address owner, uint256 tokenId) internal {
        uint256[] storage ownerProductList = ownerProducts[owner];
        for (uint256 i = 0; i < ownerProductList.length; i++) {
            if (ownerProductList[i] == tokenId) {
                ownerProductList[i] = ownerProductList[ownerProductList.length - 1];
                ownerProductList.pop();
                break;
            }
        }
    }

    // Role management functions
    function grantManufacturerRole(address account) public onlyRole(DEFAULT_ADMIN_ROLE) {
        grantRole(MANUFACTURER_ROLE, account);
    }

    function grantPackagerRole(address account) public onlyRole(DEFAULT_ADMIN_ROLE) {
        grantRole(PACKAGER_ROLE, account);
    }

    function grantTransporterRole(address account) public onlyRole(DEFAULT_ADMIN_ROLE) {
        grantRole(TRANSPORTER_ROLE, account);
    }

    function grantWholesalerRole(address account) public onlyRole(DEFAULT_ADMIN_ROLE) {
        grantRole(WHOLESALER_ROLE, account);
    }

    function grantRetailerRole(address account) public onlyRole(DEFAULT_ADMIN_ROLE) {
        grantRole(RETAILER_ROLE, account);
    }

    function grantInspectorRole(address account) public onlyRole(DEFAULT_ADMIN_ROLE) {
        grantRole(INSPECTOR_ROLE, account);
    }

    function grantOracleRole(address account) public onlyRole(DEFAULT_ADMIN_ROLE) {
        grantRole(ORACLE_ROLE, account);
    }

    // Required overrides
    function _burn(uint256 tokenId) internal override(ERC721, ERC721URIStorage) {
        super._burn(tokenId);
    }

    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721URIStorage, AccessControl)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
