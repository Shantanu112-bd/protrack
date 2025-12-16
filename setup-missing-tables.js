const { createClient } = require("@supabase/supabase-js");
const fs = require("fs");

// Supabase configuration
const supabaseUrl = "https://ouryqfovixxanihagodt.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im91cnlxZm92aXh4YW5paGFnb2R0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU4MTM4OTcsImV4cCI6MjA4MTM4OTg5N30.C3O8z2MCk9pwpwx84UwIXa-Hj7gfUXnzrkd9qWNRCAs";

const supabase = createClient(supabaseUrl, supabaseKey);

async function createMissingTables() {
  console.log("🚀 Creating missing database tables...");

  try {
    // Read the SQL file
    const sql = fs.readFileSync("create-missing-tables.sql", "utf8");

    // Execute the SQL (Note: This requires service role key for DDL operations)
    // For now, we'll just check if tables exist and create sample data

    // Check if shipments table exists by trying to select from it
    console.log("📋 Checking shipments table...");
    const { data: shipments, error: shipmentsError } = await supabase
      .from("shipments")
      .select("count")
      .limit(1);

    if (shipmentsError && shipmentsError.code === "PGRST116") {
      console.log("❌ Shipments table does not exist");
      console.log(
        "⚠️  Please run the following SQL in your Supabase SQL editor:"
      );
      console.log("---");
      console.log(sql);
      console.log("---");
    } else {
      console.log("✅ Shipments table exists");
    }

    // Check notifications table
    console.log("📋 Checking notifications table...");
    const { data: notifications, error: notificationsError } = await supabase
      .from("notifications")
      .select("count")
      .limit(1);

    if (notificationsError && notificationsError.code === "PGRST116") {
      console.log("❌ Notifications table does not exist");
    } else {
      console.log("✅ Notifications table exists");
    }

    // Check audit_logs table
    console.log("📋 Checking audit_logs table...");
    const { data: auditLogs, error: auditLogsError } = await supabase
      .from("audit_logs")
      .select("count")
      .limit(1);

    if (auditLogsError && auditLogsError.code === "PGRST116") {
      console.log("❌ Audit logs table does not exist");
    } else {
      console.log("✅ Audit logs table exists");
    }

    // If any tables are missing, provide instructions
    if (
      (shipmentsError && shipmentsError.code === "PGRST116") ||
      (notificationsError && notificationsError.code === "PGRST116") ||
      (auditLogsError && auditLogsError.code === "PGRST116")
    ) {
      console.log("\n📝 To create missing tables:");
      console.log("1. Go to your Supabase dashboard");
      console.log("2. Navigate to SQL Editor");
      console.log("3. Copy and paste the SQL from create-missing-tables.sql");
      console.log("4. Run the query");
      console.log(
        "\nAlternatively, the application will work with existing tables."
      );
    }
  } catch (error) {
    console.error("❌ Error:", error.message);
  }
}

createMissingTables();
