-- Supabase Schema for ProTrack Supply Chain System

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Roles table
CREATE TABLE roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE,
    wallet_address VARCHAR(42) UNIQUE NOT NULL,
    role_id UUID REFERENCES roles(id),
    name VARCHAR(255),
    phone VARCHAR(20),
    company VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default roles
INSERT INTO roles (name, description) VALUES 
    ('admin', 'System administrator with full access'),
    ('manufacturer', 'Product manufacturer'),
    ('packager', 'Product packaging facility'),
    ('transporter', 'Logistics and transportation company'),
    ('retailer', 'Retail store or distributor'),
    ('consumer', 'End consumer'),
    ('oracle', 'IoT data oracle');

-- Products table
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    rfid_tag VARCHAR(255) UNIQUE NOT NULL,
    barcode VARCHAR(255),
    product_hash VARCHAR(255) UNIQUE,
    product_name VARCHAR(255),
    batch_no VARCHAR(100),
    mfg_date DATE,
    exp_date DATE,
    token_id VARCHAR(255),
    owner_wallet VARCHAR(42),
    manufacturer_id UUID REFERENCES users(id),
    current_custodian_id UUID REFERENCES users(id),
    status VARCHAR(50) DEFAULT 'manufactured',
    current_location VARCHAR(255),
    max_temperature DECIMAL(5,2),
    min_temperature DECIMAL(5,2),
    max_humidity DECIMAL(5,2),
    min_humidity DECIMAL(5,2),
    max_shock DECIMAL(5,2),
    destination VARCHAR(255),
    expected_arrival TIMESTAMP WITH TIME ZONE,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Shipments table
CREATE TABLE shipments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID REFERENCES products(id) NOT NULL,
    from_party UUID REFERENCES users(id) NOT NULL,
    to_party UUID REFERENCES users(id) NOT NULL,
    status VARCHAR(50) DEFAULT 'requested',
    mpc_tx_id VARCHAR(255),
    temp_key_id VARCHAR(255),
    requested_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    approved_at TIMESTAMP WITH TIME ZONE,
    shipped_at TIMESTAMP WITH TIME ZONE,
    delivered_at TIMESTAMP WITH TIME ZONE,
    confirmed_at TIMESTAMP WITH TIME ZONE,
    tracking_info JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- IoT data table
CREATE TABLE iot_data (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID REFERENCES products(id) NOT NULL,
    device_id VARCHAR(255),
    sensor_type VARCHAR(50),
    value DECIMAL(10,4),
    unit VARCHAR(20),
    gps_lat DECIMAL(10,8),
    gps_lng DECIMAL(11,8),
    temperature DECIMAL(5,2),
    humidity DECIMAL(5,2),
    shock DECIMAL(10,4),
    tamper BOOLEAN DEFAULT FALSE,
    light_exposure DECIMAL(10,4),
    battery_level DECIMAL(5,2),
    signal_strength DECIMAL(5,2),
    custom_data JSONB,
    recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Access keys table
CREATE TABLE access_keys (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID REFERENCES products(id) NOT NULL,
    enc_key_for_sender TEXT,
    enc_key_for_receiver TEXT,
    key_rotation_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Notifications table
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) NOT NULL,
    read BOOLEAN DEFAULT FALSE,
    related_entity_type VARCHAR(50),
    related_entity_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Audit logs table
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    actor VARCHAR(255) NOT NULL,
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(100) NOT NULL,
    entity_id UUID,
    details JSONB,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Device registry table
CREATE TABLE device_registry (
    device_id VARCHAR(255) PRIMARY KEY,
    pubkey VARCHAR(512),
    vendor VARCHAR(255),
    model VARCHAR(255),
    firmware VARCHAR(100),
    region VARCHAR(100),
    status VARCHAR(50) DEFAULT 'active',
    assigned_product_id UUID REFERENCES products(id),
    last_seen TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Key history table
CREATE TABLE key_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID REFERENCES products(id) NOT NULL,
    rotated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    reason VARCHAR(255),
    previous_key TEXT,
    new_key TEXT,
    rotated_by UUID REFERENCES users(id)
);

-- ZK proofs table
CREATE TABLE zk_proofs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID REFERENCES products(id) NOT NULL,
    proof_type VARCHAR(100) NOT NULL,
    ipfs_cid VARCHAR(255) NOT NULL,
    verified BOOLEAN DEFAULT FALSE,
    verification_date TIMESTAMP WITH TIME ZONE,
    verifier_address VARCHAR(42),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Product history table
CREATE TABLE product_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID REFERENCES products(id) NOT NULL,
    action VARCHAR(100) NOT NULL,
    from_status VARCHAR(50),
    to_status VARCHAR(50),
    actor_id UUID REFERENCES users(id),
    location VARCHAR(255),
    metadata JSONB,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for better performance
CREATE INDEX idx_products_rfid_tag ON products(rfid_tag);
CREATE INDEX idx_products_token_id ON products(token_id);
CREATE INDEX idx_products_owner_wallet ON products(owner_wallet);
CREATE INDEX idx_products_status ON products(status);
CREATE INDEX idx_shipments_product_id ON shipments(product_id);
CREATE INDEX idx_shipments_status ON shipments(status);
CREATE INDEX idx_iot_data_product_id ON iot_data(product_id);
CREATE INDEX idx_iot_data_recorded_at ON iot_data(recorded_at);
CREATE INDEX idx_iot_data_sensor_type ON iot_data(sensor_type);
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(read);
CREATE INDEX idx_audit_logs_actor ON audit_logs(actor);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);
CREATE INDEX idx_product_history_product_id ON product_history(product_id);
CREATE INDEX idx_product_history_timestamp ON product_history(timestamp);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE shipments ENABLE ROW LEVEL SECURITY;
ALTER TABLE iot_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE access_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE device_registry ENABLE ROW LEVEL SECURITY;
ALTER TABLE key_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE zk_proofs ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Users can read their own record
CREATE POLICY "Users can view own record" ON users
    FOR SELECT USING (wallet_address = current_setting('request.jwt.claims', true)::json->>'wallet_address');

