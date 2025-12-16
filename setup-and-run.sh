#!/bin/bash

# ProTrack Final Setup and Run Script
# This script sets up and runs the complete ProTrack system

set -e  # Exit on error

echo "🚀 ProTrack Final Setup and Run"
echo "================================"
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Function to print colored messages
print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_info() {
    echo -e "${YELLOW}ℹ️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check if we're in the right directory
if [ ! -d "protrack-frontend" ]; then
    print_error "Please run this script from the main protrack directory"
    exit 1
fi

# Check Node.js
if ! command -v node &> /dev/null; then
    print_error "Node.js not found. Please install Node.js 18+ first."
    exit 1
fi

print_success "Node.js $(node -v) detected"

# Step 1: Install frontend dependencies if needed
print_info "Checking frontend dependencies..."
cd protrack-frontend
if [ ! -d "node_modules" ]; then
    print_info "Installing frontend dependencies..."
    npm install
    print_success "Frontend dependencies installed"
else
    print_success "Frontend dependencies already installed"
fi
cd ..

# Step 2: Install contract dependencies if needed
print_info "Checking contract dependencies..."
cd contracts
if [ ! -d "node_modules" ]; then
    print_info "Installing contract dependencies..."
    npm install
    print_success "Contract dependencies installed"
else
    print_success "Contract dependencies already installed"
fi
cd ..

# Step 3: Check if Hardhat node is already running
print_info "Checking if Hardhat node is running..."
if lsof -Pi :8545 -sTCP:LISTEN -t >/dev/null ; then
    print_success "Hardhat node is already running on port 8545"
    BLOCKCHAIN_RUNNING=true
else
    print_info "Starting Hardhat blockchain node..."
    cd contracts
    # Start Hardhat node in background
    npx hardhat node > /tmp/hardhat-node.log 2>&1 &
    HARDHAT_PID=$!
    cd ..
    
    # Wait for node to be ready
    print_info "Waiting for blockchain node to start..."
    sleep 5
    
    # Check if node started successfully
    if lsof -Pi :8545 -sTCP:LISTEN -t >/dev/null ; then
        print_success "Hardhat node started successfully (PID: $HARDHAT_PID)"
        BLOCKCHAIN_RUNNING=true
        echo $HARDHAT_PID > /tmp/hardhat-node.pid
    else
        print_error "Failed to start Hardhat node. Check /tmp/hardhat-node.log for details"
        exit 1
    fi
fi

# Step 4: Deploy contracts (check if already deployed)
print_info "Checking contract deployment..."
cd contracts

# Check if contracts are already deployed
if [ -f "deployments/localhost-1337.json" ]; then
    print_info "Contracts appear to be deployed. Checking if deployment is valid..."
    # Try to verify by checking if the contract address exists
    if grep -q "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512" deployments/localhost-1337.json 2>/dev/null; then
        print_success "Contracts already deployed"
        DEPLOY_CONTRACTS=false
    else
        print_info "Deployment file exists but may be outdated. Redeploying..."
        DEPLOY_CONTRACTS=true
    fi
else
    print_info "No deployment found. Deploying contracts..."
    DEPLOY_CONTRACTS=true
fi

if [ "$DEPLOY_CONTRACTS" = true ]; then
    print_info "Deploying contracts to local network..."
    # Wait a bit more to ensure node is fully ready
    sleep 3
    
    # Try to deploy - use deploy-unified.js if it exists, otherwise use deploy-protrack.js
    if [ -f "scripts/deploy-unified.js" ]; then
        npx hardhat run scripts/deploy-unified.js --network localhost || {
            print_info "Trying alternative deployment script..."
            npx hardhat run scripts/deploy-protrack.js --network localhost || {
                print_error "Contract deployment failed"
                exit 1
            }
        }
    elif [ -f "scripts/deploy-protrack.js" ]; then
        npx hardhat run scripts/deploy-protrack.js --network localhost || {
            print_error "Contract deployment failed"
            exit 1
        }
    else
        print_error "No deployment script found"
        exit 1
    fi
    
    print_success "Contracts deployed successfully"
fi

cd ..

# Step 5: Start frontend
print_info "Starting frontend development server..."
cd protrack-frontend

# Display important information
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
print_success "🎉 ProTrack System is Starting!"
echo ""
print_info "📱 Application URLs:"
echo "   • Frontend: http://localhost:5174"
echo "   • Blockchain: http://localhost:8545"
echo ""
print_info "🔧 Available Features:"
echo "   • Wallet Connection (MetaMask)"
echo "   • Product Management & NFT Minting"
echo "   • Shipment Tracking & Management"
echo "   • IoT Sensor Monitoring"
echo "   • Supply Chain Analytics"
echo ""
print_info "📚 Documentation:"
echo "   • Quick Start: QUICK_START_GUIDE.md"
echo "   • User Guide: USER_GUIDE.md"
echo ""
print_info "🛑 To stop the system:"
echo "   • Press Ctrl+C to stop the frontend"
echo "   • Run: kill \$(cat /tmp/hardhat-node.pid) to stop blockchain node"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Start the frontend
npm run dev
