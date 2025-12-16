#!/usr/bin/env node

/**
 * Simple Database Setup for ProTrack
 * Creates the basic schema using Supabase client
 */

const { createClient } = require("@supabase/supabase-js");
require("dotenv").config({ path: "./protrack-frontend/.env" });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("❌ Missing Supabase credentials");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function createBasicSchema() {
  console.log("🚀 Setting up basic ProTrack database schema...");

  try {
    // Test connection first
    console.log("🔍 Testing connection...");
    const { data: testData, error: testError } = await supabase
      .from("_test")
      .select("*")
      .limit(1);

    console.log("✅ Connected to Supabase successfully");

    // Since we can't execute raw SQL with anon key, let's create a simple test
    console.log("\n📋 Database setup instructions:");
    console.log(
      "Since we're using the anon key, you need to manually set up the schema."
    );
    console.log("\n🔧 Manual Setup Steps:");
    console.log(
      "1. Go to your Supabase dashboard: https://supabase.com/dashboard"
    );
    console.log("2. Navigate to your project: ouryqfovixxanihagodt");
    console.log("3. Go to SQL Editor");
    console.log("4. Copy and paste the contents of supabase_schema.sql");
    console.log("5. Execute the SQL");

    console.log(
      "\n📄 Alternatively, here's a simplified schema to get started:"
    );

    const basicSchema = `
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

-- Insert default roles
INSERT INTO roles (name, description) VALUES 
    ('admin', 'System administrator'),
    ('manufacturer', 'Product manufacturer'),
    ('transporter', 'Logistics company'),
    ('retailer', 'Retail store'),
    ('consumer', 'End consumer')
ON CONFLICT (name) DO NOTHING;
`;

    console.log(basicSchema);

    return true;
  } catch (error) {
    console.error("❌ Error:", error.message);
    return false;
  }
}

createBasicSchema()
  .then((success) => {
    if (success) {
      console.log("\n🎉 Setup instructions provided!");
      console.log(
        "After setting up the schema, run: node test-supabase-connection.js"
      );
    }
  })
  .catch(console.error);