-- Admins can read all user records
CREATE POLICY "Admins can view all users" ON users
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users u 
            JOIN roles r ON u.role_id = r.id 
            WHERE u.wallet_address = current_setting('request.jwt.claims', true)::json->>'wallet_address' 
            AND r.name = 'admin'
        )
    );

-- Products can be viewed by owner and custodian
CREATE POLICY "Products accessible to owner and custodian" ON products
    FOR SELECT USING (
        owner_wallet = current_setting('request.jwt.claims', true)::json->>'wallet_address' 
        OR current_custodian_id = (
            SELECT id FROM users WHERE wallet_address = current_setting('request.jwt.claims', true)::json->>'wallet_address'
        )
        OR EXISTS (
            SELECT 1 FROM users u 
            JOIN roles r ON u.role_id = r.id 
            WHERE u.wallet_address = current_setting('request.jwt.claims', true)::json->>'wallet_address' 
            AND r.name = 'admin'
        )
    );

-- Shipments can be viewed by involved parties
CREATE POLICY "Shipments accessible to involved parties" ON shipments
    FOR SELECT USING (
        from_party = (
            SELECT id FROM users WHERE wallet_address = current_setting('request.jwt.claims', true)::json->>'wallet_address'
        )
        OR to_party = (
            SELECT id FROM users WHERE wallet_address = current_setting('request.jwt.claims', true)::json->>'wallet_address'
        )
        OR EXISTS (
            SELECT 1 FROM users u 
            JOIN roles r ON u.role_id = r.id 
            WHERE u.wallet_address = current_setting('request.jwt.claims', true)::json->>'wallet_address' 
            AND r.name = 'admin'
        )
    );

-- IoT data can be viewed by product owner and custodian
CREATE POLICY "IoT data accessible for owned products" ON iot_data
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM products p 
            WHERE p.id = iot_data.product_id 
            AND (
                p.owner_wallet = current_setting('request.jwt.claims', true)::json->>'wallet_address'
                OR p.current_custodian_id = (
                    SELECT id FROM users WHERE wallet_address = current_setting('request.jwt.claims', true)::json->>'wallet_address'
                )
                OR EXISTS (
                    SELECT 1 FROM users u 
                    JOIN roles r ON u.role_id = r.id 
                    WHERE u.wallet_address = current_setting('request.jwt.claims', true)::json->>'wallet_address' 
                    AND r.name = 'admin'
                )
            )
        )
    );

-- Enable Realtime
BEGIN;
    -- Set up realtime for key tables
    SELECT * FROM supabase_realtime.add_channel('products');
    SELECT * FROM supabase_realtime.add_channel('shipments');
    SELECT * FROM supabase_realtime.add_channel('iot_data');
COMMIT;

-- Insert sample data for testing
INSERT INTO users (wallet_address, name, role_id) 
SELECT '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266', 'Admin User', id 
FROM roles WHERE name = 'admin';

INSERT INTO users (wallet_address, name, role_id) 
SELECT '0x70997970C51812dc3A010C7d01b50e0d17dc79C8', 'Manufacturer Inc', id 
FROM roles WHERE name = 'manufacturer';

INSERT INTO users (wallet_address, name, role_id) 
SELECT '0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC', 'Global Logistics', id 
FROM roles WHERE name = 'transporter';