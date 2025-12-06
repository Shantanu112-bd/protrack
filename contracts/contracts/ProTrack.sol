// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title ProTrack
 * @dev Unified smart contract for Web3 supply chain tracking with RFID, IoT, and MPC integration
 */
contract ProTrack is ERC721URIStorage, AccessControl, ReentrancyGuard {
    // Role definitions
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant MANUFACTURER_ROLE = keccak256("MANUFACTURER_ROLE");
    bytes32 public constant PACKAGER_ROLE = keccak256("PACKAGER_ROLE");
    bytes32 public constant TRANSPORTER_ROLE = keccak256("TRANSPORTER_ROLE");
    bytes32 public constant WHOLESALER_ROLE = keccak256("WHOLESALER_ROLE");
    bytes32 public constant RETAILER_ROLE = keccak256("RETAILER_ROLE");
    bytes32 public constant CUSTOMER_ROLE = keccak256("CUSTOMER_ROLE");
    bytes32 public constant ORACLE_ROLE = keccak256("ORACLE_ROLE");
    bytes32 public constant INSPECTOR_ROLE = keccak256("INSPECTOR_ROLE");

    // Product status enum
    enum ProductStatus { 
        MANUFACTURED, 
        PACKAGED, 
        IN_TRANSIT, 
        RECEIVED, 
        SOLD,
        RECALLED
    }

    // Shipment status enum
    enum ShipmentStatus { 
        REQUESTED, 
        APPROVED, 
        IN_TRANSIT, 
        DELIVERED, 
        CONFIRMED 
    }

    // IoT sensor types
    enum SensorType { 
        TEMPERATURE, 
        HUMIDITY, 
        VIBRATION, 
        GPS, 
        TAMPER,
        LIGHT,
        BATTERY,
        SIGNAL
    }

    // Product structure
    struct Product {
        string rfidHash;
        string barcode;
        string productName;
        string batchId;
        uint256 manufactureDate;
        uint256 expiryDate;
        string ipfsMetadataCID;
        ProductStatus status;
        address manufacturer;
        address currentCustodian;
        string currentLocation;
        uint256 lastUpdated;
        bool isSoulbound;
        bool isRecalled;
    }

    // Shipment structure
    struct Shipment {
        uint256 productId;
        address fromParty;
        address toParty;
        ShipmentStatus status;
        string tempKeyId;
        string trackingInfo;
        uint256 requestedAt;
        uint256 approvedAt;
        uint256 shippedAt;
        uint256 deliveredAt;
        uint256 confirmedAt;
    }

    // IoT data structure
    struct IoTData {
        uint256 productId;
        SensorType sensorType;
        int256 value;
        string unit;
        string gpsCoordinates;
        address provider;
        uint256 timestamp;
        bool verified;
        string ipfsCID;
    }

    // Encryption keys structure
    struct EncryptionKeys {
        bytes32 senderKey;
        bytes32 receiverKey;
        uint256 createdAt;
        uint256 expiresAt;
    }

    // Events
    event ProductMinted(
        uint256 indexed tokenId,
        string rfidHash,
        string barcode,
        address indexed manufacturer,
        string productName
    );
    
    event ProductStatusUpdated(
        uint256 indexed tokenId,
        ProductStatus status,
        address updatedBy
    );
    
    event CustodyTransferred(
        uint256 indexed tokenId,
        address indexed from,
        address indexed to,
        string location
    );
    
    event ShipmentRequested(
        uint256 indexed shipmentId,
        uint256 indexed productId,
        address indexed from,
        address to
    );
    
    event ShipmentApproved(
        uint256 indexed shipmentId,
        string tempKeyId
    );
    
    event ShipmentDelivered(
        uint256 indexed shipmentId,
        uint256 deliveredAt
    );
    
    event ShipmentConfirmed(
        uint256 indexed shipmentId,
        uint256 confirmedAt
    );
    
    event IoTDataRecorded(
        uint256 indexed tokenId,
        SensorType sensorType,
        int256 value,
        uint256 timestamp
    );
    
    event ProductPackaged(
        uint256 indexed tokenId,
        string batchId
    );
    
    event ProductRecalled(
        uint256 indexed tokenId,
        address indexed initiator,
        string reason
    );

    // State variables
    mapping(uint256 => Product) public products;
    mapping(uint256 => Shipment) public shipments;
    mapping(uint256 => IoTData[]) public productIoTData;
    mapping(string => uint256) public rfidToTokenId;
    mapping(string => uint256) public barcodeToTokenId;
    mapping(uint256 => uint256[]) public productShipments;
    mapping(uint256 => EncryptionKeys) public productKeys;
    mapping(uint256 => mapping(address => bool)) public authorizedViewers;
    
    uint256 private _tokenCounter;
    uint256 private _shipmentCounter;

    constructor() ERC721("ProTrack Supply Chain", "PTSC") {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ADMIN_ROLE, msg.sender);
        _tokenCounter = 1;
        _shipmentCounter = 1;
    }

    /**
     * @dev Mint a new product token with full metadata
     * @param rfidHash RFID hash of the product
     * @param barcode Barcode of the product
     * @param productName Name of the product
     * @param batchId Batch identifier
     * @param expiryDate Expiry date as timestamp
     * @param ipfsMetadataCID IPFS CID for product metadata
     * @param owner Initial owner of the token
     */
    function mintProduct(
        string memory rfidHash,
        string memory barcode,
        string memory productName,
        string memory batchId,
        uint256 expiryDate,
        string memory ipfsMetadataCID,
        address owner
    ) public onlyRole(MANUFACTURER_ROLE) returns (uint256) {
        require(bytes(rfidHash).length > 0, "RFID hash cannot be empty");
        require(bytes(barcode).length > 0, "Barcode cannot be empty");
        require(bytes(productName).length > 0, "Product name cannot be empty");
        require(rfidToTokenId[rfidHash] == 0, "Product with this RFID already exists");
        require(barcodeToTokenId[barcode] == 0, "Product with this barcode already exists");
        
        uint256 tokenId = _tokenCounter;
        _tokenCounter++;
        
        _mint(owner, tokenId);
        _setTokenURI(tokenId, ipfsMetadataCID);
        
        products[tokenId] = Product({
            rfidHash: rfidHash,
            barcode: barcode,
            productName: productName,
            batchId: batchId,
            manufactureDate: block.timestamp,
            expiryDate: expiryDate,
            ipfsMetadataCID: ipfsMetadataCID,
            status: ProductStatus.MANUFACTURED,
            manufacturer: msg.sender,
            currentCustodian: owner,
            currentLocation: "Manufacturing Facility",
            lastUpdated: block.timestamp,
            isSoulbound: false,
            isRecalled: false
        });
        
        rfidToTokenId[rfidHash] = tokenId;
        barcodeToTokenId[barcode] = tokenId;
        
        // Grant initial access to owner
        authorizedViewers[tokenId][owner] = true;
        
        // Generate initial encryption keys
        bytes32 senderKey = keccak256(abi.encodePacked(tokenId, msg.sender, block.timestamp, "SENDER"));
        bytes32 receiverKey = keccak256(abi.encodePacked(tokenId, owner, block.timestamp, "RECEIVER"));
        
        productKeys[tokenId] = EncryptionKeys({
            senderKey: senderKey,
            receiverKey: receiverKey,
            createdAt: block.timestamp,
            expiresAt: block.timestamp + 30 days
        });
        
        emit ProductMinted(tokenId, rfidHash, barcode, msg.sender, productName);
        emit ProductStatusUpdated(tokenId, ProductStatus.MANUFACTURED, msg.sender);
        
        return tokenId;
    }

    /**
     * @dev Log packaging event for a product
     * @param tokenId Token ID of the product
     * @param batchId Batch identifier
     */
    function logPackaging(
        uint256 tokenId,
        string memory batchId
    ) public onlyRole(PACKAGER_ROLE) {
        require(_ownerOf(tokenId) != address(0), "Product does not exist");
        require(
            products[tokenId].status == ProductStatus.MANUFACTURED,
            "Product must be manufactured before packaging"
        );
        
        products[tokenId].batchId = batchId;
        products[tokenId].status = ProductStatus.PACKAGED;
        products[tokenId].lastUpdated = block.timestamp;
        
        emit ProductPackaged(tokenId, batchId);
        emit ProductStatusUpdated(tokenId, ProductStatus.PACKAGED, msg.sender);
    }

    /**
     * @dev Request shipment of a product
     * @param tokenId Token ID of the product
     * @param to Destination party
     * @param tempKeyId Temporary key ID for MPC
     * @param trackingInfo Shipment tracking information
     */
    function requestShipment(
        uint256 tokenId,
        address to,
        string memory tempKeyId,
        string memory trackingInfo
    ) public onlyRole(TRANSPORTER_ROLE) returns (uint256) {
        require(_ownerOf(tokenId) != address(0), "Product does not exist");
        require(
            products[tokenId].status == ProductStatus.PACKAGED ||
            products[tokenId].status == ProductStatus.RECEIVED,
            "Product must be packaged or received to be shipped"
        );
        require(to != address(0), "Invalid destination address");
        
        uint256 shipmentId = _shipmentCounter;
        _shipmentCounter++;
        
        shipments[shipmentId] = Shipment({
            productId: tokenId,
            fromParty: products[tokenId].currentCustodian,
            toParty: to,
            status: ShipmentStatus.REQUESTED,
            tempKeyId: tempKeyId,
            trackingInfo: trackingInfo,
            requestedAt: block.timestamp,
            approvedAt: 0,
            shippedAt: 0,
            deliveredAt: 0,
            confirmedAt: 0
        });
        
        productShipments[tokenId].push(shipmentId);
        
        // Rotate encryption keys
        bytes32 newSenderKey = keccak256(abi.encodePacked(
            tokenId,
            products[tokenId].currentCustodian,
            block.timestamp,
            "SENDER_SHIPMENT",
            shipmentId
        ));
        
        bytes32 newReceiverKey = keccak256(abi.encodePacked(
            tokenId,
            to,
            block.timestamp,
            "RECEIVER_SHIPMENT",
            shipmentId
        ));
        
        productKeys[tokenId].senderKey = newSenderKey;
        productKeys[tokenId].receiverKey = newReceiverKey;
        productKeys[tokenId].createdAt = block.timestamp;
        productKeys[tokenId].expiresAt = block.timestamp + 30 days;
        
        emit ShipmentRequested(shipmentId, tokenId, products[tokenId].currentCustodian, to);
        
        return shipmentId;
    }

    /**
     * @dev Approve a shipment (requires admin approval)
     * @param shipmentId ID of the shipment
     */
    function approveShipment(
        uint256 shipmentId
    ) public onlyRole(ADMIN_ROLE) {
        require(shipments[shipmentId].status == ShipmentStatus.REQUESTED, "Shipment not in requested state");
        
        shipments[shipmentId].status = ShipmentStatus.APPROVED;
        shipments[shipmentId].approvedAt = block.timestamp;
        
        emit ShipmentApproved(shipmentId, shipments[shipmentId].tempKeyId);
    }

    /**
     * @dev Mark shipment as in transit
     * @param shipmentId ID of the shipment
     */
    function shipProduct(
        uint256 shipmentId
    ) public onlyRole(TRANSPORTER_ROLE) {
        require(shipments[shipmentId].status == ShipmentStatus.APPROVED, "Shipment not approved");
        
        uint256 tokenId = shipments[shipmentId].productId;
        products[tokenId].status = ProductStatus.IN_TRANSIT;
        products[tokenId].lastUpdated = block.timestamp;
        
        shipments[shipmentId].status = ShipmentStatus.IN_TRANSIT;
        shipments[shipmentId].shippedAt = block.timestamp;
        
        emit ProductStatusUpdated(tokenId, ProductStatus.IN_TRANSIT, msg.sender);
    }

    /**
     * @dev Confirm receipt of a shipment
     * @param shipmentId ID of the shipment
     * @param location New location
     */
    function confirmReceipt(
        uint256 shipmentId,
        string memory location
    ) public {
        require(
            msg.sender == shipments[shipmentId].toParty || hasRole(ADMIN_ROLE, msg.sender),
            "Only destination party or admin can confirm receipt"
        );
        require(shipments[shipmentId].status == ShipmentStatus.IN_TRANSIT, "Shipment not in transit");
        
        uint256 tokenId = shipments[shipmentId].productId;
        address previousCustodian = products[tokenId].currentCustodian;
        
        products[tokenId].currentCustodian = msg.sender;
        products[tokenId].currentLocation = location;
        products[tokenId].status = ProductStatus.RECEIVED;
        products[tokenId].lastUpdated = block.timestamp;
        
        // Grant access to new custodian
        authorizedViewers[tokenId][msg.sender] = true;
        
        shipments[shipmentId].status = ShipmentStatus.DELIVERED;
        shipments[shipmentId].deliveredAt = block.timestamp;
        
        // Transfer the NFT to the new custodian
        _transfer(previousCustodian, msg.sender, tokenId);
        
        emit CustodyTransferred(tokenId, previousCustodian, msg.sender, location);
        emit ProductStatusUpdated(tokenId, ProductStatus.RECEIVED, msg.sender);
        emit ShipmentDelivered(shipmentId, block.timestamp);
    }

    /**
     * @dev Confirm shipment completion
     * @param shipmentId ID of the shipment
     */
    function confirmShipmentCompletion(
        uint256 shipmentId
    ) public onlyRole(ADMIN_ROLE) {
        require(shipments[shipmentId].status == ShipmentStatus.DELIVERED, "Shipment not delivered");
        
        shipments[shipmentId].status = ShipmentStatus.CONFIRMED;
        shipments[shipmentId].confirmedAt = block.timestamp;
        
        emit ShipmentConfirmed(shipmentId, block.timestamp);
    }

    /**
     * @dev Record IoT data for a product
     * @param tokenId Token ID of the product
     * @param sensorType Type of sensor
     * @param value Sensor value
     * @param unit Measurement unit
     * @param gpsCoordinates GPS coordinates
     * @param ipfsCID IPFS CID of detailed data
     */
    function recordIoT(
        uint256 tokenId,
        SensorType sensorType,
        int256 value,
        string memory unit,
        string memory gpsCoordinates,
        string memory ipfsCID
    ) public onlyRole(ORACLE_ROLE) {
        require(_ownerOf(tokenId) != address(0), "Product does not exist");
        
        IoTData memory data = IoTData({
            productId: tokenId,
            sensorType: sensorType,
            value: value,
            unit: unit,
            gpsCoordinates: gpsCoordinates,
            provider: msg.sender,
            timestamp: block.timestamp,
            verified: true,
            ipfsCID: ipfsCID
        });
        
        productIoTData[tokenId].push(data);
        
        emit IoTDataRecorded(tokenId, sensorType, value, block.timestamp);
        
        // Check thresholds and alert if needed
        _checkSensorThresholds(tokenId, sensorType, value);
    }

    /**
     * @dev Transfer custody of a product (for direct transfers)
     * @param tokenId Token ID of the product
     * @param to New custodian
     * @param location New location
     */
    function transferCustody(
        uint256 tokenId,
        address to,
        string memory location
    ) public {
        require(_ownerOf(tokenId) != address(0), "Product does not exist");
        require(ownerOf(tokenId) == msg.sender, "Not the owner of the product");
        require(to != address(0), "Invalid destination address");
        require(!products[tokenId].isSoulbound, "Token is soulbound and cannot be transferred");
        
        address previousCustodian = products[tokenId].currentCustodian;
        products[tokenId].currentCustodian = to;
        products[tokenId].currentLocation = location;
        products[tokenId].lastUpdated = block.timestamp;
        
        // Grant access to new custodian
        authorizedViewers[tokenId][to] = true;
        
        // Transfer the NFT
        _transfer(msg.sender, to, tokenId);
        
        emit CustodyTransferred(tokenId, previousCustodian, to, location);
    }

    /**
     * @dev Update product location
     * @param tokenId Token ID of the product
     * @param location New location
     */
    function updateLocation(
        uint256 tokenId,
        string memory location
    ) public {
        require(_ownerOf(tokenId) != address(0), "Product does not exist");
        require(
            ownerOf(tokenId) == msg.sender || 
            products[tokenId].currentCustodian == msg.sender ||
            hasRole(ADMIN_ROLE, msg.sender),
            "Not authorized to update location"
        );
        
        products[tokenId].currentLocation = location;
        products[tokenId].lastUpdated = block.timestamp;
    }

    /**
     * @dev Recall a product (requires admin)
     * @param tokenId Token ID of the product
     * @param reason Reason for recall
     */
    function recallProduct(
        uint256 tokenId,
        string memory reason
    ) public onlyRole(ADMIN_ROLE) {
        require(_ownerOf(tokenId) != address(0), "Product does not exist");
        require(!products[tokenId].isRecalled, "Product already recalled");
        
        products[tokenId].isRecalled = true;
        products[tokenId].status = ProductStatus.RECALLED;
        products[tokenId].lastUpdated = block.timestamp;
        
        emit ProductRecalled(tokenId, msg.sender, reason);
        emit ProductStatusUpdated(tokenId, ProductStatus.RECALLED, msg.sender);
    }

    /**
     * @dev Make token soulbound (non-transferable)
     * @param tokenId Token ID of the product
     */
    function makeSoulbound(
        uint256 tokenId
    ) public onlyRole(ADMIN_ROLE) {
        require(_ownerOf(tokenId) != address(0), "Product does not exist");
        require(!products[tokenId].isSoulbound, "Token already soulbound");
        
        products[tokenId].isSoulbound = true;
    }

    /**
     * @dev Get product information
     * @param tokenId Token ID of the product
     */
    function getProduct(uint256 tokenId)
        public
        view
        returns (Product memory)
    {
        require(_ownerOf(tokenId) != address(0), "Product does not exist");
        return products[tokenId];
    }

    /**
     * @dev Get shipment information
     * @param shipmentId ID of the shipment
     */
    function getShipment(uint256 shipmentId)
        public
        view
        returns (Shipment memory)
    {
        return shipments[shipmentId];
    }

    /**
     * @dev Get IoT data for a product
     * @param tokenId Token ID of the product
     */
    function getIoTData(uint256 tokenId)
        public
        view
        returns (IoTData[] memory)
    {
        return productIoTData[tokenId];
    }

    /**
     * @dev Get shipment IDs for a product
     * @param tokenId Token ID of the product
     */
    function getProductShipments(uint256 tokenId)
        public
        view
        returns (uint256[] memory)
    {
        return productShipments[tokenId];
    }

    /**
     * @dev Check if user has access to product data
     * @param tokenId Token ID of the product
     * @param user User address
     */
    function hasProductAccess(uint256 tokenId, address user)
        public
        view
        returns (bool)
    {
        return authorizedViewers[tokenId][user] || 
               ownerOf(tokenId) == user ||
               hasRole(ADMIN_ROLE, user) ||
               hasRole(INSPECTOR_ROLE, user);
    }

    /**
     * @dev Check if product is recalled
     * @param tokenId Token ID of the product
     */
    function isProductRecalled(uint256 tokenId)
        public
        view
        returns (bool)
    {
        if (_ownerOf(tokenId) == address(0)) return false;
        return products[tokenId].isRecalled;
    }

    /**
     * @dev Internal function to check sensor thresholds
     */
    function _checkSensorThresholds(
        uint256 tokenId,
        SensorType sensorType,
        int256 value
    ) internal {
        bool alert = false;
        
        // Temperature thresholds (-20°C to 40°C)
        if (sensorType == SensorType.TEMPERATURE) {
            if (value < -20 || value > 40) {
                alert = true;
            }
        }
        // Humidity thresholds (0% to 95%)
        else if (sensorType == SensorType.HUMIDITY) {
            if (value < 0 || value > 95) {
                alert = true;
            }
        }
        // Vibration thresholds (0 to 100)
        else if (sensorType == SensorType.VIBRATION) {
            if (value < 0 || value > 100) {
                alert = true;
            }
        }
        
        if (alert) {
            // Emit an event for the alert
            emit ProductStatusUpdated(tokenId, products[tokenId].status, address(this));
        }
    }

    /**
     * @dev Override transfer function to respect soulbound status
     */
    function _update(address to, uint256 tokenId, address auth) internal virtual override returns (address) {
        address from = _ownerOf(tokenId);
        
        // If token is soulbound, prevent transfers except for minting
        if (products[tokenId].isSoulbound && from != address(0)) {
            revert("Token is soulbound and cannot be transferred");
        }
        
        return super._update(to, tokenId, auth);
    }

    /**
     * @dev Check if contract supports interface
     */
    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721URIStorage, AccessControl)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}