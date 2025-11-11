#!/bin/bash

# Script to start the ProTrack frontend
# This script will start the frontend development server

set -e

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "Starting ProTrack Frontend..."
echo "============================"

# Check if node_modules exists, if not install dependencies
if [ ! -d "$PROJECT_DIR/node_modules" ]; then
    echo "Installing dependencies..."
    cd "$PROJECT_DIR"
    npm install --legacy-peer-deps
fi

# Start the frontend
echo "Starting frontend development server..."
echo "Frontend will be available at: http://localhost:5174"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

cd "$PROJECT_DIR"
npm run dev