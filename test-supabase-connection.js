#!/usr/bin/env node

/**
 * Supabase Connection Test
 * Tests the connection to your Supabase database and validates the schema
 */

const { createClient } = require("@supabase/supabase-js");
require("dotenv").config({ path: "./protrack-frontend/.env" });

// Get credentials from environment
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("❌ Missing Supabase credentials in .env file");
  console.error(
    "Please update protrack-frontend/.env with your Supabase project details"
  );
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
  console.log("🔍 Testing Supabase connection...");
  console.log(`📍 URL: ${supabaseUrl}`);
  console.log(`🔑 Key: ${supabaseKey.substring(0, 20)}...`);

  try {
    // Test basic connection
    const { data, error } = await supabase.from("roles").select("*").limit(1);

    if (error) {
      console.error("❌ Connection failed:", error.message);
      return false;
    }

    console.log("✅ Connection successful!");
    console.log(`📊 Found ${data?.length || 0} roles in database`);

    return true;
  } catch (error) {
    console.error("❌ Connection error:", error.message);
    return false;
  }
}

async function validateSchema() {
  console.log("\n🔍 Validating database schema...");

  const requiredTables = [
    "roles",
    "users",
    "products",
    "shipments",
    "iot_data",
    "notifications",
    "audit_logs",
  ];

  const results = [];

  for (const table of requiredTables) {
    try {
      const { data, error } = await supabase.from(table).select("*").limit(1);

      if (error) {
        results.push({ table, status: "missing", error: error.message });
      } else {
        results.push({ table, status: "exists", count: data?.length || 0 });
      }
    } catch (error) {
      results.push({ table, status: "error", error: error.message });
    }
  }

  console.log("\n📋 Schema validation results:");
  results.forEach((result) => {
    const icon = result.status === "exists" ? "✅" : "❌";
    console.log(`${icon} ${result.table}: ${result.status}`);
    if (result.error) {
      console.log(`   Error: ${result.error}`);
    }
  });

  const missingTables = results.filter((r) => r.status !== "exists");

  if (missingTables.length > 0) {
    console.log(
      "\n⚠️  Some tables are missing. You may need to run the database setup."
    );
    console.log("Run: node setup-supabase.js");
    return false;
  }

  console.log("\n🎉 All required tables exist!");
  return true;
}

async function testCRUDOperations() {
  console.log("\n🔍 Testing basic CRUD operations...");

  try {
    // Test reading roles
    const { data: roles, error: rolesError } = await supabase
      .from("roles")
      .select("*");

    if (rolesError) {
      console.error("❌ Failed to read roles:", rolesError.message);
      return false;
    }

    console.log(`✅ Read ${roles?.length || 0} roles`);

    // Test reading users
    const { data: users, error: usersError } = await supabase
      .from("users")
      .select("*")
      .limit(5);

    if (usersError) {
      console.error("❌ Failed to read users:", usersError.message);
      return false;
    }

    console.log(`✅ Read ${users?.length || 0} users`);

    console.log("✅ Basic CRUD operations working");
    return true;
  } catch (error) {
    console.error("❌ CRUD test failed:", error.message);
    return false;
  }
}

async function main() {
  console.log("🚀 ProTrack Supabase Connection Test\n");

  const connected = await testConnection();
  if (!connected) {
    console.log("\n❌ Connection failed. Please check your credentials.");
    return;
  }

  const schemaValid = await validateSchema();
  if (!schemaValid) {
    console.log("\n❌ Schema validation failed.");
    return;
  }

  const crudWorking = await testCRUDOperations();
  if (!crudWorking) {
    console.log("\n❌ CRUD operations failed.");
    return;
  }

  console.log("\n🎉 All tests passed! Your Supabase connection is ready.");
  console.log("\n📋 Next steps:");
  console.log("1. Start your frontend: cd protrack-frontend && npm run dev");
  console.log("2. Test the application with real data");
  console.log("3. Monitor the Supabase dashboard for activity");
}

main().catch(console.error);
