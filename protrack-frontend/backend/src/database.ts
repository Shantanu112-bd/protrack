import { createClient, SupabaseClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

export interface User {
  id: string;
  wallet_address: string;
  role: string;
  email?: string;
  created_at?: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  manufacturer: string;
  batch_number: string;
  ipfs_hash?: string;
  blockchain_hash?: string;
  created_at: string;
  updated_at: string;
}

export interface Shipment {
  id: string;
  product_id: string;
  origin: string;
  destination: string;
  status: "pending" | "in_transit" | "delivered";
  current_location: string;
  blockchain_hash?: string;
  created_at: string;
  updated_at: string;
}

class Database {
  private supabase: SupabaseClient | null = null;
  private inMemory: boolean = false;

  private inMemoryData = {
    users: new Map<string, User>(),
    products: new Map<string, Product>(),
    shipments: new Map<string, Shipment>(),
  };

  constructor() {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_ANON_KEY;

    if (supabaseUrl && supabaseKey) {
      this.supabase = createClient(supabaseUrl, supabaseKey);
      this.inMemory = false;
      console.log("✅ Using Supabase database");
    } else {
      this.inMemory = true;
      console.log("⚠️  Supabase credentials not configured. Using in-memory storage.");
      console.log("   Set SUPABASE_URL and SUPABASE_ANON_KEY to use real database.");
    }
  }

  async initialize(): Promise<void> {
    if (!this.inMemory && this.supabase) {
      await this.createTablesIfNotExist();
    }
  }

  private async createTablesIfNotExist(): Promise<void> {
    if (!this.supabase) return;

    try {
      // Create users table
      const { error: usersError } = await this.supabase.rpc("create_users_table", {});
      if (usersError && !usersError.message.includes("already exists")) {
        console.warn("Users table create error:", usersError);
      }

      // Create products table
      const { error: productsError } = await this.supabase.rpc("create_products_table", {});
      if (productsError && !productsError.message.includes("already exists")) {
        console.warn("Products table create error:", productsError);
      }

      // Create shipments table
      const { error: shipmentsError } = await this.supabase.rpc("create_shipments_table", {});
      if (shipmentsError && !shipmentsError.message.includes("already exists")) {
        console.warn("Shipments table create error:", shipmentsError);
      }
    } catch (error) {
      console.error("Error creating tables:", error);
    }
  }

  // User operations
  async getUser(wallet_address: string): Promise<User | null> {
    if (this.inMemory) {
      return (
        Array.from(this.inMemoryData.users.values()).find(
          (u) => u.wallet_address === wallet_address
        ) || null
      );
    }

    const { data, error } = await this.supabase!.from("users")
      .select("*")
      .eq("wallet_address", wallet_address)
      .single();

    if (error) {
      if (error.code === "PGRST116") return null; // Not found
      throw error;
    }
    return data;
  }

  async createUser(user: Omit<User, "created_at">): Promise<User> {
    const userData = { ...user, created_at: new Date().toISOString() };

    if (this.inMemory) {
      this.inMemoryData.users.set(user.id, userData as User);
      return userData as User;
    }

    const { data, error } = await this.supabase!.from("users")
      .insert([userData])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Product operations
  async getProducts(): Promise<Product[]> {
    if (this.inMemory) {
      return Array.from(this.inMemoryData.products.values());
    }

    const { data, error } = await this.supabase!.from("products").select("*");

    if (error) throw error;
    return data || [];
  }

  async getProduct(id: string): Promise<Product | null> {
    if (this.inMemory) {
      return this.inMemoryData.products.get(id) || null;
    }

    const { data, error } = await this.supabase!.from("products")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      if (error.code === "PGRST116") return null;
      throw error;
    }
    return data;
  }

  async createProduct(product: Omit<Product, "created_at" | "updated_at">): Promise<Product> {
    const now = new Date().toISOString();
    const productData = { ...product, created_at: now, updated_at: now };

    if (this.inMemory) {
      this.inMemoryData.products.set(product.id, productData as Product);
      return productData as Product;
    }

    const { data, error } = await this.supabase!.from("products")
      .insert([productData])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updateProduct(
    id: string,
    updates: Partial<Omit<Product, "id" | "created_at">>
  ): Promise<Product> {
    const now = new Date().toISOString();

    if (this.inMemory) {
      const existing = this.inMemoryData.products.get(id);
      if (!existing) throw new Error("Product not found");
      const updated = { ...existing, ...updates, updated_at: now, id };
      this.inMemoryData.products.set(id, updated);
      return updated;
    }

    const { data, error } = await this.supabase!.from("products")
      .update({ ...updates, updated_at: now })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Shipment operations
  async getShipments(): Promise<Shipment[]> {
    if (this.inMemory) {
      return Array.from(this.inMemoryData.shipments.values());
    }

    const { data, error } = await this.supabase!.from("shipments").select("*");

    if (error) throw error;
    return data || [];
  }

  async getShipment(id: string): Promise<Shipment | null> {
    if (this.inMemory) {
      return this.inMemoryData.shipments.get(id) || null;
    }

    const { data, error } = await this.supabase!.from("shipments")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      if (error.code === "PGRST116") return null;
      throw error;
    }
    return data;
  }

  async createShipment(
    shipment: Omit<Shipment, "created_at" | "updated_at">
  ): Promise<Shipment> {
    const now = new Date().toISOString();
    const shipmentData = { ...shipment, created_at: now, updated_at: now };

    if (this.inMemory) {
      this.inMemoryData.shipments.set(shipment.id, shipmentData as Shipment);
      return shipmentData as Shipment;
    }

    const { data, error } = await this.supabase!.from("shipments")
      .insert([shipmentData])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updateShipment(
    id: string,
    updates: Partial<Omit<Shipment, "id" | "created_at">>
  ): Promise<Shipment> {
    const now = new Date().toISOString();

    if (this.inMemory) {
      const existing = this.inMemoryData.shipments.get(id);
      if (!existing) throw new Error("Shipment not found");
      const updated = { ...existing, ...updates, updated_at: now, id };
      this.inMemoryData.shipments.set(id, updated);
      return updated;
    }

    const { data, error } = await this.supabase!.from("shipments")
      .update({ ...updates, updated_at: now })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async getShipmentsByProductId(productId: string): Promise<Shipment[]> {
    if (this.inMemory) {
      return Array.from(this.inMemoryData.shipments.values()).filter(
        (s) => s.product_id === productId
      );
    }

    const { data, error } = await this.supabase!.from("shipments")
      .select("*")
      .eq("product_id", productId);

    if (error) throw error;
    return data || [];
  }

  isUsingMemory(): boolean {
    return this.inMemory;
  }
}

export const db = new Database();
