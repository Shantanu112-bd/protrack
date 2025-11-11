#!/bin/bash

# ProTrack All-in-One Startup Script
# Starts backend, frontend, and optionally blockchain in one command

set -e

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$PROJECT_DIR/backend"
CONTRACTS_DIR="$PROJECT_DIR/contracts"

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${BLUE}"
echo "╔════════════════════════════════════════════════════════════╗"
echo "║              ProTrack All-in-One Startup                   ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo -e "${NC}"

# Function to cleanup on exit
cleanup() {
    echo -e "\n${YELLOW}Shutting down services...${NC}"
    kill $BACKEND_PID 2>/dev/null || true
    kill $FRONTEND_PID 2>/dev/null || true
    kill $BLOCKCHAIN_PID 2>/dev/null || true
    exit 0
}

trap cleanup SIGINT SIGTERM

# Check dependencies
echo -e "${BLUE}Checking dependencies...${NC}"

if [ ! -d "$PROJECT_DIR/node_modules" ]; then
    echo "Installing frontend dependencies..."
    cd "$PROJECT_DIR"
    npm install --legacy-peer-deps
fi

if [ ! -d "$BACKEND_DIR/node_modules" ]; then
    echo "Installing backend dependencies..."
    cd "$BACKEND_DIR"
    npm install --legacy-peer-deps
fi

# Create .env if needed
if [ ! -f "$BACKEND_DIR/.env" ]; then
    echo "Creating backend .env..."
    cp "$BACKEND_DIR/env.example" "$BACKEND_DIR/.env"
fi

echo -e "${GREEN}✓ Dependencies ready${NC}\n"

# Start services
echo -e "${BLUE}Starting services...${NC}\n"

# Start backend
echo -e "${YELLOW}Starting backend server on port 3001...${NC}"
cd "$BACKEND_DIR"
npm run dev > /tmp/protrack-backend.log 2>&1 &
BACKEND_PID=$!
echo -e "${GREEN}✓ Backend started (PID: $BACKEND_PID)${NC}"

# Wait for backend to start
sleep 2

# Start frontend
echo -e "${YELLOW}Starting frontend on port 5173...${NC}"
cd "$PROJECT_DIR"
npm run dev > /tmp/protrack-frontend.log 2>&1 &
FRONTEND_PID=$!
echo -e "${GREEN}✓ Frontend started (PID: $FRONTEND_PID)${NC}"

# Ask about blockchain
echo ""
read -p "Start Hardhat blockchain on port 8545? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${YELLOW}Starting Hardhat blockchain...${NC}"
    cd "$CONTRACTS_DIR"
    npx hardhat node > /tmp/protrack-blockchain.log 2>&1 &
    BLOCKCHAIN_PID=$!
    echo -e "${GREEN}✓ Blockchain started (PID: $BLOCKCHAIN_PID)${NC}"
fi

echo ""
echo -e "${GREEN}════════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}ProTrack is running!${NC}"
echo -e "${GREEN}════════════════════════════════════════════════════════════${NC}"
echo ""
echo -e "Frontend:  ${BLUE}http://localhost:5173${NC}"
echo -e "Backend:   ${BLUE}http://localhost:3001${NC}"
if [ ! -z "$BLOCKCHAIN_PID" ]; then
    echo -e "Blockchain: ${BLUE}http://127.0.0.1:8545${NC}"
fi
echo ""
echo -e "${YELLOW}Logs:${NC}"
echo "  Backend:  tail -f /tmp/protrack-backend.log"
echo "  Frontend: tail -f /tmp/protrack-frontend.log"
if [ ! -z "$BLOCKCHAIN_PID" ]; then
    echo "  Blockchain: tail -f /tmp/protrack-blockchain.log"
fi
echo ""
echo -e "${YELLOW}Press Ctrl+C to stop all services${NC}"
echo ""

# Wait for all processes
wait
