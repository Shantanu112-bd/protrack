// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

/**
 * @title UnifiedProTrack
 * @dev Comprehensive smart contract for Web3 supply chain tracking with all components integrated
 * @notice Refactored version with security fixes and optimizations
 */
contract UnifiedProTrack is ERC721URIStorage, AccessControl, ReentrancyGuard {
    using Strings for uint256;

    // Custom errors (gas efficient)
    error ProductNotFound();
    error ProductAlreadyExists();
    error InvalidInput();
    error Unauthorized();
    error InvalidStatus();
    error TokenIsSoulbound();
    error ProductAlreadyRecalled();
    error ShipmentNotFound();
    error StringTooLong();
    error InvalidTimestamp();
    
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
    bytes32 public constant QUALITY_CONTROL_ROLE = keccak256("QUALITY_CONTROL_ROLE");
    bytes32 public constant COMPLIANCE_ROLE = keccak256("COMPLIANCE_ROLE");

    // Constants
    uint256 private constant MAX_STRING_LENGTH = 256;
    uint256 private constant SHIPMENT_TIMEOUT = 30 days;

    // Product status enum
    enum ProductStatus { 
        MANUFACTURED, 
        PACKAGED, 
        IN_TRANSIT, 
        RECEIVED, 
        SOLD,
        RECALLED,
        QUALITY_CHECKED,
        COMPLIANCE_APPROVED
    }

    // Shipment status enum
    enum ShipmentStatus { 
        REQUESTED, 
        APPROVED, 
        IN_TRANSIT, 
        DELIVERED, 
        CONFIRMED,
        CANCELLED
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
        SIGNAL,
        PRESSURE,
        SHOCK,
        TILT,
        FREE_FALL,
        SEAL_BREAK,
        MAGNETIC_TAMPER,
        GAS_DETECTION,
        PH_LEVEL,
        MOISTURE,
        CO2,
        OXYGEN,
        GNSS,
        CELL_TRIANGULATION
    }

    // Quality control status
    enum QualityStatus {
        PENDING,
        PASSED,
        FAILED,
        REWORK_REQUIRED
    }

    // Compliance status
    enum ComplianceStatus {
        PENDING,
        APPROVED,
        REJECTED,
        UNDER_REVIEW
    }

    // Struct for minting product parameters
    struct MintProductParams {
        string rfidHash;
        string barcode;
        string productName;
        string sku;
        address manufacturerId;
        uint128 manufactureDate;
        uint128 expiryDate;
        string batchId;
        string ipfsMetadataCID;
        address owner;
    }
    
    // Struct for enhanced minting product parameters
    struct MintProductEnhancedParams {
        string rfidHash;
        string barcode;
        string productName;
        string sku;
        address manufacturerId;
        uint128 manufactureDate;
        uint128 expiryDate;
        string batchId;
        string ipfsMetadataCID;
        address owner;
        uint256 price;
        string currency;
        uint256 weight;
    }
    
    // Product structure (optimized packing)
    struct Product {
        string rfidHash;
        string barcode;
        string productName;
        string sku;
        address manufacturerId;
        uint128 manufactureDate;
        uint128 expiryDate;
        string batchId;
        string ipfsMetadataCID;
        ProductStatus status;
        address manufacturer;
        address currentCustodian;
        string currentLocation;
        uint128 lastUpdated;
        bool isSoulbound;
        bool isRecalled;
        QualityStatus qualityStatus;
        ComplianceStatus complianceStatus;
        bytes32 productHash;
        uint256 price;
        string currency;
        uint256 weight;
    }

    // Struct for shipment request parameters
    struct ShipmentRequestParams {
        uint256 tokenId;
        address to;
        address carrierId;
        string origin;
        string destination;
        uint128 expectedETD;
        uint128 expectedETA;
        string tempKeyId;
        string trackingInfo;
    }
    
    // Struct for enhanced shipment request parameters
    struct ShipmentRequestEnhancedParams {
        uint256 tokenId;
        address to;
        address carrierId;
        string origin;
        string destination;
        uint128 expectedETD;
        uint128 expectedETA;
        string tempKeyId;
        string trackingInfo;
        uint256 estimatedDistance;
        uint256 co2Emissions;
        uint256 estimatedCost;
        string currency;
    }
    
    // Shipment structure
    struct Shipment {
        uint256 shipmentId;
        uint256 productId;
        address fromParty;
        address toParty;
        address carrierId;
        string origin;
        string destination;
        uint128 expectedETD;
        uint128 expectedETA;
        ShipmentStatus status;
        string tempKeyId;
        string trackingInfo;
        uint128 requestedAt;
        uint128 approvedAt;
        uint128 shippedAt;
        uint128 deliveredAt;
        uint128 confirmedAt;
        string[] packingList;
        string insurancePolicy;
        string slaAgreement;
        // Additional fields for enhanced functionality
        uint256 estimatedDistance; // Distance in miles
        uint256 co2Emissions; // CO2 emissions in kg
        uint256 estimatedCost; // Estimated cost in wei or token units
        uint256 actualCost; // Actual cost in wei or token units
        string currency; // Currency identifier
        string priority; // Priority level: "low", "medium", "high"
        
        // Additional fields for enhanced shipment tracking
        string driverName;
        string driverLicense;
        string driverContact;
        string vehicleType;
        string vehiclePlateNumber;
        string vehicleCapacity;
    }

    // IoT data structure
    struct IoTData {
        uint256 productId;
        SensorType sensorType;
        int256 value;
        string unit;
        string gpsCoordinates;
        address provider;
        uint128 timestamp;
        bool verified;
        string ipfsCID;
    }

    // Quality control record
    struct QualityRecord {
        uint256 productId;
        address inspector;
        QualityStatus status;
        string reportCID;
        string notes;
        uint128 timestamp;
    }

    // Compliance record
    struct ComplianceRecord {
        uint256 productId;
        address reviewer;
        ComplianceStatus status;
        string certificateCID;
        string notes;
        uint128 timestamp;
        uint128 expiryDate;
    }

    // Analytics data structure (single state variable instead of array)
    struct AnalyticsData {
        uint256 productsCreated;
        uint256 productsShipped;
        uint256 productsDelivered;
        uint256 qualityChecksPassed;
        uint256 qualityChecksFailed;
        uint256 complianceApproved;
        uint256 complianceRejected;
        // Additional analytics for enhanced functionality
        uint256 totalShipments;
        uint256 delayedShipments;
        uint256 onTimeShipments;
        uint256 totalCO2Emissions; // Total CO2 emissions in kg
        uint256 totalCosts; // Total costs in wei or token units
    }

    // Sensor threshold structure
    struct SensorThreshold {
        int256 minValue;
        int256 maxValue;
        bool isSet;
    }

    // Optimization suggestion structure
    struct OptimizationSuggestion {
        uint256 id;
        string description;
        string impact;
        uint128 timestamp;
        bool implemented;
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

    event ShipmentCancelled(
        uint256 indexed shipmentId,
        address cancelledBy,
        string reason
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
    
    event QualityChecked(
        uint256 indexed productId,
        QualityStatus status,
        address inspector
    );
    
    event ComplianceReviewed(
        uint256 indexed productId,
        ComplianceStatus status,
        address reviewer
    );
    
    event OptimizationSuggested(
        uint256 indexed suggestionId,
        string description
    );

    event OptimizationImplemented(
        uint256 indexed suggestionId,
        address implementedBy
    );

    event TokenMadeSoulbound(
        uint256 indexed tokenId,
        address by
    );

    event LocationUpdated(
        uint256 indexed tokenId,
        string newLocation,
        address updatedBy
    );

    event SensorThresholdUpdated(
        uint256 indexed tokenId,
        SensorType sensorType,
        int256 minValue,
        int256 maxValue
    );

    event SensorThresholdAlert(
        uint256 indexed tokenId,
        SensorType sensorType,
        int256 value,
        int256 minThreshold,
        int256 maxThreshold
    );

    event AccessGranted(
        uint256 indexed tokenId,
        address indexed user
    );

    event AccessRevoked(
        uint256 indexed tokenId,
        address indexed user
    );

    // State variables
    mapping(uint256 => Product) public products;
    mapping(uint256 => Shipment) public shipments;
    mapping(uint256 => IoTData[]) private productIoTData;
    mapping(string => uint256) public rfidToTokenId;
    mapping(string => uint256) public barcodeToTokenId;
    mapping(uint256 => uint256[]) public productShipments;
    mapping(uint256 => QualityRecord[]) private productQualityRecords;
    mapping(uint256 => ComplianceRecord[]) private productComplianceRecords;
    mapping(uint256 => mapping(address => bool)) public authorizedViewers;
    mapping(uint256 => OptimizationSuggestion) public optimizationSuggestions;
    mapping(uint256 => mapping(SensorType => SensorThreshold)) public sensorThresholds;
    
    uint256 private _tokenCounter;
    uint256 private _shipmentCounter;
    uint256 private _optimizationCounter;
    AnalyticsData public currentAnalytics;

    constructor() ERC721("ProTrack Supply Chain", "PTSC") {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ADMIN_ROLE, msg.sender);
        _tokenCounter = 1;
        _shipmentCounter = 1;
        _optimizationCounter = 1;
    }

    // Modifiers
    modifier validString(string memory str) {
        if (bytes(str).length == 0 || bytes(str).length > MAX_STRING_LENGTH) {
            revert StringTooLong();
        }
        _;
    }

    modifier productExists(uint256 tokenId) {
        if (_ownerOf(tokenId) == address(0)) {
            revert ProductNotFound();
        }
        _;
    }

    modifier shipmentExists(uint256 shipmentId) {
        if (shipments[shipmentId].shipmentId == 0) {
            revert ShipmentNotFound();
        }
        _;
    }

    /**
     * @dev Mint a new product token with full metadata
     */
    function mintProduct(
        MintProductParams memory params
    ) public onlyRole(MANUFACTURER_ROLE) nonReentrant 
      validString(params.rfidHash) validString(params.barcode) validString(params.productName) 
      returns (uint256) {
        if (bytes(params.sku).length == 0) revert InvalidInput();
        if (params.manufacturerId == address(0) || params.owner == address(0)) revert InvalidInput();
        if (params.expiryDate <= params.manufactureDate) revert InvalidTimestamp();
        if (rfidToTokenId[params.rfidHash] != 0) revert ProductAlreadyExists();
        if (barcodeToTokenId[params.barcode] != 0) revert ProductAlreadyExists();
        
        uint256 tokenId = _tokenCounter;
        _tokenCounter++;
        
        _mint(params.owner, tokenId);
        _setTokenURI(tokenId, params.ipfsMetadataCID);
        
        // Generate productHash
        bytes32 productHashBytes = keccak256(abi.encodePacked(
            params.manufacturerId, 
            tokenId, 
            block.timestamp, 
            params.batchId
        ));
        
        // Create new product using individual assignments to avoid stack too deep error
        Product storage newProduct = products[tokenId];
        newProduct.rfidHash = params.rfidHash;
        newProduct.barcode = params.barcode;
        newProduct.productName = params.productName;
        newProduct.sku = params.sku;
        newProduct.manufacturerId = params.manufacturerId;
        newProduct.manufactureDate = params.manufactureDate;
        newProduct.expiryDate = params.expiryDate;
        newProduct.batchId = params.batchId;
        newProduct.ipfsMetadataCID = params.ipfsMetadataCID;
        newProduct.status = ProductStatus.MANUFACTURED;
        newProduct.manufacturer = msg.sender;
        newProduct.currentCustodian = params.owner;
        newProduct.currentLocation = "Manufacturing Facility";
        newProduct.lastUpdated = uint128(block.timestamp);
        newProduct.isSoulbound = false;
        newProduct.isRecalled = false;
        newProduct.qualityStatus = QualityStatus.PENDING;
        newProduct.complianceStatus = ComplianceStatus.PENDING;
        newProduct.productHash = productHashBytes;
        newProduct.price = 0;
        newProduct.currency = "USD";
        newProduct.weight = 0;
        
        rfidToTokenId[params.rfidHash] = tokenId;
        barcodeToTokenId[params.barcode] = tokenId;
        
        // Grant initial access to owner
        authorizedViewers[tokenId][params.owner] = true;
        emit AccessGranted(tokenId, params.owner);
        
        // Update analytics
        currentAnalytics.productsCreated++;
        
        emit ProductMinted(tokenId, params.rfidHash, params.barcode, msg.sender, params.productName);
        emit ProductStatusUpdated(tokenId, ProductStatus.MANUFACTURED, msg.sender);
        
        return tokenId;
    }

    /**
     * @dev Mint a new product token with enhanced metadata for frontend components
     */
    function mintProductEnhanced(
        MintProductEnhancedParams memory params
    ) public onlyRole(MANUFACTURER_ROLE) nonReentrant 
      validString(params.rfidHash) validString(params.barcode) validString(params.productName) 
      returns (uint256) {
        if (bytes(params.sku).length == 0) revert InvalidInput();
        if (params.manufacturerId == address(0) || params.owner == address(0)) revert InvalidInput();
        if (params.expiryDate <= params.manufactureDate) revert InvalidTimestamp();
        if (rfidToTokenId[params.rfidHash] != 0) revert ProductAlreadyExists();
        if (barcodeToTokenId[params.barcode] != 0) revert ProductAlreadyExists();
        
        uint256 tokenId = _tokenCounter;
        _tokenCounter++;
        
        _mint(params.owner, tokenId);
        _setTokenURI(tokenId, params.ipfsMetadataCID);
        
        // Generate productHash
        bytes32 productHashBytes = keccak256(abi.encodePacked(
            params.manufacturerId, 
            tokenId, 
            block.timestamp, 
            params.batchId
        ));
        
        // Create new product using individual assignments to avoid stack too deep error
        Product storage newProduct = products[tokenId];
        newProduct.rfidHash = params.rfidHash;
        newProduct.barcode = params.barcode;
        newProduct.productName = params.productName;
        newProduct.sku = params.sku;
        newProduct.manufacturerId = params.manufacturerId;
        newProduct.manufactureDate = params.manufactureDate;
        newProduct.expiryDate = params.expiryDate;
        newProduct.batchId = params.batchId;
        newProduct.ipfsMetadataCID = params.ipfsMetadataCID;
        newProduct.status = ProductStatus.MANUFACTURED;
        newProduct.manufacturer = msg.sender;
        newProduct.currentCustodian = params.owner;
        newProduct.currentLocation = "Manufacturing Facility";
        newProduct.lastUpdated = uint128(block.timestamp);
        newProduct.isSoulbound = false;
        newProduct.isRecalled = false;
        newProduct.qualityStatus = QualityStatus.PENDING;
        newProduct.complianceStatus = ComplianceStatus.PENDING;
        newProduct.productHash = productHashBytes;
        newProduct.price = params.price;
        newProduct.currency = params.currency;
        newProduct.weight = params.weight;
        
        rfidToTokenId[params.rfidHash] = tokenId;
        barcodeToTokenId[params.barcode] = tokenId;
        
        // Grant initial access to owner
        authorizedViewers[tokenId][params.owner] = true;
        emit AccessGranted(tokenId, params.owner);
        
        // Update analytics
        currentAnalytics.productsCreated++;
        
        emit ProductMinted(tokenId, params.rfidHash, params.barcode, msg.sender, params.productName);
        emit ProductStatusUpdated(tokenId, ProductStatus.MANUFACTURED, msg.sender);
        
        return tokenId;
    }

    /**
     * @dev Log packaging event for a product
     */
    function logPackaging(
        uint256 tokenId,
        string memory batchId
    ) public onlyRole(PACKAGER_ROLE) nonReentrant productExists(tokenId) validString(batchId) {
        
        if (products[tokenId].status != ProductStatus.MANUFACTURED) {
            revert InvalidStatus();
        }
        
        products[tokenId].batchId = batchId;
        products[tokenId].status = ProductStatus.PACKAGED;
        products[tokenId].lastUpdated = uint128(block.timestamp);
        
        emit ProductPackaged(tokenId, batchId);
        emit ProductStatusUpdated(tokenId, ProductStatus.PACKAGED, msg.sender);
    }

    /**
     * @dev Request shipment of a product
     */
    function requestShipment(
        ShipmentRequestParams memory params
    ) public onlyRole(TRANSPORTER_ROLE) nonReentrant productExists(params.tokenId) returns (uint256) {
        if (params.to == address(0)) revert InvalidInput();
        if (params.expectedETA <= params.expectedETD) revert InvalidTimestamp();
        
        ProductStatus status = products[params.tokenId].status;
        if (status != ProductStatus.PACKAGED && status != ProductStatus.RECEIVED) {
            revert InvalidStatus();
        }
        
        uint256 shipmentId = _shipmentCounter;
        _shipmentCounter++;
        
        // Create new shipment using individual assignments to avoid stack too deep error
        Shipment storage newShipment = shipments[shipmentId];
        newShipment.shipmentId = shipmentId;
        newShipment.productId = params.tokenId;
        newShipment.fromParty = products[params.tokenId].currentCustodian;
        newShipment.toParty = params.to;
        newShipment.carrierId = params.carrierId;
        newShipment.origin = params.origin;
        newShipment.destination = params.destination;
        newShipment.expectedETD = params.expectedETD;
        newShipment.expectedETA = params.expectedETA;
        newShipment.status = ShipmentStatus.REQUESTED;
        newShipment.tempKeyId = params.tempKeyId;
        newShipment.trackingInfo = params.trackingInfo;
        newShipment.requestedAt = uint128(block.timestamp);
        newShipment.approvedAt = 0;
        newShipment.shippedAt = 0;
        newShipment.deliveredAt = 0;
        newShipment.confirmedAt = 0;
        newShipment.packingList = new string[](0);
        newShipment.insurancePolicy = "";
        newShipment.slaAgreement = "";
        newShipment.estimatedDistance = 0;
        newShipment.co2Emissions = 0;
        newShipment.estimatedCost = 0;
        newShipment.actualCost = 0;
        newShipment.currency = "USD";
        newShipment.priority = "medium";
        newShipment.driverName = "";
        newShipment.driverLicense = "";
        newShipment.driverContact = "";
        newShipment.vehicleType = "";
        newShipment.vehiclePlateNumber = "";
        newShipment.vehicleCapacity = "";
        
        productShipments[params.tokenId].push(shipmentId);
        
        emit ShipmentRequested(shipmentId, params.tokenId, products[params.tokenId].currentCustodian, params.to);
        
        return shipmentId;
    }

    /**
     * @dev Request shipment of a product with enhanced data for frontend components
     */
    function requestShipmentEnhanced(
        ShipmentRequestEnhancedParams memory params
    ) public onlyRole(TRANSPORTER_ROLE) nonReentrant productExists(params.tokenId) returns (uint256) {
        if (params.to == address(0)) revert InvalidInput();
        if (params.expectedETA <= params.expectedETD) revert InvalidTimestamp();
        
        ProductStatus status = products[params.tokenId].status;
        if (status != ProductStatus.PACKAGED && status != ProductStatus.RECEIVED) {
            revert InvalidStatus();
        }
        
        uint256 shipmentId = _shipmentCounter;
        _shipmentCounter++;
        
        // Create new shipment using individual assignments to avoid stack too deep error
        Shipment storage newShipment = shipments[shipmentId];
        newShipment.shipmentId = shipmentId;
        newShipment.productId = params.tokenId;
        newShipment.fromParty = products[params.tokenId].currentCustodian;
        newShipment.toParty = params.to;
        newShipment.carrierId = params.carrierId;
        newShipment.origin = params.origin;
        newShipment.destination = params.destination;
        newShipment.expectedETD = params.expectedETD;
        newShipment.expectedETA = params.expectedETA;
        newShipment.status = ShipmentStatus.REQUESTED;
        newShipment.tempKeyId = params.tempKeyId;
        newShipment.trackingInfo = params.trackingInfo;
        newShipment.requestedAt = uint128(block.timestamp);
        newShipment.approvedAt = 0;
        newShipment.shippedAt = 0;
        newShipment.deliveredAt = 0;
        newShipment.confirmedAt = 0;
        newShipment.packingList = new string[](0);
        newShipment.insurancePolicy = "";
        newShipment.slaAgreement = "";
        newShipment.estimatedDistance = params.estimatedDistance;
        newShipment.co2Emissions = params.co2Emissions;
        newShipment.estimatedCost = params.estimatedCost;
        newShipment.actualCost = 0;
        newShipment.currency = params.currency;
        newShipment.priority = "medium";
        newShipment.driverName = "";
        newShipment.driverLicense = "";
        newShipment.driverContact = "";
        newShipment.vehicleType = "";
        newShipment.vehiclePlateNumber = "";
        newShipment.vehicleCapacity = "";
        
        productShipments[params.tokenId].push(shipmentId);
        
        // Update analytics
        currentAnalytics.totalShipments++;
        currentAnalytics.totalCO2Emissions += params.co2Emissions;
        currentAnalytics.totalCosts += params.estimatedCost;
        
        emit ShipmentRequested(shipmentId, params.tokenId, products[params.tokenId].currentCustodian, params.to);
        
        return shipmentId;
    }

    /**
     * @dev Approve a shipment
     */
    function approveShipment(
        uint256 shipmentId
    ) public onlyRole(ADMIN_ROLE) nonReentrant shipmentExists(shipmentId) {
        
        if (shipments[shipmentId].status != ShipmentStatus.REQUESTED) {
            revert InvalidStatus();
        }
        
        shipments[shipmentId].status = ShipmentStatus.APPROVED;
        shipments[shipmentId].approvedAt = uint128(block.timestamp);
        
        emit ShipmentApproved(shipmentId, shipments[shipmentId].tempKeyId);
    }

    /**
     * @dev Cancel a shipment
     */
    function cancelShipment(
        uint256 shipmentId,
        string memory reason
    ) public onlyRole(ADMIN_ROLE) nonReentrant shipmentExists(shipmentId) {
        
        ShipmentStatus status = shipments[shipmentId].status;
        if (status != ShipmentStatus.REQUESTED && status != ShipmentStatus.APPROVED) {
            revert InvalidStatus();
        }
        
        shipments[shipmentId].status = ShipmentStatus.CANCELLED;
        
        emit ShipmentCancelled(shipmentId, msg.sender, reason);
    }

    /**
     * @dev Mark shipment as in transit
     */
    function shipProduct(
        uint256 shipmentId
    ) public onlyRole(TRANSPORTER_ROLE) nonReentrant shipmentExists(shipmentId) {
        
        if (shipments[shipmentId].status != ShipmentStatus.APPROVED) {
            revert InvalidStatus();
        }
        
        uint256 tokenId = shipments[shipmentId].productId;
        products[tokenId].status = ProductStatus.IN_TRANSIT;
        products[tokenId].lastUpdated = uint128(block.timestamp);
        
        shipments[shipmentId].status = ShipmentStatus.IN_TRANSIT;
        shipments[shipmentId].shippedAt = uint128(block.timestamp);
        
        // Update analytics
        currentAnalytics.productsShipped++;
        
        emit ProductStatusUpdated(tokenId, ProductStatus.IN_TRANSIT, msg.sender);
    }

    /**
     * @dev Confirm receipt of a shipment
     */
    function confirmReceipt(
        uint256 shipmentId,
        string memory location
    ) public nonReentrant shipmentExists(shipmentId) validString(location) {
        
        Shipment storage shipment = shipments[shipmentId];
        
        if (msg.sender != shipment.toParty && !hasRole(ADMIN_ROLE, msg.sender)) {
            revert Unauthorized();
        }
        if (shipment.status != ShipmentStatus.IN_TRANSIT) {
            revert InvalidStatus();
        }
        
        uint256 tokenId = shipment.productId;
        address previousCustodian = products[tokenId].currentCustodian;
        
        // Update product state BEFORE transfer
        products[tokenId].currentCustodian = msg.sender;
        products[tokenId].currentLocation = location;
        products[tokenId].status = ProductStatus.RECEIVED;
        products[tokenId].lastUpdated = uint128(block.timestamp);
        
        // Update shipment state
        shipment.status = ShipmentStatus.DELIVERED;
        shipment.deliveredAt = uint128(block.timestamp);
        
        // Revoke access from previous custodian
        authorizedViewers[tokenId][previousCustodian] = false;
        emit AccessRevoked(tokenId, previousCustodian);
        
        // Grant access to new custodian
        authorizedViewers[tokenId][msg.sender] = true;
        emit AccessGranted(tokenId, msg.sender);
        
        // Transfer the NFT
        _transfer(previousCustodian, msg.sender, tokenId);
        
        // Update analytics
        currentAnalytics.productsDelivered++;
        
        emit CustodyTransferred(tokenId, previousCustodian, msg.sender, location);
        emit ProductStatusUpdated(tokenId, ProductStatus.RECEIVED, msg.sender);
        emit ShipmentDelivered(shipmentId, block.timestamp);
    }

    /**
     * @dev Confirm shipment completion
     */
    function confirmShipmentCompletion(
        uint256 shipmentId
    ) public onlyRole(ADMIN_ROLE) nonReentrant shipmentExists(shipmentId) {
        
        if (shipments[shipmentId].status != ShipmentStatus.DELIVERED) {
            revert InvalidStatus();
        }
        
        shipments[shipmentId].status = ShipmentStatus.CONFIRMED;
        shipments[shipmentId].confirmedAt = uint128(block.timestamp);
        
        emit ShipmentConfirmed(shipmentId, block.timestamp);
    }

    /**
     * @dev Record IoT data for a product
     */
    function recordIoT(
        uint256 tokenId,
        SensorType sensorType,
        int256 value,
        string memory unit,
        string memory gpsCoordinates,
        string memory ipfsCID
    ) public onlyRole(ORACLE_ROLE) nonReentrant productExists(tokenId) {
        
        // Create IoT data using individual assignments to avoid stack too deep error
        IoTData[] storage dataArray = productIoTData[tokenId];
        dataArray.push();
        IoTData storage data = dataArray[dataArray.length - 1];
        data.productId = tokenId;
        data.sensorType = sensorType;
        data.value = value;
        data.unit = unit;
        data.gpsCoordinates = gpsCoordinates;
        data.provider = msg.sender;
        data.timestamp = uint128(block.timestamp);
        data.verified = true;
        data.ipfsCID = ipfsCID;
        
        emit IoTDataRecorded(tokenId, sensorType, value, block.timestamp);
        
        // Check thresholds and alert if needed
        _checkSensorThresholds(tokenId, sensorType, value);
    }

    /**
     * @dev Update product location
     */
    function updateLocation(
        uint256 tokenId,
        string memory location
    ) public nonReentrant productExists(tokenId) validString(location) {
        
        if (ownerOf(tokenId) != msg.sender && 
            products[tokenId].currentCustodian != msg.sender &&
            !hasRole(ADMIN_ROLE, msg.sender)) {
            revert Unauthorized();
        }
        
        products[tokenId].currentLocation = location;
        products[tokenId].lastUpdated = uint128(block.timestamp);
        
        emit LocationUpdated(tokenId, location, msg.sender);
    }

    /**
     * @dev Recall a product
     */
    function recallProduct(
        uint256 tokenId,
        string memory reason
    ) public onlyRole(ADMIN_ROLE) nonReentrant productExists(tokenId) validString(reason) {
        
        if (products[tokenId].isRecalled) {
            revert ProductAlreadyRecalled();
        }
        
        products[tokenId].isRecalled = true;
        products[tokenId].status = ProductStatus.RECALLED;
        products[tokenId].lastUpdated = uint128(block.timestamp);
        
        emit ProductRecalled(tokenId, msg.sender, reason);
        emit ProductStatusUpdated(tokenId, ProductStatus.RECALLED, msg.sender);
    }

    /**
     * @dev Make token soulbound
     */
    function makeSoulbound(
        uint256 tokenId
    ) public onlyRole(ADMIN_ROLE) nonReentrant productExists(tokenId) {
        
        if (products[tokenId].isSoulbound) {
            revert TokenIsSoulbound();
        }
        
        products[tokenId].isSoulbound = true;
        
        emit TokenMadeSoulbound(tokenId, msg.sender);
    }

    /**
     * @dev Perform quality check on a product
     */
    function performQualityCheck(
        uint256 tokenId,
        QualityStatus status,
        string memory reportCID,
        string memory notes
    ) public onlyRole(QUALITY_CONTROL_ROLE) nonReentrant productExists(tokenId) {
        
        // Create quality record using individual assignments to avoid stack too deep error
        QualityRecord[] storage recordArray = productQualityRecords[tokenId];
        recordArray.push();
        QualityRecord storage record = recordArray[recordArray.length - 1];
        record.productId = tokenId;
        record.inspector = msg.sender;
        record.status = status;
        record.reportCID = reportCID;
        record.notes = notes;
        record.timestamp = uint128(block.timestamp);
        products[tokenId].qualityStatus = status;
        products[tokenId].lastUpdated = uint128(block.timestamp);
        
        // Update product status based on quality check
        if (status == QualityStatus.PASSED) {
            products[tokenId].status = ProductStatus.QUALITY_CHECKED;
        }
        
        // Update analytics
        if (status == QualityStatus.PASSED) {
            currentAnalytics.qualityChecksPassed++;
        } else if (status == QualityStatus.FAILED) {
            currentAnalytics.qualityChecksFailed++;
        }
        
        emit QualityChecked(tokenId, status, msg.sender);
    }

    /**
     * @dev Review compliance for a product
     */
    function reviewCompliance(
        uint256 tokenId,
        ComplianceStatus status,
        string memory certificateCID,
        string memory notes,
        uint128 expiryDate
    ) public onlyRole(COMPLIANCE_ROLE) nonReentrant productExists(tokenId) {
        
        // Create compliance record using individual assignments to avoid stack too deep error
        ComplianceRecord[] storage recordArray = productComplianceRecords[tokenId];
        recordArray.push();
        ComplianceRecord storage record = recordArray[recordArray.length - 1];
        record.productId = tokenId;
        record.reviewer = msg.sender;
        record.status = status;
        record.certificateCID = certificateCID;
        record.notes = notes;
        record.timestamp = uint128(block.timestamp);
        record.expiryDate = expiryDate;
        products[tokenId].complianceStatus = status;
        products[tokenId].lastUpdated = uint128(block.timestamp);
        
        // Update product status based on compliance
        if (status == ComplianceStatus.APPROVED) {
            products[tokenId].status = ProductStatus.COMPLIANCE_APPROVED;
        }
        
        // Update analytics
        if (status == ComplianceStatus.APPROVED) {
            currentAnalytics.complianceApproved++;
        } else if (status == ComplianceStatus.REJECTED) {
            currentAnalytics.complianceRejected++;
        }
        
        emit ComplianceReviewed(tokenId, status, msg.sender);
    }

    /**
     * @dev Set sensor threshold for a product
     */
    function setSensorThreshold(
        uint256 tokenId,
        SensorType sensorType,
        int256 minValue,
        int256 maxValue
    ) public onlyRole(ADMIN_ROLE) nonReentrant productExists(tokenId) {
        
        if (maxValue <= minValue) revert InvalidInput();
        
        // Create sensor threshold using individual assignments to avoid stack too deep error
        SensorThreshold storage threshold = sensorThresholds[tokenId][sensorType];
        threshold.minValue = minValue;
        threshold.maxValue = maxValue;
        threshold.isSet = true;
        
        emit SensorThresholdUpdated(tokenId, sensorType, minValue, maxValue);
    }

    /**
     * @dev Add optimization suggestion
     */
    function suggestOptimization(
        string memory description,
        string memory impact
    ) public onlyRole(ADMIN_ROLE) validString(description) validString(impact) {
        
        uint256 suggestionId = _optimizationCounter;
        _optimizationCounter++;
        
        // Create optimization suggestion using individual assignments to avoid stack too deep error
        OptimizationSuggestion storage suggestion = optimizationSuggestions[suggestionId];
        suggestion.id = suggestionId;
        suggestion.description = description;
        suggestion.impact = impact;
        suggestion.timestamp = uint128(block.timestamp);
        suggestion.implemented = false;
        
        emit OptimizationSuggested(suggestionId, description);
    }

    /**
     * @dev Mark optimization suggestion as implemented
     */
    function implementOptimization(
        uint256 suggestionId
    ) public onlyRole(ADMIN_ROLE) nonReentrant {
        
        if (optimizationSuggestions[suggestionId].id == 0) {
            revert InvalidInput();
        }
        
        optimizationSuggestions[suggestionId].implemented = true;
        
        emit OptimizationImplemented(suggestionId, msg.sender);
    }

    /**
     * @dev Grant access to product data
     */
    function grantAccess(
        uint256 tokenId,
        address user
    ) public onlyRole(ADMIN_ROLE) nonReentrant productExists(tokenId) {
        
        if (user == address(0)) revert InvalidInput();
        
        authorizedViewers[tokenId][user] = true;
        
        emit AccessGranted(tokenId, user);
    }

    /**
     * @dev Revoke access to product data
     */
    function revokeAccess(
        uint256 tokenId,
        address user
    ) public onlyRole(ADMIN_ROLE) nonReentrant productExists(tokenId) {
        
        authorizedViewers[tokenId][user] = false;
        
        emit AccessRevoked(tokenId, user);
    }

    /**
     * @dev Update product pricing information
     */
    function updateProductPricing(
        uint256 tokenId,
        uint256 price,
        string memory currency
    ) public onlyRole(ADMIN_ROLE) nonReentrant productExists(tokenId) validString(currency) {
        
        products[tokenId].price = price;
        products[tokenId].currency = currency;
        
        emit ProductStatusUpdated(tokenId, products[tokenId].status, msg.sender);
    }

    /**
     * @dev Update product supplier information
     */
    function updateProductSupplier(
        uint256 tokenId,
        string memory supplier,
        string memory originCountry
    ) public onlyRole(ADMIN_ROLE) nonReentrant productExists(tokenId) validString(supplier) validString(originCountry) {
        
        // Supplier information not stored in Product struct in this version
        
        emit ProductStatusUpdated(tokenId, products[tokenId].status, msg.sender);
    }

    /**
     * @dev Update product physical characteristics
     */
    function updateProductCharacteristics(
        uint256 tokenId,
        uint256 weight,
        string memory dimensions,
        string memory temperatureRequirement,
        string memory storageCondition
    ) public onlyRole(ADMIN_ROLE) nonReentrant productExists(tokenId) validString(dimensions) validString(temperatureRequirement) validString(storageCondition) {
        
        products[tokenId].weight = weight;
        // Other characteristics not stored in Product struct in this version
        
        emit ProductStatusUpdated(tokenId, products[tokenId].status, msg.sender);
    }

    /**
     * @dev Update shipment actual cost
     */
    function updateShipmentActualCost(
        uint256 shipmentId,
        uint256 actualCost
    ) public onlyRole(ADMIN_ROLE) nonReentrant shipmentExists(shipmentId) {
        
        shipments[shipmentId].actualCost = actualCost;
        
        // Update analytics
        if (actualCost < shipments[shipmentId].estimatedCost) {
            currentAnalytics.onTimeShipments++;
        } else {
            currentAnalytics.delayedShipments++;
        }
    }



    /**
     * @dev Get product information
     */
    function getProduct(uint256 tokenId)
        public
        view
        productExists(tokenId)
        returns (Product memory)
    {
        return products[tokenId];
    }

    /**
     * @dev Get shipment information
     */
    function getShipment(uint256 shipmentId)
        public
        view
        shipmentExists(shipmentId)
        returns (Shipment memory)
    {
        return shipments[shipmentId];
    }

    /**
     * @dev Get IoT data for a product with pagination
     */
    function getIoTData(uint256 tokenId, uint256 offset, uint256 limit)
        public
        view
        productExists(tokenId)
        returns (IoTData[] memory, uint256 total)
    {
        IoTData[] storage allData = productIoTData[tokenId];
        total = allData.length;
        
        if (offset >= total) {
            return (new IoTData[](0), total);
        }
        
        uint256 end = offset + limit;
        if (end > total) {
            end = total;
        }
        
        uint256 resultLength = end - offset;
        IoTData[] memory result = new IoTData[](resultLength);
        
        for (uint256 i = 0; i < resultLength; i++) {
            result[i] = allData[offset + i];
        }
        
        return (result, total);
    }

    /**
     * @dev Get shipment IDs for a product
     */
    function getProductShipments(uint256 tokenId)
        public
        view
        productExists(tokenId)
        returns (uint256[] memory)
    {
        return productShipments[tokenId];
    }

    /**
     * @dev Get quality records for a product with pagination
     */
    function getProductQualityRecords(uint256 tokenId, uint256 offset, uint256 limit)
        public
        view
        productExists(tokenId)
        returns (QualityRecord[] memory, uint256 total)
    {
        QualityRecord[] storage allRecords = productQualityRecords[tokenId];
        total = allRecords.length;
        
        if (offset >= total) {
            return (new QualityRecord[](0), total);
        }
        
        uint256 end = offset + limit;
        if (end > total) {
            end = total;
        }
        
        uint256 resultLength = end - offset;
        QualityRecord[] memory result = new QualityRecord[](resultLength);
        
        for (uint256 i = 0; i < resultLength; i++) {
            result[i] = allRecords[offset + i];
        }
        
        return (result, total);
    }

    /**
     * @dev Get compliance records for a product with pagination
     */
    function getProductComplianceRecords(uint256 tokenId, uint256 offset, uint256 limit)
        public
        view
        productExists(tokenId)
        returns (ComplianceRecord[] memory, uint256 total)
    {
        ComplianceRecord[] storage allRecords = productComplianceRecords[tokenId];
        total = allRecords.length;
        
        if (offset >= total) {
            return (new ComplianceRecord[](0), total);
        }
        
        uint256 end = offset + limit;
        if (end > total) {
            end = total;
        }
        
        uint256 resultLength = end - offset;
        ComplianceRecord[] memory result = new ComplianceRecord[](resultLength);
        
        for (uint256 i = 0; i < resultLength; i++) {
            result[i] = allRecords[offset + i];
        }
        
        return (result, total);
    }

    /**
     * @dev Get optimization suggestions
     */
    function getOptimizationSuggestion(uint256 suggestionId)
        public
        view
        returns (OptimizationSuggestion memory)
    {
        return optimizationSuggestions[suggestionId];
    }

    /**
     * @dev Get current analytics data
     */
    function getCurrentAnalytics()
        public
        view
        returns (AnalyticsData memory)
    {
        return currentAnalytics;
    }

    /**
     * @dev Check if user has access to product data
     */
    function hasProductAccess(uint256 tokenId, address user)
        public
        view
        returns (bool)
    {
        if (_ownerOf(tokenId) == address(0)) return false;
        
        return authorizedViewers[tokenId][user] || 
               ownerOf(tokenId) == user ||
               hasRole(ADMIN_ROLE, user) ||
               hasRole(INSPECTOR_ROLE, user);
    }

    /**
     * @dev Check if product is recalled
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
     * @dev Get sensor threshold for a product
     */
    function getSensorThreshold(uint256 tokenId, SensorType sensorType)
        public
        view
        productExists(tokenId)
        returns (SensorThreshold memory)
    {
        return sensorThresholds[tokenId][sensorType];
    }

    /**
     * @dev Check if shipment is expired (timed out)
     */
    function isShipmentExpired(uint256 shipmentId)
        public
        view
        shipmentExists(shipmentId)
        returns (bool)
    {
        Shipment storage shipment = shipments[shipmentId];
        
        if (shipment.status == ShipmentStatus.CONFIRMED || 
            shipment.status == ShipmentStatus.CANCELLED) {
            return false;
        }
        
        return block.timestamp > shipment.requestedAt + SHIPMENT_TIMEOUT;
    }

    /**
     * @dev Internal function to check sensor thresholds
     */
    function _checkSensorThresholds(
        uint256 tokenId,
        SensorType sensorType,
        int256 value
    ) internal {
        SensorThreshold storage threshold = sensorThresholds[tokenId][sensorType];
        
        if (!threshold.isSet) {
            return;
        }
        
        if (value < threshold.minValue || value > threshold.maxValue) {
            emit SensorThresholdAlert(
                tokenId, 
                sensorType, 
                value, 
                threshold.minValue, 
                threshold.maxValue
            );
        }
    }

    /**
     * @dev Override transfer function to respect soulbound status
     */
    function _update(address to, uint256 tokenId, address auth) 
        internal 
        virtual 
        override 
        returns (address) 
    {
        address from = _ownerOf(tokenId);
        
        // If token is soulbound, prevent transfers except for minting
        if (from != address(0) && products[tokenId].isSoulbound) {
            revert TokenIsSoulbound();
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