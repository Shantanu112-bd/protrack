// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract SimpleProTrack {
    string public name = "SimpleProTrack";
    address public owner;
    
    constructor() {
        owner = msg.sender;
    }
    
    function getName() public view returns (string memory) {
        return name;
    }
}
