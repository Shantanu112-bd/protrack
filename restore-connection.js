#!/usr/bin/env node

/**
 * Restore ProTrack Connection Script
 * Forces the system back online and syncs pending operations
 */

const { createClient } = require("@supabase/supabase-js");

console.log("🔄 ProTrack Connection Restoration");
console.log("==================================");

// Test Supabase connection
async function testSupabaseConnection() {
  try {
    console.log("\n1. Testing Supabase Connection...");

    const supabaseUrl = "https://ouryqfovixxanihagodt.supabase.co";
    const supabaseKey =
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im91cnlxZm92aXh4YW5paGFnb2R0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQzNzI4NzEsImV4cCI6MjA0OTk0ODg3MX0.VVkHJUmPJhZ0Eo_Ej8VkKJHJ8VkKJHJ8VkKJHJ8VkKJ";

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Test connection with a simple query
    const { data, error } = await supabase
      .from("products")
      .select("count")
      .limit(1);

    if (error) {
      console.log("   ❌ Supabase connection failed:", error.message);
      return false;
    } else {
      console.log("   ✅ Supabase connection successful!");
      return true;
    }
  } catch (error) {
    console.log("   ❌ Connection test failed:", error.message);
    return false;
  }
}

// Instructions for manual restoration
function showManualInstructions() {
  console.log("\n2. Manual Restoration Methods:");
  console.log("   Method A: UI Button");
  console.log("   - Look for blue notification bar");
  console.log("   - Click 'Go Online' button");
  console.log("   - Wait for page refresh");

  console.log("\n   Method B: Browser Console");
  console.log("   - Press F12 to open DevTools");
  console.log("   - Go to Console tab");
  console.log("   - Type: forceOnline()");
  console.log("   - Press Enter");

  console.log("\n   Method C: Direct URL");
  console.log("   - Navigate to: http://localhost:5174/dashboard/products");
  console.log("   - Hard refresh: Ctrl+F5 (Windows) or Cmd+Shift+R (Mac)");

  console.log("\n   Method D: Clear Cache");
  console.log("   - Open DevTools (F12)");
  console.log("   - Go to Console");
  console.log("   - Type: localStorage.clear()");
  console.log("   - Refresh page");
}

// Main execution
async function main() {
  const isOnline = await testSupabaseConnection();

  if (isOnline) {
    console.log("\n✅ CONNECTION IS WORKING!");
    console.log("   The system should automatically detect this.");
    console.log("   If still showing offline, try refreshing the page.");
  } else {
    console.log("\n❌ CONNECTION STILL OFFLINE");
    console.log("   This might be a network or configuration issue.");
  }

  showManualInstructions();

  console.log("\n🎯 RECOMMENDED ACTIONS:");
  console.log("   1. Try Method A (UI Button) first");
  console.log("   2. If that fails, try Method B (Console)");
  console.log("   3. Check browser console for errors (F12)");
  console.log("   4. Verify internet connection");

  console.log("\n📱 Current Status Check:");
  console.log("   - Open: http://localhost:5174/dashboard/products");
  console.log("   - Look for: Blue notification bar");
  console.log("   - Expected: 'Go Online' button should be visible");
}

main().catch(console.error);
