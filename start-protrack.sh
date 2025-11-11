#!/bin/bash

# ProTrack Application Startup Script
# This script sets up and starts both frontend and backend servers

echo "🚀 Starting ProTrack Application Setup..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    print_error "npm is not installed. Please install npm first."
    exit 1
fi

print_status "Node.js version: $(node --version)"
print_status "npm version: $(npm --version)"

# Kill any existing processes on ports 3001 and 5173
print_status "Cleaning up existing processes..."
lsof -ti:3001 | xargs kill -9 2>/dev/null || true
lsof -ti:5173 | xargs kill -9 2>/dev/null || true

# Install frontend dependencies
print_status "Installing frontend dependencies..."
cd protrack-frontend
if [ ! -d "node_modules" ]; then
    npm install
    if [ $? -eq 0 ]; then
        print_success "Frontend dependencies installed successfully"
    else
        print_error "Failed to install frontend dependencies"
        exit 1
    fi
else
    print_status "Frontend dependencies already installed"
fi

# Install backend dependencies
print_status "Installing backend dependencies..."
cd backend
if [ ! -d "node_modules" ]; then
    npm install
    if [ $? -eq 0 ]; then
        print_success "Backend dependencies installed successfully"
    else
        print_error "Failed to install backend dependencies"
        exit 1
    fi
else
    print_status "Backend dependencies already installed"
fi

# Go back to root directory
cd ../..

print_success "All dependencies installed successfully!"

# Start backend server in background
print_status "Starting backend server..."
cd protrack-frontend/backend
npm run dev &
BACKEND_PID=$!

# Wait a moment for backend to start
sleep 3

# Check if backend is running
if curl -s http://localhost:3001/health > /dev/null; then
    print_success "Backend server is running on http://localhost:3001"
else
    print_warning "Backend server may not be fully started yet"
fi

# Start frontend server in background
print_status "Starting frontend server..."
cd ..
npm run dev &
FRONTEND_PID=$!

# Wait a moment for frontend to start
sleep 3

# Check if frontend is running
if curl -s http://localhost:5173 > /dev/null; then
    print_success "Frontend server is running on http://localhost:5173"
else
    print_warning "Frontend server may not be fully started yet"
fi

echo ""
echo "🎉 ProTrack Application is now running!"
echo ""
echo "📱 Frontend: http://localhost:5173"
echo "🔧 Backend:  http://localhost:3001"
echo ""
echo "📋 Available API Endpoints:"
echo "   GET  /health - Health check"
echo "   GET  /api/v1/status - API status"
echo "   POST /api/v1/auth/login - Login"
echo "   POST /api/v1/auth/register - Register"
echo "   GET  /api/v1/products - Get products"
echo "   POST /api/v1/products - Create product"
echo "   GET  /api/v1/ipfs/status - IPFS status"
echo "   GET  /api/v1/iot/devices - IoT devices"
echo "   GET  /api/v1/blockchain/status - Blockchain status"
echo "   GET  /api/v1/analytics/metrics - Analytics"
echo "   GET  /api/v1/notifications - Notifications"
echo ""
echo "🛑 To stop the servers, press Ctrl+C or run:"
echo "   kill $BACKEND_PID $FRONTEND_PID"
echo ""

# Function to cleanup on exit
cleanup() {
    print_status "Stopping servers..."
    kill $BACKEND_PID $FRONTEND_PID 2>/dev/null || true
    print_success "Servers stopped successfully"
    exit 0
}

# Set trap to cleanup on script exit
trap cleanup SIGINT SIGTERM

# Keep script running
print_status "Servers are running. Press Ctrl+C to stop."
wait
