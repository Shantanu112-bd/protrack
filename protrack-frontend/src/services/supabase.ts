import { createClient } from '@supabase/supabase-js';
import { Database } from '../types/supabase';

// Initialize Supabase client
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials. Please check your environment variables.');
}

export const supabase = createClient<Database>(supabaseUrl, supabaseKey);

// Product tracking functions
export const trackingService = {
  // Create a new product record
  async createProduct(productData: {
    rfid_tag: string;
    batch_id: string;
    token_id: string;
    manufacturer_id: string;
    expiry_date: string;
    status: string;
  }) {
    const { data, error } = await supabase
      .from('products')
      .insert(productData)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Update product status
  async updateProductStatus(productId: string, status: string) {
    const { data, error } = await supabase
      .from('products')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', productId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Record IoT data
  async recordIoTData(productId: string, sensorData: {
    temperature?: number;
    humidity?: number;
    shock?: number;
    light_exposure?: number;
    custom_data?: Record<string, any>;
  }) {
    const { data, error } = await supabase
      .from('iot_data')
      .insert({
        product_id: productId,
        data: sensorData,
        timestamp: new Date().toISOString()
      })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Update GPS location
  async updateLocation(productId: string, location: {
    latitude: number;
    longitude: number;
    accuracy?: number;
  }) {
    const { data, error } = await supabase
      .from('product_locations')
      .insert({
        product_id: productId,
        latitude: location.latitude,
        longitude: location.longitude,
        accuracy: location.accuracy || null,
        timestamp: new Date().toISOString()
      })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Get product history
  async getProductHistory(productId: string) {
    const { data, error } = await supabase
      .from('product_history')
      .select('*')
      .eq('product_id', productId)
      .order('timestamp', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  // Get product by RFID
  async getProductByRFID(rfidTag: string) {
    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        manufacturer:users!manufacturer_id(*),
        current_custodian:users!current_custodian_id(*)
      `)
      .eq('rfid_tag', rfidTag)
      .single();
    
    if (error) throw error;
    return data;
  },

  // Get products by status
  async getProductsByStatus(status: string) {
    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        manufacturer:users!manufacturer_id(*),
        current_custodian:users!current_custodian_id(*)
      `)
      .eq('status', status);
    
    if (error) throw error;
    return data;
  },

  // Get products by custodian
  async getProductsByCustodian(custodianId: string) {
    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        manufacturer:users!manufacturer_id(*),
        current_custodian:users!current_custodian_id(*)
      `)
      .eq('current_custodian_id', custodianId);
    
    if (error) throw error;
    return data;
  }
};

// User management functions
export const userService = {
  // Get user by wallet address
  async getUserByWallet(walletAddress: string) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('wallet_address', walletAddress)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error;
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
      .from('users')
      .upsert({
        wallet_address: userData.wallet_address,
        role: userData.role,
        name: userData.name || null,
        email: userData.email || null,
        updated_at: new Date().toISOString()
      })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }
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
      .from('mpc_key_shares')
      .insert(data)
      .select()
      .single();
    
    if (error) throw error;
    return result;
  },

  // Get key share for user and token
  async getKeyShare(tokenId: string, userId: string) {
    const { data, error } = await supabase
      .from('mpc_key_shares')
      .select('*')
      .eq('token_id', tokenId)
      .eq('user_id', userId)
      .single();
    
    if (error) throw error;
    return data;
  }
};

export default {
  supabase,
  trackingService,
  userService,
  mpcService
};