# ProTrack Frontend - Getting Started

## Running the Frontend

The ProTrack frontend is built with React, TypeScript, and Vite. Follow these instructions to get it running in your browser.

### Prerequisites

- Node.js (version 16 or higher)
- npm (comes with Node.js)
- A modern web browser (Chrome, Firefox, Safari, Edge)

### Quick Start

#### Option 1: Using the start script (Recommended)

```bash
cd /Users/macbook/Desktop/Pro\ Track/protrack-frontend
./start-frontend.sh
```

#### Option 2: Manual start

```bash
cd /Users/macbook/Desktop/Pro\ Track/protrack-frontend
npm run dev
```

### Accessing the Application

Once the development server is running, open your browser and navigate to:

- http://localhost:5174 (or the port shown in the terminal output)

### Features Available

1. **Dashboard** - Overview of supply chain activities
2. **Key Management** - Manage encryption keys for secure data sharing
3. **Product Verification** - Verify product authenticity using blockchain
4. **Transaction Approval** - Multi-party approval system for supply chain operations
5. **AI Assistant** - AI-powered supply chain insights
6. **AR Scanner** - Augmented reality scanning for products

### Wallet Connection

To use blockchain features:

1. Install MetaMask browser extension
2. Connect your wallet using the "Connect Wallet" button in the header
3. Make sure you're on the correct network (Localhost:8545 for development)

### Troubleshooting

#### Common Issues

1. **Port already in use**

   - The frontend will automatically try another port if 5173 is busy
   - Check terminal output for the actual URL

2. **Dependency issues**

   - Run `npm install --legacy-peer-deps` to install all dependencies

3. **Wallet connection problems**

   - Make sure MetaMask is installed and unlocked
   - Check that you're on the correct network

4. **Blank page or loading issues**
   - Check browser console for errors (F12)
   - Restart the development server

### Development Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run linting
npm run lint

# Fix linting issues
npm run lint:fix

# Type checking
npm run type-check
```

### Technology Stack

- **Frontend Framework**: React with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **State Management**: React Context API
- **Routing**: React Router
- **Blockchain**: ethers.js, Web3.js
- **UI Components**: Custom components with Lucide React icons

The frontend is now ready to use in your browser!
