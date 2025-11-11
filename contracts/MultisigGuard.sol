// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";

/**
 * @title MultisigGuard
 * @dev Contract for checking MPC or multisig approvals for supply chain operations
 */
contract MultisigGuard is AccessControl, ReentrancyGuard {
    using ECDSA for bytes32;

    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant APPROVER_ROLE = keccak256("APPROVER_ROLE");

    // Operation structure
    struct Operation {
        bytes32 operationHash;
        address[] approvers;
        mapping(address => bool) hasApproved;
        uint256 approvalCount;
        uint256 threshold;
        bool isExecuted;
        uint256 createdAt;
        uint256 executedAt;
    }

    // Key structure for MPC
    struct MPCKey {
        bytes publicKey;
        uint256 threshold;
        address[] authorizedParties;
        mapping(address => bool) isAuthorized;
        bool isActive;
        uint256 lastUsed;
    }

    // Mappings
    mapping(bytes32 => Operation) public operations;
    mapping(bytes32 => MPCKey) public mpcKeys;
    mapping(address => bytes32[]) public userOperations;
    mapping(bytes32 => mapping(address => bytes)) public signatures;

    // Events
    event OperationCreated(
        bytes32 indexed operationId,
        bytes32 operationHash,
        uint256 threshold,
        address creator
    );
    
    event OperationApproved(
        bytes32 indexed operationId,
        address indexed approver
    );
    
    event OperationExecuted(
        bytes32 indexed operationId,
        uint256 executedAt
    );
    
    event MPCKeyCreated(
        bytes32 indexed keyId,
        bytes publicKey,
        uint256 threshold
    );
    
    event PartyAuthorized(
        bytes32 indexed keyId,
        address indexed party
    );
    
    event PartyRevoked(
        bytes32 indexed keyId,
        address indexed party
    );

    constructor() {
        _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _setupRole(ADMIN_ROLE, msg.sender);
    }

    /**
     * @dev Create a new operation that requires multisig approval
     * @param operationHash Hash of the operation to be approved
     * @param threshold Number of approvals required
     * @param initialApprovers Initial list of approvers
     */
    function createOperation(
        bytes32 operationHash,
        uint256 threshold,
        address[] memory initialApprovers
    ) public onlyRole(APPROVER_ROLE) returns (bytes32) {
        require(threshold > 0, "Threshold must be greater than 0");
        require(threshold <= initialApprovers.length, "Threshold exceeds approver count");
        
        bytes32 operationId = keccak256(abi.encodePacked(operationHash, msg.sender, block.timestamp));
        
        Operation storage op = operations[operationId];
        op.operationHash = operationHash;
        op.threshold = threshold;
        op.approvalCount = 0;
        op.isExecuted = false;
        op.createdAt = block.timestamp;
        
        for (uint i = 0; i < initialApprovers.length; i++) {
            require(initialApprovers[i] != address(0), "Invalid approver address");
            op.approvers.push(initialApprovers[i]);
            userOperations[initialApprovers[i]].push(operationId);
        }
        
        emit OperationCreated(operationId, operationHash, threshold, msg.sender);
        
        return operationId;
    }

    /**
     * @dev Approve an operation
     * @param operationId ID of the operation
     * @param signature Signature for approval
     */
    function approveOperation(
        bytes32 operationId,
        bytes memory signature
    ) public onlyRole(APPROVER_ROLE) {
        Operation storage op = operations[operationId];
        require(op.createdAt > 0, "Operation does not exist");
        require(!op.isExecuted, "Operation already executed");
        require(!op.hasApproved[msg.sender], "Already approved");
        
        // Verify signature
        bytes32 messageHash = keccak256(abi.encodePacked(op.operationHash, op.createdAt));
        bytes32 ethSignedMessageHash = messageHash.toEthSignedMessageHash();
        address signer = ethSignedMessageHash.recover(signature);
        require(signer == msg.sender, "Invalid signature");
        
        op.hasApproved[msg.sender] = true;
        op.approvalCount++;
        
        signatures[operationId][msg.sender] = signature;
        
        emit OperationApproved(operationId, msg.sender);
        
        // Check if threshold is met
        if (op.approvalCount >= op.threshold) {
            op.isExecuted = true;
            op.executedAt = block.timestamp;
            emit OperationExecuted(operationId, block.timestamp);
        }
    }

    /**
     * @dev Create an MPC key
     * @param keyId ID for the key
     * @param publicKey Public key
     * @param threshold Threshold for approvals
     * @param initialParties Initial authorized parties
     */
    function createMPCKey(
        bytes32 keyId,
        bytes memory publicKey,
        uint256 threshold,
        address[] memory initialParties
    ) public onlyRole(ADMIN_ROLE) {
        require(threshold > 0, "Threshold must be greater than 0");
        require(threshold <= initialParties.length, "Threshold exceeds party count");
        require(mpcKeys[keyId].publicKey.length == 0, "Key already exists");
        
        MPCKey storage key = mpcKeys[keyId];
        key.publicKey = publicKey;
        key.threshold = threshold;
        key.isActive = true;
        key.lastUsed = block.timestamp;
        
        for (uint i = 0; i < initialParties.length; i++) {
            require(initialParties[i] != address(0), "Invalid party address");
            key.authorizedParties.push(initialParties[i]);
            key.isAuthorized[initialParties[i]] = true;
        }
        
        emit MPCKeyCreated(keyId, publicKey, threshold);
    }

    /**
     * @dev Authorize a party for an MPC key
     * @param keyId ID of the key
     * @param party Address of the party
     */
    function authorizeParty(
        bytes32 keyId,
        address party
    ) public onlyRole(ADMIN_ROLE) {
        require(mpcKeys[keyId].publicKey.length > 0, "Key does not exist");
        require(!mpcKeys[keyId].isAuthorized[party], "Party already authorized");
        require(party != address(0), "Invalid party address");
        
        mpcKeys[keyId].authorizedParties.push(party);
        mpcKeys[keyId].isAuthorized[party] = true;
        
        emit PartyAuthorized(keyId, party);
    }

    /**
     * @dev Revoke a party from an MPC key
     * @param keyId ID of the key
     * @param party Address of the party
     */
    function revokeParty(
        bytes32 keyId,
        address party
    ) public onlyRole(ADMIN_ROLE) {
        require(mpcKeys[keyId].publicKey.length > 0, "Key does not exist");
        require(mpcKeys[keyId].isAuthorized[party], "Party not authorized");
        
        mpcKeys[keyId].isAuthorized[party] = false;
        
        // Remove party from authorized parties array
        uint256 length = mpcKeys[keyId].authorizedParties.length;
        for (uint i = 0; i < length; i++) {
            if (mpcKeys[keyId].authorizedParties[i] == party) {
                mpcKeys[keyId].authorizedParties[i] = mpcKeys[keyId].authorizedParties[length - 1];
                mpcKeys[keyId].authorizedParties.pop();
                break;
            }
        }
        
        emit PartyRevoked(keyId, party);
    }

    /**
     * @dev Check if an operation is approved
     * @param operationId ID of the operation
     */
    function isApproved(bytes32 operationId) public view returns (bool) {
        Operation storage op = operations[operationId];
        return op.approvalCount >= op.threshold;
    }

    /**
     * @dev Get operation details
     * @param operationId ID of the operation
     */
    function getOperation(bytes32 operationId)
        public
        view
        returns (
            bytes32 operationHash,
            uint256 approvalCount,
            uint256 threshold,
            bool isExecuted,
            uint256 createdAt,
            uint256 executedAt
        )
    {
        Operation storage op = operations[operationId];
        require(op.createdAt > 0, "Operation does not exist");
        
        return (
            op.operationHash,
            op.approvalCount,
            op.threshold,
            op.isExecuted,
            op.createdAt,
            op.executedAt
        );
    }

    /**
     * @dev Get MPC key details
     * @param keyId ID of the key
     */
    function getMPCKey(bytes32 keyId)
        public
        view
        returns (
            bytes memory publicKey,
            uint256 threshold,
            address[] memory authorizedParties,
            bool isActive,
            uint256 lastUsed
        )
    {
        require(mpcKeys[keyId].publicKey.length > 0, "Key does not exist");
        
        return (
            mpcKeys[keyId].publicKey,
            mpcKeys[keyId].threshold,
            mpcKeys[keyId].authorizedParties,
            mpcKeys[keyId].isActive,
            mpcKeys[keyId].lastUsed
        );
    }

    /**
     * @dev Check if a party is authorized for an MPC key
     * @param keyId ID of the key
     * @param party Address of the party
     */
    function isAuthorizedForKey(bytes32 keyId, address party) public view returns (bool) {
        require(mpcKeys[keyId].publicKey.length > 0, "Key does not exist");
        return mpcKeys[keyId].isAuthorized[party];
    }
}