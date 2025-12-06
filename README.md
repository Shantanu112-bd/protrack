# ProTrack: Unified Supply Chain Tracking Platform

ProTrack is a blockchain-based supply chain tracking platform that integrates NFTs, MPC wallets, and IoT devices for secure, transparent product lifecycle management. This unified version consolidates all functionality into a single smart contract for simplified deployment and management.

## 🌟 Key Features

- **RFID & Barcode Integration**: Physical goods are tracked via RFID tags and barcodes
- **Blockchain Tokenization**: Products are represented as NFTs/SBTs on the blockchain
- **IoT Sensor Monitoring**: Real-time tracking of temperature, humidity, location, and other conditions
- **Multi-Party Custody Transfers**: Secure transfers with MPC wallet integration
- **Role-Based Access Control**: Manufacturer, transporter, retailer, and consumer roles
- **Supply Chain Transparency**: Complete product history from origin to consumer
- **Smart Contract Automation**: Automated state transitions and alerts

## 🏗️ Architecture Overview

### Core Components

1. **Unified Smart Contract** (`contracts/contracts/ProTrack.sol`)

   - ERC-721 NFT implementation with optional SBT mode
   - Role-based access control for supply chain participants
   - Product lifecycle management (manufactured → packaged → in transit → received → sold)
   - Shipment tracking with multi-signature approvals
   - IoT data recording and validation
   - Encryption key management for secure transfers

2. **Web3 Frontend** (`protrack-frontend/`)

   - React + TypeScript + Tailwind CSS
   - Wallet integration with MetaMask and other providers
   - Interactive dashboards for products, shipments, and IoT data
   - RFID scanning interface
   - Real-time updates via blockchain events

3. **IoT Integration Layer**
   - LoRa/MQTT gateways for RFID/GPS telemetry
   - Device registry and authentication
   - Real-time data streaming to Supabase and smart contracts

### Technology Stack

- **Blockchain**: Solidity (Hardhat), Polygon/Arbitrum
- **Frontend**: React, TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Supabase (Postgres + Realtime + Auth)
- **Wallets**: MPC Multisig (Fireblocks, Safe, or open MPC node)
- **IoT**: LoRa/MQTT gateways for RFID/GPS telemetry
- **AI**: ML + ZKP for anomaly detection and authenticity validation

## 🚀 Quick Start

### Prerequisites

- Node.js v16+
- npm v8+
- Docker and Docker Compose (optional, for containerized deployment)

### Installation

1. Clone the repository:

   ```bash
   git clone <repository-url>
   cd protrack
   ```

2. Install dependencies:

   ```bash
   # Install smart contract dependencies
   cd contracts
   npm install

   # Install frontend dependencies
   cd ../protrack-frontend
   npm install

   cd ..
   ```

### Development Setup

1. Start local blockchain:

   ```bash
   cd contracts
   npx hardhat node
   ```

2. Deploy contracts (in a new terminal):

   ```bash
   cd contracts
   npx hardhat run scripts/deploy-unified.js --network localhost
   ```

3. Start frontend (in a new terminal):

   ```bash
   cd protrack-frontend
   npm run dev
   ```

4. Open your browser to `http://localhost:3000`

### Docker Deployment

For containerized deployment:

```bash
# Build and start all services
docker-compose up --build

# The frontend will be available at http://localhost:3000
# The blockchain node will be available at http://localhost:8545
```

## 📁 Project Structure

```
protrack/
├── contracts/                 # Smart contracts
│   ├── contracts/             # Solidity contracts
│   │   └── ProTrack.sol       # Unified supply chain contract
│   ├── scripts/               # Deployment scripts
│   │   └── deploy-unified.js  # Unified deployment script
│   └── test/                  # Contract tests
├── protrack-frontend/         # Web frontend
│   ├── src/                   # Source code
│   │   ├── components/        # React components
│   │   ├── contexts/          # React contexts
│   │   ├── hooks/             # Custom hooks
│   │   └── services/          # API services
│   └── public/                # Static assets
├── scripts/                   # System scripts
│   └── deploy_unified_contract.js  # Full system deployment
├── Dockerfile                 # Docker configuration
├── docker-compose.yml         # Multi-container setup
└── README.md                  # This file
```

## 🛠️ Smart Contract Features

The unified `ProTrack.sol` contract includes:

- **Product Management**: Mint, track, and manage product NFTs
- **Shipment Tracking**: Request, approve, and track shipments
- **IoT Data Recording**: Store sensor data on-chain
- **Role-Based Access**: Secure access control for different participants
- **Custody Transfers**: Secure product transfers with encryption keys
- **Soulbound Tokens**: Optional SBT mode for non-transferable products
- **Recall Functionality**: Product recall mechanism for safety issues

## 🌐 Frontend Features

The React frontend provides:

- **Dashboard**: Overview of products, shipments, and IoT data
- **Product Management**: View and mint new products
- **Shipment Tracking**: Monitor and manage shipments
- **IoT Monitoring**: Real-time sensor data visualization
- **RFID Scanning**: Product verification via RFID/barcode
- **Wallet Integration**: MetaMask and other wallet support
- **Responsive Design**: Works on desktop and mobile devices

## 🧪 Testing

Run contract tests:

```bash
cd contracts
npx hardhat test
```

## 📤 Deployment

### Local Development

1. Start local blockchain node:

   ```bash
   cd contracts
   npx hardhat node
   ```

2. Deploy contracts:
   ```bash
   npx hardhat run scripts/deploy-unified.js --network localhost
   ```

### Testnet/Mainnet

Update the network configuration in `hardhat.config.js` and deploy:

```bash
npx hardhat run scripts/deploy-unified.js --network <network-name>
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- OpenZeppelin for secure contract templates
- Hardhat for development environment
- Chainlink for oracle integration
- The blockchain and supply chain communities
