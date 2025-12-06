# ProTrack Security Flow Documentation

## Overview

This document outlines the security mechanisms implemented in the ProTrack supply chain tracking system, including Multi-Party Computation (MPC) wallets, encryption key management, and audit logging.

## 1. MPC Wallet Security

### 1.1 Wallet Creation

- Each participant in the supply chain can create an MPC wallet with multiple signers
- A threshold value determines the minimum number of signatures required for transaction approval
- Wallets are created using the `createWallet` function in the MultisigGuard contract

### 1.2 Transaction Approval Process

1. A transaction is submitted by a wallet owner
2. Signers confirm the transaction using the `confirmTransaction` function
3. Once the threshold number of confirmations is reached, the transaction can be executed
4. Signers can revoke their confirmation before the threshold is reached

### 1.3 Security Features

- Protection against single point of failure
- Configurable security threshold based on risk level
- Immutable transaction history
- Role-based access control

## 2. Encryption Key Management

### 2.1 Key Generation

- AES keys are generated during product minting
- Separate keys are created for manufacturer and receiver
- Keys are stored encrypted in the smart contract
- Keys are rotated during each custody transfer

### 2.2 Key Rotation

- New keys are generated for each shipment event
- Sender and receiver keys are updated
- Previous keys are invalidated
- Keys have expiration timestamps

### 2.3 Local Decryption

- Receiver decrypts token data locally using their wallet key
- No private keys are stored on-chain
- Decryption happens off-chain in the client application

## 3. Audit Logging

### 3.1 Event Tracking

- All custody changes are logged with the `AuditLogRecorded` event
- Shipment events are tracked from request to confirmation
- IoT data recording is logged
- Key generation and rotation events are recorded

### 3.2 Log Data

- Actor address (who performed the action)
- Action description
- Entity ID (affected product/shipment)
- Timestamp

## 4. IoT Data Validation

### 4.1 Chainlink Oracle Integration

- IoT data is validated using Chainlink Functions
- Device signatures are cryptographically verified
- GPS coordinates are checked against expected zones
- Timestamps are validated for freshness

### 4.2 Data Integrity

- Validated data is marked as verified on-chain
- Invalid data triggers alerts
- All IoT data is stored with verification status

## 5. Access Control

### 5.1 Role-Based Permissions

- ADMIN_ROLE: System administrators
- MANUFACTURER_ROLE: Product manufacturers
- PACKAGER_ROLE: Product packaging entities
- TRANSPORTER_ROLE: Logistics companies
- WHOLESALER_ROLE: Wholesale distributors
- RETAILER_ROLE: Retail establishments
- CUSTOMER_ROLE: End consumers
- ORACLE_ROLE: IoT data oracles
- INSPECTOR_ROLE: Quality inspectors

### 5.2 Data Access

- Product data access is controlled through the `authorizedViewers` mapping
- Owners always have access to their products
- Authorized viewers can access specific product data
- Admins and inspectors have elevated access for oversight

## 6. Rate Limiting and API Security

### 6.1 Operation Throttling

- Critical operations are tracked to prevent abuse
- Duplicate operations are blocked using the `processedOperations` mapping
- Time-based rate limiting for high-frequency operations

### 6.2 Signature Verification

- API requests include cryptographic signatures
- Signatures are verified before processing
- Invalid signatures result in request rejection

## 7. Contract Security Audits

### 7.1 Recommended Tools

- Slither: Static analysis for vulnerabilities
- Mythril: Symbolic execution for security analysis
- Solhint: Code style and security linter

### 7.2 Best Practices Implemented

- ReentrancyGuard protection
- Access control restrictions
- Input validation
- Overflow protection (Solidity 0.8.x)
- Proper error handling

## 8. Supabase Security

### 8.1 Data Encryption

- Data at rest is encrypted
- Communication uses HTTPS/TLS
- Database access is controlled through role-based permissions

### 8.2 Device PKI Management

- Devices are registered with public keys
- Certificate-based authentication for IoT devices
- Regular certificate rotation

## 9. Incident Response

### 9.1 Product Recalls

- Admins can recall products using the `recallProduct` function
- Recalled products are marked and tracked
- All stakeholders are notified of recalls

### 9.2 Security Breach Protocol

- Audit logs provide forensic data
- Key rotation can isolate compromised keys
- Role permissions can be quickly adjusted

## 10. Compliance and Standards

### 10.1 Security Standards

- Implementation follows NIST cybersecurity framework
- Key management follows NIST SP 800-57 guidelines
- Access control follows ISO 27001 standards

### 10.2 Privacy Compliance

- Data minimization principles
- Right to erasure support (where technically feasible)
- Privacy by design in contract architecture
