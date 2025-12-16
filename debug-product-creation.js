#!/usr/bin/env node

/**
 * Debug Product Creation Issues
 * This script helps identify why product creation is failing
 */

const { createClient } = require("@supabase/supabase-js");

// Load environment variables
require("dotenv").config({ path: "./protrack-frontend/.env" });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

console.log("🔍 Debugging Product Creation Issues");
console.log("===================================\n");

if (!supabaseUrl || !supabaseKey) {
  console.error("❌ Missing Supabase credentials");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function debugProductCreation() {
  try {
    console.log("1. Testing basic connection...");
    const { data: connectionTest } = await supabase
      .from("products")
      .select("count")
      .limit(1);
    console.log("✅ Connection working");

    console.log("\n2. Testing table structure...");
    const { data: structureTest, error: structureError } = await supabase
      .from("products")
      .select("*")
      .limit(1);

    if (structureError) {
      console.error("❌ Table structure error:", structureError);
      return;
    }
    console.log("✅ Table structure accessible");

    console.log("\n3. Testing minimal product creation...");
    const testProduct = {
      rfid_tag: `DEBUG_${Date.now()}`,
      product_name: "Debug Test Product",
      batch_no: "DEBUG_001",
      mfg_date: "2023-12-01",
      exp_date: "2024-12-01",
      owner_wallet: "0x1234567890123456789012345678901234567890",
      status: "manufactured",
      current_location: "Debug Facility",
    };

    console.log("Attempting to create product:", testProduct);

    const { data: productData, error: productError } = await supabase
      .from("products")
      .insert(testProduct)
      .select()
      .single();

    if (productError) {
      console.error("❌ Product creation failed:", productError);
      console.log("\nError details:");
      console.log("- Code:", productError.code);
      console.log("- Message:", productError.message);
      console.log("- Details:", productError.details);
      console.log("- Hint:", productError.hint);

      if (productError.message.includes("foreign key")) {
        console.log("\n💡 This appears to be a foreign key constraint issue.");
        console.log(
          "   The products table likely requires manufacturer_id or current_custodian_id"
        );
        console.log("   but these users don't exist in the users table.");
      }

      if (productError.message.includes("unique")) {
        console.log("\n💡 This appears to be a unique constraint violation.");
        console.log("   The RFID tag might already exist in the database.");
      }

      return;
    }

    console.log("✅ Product created successfully!");
    console.log("Product ID:", productData.id);

    // Clean up
    await supabase.from("products").delete().eq("id", productData.id);

    console.log("✅ Test product cleaned up");

    console.log("\n4. Testing with temperature fields...");
    const testProductWithTemp = {
      ...testProduct,
      rfid_tag: `DEBUG_TEMP_${Date.now()}`,
      max_temperature: 25.0,
      min_temperature: 2.0,
      max_humidity: 80.0,
      min_humidity: 20.0,
    };

    const { data: tempProductData, error: tempProductError } = await supabase
      .from("products")
      .insert(testProductWithTemp)
      .select()
      .single();

    if (tempProductError) {
      console.error(
        "❌ Product with temperature fields failed:",
        tempProductError
      );
      return;
    }

    console.log("✅ Product with temperature fields created successfully!");

    // Clean up
    await supabase.from("products").delete().eq("id", tempProductData.id);

    console.log("✅ Temperature test product cleaned up");

    console.log("\n🎉 All tests passed! Product creation should work.");
    console.log("\n💡 Recommendations:");
    console.log("1. Make sure RFID tags are unique");
    console.log("2. Ensure wallet address is connected");
    console.log("3. Check browser console for detailed error messages");
    console.log("4. Verify all required fields are filled");
  } catch (error) {
    console.error("❌ Debug script failed:", error);
  }
}

debugProductCreation();
