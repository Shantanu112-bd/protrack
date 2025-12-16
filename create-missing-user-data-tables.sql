-- Additional Supabase Tables for Complete User Data Storage
-- This script creates tables for data that components collect but may not be saving to Supabase

-- Scan History table (for RFID scans)
CREATE TABLE IF NOT EXISTS scan_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID REFERENCES products(id),
    rfid_tag VARCHAR(255),
    scanner_id VARCHAR(255),
    scanner_type VARCHAR(50) DEFAULT 'manual',
    action VARCHAR(100) NOT NULL,
    location VARCHAR(255),
    gps_lat DECIMAL(10,8),
    gps_lng DECIMAL(11,8),
    result VARCHAR(50) DEFAULT 'success',
    verification_result VARCHAR(50),
    is_verified BOOLEAN DEFAULT FALSE,
    offline BOOLEAN DEFAULT FALSE,
    synced BOOLEAN DEFAULT TRUE,
    metadata JSONB,
    scanned_by UUID REFERENCES users(id),
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Mint Requests table (for NFT minting requests)
CREATE TABLE IF NOT EXISTS mint_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID REFERENCES products(id) NOT NULL,
    product_name VARCHAR(255),
    batch_id VARCHAR(100),
    product_hash VARCHAR(255),
    mint_type VARCHAR(50) DEFAULT 'batch', -- batch, unit, sbt
    status VARCHAR(50) DEFAULT 'pending_approval', -- pending_approval, approved, rejected, minted
    metadata_uri TEXT,
    ipfs_cid VARCHAR(255),
    token_id VARCHAR(255),
    transaction_hash VARCHAR(255),
    required_approvals INTEGER DEFAULT 0,
    current_approvals INTEGER DEFAULT 0,
    approvers TEXT[],
    mint_policy JSONB,
    requested_by UUID REFERENCES users(id),
    approved_at TIMESTAMP WITH TIME ZONE,
    minted_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- MPC Transactions table (for multi-party computation transactions)
CREATE TABLE IF NOT EXISTS mpc_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tx_id VARCHAR(255) UNIQUE NOT NULL,
    key_id VARCHAR(255) NOT NULL,
    operation_hash VARCHAR(255) NOT NULL,
    initiator UUID REFERENCES users(id),
    contract_address VARCHAR(255),
    status VARCHAR(50) DEFAULT 'pending', -- pending, approved, executed, rejected
    required_approvals INTEGER DEFAULT 1,
    current_approvals INTEGER DEFAULT 0,
    approvers TEXT[],
    approvals JSONB, -- Array of approval objects
    executed BOOLEAN DEFAULT FALSE,
    execution_hash VARCHAR(255),
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Sensor Devices table (for sensor management)
CREATE TABLE IF NOT EXISTS sensor_devices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    device_id VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL, -- temperature, humidity, light, pressure, shock, tilt, gas, ph
    category VARCHAR(50), -- Environmental, Motion, Specialized
    status VARCHAR(50) DEFAULT 'online', -- online, offline, maintenance
    battery_level DECIMAL(5,2),
    firmware_version VARCHAR(100),
    last_seen TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    location VARCHAR(255),
    public_key VARCHAR(512),
    connectivity VARCHAR(50), -- MQTT, HTTPS, Bluetooth
    alert_count INTEGER DEFAULT 0,
    assigned_product_id UUID REFERENCES products(id),
    owner_id UUID REFERENCES users(id),
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Sensor Readings table (for sensor data)
CREATE TABLE IF NOT EXISTS sensor_readings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    device_id VARCHAR(255) REFERENCES sensor_devices(device_id),
    sensor_type VARCHAR(50) NOT NULL,
    value DECIMAL(10,4) NOT NULL,
    unit VARCHAR(20) NOT NULL,
    location VARCHAR(255),
    has_alert BOOLEAN DEFAULT FALSE,
    alert_type VARCHAR(50),
    product_id UUID REFERENCES products(id),
    metadata JSONB,
    recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Quality Tests table (already exists, but ensuring it has all fields)
-- Compliance Records table (already exists, but ensuring it has all fields)

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_scan_history_product_id ON scan_history(product_id);
CREATE INDEX IF NOT EXISTS idx_scan_history_rfid_tag ON scan_history(rfid_tag);
CREATE INDEX IF NOT EXISTS idx_scan_history_timestamp ON scan_history(timestamp);
CREATE INDEX IF NOT EXISTS idx_scan_history_scanned_by ON scan_history(scanned_by);

CREATE INDEX IF NOT EXISTS idx_mint_requests_product_id ON mint_requests(product_id);
CREATE INDEX IF NOT EXISTS idx_mint_requests_status ON mint_requests(status);
CREATE INDEX IF NOT EXISTS idx_mint_requests_requested_by ON mint_requests(requested_by);

CREATE INDEX IF NOT EXISTS idx_mpc_transactions_tx_id ON mpc_transactions(tx_id);
CREATE INDEX IF NOT EXISTS idx_mpc_transactions_key_id ON mpc_transactions(key_id);
CREATE INDEX IF NOT EXISTS idx_mpc_transactions_status ON mpc_transactions(status);

CREATE INDEX IF NOT EXISTS idx_sensor_devices_device_id ON sensor_devices(device_id);
CREATE INDEX IF NOT EXISTS idx_sensor_devices_type ON sensor_devices(type);
CREATE INDEX IF NOT EXISTS idx_sensor_devices_status ON sensor_devices(status);

CREATE INDEX IF NOT EXISTS idx_sensor_readings_device_id ON sensor_readings(device_id);
CREATE INDEX IF NOT EXISTS idx_sensor_readings_recorded_at ON sensor_readings(recorded_at);
CREATE INDEX IF NOT EXISTS idx_sensor_readings_product_id ON sensor_readings(product_id);

-- Enable Row Level Security
ALTER TABLE scan_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE mint_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE mpc_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE sensor_devices ENABLE ROW LEVEL SECURITY;
ALTER TABLE sensor_readings ENABLE ROW LEVEL SECURITY;

-- RLS Policies (basic - allow all for now, can be refined later)
CREATE POLICY "Allow all operations on scan_history" ON scan_history
    FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations on mint_requests" ON mint_requests
    FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations on mpc_transactions" ON mpc_transactions
    FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations on sensor_devices" ON sensor_devices
    FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations on sensor_readings" ON sensor_readings
    FOR ALL USING (true) WITH CHECK (true);



