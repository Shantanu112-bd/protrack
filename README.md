# ProTrack Supply Chain Management Platform

ProTrack is a comprehensive blockchain-based supply chain tracking system that leverages NFTs, MPC wallets, and IoT integration to provide end-to-end visibility and security for supply chain operations.

## 🚀 Quick Start

### Terminal-Based Demo

Run the terminal demo to see core functionality without starting servers:

```bash
cd protrack-frontend
npm run terminal-demo
```

### Interactive Browser Demo

Run the interactive browser demo:

```bash
cd protrack-frontend
npm run dev
# Then open http://localhost:5173/?demo=true in your browser
```

### Full System with Blockchain

Start the complete system with all services:

```bash
# From the root directory
bash START_PROTRACK.sh
# Choose to start all services automatically
```

Or manually start each component:

```bash
# Terminal 1: Backend
cd protrack-frontend/backend
npm run dev

# Terminal 2: Frontend
cd protrack-frontend
npm run dev

# Terminal 3: Blockchain (optional)
cd protrack-frontend/contracts
npx hardhat node

# Terminal 4: Deploy contracts (if blockchain is running)
cd scripts
npx hardhat run deploy_full_system.js --network localhost
```

## 🛠️ System Components

1. **Frontend Dashboard** - React/TypeScript application with multiple role-based views
2. **Backend API** - Node.js/Express server with Supabase integration
3. **Smart Contracts** - Solidity contracts for NFT tracking, MPC wallets, and oracles
4. **IoT Integration** - Real-time sensor data processing and blockchain verification

## 📋 Prerequisites

- Node.js (v16 or higher)
- npm (v8 or higher)
- Git

## 🎯 Key Features

- **NFT-Based Product Tracking**: Unique digital identities for physical products
- **MPC Wallet Security**: Multi-Party Computation wallets for secure transactions
- **IoT Data Integration**: Real-time sensor data with oracle verification
- **Role-Based Access**: Manufacturer, transporter, retailer, and consumer views
- **AI Assistant**: Intelligent supply chain insights and optimization suggestions

## 🧪 Demo Modes

- **Terminal Demo**: `npm run terminal-demo` - Core functionality demonstration in terminal
- **Browser Dashboard**: `http://localhost:5173/?demo=true` - Full interactive dashboard
- **Service Demo**: `http://localhost:5173/?browser-demo=true` - Service-level demonstrations

## 📚 Documentation

For detailed setup instructions, API documentation, and architecture diagrams, please refer to the docs folder.

## 🤝 Contributing

We welcome contributions! Please see our contributing guidelines for details.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [OpenZeppelin](https://openzeppelin.com/) for secure smart contract libraries
- [Chainlink](https://chain.link/) for oracle services
- [Supabase](https://supabase.com/) for backend infrastructure
- [Ethereum](https://ethereum.org/) for blockchain infrastructure

## 📞 Support

For support, please open an issue on GitHub or contact the development team.
