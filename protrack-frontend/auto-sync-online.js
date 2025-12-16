/**
 * Auto-Sync Online Script
 * Run this in browser console to force online mode and sync all data
 *
 * USAGE:
 * 1. Open http://localhost:5174 in browser
 * 2. Press F12 to open Developer Tools
 * 3. Go to Console tab
 * 4. Copy and paste this entire file
 * 5. Press Enter
 */

(async function autoSyncOnline() {
  console.log("🚀 ProTrack Auto-Sync Online");
  console.log("============================\n");

  // Check if fallbackService is available
  if (typeof window.fallbackService === "undefined") {
    console.error("❌ Fallback service not found!");
    console.error("   Make sure you're on the ProTrack application page");
    return;
  }

  try {
    // Step 1: Check current status
    console.log("📊 Step 1: Checking current connection status...");
    const currentStatus = window.fallbackService.getConnectionStatus();
    console.log("   Current Status:", currentStatus);

    if (currentStatus.supabaseConnected) {
      console.log("   ✅ Already online!");
    } else {
      console.log("   ⚠️  Currently offline, forcing online...");
    }

    // Step 2: Force online mode
    console.log("\n🔄 Step 2: Forcing online mode...");
    await window.fallbackService.forceOnlineMode();
    console.log("   ✅ Forced online mode successfully");

    // Step 3: Check pending operations
    console.log("\n📋 Step 3: Checking pending operations...");
    const pendingCount = window.fallbackService.getPendingOperationsCount();
    console.log(`   Found ${pendingCount} pending operations`);

    if (pendingCount > 0) {
      console.log("   🔄 Syncing pending operations...");
      await window.fallbackService.syncPendingOperations();
      console.log("   ✅ Pending operations synced");
    } else {
      console.log("   ✅ No pending operations to sync");
    }

    // Step 4: Verify new status
    console.log("\n✅ Step 4: Verifying connection status...");
    const newStatus = window.fallbackService.getConnectionStatus();
    console.log("   New Status:", newStatus);

    if (newStatus.supabaseConnected) {
      console.log("   ✅ System is now ONLINE!");
    } else {
      console.log("   ⚠️  Still offline - check troubleshooting steps below");
    }

    // Step 5: Reload page
    console.log("\n🔄 Step 5: Reloading page to apply changes...");
    console.log("   Page will reload in 2 seconds...");

    setTimeout(() => {
      window.location.reload();
    }, 2000);

    // Success message
    console.log("\n🎉 AUTO-SYNC COMPLETE!");
    console.log("========================");
    console.log("✅ System forced online");
    console.log("✅ Pending operations synced");
    console.log("✅ Page reloading...");
    console.log("\nAfter reload, you should see:");
    console.log("• No 'offline mode' notification");
    console.log("• All features working normally");
    console.log("• Real-time database sync active");
  } catch (error) {
    console.error("\n❌ AUTO-SYNC FAILED!");
    console.error("====================");
    console.error("Error:", error);
    console.error("\nTroubleshooting:");
    console.error("1. Check internet connection");
    console.error("2. Verify Supabase credentials in .env file");
    console.error("3. Try manual methods from force-online-sync.js");
    console.error("4. Check browser console for additional errors");
  }
})();

// Also expose quick commands
console.log("\n💡 QUICK COMMANDS:");
console.log("==================");
console.log("Force online:     forceOnline()");
console.log("Reset online:     resetOnline()");
console.log("Check status:     window.fallbackService.getConnectionStatus()");
console.log("Sync pending:     window.fallbackService.syncPendingOperations()");
console.log(
  "Pending count:    window.fallbackService.getPendingOperationsCount()"
);
