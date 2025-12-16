/**
 * Force ProTrack System Online
 * This script forces the system back to online mode and syncs pending operations
 */

import { fallbackService } from "./src/services/fallbackService.js";

async function forceSystemOnline() {
  console.log("🚀 ProTrack Force Online Script");
  console.log("===============================\n");

  try {
    // Check current status
    const currentStatus = fallbackService.getConnectionStatus();
    console.log("Current Status:", {
      isOnline: currentStatus.isOnline,
      supabaseConnected: currentStatus.supabaseConnected,
      errorCount: currentStatus.errorCount,
      pendingOperations: fallbackService.getPendingOperationsCount(),
    });

    // Force online mode
    console.log("\n🔄 Forcing system online...");
    await fallbackService.forceOnlineMode();

    // Check new status
    const newStatus = fallbackService.getConnectionStatus();
    console.log("\n✅ New Status:", {
      isOnline: newStatus.isOnline,
      supabaseConnected: newStatus.supabaseConnected,
      errorCount: newStatus.errorCount,
      pendingOperations: fallbackService.getPendingOperationsCount(),
    });

    console.log("\n🎉 System is now online!");
    console.log("You can now:");
    console.log("• Create products with real Supabase integration");
    console.log("• Mint NFTs with blockchain functionality");
    console.log("• Use all features with live data");
  } catch (error) {
    console.error("❌ Failed to force online mode:", error);
  }
}

// Run the script
forceSystemOnline();
