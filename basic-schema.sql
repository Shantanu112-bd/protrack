-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Roles table
CREATE TABLE IF NOT EXISTS roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Users table  
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255),
    wallet_address VARCHAR(42) UNIQUE NOT NULL,
    role_id UUID REFERENCES roles(id),
    name VARCHAR(255),
    company VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Products table
CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    rfid_tag VARCHAR(255) UNIQUE NOT NULL,
    product_name VARCHAR(255),
    batch_no VARCHAR(100),
    mfg_date DATE,
    exp_date DATE,
    owner_wallet VARCHAR(42),
    manufacturer_id UUID REFERENCES users(id),
    status VARCHAR(50) DEFAULT 'manufactured',
    current_location VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- IoT data table
CREATE TABLE IF NOT EXISTS iot_data (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID REFERENCES products(id) NOT NULL,
    temperature DECIMAL(5,2),
    humidity DECIMAL(5,2),
    gps_lat DECIMAL(10,8),
    gps_lng DECIMAL(11,8),
    recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Shipments table
CREATE TABLE IF NOT EXISTS shipments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID REFERENCES products(id) NOT NULL,
    from_party UUID REFERENCES users(id) NOT NULL,
    to_party UUID REFERENCES users(id) NOT NULL,
    status VARCHAR(50) DEFAULT 'requested',
    requested_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) NOT NULL,
    read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default roles
INSERT INTO roles (name, description) VALUES 
    ('admin', 'System administrator'),
    ('manufacturer', 'Product manufacturer'),
    ('transporter', 'Logistics company'),
    ('retailer', 'Retail store'),
    ('consumer', 'End consumer')
ON CONFLICT (name) DO NOTHING;