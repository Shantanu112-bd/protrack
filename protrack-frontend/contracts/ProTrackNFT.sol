// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract ProTrackNFT is ERC721, Ownable {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;

    struct ProductInfo {
        string name;
        string origin;
        string batchId;
        uint256 timestamp;
        address manufacturer;
        string ipfsHash;
    }

    mapping(uint256 => ProductInfo) public products;
    mapping(string => bool) public batchExists;

    event ProductMinted(
        uint256 indexed tokenId,
        string name,
        string origin,
        string batchId,
        address indexed manufacturer
    );

    event ProductTransferred(
        uint256 indexed tokenId,
        address indexed from,
        address indexed to,
        string batchId
    );

    constructor() ERC721("ProTrack Products", "PTP") Ownable(msg.sender) {}

    function mintProduct(
        address to,
        string memory name,
        string memory origin,
        string memory batchId,
        string memory ipfsHash
    ) public onlyOwner returns (uint256) {
        require(!batchExists[batchId], "Batch already exists");
        
        _tokenIds.increment();
        uint256 newTokenId = _tokenIds.current();

        _mint(to, newTokenId);
        
        products[newTokenId] = ProductInfo({
            name: name,
            origin: origin,
            batchId: batchId,
            timestamp: block.timestamp,
            manufacturer: msg.sender,
            ipfsHash: ipfsHash
        });

        batchExists[batchId] = true;

        emit ProductMinted(newTokenId, name, origin, batchId, msg.sender);
        
        return newTokenId;
    }

    function getProductInfo(uint256 tokenId) public view returns (ProductInfo memory) {
        require(_exists(tokenId), "Token does not exist");
        return products[tokenId];
    }

    function transferProduct(uint256 tokenId, address to) public {
        require(_isAuthorized(_ownerOf(tokenId), msg.sender, tokenId), "Not authorized");
        address from = _ownerOf(tokenId);
        
        _transfer(from, to, tokenId);
        
        emit ProductTransferred(tokenId, from, to, products[tokenId].batchId);
    }

    function getTotalSupply() public view returns (uint256) {
        return _tokenIds.current();
    }

    function getProductsByOwner(address owner) public view returns (uint256[] memory) {
        uint256 totalSupply = _tokenIds.current();
        uint256[] memory ownedTokens = new uint256[](balanceOf(owner));
        uint256 index = 0;

        for (uint256 i = 1; i <= totalSupply; i++) {
            if (_ownerOf(i) == owner) {
                ownedTokens[index] = i;
                index++;
            }
        }

        return ownedTokens;
    }
}
