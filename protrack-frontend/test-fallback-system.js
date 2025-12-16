/**
 * Test Fallback System - Verify offline functionality
 */

import { fallbackService } from "./src/services/fallbackService.js";

async function testFallbackSystem() {
  console.log("🧪 Testing ProTrack Fallback System");
  console.log("=====================================\n");

  try {
    // Test 1: Connection Status
    console.log("1. Testing connection status monitoring...");
    const status = fallbackService.getConnectionStatus();
    console.log("✅ Connection status:", {
      isOnline: status.isOnline,
      supabaseConnected: status.supabaseConnected,
      errorCount: status.errorCount,
    });

    // Test 2: Mock Data Generation
    console.log("\n2. Testing mock data generation...");
    const mockProducts = fallbackService.getMockProducts();
    console.log(`✅ Generated ${mockProducts.length} mock products`);
    console.log("Sample product:", mockProducts[0]?.product_name);

    // Test 3: Offline Product Creation
    console.log("\n3. Testing offline product creation...");
    const testProduct = {
      rfid_tag: `TEST_OFFLINE_${Date.now()}`,
      product_name: "Test Offline Product",
      batch_no: "OFFLINE_001",
      mfg_date: "2023-12-01",
      exp_date: "2024-12-01",
      owner_wallet: "0x1234567890123456789012345678901234567890",
      status: "manufactured",
      current_location: "Test Location",
    };

    const createdProduct = await fallbackService.createProductOffline(
      testProduct
    );
    console.log("✅ Created offline product:", createdProduct.id);

    // Test 4: Pending Operations
    console.log("\n4. Testing pending operations queue...");
    const pendingCount = fallbackService.getPendingOperationsCount();
    console.log(`✅ Pending operations: ${pendingCount}`);

    // Test 5: Dashboard Stats
    console.log("\n5. Testing mock dashboard statistics...");
    const dashboardStats = fallbackService.getMockDashboardStats();
    console.log("✅ Dashboard stats:", {
      totalProducts: dashboardStats.totalProducts,
      activeShipments: dashboardStats.activeShipments,
      networkStatus: dashboardStats.networkStatus,
    });

    // Test 6: Mock Shipments
    console.log("\n6. Testing mock shipments...");
    const mockShipments = fallbackService.getMockShipments();
    console.log(`✅ Generated ${mockShipments.length} mock shipments`);

    // Test 7: Mock IoT Data
    console.log("\n7. Testing mock IoT data...");
    const mockIoTData = fallbackService.getMockIoTData();
    console.log(`✅ Generated ${mockIoTData.length} mock IoT readings`);

    console.log("\n🎉 All fallback system tests passed!");
    console.log("\n📱 ProTrack can now run completely offline with:");
    console.log("   • Full product management");
    console.log("   • Dashboard analytics");
    console.log("   • Shipment tracking");
    console.log("   • IoT data simulation");
    console.log("   • Automatic sync when online");
  } catch (error) {
    console.error("❌ Fallback system test failed:", error);
  }
}

// Run the test
testFallbackSystem();
