# 🚀 ProTrack Smart Contracts Deployment Guide

This guide will help you deploy and integrate the ProTrack smart contracts with your existing application.

## 📋 Prerequisites

- Node.js (v16 or higher)
- MetaMask wallet with test ETH
- Infura or Alchemy account (for testnet deployment)
- Basic understanding of smart contracts

## 🔧 Setup Instructions

### 1. Install Contract Dependencies

```bash
cd contracts
npm install
```

### 2. Configure Environment

```bash
cp .env.example .env
```

Edit `.env` with your configuration:
```env
PRIVATE_KEY=your_private_key_without_0x_prefix
GOERLI_RPC_URL=https://goerli.infura.io/v3/YOUR_INFURA_KEY
ETHERSCAN_API_KEY=your_etherscan_api_key
```

### 3. Deploy to Local Network (Development)

```bash
# Terminal 1: Start local blockchain
npm run node

# Terminal 2: Deploy contracts
npm run deploy:local

# Optional: Run interaction demo
npx hardhat run scripts/interact.js --network localhost
```

### 4. Deploy to Testnet (Goerli)

```bash
# Deploy to Goerli testnet
npm run deploy:goerli

# Verify contracts (optional)
npm run verify:goerli
```

## 📁 Generated Files

After deployment, you'll find:

- `deployments/localhost-1337.json` - Local deployment info
- `deployments/goerli-5.json` - Goerli deployment info
- `src/contracts/localhost-config.json` - Frontend configuration

## 🔗 Frontend Integration

The contracts are already integrated with your frontend through:

1. **Contract Configuration** (`src/contracts/contractConfig.ts`)
2. **ABI Definitions** (`src/contracts/abis.ts`)
3. **Updated Services** (`src/services/nftService.ts`)
4. **Blockchain Context** (`src/contexts/BlockchainContext.tsx`)

## 🎯 Key Features Automated

### 1. Product Tokenization (ProTrackNFT)
- ✅ Mint products as NFTs with comprehensive metadata
- ✅ Track supply chain events automatically
- ✅ Record quality checks and certifications
- ✅ Manage product lifecycle and ownership

### 2. Automated Payments (SupplyChainEscrow)
- ✅ Create escrows with SLA conditions
- ✅ Automatic penalty application for violations
- ✅ Milestone-based payment releases
- ✅ Dispute resolution mechanisms

### 3. IoT Data Verification (IoTOracle)
- ✅ Register and manage IoT devices
- ✅ Submit and verify sensor data
- ✅ Real-time SLA monitoring
- ✅ Aggregated analytics and reporting

### 4. Governance (SupplyChainGovernance)
- ✅ Product recall proposals and voting
- ✅ Quality standard updates
- ✅ Supplier certification management
- ✅ Multi-signature operations

## 🔄 Usage Examples

### Mint a Product NFT

```javascript
// In your React component
const { mintProductNFT } = useBlockchain();

const productData = {
  name: "Organic Coffee Beans",
  sku: "COFFEE-001",
  manufacturer: account,
  createdAt: Math.floor(Date.now() / 1000),
  batchId: "BATCH-" + Date.now(),
  category: "Food",
  currentLocation: "Farm A"
};

const result = await mintProductNFT(productData);
console.log("Minted NFT:", result.tokenId);
```

### Create Escrow with SLA

```javascript
const { createEscrow } = useBlockchain();

const escrowResult = await createEscrow(
  tokenId,
  sellerAddress,
  "1.0", // 1 ETH
  "New York Warehouse"
);

// Add temperature monitoring
await addSLACondition(
  escrowResult.escrowId,
  "temperature",
  -5, // min -5°C
  25, // max 25°C
  500 // 5% penalty
);
```

### Submit IoT Data

```javascript
const { submitIoTData } = useBlockchain();

await submitIoTData({
  deviceId: "TEMP_SENSOR_001",
  sensorType: 0, // TEMPERATURE
  value: 18,
  unit: "°C",
  location: "Container A1"
});
```

## 🔐 Security Features

- **Role-Based Access Control**: Different permissions for manufacturers, inspectors, etc.
- **Multi-Signature Operations**: Critical actions require multiple approvals
- **Reentrancy Protection**: Prevents common attack vectors
- **Input Validation**: Comprehensive parameter checking
- **Event Logging**: Complete audit trail

## 📊 Monitoring

Monitor your contracts through:

1. **Etherscan/Polygonscan**: View transactions and events
2. **Frontend Dashboard**: Real-time statistics and activity
3. **Event Logs**: Track all contract interactions
4. **Gas Usage**: Monitor transaction costs

## 🚨 Important Notes

### Gas Optimization
- Contracts are optimized for gas efficiency
- Batch operations available for multiple items
- Use appropriate gas limits for complex operations

### Network Considerations
- **Localhost**: Free, instant transactions (development)
- **Goerli**: Free test ETH, ~15 second blocks
- **Polygon Mumbai**: Free test MATIC, ~2 second blocks
- **Mainnet**: Real ETH required, production use

### Upgrades
- Contracts use OpenZeppelin's upgradeable patterns
- Future improvements can be deployed without losing data
- Governance controls upgrade processes

## 🔧 Troubleshooting

### Common Issues

1. **"Insufficient funds"**
   - Get test ETH from Goerli faucet
   - Check wallet balance

2. **"Transaction reverted"**
   - Check function parameters
   - Verify caller has required permissions
   - Increase gas limit

3. **"Contract not deployed"**
   - Run deployment script first
   - Check network configuration
   - Verify contract addresses

### Getting Help

- Check contract events for detailed error information
- Use Hardhat console for debugging
- Review deployment logs for issues

## 🎉 Success Indicators

After successful deployment, you should see:

✅ All 4 contracts deployed successfully  
✅ Frontend configuration files generated  
✅ Demo data created (on testnets)  
✅ Contract verification completed  
✅ Integration tests passing  

## 📈 Next Steps

1. **Test the Integration**: Use the frontend to interact with contracts
2. **Monitor Activity**: Watch for events and transactions
3. **Scale Up**: Deploy to mainnet when ready
4. **Optimize**: Monitor gas usage and optimize operations

---

**Your ProTrack application now has full smart contract automation! 🎊**

The contracts will automatically handle:
- Product lifecycle management
- Payment automation with SLA enforcement
- IoT data verification and monitoring
- Governance and multi-signature operations

All integrated seamlessly with your existing React frontend.
