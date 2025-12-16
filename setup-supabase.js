#!/usr/bin/env node

/**
 * Supabase Database Setup Script
 * This script helps set up the ProTrack database schema in your Supabase project
 */

const { createClient } = require("@supabase/supabase-js");
const fs = require("fs");
const path = require("path");

// Configuration
const SUPABASE_URL = process.env.SUPABASE_URL || "";
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || "";

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error("❌ Missing required environment variables:");
  console.error("   SUPABASE_URL - Your Supabase project URL");
  console.error(
    "   SUPABASE_SERVICE_KEY - Your Supabase service role key (not anon key)"
  );
  console.error("\nExample usage:");
  console.error(
    "   SUPABASE_URL=https://your-project.supabase.co SUPABASE_SERVICE_KEY=your-service-key node setup-supabase.js"
  );
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function setupDatabase() {
  try {
    console.log("🚀 Setting up ProTrack database schema...");

    // Read the schema file
    const schemaPath = path.join(__dirname, "supabase_schema.sql");
    const schema = fs.readFileSync(schemaPath, "utf8");

    // Split the schema into individual statements
    const statements = schema
      .split(";")
      .map((stmt) => stmt.trim())
      .filter((stmt) => stmt.length > 0 && !stmt.startsWith("--"));

    console.log(`📝 Executing ${statements.length} SQL statements...`);

    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i] + ";";

      try {
        const { error } = await supabase.rpc("exec_sql", { sql: statement });

        if (error) {
          console.warn(`⚠️  Warning on statement ${i + 1}: ${error.message}`);
        } else {
          console.log(
            `✅ Statement ${i + 1}/${statements.length} executed successfully`
          );
        }
      } catch (err) {
        console.warn(`⚠️  Warning on statement ${i + 1}: ${err.message}`);
      }
    }

    console.log("\n🎉 Database setup completed!");
    console.log("\n📋 Next steps:");
    console.log(
      "1. Update your .env file with the correct Supabase credentials"
    );
    console.log("2. Test the connection by running your application");
    console.log(
      "3. Check the Supabase dashboard to verify tables were created"
    );
  } catch (error) {
    console.error("❌ Error setting up database:", error.message);
    process.exit(1);
  }
}

// Alternative method using Supabase SQL editor
function printManualInstructions() {
  console.log("\n📖 Manual Setup Instructions:");
  console.log(
    "If the automated setup doesn't work, you can manually run the schema:"
  );
  console.log("1. Go to your Supabase dashboard");
  console.log("2. Navigate to the SQL Editor");
  console.log("3. Copy and paste the contents of supabase_schema.sql");
  console.log("4. Execute the SQL statements");
}

async function testConnection() {
  try {
    console.log("🔍 Testing Supabase connection...");

    const { data, error } = await supabase
      .from("roles")
      .select("count")
      .limit(1);

    if (error) {
      console.error("❌ Connection test failed:", error.message);
      return false;
    }

    console.log("✅ Connection successful!");
    return true;
  } catch (error) {
    console.error("❌ Connection test failed:", error.message);
    return false;
  }
}

// Main execution
async function main() {
  const connected = await testConnection();

  if (connected) {
    await setupDatabase();
  } else {
    console.log(
      "\n❌ Cannot connect to Supabase. Please check your credentials."
    );
    printManualInstructions();
  }
}

main().catch(console.error);
