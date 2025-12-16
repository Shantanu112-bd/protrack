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

export default {
  supabase,
  trackingService,
  userService,
  mpcService,
};
