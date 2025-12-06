# Multi-stage build for ProTrack

# Build stage for smart contracts
FROM node:16-alpine AS contracts-builder

WORKDIR /app

# Copy package files
COPY contracts/package*.json ./
COPY contracts/hardhat.config.js ./

# Install dependencies
RUN npm ci

# Copy contracts
COPY contracts/contracts ./contracts
COPY contracts/scripts ./scripts

# Compile contracts
RUN npm run compile

# Build stage for frontend
FROM node:16-alpine AS frontend-builder

WORKDIR /app

# Copy package files
COPY protrack-frontend/package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY protrack-frontend/. .

# Build frontend
RUN npm run build

# Production stage
FROM node:16-alpine

WORKDIR /app

# Install hardhat globally for blockchain tools
RUN npm install -g hardhat

# Copy compiled contracts
COPY --from=contracts-builder /app/artifacts ./contracts/artifacts
COPY --from=contracts-builder /app/cache ./contracts/cache

# Copy built frontend
COPY --from=frontend-builder /app/dist ./protrack-frontend/dist

# Copy source files needed for development
COPY contracts ./contracts
COPY protrack-frontend ./protrack-frontend
COPY scripts ./scripts

# Install all dependencies
WORKDIR /app/contracts
RUN npm ci

WORKDIR /app/protrack-frontend
RUN npm ci

WORKDIR /app

# Expose ports
EXPOSE 3000 8545

# Default command
CMD ["sh", "-c", "cd contracts && npx hardhat node & cd protrack-frontend && npm run dev"]