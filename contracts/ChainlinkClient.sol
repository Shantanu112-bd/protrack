// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title Simplified ChainlinkClient
 * @dev This is a minimal implementation of ChainlinkClient for ProTrack
 */
contract ChainlinkClient {
    // Simplified implementation for ProTrack
    address private oracle;
    bytes32 private jobId;
    uint256 private fee;
    
    event ChainlinkRequested(bytes32 indexed id);
    event ChainlinkFulfilled(bytes32 indexed id);
    event ChainlinkCancelled(bytes32 indexed id);
    
    function setChainlinkOracle(address _oracle) internal {
        oracle = _oracle;
    }
    
    function setChainlinkJobId(bytes32 _jobId) internal {
        jobId = _jobId;
    }
    
    function setChainlinkFee(uint256 _fee) internal {
        fee = _fee;
    }
    
    function getChainlinkOracle() internal view returns (address) {
        return oracle;
    }
    
    function getChainlinkJobId() internal view returns (bytes32) {
        return jobId;
    }
    
    function getChainlinkFee() internal view returns (uint256) {
        return fee;
    }
}