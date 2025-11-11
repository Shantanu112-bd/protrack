# ProTrack Technical Documentation

This document provides detailed technical information about the ProTrack supply chain tracking system, including architecture, smart contracts, APIs, and implementation details.

## Table of Contents

1. [System Architecture](#system-architecture)
2. [Smart Contracts](#smart-contracts)
3. [Frontend Architecture](#frontend-architecture)
4. [Backend Services](#backend-services)
5. [API Documentation](#api-documentation)
6. [Database Schema](#database-schema)
7. [Security Implementation](#security-implementation)
8. [IoT Integration](#iot-integration)
9. [Deployment Guide](#deployment-guide)
10. [Testing Strategy](#testing-strategy)

## System Architecture

### High-Level Overview

ProTrack follows a microservices architecture with the following components:

```
┌─────────────────┐    ┌──────────────────┐    ┌──────────────────┐
│   Frontend      │    │   Blockchain     │    │     Backend      │
│   (React)       │◄──►│   (Ethereum)     │◄──►│   (Supabase)     │
└─────────────────┘    └──────────────────┘    └──────────────────┘
                              ▲                         ▲
                              │                         │
                              ▼                         ▼
                    ┌──────────────────┐    ┌──────────────────┐
                    │   IoT Devices    │    │   Oracle Nodes   │
                    │   (LoRa/MQTT)    │    │  (Chainlink)     │
                    └──────────────────┘    └──────────────────┘
```

### Component Details

#### Frontend (React + TypeScript)

- Built with React 18 and TypeScript
- Uses Tailwind CSS for styling
- Implements responsive design for all devices
- State management with Redux Toolkit
- Web3 integration with ethers.js
- Real-time updates with WebSocket connections

#### Blockchain (Solidity)

- Ethereum-compatible smart contracts
- ERC-721 NFT standard for product tokens
- Multi-Party Computation for secure transactions
- Chainlink oracles for IoT data validation
- IPFS integration for metadata storage

#### Backend (Supabase)

- PostgreSQL database with real-time capabilities
- Authentication and authorization
- RESTful API endpoints
- Real-time subscriptions
- Storage for large files and documents

#### IoT Layer (LoRa/MQTT)

- Low-power wide-area network connectivity
- MQTT protocol for device communication
- Gateway infrastructure for data aggregation
- Device management and firmware updates

## Smart Contracts

### ProTrackToken.sol

#### Key Features

- ERC-721 compliant NFT implementation
- Optional SBT (Soulbound Token) mode
- Product metadata storage
- Supply chain history tracking
- Role-based access control

#### Main Functions

```solidity
function createProduct(
    string memory name,
    string memory description,
    string memory tokenURI
) public onlyRole(MINTER_ROLE) returns (uint256)

function updateProductStatus(uint256 tokenId, ProductStatus status)
    public onlyRole(MINTER_ROLE)

function updateProductLocation(uint256 tokenId, string memory location)
    public onlyRole(MINTER_ROLE)

function addToProductHistory(uint256 tokenId, string memory historyItem)
    public onlyRole(MINTER_ROLE)

function getProduct(uint256 tokenId)
    public view returns (
        string memory name,
        string memory description,
        address manufacturer,
        uint256 manufactureDate,
        ProductStatus status,
        string memory location
    )
```

#### Events

```solidity
event ProductCreated(uint256 indexed tokenId, string name, address manufacturer)
event ProductStatusUpdated(uint256 indexed tokenId, ProductStatus status)
event ProductLocationUpdated(uint256 indexed tokenId, string location)
```

### ProTrackMPC.sol

#### Key Features

- Multi-Party Computation wallet
- Threshold signature scheme
- Key management for supply chain participants
- Product verification capabilities
- Secure transaction approvals

#### Main Functions

```solidity
function createKey(
    bytes32 keyId,
    bytes memory publicKey,
    uint256 threshold,
    address[] memory initialParties,
    bytes32 purpose
) public onlyRole(ADMIN_ROLE)

function initiateTransaction(
    bytes32 keyId,
    bytes32 operationHash
) public returns (bytes32)

function approveTransaction(bytes32 txId, bytes memory signature) public

function verifyProduct(
    bytes32 productId,
    bytes32 keyId,
    bytes memory signature
) public returns (bool)
```

#### Events

```solidity
event KeyCreated(bytes32 indexed keyId, bytes publicKey, uint256 threshold, bytes32 purpose)
event TransactionInitiated(bytes32 indexed txId, bytes32 indexed keyId, address initiator)
event TransactionApproved(bytes32 indexed txId, address approver)
event ProductVerified(bytes32 indexed productId, bytes32 indexed keyId, bool success)
```

### ProTrackOracle.sol

#### Key Features

- Chainlink oracle integration
- IoT data validation
- GPS coordinate verification
- Device signature validation
- Data integrity checking

#### Main Functions

```solidity
function requestIoTValidation(
    uint256 tokenId,
    string memory dataType,
    bytes memory data,
    string memory source
) public onlyRole(DATA_PROVIDER_ROLE) returns (bytes32)

function requestGPSValidation(
    uint256 tokenId,
    string memory latitude,
    string memory longitude,
    uint256 timestamp,
    string memory source
) public onlyRole(DATA_PROVIDER_ROLE) returns (bytes32)
```

## Frontend Architecture

### Component Structure

```
src/
├── components/           # Reusable UI components
├── pages/               # Page-level components
├── services/            # Business logic services
├── hooks/               # Custom React hooks
├── contexts/            # React contexts
├── contracts/           # Contract ABIs and configs
├── config/              # Application configuration
├── lib/                 # Utility functions
└── styles/              # CSS and styling files
```

### Key Components

#### EnhancedRFIDScanner.tsx

- Camera-based RFID scanning
- Barcode and QR code recognition
- Real-time product identification
- Error handling and user feedback

#### EnhancedProductVerification.tsx

- Blockchain-based product verification
- Zero-knowledge proof validation
- Certificate generation
- Verification history tracking

#### SupplyChainMPCApprovals.tsx

- Multi-party approval workflow
- Threshold signature management
- Transaction status tracking
- User notification system

#### EnhancedSupplyChainDashboard.tsx

- Supply chain visualization
- Map integration with GPS tracking
- IoT sensor data display
- Alert management interface

### State Management

- Redux Toolkit for global state
- React Context for theme and user data
- Local component state for UI interactions
- Real-time subscriptions for live updates

### Styling

- Tailwind CSS for utility-first styling
- Custom CSS modules for complex components
- Responsive design with mobile-first approach
- Dark mode support

## Backend Services

### Supabase Integration

- PostgreSQL database with real-time capabilities
- Authentication with email/password and OAuth
- Row Level Security (RLS) for data protection
- Storage for files and documents
- Edge functions for server-side logic

### API Endpoints

#### Authentication

```
POST /auth/login
POST /auth/register
POST /auth/logout
GET /auth/user
```

#### Product Management

```
GET /products
POST /products
GET /products/:id
PUT /products/:id
DELETE /products/:id
```

#### Supply Chain Operations

```
GET /transfers
POST /transfers
GET /transfers/:id
PUT /transfers/:id
```

#### IoT Data

```
GET /iot/data
POST /iot/data
GET /iot/data/:id
```

#### Verification

```
POST /verify
GET /verify/:id
GET /certificates/:id
```

## Database Schema

### Users Table

```sql
CREATE TABLE users (
    id UUID PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    role TEXT NOT NULL,
    company_id UUID REFERENCES companies(id),
    wallet_address TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

### Products Table

```sql
CREATE TABLE products (
    id UUID PRIMARY KEY,
    token_id BIGINT UNIQUE,
    rfid_hash TEXT UNIQUE,
    product_hash TEXT,
    name TEXT,
    description TEXT,
    manufacturer_id UUID REFERENCES companies(id),
    batch_number TEXT,
    manufacturing_date TIMESTAMP,
    expiry_date TIMESTAMP,
    current_owner_id UUID REFERENCES companies(id),
    status TEXT,
    ipfs_uri TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

### IoT Data Table

```sql
CREATE TABLE iot_data (
    id UUID PRIMARY KEY,
    product_id UUID REFERENCES products(id),
    sensor_type TEXT,
    sensor_id TEXT,
    value JSONB,
    timestamp TIMESTAMP,
    blockchain_verified BOOLEAN,
    transaction_hash TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);
```

### MPC Keys Table

```sql
CREATE TABLE mpc_keys (
    id UUID PRIMARY KEY,
    key_id TEXT,
    product_id UUID REFERENCES products(id),
    owner_id UUID REFERENCES users(id),
    encrypted_share TEXT,
    public_key TEXT,
    active BOOLEAN,
    created_at TIMESTAMP DEFAULT NOW(),
    expires_at TIMESTAMP
);
```

## Security Implementation

### Wallet Security

- MetaMask integration for secure key management
- Transaction signing with hardware wallet support
- Session management with automatic logout
- Multi-signature wallet support

### Data Encryption

- AES-256 encryption for sensitive data
- End-to-end encryption for communications
- Key rotation every 90 days
- Secure key storage with hardware security modules

### Zero-Knowledge Proofs

- Privacy-preserving verification
- zk-SNARK implementation for product authenticity
- Selective disclosure of product attributes
- Compliance with GDPR and other privacy regulations

### Access Control

- Role-based access control (RBAC)
- Attribute-based access control (ABAC)
- Multi-factor authentication (MFA)
- Audit logging for all access attempts

## IoT Integration

### Device Management

- Device registration with unique identifiers
- Firmware update management
- Device health monitoring
- Certificate-based authentication

### Data Collection

- Temperature, humidity, pressure, vibration sensors
- GPS location tracking
- Tamper detection
- Real-time data streaming

### Protocol Support

- LoRaWAN for long-range communication
- MQTT for message queuing
- HTTP/HTTPS for RESTful APIs
- CoAP for constrained devices

### Data Validation

- Chainlink oracle verification
- Statistical anomaly detection
- Cross-device data correlation
- Blockchain timestamping

## Deployment Guide

### Prerequisites

- Node.js 16+
- Docker and Docker Compose
- Ethereum wallet (MetaMask)
- Supabase account
- Chainlink node access

### Local Development Setup

1. Clone the repository:

```bash
git clone https://github.com/your-username/protrack.git
cd protrack
```

2. Install dependencies:

```bash
# Smart contracts
cd contracts
npm install

# Frontend
cd ../protrack-frontend
npm install
```

3. Start local blockchain:

```bash
npx hardhat node
```

4. Deploy contracts:

```bash
npx hardhat run scripts/deploy.js --network localhost
```

5. Start frontend:

```bash
npm run dev
```

### Production Deployment

#### Smart Contracts

1. Audit contracts with third-party security firm
2. Deploy to testnet for testing
3. Deploy to mainnet
4. Verify contracts on block explorer

#### Frontend

1. Build production version:

```bash
npm run build
```

2. Deploy to CDN or hosting service
3. Configure environment variables
4. Set up SSL certificate

#### Backend

1. Set up Supabase project
2. Configure database schema
3. Set up authentication providers
4. Configure Row Level Security policies

## Testing Strategy

### Unit Testing

- Jest for JavaScript/TypeScript tests
- Hardhat for Solidity contract tests
- 80%+ code coverage target
- Mock external dependencies

### Integration Testing

- End-to-end testing with Cypress
- API testing with Postman/Newman
- Blockchain interaction testing
- IoT device simulation

### Security Testing

- Smart contract security audits
- Penetration testing
- Static code analysis
- Dependency vulnerability scanning

### Performance Testing

- Load testing with Artillery
- Stress testing database queries
- Blockchain gas optimization
- Frontend performance monitoring

### Test Coverage

- Component unit tests
- Contract function tests
- API endpoint tests
- User journey tests
- Security vulnerability tests

## Monitoring and Logging

### Application Monitoring

- Frontend performance metrics
- API response times
- Database query performance
- User session tracking

### Blockchain Monitoring

- Transaction success rates
- Gas usage optimization
- Smart contract events
- Network health status

### IoT Device Monitoring

- Device uptime tracking
- Data transmission rates
- Battery level monitoring
- Error rate analysis

### Alerting System

- Email notifications
- Slack integration
- SMS alerts for critical issues
- Dashboard status indicators

## Future Enhancements

### Planned Features

- AI-powered anomaly detection
- Advanced analytics and reporting
- Mobile application development
- Cross-chain compatibility
- Decentralized identity integration

### Scalability Improvements

- Layer 2 solutions for reduced gas costs
- Sharding for database performance
- Caching strategies for frontend
- Load balancing for backend services

### Security Enhancements

- Advanced encryption algorithms
- Biometric authentication
- Hardware security modules
- Quantum-resistant cryptography

---

This technical documentation provides a comprehensive overview of the ProTrack system. For implementation details, refer to the source code and inline documentation.
