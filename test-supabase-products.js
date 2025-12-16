#!/usr/bin/env node

/**
 * Test Supabase Products Table Connection
 * This script tests the connection to Supabase and verifies the products table structure
 */

const { createClient } = require("@supabase/supabase-js");

// Load environment variables
require("dotenv").config({ path: "./protrack-frontend/.env" });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

console.log("🧪 Testing Supabase Products Table Connection");
console.log("============================================\n");

if (!supabaseUrl || !supabaseKey) {
  console.error("❌ Missing Supabase credentials");
  console.log("VITE_SUPABASE_URL:", supabaseUrl ? "Set" : "Missing");
  console.log("VITE_SUPABASE_ANON_KEY:", supabaseKey ? "Set" : "Missing");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
  try {
    console.log("🔗 Testing Supabase connection...");

    // Test basic connection
    const { data, error } = await supabase
      .from("products")
      .select("count(*)")
      .limit(1);

    if (error) {
      console.error("❌ Connection failed:", error.message);
      return false;
    }

    console.log("✅ Connection successful");
    return true;
  } catch (error) {
    console.error("❌ Connection error:", error.message);
    return false;
  }
}

async function testTableStructure() {
  try {
    console.log("\n📋 Testing products table structure...");

    // Try to select with all expected columns
    const { data, error } = await supabase
      .from("products")
      .select(
        `
        id,
        rfid_tag,
        product_name,
        batch_no,
        mfg_date,
        exp_date,
        owner_wallet,
        manufacturer_id,
        current_custodian_id,
        status,
        current_location,
        max_temperature,
        min_temperature,
        max_humidity,
        min_humidity,
        created_at,
        updated_at
      `
      )
      .limit(1);

    if (error) {
      console.error("❌ Table structure error:", error.message);
      console.log("This might indicate missing columns or incorrect schema");
      return false;
    }

    console.log("✅ Table structure is correct");
    return true;
  } catch (error) {
    console.error("❌ Table structure test failed:", error.message);
    return false;
  }
}

async function testUserTable() {
  try {
    console.log("\n👥 Testing users table...");

    const { data, error } = await supabase
      .from("users")
      .select("id, wallet_address, name")
      .limit(1);

    if (error) {
      console.error("❌ Users table error:", error.message);
      return false;
    }

    console.log("✅ Users table accessible");
    return true;
  } catch (error) {
    console.error("❌ Users table test failed:", error.message);
    return false;
  }
}

async function testProductCreation() {
  try {
    console.log("\n🧪 Testing product creation...");

    // First create a test user
    const testWallet = "0x1234567890123456789012345678901234567890";

    const { data: userData, error: userError } = await supabase
      .from("users")
      .upsert({
        wallet_address: testWallet,
        name: "Test User",
      })
      .select("id")
      .single();

    if (userError) {
      console.error("❌ Failed to create test user:", userError.message);
      return false;
    }

    console.log("✅ Test user created/found");

    // Now try to create a test product
    const testProduct = {
      rfid_tag: `TEST_${Date.now()}`,
      product_name: "Test Product",
      batch_no: "TEST_BATCH_001",
      mfg_date: "2023-12-01",
      exp_date: "2024-12-01",
      owner_wallet: testWallet,
      manufacturer_id: userData.id,
      current_custodian_id: userData.id,
      status: "manufactured",
      current_location: "Test Facility",
      max_temperature: 25.0,
      min_temperature: 2.0,
      max_humidity: 80.0,
      min_humidity: 20.0,
    };

    const { data: productData, error: productError } = await supabase
      .from("products")
      .insert(testProduct)
      .select()
      .single();

    if (productError) {
      console.error("❌ Failed to create test product:", productError.message);
      console.log("Product data attempted:", testProduct);
      return false;
    }

    console.log("✅ Test product created successfully");
    console.log("Product ID:", productData.id);

    // Clean up - delete the test product
    await supabase.from("products").delete().eq("id", productData.id);

    console.log("✅ Test product cleaned up");

    return true;
  } catch (error) {
    console.error("❌ Product creation test failed:", error.message);
    return false;
  }
}

async function runTests() {
  const connectionOk = await testConnection();
  const structureOk = await testTableStructure();
  const usersOk = await testUserTable();
  const creationOk = await testProductCreation();

  console.log("\n📊 TEST RESULTS");
  console.log("================");
  console.log(`Connection: ${connectionOk ? "✅ PASS" : "❌ FAIL"}`);
  console.log(`Table Structure: ${structureOk ? "✅ PASS" : "❌ FAIL"}`);
  console.log(`Users Table: ${usersOk ? "✅ PASS" : "❌ FAIL"}`);
  console.log(`Product Creation: ${creationOk ? "✅ PASS" : "❌ FAIL"}`);

  const allPassed = connectionOk && structureOk && usersOk && creationOk;

  console.log("\n🎯 OVERALL STATUS");
  console.log("==================");
  if (allPassed) {
    console.log("🎉 ALL TESTS PASSED");
    console.log(
      "✅ Supabase is properly configured and ready for product creation!"
    );
  } else {
    console.log("❌ SOME TESTS FAILED");
    console.log("Please check the errors above and fix the configuration.");
  }

  return allPassed;
}

// Run the tests
runTests()
  .then((success) => {
    process.exit(success ? 0 : 1);
  })
  .catch((error) => {
    console.error("❌ Test runner failed:", error);
    process.exit(1);
  });
