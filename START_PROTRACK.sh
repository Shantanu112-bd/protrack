#!/bin/bash

# ProTrack Complete Startup Script
# This script starts all services needed for ProTrack to work

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PROJECT_DIR="/Users/macbook/Desktop/Pro Track/protrack-frontend"
BACKEND_DIR="$PROJECT_DIR/backend"
CONTRACTS_DIR="$PROJECT_DIR/contracts"
FRONTEND_DIR="$PROJECT_DIR"

# Function to print colored output
print_status() {
    echo -e "${BLUE}[ProTrack]${NC} $1"
}

print_success() {
    echo -e "${GREEN}✓${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

# Function to check if port is in use
check_port() {
    if lsof -Pi :$1 -sTCP:LISTEN -t >/dev/null 2>&1 ; then
        return 0
    else
        return 1
    fi
}

# Function to kill process on port
kill_port() {
    if check_port $1; then
        print_warning "Port $1 is in use. Attempting to free it..."
        lsof -ti:$1 | xargs kill -9 2>/dev/null || true
        sleep 1
    fi
}

# Main startup
main() {
    clear
    echo -e "${BLUE}"
    echo "╔════════════════════════════════════════════════════════════╗"
    echo "║                   ProTrack Startup Script                  ║"
    echo "║          Web3 Supply Chain Management Platform             ║"
    echo "╚════════════════════════════════════════════════════════════╝"
    echo -e "${NC}"

    # Check if project directory exists
    if [ ! -d "$PROJECT_DIR" ]; then
        print_error "Project directory not found: $PROJECT_DIR"
        exit 1
    fi

    print_status "Starting ProTrack services..."
    echo ""

    # Step 1: Check and install dependencies
    print_status "Step 1: Checking dependencies..."
    
    if [ ! -d "$FRONTEND_DIR/node_modules" ]; then
        print_warning "Frontend dependencies not installed. Installing..."
        cd "$FRONTEND_DIR"
        npm install --legacy-peer-deps
        print_success "Frontend dependencies installed"
    else
        print_success "Frontend dependencies already installed"
    fi

    if [ ! -d "$BACKEND_DIR/node_modules" ]; then
        print_warning "Backend dependencies not installed. Installing..."
        cd "$BACKEND_DIR"
        npm install --legacy-peer-deps
        print_success "Backend dependencies installed"
    else
        print_success "Backend dependencies already installed"
    fi

    if [ ! -d "$CONTRACTS_DIR/node_modules" ]; then
        print_warning "Contract dependencies not installed. Installing..."
        cd "$CONTRACTS_DIR"
        npm install --legacy-peer-deps
        print_success "Contract dependencies installed"
    else
        print_success "Contract dependencies already installed"
    fi

    echo ""
    print_status "Step 2: Checking environment files..."

    # Check backend .env
    if [ ! -f "$BACKEND_DIR/.env" ]; then
        print_warning "Backend .env not found. Creating from example..."
        cp "$BACKEND_DIR/env.example" "$BACKEND_DIR/.env"
        print_success "Backend .env created"
    else
        print_success "Backend .env exists"
    fi

    echo ""
    print_status "Step 3: Checking ports..."

    # Check and free ports
    if check_port 3001; then
        print_warning "Port 3001 (Backend) is in use"
        kill_port 3001
        print_success "Port 3001 freed"
    else
        print_success "Port 3001 (Backend) is available"
    fi

    if check_port 5173; then
        print_warning "Port 5173 (Frontend) is in use"
        kill_port 5173
        print_success "Port 5173 freed"
    else
        print_success "Port 5173 (Frontend) is available"
    fi

    if check_port 8545; then
        print_warning "Port 8545 (Blockchain) is in use"
        kill_port 8545
        print_success "Port 8545 freed"
    else
        print_success "Port 8545 (Blockchain) is available"
    fi

    echo ""
    echo -e "${GREEN}════════════════════════════════════════════════════════════${NC}"
    echo -e "${GREEN}All checks passed! Ready to start services.${NC}"
    echo -e "${GREEN}════════════════════════════════════════════════════════════${NC}"
    echo ""

    # Display startup instructions
    echo -e "${YELLOW}To start ProTrack, open 3 terminal windows and run:${NC}"
    echo ""
    echo -e "${BLUE}Terminal 1 - Backend Server:${NC}"
    echo "cd $BACKEND_DIR && npm run dev"
    echo ""
    echo -e "${BLUE}Terminal 2 - Frontend Development:${NC}"
    echo "cd $FRONTEND_DIR && npm run dev"
    echo ""
    echo -e "${BLUE}Terminal 3 - Hardhat Local Blockchain (Optional):${NC}"
    echo "cd $CONTRACTS_DIR && npx hardhat node"
    echo ""
    echo -e "${YELLOW}Or run this command to start all services automatically:${NC}"
    echo "bash $PROJECT_DIR/start-all.sh"
    echo ""
    echo -e "${GREEN}Access the application at: http://localhost:5173${NC}"
    echo -e "${GREEN}Backend API at: http://localhost:3001${NC}"
    echo -e "${GREEN}Blockchain at: http://127.0.0.1:8545${NC}"
    echo ""
}

# Run main function
main

# Optional: Start services automatically
read -p "Would you like to start all services now? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    print_status "Starting all services..."
    
    # Start backend
    print_status "Starting backend server..."
    cd "$BACKEND_DIR"
    npm run dev &
    BACKEND_PID=$!
    sleep 2
    
    # Start frontend
    print_status "Starting frontend development server..."
    cd "$FRONTEND_DIR"
    npm run dev &
    FRONTEND_PID=$!
    sleep 2
    
    print_success "Services started!"
    print_status "Backend PID: $BACKEND_PID"
    print_status "Frontend PID: $FRONTEND_PID"
    echo ""
    echo -e "${GREEN}ProTrack is now running!${NC}"
    echo "Frontend: http://localhost:5173"
    echo "Backend: http://localhost:3001"
    echo ""
    echo "Press Ctrl+C to stop all services"
    
    # Wait for services
    wait
fi
