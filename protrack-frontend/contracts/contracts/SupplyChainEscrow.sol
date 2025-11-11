// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "./ProTrackNFT.sol";

/**
 * @title SupplyChainEscrow
 * @dev Automated escrow system with SLA enforcement and penalty mechanisms
 */
contract SupplyChainEscrow is ReentrancyGuard, AccessControl {
    using Counters for Counters.Counter;

    bytes32 public constant ORACLE_ROLE = keccak256("ORACLE_ROLE");
    bytes32 public constant ARBITRATOR_ROLE = keccak256("ARBITRATOR_ROLE");

    Counters.Counter private _escrowIdCounter;
    ProTrackNFT public immutable nftContract;

    enum EscrowStatus {
        CREATED,
        FUNDED,
        IN_TRANSIT,
        DELIVERED,
        COMPLETED,
        DISPUTED,
        CANCELLED,
        PENALTY_APPLIED
    }

    struct SLACondition {
        string conditionType; // "temperature", "humidity", "delivery_time", "location"
        int256 minValue;
        int256 maxValue;
        uint256 penaltyPercentage; // Basis points (100 = 1%)
        bool isActive;
    }

    struct EscrowData {
        uint256 tokenId;
        address buyer;
        address seller;
        uint256 totalAmount;
        uint256 penaltyAmount;
        uint256 createdAt;
        uint256 expectedDeliveryTime;
        EscrowStatus status;
        string deliveryLocation;
        bool autoRelease;
        mapping(string => SLACondition) slaConditions;
        string[] slaKeys;
    }

    struct Milestone {
        string description;
        uint256 amount;
        bool completed;
        uint256 completedAt;
        address completedBy;
    }

    struct Dispute {
        address initiator;
        string reason;
        uint256 createdAt;
        bool resolved;
        address arbitrator;
        string resolution;
    }

    // Mappings
    mapping(uint256 => EscrowData) public escrows;
    mapping(uint256 => Milestone[]) public escrowMilestones;
    mapping(uint256 => Dispute) public escrowDisputes;
    mapping(uint256 => mapping(string => int256[])) public slaViolations;

    // Events
    event EscrowCreated(uint256 indexed escrowId, uint256 indexed tokenId, address indexed buyer, address seller, uint256 amount);
    event EscrowFunded(uint256 indexed escrowId, uint256 amount);
    event MilestoneCompleted(uint256 indexed escrowId, uint256 milestoneIndex, address completedBy);
    event SLAViolation(uint256 indexed escrowId, string conditionType, int256 actualValue, uint256 penaltyAmount);
    event PenaltyApplied(uint256 indexed escrowId, uint256 penaltyAmount, string reason);
    event EscrowReleased(uint256 indexed escrowId, uint256 amount, address recipient);
    event DisputeCreated(uint256 indexed escrowId, address indexed initiator, string reason);
    event DisputeResolved(uint256 indexed escrowId, address indexed arbitrator, string resolution);

    constructor(address _nftContract) {
        nftContract = ProTrackNFT(_nftContract);
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ORACLE_ROLE, msg.sender);
        _grantRole(ARBITRATOR_ROLE, msg.sender);
    }

    /**
     * @dev Create new escrow with SLA conditions
     */
    function createEscrow(
        uint256 tokenId,
        address seller,
        uint256 expectedDeliveryTime,
        string memory deliveryLocation,
        bool autoRelease
    ) external payable returns (uint256) {
        require(msg.value > 0, "Escrow amount must be greater than 0");
        require(nftContract.ownerOf(tokenId) == seller, "Seller must own the NFT");
        require(expectedDeliveryTime > block.timestamp, "Delivery time must be in the future");

        uint256 escrowId = _escrowIdCounter.current();
        _escrowIdCounter.increment();

        EscrowData storage escrow = escrows[escrowId];
        escrow.tokenId = tokenId;
        escrow.buyer = msg.sender;
        escrow.seller = seller;
        escrow.totalAmount = msg.value;
        escrow.penaltyAmount = 0;
        escrow.createdAt = block.timestamp;
        escrow.expectedDeliveryTime = expectedDeliveryTime;
        escrow.status = EscrowStatus.FUNDED;
        escrow.deliveryLocation = deliveryLocation;
        escrow.autoRelease = autoRelease;

        emit EscrowCreated(escrowId, tokenId, msg.sender, seller, msg.value);
        emit EscrowFunded(escrowId, msg.value);

        return escrowId;
    }

    /**
     * @dev Add SLA condition to escrow
     */
    function addSLACondition(
        uint256 escrowId,
        string memory conditionType,
        int256 minValue,
        int256 maxValue,
        uint256 penaltyPercentage
    ) external {
        require(escrows[escrowId].buyer == msg.sender || escrows[escrowId].seller == msg.sender, "Not authorized");
        require(escrows[escrowId].status == EscrowStatus.FUNDED, "Escrow not in correct status");
        require(penaltyPercentage <= 10000, "Penalty cannot exceed 100%");

        EscrowData storage escrow = escrows[escrowId];
        
        if (escrow.slaConditions[conditionType].isActive == false) {
            escrow.slaKeys.push(conditionType);
        }

        escrow.slaConditions[conditionType] = SLACondition({
            conditionType: conditionType,
            minValue: minValue,
            maxValue: maxValue,
            penaltyPercentage: penaltyPercentage,
            isActive: true
        });
    }

    /**
     * @dev Add milestone to escrow
     */
    function addMilestone(
        uint256 escrowId,
        string memory description,
        uint256 amount
    ) external {
        require(escrows[escrowId].buyer == msg.sender || escrows[escrowId].seller == msg.sender, "Not authorized");
        require(escrows[escrowId].status == EscrowStatus.FUNDED, "Escrow not in correct status");

        escrowMilestones[escrowId].push(Milestone({
            description: description,
            amount: amount,
            completed: false,
            completedAt: 0,
            completedBy: address(0)
        }));
    }

    /**
     * @dev Start shipment (change status to IN_TRANSIT)
     */
    function startShipment(uint256 escrowId) external {
        require(escrows[escrowId].seller == msg.sender, "Only seller can start shipment");
        require(escrows[escrowId].status == EscrowStatus.FUNDED, "Escrow not funded");

        escrows[escrowId].status = EscrowStatus.IN_TRANSIT;
    }

    /**
     * @dev Complete milestone
     */
    function completeMilestone(uint256 escrowId, uint256 milestoneIndex) external {
        require(escrows[escrowId].seller == msg.sender || hasRole(ORACLE_ROLE, msg.sender), "Not authorized");
        require(milestoneIndex < escrowMilestones[escrowId].length, "Invalid milestone index");
        require(!escrowMilestones[escrowId][milestoneIndex].completed, "Milestone already completed");

        Milestone storage milestone = escrowMilestones[escrowId][milestoneIndex];
        milestone.completed = true;
        milestone.completedAt = block.timestamp;
        milestone.completedBy = msg.sender;

        emit MilestoneCompleted(escrowId, milestoneIndex, msg.sender);

        // Auto-release milestone payment if enabled
        if (escrows[escrowId].autoRelease) {
            _releaseMilestonePayment(escrowId, milestoneIndex);
        }
    }

    /**
     * @dev Report SLA violation (called by oracle)
     */
    function reportSLAViolation(
        uint256 escrowId,
        string memory conditionType,
        int256 actualValue
    ) external onlyRole(ORACLE_ROLE) {
        EscrowData storage escrow = escrows[escrowId];
        require(escrow.status == EscrowStatus.IN_TRANSIT, "Escrow not in transit");

        SLACondition storage condition = escrow.slaConditions[conditionType];
        require(condition.isActive, "SLA condition not active");

        bool violation = false;
        if (condition.minValue != 0 && actualValue < condition.minValue) {
            violation = true;
        }
        if (condition.maxValue != 0 && actualValue > condition.maxValue) {
            violation = true;
        }

        if (violation) {
            uint256 penaltyAmount = (escrow.totalAmount * condition.penaltyPercentage) / 10000;
            escrow.penaltyAmount += penaltyAmount;

            slaViolations[escrowId][conditionType].push(actualValue);

            emit SLAViolation(escrowId, conditionType, actualValue, penaltyAmount);
            emit PenaltyApplied(escrowId, penaltyAmount, string(abi.encodePacked("SLA violation: ", conditionType)));

            if (escrow.penaltyAmount >= escrow.totalAmount) {
                escrow.status = EscrowStatus.PENALTY_APPLIED;
            }
        }
    }

    /**
     * @dev Confirm delivery
     */
    function confirmDelivery(uint256 escrowId) external {
        require(escrows[escrowId].buyer == msg.sender, "Only buyer can confirm delivery");
        require(escrows[escrowId].status == EscrowStatus.IN_TRANSIT, "Escrow not in transit");

        escrows[escrowId].status = EscrowStatus.DELIVERED;

        if (escrows[escrowId].autoRelease) {
            _releasePayment(escrowId);
        }
    }

    /**
     * @dev Auto-confirm delivery after expected time (called by oracle)
     */
    function autoConfirmDelivery(uint256 escrowId) external onlyRole(ORACLE_ROLE) {
        require(escrows[escrowId].status == EscrowStatus.IN_TRANSIT, "Escrow not in transit");
        require(block.timestamp > escrows[escrowId].expectedDeliveryTime + 24 hours, "Too early for auto-confirm");

        escrows[escrowId].status = EscrowStatus.DELIVERED;

        if (escrows[escrowId].autoRelease) {
            _releasePayment(escrowId);
        }
    }

    /**
     * @dev Release payment to seller
     */
    function releasePayment(uint256 escrowId) external nonReentrant {
        require(
            escrows[escrowId].buyer == msg.sender || 
            hasRole(ARBITRATOR_ROLE, msg.sender),
            "Not authorized"
        );
        _releasePayment(escrowId);
    }

    /**
     * @dev Internal function to release payment
     */
    function _releasePayment(uint256 escrowId) internal {
        EscrowData storage escrow = escrows[escrowId];
        require(escrow.status == EscrowStatus.DELIVERED, "Delivery not confirmed");
        require(escrow.status != EscrowStatus.COMPLETED, "Already completed");

        uint256 paymentAmount = escrow.totalAmount - escrow.penaltyAmount;
        uint256 penaltyRefund = escrow.penaltyAmount;

        escrow.status = EscrowStatus.COMPLETED;

        // Transfer payment to seller
        if (paymentAmount > 0) {
            payable(escrow.seller).transfer(paymentAmount);
            emit EscrowReleased(escrowId, paymentAmount, escrow.seller);
        }

        // Refund penalty to buyer
        if (penaltyRefund > 0) {
            payable(escrow.buyer).transfer(penaltyRefund);
            emit EscrowReleased(escrowId, penaltyRefund, escrow.buyer);
        }
    }

    /**
     * @dev Release milestone payment
     */
    function _releaseMilestonePayment(uint256 escrowId, uint256 milestoneIndex) internal {
        Milestone storage milestone = escrowMilestones[escrowId][milestoneIndex];
        EscrowData storage escrow = escrows[escrowId];

        require(milestone.completed, "Milestone not completed");
        require(milestone.amount <= escrow.totalAmount, "Insufficient escrow balance");

        escrow.totalAmount -= milestone.amount;
        payable(escrow.seller).transfer(milestone.amount);

        emit EscrowReleased(escrowId, milestone.amount, escrow.seller);
    }

    /**
     * @dev Create dispute
     */
    function createDispute(uint256 escrowId, string memory reason) external {
        require(
            escrows[escrowId].buyer == msg.sender || 
            escrows[escrowId].seller == msg.sender,
            "Not authorized"
        );
        require(escrows[escrowId].status != EscrowStatus.COMPLETED, "Escrow already completed");
        require(!escrowDisputes[escrowId].resolved, "Dispute already exists");

        escrows[escrowId].status = EscrowStatus.DISPUTED;
        escrowDisputes[escrowId] = Dispute({
            initiator: msg.sender,
            reason: reason,
            createdAt: block.timestamp,
            resolved: false,
            arbitrator: address(0),
            resolution: ""
        });

        emit DisputeCreated(escrowId, msg.sender, reason);
    }

    /**
     * @dev Resolve dispute
     */
    function resolveDispute(
        uint256 escrowId,
        string memory resolution,
        uint256 buyerRefund,
        uint256 sellerPayment
    ) external onlyRole(ARBITRATOR_ROLE) nonReentrant {
        require(escrows[escrowId].status == EscrowStatus.DISPUTED, "No active dispute");
        require(buyerRefund + sellerPayment <= escrows[escrowId].totalAmount, "Invalid distribution");

        Dispute storage dispute = escrowDisputes[escrowId];
        dispute.resolved = true;
        dispute.arbitrator = msg.sender;
        dispute.resolution = resolution;

        escrows[escrowId].status = EscrowStatus.COMPLETED;

        // Distribute funds according to arbitration
        if (buyerRefund > 0) {
            payable(escrows[escrowId].buyer).transfer(buyerRefund);
            emit EscrowReleased(escrowId, buyerRefund, escrows[escrowId].buyer);
        }

        if (sellerPayment > 0) {
            payable(escrows[escrowId].seller).transfer(sellerPayment);
            emit EscrowReleased(escrowId, sellerPayment, escrows[escrowId].seller);
        }

        emit DisputeResolved(escrowId, msg.sender, resolution);
    }

    /**
     * @dev Cancel escrow (only if not started)
     */
    function cancelEscrow(uint256 escrowId) external nonReentrant {
        require(escrows[escrowId].buyer == msg.sender, "Only buyer can cancel");
        require(escrows[escrowId].status == EscrowStatus.FUNDED, "Cannot cancel after shipment started");

        escrows[escrowId].status = EscrowStatus.CANCELLED;
        payable(escrows[escrowId].buyer).transfer(escrows[escrowId].totalAmount);

        emit EscrowReleased(escrowId, escrows[escrowId].totalAmount, escrows[escrowId].buyer);
    }

    // View functions
    function getEscrowData(uint256 escrowId) external view returns (
        uint256 tokenId,
        address buyer,
        address seller,
        uint256 totalAmount,
        uint256 penaltyAmount,
        uint256 createdAt,
        uint256 expectedDeliveryTime,
        EscrowStatus status,
        string memory deliveryLocation,
        bool autoRelease
    ) {
        EscrowData storage escrow = escrows[escrowId];
        return (
            escrow.tokenId,
            escrow.buyer,
            escrow.seller,
            escrow.totalAmount,
            escrow.penaltyAmount,
            escrow.createdAt,
            escrow.expectedDeliveryTime,
            escrow.status,
            escrow.deliveryLocation,
            escrow.autoRelease
        );
    }

    function getSLACondition(uint256 escrowId, string memory conditionType) external view returns (SLACondition memory) {
        return escrows[escrowId].slaConditions[conditionType];
    }

    function getSLAKeys(uint256 escrowId) external view returns (string[] memory) {
        return escrows[escrowId].slaKeys;
    }

    function getMilestones(uint256 escrowId) external view returns (Milestone[] memory) {
        return escrowMilestones[escrowId];
    }

    function getDispute(uint256 escrowId) external view returns (Dispute memory) {
        return escrowDisputes[escrowId];
    }

    function getSLAViolations(uint256 escrowId, string memory conditionType) external view returns (int256[] memory) {
        return slaViolations[escrowId][conditionType];
    }

    function getCurrentEscrowId() external view returns (uint256) {
        return _escrowIdCounter.current();
    }
}
