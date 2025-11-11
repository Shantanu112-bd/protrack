// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * @title ProductToken
 * @dev ERC721 NFT contract for product tokenization with SBT mode support
 */
contract ProductToken is ERC721URIStorage, AccessControl, ReentrancyGuard {
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");

    // Product metadata structure
    struct ProductMetadata {
        string name;
        string description;
        string sku;
        string category;
        uint256 manufactureDate;
        uint256 expiryDate;
        string batchId;
        string manufacturer;
        string currentValue;
        string currentLocation;
        bool isActive;
    }

    // Mapping from token ID to product metadata
    mapping(uint256 => ProductMetadata) public productMetadata;
    
    // Mapping from RFID hash to token ID
    mapping(string => uint256) public rfidToTokenId;
    
    // Mapping to track if token is soulbound (cannot be transferred)
    mapping(uint256 => bool) public isSoulbound;

    // Events
    event ProductMinted(
        uint256 indexed tokenId,
        string rfidHash,
        address indexed owner,
        string name
    );
    
    event ProductMetadataUpdated(
        uint256 indexed tokenId,
        string field,
        string oldValue,
        string newValue
    );
    
    event SoulboundStatusChanged(
        uint256 indexed tokenId,
        bool isSoulbound
    );

    constructor() ERC721("ProTrack Product", "PTP") {
        _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _setupRole(MINTER_ROLE, msg.sender);
        _setupRole(ADMIN_ROLE, msg.sender);
    }

    /**
     * @dev Mint a new product token
     * @param to Address to mint token to
     * @param tokenURI URI for token metadata
     * @param rfidHash RFID hash of the product
     * @param data Product metadata
     */
    function mintProduct(
        address to,
        string memory tokenURI,
        string memory rfidHash,
        ProductMetadata memory data
    ) public onlyRole(MINTER_ROLE) returns (uint256) {
        require(bytes(rfidHash).length > 0, "RFID hash cannot be empty");
        require(rfidToTokenId[rfidHash] == 0, "Product with this RFID already exists");
        require(bytes(data.name).length > 0, "Product name cannot be empty");
        
        uint256 tokenId = totalSupply() + 1;
        
        _mint(to, tokenId);
        _setTokenURI(tokenId, tokenURI);
        
        productMetadata[tokenId] = data;
        rfidToTokenId[rfidHash] = tokenId;
        
        emit ProductMinted(tokenId, rfidHash, to, data.name);
        
        return tokenId;
    }

    /**
     * @dev Update product metadata
     * @param tokenId Token ID
     * @param field Field to update
     * @param newValue New value
     */
    function updateProductMetadata(
        uint256 tokenId,
        string memory field,
        string memory newValue
    ) public {
        require(_exists(tokenId), "Product does not exist");
        require(
            ownerOf(tokenId) == msg.sender || hasRole(ADMIN_ROLE, msg.sender),
            "Not authorized to update metadata"
        );
        
        ProductMetadata storage metadata = productMetadata[tokenId];
        string memory oldValue = "";
        
        // Update the appropriate field
        if (keccak256(bytes(field)) == keccak256(bytes("name"))) {
            oldValue = metadata.name;
            metadata.name = newValue;
        } else if (keccak256(bytes(field)) == keccak256(bytes("description"))) {
            oldValue = metadata.description;
            metadata.description = newValue;
        } else if (keccak256(bytes(field)) == keccak256(bytes("currentLocation"))) {
            oldValue = metadata.currentLocation;
            metadata.currentLocation = newValue;
        } else if (keccak256(bytes(field)) == keccak256(bytes("currentValue"))) {
            oldValue = metadata.currentValue;
            metadata.currentValue = newValue;
        } else {
            revert("Invalid field");
        }
        
        emit ProductMetadataUpdated(tokenId, field, oldValue, newValue);
    }

    /**
     * @dev Set soulbound status for a token
     * @param tokenId Token ID
     * @param soulbound True if token should be soulbound
     */
    function setSoulbound(uint256 tokenId, bool soulbound) public onlyRole(ADMIN_ROLE) {
        require(_exists(tokenId), "Product does not exist");
        isSoulbound[tokenId] = soulbound;
        emit SoulboundStatusChanged(tokenId, soulbound);
    }

    /**
     * @dev Get product metadata
     * @param tokenId Token ID
     */
    function getProductMetadata(uint256 tokenId)
        public
        view
        returns (ProductMetadata memory)
    {
        require(_exists(tokenId), "Product does not exist");
        return productMetadata[tokenId];
    }

    /**
     * @dev Get token ID by RFID hash
     * @param rfidHash RFID hash
     */
    function getTokenIdByRFID(string memory rfidHash)
        public
        view
        returns (uint256)
    {
        return rfidToTokenId[rfidHash];
    }

    /**
     * @dev Override transfer function to respect soulbound status
     */
    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 tokenId,
        uint256 batchSize
    ) internal override {
        super._beforeTokenTransfer(from, to, tokenId, batchSize);
        
        // If token is soulbound, prevent transfers except for minting
        if (isSoulbound[tokenId] && from != address(0)) {
            revert("Token is soulbound and cannot be transferred");
        }
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