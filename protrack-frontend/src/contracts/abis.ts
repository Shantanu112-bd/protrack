// Smart Contract ABIs for ProTrack
// These ABIs are simplified versions focusing on the main functions used by the frontend

export const ProTrackNFT_ABI = [
  // Events
  {
    "anonymous": false,
    "inputs": [
      {"indexed": true, "name": "tokenId", "type": "uint256"},
      {"indexed": false, "name": "batchId", "type": "string"},
      {"indexed": true, "name": "manufacturer", "type": "address"}
    ],
    "name": "ProductMinted",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {"indexed": true, "name": "tokenId", "type": "uint256"},
      {"indexed": false, "name": "eventType", "type": "string"},
      {"indexed": true, "name": "actor", "type": "address"}
    ],
    "name": "SupplyChainEventAdded",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {"indexed": true, "name": "tokenId", "type": "uint256"},
      {"indexed": true, "name": "inspector", "type": "address"},
      {"indexed": false, "name": "passed", "type": "bool"}
    ],
    "name": "QualityCheckAdded",
    "type": "event"
  },
  
  // Main Functions
  {
    "inputs": [
      {"name": "to", "type": "address"},
      {"name": "tokenURI", "type": "string"},
      {"name": "productData", "type": "tuple", "components": [
        {"name": "name", "type": "string"},
        {"name": "sku", "type": "string"},
        {"name": "manufacturer", "type": "address"},
        {"name": "createdAt", "type": "uint256"},
        {"name": "batchId", "type": "string"},
        {"name": "category", "type": "string"},
        {"name": "expiryDate", "type": "uint256"},
        {"name": "isActive", "type": "bool"},
        {"name": "currentValue", "type": "uint256"},
        {"name": "currentLocation", "type": "string"}
      ]}
    ],
    "name": "mintProduct",
    "outputs": [{"name": "", "type": "uint256"}],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {"name": "tokenId", "type": "uint256"},
      {"name": "eventType", "type": "string"},
      {"name": "description", "type": "string"},
      {"name": "location", "type": "string"},
      {"name": "data", "type": "string"}
    ],
    "name": "addSupplyChainEvent",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {"name": "tokenId", "type": "uint256"},
      {"name": "checkType", "type": "string"},
      {"name": "passed", "type": "bool"},
      {"name": "notes", "type": "string"},
      {"name": "testResults", "type": "string[]"}
    ],
    "name": "addQualityCheck",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"name": "tokenId", "type": "uint256"}],
    "name": "getProductData",
    "outputs": [
      {"name": "name", "type": "string"},
      {"name": "sku", "type": "string"},
      {"name": "manufacturer", "type": "address"},
      {"name": "createdAt", "type": "uint256"},
      {"name": "batchId", "type": "string"},
      {"name": "category", "type": "string"},
      {"name": "expiryDate", "type": "uint256"},
      {"name": "isActive", "type": "bool"},
      {"name": "currentValue", "type": "uint256"},
      {"name": "currentLocation", "type": "string"}
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"name": "tokenId", "type": "uint256"}],
    "name": "getSupplyChainHistory",
    "outputs": [
      {"name": "", "type": "tuple[]", "components": [
        {"name": "eventType", "type": "string"},
        {"name": "description", "type": "string"},
        {"name": "actor", "type": "address"},
        {"name": "timestamp", "type": "uint256"},
        {"name": "location", "type": "string"},
        {"name": "data", "type": "string"},
        {"name": "verified", "type": "bool"}
      ]}
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"name": "batchId", "type": "string"}],
    "name": "getTokenByBatchId",
    "outputs": [{"name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"name": "tokenId", "type": "uint256"}],
    "name": "ownerOf",
    "outputs": [{"name": "", "type": "address"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"name": "tokenId", "type": "uint256"}],
    "name": "tokenURI",
    "outputs": [{"name": "", "type": "string"}],
    "stateMutability": "view",
    "type": "function"
  }
];

