#!/bin/bash

# ProTrack Quick Start Script
# Starts all services with proper ports and configuration

set -e

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$PROJECT_DIR/backend"
CONTRACTS_DIR="$PROJECT_DIR/contracts"

echo "🚀 Starting ProTrack System..."

# Function to cleanup on exit
cleanup() {
    echo -e "\n🛑 Shutting down services..."
    kill $FRONTEND_PID 2>/dev/null || true
    kill $BACKEND_PID 2>/dev/null || true
    kill $BLOCKCHAIN_PID 2>/dev/null || true
    exit 0
}

trap cleanup SIGINT SIGTERM

# Start services
echo "🔧 Starting services..."

# Start frontend (port 5174)
echo "📱 Starting frontend on port 5174..."
cd "$PROJECT_DIR"
npm run dev > /tmp/protrack-frontend.log 2>&1 &
FRONTEND_PID=$!

# Start backend (port 3001)
echo "💻 Starting backend on port 3001..."
cd "$BACKEND_DIR"
npm run dev > /tmp/protrack-backend.log 2>&1 &
BACKEND_PID=$!

# Start blockchain (port 8545)
echo "🔗 Starting blockchain on port 8545..."
cd "$CONTRACTS_DIR"
npx hardhat node > /tmp/protrack-blockchain.log 2>&1 &
BLOCKCHAIN_PID=$!

# Wait a moment for services to start
sleep 3

echo ""
echo "✅ ProTrack is now running!"
echo "════════════════════════════"
echo "📱 Frontend:  http://localhost:5174"
echo "💻 Backend:   http://localhost:3001"
echo "🔗 Blockchain: http://127.0.0.1:8545"
echo ""
echo "📝 Demo Accounts (for blockchain):"
echo "   Account #0: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"
echo "   Private Key: 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80"
echo ""
echo "📌 Press Ctrl+C to stop all services"
echo ""

# Wait for all processes
wait