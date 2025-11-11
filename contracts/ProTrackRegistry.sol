// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "./ChainlinkClient.sol";

/**
 * @title ProTrackRegistry
 * @dev Main contract for managing the supply chain registry with full lifecycle support
 */
contract ProTrackRegistry is ERC721URIStorage, AccessControl, ReentrancyGuard, ChainlinkClient {
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant MANUFACTURER_ROLE = keccak256("MANUFACTURER_ROLE");
    bytes32 public constant PACKAGER_ROLE = keccak256("PACKAGER_ROLE");
    bytes32 public constant TRANSPORTER_ROLE = keccak256("TRANSPORTER_ROLE");
    bytes32 public constant RETAILER_ROLE = keccak256("RETAILER_ROLE");
    bytes32 public constant ORACLE_ROLE = keccak256("ORACLE_ROLE");

    // Product status enum
    enum ProductStatus { 
        MANUFACTURED, 
        PACKAGED, 
        IN_TRANSIT, 
        RECEIVED, 
        SOLD 
    }

    // Shipment status enum
    enum ShipmentStatus { 
        REQUESTED, 
        APPROVED, 
        IN_TRANSIT, 
        DELIVERED, 
        CONFIRMED 
    }

    // Product structure
    struct Product {
        string rfidHash;
        string batchId;
        string productName;
        address manufacturer;
        uint256 manufactureDate;
        uint256 expiryDate;
        string metadataURI;
        ProductStatus status;
        address currentCustodian;
        string currentLocation;
        uint256 lastUpdated;
    }

    // Shipment structure
    struct Shipment {
        uint256 productId;
        address fromParty;
        address toParty;
        ShipmentStatus status;
        string tempKeyId;
        uint256 requestedAt;
        uint256 approvedAt;
        uint256 shippedAt;
        uint256 deliveredAt;
        uint256 confirmedAt;
    }

    // IoT data structure
    struct IoTData {
        uint256 productId;
        string ipfsCID;
        uint256 timestamp;
        address provider;
    }

    // Events
    event ProductMinted(
        uint256 indexed tokenId,
        string rfidHash,
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
        string ipfsCID,
        uint256 timestamp
    );
    
    event ProductPackaged(
        uint256 indexed tokenId,
        string batchURI
    );

    // State variables
    mapping(uint256 => Product) public products;
    mapping(uint256 => Shipment) public shipments;
    mapping(uint256 => IoTData[]) public productIoTData;
    mapping(string => uint256) public rfidToTokenId;
    mapping(uint256 => uint256[]) public productShipments;
    
    uint256 private _tokenCounter;
    uint256 private _shipmentCounter;

    constructor() ERC721("ProTrack Supply Chain", "PTSC") {
        _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _setupRole(ADMIN_ROLE, msg.sender);
        _tokenCounter = 1;
        _shipmentCounter = 1;
    }

    /**
     * @dev Mint a new product token
     * @param rfidHash RFID hash of the product
     * @param productName Name of the product
     * @param batchId Batch identifier
     * @param expiryDate Expiry date as timestamp
     * @param metadataURI IPFS URI for product metadata
     * @param owner Initial owner of the token
     */
    function mintProduct(
        string memory rfidHash,
        string memory productName,
        string memory batchId,
        uint256 expiryDate,
        string memory metadataURI,
        address owner
    ) public onlyRole(MANUFACTURER_ROLE) returns (uint256) {
        require(bytes(rfidHash).length > 0, "RFID hash cannot be empty");
        require(bytes(productName).length > 0, "Product name cannot be empty");
        require(rfidToTokenId[rfidHash] == 0, "Product with this RFID already exists");
        
        uint256 tokenId = _tokenCounter;
        _tokenCounter++;
        
        _mint(owner, tokenId);
        _setTokenURI(tokenId, metadataURI);
        
        products[tokenId] = Product({
            rfidHash: rfidHash,
            batchId: batchId,
            productName: productName,
            manufacturer: msg.sender,
            manufactureDate: block.timestamp,
            expiryDate: expiryDate,
            metadataURI: metadataURI,
            status: ProductStatus.MANUFACTURED,
            currentCustodian: owner,
            currentLocation: "Manufacturing Facility",
            lastUpdated: block.timestamp
        });
        
        rfidToTokenId[rfidHash] = tokenId;
        
        emit ProductMinted(tokenId, rfidHash, msg.sender, productName);
        emit ProductStatusUpdated(tokenId, ProductStatus.MANUFACTURED, msg.sender);
        
        return tokenId;
    }

    /**
     * @dev Log packaging event for a product
     * @param tokenId Token ID of the product
     * @param batchURI IPFS URI for batch information
     */
    function logPackaging(
        uint256 tokenId,
        string memory batchURI
    ) public onlyRole(PACKAGER_ROLE) {
        require(_exists(tokenId), "Product does not exist");
        require(
            products[tokenId].status == ProductStatus.MANUFACTURED,
            "Product must be manufactured before packaging"
        );
        
        products[tokenId].status = ProductStatus.PACKAGED;
        products[tokenId].lastUpdated = block.timestamp;
        
        emit ProductPackaged(tokenId, batchURI);
        emit ProductStatusUpdated(tokenId, ProductStatus.PACKAGED, msg.sender);
    }

    /**
     * @dev Request shipment of a product
     * @param tokenId Token ID of the product
     * @param to Destination party
     * @param tempKeyId Temporary key ID for MPC
     */
    function requestShipment(
        uint256 tokenId,
        address to,
        string memory tempKeyId
    ) public onlyRole(TRANSPORTER_ROLE) returns (uint256) {
        require(_exists(tokenId), "Product does not exist");
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
            requestedAt: block.timestamp,
            approvedAt: 0,
            shippedAt: 0,
            deliveredAt: 0,
            confirmedAt: 0
        });
        
        productShipments[tokenId].push(shipmentId);
        
        emit ShipmentRequested(shipmentId, tokenId, products[tokenId].currentCustodian, to);
        
        return shipmentId;
    }

    /**
     * @dev Approve a shipment (requires MPC approval)
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
     */
    function confirmReceipt(
        uint256 shipmentId
    ) public {
        require(
            msg.sender == shipments[shipmentId].toParty || hasRole(ADMIN_ROLE, msg.sender),
            "Only destination party or admin can confirm receipt"
        );
        require(shipments[shipmentId].status == ShipmentStatus.IN_TRANSIT, "Shipment not in transit");
        
        uint256 tokenId = shipments[shipmentId].productId;
        address previousCustodian = products[tokenId].currentCustodian;
        
        products[tokenId].currentCustodian = msg.sender;
        products[tokenId].status = ProductStatus.RECEIVED;
        products[tokenId].lastUpdated = block.timestamp;
        
        shipments[shipmentId].status = ShipmentStatus.DELIVERED;
        shipments[shipmentId].deliveredAt = block.timestamp;
        
        // Transfer the NFT to the new custodian
        _transfer(previousCustodian, msg.sender, tokenId);
        
        emit CustodyTransferred(tokenId, previousCustodian, msg.sender, products[tokenId].currentLocation);
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
     * @param ipfsCID IPFS CID of the IoT data
     */
    function recordIoT(
        uint256 tokenId,
        string memory ipfsCID
    ) public onlyRole(ORACLE_ROLE) {
        require(_exists(tokenId), "Product does not exist");
        require(bytes(ipfsCID).length > 0, "IPFS CID cannot be empty");
        
        IoTData memory data = IoTData({
            productId: tokenId,
            ipfsCID: ipfsCID,
            timestamp: block.timestamp,
            provider: msg.sender
        });
        
        productIoTData[tokenId].push(data);
        
        emit IoTDataRecorded(tokenId, ipfsCID, block.timestamp);
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
        require(_exists(tokenId), "Product does not exist");
        require(ownerOf(tokenId) == msg.sender, "Not the owner of the product");
        require(to != address(0), "Invalid destination address");
        
        address previousCustodian = products[tokenId].currentCustodian;
        products[tokenId].currentCustodian = to;
        products[tokenId].currentLocation = location;
        products[tokenId].lastUpdated = block.timestamp;
        
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
        require(_exists(tokenId), "Product does not exist");
        require(ownerOf(tokenId) == msg.sender, "Not the owner of the product");
        
        products[tokenId].currentLocation = location;
        products[tokenId].lastUpdated = block.timestamp;
    }

    /**
     * @dev Revoke a product token (for recalls)
     * @param tokenId Token ID of the product
     * @param reason Reason for revocation
     */
    function revokeToken(
        uint256 tokenId,
        string memory reason
    ) public onlyRole(ADMIN_ROLE) {
        require(_exists(tokenId), "Product does not exist");
        
        // Burn the token
        _burn(tokenId);
        
        // Emit event with reason
        emit ProductStatusUpdated(tokenId, ProductStatus.SOLD, msg.sender);
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
        require(_exists(tokenId), "Product does not exist");
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