// ProTrack.sol ABI - Main unified smart contract
// This ABI matches the actual ProTrack.sol contract functions

export const ProTrack_ABI = [
  // Events
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: "tokenId", type: "uint256" },
      { indexed: true, name: "manufacturer", type: "address" },
      { indexed: false, name: "batchId", type: "string" },
    ],
    name: "ProductCreated",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: "tokenId", type: "uint256" },
      { indexed: false, name: "status", type: "uint8" },
      { indexed: true, name: "updatedBy", type: "address" },
    ],
    name: "ProductStatusUpdated",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: "shipmentId", type: "uint256" },
      { indexed: true, name: "tokenId", type: "uint256" },
      { indexed: true, name: "from", type: "address" },
      { indexed: false, name: "to", type: "address" },
    ],
    name: "ShipmentCreated",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: "tokenId", type: "uint256" },
      { indexed: false, name: "sensorType", type: "uint8" },
      { indexed: false, name: "value", type: "int256" },
      { indexed: false, name: "timestamp", type: "uint256" },
    ],
    name: "IoTDataRecorded",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: "tokenId", type: "uint256" },
      { indexed: false, name: "status", type: "uint8" },
      { indexed: true, name: "inspector", type: "address" },
    ],
    name: "QualityChecked",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: "tokenId", type: "uint256" },
      { indexed: false, name: "status", type: "uint8" },
      { indexed: true, name: "reviewer", type: "address" },
    ],
    name: "ComplianceReviewed",
    type: "event",
  },

  // Main Functions
  {
    inputs: [
      { name: "to", type: "address" },
      { name: "name", type: "string" },
      { name: "sku", type: "string" },
      { name: "batchId", type: "string" },
      { name: "category", type: "string" },
      { name: "expiryDate", type: "uint128" },
      { name: "weight", type: "uint256" },
      { name: "price", type: "uint256" },
      { name: "currency", type: "string" },
      { name: "currentLocation", type: "string" },
      { name: "tokenURI", type: "string" },
    ],
    name: "createProduct",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { name: "tokenId", type: "uint256" },
      { name: "from", type: "address" },
      { name: "to", type: "address" },
      { name: "fromLocation", type: "string" },
      { name: "toLocation", type: "string" },
      { name: "estimatedCost", type: "uint256" },
      { name: "estimatedDelivery", type: "uint128" },
    ],
    name: "createShipment",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { name: "tokenId", type: "uint256" },
      { name: "sensorType", type: "uint8" },
      { name: "value", type: "int256" },
      { name: "unit", type: "string" },
      { name: "location", type: "string" },
    ],
    name: "recordIoTData",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { name: "tokenId", type: "uint256" },
      { name: "status", type: "uint8" },
      { name: "reportCID", type: "string" },
      { name: "notes", type: "string" },
    ],
    name: "performQualityCheck",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { name: "tokenId", type: "uint256" },
      { name: "status", type: "uint8" },
      { name: "certificateCID", type: "string" },
      { name: "notes", type: "string" },
      { name: "expiryDate", type: "uint128" },
    ],
    name: "reviewCompliance",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ name: "tokenId", type: "uint256" }],
    name: "getProduct",
    outputs: [
      { name: "name", type: "string" },
      { name: "sku", type: "string" },
      { name: "batchId", type: "string" },
      { name: "category", type: "string" },
      { name: "manufacturer", type: "address" },
      { name: "createdAt", type: "uint128" },
      { name: "expiryDate", type: "uint128" },
      { name: "lastUpdated", type: "uint128" },
      { name: "weight", type: "uint256" },
      { name: "price", type: "uint256" },
      { name: "currency", type: "string" },
      { name: "currentLocation", type: "string" },
      { name: "currentCustodian", type: "address" },
      { name: "status", type: "uint8" },
      { name: "qualityStatus", type: "uint8" },
      { name: "complianceStatus", type: "uint8" },
      { name: "isRecalled", type: "bool" },
      { name: "isSoulbound", type: "bool" },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ name: "shipmentId", type: "uint256" }],
    name: "getShipment",
    outputs: [
      { name: "id", type: "uint256" },
      { name: "tokenId", type: "uint256" },
      { name: "from", type: "address" },
      { name: "to", type: "address" },
      { name: "fromLocation", type: "string" },
      { name: "toLocation", type: "string" },
      { name: "status", type: "uint8" },
      { name: "requestedAt", type: "uint128" },
      { name: "estimatedDelivery", type: "uint128" },
      { name: "actualDelivery", type: "uint128" },
      { name: "estimatedCost", type: "uint256" },
      { name: "actualCost", type: "uint256" },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { name: "tokenId", type: "uint256" },
      { name: "offset", type: "uint256" },
      { name: "limit", type: "uint256" },
    ],
    name: "getIoTData",
    outputs: [
      {
        name: "",
        type: "tuple[]",
        components: [
          { name: "id", type: "uint256" },
          { name: "tokenId", type: "uint256" },
          { name: "sensorType", type: "uint8" },
          { name: "value", type: "int256" },
          { name: "unit", type: "string" },
          { name: "timestamp", type: "uint128" },
          { name: "location", type: "string" },
          { name: "submitter", type: "address" },
        ],
      },
      { name: "total", type: "uint256" },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getCurrentAnalytics",
    outputs: [
      { name: "totalProducts", type: "uint256" },
      { name: "activeShipments", type: "uint256" },
      { name: "completedShipments", type: "uint256" },
      { name: "qualityChecksPassed", type: "uint256" },
      { name: "qualityChecksFailed", type: "uint256" },
      { name: "complianceApproved", type: "uint256" },
      { name: "complianceRejected", type: "uint256" },
      { name: "onTimeShipments", type: "uint256" },
      { name: "delayedShipments", type: "uint256" },
      { name: "totalIoTDataPoints", type: "uint256" },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ name: "tokenId", type: "uint256" }],
    name: "ownerOf",
    outputs: [{ name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ name: "tokenId", type: "uint256" }],
    name: "tokenURI",
    outputs: [{ name: "", type: "string" }],
    stateMutability: "view",
    type: "function",
  },
];

