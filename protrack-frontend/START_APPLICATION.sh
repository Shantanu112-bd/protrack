#!/bin/bash

# ProTrack Application Startup Script
# This script ensures all dependencies are installed and starts the application

echo "🚀 ProTrack Supply Chain Management System"
echo "=========================================="
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    echo "   Visit: https://nodejs.org/"
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version 18+ required. Current version: $(node -v)"
    echo "   Please update Node.js: https://nodejs.org/"
    exit 1
fi

echo "✅ Node.js $(node -v) detected"

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Please run this script from the protrack-frontend directory"
    exit 1
fi

echo "✅ In correct directory"

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
    if [ $? -ne 0 ]; then
        echo "❌ Failed to install dependencies"
        exit 1
    fi
    echo "✅ Dependencies installed"
else
    echo "✅ Dependencies already installed"
fi

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "❌ .env file not found. Please create it with required environment variables."
    echo "   See .env.example for reference"
    exit 1
fi

echo "✅ Environment configuration found"

# Run type check
echo "🔍 Running type check..."
npm run type-check
if [ $? -ne 0 ]; then
    echo "⚠️  Type check warnings found, but continuing..."
fi

# Start the development server
echo ""
echo "🎯 Starting ProTrack Application..."
echo "   Dashboard will be available at: http://localhost:5173"
echo "   Landing page will be available at: http://localhost:5173/"
echo ""
echo "📱 Features Available:"
echo "   • Wallet Connection (MetaMask)"
echo "   • Product Management & NFT Minting"
echo "   • Shipment Tracking"
echo "   • IoT Sensor Monitoring"
echo "   • Supply Chain Analytics"
echo "   • Quality Assurance"
echo "   • Compliance Management"
echo ""
echo "🔧 To stop the application, press Ctrl+C"
echo ""

# Start the development server
npm run dev