// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "./ChainlinkClient.sol";

contract ProTrackToken is ERC721URIStorage, AccessControl, ReentrancyGuard, ChainlinkClient {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;

    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");

    enum ProductStatus { Created, InTransit, Delivered }

    struct Product {
        string name;
        string description;
        address manufacturer;
        uint256 manufactureDate;
        ProductStatus status;
        string location;
        mapping(uint256 => string) history;
        uint256 historyCount;
    }

    mapping(uint256 => Product) private _products;
    mapping(address => bool) private _authorizedManufacturers;

    event ProductCreated(uint256 indexed tokenId, string name, address manufacturer);
    event ProductStatusUpdated(uint256 indexed tokenId, ProductStatus status);
    event ProductLocationUpdated(uint256 indexed tokenId, string location);
    event ManufacturerAuthorized(address manufacturer);
    event ManufacturerRevoked(address manufacturer);

    constructor() ERC721("ProTrack", "PTK") {
        _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _setupRole(MINTER_ROLE, msg.sender);
        _setupRole(ADMIN_ROLE, msg.sender);
    }

    function createProduct(
        string memory name,
        string memory description,
        string memory tokenURI
    ) public onlyRole(MINTER_ROLE) returns (uint256) {
        require(bytes(name).length > 0, "Name cannot be empty");
        require(bytes(description).length > 0, "Description cannot be empty");

        _tokenIds.increment();
        uint256 newTokenId = _tokenIds.current();

        _mint(msg.sender, newTokenId);
        _setTokenURI(newTokenId, tokenURI);

        Product storage newProduct = _products[newTokenId];
        newProduct.name = name;
        newProduct.description = description;
        newProduct.manufacturer = msg.sender;
        newProduct.manufactureDate = block.timestamp;
        newProduct.status = ProductStatus.Created;
        newProduct.historyCount = 0;

        emit ProductCreated(newTokenId, name, msg.sender);
        return newTokenId;
    }

    function updateProductStatus(uint256 tokenId, ProductStatus status)
        public
        onlyRole(MINTER_ROLE)
    {
        require(_exists(tokenId), "Product does not exist");
        _products[tokenId].status = status;
        emit ProductStatusUpdated(tokenId, status);
    }

    function updateProductLocation(uint256 tokenId, string memory location)
        public
        onlyRole(MINTER_ROLE)
    {
        require(_exists(tokenId), "Product does not exist");
        require(bytes(location).length > 0, "Location cannot be empty");
        _products[tokenId].location = location;
        emit ProductLocationUpdated(tokenId, location);
    }

    function addToProductHistory(uint256 tokenId, string memory historyItem)
        public
        onlyRole(MINTER_ROLE)
    {
        require(_exists(tokenId), "Product does not exist");
        require(bytes(historyItem).length > 0, "History item cannot be empty");
        uint256 historyIndex = _products[tokenId].historyCount;
        _products[tokenId].history[historyIndex] = historyItem;
        _products[tokenId].historyCount++;
    }

    function getProduct(uint256 tokenId)
        public
        view
        returns (
            string memory name,
            string memory description,
            address manufacturer,
            uint256 manufactureDate,
            ProductStatus status,
            string memory location
        )
    {
        require(_exists(tokenId), "Product does not exist");
        Product storage product = _products[tokenId];
        return (
            product.name,
            product.description,
            product.manufacturer,
            product.manufactureDate,
            product.status,
            product.location
        );
    }

    function getProductHistoryItem(uint256 tokenId, uint256 historyIndex)
        public
        view
        returns (string memory)
    {
        require(_exists(tokenId), "Product does not exist");
        require(
            historyIndex < _products[tokenId].historyCount,
            "History index out of bounds"
        );
        return _products[tokenId].history[historyIndex];
    }

    function getProductHistoryCount(uint256 tokenId)
        public
        view
        returns (uint256)
    {
        require(_exists(tokenId), "Product does not exist");
        return _products[tokenId].historyCount;
    }

    function authorizeManufacturer(address manufacturer)
        public
        onlyRole(ADMIN_ROLE)
    {
        require(
            !_authorizedManufacturers[manufacturer],
            "Manufacturer already authorized"
        );
        _authorizedManufacturers[manufacturer] = true;
        emit ManufacturerAuthorized(manufacturer);
    }

    function revokeManufacturer(address manufacturer)
        public
        onlyRole(ADMIN_ROLE)
    {
        require(
            _authorizedManufacturers[manufacturer],
            "Manufacturer not authorized"
        );
        _authorizedManufacturers[manufacturer] = false;
        emit ManufacturerRevoked(manufacturer);
    }

    function isManufacturerAuthorized(address manufacturer)
        public
        view
        returns (bool)
    {
        return _authorizedManufacturers[manufacturer];
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        virtual
        override(ERC721URIStorage, AccessControl)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}