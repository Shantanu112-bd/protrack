#!/bin/bash

# Simple script to run ProTrack frontend in browser
# This script starts the development server and provides access instructions

set -e

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}"
echo "╔════════════════════════════════════════════════════════════╗"
echo "║              ProTrack Browser Runner                       ║"
echo "║        Run the supply chain system in your browser         ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo -e "${NC}"

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo -e "${YELLOW}This script must be run from the protrack-frontend directory${NC}"
    exit 1
fi

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo -e "${YELLOW}Node.js is not installed. Please install Node.js first.${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Node.js is installed${NC}"
echo -e "${GREEN}✓ npm is installed${NC}"
echo ""

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}Installing dependencies...${NC}"
    npm install --legacy-peer-deps
    echo -e "${GREEN}✓ Dependencies installed${NC}"
else
    echo -e "${GREEN}✓ Dependencies already installed${NC}"
fi

echo ""
echo -e "${BLUE}Starting ProTrack frontend development server...${NC}"
echo ""

# Start the development server
echo -e "${GREEN}The ProTrack system is now running!${NC}"
echo ""
echo -e "${BLUE}Access the application:${NC}"
echo -e "  Demo Mode (no blockchain required): ${YELLOW}http://localhost:5173/?demo=true${NC}"
echo -e "  Service Demo Mode: ${YELLOW}http://localhost:5173/?browser-demo=true${NC}"
echo -e "  Full Application: ${YELLOW}http://localhost:5173${NC}"
echo ""
echo -e "${BLUE}To stop the server, press Ctrl+C${NC}"
echo ""

# Start the server
npm run dev