// Legacy ABI for backward compatibility
export const ProTrackNFT_ABI = ProTrack_ABI;

export const SupplyChainEscrow_ABI = [
  // Events
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: "escrowId", type: "uint256" },
      { indexed: true, name: "tokenId", type: "uint256" },
      { indexed: true, name: "buyer", type: "address" },
      { indexed: false, name: "seller", type: "address" },
      { indexed: false, name: "amount", type: "uint256" },
    ],
    name: "EscrowCreated",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: "escrowId", type: "uint256" },
      { indexed: false, name: "conditionType", type: "string" },
      { indexed: false, name: "actualValue", type: "int256" },
      { indexed: false, name: "penaltyAmount", type: "uint256" },
    ],
    name: "SLAViolation",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: "escrowId", type: "uint256" },
      { indexed: false, name: "amount", type: "uint256" },
      { indexed: false, name: "recipient", type: "address" },
    ],
    name: "EscrowReleased",
    type: "event",
  },

  // Main Functions
  {
    inputs: [
      { name: "tokenId", type: "uint256" },
      { name: "seller", type: "address" },
      { name: "expectedDeliveryTime", type: "uint256" },
      { name: "deliveryLocation", type: "string" },
      { name: "autoRelease", type: "bool" },
    ],
    name: "createEscrow",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [
      { name: "escrowId", type: "uint256" },
      { name: "conditionType", type: "string" },
      { name: "minValue", type: "int256" },
      { name: "maxValue", type: "int256" },
      { name: "penaltyPercentage", type: "uint256" },
    ],
    name: "addSLACondition",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ name: "escrowId", type: "uint256" }],
    name: "confirmDelivery",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ name: "escrowId", type: "uint256" }],
    name: "releasePayment",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ name: "escrowId", type: "uint256" }],
    name: "getEscrowData",
    outputs: [
      { name: "tokenId", type: "uint256" },
      { name: "buyer", type: "address" },
      { name: "seller", type: "address" },
      { name: "totalAmount", type: "uint256" },
      { name: "penaltyAmount", type: "uint256" },
      { name: "createdAt", type: "uint256" },
      { name: "expectedDeliveryTime", type: "uint256" },
      { name: "status", type: "uint8" },
      { name: "deliveryLocation", type: "string" },
      { name: "autoRelease", type: "bool" },
    ],
    stateMutability: "view",
    type: "function",
  },
];

