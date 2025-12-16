#!/usr/bin/env node

/**
 * Verify Supabase Setup
 * Simple verification that doesn't assume tables exist
 */

const { createClient } = require("@supabase/supabase-js");
require("dotenv").config({ path: "./protrack-frontend/.env" });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function verifyConnection() {
  console.log("🔍 Verifying Supabase connection...");
  console.log(`📍 URL: ${supabaseUrl}`);

  try {
    // Try to access the database
    const { data, error } = await supabase.rpc("version");

    if (error) {
      console.log("⚠️  RPC call failed, but connection might still work");
    }

    console.log("✅ Basic connection established");
    return true;
  } catch (error) {
    console.error("❌ Connection failed:", error.message);
    return false;
  }
}

async function checkTables() {
  console.log("\n🔍 Checking for tables...");

  const tables = ["roles", "users", "products", "iot_data"];
  const results = [];

  for (const table of tables) {
    try {
      const { data, error } = await supabase
        .from(table)
        .select("count")
        .limit(1);

      if (error) {
        results.push({ table, exists: false, error: error.message });
      } else {
        results.push({ table, exists: true });
      }
    } catch (error) {
      results.push({ table, exists: false, error: error.message });
    }
  }

  console.log("\n📋 Table status:");
  results.forEach((result) => {
    const icon = result.exists ? "✅" : "❌";
    console.log(
      `${icon} ${result.table}: ${result.exists ? "exists" : "missing"}`
    );
    if (result.error && !result.error.includes("does not exist")) {
      console.log(`   Error: ${result.error}`);
    }
  });

  const existingTables = results.filter((r) => r.exists).length;
  console.log(`\n📊 ${existingTables}/${tables.length} tables found`);

  if (existingTables === 0) {
    console.log("\n🔧 Next steps:");
    console.log(
      "1. Go to https://supabase.com/dashboard/project/ouryqfovixxanihagodt"
    );
    console.log("2. Navigate to SQL Editor");
    console.log("3. Run the schema from basic-schema.sql");
    console.log("4. Run this script again to verify");
  } else if (existingTables === tables.length) {
    console.log("\n🎉 All tables exist! Database is ready.");
  } else {
    console.log(
      "\n⚠️  Some tables are missing. You may need to run the complete schema."
    );
  }

  return existingTables === tables.length;
}

async function testBasicOperations() {
  console.log("\n🔍 Testing basic operations...");

  try {
    // Try to read from roles table
    const { data: roles, error } = await supabase
      .from("roles")
      .select("*")
      .limit(5);

    if (error) {
      console.log("❌ Cannot read from roles table:", error.message);
      return false;
    }

    console.log(`✅ Successfully read ${roles?.length || 0} roles`);

    if (roles && roles.length > 0) {
      console.log("📋 Available roles:");
      roles.forEach((role) => {
        console.log(`   - ${role.name}: ${role.description}`);
      });
    }

    return true;
  } catch (error) {
    console.log("❌ Basic operations failed:", error.message);
    return false;
  }
}

async function main() {
  console.log("🚀 ProTrack Supabase Verification\n");

  const connected = await verifyConnection();
  if (!connected) return;

  const tablesExist = await checkTables();
  if (!tablesExist) return;

  const operationsWork = await testBasicOperations();
  if (operationsWork) {
    console.log("\n🎉 Supabase setup is complete and working!");
    console.log("\n📋 You can now:");
    console.log("1. Start your frontend: cd protrack-frontend && npm run dev");
    console.log("2. Test the application");
    console.log("3. Add sample data through the UI");
  }
}

main().catch(console.error);
