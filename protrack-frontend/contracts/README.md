# ProTrack Smart Contracts

This directory contains the smart contracts that power the ProTrack supply chain management system. The contracts provide comprehensive automation for product tokenization, escrow payments, IoT data verification, and governance.

## 📋 Contract Overview

### 1. ProTrackNFT.sol
**Main product tokenization contract**
- **Purpose**: Tokenizes products as NFTs with comprehensive supply chain tracking
- **Features**:
  - Product minting with detailed metadata
  - Supply chain event tracking
  - Quality check recording
  - Role-based access control
  - Product status management
  - Batch ID to token ID mapping

### 2. SupplyChainEscrow.sol
**Automated payment and SLA enforcement**
- **Purpose**: Manages secure payments with automated SLA monitoring
- **Features**:
  - Escrow creation with customizable terms
  - SLA condition monitoring
  - Automated penalty application
  - Milestone-based payments
  - Dispute resolution system
  - Multi-signature support

### 3. IoTOracle.sol
**IoT data verification and monitoring**
- **Purpose**: Handles IoT device registration and data verification
- **Features**:
  - Device registration and management
  - Sensor data submission and verification
  - Real-time SLA monitoring
  - Aggregated data analytics
  - Batch data processing
  - Tamper-proof data storage

### 4. SupplyChainGovernance.sol
**Decentralized governance and multi-sig operations**
- **Purpose**: Manages governance proposals and multi-signature operations
- **Features**:
  - Product recall proposals
  - Quality standard updates
  - Supplier certification management
  - Voting mechanisms
  - Proposal execution
  - Emergency procedures

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- MetaMask or compatible wallet

### Installation

1. **Navigate to contracts directory**:
   ```bash
   cd contracts
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up environment variables**:
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

### Deployment

1. **Compile contracts**:
   ```bash
   npm run compile
   ```

2. **Deploy to local network**:
   ```bash
   # Start local Hardhat node (in separate terminal)
   npm run node
   
   # Deploy contracts
   npm run deploy:local
   ```

3. **Deploy to testnet**:
   ```bash
   # Deploy to Goerli
   npm run deploy:goerli
   
   # Deploy to Polygon Mumbai
   npm run deploy:mumbai
   ```

4. **Verify contracts** (after deployment):
   ```bash
   npm run verify:goerli
   ```

### Testing and Interaction

1. **Run tests**:
   ```bash
   npm test
   ```

2. **Interactive demo**:
   ```bash
   npx hardhat run scripts/interact.js --network localhost
   ```

## 📁 Directory Structure

```
contracts/
├── contracts/                 # Smart contract source files
│   ├── ProTrackNFT.sol       # Main NFT contract
│   ├── SupplyChainEscrow.sol  # Escrow and SLA contract
│   ├── IoTOracle.sol          # IoT data oracle
│   └── SupplyChainGovernance.sol # Governance contract
├── scripts/                   # Deployment and interaction scripts
│   ├── deploy.js             # Main deployment script
│   ├── verify.js             # Contract verification
│   └── interact.js           # Demo interaction script
├── deployments/              # Deployment artifacts (generated)
├── test/                     # Test files (to be added)
├── hardhat.config.js         # Hardhat configuration
├── package.json              # Dependencies and scripts
└── README.md                 # This file
```

## 🔧 Configuration

### Environment Variables

Create a `.env` file with the following variables:

```env
# Private key for deployment (without 0x prefix)
PRIVATE_KEY=your_private_key_here

# RPC URLs
GOERLI_RPC_URL=https://goerli.infura.io/v3/YOUR_INFURA_KEY
POLYGON_RPC_URL=https://polygon-rpc.com
MUMBAI_RPC_URL=https://rpc-mumbai.maticvigil.com

# API Keys for verification
ETHERSCAN_API_KEY=your_etherscan_api_key
POLYGONSCAN_API_KEY=your_polygonscan_api_key

