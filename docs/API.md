# ProTrack API Documentation

This document provides detailed information about the ProTrack RESTful API endpoints, request/response formats, authentication methods, and error handling.

## Table of Contents

1. [Authentication](#authentication)
2. [Products](#products)
3. [Supply Chain](#supply-chain)
4. [IoT Data](#iot-data)
5. [Verification](#verification)
6. [Users](#users)
7. [Companies](#companies)
8. [Alerts](#alerts)
9. [MPC Keys](#mpc-keys)
10. [Error Handling](#error-handling)

## Authentication

### Login

```
POST /auth/login
```

**Request Body:**

```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**

```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "role": "manufacturer",
    "company_id": "uuid",
    "wallet_address": "0x123..."
  },
  "token": "jwt_token"
}
```

### Register

```
POST /auth/register
```

**Request Body:**

```json
{
  "email": "user@example.com",
  "password": "password123",
  "role": "manufacturer",
  "company_name": "Company Name"
}
```

**Response:**

```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "role": "manufacturer",
    "company_id": "uuid"
  },
  "token": "jwt_token"
}
```

### Logout

```
POST /auth/logout
```

**Headers:**

```
Authorization: Bearer <token>
```

**Response:**

```json
{
  "message": "Successfully logged out"
}
```

### Get Current User

```
GET /auth/user
```

**Headers:**

```
Authorization: Bearer <token>
```

**Response:**

```json
{
  "id": "uuid",
  "email": "user@example.com",
  "role": "manufacturer",
  "company_id": "uuid",
  "wallet_address": "0x123...",
  "created_at": "2023-01-01T00:00:00Z"
}
```

## Products

### Get All Products

```
GET /products
```

**Query Parameters:**

- `status` (optional): Filter by product status
- `manufacturer_id` (optional): Filter by manufacturer
- `owner_id` (optional): Filter by current owner
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10, max: 100)

**Headers:**

```
Authorization: Bearer <token>
```

**Response:**

```json
{
  "products": [
    {
      "id": "uuid",
      "token_id": 12345,
      "rfid_hash": "hash123",
      "name": "Product Name",
      "description": "Product description",
      "manufacturer_id": "uuid",
      "batch_number": "BATCH001",
      "manufacturing_date": "2023-01-01T00:00:00Z",
      "expiry_date": "2024-01-01T00:00:00Z",
      "current_owner_id": "uuid",
      "status": "manufactured",
      "ipfs_uri": "ipfs://hash",
      "created_at": "2023-01-01T00:00:00Z",
      "updated_at": "2023-01-01T00:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "pages": 10
  }
}
```

### Create Product

```
POST /products
```

**Headers:**

```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**

```json
{
  "name": "Product Name",
  "description": "Product description",
  "batch_number": "BATCH001",
  "manufacturing_date": "2023-01-01T00:00:00Z",
  "expiry_date": "2024-01-01T00:00:00Z",
  "metadata": {
    "category": "electronics",
    "weight": "1.5kg"
  }
}
```

**Response:**

```json
{
  "id": "uuid",
  "token_id": 12345,
  "rfid_hash": "hash123",
  "name": "Product Name",
  "description": "Product description",
  "manufacturer_id": "uuid",
  "batch_number": "BATCH001",
  "manufacturing_date": "2023-01-01T00:00:00Z",
  "expiry_date": "2024-01-01T00:00:00Z",
  "current_owner_id": "uuid",
  "status": "manufactured",
  "ipfs_uri": "ipfs://hash",
  "created_at": "2023-01-01T00:00:00Z",
  "updated_at": "2023-01-01T00:00:00Z"
}
```

### Get Product by ID

```
GET /products/{id}
```

**Headers:**

```
Authorization: Bearer <token>
```

**Response:**

```json
{
  "id": "uuid",
  "token_id": 12345,
  "rfid_hash": "hash123",
  "name": "Product Name",
  "description": "Product description",
  "manufacturer": {
    "id": "uuid",
    "name": "Manufacturer Name",
    "address": "123 Main St"
  },
  "batch_number": "BATCH001",
  "manufacturing_date": "2023-01-01T00:00:00Z",
  "expiry_date": "2024-01-01T00:00:00Z",
  "current_owner": {
    "id": "uuid",
    "name": "Current Owner Name"
  },
  "status": "manufactured",
  "ipfs_uri": "ipfs://hash",
  "certifications": ["ISO9001", "CE"],
  "created_at": "2023-01-01T00:00:00Z",
  "updated_at": "2023-01-01T00:00:00Z"
}
```

### Update Product

```
PUT /products/{id}
```

**Headers:**

```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**

```json
{
  "status": "packaged",
  "current_owner_id": "new_owner_uuid",
  "location": "Warehouse A"
}
```

**Response:**

```json
{
  "id": "uuid",
  "token_id": 12345,
  "rfid_hash": "hash123",
  "name": "Product Name",
  "description": "Product description",
  "manufacturer_id": "uuid",
  "batch_number": "BATCH001",
  "manufacturing_date": "2023-01-01T00:00:00Z",
  "expiry_date": "2024-01-01T00:00:00Z",
  "current_owner_id": "new_owner_uuid",
  "status": "packaged",
  "ipfs_uri": "ipfs://hash",
  "created_at": "2023-01-01T00:00:00Z",
  "updated_at": "2023-01-02T00:00:00Z"
}
```

### Delete Product

```
DELETE /products/{id}
```

**Headers:**

```
Authorization: Bearer <token>
```

**Response:**

```json
{
  "message": "Product deleted successfully"
}
```

## Supply Chain

### Get Product History

```
GET /products/{id}/history
```

**Headers:**

```
Authorization: Bearer <token>
```

**Response:**

```json
{
  "product_id": "uuid",
  "history": [
    {
      "id": "uuid",
      "event_type": "manufactured",
      "description": "Product manufactured",
      "actor": {
        "id": "uuid",
        "name": "Manufacturer Name"
      },
      "timestamp": "2023-01-01T00:00:00Z",
      "location": "Factory A",
      "data": {
        "temperature": "22°C"
      }
    },
    {
      "id": "uuid",
      "event_type": "packaged",
      "description": "Product packaged",
      "actor": {
        "id": "uuid",
        "name": "Packager Name"
      },
      "timestamp": "2023-01-02T00:00:00Z",
      "location": "Packaging Facility B"
    }
  ]
}
```

### Initiate Transfer

```
POST /products/{id}/transfer
```

**Headers:**

```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**

```json
{
  "to_company_id": "uuid",
  "signatures": ["sig1", "sig2"],
  "location": "Shipping Dock A"
}
```

**Response:**

```json
{
  "id": "uuid",
  "product_id": "uuid",
  "from_company_id": "uuid",
  "to_company_id": "uuid",
  "transaction_hash": "0x123...",
  "status": "completed",
  "transfer_date": "2023-01-03T00:00:00Z",
  "created_at": "2023-01-03T00:00:00Z",
  "updated_at": "2023-01-03T00:00:00Z"
}
```

### Get Transfers

```
GET /transfers
```

**Query Parameters:**

- `product_id` (optional): Filter by product
- `status` (optional): Filter by status
- `from_company_id` (optional): Filter by sender
- `to_company_id` (optional): Filter by recipient
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10, max: 100)

**Headers:**

```
Authorization: Bearer <token>
```

**Response:**

```json
{
  "transfers": [
    {
      "id": "uuid",
      "product_id": "uuid",
      "product": {
        "name": "Product Name",
        "batch_number": "BATCH001"
      },
      "from_company": {
        "id": "uuid",
        "name": "Sender Company"
      },
      "to_company": {
        "id": "uuid",
        "name": "Recipient Company"
      },
      "transaction_hash": "0x123...",
      "status": "completed",
      "transfer_date": "2023-01-03T00:00:00Z",
      "created_at": "2023-01-03T00:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 50,
    "pages": 5
  }
}
```

## IoT Data

### Submit IoT Data

```
POST /iot/data
```

**Headers:**

```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**

```json
{
  "product_id": "uuid",
  "sensor_type": "temperature",
  "sensor_id": "TEMP001",
  "value": {
    "temperature": 22.5,
    "unit": "celsius"
  },
  "timestamp": "2023-01-01T12:00:00Z",
  "location": {
    "latitude": 40.7128,
    "longitude": -74.006
  }
}
```

**Response:**

```json
{
  "id": "uuid",
  "product_id": "uuid",
  "sensor_type": "temperature",
  "sensor_id": "TEMP001",
  "value": {
    "temperature": 22.5,
    "unit": "celsius"
  },
  "timestamp": "2023-01-01T12:00:00Z",
  "blockchain_verified": false,
  "created_at": "2023-01-01T12:00:00Z"
}
```

### Get IoT Data

```
GET /iot/data
```

**Query Parameters:**

- `product_id` (optional): Filter by product
- `sensor_type` (optional): Filter by sensor type
- `start_date` (optional): Filter by start date
- `end_date` (optional): Filter by end date
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10, max: 100)

**Headers:**

```
Authorization: Bearer <token>
```

**Response:**

```json
{
  "data": [
    {
      "id": "uuid",
      "product_id": "uuid",
      "product": {
        "name": "Product Name",
        "batch_number": "BATCH001"
      },
      "sensor_type": "temperature",
      "sensor_id": "TEMP001",
      "value": {
        "temperature": 22.5,
        "unit": "celsius"
      },
      "timestamp": "2023-01-01T12:00:00Z",
      "blockchain_verified": true,
      "transaction_hash": "0x123..."
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 1000,
    "pages": 100
  }
}
```

### Get IoT Data by Product

```
GET /products/{id}/iot-data
```

**Query Parameters:**

- `sensor_type` (optional): Filter by sensor type
- `start_date` (optional): Filter by start date
- `end_date` (optional): Filter by end date
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10, max: 100)

**Headers:**

```
Authorization: Bearer <token>
```

**Response:**

```json
{
  "data": [
    {
      "id": "uuid",
      "sensor_type": "temperature",
      "sensor_id": "TEMP001",
      "value": {
        "temperature": 22.5,
        "unit": "celsius"
      },
      "timestamp": "2023-01-01T12:00:00Z",
      "blockchain_verified": true
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 50,
    "pages": 5
  }
}
```

## Verification

### Verify Product by RFID

```
POST /rfid/verify
```

**Headers:**

```
Content-Type: application/json
```

**Request Body:**

```json
{
  "rfid_hash": "hash123"
}
```

**Response:**

```json
{
  "verified": true,
  "product": {
    "id": "uuid",
    "token_id": 12345,
    "name": "Product Name",
    "description": "Product description",
    "manufacturer": "Manufacturer Name",
    "manufacturing_date": "2023-01-01T00:00:00Z",
    "expiry_date": "2024-01-01T00:00:00Z",
    "status": "delivered",
    "certifications": ["ISO9001", "CE"]
  },
  "blockchain_proof": {
    "transaction_hash": "0x123...",
    "block_number": 1234567,
    "timestamp": "2023-01-01T00:00:00Z",
    "validator": "0x456..."
  },
  "zk_proof_valid": true
}
```

### Get Verification Certificate

```
GET /verify/{id}/certificate
```

**Headers:**

```
Authorization: Bearer <token>
```

**Response:**

```json
{
  "certificate_id": "uuid",
  "product_id": 12345,
  "product_name": "Product Name",
  "manufacturer": "Manufacturer Name",
  "verification_date": "2023-01-01T00:00:00Z",
  "blockchain_proof": {
    "transaction_hash": "0x123...",
    "block_number": 1234567
  },
  "zk_proof_valid": true,
  "signature": "0x789..."
}
```

## Users

### Get All Users

```
GET /users
```

**Query Parameters:**

- `role` (optional): Filter by role
- `company_id` (optional): Filter by company
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10, max: 100)

**Headers:**

```
Authorization: Bearer <token>
```

**Response:**

```json
{
  "users": [
    {
      "id": "uuid",
      "email": "user@example.com",
      "role": "manufacturer",
      "company": {
        "id": "uuid",
        "name": "Company Name"
      },
      "wallet_address": "0x123...",
      "created_at": "2023-01-01T00:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 50,
    "pages": 5
  }
}
```

### Get User by ID

```
GET /users/{id}
```

**Headers:**

```
Authorization: Bearer <token>
```

**Response:**

```json
{
  "id": "uuid",
  "email": "user@example.com",
  "role": "manufacturer",
  "company": {
    "id": "uuid",
    "name": "Company Name",
    "address": "123 Main St",
    "contact_info": {
      "phone": "+1234567890",
      "website": "https://company.com"
    }
  },
  "wallet_address": "0x123...",
  "created_at": "2023-01-01T00:00:00Z",
  "updated_at": "2023-01-01T00:00:00Z"
}
```

### Update User

```
PUT /users/{id}
```

**Headers:**

```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**

```json
{
  "role": "packager",
  "wallet_address": "0x456..."
}
```

**Response:**

```json
{
  "id": "uuid",
  "email": "user@example.com",
  "role": "packager",
  "company_id": "uuid",
  "wallet_address": "0x456...",
  "created_at": "2023-01-01T00:00:00Z",
  "updated_at": "2023-01-02T00:00:00Z"
}
```

## Companies

### Get All Companies

```
GET /companies
```

**Query Parameters:**

- `type` (optional): Filter by company type
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10, max: 100)

**Headers:**

```
Authorization: Bearer <token>
```

**Response:**

```json
{
  "companies": [
    {
      "id": "uuid",
      "name": "Company Name",
      "type": "manufacturer",
      "address": "123 Main St",
      "contact_info": {
        "phone": "+1234567890",
        "email": "contact@company.com",
        "website": "https://company.com"
      },
      "created_at": "2023-01-01T00:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "pages": 3
  }
}
```

### Create Company

```
POST /companies
```

**Headers:**

```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**

```json
{
  "name": "New Company",
  "type": "manufacturer",
  "address": "456 Oak Ave",
  "contact_info": {
    "phone": "+1987654321",
    "email": "info@newcompany.com",
    "website": "https://newcompany.com"
  }
}
```

**Response:**

```json
{
  "id": "uuid",
  "name": "New Company",
  "type": "manufacturer",
  "address": "456 Oak Ave",
  "contact_info": {
    "phone": "+1987654321",
    "email": "info@newcompany.com",
    "website": "https://newcompany.com"
  },
  "created_at": "2023-01-02T00:00:00Z",
  "updated_at": "2023-01-02T00:00:00Z"
}
```

## Alerts

### Get Alerts

```
GET /alerts
```

**Query Parameters:**

- `product_id` (optional): Filter by product
- `alert_type` (optional): Filter by alert type
- `severity` (optional): Filter by severity
- `resolved` (optional): Filter by resolved status
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10, max: 100)

**Headers:**

```
Authorization: Bearer <token>
```

**Response:**

```json
{
  "alerts": [
    {
      "id": "uuid",
      "product_id": "uuid",
      "product": {
        "name": "Product Name",
        "batch_number": "BATCH001"
      },
      "alert_type": "temperature",
      "severity": "warning",
      "message": "Temperature exceeded threshold",
      "data": {
        "current_temp": 25.5,
        "threshold": 25.0
      },
      "resolved": false,
      "created_at": "2023-01-01T12:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 5,
    "pages": 1
  }
}
```

### Create Alert

```
POST /alerts
```

**Headers:**

```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**

```json
{
  "product_id": "uuid",
  "alert_type": "tamper",
  "severity": "critical",
  "message": "Product tampering detected",
  "data": {
    "sensor_id": "TAMPER001",
    "timestamp": "2023-01-01T12:00:00Z"
  }
}
```

**Response:**

```json
{
  "id": "uuid",
  "product_id": "uuid",
  "alert_type": "tamper",
  "severity": "critical",
  "message": "Product tampering detected",
  "data": {
    "sensor_id": "TAMPER001",
    "timestamp": "2023-01-01T12:00:00Z"
  },
  "resolved": false,
  "created_at": "2023-01-01T12:00:00Z"
}
```

### Resolve Alert

```
PUT /alerts/{id}/resolve
```

**Headers:**

```
Authorization: Bearer <token>
```

**Response:**

```json
{
  "id": "uuid",
  "product_id": "uuid",
  "alert_type": "tamper",
  "severity": "critical",
  "message": "Product tampering detected",
  "data": {
    "sensor_id": "TAMPER001",
    "timestamp": "2023-01-01T12:00:00Z"
  },
  "resolved": true,
  "resolved_by": "uuid",
  "resolved_at": "2023-01-01T13:00:00Z",
  "created_at": "2023-01-01T12:00:00Z"
}
```

## MPC Keys

### Get User MPC Keys

```
GET /mpc/keys
```

**Query Parameters:**

- `product_id` (optional): Filter by product

**Headers:**

```
Authorization: Bearer <token>
```

**Response:**

```json
{
  "keys": [
    {
      "id": "uuid",
      "key_id": "key123",
      "product_id": "uuid",
      "owner_id": "uuid",
      "public_key": "0x123...",
      "active": true,
      "created_at": "2023-01-01T00:00:00Z",
      "expires_at": "2023-12-31T00:00:00Z"
    }
  ]
}
```

### Create MPC Key

```
POST /mpc/keys
```

**Headers:**

```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**

```json
{
  "key_id": "key123",
  "product_id": "uuid",
  "encrypted_share": "encrypted_key_share",
  "public_key": "0x123...",
  "expires_at": "2023-12-31T00:00:00Z"
}
```

**Response:**

```json
{
  "id": "uuid",
  "key_id": "key123",
  "product_id": "uuid",
  "owner_id": "uuid",
  "encrypted_share": "encrypted_key_share",
  "public_key": "0x123...",
  "active": true,
  "created_at": "2023-01-01T00:00:00Z",
  "expires_at": "2023-12-31T00:00:00Z"
}
```

## Error Handling

### Error Response Format

All error responses follow this format:

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": {
      "field": "specific field that caused the error"
    }
  }
}
```

### Common Error Codes

#### Authentication Errors

- `UNAUTHORIZED` (401): Missing or invalid authentication token
- `FORBIDDEN` (403): Insufficient permissions for the requested action
- `INVALID_CREDENTIALS` (401): Invalid email or password

#### Validation Errors

- `VALIDATION_ERROR` (400): Request data failed validation
- `MISSING_REQUIRED_FIELD` (400): Required field is missing
- `INVALID_FORMAT` (400): Field value has invalid format

#### Resource Errors

- `NOT_FOUND` (404): Requested resource not found
- `ALREADY_EXISTS` (409): Resource already exists
- `CONFLICT` (409): Resource conflict

#### Server Errors

- `INTERNAL_ERROR` (500): Unexpected server error
- `SERVICE_UNAVAILABLE` (503): Service temporarily unavailable
- `TIMEOUT` (408): Request timeout

### Example Error Responses

#### Validation Error

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "details": {
      "email": "Invalid email format",
      "password": "Password must be at least 8 characters"
    }
  }
}
```

#### Resource Not Found

```json
{
  "error": {
    "code": "NOT_FOUND",
    "message": "Product not found",
    "details": {
      "id": "invalid-uuid"
    }
  }
}
```

#### Unauthorized Access

```json
{
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Authentication required",
    "details": {
      "reason": "Missing or invalid token"
    }
  }
}
```

## Rate Limiting

API endpoints are rate-limited to prevent abuse:

- **Anonymous requests**: 100 requests per hour
- **Authenticated requests**: 1000 requests per hour
- **Admin requests**: 5000 requests per hour

Exceeding rate limits will result in a `429 TOO_MANY_REQUESTS` response.

## WebSockets

Real-time updates are available through WebSocket connections:

### Connection

```
WebSocket: wss://api.protrack.com/ws
```

### Events

- `product.updated`: Product information changed
- `transfer.created`: New transfer initiated
- `iot.data`: New IoT data received
- `alert.created`: New alert generated
- `verification.completed`: Product verification completed

### Subscription

```javascript
const ws = new WebSocket("wss://api.protrack.com/ws");

ws.onopen = function (event) {
  // Subscribe to events
  ws.send(
    JSON.stringify({
      type: "subscribe",
      channels: ["product.updated", "iot.data"],
    })
  );
};

ws.onmessage = function (event) {
  const data = JSON.parse(event.data);
  // Handle real-time updates
};
```

---

This API documentation provides comprehensive information about all available endpoints. For implementation details and examples, refer to the source code and integration guides.
