// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";

/**
 * @title ProTrackRFIDTokenizer
 * @dev Smart contract for tokenizing products with RFID tags in the supply chain
 */
contract ProTrackRFIDTokenizer is ERC721, ERC721URIStorage, AccessControl {
    using Counters for Counters.Counter;
    using ECDSA for bytes32;

    bytes32 public constant MANUFACTURER_ROLE = keccak256("MANUFACTURER_ROLE");
    bytes32 public constant TRANSPORTER_ROLE = keccak256("TRANSPORTER_ROLE");
    bytes32 public constant RETAILER_ROLE = keccak256("RETAILER_ROLE");
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");

    Counters.Counter private _tokenIdCounter;
    
    // Mapping from token ID to product data
    struct ProductData {
        string rfidTag;
        string batchId;
        uint256 manufactureDate;
        uint256 expiryDate;
        address manufacturer;
        address currentCustodian;
        string status; // manufacture, package, ship, receive, sell, verify
        mapping(string => string) iotData; // key-value pairs for IoT sensor data
        string gpsLocation; // Latest GPS coordinates
    }
    
    // Mapping for token ID to product data
    mapping(uint256 => ProductData) private _productData;
    
    // Mapping from RFID tag to token ID
    mapping(string => uint256) private _rfidToTokenId;
    
    // Mapping for MPC shared keys (tokenId => encrypted key)
    mapping(uint256 => string) private _mpcSharedKeys;
    
    // Custody transfer requests
    struct CustodyTransfer {
        address from;
        address to;
        uint256 tokenId;
        bool approved;
        uint256 timestamp;
    }
    
    // Mapping for custody transfers (tokenId => CustodyTransfer)
    mapping(uint256 => CustodyTransfer) private _custodyTransfers;
    
    // Events
    event ProductMinted(uint256 tokenId, string rfidTag, address manufacturer);
    event StatusUpdated(uint256 tokenId, string status);
    event IoTDataUpdated(uint256 tokenId, string key, string value);
    event GPSLocationUpdated(uint256 tokenId, string location);
    event CustodyTransferRequested(uint256 tokenId, address from, address to);
    event CustodyTransferCompleted(uint256 tokenId, address from, address to);
    
    constructor() ERC721("ProTrackRFID", "PTRFID") {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ADMIN_ROLE, msg.sender);
    }
    
    /**
     * @dev Mint a new token for a product with RFID tag
     * @param to The address that will own the minted token
     * @param rfidTag The RFID tag of the product
     * @param batchId The batch ID of the product
     * @param expiryDate The expiry date of the product (unix timestamp)
     * @param uri The metadata URI for the token
     */
    function mintProduct(
        address to,
        string memory rfidTag,
        string memory batchId,
        uint256 expiryDate,
        string memory uri
    ) public onlyRole(MANUFACTURER_ROLE) returns (uint256) {
        require(_rfidToTokenId[rfidTag] == 0, "RFID tag already tokenized");
        
        uint256 tokenId = _tokenIdCounter.current();
        _tokenIdCounter.increment();
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, uri);
        
        // Initialize product data
        _productData[tokenId].rfidTag = rfidTag;
        _productData[tokenId].batchId = batchId;
        _productData[tokenId].manufactureDate = block.timestamp;
        _productData[tokenId].expiryDate = expiryDate;
        _productData[tokenId].manufacturer = msg.sender;
        _productData[tokenId].currentCustodian = to;
        _productData[tokenId].status = "manufacture";
        
        // Map RFID to token ID
        _rfidToTokenId[rfidTag] = tokenId;
        
        emit ProductMinted(tokenId, rfidTag, msg.sender);
        return tokenId;
    }
    
    /**
     * @dev Update the status of a product in the supply chain
     * @param tokenId The ID of the token
     * @param status The new status of the product
     */
    function updateStatus(uint256 tokenId, string memory status) public {
        require(_isApprovedOrOwner(msg.sender, tokenId) || 
                hasRole(ADMIN_ROLE, msg.sender) ||
                _productData[tokenId].currentCustodian == msg.sender, 
                "Not authorized");
        
        _productData[tokenId].status = status;
        emit StatusUpdated(tokenId, status);
    }
    
    /**
     * @dev Update IoT data for a product
     * @param tokenId The ID of the token
     * @param key The key for the IoT data
     * @param value The value for the IoT data
     */
    function updateIoTData(uint256 tokenId, string memory key, string memory value) public {
        require(_isApprovedOrOwner(msg.sender, tokenId) || 
                hasRole(ADMIN_ROLE, msg.sender) ||
                hasRole(TRANSPORTER_ROLE, msg.sender) ||
                _productData[tokenId].currentCustodian == msg.sender, 
                "Not authorized");
        
        _productData[tokenId].iotData[key] = value;
        emit IoTDataUpdated(tokenId, key, value);
    }
    
    /**
     * @dev Update GPS location for a product
     * @param tokenId The ID of the token
     * @param location The GPS coordinates
     */
    function updateGPSLocation(uint256 tokenId, string memory location) public {
        require(_isApprovedOrOwner(msg.sender, tokenId) || 
                hasRole(ADMIN_ROLE, msg.sender) ||
                hasRole(TRANSPORTER_ROLE, msg.sender) ||
                _productData[tokenId].currentCustodian == msg.sender, 
                "Not authorized");
        
        _productData[tokenId].gpsLocation = location;
        emit GPSLocationUpdated(tokenId, location);
    }
    
    /**
     * @dev Request custody transfer of a product
     * @param tokenId The ID of the token
     * @param to The address to transfer custody to
     */
    function requestCustodyTransfer(uint256 tokenId, address to) public {
        require(_isApprovedOrOwner(msg.sender, tokenId) || 
                _productData[tokenId].currentCustodian == msg.sender, 
                "Not authorized");
        
        _custodyTransfers[tokenId] = CustodyTransfer({
            from: msg.sender,
            to: to,
            tokenId: tokenId,
            approved: false,
            timestamp: block.timestamp
        });
        
        emit CustodyTransferRequested(tokenId, msg.sender, to);
    }
    
    /**
     * @dev Approve custody transfer of a product
     * @param tokenId The ID of the token
     * @param mpcSharedKey The encrypted MPC shared key
     */
    function approveCustodyTransfer(uint256 tokenId, string memory mpcSharedKey) public {
        CustodyTransfer storage transfer = _custodyTransfers[tokenId];
        require(transfer.to == msg.sender, "Not the recipient of transfer");
        require(transfer.timestamp > 0, "Transfer not requested");
        require(!transfer.approved, "Transfer already approved");
        
        transfer.approved = true;
        _productData[tokenId].currentCustodian = msg.sender;
        _mpcSharedKeys[tokenId] = mpcSharedKey;
        
        emit CustodyTransferCompleted(tokenId, transfer.from, transfer.to);
    }
    
    /**
     * @dev Get product data by token ID
     * @param tokenId The ID of the token
     */
    function getProductData(uint256 tokenId) public view returns (
        string memory rfidTag,
        string memory batchId,
        uint256 manufactureDate,
        uint256 expiryDate,
        address manufacturer,
        address currentCustodian,
        string memory status,
        string memory gpsLocation
    ) {
        require(_exists(tokenId), "Token does not exist");
        
        ProductData storage data = _productData[tokenId];
        return (
            data.rfidTag,
            data.batchId,
            data.manufactureDate,
            data.expiryDate,
            data.manufacturer,
            data.currentCustodian,
            data.status,
            data.gpsLocation
        );
    }
    
    /**
     * @dev Get token ID by RFID tag
     * @param rfidTag The RFID tag of the product
     */
    function getTokenIdByRFID(string memory rfidTag) public view returns (uint256) {
        uint256 tokenId = _rfidToTokenId[rfidTag];
        require(tokenId != 0, "RFID tag not tokenized");
        return tokenId;
    }
    
    /**
     * @dev Get IoT data for a product
     * @param tokenId The ID of the token
     * @param key The key for the IoT data
     */
    function getIoTData(uint256 tokenId, string memory key) public view returns (string memory) {
        require(_exists(tokenId), "Token does not exist");
        return _productData[tokenId].iotData[key];
    }
    
    /**
     * @dev Verify product authenticity using ZKP (simplified)
     * @param tokenId The ID of the token
     * @param proof The ZKP proof
     */
    function verifyProductAuthenticity(uint256 tokenId, bytes memory proof) public view returns (bool) {
        require(_exists(tokenId), "Token does not exist");
        // This is a simplified placeholder for ZKP verification
        // In a real implementation, this would verify a zero-knowledge proof
        return proof.length > 0;
    }
    
    // Override required functions
    function _burn(uint256 tokenId) internal override(ERC721, ERC721URIStorage) {
        super._burn(tokenId);
    }
    
    function tokenURI(uint256 tokenId) public view override(ERC721, ERC721URIStorage) returns (string memory) {
        return super.tokenURI(tokenId);
    }
    
    function supportsInterface(bytes4 interfaceId) public view override(ERC721, AccessControl) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}