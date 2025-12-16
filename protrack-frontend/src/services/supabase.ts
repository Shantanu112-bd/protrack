import { createClient } from "@supabase/supabase-js";
import { fallbackService } from "./fallbackService";

// Initialize Supabase client with better error handling
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "";
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "";

console.log("Supabase Configuration:", {
  url: supabaseUrl ? "Set" : "Missing",
  key: supabaseKey ? "Set" : "Missing",
  urlValue: supabaseUrl,
});

// Check if we have credentials
const hasCredentials = supabaseUrl && supabaseKey;

if (!hasCredentials) {
  console.warn(
    "Missing Supabase credentials. Running in offline mode with fallback service."
  );
  console.warn("VITE_SUPABASE_URL:", supabaseUrl);
  console.warn("VITE_SUPABASE_ANON_KEY:", supabaseKey ? "Present" : "Missing");
}

// Create Supabase client with additional options for better connectivity
export const supabase = hasCredentials
  ? createClient(supabaseUrl, supabaseKey, {
      auth: {
        persistSession: false, // Disable session persistence for simpler setup
      },
      global: {
        headers: {
          "Content-Type": "application/json",
        },
      },
      db: {
        schema: "public",
      },
      realtime: {
        params: {
          eventsPerSecond: 10,
        },
      },
    })
  : null;

// Enhanced error handling wrapper
async function withFallback<T>(
  operation: () => Promise<T>,
  fallbackOperation?: () => T | Promise<T>
): Promise<T> {
  if (!supabase || fallbackService.shouldUseFallback()) {
    if (fallbackOperation) {
      console.log("🔄 Using fallback operation (offline mode)");
      return await fallbackOperation();
    }
    throw new Error(
      "Service unavailable - no connection and no fallback provided"
    );
  }

  try {
    const result = await operation();
    fallbackService.updateSupabaseStatus(true);
    return result;
  } catch (error: any) {
    console.error("Supabase operation failed:", error);
    fallbackService.updateSupabaseStatus(false, error);

    // Check if we should retry or use fallback
    if (
      fallbackOperation &&
      (error.message?.includes("fetch") ||
        error.message?.includes("network") ||
        error.message?.includes("timeout") ||
        error.code === "PGRST204") // Schema cache error
    ) {
      console.log("🔄 Using fallback due to connection error");
      return await fallbackOperation();
    }

    throw error;
  }
}

