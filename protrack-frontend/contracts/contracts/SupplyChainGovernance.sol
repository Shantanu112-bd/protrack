// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "./ProTrackNFT.sol";

/**
 * @title SupplyChainGovernance
 * @dev Multi-signature governance contract for supply chain operations
 */
contract SupplyChainGovernance is AccessControl, ReentrancyGuard {
    using Counters for Counters.Counter;

    bytes32 public constant GOVERNOR_ROLE = keccak256("GOVERNOR_ROLE");
    bytes32 public constant PROPOSER_ROLE = keccak256("PROPOSER_ROLE");
    bytes32 public constant EXECUTOR_ROLE = keccak256("EXECUTOR_ROLE");

    ProTrackNFT public immutable nftContract;
    Counters.Counter private _proposalIdCounter;

    enum ProposalType {
        PRODUCT_RECALL,
        QUALITY_STANDARD_UPDATE,
        SUPPLIER_CERTIFICATION,
        EMERGENCY_HALT,
        PARAMETER_UPDATE,
        ROLE_ASSIGNMENT,
        CUSTOM
    }

    enum ProposalStatus {
        PENDING,
        ACTIVE,
        SUCCEEDED,
        DEFEATED,
        EXECUTED,
        CANCELLED,
        EXPIRED
    }

    struct Proposal {
        uint256 id;
        address proposer;
        ProposalType proposalType;
        string title;
        string description;
        bytes executionData;
        uint256 createdAt;
        uint256 votingStartTime;
        uint256 votingEndTime;
        uint256 executionTime;
        ProposalStatus status;
        uint256 forVotes;
        uint256 againstVotes;
        uint256 abstainVotes;
        bool executed;
        mapping(address => bool) hasVoted;
        mapping(address => uint8) votes; // 0: Against, 1: For, 2: Abstain
    }

    struct RecallProposal {
        uint256 proposalId;
        uint256[] tokenIds;
        string reason;
        string[] affectedBatches;
        address[] notifyAddresses;
        bool emergencyRecall;
        uint256 compensationAmount;
    }

    struct QualityStandardUpdate {
        uint256 proposalId;
        string standardName;
        string newRequirements;
        uint256 effectiveDate;
        string[] affectedCategories;
    }

    struct SupplierCertification {
        uint256 proposalId;
        address supplier;
        string certificationType;
        bool isApproval; // true for approval, false for revocation
        string evidence;
        uint256 validUntil;
    }

    // Mappings
    mapping(uint256 => Proposal) public proposals;
    mapping(uint256 => RecallProposal) public recallProposals;
    mapping(uint256 => QualityStandardUpdate) public qualityStandardUpdates;
    mapping(uint256 => SupplierCertification) public supplierCertifications;
    mapping(address => uint256) public votingPower;
    mapping(address => bool) public certifiedSuppliers;
    mapping(string => string) public qualityStandards;

    // Governance parameters
    uint256 public votingDelay = 1 days;
    uint256 public votingPeriod = 7 days;
    uint256 public proposalThreshold = 1; // Minimum voting power to create proposal
    uint256 public quorumPercentage = 25; // 25% quorum required
    uint256 public totalVotingPower;

    // Events
    event ProposalCreated(uint256 indexed proposalId, address indexed proposer, ProposalType proposalType, string title);
    event VoteCast(uint256 indexed proposalId, address indexed voter, uint8 support, uint256 weight);
    event ProposalExecuted(uint256 indexed proposalId, address indexed executor);
    event ProposalCancelled(uint256 indexed proposalId, address indexed canceller);
    event RecallInitiated(uint256 indexed proposalId, uint256[] tokenIds, string reason);
    event QualityStandardUpdated(string indexed standardName, string newRequirements);
    event SupplierCertificationChanged(address indexed supplier, string certificationType, bool approved);
    event VotingPowerUpdated(address indexed account, uint256 newPower);
    event GovernanceParameterUpdated(string parameter, uint256 newValue);

    constructor(address _nftContract) {
        nftContract = ProTrackNFT(_nftContract);
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(GOVERNOR_ROLE, msg.sender);
        _grantRole(PROPOSER_ROLE, msg.sender);
        _grantRole(EXECUTOR_ROLE, msg.sender);
        
        // Initial voting power for deployer
        votingPower[msg.sender] = 100;
        totalVotingPower = 100;
    }

    /**
     * @dev Create a new proposal
     */
    function propose(
        ProposalType proposalType,
        string memory title,
        string memory description,
        bytes memory executionData
    ) external returns (uint256) {
        require(hasRole(PROPOSER_ROLE, msg.sender), "Not authorized to propose");
        require(votingPower[msg.sender] >= proposalThreshold, "Insufficient voting power");

        uint256 proposalId = _proposalIdCounter.current();
        _proposalIdCounter.increment();

        Proposal storage proposal = proposals[proposalId];
        proposal.id = proposalId;
        proposal.proposer = msg.sender;
        proposal.proposalType = proposalType;
        proposal.title = title;
        proposal.description = description;
        proposal.executionData = executionData;
        proposal.createdAt = block.timestamp;
        proposal.votingStartTime = block.timestamp + votingDelay;
        proposal.votingEndTime = block.timestamp + votingDelay + votingPeriod;
        proposal.status = ProposalStatus.PENDING;

        emit ProposalCreated(proposalId, msg.sender, proposalType, title);
        return proposalId;
    }

    /**
     * @dev Create product recall proposal
     */
    function proposeRecall(
        uint256[] memory tokenIds,
        string memory reason,
        string[] memory affectedBatches,
        address[] memory notifyAddresses,
        bool emergencyRecall,
        uint256 compensationAmount
    ) external returns (uint256) {
        bytes memory executionData = abi.encode(tokenIds, reason, affectedBatches, notifyAddresses, emergencyRecall, compensationAmount);
        uint256 proposalId = this.propose(ProposalType.PRODUCT_RECALL, "Product Recall", reason, executionData);

        recallProposals[proposalId] = RecallProposal({
            proposalId: proposalId,
            tokenIds: tokenIds,
            reason: reason,
            affectedBatches: affectedBatches,
            notifyAddresses: notifyAddresses,
            emergencyRecall: emergencyRecall,
            compensationAmount: compensationAmount
        });

        // Emergency recalls have shorter voting period
        if (emergencyRecall) {
            proposals[proposalId].votingEndTime = block.timestamp + votingDelay + 1 days;
        }

        return proposalId;
    }

    /**
     * @dev Create quality standard update proposal
     */
    function proposeQualityStandardUpdate(
        string memory standardName,
        string memory newRequirements,
        uint256 effectiveDate,
        string[] memory affectedCategories
    ) external returns (uint256) {
        bytes memory executionData = abi.encode(standardName, newRequirements, effectiveDate, affectedCategories);
        uint256 proposalId = this.propose(ProposalType.QUALITY_STANDARD_UPDATE, "Quality Standard Update", newRequirements, executionData);

        qualityStandardUpdates[proposalId] = QualityStandardUpdate({
            proposalId: proposalId,
            standardName: standardName,
            newRequirements: newRequirements,
            effectiveDate: effectiveDate,
            affectedCategories: affectedCategories
        });

        return proposalId;
    }

    /**
     * @dev Create supplier certification proposal
     */
    function proposeSupplierCertification(
        address supplier,
        string memory certificationType,
        bool isApproval,
        string memory evidence,
        uint256 validUntil
    ) external returns (uint256) {
        bytes memory executionData = abi.encode(supplier, certificationType, isApproval, evidence, validUntil);
        string memory title = isApproval ? "Approve Supplier Certification" : "Revoke Supplier Certification";
        uint256 proposalId = this.propose(ProposalType.SUPPLIER_CERTIFICATION, title, evidence, executionData);

        supplierCertifications[proposalId] = SupplierCertification({
            proposalId: proposalId,
            supplier: supplier,
            certificationType: certificationType,
            isApproval: isApproval,
            evidence: evidence,
            validUntil: validUntil
        });

        return proposalId;
    }

    /**
     * @dev Cast vote on proposal
     */
    function castVote(uint256 proposalId, uint8 support) external {
        require(support <= 2, "Invalid vote type");
        _castVote(proposalId, msg.sender, support);
    }

    /**
     * @dev Cast vote with reason
     */
    function castVoteWithReason(uint256 proposalId, uint8 support, string memory reason) external {
        require(support <= 2, "Invalid vote type");
        _castVote(proposalId, msg.sender, support);
        // Reason could be stored in a separate mapping if needed
    }

    /**
     * @dev Internal vote casting function
     */
    function _castVote(uint256 proposalId, address voter, uint8 support) internal {
        Proposal storage proposal = proposals[proposalId];
        require(proposal.status == ProposalStatus.ACTIVE || 
                (proposal.status == ProposalStatus.PENDING && block.timestamp >= proposal.votingStartTime), 
                "Voting not active");
        require(block.timestamp <= proposal.votingEndTime, "Voting period ended");
        require(!proposal.hasVoted[voter], "Already voted");
        require(votingPower[voter] > 0, "No voting power");

        proposal.hasVoted[voter] = true;
        proposal.votes[voter] = support;

        uint256 weight = votingPower[voter];

        if (support == 0) {
            proposal.againstVotes += weight;
        } else if (support == 1) {
            proposal.forVotes += weight;
        } else {
            proposal.abstainVotes += weight;
        }

        // Update proposal status to active if it was pending
        if (proposal.status == ProposalStatus.PENDING) {
            proposal.status = ProposalStatus.ACTIVE;
        }

        emit VoteCast(proposalId, voter, support, weight);

        // Check if proposal can be executed early (unanimous approval)
        if (proposal.forVotes > (totalVotingPower * 75) / 100) {
            proposal.status = ProposalStatus.SUCCEEDED;
        }
    }

    /**
     * @dev Execute proposal
     */
    function execute(uint256 proposalId) external nonReentrant {
        require(hasRole(EXECUTOR_ROLE, msg.sender), "Not authorized to execute");
        
        Proposal storage proposal = proposals[proposalId];
        require(proposal.status == ProposalStatus.SUCCEEDED || 
                (block.timestamp > proposal.votingEndTime && _isProposalSuccessful(proposalId)), 
                "Proposal not ready for execution");
        require(!proposal.executed, "Already executed");

        proposal.executed = true;
        proposal.status = ProposalStatus.EXECUTED;
        proposal.executionTime = block.timestamp;

        // Execute based on proposal type
        if (proposal.proposalType == ProposalType.PRODUCT_RECALL) {
            _executeRecall(proposalId);
        } else if (proposal.proposalType == ProposalType.QUALITY_STANDARD_UPDATE) {
            _executeQualityStandardUpdate(proposalId);
        } else if (proposal.proposalType == ProposalType.SUPPLIER_CERTIFICATION) {
            _executeSupplierCertification(proposalId);
        }

        emit ProposalExecuted(proposalId, msg.sender);
    }

    /**
     * @dev Execute product recall
     */
    function _executeRecall(uint256 proposalId) internal {
        RecallProposal storage recall = recallProposals[proposalId];
        
        // Mark products as recalled in NFT contract
        for (uint256 i = 0; i < recall.tokenIds.length; i++) {
            nftContract.updateProductStatus(recall.tokenIds[i], false, recall.reason);
        }

        emit RecallInitiated(proposalId, recall.tokenIds, recall.reason);
    }

    /**
     * @dev Execute quality standard update
     */
    function _executeQualityStandardUpdate(uint256 proposalId) internal {
        QualityStandardUpdate storage update = qualityStandardUpdates[proposalId];
        qualityStandards[update.standardName] = update.newRequirements;

        emit QualityStandardUpdated(update.standardName, update.newRequirements);
    }

    /**
     * @dev Execute supplier certification
     */
    function _executeSupplierCertification(uint256 proposalId) internal {
        SupplierCertification storage cert = supplierCertifications[proposalId];
        certifiedSuppliers[cert.supplier] = cert.isApproval;

        if (cert.isApproval) {
            // Grant supplier role in NFT contract
            nftContract.grantRole(nftContract.MINTER_ROLE(), cert.supplier);
        } else {
            // Revoke supplier role
            nftContract.revokeRole(nftContract.MINTER_ROLE(), cert.supplier);
        }

        emit SupplierCertificationChanged(cert.supplier, cert.certificationType, cert.isApproval);
    }

    /**
     * @dev Cancel proposal
     */
    function cancel(uint256 proposalId) external {
        Proposal storage proposal = proposals[proposalId];
        require(
            msg.sender == proposal.proposer || 
            hasRole(GOVERNOR_ROLE, msg.sender),
            "Not authorized to cancel"
        );
        require(proposal.status != ProposalStatus.EXECUTED, "Cannot cancel executed proposal");

        proposal.status = ProposalStatus.CANCELLED;
        emit ProposalCancelled(proposalId, msg.sender);
    }

    /**
     * @dev Update voting power for an account
     */
    function updateVotingPower(address account, uint256 newPower) external onlyRole(GOVERNOR_ROLE) {
        uint256 oldPower = votingPower[account];
        votingPower[account] = newPower;
        totalVotingPower = totalVotingPower - oldPower + newPower;

        emit VotingPowerUpdated(account, newPower);
    }

    /**
     * @dev Update governance parameters
     */
    function updateGovernanceParameter(string memory parameter, uint256 newValue) external onlyRole(GOVERNOR_ROLE) {
        bytes32 paramHash = keccak256(bytes(parameter));
        
        if (paramHash == keccak256("votingDelay")) {
            votingDelay = newValue;
        } else if (paramHash == keccak256("votingPeriod")) {
            votingPeriod = newValue;
        } else if (paramHash == keccak256("proposalThreshold")) {
            proposalThreshold = newValue;
        } else if (paramHash == keccak256("quorumPercentage")) {
            require(newValue <= 100, "Invalid quorum percentage");
            quorumPercentage = newValue;
        }

        emit GovernanceParameterUpdated(parameter, newValue);
    }

    // View functions
    function getProposal(uint256 proposalId) external view returns (
        uint256 id,
        address proposer,
        ProposalType proposalType,
        string memory title,
        string memory description,
        uint256 createdAt,
        uint256 votingStartTime,
        uint256 votingEndTime,
        ProposalStatus status,
        uint256 forVotes,
        uint256 againstVotes,
        uint256 abstainVotes,
        bool executed
    ) {
        Proposal storage proposal = proposals[proposalId];
        return (
            proposal.id,
            proposal.proposer,
            proposal.proposalType,
            proposal.title,
            proposal.description,
            proposal.createdAt,
            proposal.votingStartTime,
            proposal.votingEndTime,
            proposal.status,
            proposal.forVotes,
            proposal.againstVotes,
            proposal.abstainVotes,
            proposal.executed
        );
    }

    function hasVoted(uint256 proposalId, address voter) external view returns (bool) {
        return proposals[proposalId].hasVoted[voter];
    }

    function getVote(uint256 proposalId, address voter) external view returns (uint8) {
        return proposals[proposalId].votes[voter];
    }

    function getRecallProposal(uint256 proposalId) external view returns (RecallProposal memory) {
        return recallProposals[proposalId];
    }

    function getQualityStandardUpdate(uint256 proposalId) external view returns (QualityStandardUpdate memory) {
        return qualityStandardUpdates[proposalId];
    }

    function getSupplierCertification(uint256 proposalId) external view returns (SupplierCertification memory) {
        return supplierCertifications[proposalId];
    }

    function getCurrentProposalId() external view returns (uint256) {
        return _proposalIdCounter.current();
    }

    function getQuorum() public view returns (uint256) {
        return (totalVotingPower * quorumPercentage) / 100;
    }

    function _isProposalSuccessful(uint256 proposalId) internal view returns (bool) {
        Proposal storage proposal = proposals[proposalId];
        uint256 totalVotes = proposal.forVotes + proposal.againstVotes + proposal.abstainVotes;
        
        // Check quorum
        if (totalVotes < getQuorum()) {
            return false;
        }

        // Check majority
        return proposal.forVotes > proposal.againstVotes;
    }

    function getProposalState(uint256 proposalId) external view returns (ProposalStatus) {
        Proposal storage proposal = proposals[proposalId];
        
        if (proposal.status == ProposalStatus.EXECUTED || 
            proposal.status == ProposalStatus.CANCELLED) {
            return proposal.status;
        }

        if (block.timestamp <= proposal.votingStartTime) {
            return ProposalStatus.PENDING;
        }

        if (block.timestamp <= proposal.votingEndTime) {
            return ProposalStatus.ACTIVE;
        }

        if (block.timestamp > proposal.votingEndTime + 14 days) {
            return ProposalStatus.EXPIRED;
        }

        return _isProposalSuccessful(proposalId) ? ProposalStatus.SUCCEEDED : ProposalStatus.DEFEATED;
    }
}