export const IoTOracle_ABI = [
  // Events
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: "deviceId", type: "string" },
      { indexed: true, name: "owner", type: "address" },
      { indexed: false, name: "supportedSensors", type: "uint8[]" },
    ],
    name: "DeviceRegistered",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: "dataPointId", type: "uint256" },
      { indexed: true, name: "deviceId", type: "string" },
      { indexed: false, name: "sensorType", type: "uint8" },
      { indexed: false, name: "value", type: "int256" },
    ],
    name: "DataPointSubmitted",
    type: "event",
  },

  // Main Functions
  {
    inputs: [
      { name: "deviceId", type: "string" },
      { name: "owner", type: "address" },
      { name: "supportedSensors", type: "uint8[]" },
      { name: "location", type: "string" },
      { name: "metadata", type: "string" },
    ],
    name: "registerDevice",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { name: "deviceId", type: "string" },
      { name: "sensorType", type: "uint8" },
      { name: "value", type: "int256" },
      { name: "unit", type: "string" },
      { name: "location", type: "string" },
      { name: "metadata", type: "string" },
    ],
    name: "submitDataPoint",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ name: "deviceId", type: "string" }],
    name: "getDevice",
    outputs: [
      { name: "deviceId", type: "string" },
      { name: "owner", type: "address" },
      { name: "supportedSensors", type: "uint8[]" },
      { name: "isActive", type: "bool" },
      { name: "registeredAt", type: "uint256" },
      { name: "location", type: "string" },
      { name: "metadata", type: "string" },
      { name: "lastDataSubmission", type: "uint256" },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ name: "dataPointId", type: "uint256" }],
    name: "getDataPoint",
    outputs: [
      { name: "id", type: "uint256" },
      { name: "deviceId", type: "string" },
      { name: "sensorType", type: "uint8" },
      { name: "value", type: "int256" },
      { name: "unit", type: "string" },
      { name: "timestamp", type: "uint256" },
      { name: "location", type: "string" },
      { name: "submitter", type: "address" },
      { name: "status", type: "uint8" },
      { name: "verifiedAt", type: "uint256" },
      { name: "verifier", type: "address" },
      { name: "metadata", type: "string" },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ name: "deviceId", type: "string" }],
    name: "getDeviceDataPoints",
    outputs: [{ name: "", type: "uint256[]" }],
    stateMutability: "view",
    type: "function",
  },
];

