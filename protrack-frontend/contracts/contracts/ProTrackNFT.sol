// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

/**
 * @title ProTrackNFT
 * @dev NFT contract for supply chain product tokenization with comprehensive tracking
 */
contract ProTrackNFT is ERC721, ERC721URIStorage, AccessControl, ReentrancyGuard {
    using Counters for Counters.Counter;

    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant SUPPLY_CHAIN_ROLE = keccak256("SUPPLY_CHAIN_ROLE");
    bytes32 public constant INSPECTOR_ROLE = keccak256("INSPECTOR_ROLE");

    Counters.Counter private _tokenIdCounter;

    struct ProductData {
        string name;
        string sku;
        address manufacturer;
        uint256 createdAt;
        string batchId;
        string category;
        uint256 expiryDate;
        bool isActive;
        uint256 currentValue;
        string currentLocation;
    }

    struct SupplyChainEvent {
        string eventType;
        string description;
        address actor;
        uint256 timestamp;
        string location;
        string data;
        bool verified;
    }

    struct QualityCheck {
        address inspector;
        uint256 timestamp;
        string checkType;
        bool passed;
        string notes;
        string[] testResults;
    }

    // Mappings
    mapping(uint256 => ProductData) public products;
    mapping(uint256 => SupplyChainEvent[]) public supplyChainHistory;
    mapping(uint256 => QualityCheck[]) public qualityChecks;
    mapping(uint256 => mapping(address => bool)) public authorizedActors;
    mapping(string => uint256) public batchToTokenId;
    mapping(address => uint256[]) public manufacturerProducts;

    // Events
    event ProductMinted(uint256 indexed tokenId, string batchId, address indexed manufacturer);
    event SupplyChainEventAdded(uint256 indexed tokenId, string eventType, address indexed actor);
    event QualityCheckAdded(uint256 indexed tokenId, address indexed inspector, bool passed);
    event ProductTransferred(uint256 indexed tokenId, address indexed from, address indexed to, string location);
    event ProductStatusChanged(uint256 indexed tokenId, bool isActive, string reason);
    event ProductValueUpdated(uint256 indexed tokenId, uint256 newValue, string reason);

    constructor() ERC721("ProTrack Supply Chain NFT", "PTNFT") {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(MINTER_ROLE, msg.sender);
        _grantRole(SUPPLY_CHAIN_ROLE, msg.sender);
        _grantRole(INSPECTOR_ROLE, msg.sender);
    }

    /**
     * @dev Mint a new product NFT with comprehensive data
     */
    function mintProduct(
        address to,
        string memory _tokenURI,
        ProductData memory productData
    ) public onlyRole(MINTER_ROLE) nonReentrant returns (uint256) {
        require(bytes(productData.batchId).length > 0, "Batch ID required");
        require(batchToTokenId[productData.batchId] == 0, "Batch ID already exists");

        uint256 tokenId = _tokenIdCounter.current();
        _tokenIdCounter.increment();

        _safeMint(to, tokenId);
        _setTokenURI(tokenId, _tokenURI);

        // Store product data
        products[tokenId] = ProductData({
            name: productData.name,
            sku: productData.sku,
            manufacturer: productData.manufacturer,
            createdAt: block.timestamp,
            batchId: productData.batchId,
            category: productData.category,
            expiryDate: productData.expiryDate,
            isActive: true,
            currentValue: productData.currentValue,
            currentLocation: productData.currentLocation
        });

        // Map batch ID to token ID
        batchToTokenId[productData.batchId] = tokenId;
        manufacturerProducts[productData.manufacturer].push(tokenId);

        // Add initial supply chain event
        _addSupplyChainEvent(
            tokenId,
            "MINTED",
            "Product NFT created and minted",
            productData.manufacturer,
            productData.currentLocation,
            ""
        );

        emit ProductMinted(tokenId, productData.batchId, productData.manufacturer);
        return tokenId;
    }

    /**
     * @dev Add supply chain event with comprehensive tracking
     */
    function addSupplyChainEvent(
        uint256 tokenId,
        string memory eventType,
        string memory description,
        string memory location,
        string memory data
    ) public {
        require(_exists(tokenId), "Token does not exist");
        require(
            hasRole(SUPPLY_CHAIN_ROLE, msg.sender) || 
            ownerOf(tokenId) == msg.sender ||
            authorizedActors[tokenId][msg.sender],
            "Not authorized"
        );

        _addSupplyChainEvent(tokenId, eventType, description, msg.sender, location, data);
    }

    /**
     * @dev Internal function to add supply chain event
     */
    function _addSupplyChainEvent(
        uint256 tokenId,
        string memory eventType,
        string memory description,
        address actor,
        string memory location,
        string memory data
    ) internal {
        supplyChainHistory[tokenId].push(SupplyChainEvent({
            eventType: eventType,
            description: description,
            actor: actor,
            timestamp: block.timestamp,
            location: location,
            data: data,
            verified: hasRole(INSPECTOR_ROLE, actor)
        }));

        // Update current location if provided
        if (bytes(location).length > 0) {
            products[tokenId].currentLocation = location;
        }

        emit SupplyChainEventAdded(tokenId, eventType, actor);
    }

    /**
     * @dev Add quality check result
     */
    function addQualityCheck(
        uint256 tokenId,
        string memory checkType,
        bool passed,
        string memory notes,
        string[] memory testResults
    ) public onlyRole(INSPECTOR_ROLE) {
        require(_exists(tokenId), "Token does not exist");

        qualityChecks[tokenId].push(QualityCheck({
            inspector: msg.sender,
            timestamp: block.timestamp,
            checkType: checkType,
            passed: passed,
            notes: notes,
            testResults: testResults
        }));

        // Add corresponding supply chain event
        string memory eventType = passed ? "QUALITY_PASSED" : "QUALITY_FAILED";
        _addSupplyChainEvent(
            tokenId,
            eventType,
            string(abi.encodePacked("Quality check: ", checkType)),
            msg.sender,
            products[tokenId].currentLocation,
            notes
        );

        emit QualityCheckAdded(tokenId, msg.sender, passed);
    }

    /**
     * @dev Transfer product with location tracking
     */
    function transferWithLocation(
        address from,
        address to,
        uint256 tokenId,
        string memory newLocation
    ) public {
        require(ownerOf(tokenId) == from, "Not the owner");
        require(msg.sender == from || getApproved(tokenId) == msg.sender || isApprovedForAll(from, msg.sender), "Not approved");

        _transfer(from, to, tokenId);
        
        if (bytes(newLocation).length > 0) {
            products[tokenId].currentLocation = newLocation;
        }

        _addSupplyChainEvent(
            tokenId,
            "TRANSFERRED",
            "Product ownership transferred",
            msg.sender,
            newLocation,
            string(abi.encodePacked("From: ", addressToString(from), " To: ", addressToString(to)))
        );

        emit ProductTransferred(tokenId, from, to, newLocation);
    }

    /**
     * @dev Update product status (active/inactive)
     */
    function updateProductStatus(
        uint256 tokenId,
        bool isActive,
        string memory reason
    ) public {
        require(_exists(tokenId), "Token does not exist");
        require(
            hasRole(SUPPLY_CHAIN_ROLE, msg.sender) || 
            ownerOf(tokenId) == msg.sender,
            "Not authorized"
        );

        products[tokenId].isActive = isActive;

        string memory eventType = isActive ? "ACTIVATED" : "DEACTIVATED";
        _addSupplyChainEvent(
            tokenId,
            eventType,
            reason,
            msg.sender,
            products[tokenId].currentLocation,
            ""
        );

        emit ProductStatusChanged(tokenId, isActive, reason);
    }

    /**
     * @dev Update product value
     */
    function updateProductValue(
        uint256 tokenId,
        uint256 newValue,
        string memory reason
    ) public {
        require(_exists(tokenId), "Token does not exist");
        require(
            hasRole(SUPPLY_CHAIN_ROLE, msg.sender) || 
            ownerOf(tokenId) == msg.sender,
            "Not authorized"
        );

        products[tokenId].currentValue = newValue;

        _addSupplyChainEvent(
            tokenId,
            "VALUE_UPDATED",
            reason,
            msg.sender,
            products[tokenId].currentLocation,
            string(abi.encodePacked("New value: ", uint2str(newValue)))
        );

        emit ProductValueUpdated(tokenId, newValue, reason);
    }

    /**
     * @dev Authorize actor for specific token
     */
    function authorizeActor(uint256 tokenId, address actor) public {
        require(ownerOf(tokenId) == msg.sender, "Not the owner");
        authorizedActors[tokenId][actor] = true;
    }

    /**
     * @dev Revoke actor authorization
     */
    function revokeActorAuthorization(uint256 tokenId, address actor) public {
        require(ownerOf(tokenId) == msg.sender, "Not the owner");
        authorizedActors[tokenId][actor] = false;
    }

    // View functions
    function getProductData(uint256 tokenId) public view returns (ProductData memory) {
        require(_exists(tokenId), "Token does not exist");
        return products[tokenId];
    }

    function getSupplyChainHistory(uint256 tokenId) public view returns (SupplyChainEvent[] memory) {
        require(_exists(tokenId), "Token does not exist");
        return supplyChainHistory[tokenId];
    }

    function getQualityChecks(uint256 tokenId) public view returns (QualityCheck[] memory) {
        require(_exists(tokenId), "Token does not exist");
        return qualityChecks[tokenId];
    }

    function getTokenByBatchId(string memory batchId) public view returns (uint256) {
        return batchToTokenId[batchId];
    }

    function getManufacturerProducts(address manufacturer) public view returns (uint256[] memory) {
        return manufacturerProducts[manufacturer];
    }

    function isProductExpired(uint256 tokenId) public view returns (bool) {
        require(_exists(tokenId), "Token does not exist");
        return block.timestamp > products[tokenId].expiryDate;
    }

    // Utility functions
    function addressToString(address _addr) internal pure returns (string memory) {
        bytes32 value = bytes32(uint256(uint160(_addr)));
        bytes memory alphabet = "0123456789abcdef";
        bytes memory str = new bytes(42);
        str[0] = '0';
        str[1] = 'x';
        for (uint256 i = 0; i < 20; i++) {
            str[2+i*2] = alphabet[uint8(value[i + 12] >> 4)];
            str[3+i*2] = alphabet[uint8(value[i + 12] & 0x0f)];
        }
        return string(str);
    }

    function uint2str(uint256 _i) internal pure returns (string memory) {
        if (_i == 0) {
            return "0";
        }
        uint256 j = _i;
        uint256 len;
        while (j != 0) {
            len++;
            j /= 10;
        }
        bytes memory bstr = new bytes(len);
        uint256 k = len;
        while (_i != 0) {
            k = k-1;
            uint8 temp = (48 + uint8(_i - _i / 10 * 10));
            bytes1 b1 = bytes1(temp);
            bstr[k] = b1;
            _i /= 10;
        }
        return string(bstr);
    }

    // Override functions
    function _burn(uint256 tokenId) internal override(ERC721, ERC721URIStorage) {
        super._burn(tokenId);
    }

    function tokenURI(uint256 tokenId) public view override(ERC721, ERC721URIStorage) returns (string memory) {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(bytes4 interfaceId) public view override(ERC721, ERC721URIStorage, AccessControl) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}
