#!/bin/bash

# ProTrack Complete Deployment and Setup Script
# This script automates the entire deployment process for the ProTrack supply chain system

set -e  # Exit on any error

echo "🚀 PROTRACK COMPLETE DEPLOYMENT AND SETUP"
echo "========================================="
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: This script must be run from the project root directory"
    exit 1
fi

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check prerequisites
echo "🔍 Checking prerequisites..."
if ! command_exists node; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

if ! command_exists npm; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

if ! command_exists npx; then
    echo "❌ npx is not installed. Please install npx first."
    exit 1
fi

echo "✅ All prerequisites found"
echo ""

# Start local blockchain node
echo "🔷 Starting local blockchain node..."
npx hardhat node > /tmp/hardhat-node.log 2>&1 &
HARDHAT_PID=$!
sleep 5

# Check if node started successfully
if ! kill -0 $HARDHAT_PID 2>/dev/null; then
    echo "❌ Failed to start Hardhat node"
    cat /tmp/hardhat-node.log
    exit 1
fi

echo "✅ Hardhat node started (PID: $HARDHAT_PID)"
echo ""

# Deploy contracts
echo "🔷 Deploying smart contracts..."
npx hardhat run scripts/deploy_full_system.js --network localhost
if [ $? -ne 0 ]; then
    echo "❌ Contract deployment failed"
    kill $HARDHAT_PID
    exit 1
fi

echo "✅ Smart contracts deployed successfully"
echo ""

# Update frontend configuration
echo "🔷 Updating frontend configuration..."
node scripts/update_frontend_config.js
if [ $? -ne 0 ]; then
    echo "❌ Frontend configuration update failed"
    kill $HARDHAT_PID
    exit 1
fi

echo "✅ Frontend configuration updated"
echo ""

# Install frontend dependencies
echo "🔷 Installing frontend dependencies..."
cd protrack-frontend
npm install
if [ $? -ne 0 ]; then
    echo "❌ Frontend dependency installation failed"
    kill $HARDHAT_PID
    exit 1
fi

echo "✅ Frontend dependencies installed"
echo ""

# Build frontend
echo "🔷 Building frontend..."
npm run build
if [ $? -ne 0 ]; then
    echo "❌ Frontend build failed"
    kill $HARDHAT_PID
    exit 1
fi

echo "✅ Frontend built successfully"
echo ""

# Run integration tests
echo "🔷 Running integration tests..."
node -e "
const { IntegrationTestRunner } = require('./dist/src/services/integration.test.js');
IntegrationTestRunner.runAllTests().then(success => {
    process.exit(success ? 0 : 1);
});
"
if [ $? -ne 0 ]; then
    echo "❌ Integration tests failed"
    kill $HARDHAT_PID
    exit 1
fi

echo "✅ Integration tests passed"
echo ""

# Clean up
echo "🔷 Cleaning up..."
kill $HARDHAT_PID

echo ""
echo "========================================="
echo "🎉 PROTRACK DEPLOYMENT COMPLETE!"
echo "========================================="
echo ""
echo "📋 Deployment Summary:"
echo "   - Smart contracts deployed to local blockchain"
echo "   - Frontend configured with contract addresses"
echo "   - Frontend dependencies installed and built"
echo "   - Integration tests passed"
echo ""
echo "🚀 To start the system:"
echo "   1. Run 'npx hardhat node' to start the blockchain"
echo "   2. In another terminal, run 'npx hardhat run scripts/deploy_full_system.js --network localhost'"
echo "   3. In the protrack-frontend directory, run 'npm run dev' to start the frontend"
echo ""
echo "🔗 Access the frontend at: http://localhost:5173"
echo "========================================="

exit 0