# Gas reporting
REPORT_GAS=true
COINMARKETCAP_API_KEY=your_coinmarketcap_api_key
```

### Supported Networks

- **Ethereum Mainnet** (chainId: 1)
- **Goerli Testnet** (chainId: 5)
- **Sepolia Testnet** (chainId: 11155111)
- **Polygon Mainnet** (chainId: 137)
- **Polygon Mumbai** (chainId: 80001)
- **Localhost/Hardhat** (chainId: 1337)

## 🎯 Key Features

### Product Lifecycle Management
- **NFT Minting**: Each product becomes a unique NFT with immutable metadata
- **Supply Chain Events**: Track every step from manufacturing to delivery
- **Quality Checks**: Record inspection results and certifications
- **Ownership Transfer**: Secure transfer of product ownership

### Automated Payments
- **Escrow System**: Secure payment holding with automated release
- **SLA Monitoring**: Real-time monitoring of service level agreements
- **Penalty System**: Automatic penalty application for violations
- **Milestone Payments**: Progressive payment release based on milestones

### IoT Integration
- **Device Registration**: Register and manage IoT devices
- **Data Verification**: Cryptographically verify sensor data
- **Real-time Monitoring**: Continuous monitoring of environmental conditions
- **Aggregated Analytics**: Statistical analysis of sensor data

### Governance
- **Proposal System**: Create and vote on governance proposals
- **Product Recalls**: Multi-signature product recall procedures
- **Quality Standards**: Update quality standards through voting
- **Supplier Management**: Certify and manage suppliers

## 🔐 Security Features

- **Role-Based Access Control**: Granular permissions for different actors
- **Multi-Signature Operations**: Critical operations require multiple approvals
- **Reentrancy Protection**: Protection against reentrancy attacks
- **Input Validation**: Comprehensive input validation and sanitization
- **Event Logging**: Complete audit trail through events

## 📊 Gas Optimization

The contracts are optimized for gas efficiency:
- **Packed Structs**: Efficient storage layout
- **Batch Operations**: Process multiple items in single transaction
- **Lazy Evaluation**: Compute values only when needed
- **Storage Optimization**: Minimize storage operations

## 🧪 Testing

Run the test suite to ensure contract functionality:

```bash
# Run all tests
npm test

# Run with gas reporting
REPORT_GAS=true npm test

# Run with coverage
npm run coverage
```

## 📈 Monitoring and Analytics

After deployment, you can monitor contract activity:

1. **Transaction History**: View all contract interactions
2. **Event Logs**: Monitor real-time events
3. **Gas Usage**: Track gas consumption
4. **Performance Metrics**: Analyze contract performance

## 🔄 Upgrades

The contracts use OpenZeppelin's upgradeable pattern for future improvements:

```bash
# Deploy upgradeable version
npx hardhat run scripts/deploy-upgradeable.js --network goerli

# Upgrade existing deployment
npx hardhat run scripts/upgrade.js --network goerli
```

## 🤝 Integration

### Frontend Integration

The contracts integrate seamlessly with the ProTrack frontend:

1. **Contract Configuration**: Automatic configuration generation
2. **ABI Export**: TypeScript-compatible ABI definitions
3. **Type Safety**: Full TypeScript support
4. **Real-time Updates**: WebSocket event listening

### API Integration

REST API endpoints for contract interaction:

- `POST /api/contracts/mint` - Mint new product NFT
- `POST /api/contracts/escrow` - Create escrow
- `GET /api/contracts/product/:id` - Get product data
- `POST /api/contracts/iot/data` - Submit IoT data

## 📚 Documentation

- **Contract Documentation**: Auto-generated from NatSpec comments
- **API Reference**: Complete function reference
- **Integration Guide**: Step-by-step integration instructions
- **Best Practices**: Security and optimization guidelines

## 🐛 Troubleshooting

### Common Issues

1. **Deployment Fails**:
   - Check network configuration
   - Verify sufficient ETH balance
   - Confirm RPC URL is correct

2. **Transaction Reverts**:
   - Check function parameters
   - Verify caller permissions
   - Ensure sufficient gas limit

3. **Verification Fails**:
   - Confirm contract address
   - Check constructor parameters
   - Verify API key configuration

### Support

For technical support:
- Create an issue in the repository
- Check existing documentation
- Review contract events for debugging

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🚀 Deployment Status

| Network | Status | Contract Addresses |
|---------|--------|-------------------|
| Localhost | ✅ Ready | See deployment artifacts |
| Goerli | 🔄 Pending | TBD |
| Mumbai | 🔄 Pending | TBD |
| Mainnet | ⏳ Future | TBD |

---

**ProTrack Smart Contracts** - Automating supply chain management with blockchain technology.
