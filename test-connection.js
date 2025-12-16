const { createClient } = require("@supabase/supabase-js");

const supabaseUrl = "https://ouryqfovixxanihagodt.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im91cnlxZm92aXh4YW5paGFnb2R0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU4MTM4OTcsImV4cCI6MjA4MTM4OTg5N30.C3O8z2MCk9pwpwx84UwIXa-Hj7gfUXnzrkd9qWNRCAs";

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
  try {
    console.log("Testing Supabase connection...");

    // Test basic connection
    const { data, error } = await supabase
      .from("products")
      .select("count")
      .limit(1);

    if (error) {
      console.error("Connection failed:", error);
      return;
    }

    console.log("✅ Connection successful");

    // Test product creation
    const testProduct = {
      rfid_tag: `TEST_${Date.now()}`,
      product_name: "Test Product",
      batch_no: "TEST001",
      mfg_date: "2023-12-01",
      exp_date: "2024-12-01",
      owner_wallet: "0x1234567890123456789012345678901234567890",
      status: "manufactured",
      current_location: "Test Location",
      max_temperature: 25.0,
      min_temperature: 2.0,
      max_humidity: 80.0,
      min_humidity: 20.0,
    };

    console.log("Testing product creation...");
    const { data: productData, error: productError } = await supabase
      .from("products")
      .insert(testProduct)
      .select()
      .single();

    if (productError) {
      console.error("❌ Product creation failed:");
      console.error("Code:", productError.code);
      console.error("Message:", productError.message);
      console.error("Details:", productError.details);
      console.error("Hint:", productError.hint);

      // Check for specific error types
      if (productError.message.includes("foreign key")) {
        console.log("\n💡 Foreign key constraint issue detected");
        console.log(
          "This means the database expects manufacturer_id or current_custodian_id"
        );
        console.log("but these users don't exist in the users table");
      }

      if (
        productError.message.includes("duplicate key") ||
        productError.message.includes("unique")
      ) {
        console.log("\n💡 Unique constraint violation");
        console.log("The RFID tag already exists in the database");
      }

      return;
    }

    console.log("✅ Product created successfully!");
    console.log("Product ID:", productData.id);

    // Clean up
    await supabase.from("products").delete().eq("id", productData.id);
    console.log("✅ Test product cleaned up");
  } catch (error) {
    console.error("❌ Test failed:", error.message);

    if (error.message.includes("fetch")) {
      console.log("\n💡 Network connectivity issue detected");
      console.log(
        "This is likely the cause of 'TypeError: Failed to fetch' in the frontend"
      );
      console.log("Possible causes:");
      console.log("- Internet connection issues");
      console.log("- Supabase service temporarily unavailable");
      console.log("- CORS configuration issues");
      console.log("- Firewall blocking the connection");
    }
  }
}

testConnection();
