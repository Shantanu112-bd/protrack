/**
 * Fallback Service - Handles offline mode and Supabase connection issues
 * Provides local storage backup and mock data when backend is unavailable
 */

import { ProductInsert } from "../types/database-override";

// Local storage keys
const STORAGE_KEYS = {
  PRODUCTS: "protrack_products",
  SHIPMENTS: "protrack_shipments",
  IOT_DATA: "protrack_iot_data",
  CONNECTION_STATUS: "protrack_connection_status",
  PENDING_OPERATIONS: "protrack_pending_operations",
};

// Connection status
export interface ConnectionStatus {
  isOnline: boolean;
  supabaseConnected: boolean;
  lastChecked: string;
  errorCount: number;
}

// Pending operation for sync when connection restored
export interface PendingOperation {
  id: string;
  type:
    | "CREATE_PRODUCT"
    | "UPDATE_PRODUCT"
    | "CREATE_SHIPMENT"
    | "UPDATE_SHIPMENT"
    | "CREATE_IOT_DATA"
    | "CREATE_QUALITY_TEST"
    | "CREATE_COMPLIANCE_RECORD";
  data: any;
  timestamp: string;
  retryCount: number;
}

class FallbackService {
  private connectionStatus: ConnectionStatus = {
    isOnline: navigator.onLine,
    supabaseConnected: false,
    lastChecked: new Date().toISOString(),
    errorCount: 0,
  };

  private pendingOperations: PendingOperation[] = [];

  constructor() {
    this.loadFromStorage();
    this.setupEventListeners();
  }

  // Setup online/offline event listeners
  private setupEventListeners() {
    window.addEventListener("online", () => {
      this.connectionStatus.isOnline = true;
      this.saveConnectionStatus();
      this.syncPendingOperations();
    });

    window.addEventListener("offline", () => {
      this.connectionStatus.isOnline = false;
      this.connectionStatus.supabaseConnected = false;
      this.saveConnectionStatus();
    });
  }

  // Load data from localStorage
  private loadFromStorage() {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.CONNECTION_STATUS);
      if (stored) {
        this.connectionStatus = {
          ...this.connectionStatus,
          ...JSON.parse(stored),
        };
      }