// Product tracking functions with fallback support
export const trackingService = {
  // Create a new product record
  async createProduct(productData: {
    rfid_tag: string;
    batch_id?: string;
    batch_no?: string;
    token_id?: string;
    manufacturer_id?: string;
    expiry_date?: string;
    exp_date?: string;
    status: string;
    product_name?: string;
    mfg_date?: string;
    owner_wallet?: string;
    current_location?: string;
  }) {
    return withFallback(
      async () => {
        if (!supabase) throw new Error("Supabase not initialized");

        const { data, error } = await supabase
          .from("products")
          .insert(productData)
          .select()
          .single();

        if (error) throw error;
        return data;
      },
      async () => {
        // Fallback: create product offline
        return await fallbackService.createProductOffline(productData as any);
      }
    );
  },

  // Update product status
  async updateProductStatus(productId: string, status: string) {
    return withFallback(
      async () => {
        if (!supabase) throw new Error("Supabase not initialized");

        const { data, error } = await supabase
          .from("products")
          .update({ status, updated_at: new Date().toISOString() })
          .eq("id", productId)
          .select()
          .single();

        if (error) throw error;
        return data;
      },
      async () => {
        // Fallback: update in localStorage
        const products = fallbackService.getMockProducts();
        const productIndex = products.findIndex((p: any) => p.id === productId);
        if (productIndex >= 0) {
          products[productIndex].status = status;
          products[productIndex].updated_at = new Date().toISOString();
          fallbackService.saveProducts(products);
          return products[productIndex];
        }
        throw new Error("Product not found in offline storage");
      }
    );
  },

  // Record IoT data
  async recordIoTData(
    productId: string,
    sensorData: {
      temperature?: number;
      humidity?: number;
      shock?: number;
      light_exposure?: number;
      custom_data?: Record<string, any>;
    }
  ) {
    const { data, error } = await supabase
      .from("iot_data")
      .insert({
        product_id: productId,
        data: sensorData,
        timestamp: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Update GPS location
  async updateLocation(
    productId: string,
    location: {
      latitude: number;
      longitude: number;
      accuracy?: number;
    }
  ) {
    const { data, error } = await supabase
      .from("product_locations")
      .insert({
        product_id: productId,
        latitude: location.latitude,
        longitude: location.longitude,
        accuracy: location.accuracy || null,
        timestamp: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Get product history
  async getProductHistory(productId: string) {
    const { data, error } = await supabase
      .from("product_history")
      .select("*")
      .eq("product_id", productId)
      .order("timestamp", { ascending: false });

    if (error) throw error;
    return data;
  },

  // Get product by RFID
  async getProductByRFID(rfidTag: string) {
    const { data, error } = await supabase
      .from("products")
      .select(
        `
        *,
        manufacturer:users!manufacturer_id(*),
        current_custodian:users!current_custodian_id(*)
      `
      )
      .eq("rfid_tag", rfidTag)
      .single();

    if (error) throw error;
    return data;
  },

  // Get products by status
  async getProductsByStatus(status: string) {
    return withFallback(
      async () => {
        if (!supabase) throw new Error("Supabase not initialized");

        const { data, error } = await supabase
          .from("products")
          .select(
            `
            *,
            manufacturer:users!manufacturer_id(*),
            current_custodian:users!current_custodian_id(*)
          `
          )
          .eq("status", status);

        if (error) throw error;
        return data;
      },
      () => {
        // Fallback: filter mock products by status
        const products = fallbackService.getMockProducts();
        return products.filter((p: any) => p.status === status);
      }
    );
  },

  // Get all products with fallback
  async getAllProducts() {
    return withFallback(
      async () => {
        if (!supabase) throw new Error("Supabase not initialized");

        const { data, error } = await supabase
          .from("products")
          .select(
            `
            *,
            manufacturer:users!manufacturer_id(*),
            current_custodian:users!current_custodian_id(*)
          `
          )
          .order("created_at", { ascending: false });

        if (error) throw error;
        return data;
      },
      () => {
        // Fallback: return mock products
        return fallbackService.getMockProducts();
      }
    );
  },

  // Get products by custodian
  async getProductsByCustodian(custodianId: string) {
    const { data, error } = await supabase
      .from("products")
      .select(
        `
        *,
        manufacturer:users!manufacturer_id(*),
        current_custodian:users!current_custodian_id(*)
      `
      )
      .eq("current_custodian_id", custodianId);

    if (error) throw error;
    return data;
  },

  // Create shipment with fallback
  async createShipment(shipmentData: {
    product_id: string;
    to_party_wallet?: string;
    destination?: string;
    expected_arrival?: string;
    from_party?: string;
    to_party?: string;
  }) {
    return withFallback(
      async () => {
        if (!supabase) throw new Error("Supabase not initialized");

        const { data, error } = await supabase
          .from("shipments")
          .insert(shipmentData)
          .select()
          .single();

        if (error) throw error;
        return data;
      },
      async () => {
        // Fallback: create shipment offline
        return await fallbackService.createShipmentOffline(shipmentData);
      }
    );
  },

  // Get all shipments with fallback
  async getAllShipments() {
    return withFallback(
      async () => {
        if (!supabase) throw new Error("Supabase not initialized");

        const { data, error } = await supabase
          .from("shipments")
          .select(
            `
            *,
            products:products!product_id(id, product_name, rfid_tag, batch_no, current_location),
            from_user:users!from_party(id, name, wallet_address),
            to_user:users!to_party(id, name, wallet_address)
          `
          )
          .order("created_at", { ascending: false });

        if (error) throw error;
        return data;
      },
      () => {
        // Fallback: return mock shipments
        return fallbackService.getMockShipments();
      }
    );
  },

  // Update shipment status with fallback
  async updateShipmentStatus(shipmentId: string, status: string) {
    return withFallback(
      async () => {
        if (!supabase) throw new Error("Supabase not initialized");

        const { data, error } = await supabase
          .from("shipments")
          .update({ status, updated_at: new Date().toISOString() })
          .eq("id", shipmentId)
          .select()
          .single();

        if (error) throw error;
        return data;
      },
      async () => {
        // Fallback: update in localStorage
        const shipments = fallbackService.getMockShipments();
        const shipmentIndex = shipments.findIndex(
          (s: any) => s.id === shipmentId
        );
        if (shipmentIndex >= 0) {
          shipments[shipmentIndex].status = status;
          shipments[shipmentIndex].updated_at = new Date().toISOString();
          fallbackService.saveShipments(shipments);
          return shipments[shipmentIndex];
        }
        throw new Error("Shipment not found in offline storage");
      }
    );
  },
};

// User management functions
export const userService = {
  // Get user by wallet address
  async getUserByWallet(walletAddress: string) {
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("wallet_address", walletAddress)
      .single();

    if (error && error.code !== "PGRST116") throw error;
    return data;
  },

  // Create or update user
  async upsertUser(userData: {
    wallet_address: string;
    role: string;
    name?: string;
    email?: string;
  }) {
    const { data, error } = await supabase
      .from("users")
      .upsert({
        wallet_address: userData.wallet_address,
        role: userData.role,
        name: userData.name || null,
        email: userData.email || null,
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },
};

// MPC key management functions
export const mpcService = {
  // Store encrypted MPC key share
  async storeKeyShare(data: {
    token_id: string;
    user_id: string;
    encrypted_key_share: string;
  }) {
    const { data: result, error } = await supabase
      .from("mpc_key_shares")
      .insert(data)
      .select()
      .single();

    if (error) throw error;
    return result;
  },

  // Get key share for user and token
  async getKeyShare(tokenId: string, userId: string) {
    const { data, error } = await supabase
      .from("mpc_key_shares")
      .select("*")
      .eq("token_id", tokenId)
      .eq("user_id", userId)
      .single();

    if (error) throw error;
    return data;
  },
};

// Scan history service
export const scanHistoryService = {
  // Record a scan event
  async recordScan(scanData: {
    product_id?: string;
    rfid_tag?: string;
    scanner_id: string;
    scanner_type?: string;
    action: string;
    location?: string;
    gps_lat?: number;
    gps_lng?: number;
    result?: string;
    verification_result?: string;
    is_verified?: boolean;
    offline?: boolean;
    metadata?: Record<string, any>;
    scanned_by?: string;
  }) {
    return withFallback(
      async () => {
        if (!supabase) throw new Error("Supabase not initialized");

        const { data, error } = await supabase
          .from("scan_history")
          .insert({
            ...scanData,
            timestamp: new Date().toISOString(),
          })
          .select()
          .single();

        if (error) throw error;
        return data;
      },
      async () => {
        // Fallback: store offline
        const offlineScans = JSON.parse(
          localStorage.getItem("protrack_scan_history") || "[]"
        );
        const newScan = {
          id: `offline-scan-${Date.now()}`,
          ...scanData,
          timestamp: new Date().toISOString(),
          synced: false,
        };
        offlineScans.push(newScan);
        localStorage.setItem(
          "protrack_scan_history",
          JSON.stringify(offlineScans)
        );
        return newScan;
      }
    );
  },

  // Get scan history
  async getScanHistory(filters?: {
    product_id?: string;
    rfid_tag?: string;
    scanner_id?: string;
    limit?: number;
  }) {
    return withFallback(
      async () => {
        if (!supabase) throw new Error("Supabase not initialized");

        let query = supabase
          .from("scan_history")
          .select("*")
          .order("timestamp", { ascending: false });

        if (filters?.product_id) {
          query = query.eq("product_id", filters.product_id);
        }
        if (filters?.rfid_tag) {
          query = query.eq("rfid_tag", filters.rfid_tag);
        }
        if (filters?.scanner_id) {
          query = query.eq("scanner_id", filters.scanner_id);
        }
        if (filters?.limit) {
          query = query.limit(filters.limit);
        }

        const { data, error } = await query;
        if (error) throw error;
        return data || [];
      },
      () => {
        // Fallback: return from localStorage
        const stored = localStorage.getItem("protrack_scan_history");
        return stored ? JSON.parse(stored) : [];
      }
    );
  },
};

// Mint requests service
export const mintRequestService = {
  // Create a mint request
  async createMintRequest(mintData: {
    product_id: string;
    product_name: string;
    batch_id?: string;
    product_hash?: string;
    mint_type?: string;
    metadata_uri?: string;
    mint_policy?: Record<string, any>;
    requested_by?: string;
  }) {
    return withFallback(
      async () => {
        if (!supabase) throw new Error("Supabase not initialized");

        const { data, error } = await supabase
          .from("mint_requests")
          .insert({
            ...mintData,
            status: "pending_approval",
          })
          .select()
          .single();

        if (error) throw error;
        return data;
      },
      async () => {
        // Fallback: store offline
        const offlineMints = JSON.parse(
          localStorage.getItem("protrack_mint_requests") || "[]"
        );
        const newMint = {
          id: `offline-mint-${Date.now()}`,
          ...mintData,
          status: "pending_approval",
          created_at: new Date().toISOString(),
          synced: false,
        };
        offlineMints.push(newMint);
        localStorage.setItem(
          "protrack_mint_requests",
          JSON.stringify(offlineMints)
        );
        return newMint;
      }
    );
  },

  // Get mint requests
  async getMintRequests(filters?: {
    product_id?: string;
    status?: string;
    requested_by?: string;
  }) {
    return withFallback(
      async () => {
        if (!supabase) throw new Error("Supabase not initialized");

        let query = supabase
          .from("mint_requests")
          .select("*")
          .order("created_at", { ascending: false });

        if (filters?.product_id) {
          query = query.eq("product_id", filters.product_id);
        }
        if (filters?.status) {
          query = query.eq("status", filters.status);
        }
        if (filters?.requested_by) {
          query = query.eq("requested_by", filters.requested_by);
        }

        const { data, error } = await query;
        if (error) throw error;
        return data || [];
      },
      () => {
        // Fallback: return from localStorage
        const stored = localStorage.getItem("protrack_mint_requests");
        return stored ? JSON.parse(stored) : [];
      }
    );
  },

  // Update mint request status
  async updateMintRequestStatus(
    requestId: string,
    status: string,
    updates?: {
      token_id?: string;
      transaction_hash?: string;
      approved_at?: string;
      minted_at?: string;
    }
  ) {
    return withFallback(
      async () => {
        if (!supabase) throw new Error("Supabase not initialized");

        const { data, error } = await supabase
          .from("mint_requests")
          .update({
            status,
            ...updates,
            updated_at: new Date().toISOString(),
          })
          .eq("id", requestId)
          .select()
          .single();

        if (error) throw error;
        return data;
      },
      async () => {
        // Fallback: update in localStorage
        const stored = localStorage.getItem("protrack_mint_requests");
        const mints = stored ? JSON.parse(stored) : [];
        const index = mints.findIndex((m: any) => m.id === requestId);
        if (index >= 0) {
          mints[index] = { ...mints[index], status, ...updates };
          localStorage.setItem("protrack_mint_requests", JSON.stringify(mints));
          return mints[index];
        }
        throw new Error("Mint request not found");
      }
    );
  },
};

// MPC transactions service
export const mpcTransactionService = {
  // Create a transaction
  async createTransaction(txData: {
    tx_id: string;
    key_id: string;
    operation_hash: string;
    initiator?: string;
    contract_address?: string;
    required_approvals?: number;
    metadata?: Record<string, any>;
  }) {
    return withFallback(
      async () => {
        if (!supabase) throw new Error("Supabase not initialized");

        const { data, error } = await supabase
          .from("mpc_transactions")
          .insert({
            ...txData,
            status: "pending",
            executed: false,
            current_approvals: 0,
          })
          .select()
          .single();

        if (error) throw error;
        return data;
      },
      async () => {
        // Fallback: store offline
        const offlineTxs = JSON.parse(
          localStorage.getItem("protrack_mpc_transactions") || "[]"
        );
        const newTx = {
          id: `offline-tx-${Date.now()}`,
          ...txData,
          status: "pending",
          executed: false,
          created_at: new Date().toISOString(),
          synced: false,
        };
        offlineTxs.push(newTx);
        localStorage.setItem(
          "protrack_mpc_transactions",
          JSON.stringify(offlineTxs)
        );
        return newTx;
      }
    );
  },

  // Get transactions
  async getTransactions(filters?: {
    key_id?: string;
    status?: string;
    initiator?: string;
  }) {
    return withFallback(
      async () => {
        if (!supabase) throw new Error("Supabase not initialized");

        let query = supabase
          .from("mpc_transactions")
          .select("*")
          .order("created_at", { ascending: false });

        if (filters?.key_id) {
          query = query.eq("key_id", filters.key_id);
        }
        if (filters?.status) {
          query = query.eq("status", filters.status);
        }
        if (filters?.initiator) {
          query = query.eq("initiator", filters.initiator);
        }

        const { data, error } = await query;
        if (error) throw error;
        return data || [];
      },
      () => {
        // Fallback: return from localStorage
        const stored = localStorage.getItem("protrack_mpc_transactions");
        return stored ? JSON.parse(stored) : [];
      }
    );
  },

  // Update transaction
  async updateTransaction(
    txId: string,
    updates: {
      status?: string;
      current_approvals?: number;
      approvers?: string[];
      executed?: boolean;
      execution_hash?: string;
    }
  ) {
    return withFallback(
      async () => {
        if (!supabase) throw new Error("Supabase not initialized");

        const { data, error } = await supabase
          .from("mpc_transactions")
          .update({
            ...updates,
            updated_at: new Date().toISOString(),
          })
          .eq("tx_id", txId)
          .select()
          .single();

        if (error) throw error;
        return data;
      },
      async () => {
        // Fallback: update in localStorage
        const stored = localStorage.getItem("protrack_mpc_transactions");
        const txs = stored ? JSON.parse(stored) : [];
        const index = txs.findIndex((t: any) => t.tx_id === txId);
        if (index >= 0) {
          txs[index] = { ...txs[index], ...updates };
          localStorage.setItem(
            "protrack_mpc_transactions",
            JSON.stringify(txs)
          );
          return txs[index];
        }
        throw new Error("Transaction not found");
      }
    );
  },
};

// Sensor devices service
export const sensorDeviceService = {
  // Create or update sensor device
  async upsertDevice(deviceData: {
    device_id: string;
    name: string;
    type: string;
    category?: string;
    status?: string;
    battery_level?: number;
    firmware_version?: string;
    location?: string;
    public_key?: string;
    connectivity?: string;
    assigned_product_id?: string;
    owner_id?: string;
    metadata?: Record<string, any>;
  }) {
    return withFallback(
      async () => {
        if (!supabase) throw new Error("Supabase not initialized");

        const { data, error } = await supabase
          .from("sensor_devices")
          .upsert(
            {
              ...deviceData,
              last_seen: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            },
            { onConflict: "device_id" }
          )
          .select()
          .single();

        if (error) throw error;
        return data;
      },
      async () => {
        // Fallback: store offline
        const offlineDevices = JSON.parse(
          localStorage.getItem("protrack_sensor_devices") || "[]"
        );
        const index = offlineDevices.findIndex(
          (d: any) => d.device_id === deviceData.device_id
        );
        const device = {
          ...deviceData,
          last_seen: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        if (index >= 0) {
          offlineDevices[index] = device;
        } else {
          offlineDevices.push(device);
        }
        localStorage.setItem(
          "protrack_sensor_devices",
          JSON.stringify(offlineDevices)
        );
        return device;
      }
    );
  },

  // Get sensor devices
  async getDevices(filters?: {
    type?: string;
    status?: string;
    owner_id?: string;
  }) {
    return withFallback(
      async () => {
        if (!supabase) throw new Error("Supabase not initialized");

        let query = supabase
          .from("sensor_devices")
          .select("*")
          .order("created_at", { ascending: false });

        if (filters?.type) {
          query = query.eq("type", filters.type);
        }
        if (filters?.status) {
          query = query.eq("status", filters.status);
        }
        if (filters?.owner_id) {
          query = query.eq("owner_id", filters.owner_id);
        }

        const { data, error } = await query;
        if (error) throw error;
        return data || [];
      },
      () => {
        // Fallback: return from localStorage
        const stored = localStorage.getItem("protrack_sensor_devices");
        return stored ? JSON.parse(stored) : [];
      }
    );
  },

  // Record sensor reading
  async recordReading(readingData: {
    device_id: string;
    sensor_type: string;
    value: number;
    unit: string;
    location?: string;
    has_alert?: boolean;
    alert_type?: string;
    product_id?: string;
    metadata?: Record<string, any>;
  }) {
    return withFallback(
      async () => {
        if (!supabase) throw new Error("Supabase not initialized");

        const { data, error } = await supabase
          .from("sensor_readings")
          .insert({
            ...readingData,
            recorded_at: new Date().toISOString(),
          })
          .select()
          .single();

        if (error) throw error;
        return data;
      },
      async () => {
        // Fallback: store offline
        const offlineReadings = JSON.parse(
          localStorage.getItem("protrack_sensor_readings") || "[]"
        );
        const newReading = {
          id: `offline-reading-${Date.now()}`,
          ...readingData,
          recorded_at: new Date().toISOString(),
          synced: false,
        };
        offlineReadings.push(newReading);
        localStorage.setItem(
          "protrack_sensor_readings",
          JSON.stringify(offlineReadings)
        );
        return newReading;
      }
    );
  },

  // Get sensor readings
  async getReadings(filters?: {
    device_id?: string;
    sensor_type?: string;
    product_id?: string;
    limit?: number;
  }) {
    return withFallback(
      async () => {
        if (!supabase) throw new Error("Supabase not initialized");

        let query = supabase
          .from("sensor_readings")
          .select("*")
          .order("recorded_at", { ascending: false });

        if (filters?.device_id) {
          query = query.eq("device_id", filters.device_id);
        }
        if (filters?.sensor_type) {
          query = query.eq("sensor_type", filters.sensor_type);
        }
        if (filters?.product_id) {
          query = query.eq("product_id", filters.product_id);
        }
        if (filters?.limit) {
          query = query.limit(filters.limit);
        }

        const { data, error } = await query;
        if (error) throw error;
        return data || [];
      },
      () => {
        // Fallback: return from localStorage
        const stored = localStorage.getItem("protrack_sensor_readings");
        return stored ? JSON.parse(stored) : [];
      }
    );
  },
};

export default {
  supabase,
  trackingService,
  userService,
  mpcService,
  scanHistoryService,
  mintRequestService,
  mpcTransactionService,
  sensorDeviceService,
};