export const SupplyChainEscrow_ABI = [
  // Events
  {
    "anonymous": false,
    "inputs": [
      {"indexed": true, "name": "escrowId", "type": "uint256"},
      {"indexed": true, "name": "tokenId", "type": "uint256"},
      {"indexed": true, "name": "buyer", "type": "address"},
      {"indexed": false, "name": "seller", "type": "address"},
      {"indexed": false, "name": "amount", "type": "uint256"}
    ],
    "name": "EscrowCreated",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {"indexed": true, "name": "escrowId", "type": "uint256"},
      {"indexed": false, "name": "conditionType", "type": "string"},
      {"indexed": false, "name": "actualValue", "type": "int256"},
      {"indexed": false, "name": "penaltyAmount", "type": "uint256"}
    ],
    "name": "SLAViolation",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {"indexed": true, "name": "escrowId", "type": "uint256"},
      {"indexed": false, "name": "amount", "type": "uint256"},
      {"indexed": false, "name": "recipient", "type": "address"}
    ],
    "name": "EscrowReleased",
    "type": "event"
  },

  // Main Functions
  {
    "inputs": [
      {"name": "tokenId", "type": "uint256"},
      {"name": "seller", "type": "address"},
      {"name": "expectedDeliveryTime", "type": "uint256"},
      {"name": "deliveryLocation", "type": "string"},
      {"name": "autoRelease", "type": "bool"}
    ],
    "name": "createEscrow",
    "outputs": [{"name": "", "type": "uint256"}],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [
      {"name": "escrowId", "type": "uint256"},
      {"name": "conditionType", "type": "string"},
      {"name": "minValue", "type": "int256"},
      {"name": "maxValue", "type": "int256"},
      {"name": "penaltyPercentage", "type": "uint256"}
    ],
    "name": "addSLACondition",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"name": "escrowId", "type": "uint256"}],
    "name": "confirmDelivery",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"name": "escrowId", "type": "uint256"}],
    "name": "releasePayment",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"name": "escrowId", "type": "uint256"}],
    "name": "getEscrowData",
    "outputs": [
      {"name": "tokenId", "type": "uint256"},
      {"name": "buyer", "type": "address"},
      {"name": "seller", "type": "address"},
      {"name": "totalAmount", "type": "uint256"},
      {"name": "penaltyAmount", "type": "uint256"},
      {"name": "createdAt", "type": "uint256"},
      {"name": "expectedDeliveryTime", "type": "uint256"},
      {"name": "status", "type": "uint8"},
      {"name": "deliveryLocation", "type": "string"},
      {"name": "autoRelease", "type": "bool"}
    ],
    "stateMutability": "view",
    "type": "function"
  }
];

export const IoTOracle_ABI = [
  // Events
  {
    "anonymous": false,
    "inputs": [
      {"indexed": true, "name": "deviceId", "type": "string"},
      {"indexed": true, "name": "owner", "type": "address"},
      {"indexed": false, "name": "supportedSensors", "type": "uint8[]"}
    ],
    "name": "DeviceRegistered",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {"indexed": true, "name": "dataPointId", "type": "uint256"},
      {"indexed": true, "name": "deviceId", "type": "string"},
      {"indexed": false, "name": "sensorType", "type": "uint8"},
      {"indexed": false, "name": "value", "type": "int256"}
    ],
    "name": "DataPointSubmitted",
    "type": "event"
  },

  // Main Functions
  {
    "inputs": [
      {"name": "deviceId", "type": "string"},
      {"name": "owner", "type": "address"},
      {"name": "supportedSensors", "type": "uint8[]"},
      {"name": "location", "type": "string"},
      {"name": "metadata", "type": "string"}
    ],
    "name": "registerDevice",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {"name": "deviceId", "type": "string"},
      {"name": "sensorType", "type": "uint8"},
      {"name": "value", "type": "int256"},
      {"name": "unit", "type": "string"},
      {"name": "location", "type": "string"},
      {"name": "metadata", "type": "string"}
    ],
    "name": "submitDataPoint",
    "outputs": [{"name": "", "type": "uint256"}],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"name": "deviceId", "type": "string"}],
    "name": "getDevice",
    "outputs": [
      {"name": "deviceId", "type": "string"},
      {"name": "owner", "type": "address"},
      {"name": "supportedSensors", "type": "uint8[]"},
      {"name": "isActive", "type": "bool"},
      {"name": "registeredAt", "type": "uint256"},
      {"name": "location", "type": "string"},
      {"name": "metadata", "type": "string"},
      {"name": "lastDataSubmission", "type": "uint256"}
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"name": "dataPointId", "type": "uint256"}],
    "name": "getDataPoint",
    "outputs": [
      {"name": "id", "type": "uint256"},
      {"name": "deviceId", "type": "string"},
      {"name": "sensorType", "type": "uint8"},
      {"name": "value", "type": "int256"},
      {"name": "unit", "type": "string"},
      {"name": "timestamp", "type": "uint256"},
      {"name": "location", "type": "string"},
      {"name": "submitter", "type": "address"},
      {"name": "status", "type": "uint8"},
      {"name": "verifiedAt", "type": "uint256"},
      {"name": "verifier", "type": "address"},
      {"name": "metadata", "type": "string"}
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"name": "deviceId", "type": "string"}],
    "name": "getDeviceDataPoints",
    "outputs": [{"name": "", "type": "uint256[]"}],
    "stateMutability": "view",
    "type": "function"
  }
];