export const SupplyChainGovernance_ABI = [
  // Events
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: "proposalId", type: "uint256" },
      { indexed: true, name: "proposer", type: "address" },
      { indexed: false, name: "proposalType", type: "uint8" },
      { indexed: false, name: "title", type: "string" },
    ],
    name: "ProposalCreated",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: "proposalId", type: "uint256" },
      { indexed: true, name: "voter", type: "address" },
      { indexed: false, name: "support", type: "uint8" },
      { indexed: false, name: "weight", type: "uint256" },
    ],
    name: "VoteCast",
    type: "event",
  },

  // Main Functions
  {
    inputs: [
      { name: "proposalType", type: "uint8" },
      { name: "title", type: "string" },
      { name: "description", type: "string" },
      { name: "executionData", type: "bytes" },
    ],
    name: "propose",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { name: "tokenIds", type: "uint256[]" },
      { name: "reason", type: "string" },
      { name: "affectedBatches", type: "string[]" },
      { name: "notifyAddresses", type: "address[]" },
      { name: "emergencyRecall", type: "bool" },
      { name: "compensationAmount", type: "uint256" },
    ],
    name: "proposeRecall",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { name: "proposalId", type: "uint256" },
      { name: "support", type: "uint8" },
    ],
    name: "castVote",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ name: "proposalId", type: "uint256" }],
    name: "execute",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ name: "proposalId", type: "uint256" }],
    name: "getProposal",
    outputs: [
      { name: "id", type: "uint256" },
      { name: "proposer", type: "address" },
      { name: "proposalType", type: "uint8" },
      { name: "title", type: "string" },
      { name: "description", type: "string" },
      { name: "createdAt", type: "uint256" },
      { name: "votingStartTime", type: "uint256" },
      { name: "votingEndTime", type: "uint256" },
      { name: "status", type: "uint8" },
      { name: "forVotes", type: "uint256" },
      { name: "againstVotes", type: "uint256" },
      { name: "abstainVotes", type: "uint256" },
      { name: "executed", type: "bool" },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ name: "proposalId", type: "uint256" }],
    name: "getProposalState",
    outputs: [{ name: "", type: "uint8" }],
    stateMutability: "view",
    type: "function",
  },
];

// ABI mapping for easy access
export const CONTRACT_ABIS = {
  ProTrack: ProTrack_ABI,
  ProTrackNFT: ProTrackNFT_ABI,
  SupplyChainEscrow: SupplyChainEscrow_ABI,
  IoTOracle: IoTOracle_ABI,
  SupplyChainGovernance: SupplyChainGovernance_ABI,
};

// Enum mappings for better type safety (matching ProTrack.sol)
export const SensorType = {
  TEMPERATURE: 0,
  HUMIDITY: 1,
  PRESSURE: 2,
  VIBRATION: 3,
  LIGHT: 4,
  GPS: 5,
  RFID: 6,
  CUSTOM: 7,
} as const;

export const ProductStatus = {
  CREATED: 0,
  IN_PRODUCTION: 1,
  QUALITY_CHECKED: 2,
  COMPLIANCE_APPROVED: 3,
  READY_FOR_SHIPMENT: 4,
  IN_TRANSIT: 5,
  DELIVERED: 6,
  RECALLED: 7,
} as const;

export const QualityStatus = {
  PENDING: 0,
  PASSED: 1,
  FAILED: 2,
  REQUIRES_RETEST: 3,
} as const;

export const ComplianceStatus = {
  PENDING: 0,
  APPROVED: 1,
  REJECTED: 2,
  EXPIRED: 3,
} as const;

export const ShipmentStatus = {
  REQUESTED: 0,
  CONFIRMED: 1,
  IN_TRANSIT: 2,
  DELIVERED: 3,
  CANCELLED: 4,
} as const;

export const EscrowStatus = {
  CREATED: 0,
  FUNDED: 1,
  IN_TRANSIT: 2,
  DELIVERED: 3,
  COMPLETED: 4,
  DISPUTED: 5,
  CANCELLED: 6,
  PENALTY_APPLIED: 7,
} as const;

export const ProposalStatus = {
  PENDING: 0,
  ACTIVE: 1,
  SUCCEEDED: 2,
  DEFEATED: 3,
  EXECUTED: 4,
  CANCELLED: 5,
  EXPIRED: 6,
} as const;

export const ProposalType = {
  PRODUCT_RECALL: 0,
  QUALITY_STANDARD_UPDATE: 1,
  SUPPLIER_CERTIFICATION: 2,
  EMERGENCY_HALT: 3,
  PARAMETER_UPDATE: 4,
  ROLE_ASSIGNMENT: 5,
  CUSTOM: 6,
} as const;