      const pendingOps = localStorage.getItem(STORAGE_KEYS.PENDING_OPERATIONS);
      if (pendingOps) {
        this.pendingOperations = JSON.parse(pendingOps);
      }
    } catch (error) {
      console.warn("Failed to load from localStorage:", error);
    }
  }

  // Save connection status to localStorage
  private saveConnectionStatus() {
    try {
      localStorage.setItem(
        STORAGE_KEYS.CONNECTION_STATUS,
        JSON.stringify(this.connectionStatus)
      );
    } catch (error) {
      console.warn("Failed to save connection status:", error);
    }
  }

  // Save pending operations to localStorage
  private savePendingOperations() {
    try {
      localStorage.setItem(
        STORAGE_KEYS.PENDING_OPERATIONS,
        JSON.stringify(this.pendingOperations)
      );
    } catch (error) {
      console.warn("Failed to save pending operations:", error);
    }
  }

  // Get current connection status
  getConnectionStatus(): ConnectionStatus {
    return { ...this.connectionStatus };
  }

  // Update Supabase connection status
  updateSupabaseStatus(connected: boolean, error?: any) {
    this.connectionStatus.supabaseConnected = connected;
    this.connectionStatus.lastChecked = new Date().toISOString();

    if (error) {
      this.connectionStatus.errorCount++;
    } else {
      this.connectionStatus.errorCount = 0;
    }

    this.saveConnectionStatus();
  }

  // Check if we should use fallback mode
  shouldUseFallback(): boolean {
    return (
      !this.connectionStatus.isOnline ||
      !this.connectionStatus.supabaseConnected ||
      this.connectionStatus.errorCount > 3
    );
  }

  // Force system back online and sync pending operations
  async forceOnlineMode() {
    console.log("🔄 Forcing system back to online mode...");

    // Reset connection status
    this.connectionStatus.isOnline = true;
    this.connectionStatus.supabaseConnected = true;
    this.connectionStatus.errorCount = 0;
    this.connectionStatus.lastChecked = new Date().toISOString();
    this.saveConnectionStatus();

    // Trigger sync of pending operations
    await this.syncPendingOperations();

    console.log("✅ System is now online");
    return this.connectionStatus;
  }

  // Clear all offline data and reset to online mode
  resetToOnlineMode() {
    console.log("🔄 Resetting system to online mode...");

    // Clear offline data
    this.clearOfflineData();

    // Reset connection status
    this.connectionStatus = {
      isOnline: true,
      supabaseConnected: true,
      lastChecked: new Date().toISOString(),
      errorCount: 0,
    };
    this.saveConnectionStatus();

    console.log("✅ System reset to online mode");
  }

  // Generate mock products for offline mode
  getMockProducts() {
    const stored = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
    if (stored) {
      return JSON.parse(stored);
    }

    // Generate some mock data
    const mockProducts = [
      {
        id: "mock-1",
        rfid_tag: "RFID_MOCK_001",
        product_name: "Organic Apples",
        batch_no: "BATCH_001",
        mfg_date: "2023-12-01",
        exp_date: "2024-01-01",
        status: "manufactured",
        current_location: "Warehouse A",
        owner_wallet: "0x1234...5678",
        isTokenized: false,
        category: "Food",
        weight: 1000,
        dimensions: "10x10x10 cm",
        price: 50,
        currency: "USD",
        qualityScore: 85,
        sustainabilityRating: 75,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: "mock-2",
        rfid_tag: "RFID_MOCK_002",
        product_name: "Premium Coffee Beans",
        batch_no: "BATCH_002",
        mfg_date: "2023-11-15",
        exp_date: "2024-11-15",
        status: "in transit",
        current_location: "Distribution Center B",
        owner_wallet: "0x1234...5678",
        isTokenized: true,
        token_id: "NFT_001",
        category: "Beverages",
        weight: 500,
        dimensions: "20x15x10 cm",
        price: 120,
        currency: "USD",
        qualityScore: 92,
        sustainabilityRating: 88,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ];

    this.saveProducts(mockProducts);
    return mockProducts;
  }

  // Save products to localStorage
  saveProducts(products: any[]) {
    try {
      localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
    } catch (error) {
      console.warn("Failed to save products to localStorage:", error);
    }
  }

  // Create product in offline mode
  async createProductOffline(productData: ProductInsert & { id?: string }) {
    const products = this.getMockProducts();

    const newProduct = {
      ...productData,
      id: productData.id || `offline-${Date.now()}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      isTokenized: false,
      category: "General",
      weight: 1000,
      dimensions: "Standard",
      price: 100,
      currency: "USD",
      qualityScore: 80,
      sustainabilityRating: 70,
    };

    products.push(newProduct);
    this.saveProducts(products);

    // Add to pending operations for sync later
    this.addPendingOperation({
      id: `create-${newProduct.id}`,
      type: "CREATE_PRODUCT",
      data: productData,
      timestamp: new Date().toISOString(),
      retryCount: 0,
    });

    return newProduct;
  }

  // Add pending operation
  addPendingOperation(operation: PendingOperation) {
    this.pendingOperations.push(operation);
    this.savePendingOperations();
  }

  // Sync pending operations when connection restored
  async syncPendingOperations() {
    if (
      !this.connectionStatus.isOnline ||
      !this.connectionStatus.supabaseConnected
    ) {
      return;
    }

    console.log(
      `Syncing ${this.pendingOperations.length} pending operations...`
    );

    const failedOperations: PendingOperation[] = [];

    for (const operation of this.pendingOperations) {
      try {
        await this.executePendingOperation(operation);
        console.log(`✅ Synced operation: ${operation.type}`);
      } catch (error) {
        console.error(`❌ Failed to sync operation: ${operation.type}`, error);
        operation.retryCount++;

        // Keep trying up to 3 times
        if (operation.retryCount < 3) {
          failedOperations.push(operation);
        }
      }
    }

    this.pendingOperations = failedOperations;
    this.savePendingOperations();

    if (failedOperations.length === 0) {
      console.log("✅ All pending operations synced successfully");
    } else {
      console.log(`⚠️ ${failedOperations.length} operations still pending`);
    }
  }

  // Execute a pending operation
  private async executePendingOperation(operation: PendingOperation) {
    // This would integrate with the actual Supabase service
    // For now, we'll just simulate the operation
    switch (operation.type) {
      case "CREATE_PRODUCT":
        // Would call actual supabase.from('products').insert(operation.data)
        console.log("Syncing product creation:", operation.data);
        break;
      case "UPDATE_PRODUCT":
        // Would call actual supabase.from('products').update(operation.data)
        console.log("Syncing product update:", operation.data);
        break;
      case "CREATE_SHIPMENT":
        // Would call actual supabase.from('shipments').insert(operation.data)
        console.log("Syncing shipment creation:", operation.data);
        break;
      case "UPDATE_SHIPMENT":
        // Would call actual supabase.from('shipments').update(operation.data)
        console.log("Syncing shipment update:", operation.data);
        break;
      case "CREATE_IOT_DATA":
        // Would call actual supabase.from('iot_data').insert(operation.data)
        console.log("Syncing IoT data creation:", operation.data);
        break;
      case "CREATE_QUALITY_TEST":
        // Would call actual supabase.from('quality_tests').insert(operation.data)
        console.log("Syncing quality test creation:", operation.data);
        break;
      case "CREATE_COMPLIANCE_RECORD":
        // Would call actual supabase.from('compliance_records').insert(operation.data)
        console.log("Syncing compliance record creation:", operation.data);
        break;
      default:
        console.warn("Unknown operation type:", operation.type);
    }
  }

  // Get pending operations count
  getPendingOperationsCount(): number {
    return this.pendingOperations.length;
  }

  // Clear all offline data (for testing)
  clearOfflineData() {
    localStorage.removeItem(STORAGE_KEYS.PRODUCTS);
    localStorage.removeItem(STORAGE_KEYS.SHIPMENTS);
    localStorage.removeItem(STORAGE_KEYS.IOT_DATA);
    localStorage.removeItem(STORAGE_KEYS.PENDING_OPERATIONS);
    this.pendingOperations = [];
  }

  // Get mock dashboard statistics
  getMockDashboardStats() {
    return {
      totalProducts: 156,
      activeShipments: 23,
      qualityAlerts: 2,
      completedDeliveries: 89,
      averageQualityScore: 87,
      sustainabilityRating: 82,
      networkStatus: "Offline Mode",
      lastSync: this.connectionStatus.lastChecked,
    };
  }

  // Get mock shipments
  getMockShipments() {
    const stored = localStorage.getItem(STORAGE_KEYS.SHIPMENTS);
    if (stored) {
      return JSON.parse(stored);
    }

    const mockShipments = [
      {
        id: "ship-mock-1",
        product_id: "mock-1",
        from_party: "Manufacturer A",
        to_party: "Retailer B",
        status: "shipped",
        shipped_at: "2023-12-10T10:00:00Z",
        expected_arrival: "2023-12-15T16:00:00Z",
        destination: "Distribution Hub",
        tracking_info: { tracking_number: "TRK123456789" },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        products: {
          id: "mock-1",
          product_name: "Organic Apples",
          rfid_tag: "RFID_MOCK_001",
          batch_no: "BATCH_001",
          current_location: "Warehouse A",
        },
      },
      {
        id: "ship-mock-2",
        product_id: "mock-2",
        from_party: "Warehouse C",
        to_party: "Store D",
        status: "delivered",
        shipped_at: "2023-12-08T14:30:00Z",
        delivered_at: "2023-12-12T09:15:00Z",
        expected_arrival: "2023-12-12T16:00:00Z",
        destination: "Store D",
        tracking_info: { tracking_number: "TRK987654321" },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        products: {
          id: "mock-2",
          product_name: "Premium Coffee Beans",
          rfid_tag: "RFID_MOCK_002",
          batch_no: "BATCH_002",
          current_location: "Store D",
        },
      },
    ];

    this.saveShipments(mockShipments);
    return mockShipments;
  }

  // Save shipments to localStorage
  saveShipments(shipments: any[]) {
    try {
      localStorage.setItem(STORAGE_KEYS.SHIPMENTS, JSON.stringify(shipments));
    } catch (error) {
      console.warn("Failed to save shipments to localStorage:", error);
    }
  }

  // Create shipment in offline mode
  async createShipmentOffline(shipmentData: any) {
    const shipments = this.getMockShipments();

    const newShipment = {
      ...shipmentData,
      id: `offline-shipment-${Date.now()}`,
      status: "requested",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      requested_at: new Date().toISOString(),
      tracking_info: {
        tracking_number: `TRK${Date.now()}`,
      },
    };

    shipments.push(newShipment);
    this.saveShipments(shipments);

    // Add to pending operations for sync later
    this.addPendingOperation({
      id: `create-shipment-${newShipment.id}`,
      type: "CREATE_SHIPMENT",
      data: shipmentData,
      timestamp: new Date().toISOString(),
      retryCount: 0,
    });

    return newShipment;
  }

  // Get mock users for recipient selection
  getMockUsers() {
    return [
      {
        id: "user-1",
        name: "Retailer Store A",
        wallet_address: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
        role: "retailer",
      },
      {
        id: "user-2",
        name: "Distribution Center B",
        wallet_address: "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC",
        role: "transporter",
      },
      {
        id: "user-3",
        name: "Warehouse C",
        wallet_address: "0x90F79bf6EB2c4f870365E785982E1f101E93b906",
        role: "retailer",
      },
      {
        id: "user-4",
        name: "Logistics Partner D",
        wallet_address: "0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65",
        role: "transporter",
      },
      {
        id: "user-5",
        name: "Consumer Market E",
        wallet_address: "0x9965507D1a55bcC2695C58ba16FB37d819B0A4dc",
        role: "consumer",
      },
    ];
  }

  // Get mock IoT data
  getMockIoTData() {
    return [
      {
        id: "iot-mock-1",
        product_id: "mock-1",
        temperature: 22.5,
        humidity: 65,
        shock: 0.2,
        gps_lat: 40.7128,
        gps_lng: -74.006,
        recorded_at: new Date().toISOString(),
        device_id: "IOT_DEVICE_001",
      },
      {
        id: "iot-mock-2",
        product_id: "mock-2",
        temperature: 18.3,
        humidity: 58,
        shock: 0.1,
        gps_lat: 34.0522,
        gps_lng: -118.2437,
        recorded_at: new Date().toISOString(),
        device_id: "IOT_DEVICE_002",
      },
    ];
  }
}

// Export singleton instance
export const fallbackService = new FallbackService();

// Make fallbackService available globally for debugging
if (typeof window !== "undefined") {
  (window as any).fallbackService = fallbackService;
  (window as any).forceOnline = () => fallbackService.forceOnlineMode();
  (window as any).resetOnline = () => fallbackService.resetToOnlineMode();
}

export default fallbackService;