export const SupplyChainGovernance_ABI = [
  // Events
  {
    "anonymous": false,
    "inputs": [
      {"indexed": true, "name": "proposalId", "type": "uint256"},
      {"indexed": true, "name": "proposer", "type": "address"},
      {"indexed": false, "name": "proposalType", "type": "uint8"},
      {"indexed": false, "name": "title", "type": "string"}
    ],
    "name": "ProposalCreated",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {"indexed": true, "name": "proposalId", "type": "uint256"},
      {"indexed": true, "name": "voter", "type": "address"},
      {"indexed": false, "name": "support", "type": "uint8"},
      {"indexed": false, "name": "weight", "type": "uint256"}
    ],
    "name": "VoteCast",
    "type": "event"
  },

  // Main Functions
  {
    "inputs": [
      {"name": "proposalType", "type": "uint8"},
      {"name": "title", "type": "string"},
      {"name": "description", "type": "string"},
      {"name": "executionData", "type": "bytes"}
    ],
    "name": "propose",
    "outputs": [{"name": "", "type": "uint256"}],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {"name": "tokenIds", "type": "uint256[]"},
      {"name": "reason", "type": "string"},
      {"name": "affectedBatches", "type": "string[]"},
      {"name": "notifyAddresses", "type": "address[]"},
      {"name": "emergencyRecall", "type": "bool"},
      {"name": "compensationAmount", "type": "uint256"}
    ],
    "name": "proposeRecall",
    "outputs": [{"name": "", "type": "uint256"}],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {"name": "proposalId", "type": "uint256"},
      {"name": "support", "type": "uint8"}
    ],
    "name": "castVote",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"name": "proposalId", "type": "uint256"}],
    "name": "execute",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"name": "proposalId", "type": "uint256"}],
    "name": "getProposal",
    "outputs": [
      {"name": "id", "type": "uint256"},
      {"name": "proposer", "type": "address"},
      {"name": "proposalType", "type": "uint8"},
      {"name": "title", "type": "string"},
      {"name": "description", "type": "string"},
      {"name": "createdAt", "type": "uint256"},
      {"name": "votingStartTime", "type": "uint256"},
      {"name": "votingEndTime", "type": "uint256"},
      {"name": "status", "type": "uint8"},
      {"name": "forVotes", "type": "uint256"},
      {"name": "againstVotes", "type": "uint256"},
      {"name": "abstainVotes", "type": "uint256"},
      {"name": "executed", "type": "bool"}
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"name": "proposalId", "type": "uint256"}],
    "name": "getProposalState",
    "outputs": [{"name": "", "type": "uint8"}],
    "stateMutability": "view",
    "type": "function"
  }
];

// ABI mapping for easy access
export const CONTRACT_ABIS = {
  ProTrackNFT: ProTrackNFT_ABI,
  SupplyChainEscrow: SupplyChainEscrow_ABI,
  IoTOracle: IoTOracle_ABI,
  SupplyChainGovernance: SupplyChainGovernance_ABI
};

// Enum mappings for better type safety
export const SensorType = {
  TEMPERATURE: 0,
  HUMIDITY: 1,
  PRESSURE: 2,
  VIBRATION: 3,
  LIGHT: 4,
  GPS: 5,
  RFID: 6,
  CUSTOM: 7
} as const;

export const EscrowStatus = {
  CREATED: 0,
  FUNDED: 1,
  IN_TRANSIT: 2,
  DELIVERED: 3,
  COMPLETED: 4,
  DISPUTED: 5,
  CANCELLED: 6,
  PENALTY_APPLIED: 7
} as const;

export const ProposalStatus = {
  PENDING: 0,
  ACTIVE: 1,
  SUCCEEDED: 2,
  DEFEATED: 3,
  EXECUTED: 4,
  CANCELLED: 5,
  EXPIRED: 6
} as const;

export const ProposalType = {
  PRODUCT_RECALL: 0,
  QUALITY_STANDARD_UPDATE: 1,
  SUPPLIER_CERTIFICATION: 2,
  EMERGENCY_HALT: 3,
  PARAMETER_UPDATE: 4,
  ROLE_ASSIGNMENT: 5,
  CUSTOM: 6
} as const;
