# 📋 Complete User Data Storage Plan - All Components to Supabase

## 🎯 **Goal: Store ALL User Data from ALL Components in Supabase**

---

## ✅ **Components Already Storing Data in Supabase**

### 1. **Products.tsx** ✅
- **Table**: `products`
- **Status**: ✅ Fully integrated
- **Data Stored**: Product name, RFID tag, batch number, dates, location, category, price, weight, dimensions, temperature/humidity thresholds

### 2. **Shipments.tsx** ✅
- **Table**: `shipments`
- **Status**: ✅ Fully integrated
- **Data Stored**: Product ID, from/to parties, status, tracking info, timestamps

### 3. **IoTDashboard.tsx** ✅
- **Table**: `iot_data`
- **Status**: ✅ Fully integrated
- **Data Stored**: Product ID, temperature, humidity, GPS coordinates, battery level, signal strength

### 4. **QualityAssurance.tsx** ✅
- **Table**: `quality_tests`
- **Status**: ✅ Fully integrated
- **Data Stored**: Product ID, test type, parameters, result, score, notes

### 5. **ComplianceManagement.tsx** ✅
- **Table**: `compliance_records`
- **Status**: ✅ Fully integrated
- **Data Stored**: Product ID, regulation type, status, certificate number, dates, authority

### 6. **ProductForm.tsx** ✅
- **Table**: `products`
- **Status**: ✅ Fully integrated (recently updated)
- **Data Stored**: Product name, description, manufacturer, batch number

### 7. **ShipmentTracker.tsx** ✅
- **Table**: `shipments`
- **Status**: ✅ Fully integrated (recently updated)
- **Data Stored**: Shipment creation and status updates

### 8. **NFTProductCreation.tsx** ✅
- **Table**: `products`
- **Status**: ✅ Fully integrated
- **Data Stored**: Updates product with token_id after minting

---

## ⚠️ **Components That Need Supabase Integration**

### 1. **ScanRFID.tsx** ⚠️ NEEDS UPDATE
- **Current**: Stores scan history in component state and localStorage
- **Should Store In**: `scan_history` table
- **Data to Store**:
  - Product ID / RFID tag
  - Scanner ID
  - Action type (receive, quality_check, etc.)
  - Location
  - GPS coordinates
  - Verification result
  - Timestamp
  - Scanned by (user)

### 2. **AdvancedRFIDScanner.tsx** ⚠️ NEEDS UPDATE
- **Current**: Stores scan results and tokenize data in component state
- **Should Store In**: `scan_history` table + `products` table (for tokenization)
- **Data to Store**:
  - Scan results
  - Batch scan data
  - Tokenization requests
  - GPS location

### 3. **MintProduct.tsx** ⚠️ NEEDS UPDATE
- **Current**: Stores pending mints in component state
- **Should Store In**: `mint_requests` table
- **Data to Store**:
  - Product ID
  - Product name
  - Batch ID
  - Product hash
  - Mint type (batch/unit/sbt)
  - Status
  - Metadata URI
  - Approvers
  - Mint policy

### 4. **TransactionApproval.tsx** ⚠️ NEEDS UPDATE
- **Current**: Stores transactions in localStorage
- **Should Store In**: `mpc_transactions` table
- **Data to Store**:
  - Transaction ID
  - Key ID
  - Operation hash
  - Initiator
  - Status
  - Approvals
  - Execution status

### 5. **SensorManagement.tsx** ⚠️ NEEDS UPDATE
- **Current**: Stores sensor devices and readings in component state
- **Should Store In**: `sensor_devices` and `sensor_readings` tables
- **Data to Store**:
  - Device information (ID, name, type, status)
  - Battery level
  - Firmware version
  - Location
  - Sensor readings (value, unit, timestamp)

---

## 📊 **New Supabase Tables Created**

### 1. **scan_history**
- Stores all RFID scan events
- Links to products and users
- Tracks location, verification, and sync status

### 2. **mint_requests**
- Stores NFT minting requests
- Tracks approval workflow
- Links to products and users

### 3. **mpc_transactions**
- Stores multi-party computation transactions
- Tracks approvals and execution
- Links to users

### 4. **sensor_devices**
- Stores sensor device information
- Tracks device status and metadata
- Links to products and users

### 5. **sensor_readings**
- Stores individual sensor readings
- Links to devices and products
- Tracks alerts and metadata

---

## 🔧 **Implementation Steps**

### Step 1: Create Tables ✅
- [x] Create SQL script for missing tables
- [ ] Run SQL script in Supabase

### Step 2: Update Components
- [ ] Update ScanRFID.tsx to save scans to `scan_history`
- [ ] Update AdvancedRFIDScanner.tsx to save scans to `scan_history`
- [ ] Update MintProduct.tsx to save requests to `mint_requests`
- [ ] Update TransactionApproval.tsx to save transactions to `mpc_transactions`
- [ ] Update SensorManagement.tsx to save devices/readings to `sensor_devices` and `sensor_readings`

### Step 3: Add Service Methods
- [ ] Add scan history methods to `supabase.ts`
- [ ] Add mint request methods to `supabase.ts`
- [ ] Add MPC transaction methods to `supabase.ts`
- [ ] Add sensor device/reading methods to `supabase.ts`

### Step 4: Update Fallback Service
- [ ] Ensure fallback service handles new tables
- [ ] Add offline sync for new data types

### Step 5: Testing
- [ ] Test all components save data to Supabase
- [ ] Test offline mode and sync
- [ ] Verify data integrity

---

## 📝 **Data Flow for Each Component**

### ScanRFID Component
```
User Scans RFID → Component → Save to scan_history table → Supabase
                                                              ↓
Display History ← Component ← Load from scan_history ← Supabase
```

### MintProduct Component
```
User Creates Mint Request → Component → Save to mint_requests table → Supabase
                                                                          ↓
Display Requests ← Component ← Load from mint_requests ← Supabase
```

### TransactionApproval Component
```
User Initiates Transaction → Component → Save to mpc_transactions table → Supabase
                                                                              ↓
Display Transactions ← Component ← Load from mpc_transactions ← Supabase
```

### SensorManagement Component
```
User Adds Device → Component → Save to sensor_devices table → Supabase
                                                                    ↓
Device Records Data → Component → Save to sensor_readings table → Supabase
                                                                        ↓
Display Devices/Readings ← Component ← Load from tables ← Supabase
```

---

## ✅ **Verification Checklist**

After implementation, verify:

- [ ] All scan events saved to `scan_history`
- [ ] All mint requests saved to `mint_requests`
- [ ] All transactions saved to `mpc_transactions`
- [ ] All sensor devices saved to `sensor_devices`
- [ ] All sensor readings saved to `sensor_readings`
- [ ] No data stored only in localStorage (except for offline sync)
- [ ] No data stored only in component state
- [ ] All data retrievable from Supabase
- [ ] Offline mode works with sync
- [ ] Real-time updates working

---

## 🎯 **Final Status**

Once complete:
- ✅ **100% of user data stored in Supabase**
- ✅ **No data loss in offline mode** (syncs when online)
- ✅ **Real-time updates** for all data types
- ✅ **Complete audit trail** of all user actions
- ✅ **Scalable architecture** for future components



