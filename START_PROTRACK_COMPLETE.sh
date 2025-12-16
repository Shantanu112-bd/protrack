#!/bin/bash

# ProTrack Complete Startup Script
# One-command startup for the entire ProTrack system

echo "🚀 ProTrack Supply Chain Management System"
echo "=========================================="
echo "Starting complete system..."
echo ""

# Check if we're in the right directory
if [ ! -d "protrack-frontend" ]; then
    echo "❌ Please run this script from the main protrack directory"
    echo "   (The directory containing the protrack-frontend folder)"
    exit 1
fi

# Navigate to frontend directory
cd protrack-frontend

# Check Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js not found. Please install Node.js 18+ first."
    echo "   Visit: https://nodejs.org/"
    exit 1
fi

echo "✅ Node.js $(node -v) detected"

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
    if [ $? -ne 0 ]; then
        echo "❌ Failed to install dependencies"
        exit 1
    fi
fi

echo "✅ Dependencies ready"

# Check environment file
if [ ! -f ".env" ]; then
    echo "❌ .env file not found"
    echo "   Please ensure .env file exists with required configuration"
    exit 1
fi

echo "✅ Environment configured"

# Start the application
echo ""
echo "🎯 Starting ProTrack Application..."
echo ""
echo "📱 Application will be available at:"
echo "   • Landing Page: http://localhost:5173/"
echo "   • Dashboard: http://localhost:5173/dashboard"
echo ""
echo "🔧 Features Available:"
echo "   • Wallet Connection (MetaMask)"
echo "   • Product Management & NFT Minting"
echo "   • Shipment Tracking & Management"
echo "   • IoT Sensor Monitoring"
echo "   • Supply Chain Analytics"
echo "   • Quality Assurance Workflows"
echo "   • Compliance Management"
echo ""
echo "📚 For help, see USER_GUIDE.md"
echo "🛑 To stop, press Ctrl+C"
echo ""

# Start development server
npm run dev