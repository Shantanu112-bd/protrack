import { createClient, SupabaseClient, User } from '@supabase/supabase-js';
import { config } from '../config/config';
import { logger } from '../utils/logger';

export interface DatabaseSchema {
  users: {
    id: string;
    email: string;
    role: 'manufacturer' | 'packager' | 'wholesaler' | 'seller' | 'inspector' | 'customer' | 'admin';
    wallet_address?: string;
    company_name?: string;
    created_at: string;
    updated_at: string;
  };
  products: {
    id: string;
    name: string;
    sku: string;
    batch_id: string;
    category: string;
    manufacturer_id: string;
    current_owner_id: string;
    blockchain_token_id?: number;
    rfid_hash?: string;
    ipfs_metadata_hash?: string;
    status: 'manufactured' | 'in_transit' | 'delivered' | 'recalled';
    created_at: string;
    updated_at: string;
  };
  supply_chain_events: {
    id: string;
    product_id: string;
    event_type: 'manufacture' | 'transfer' | 'quality_check' | 'delivery' | 'recall';
    from_user_id?: string;
    to_user_id?: string;
    location?: string;
    timestamp: string;
    blockchain_tx_hash?: string;
    metadata?: any;
  };
  iot_devices: {
    id: string;
    device_id: string;
    device_type: 'temperature' | 'humidity' | 'gps' | 'rfid' | 'camera';
    owner_id: string;
    product_id?: string;
    status: 'active' | 'inactive' | 'maintenance';
    last_seen: string;
    metadata?: any;
  };
  iot_data: {
    id: string;
    device_id: string;
    product_id?: string;
    data_type: string;
    value: number;
    unit: string;
    location?: string;
    timestamp: string;
    blockchain_verified: boolean;
  };
  mpc_wallets: {
    id: string;
    wallet_id: number;
    name: string;
    signers: string[];
    threshold: number;
    creator_id: string;
    contract_address: string;
    status: 'active' | 'inactive';
    created_at: string;
  };
  notifications: {
    id: string;
    user_id: string;
    type: 'alert' | 'info' | 'warning' | 'success';
    title: string;
    message: string;
    read: boolean;
    metadata?: any;
    created_at: string;
  };
  analytics_events: {
    id: string;
    event_type: string;
    user_id?: string;
    product_id?: string;
    metadata?: any;
    timestamp: string;
  };
}

export class SupabaseService {
  private client: SupabaseClient;
  private serviceClient: SupabaseClient;
  private connected: boolean = false;

  constructor() {
    // Public client for user operations
    this.client = createClient(config.supabase.url, config.supabase.anonKey);
    
    // Service client for admin operations
    this.serviceClient = createClient(config.supabase.url, config.supabase.serviceKey);
  }

  async initialize(): Promise<void> {
    try {
      // Test connection
      const { data, error } = await this.serviceClient.from('users').select('count').limit(1);
      
      if (error && error.code !== 'PGRST116') { // PGRST116 = table doesn't exist (expected for new setup)
        throw error;
      }

      this.connected = true;
      logger.info('✅ Supabase connection established');

      // Initialize database schema if needed
      await this.initializeSchema();
      
    } catch (error) {
      logger.error('❌ Failed to connect to Supabase:', error);
      throw error;
    }
  }

  private async initializeSchema(): Promise<void> {
    try {
      // Check if tables exist, create if they don't
      const tables = [
        'users', 'products', 'supply_chain_events', 'iot_devices', 
        'iot_data', 'mpc_wallets', 'notifications', 'analytics_events'
      ];

      for (const table of tables) {
        const { error } = await this.serviceClient.from(table).select('count').limit(1);
        if (error && error.code === 'PGRST116') {
          logger.info(`Creating table: ${table}`);
          // In a real implementation, you'd run SQL migrations here
          // For now, we'll assume tables are created via Supabase dashboard
        }
      }

      logger.info('✅ Database schema initialized');
    } catch (error) {
      logger.error('❌ Failed to initialize schema:', error);
    }
  }

  isConnected(): boolean {
    return this.connected;
  }

  // User Management
  async createUser(userData: {
    email: string;
    password: string;
    role: DatabaseSchema['users']['role'];
    company_name?: string;
    wallet_address?: string;
  }): Promise<{ user: User | null; error: any }> {
    try {
      const { data: authData, error: authError } = await this.client.auth.signUp({
        email: userData.email,
        password: userData.password
      });

      if (authError) return { user: null, error: authError };

      // Create user profile
      const { error: profileError } = await this.serviceClient
        .from('users')
        .insert({
          id: authData.user!.id,
          email: userData.email,
          role: userData.role,
          company_name: userData.company_name,
          wallet_address: userData.wallet_address,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

      if (profileError) {
        logger.error('Failed to create user profile:', profileError);
        return { user: null, error: profileError };
      }

      return { user: authData.user, error: null };
    } catch (error) {
      logger.error('Error creating user:', error);
      return { user: null, error };
    }
  }

  async getUserProfile(userId: string): Promise<DatabaseSchema['users'] | null> {
    try {
      const { data, error } = await this.serviceClient
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        logger.error('Error fetching user profile:', error);
        return null;
      }

      return data;
    } catch (error) {
      logger.error('Error in getUserProfile:', error);
      return null;
    }
  }

  // Product Management
  async createProduct(productData: Omit<DatabaseSchema['products'], 'id' | 'created_at' | 'updated_at'>): Promise<string | null> {
    try {
      const { data, error } = await this.serviceClient
        .from('products')
        .insert({
          ...productData,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select('id')
        .single();

      if (error) {
        logger.error('Error creating product:', error);
        return null;
      }

      return data.id;
    } catch (error) {
      logger.error('Error in createProduct:', error);
      return null;
    }
  }

  async getProduct(productId: string): Promise<DatabaseSchema['products'] | null> {
    try {
      const { data, error } = await this.serviceClient
        .from('products')
        .select('*')
        .eq('id', productId)
        .single();

      if (error) {
        logger.error('Error fetching product:', error);
        return null;
      }

      return data;
    } catch (error) {
      logger.error('Error in getProduct:', error);
      return null;
    }
  }

  async updateProduct(productId: string, updates: Partial<DatabaseSchema['products']>): Promise<boolean> {
    try {
      const { error } = await this.serviceClient
        .from('products')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', productId);

      if (error) {
        logger.error('Error updating product:', error);
        return false;
      }

      return true;
    } catch (error) {
      logger.error('Error in updateProduct:', error);
      return false;
    }
  }

  // Supply Chain Events
  async addSupplyChainEvent(eventData: Omit<DatabaseSchema['supply_chain_events'], 'id'>): Promise<string | null> {
    try {
      const { data, error } = await this.serviceClient
        .from('supply_chain_events')
        .insert(eventData)
        .select('id')
        .single();

      if (error) {
        logger.error('Error adding supply chain event:', error);
        return null;
      }

      return data.id;
    } catch (error) {
      logger.error('Error in addSupplyChainEvent:', error);
      return null;
    }
  }

  async getProductHistory(productId: string): Promise<DatabaseSchema['supply_chain_events'][]> {
    try {
      const { data, error } = await this.serviceClient
        .from('supply_chain_events')
        .select('*')
        .eq('product_id', productId)
        .order('timestamp', { ascending: false });

      if (error) {
        logger.error('Error fetching product history:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      logger.error('Error in getProductHistory:', error);
      return [];
    }
  }

  // IoT Device Management
  async registerIoTDevice(deviceData: Omit<DatabaseSchema['iot_devices'], 'id'>): Promise<string | null> {
    try {
      const { data, error } = await this.serviceClient
        .from('iot_devices')
        .insert(deviceData)
        .select('id')
        .single();

      if (error) {
        logger.error('Error registering IoT device:', error);
        return null;
      }

      return data.id;
    } catch (error) {
      logger.error('Error in registerIoTDevice:', error);
      return null;
    }
  }

  async addIoTData(iotData: Omit<DatabaseSchema['iot_data'], 'id'>): Promise<string | null> {
    try {
      const { data, error } = await this.serviceClient
        .from('iot_data')
        .insert(iotData)
        .select('id')
        .single();

      if (error) {
        logger.error('Error adding IoT data:', error);
        return null;
      }

      return data.id;
    } catch (error) {
      logger.error('Error in addIoTData:', error);
      return null;
    }
  }

  async getIoTData(deviceId: string, limit: number = 100): Promise<DatabaseSchema['iot_data'][]> {
    try {
      const { data, error } = await this.serviceClient
        .from('iot_data')
        .select('*')
        .eq('device_id', deviceId)
        .order('timestamp', { ascending: false })
        .limit(limit);

      if (error) {
        logger.error('Error fetching IoT data:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      logger.error('Error in getIoTData:', error);
      return [];
    }
  }

  // MPC Wallet Management
  async createMPCWallet(walletData: Omit<DatabaseSchema['mpc_wallets'], 'id'>): Promise<string | null> {
    try {
      const { data, error } = await this.serviceClient
        .from('mpc_wallets')
        .insert(walletData)
        .select('id')
        .single();

      if (error) {
        logger.error('Error creating MPC wallet:', error);
        return null;
      }

      return data.id;
    } catch (error) {
      logger.error('Error in createMPCWallet:', error);
      return null;
    }
  }

  // Notifications
  async createNotification(notificationData: Omit<DatabaseSchema['notifications'], 'id'>): Promise<string | null> {
    try {
      const { data, error } = await this.serviceClient
        .from('notifications')
        .insert(notificationData)
        .select('id')
        .single();

      if (error) {
        logger.error('Error creating notification:', error);
        return null;
      }

      return data.id;
    } catch (error) {
      logger.error('Error in createNotification:', error);
      return null;
    }
  }

  async getUserNotifications(userId: string, limit: number = 50): Promise<DatabaseSchema['notifications'][]> {
    try {
      const { data, error } = await this.serviceClient
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        logger.error('Error fetching notifications:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      logger.error('Error in getUserNotifications:', error);
      return [];
    }
  }

  // Analytics
  async trackEvent(eventData: Omit<DatabaseSchema['analytics_events'], 'id'>): Promise<void> {
    try {
      const { error } = await this.serviceClient
        .from('analytics_events')
        .insert(eventData);

      if (error) {
        logger.error('Error tracking analytics event:', error);
      }
    } catch (error) {
      logger.error('Error in trackEvent:', error);
    }
  }

  // Real-time subscriptions
  subscribeToProductUpdates(productId: string, callback: (payload: any) => void) {
    return this.client
      .channel(`product-${productId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'products',
        filter: `id=eq.${productId}`
      }, callback)
      .subscribe();
  }

  subscribeToIoTData(deviceId: string, callback: (payload: any) => void) {
    return this.client
      .channel(`iot-${deviceId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'iot_data',
        filter: `device_id=eq.${deviceId}`
      }, callback)
      .subscribe();
  }

  subscribeToUserNotifications(userId: string, callback: (payload: any) => void) {
    return this.client
      .channel(`notifications-${userId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${userId}`
      }, callback)
      .subscribe();
  }

  // Additional methods needed by routes
  async updateUserProfile(userId: string, updates: Partial<DatabaseSchema['users']>): Promise<boolean> {
    try {
      const { error } = await this.serviceClient
        .from('users')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);

      if (error) {
        logger.error('Error updating user profile:', error);
        return false;
      }

      return true;
    } catch (error) {
      logger.error('Error in updateUserProfile:', error);
      return false;
    }
  }

  async getProducts(options: {
    page: number;
    limit: number;
    status?: string;
    category?: string;
    userId?: string;
  }): Promise<{ data: DatabaseSchema['products'][]; total: number }> {
    try {
      let query = this.serviceClient.from('products').select('*', { count: 'exact' });

      if (options.status) {
        query = query.eq('status', options.status);
      }
      if (options.category) {
        query = query.eq('category', options.category);
      }
      if (options.userId) {
        query = query.eq('current_owner_id', options.userId);
      }

      const { data, error, count } = await query
        .range(
          (options.page - 1) * options.limit,
          options.page * options.limit - 1
        );

      if (error) {
        logger.error('Error fetching products:', error);
        return { data: [], total: 0 };
      }

      return { data: data || [], total: count || 0 };
    } catch (error) {
      logger.error('Error in getProducts:', error);
      return { data: [], total: 0 };
    }
  }

  async getUserIoTDevices(userId: string): Promise<DatabaseSchema['iot_devices'][]> {
    try {
      const { data, error } = await this.serviceClient
        .from('iot_devices')
        .select('*')
        .eq('owner_id', userId);

      if (error) {
        logger.error('Error fetching user IoT devices:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      logger.error('Error in getUserIoTDevices:', error);
      return [];
    }
  }

  async updateIoTDeviceStatus(deviceId: string, status: DatabaseSchema['iot_devices']['status']): Promise<boolean> {
    try {
      const { error } = await this.serviceClient
        .from('iot_devices')
        .update({ status })
        .eq('device_id', deviceId);

      if (error) {
        logger.error('Error updating IoT device status:', error);
        return false;
      }

      return true;
    } catch (error) {
      logger.error('Error in updateIoTDeviceStatus:', error);
      return false;
    }
  }

  async updateIoTData(dataId: string, updates: Partial<DatabaseSchema['iot_data']>): Promise<boolean> {
    try {
      const { error } = await this.serviceClient
        .from('iot_data')
        .update(updates)
        .eq('id', dataId);

      if (error) {
        logger.error('Error updating IoT data:', error);
        return false;
      }

      return true;
    } catch (error) {
      logger.error('Error in updateIoTData:', error);
      return false;
    }
  }

  async updateNotification(notificationId: string, updates: Partial<DatabaseSchema['notifications']>): Promise<boolean> {
    try {
      const { error } = await this.serviceClient
        .from('notifications')
        .update(updates)
        .eq('id', notificationId);

      if (error) {
        logger.error('Error updating notification:', error);
        return false;
      }

      return true;
    } catch (error) {
      logger.error('Error in updateNotification:', error);
      return false;
    }
  }

  async deleteNotification(notificationId: string): Promise<boolean> {
    try {
      const { error } = await this.serviceClient
        .from('notifications')
        .delete()
        .eq('id', notificationId);

      if (error) {
        logger.error('Error deleting notification:', error);
        return false;
      }

      return true;
    } catch (error) {
      logger.error('Error in deleteNotification:', error);
      return false;
    }
  }

  // Analytics methods
  async getUserCount(): Promise<number> {
    try {
      const { count, error } = await this.serviceClient
        .from('users')
        .select('*', { count: 'exact', head: true });

      if (error) {
        logger.error('Error getting user count:', error);
        return 0;
      }

      return count || 0;
    } catch (error) {
      logger.error('Error in getUserCount:', error);
      return 0;
    }
  }

  async getProductCount(): Promise<number> {
    try {
      const { count, error } = await this.serviceClient
        .from('products')
        .select('*', { count: 'exact', head: true });

      if (error) {
        logger.error('Error getting product count:', error);
        return 0;
      }

      return count || 0;
    } catch (error) {
      logger.error('Error in getProductCount:', error);
      return 0;
    }
  }

  async getEventCount(startDate: Date, endDate: Date): Promise<number> {
    try {
      const { count, error } = await this.serviceClient
        .from('analytics_events')
        .select('*', { count: 'exact', head: true })
        .gte('timestamp', startDate.toISOString())
        .lte('timestamp', endDate.toISOString());

      if (error) {
        logger.error('Error getting event count:', error);
        return 0;
      }

      return count || 0;
    } catch (error) {
      logger.error('Error in getEventCount:', error);
      return 0;
    }
  }

  async getActiveUserCount(startDate: Date, endDate: Date): Promise<number> {
    try {
      const { data, error } = await this.serviceClient
        .from('analytics_events')
        .select('user_id')
        .gte('timestamp', startDate.toISOString())
        .lte('timestamp', endDate.toISOString())
        .not('user_id', 'is', null);

      if (error) {
        logger.error('Error getting active user count:', error);
        return 0;
      }

      const uniqueUsers = new Set(data?.map(event => event.user_id) || []);
      return uniqueUsers.size;
    } catch (error) {
      logger.error('Error in getActiveUserCount:', error);
      return 0;
    }
  }

  async getProductsByStatus(): Promise<Record<string, number>> {
    try {
      const { data, error } = await this.serviceClient
        .from('products')
        .select('status');

      if (error) {
        logger.error('Error getting products by status:', error);
        return {};
      }

      const statusCounts = (data || []).reduce((acc, product) => {
        acc[product.status] = (acc[product.status] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      return statusCounts;
    } catch (error) {
      logger.error('Error in getProductsByStatus:', error);
      return {};
    }
  }

  async getEventsByType(startDate: Date, endDate: Date): Promise<Record<string, number>> {
    try {
      const { data, error } = await this.serviceClient
        .from('analytics_events')
        .select('event_type')
        .gte('timestamp', startDate.toISOString())
        .lte('timestamp', endDate.toISOString());

      if (error) {
        logger.error('Error getting events by type:', error);
        return {};
      }

      const typeCounts = (data || []).reduce((acc, event) => {
        acc[event.event_type] = (acc[event.event_type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      return typeCounts;
    } catch (error) {
      logger.error('Error in getEventsByType:', error);
      return {};
    }
  }

  async getUserActivityTimeline(startDate: Date, endDate: Date): Promise<Array<{
    date: string;
    activeUsers: number;
    events: number;
  }>> {
    try {
      // Simplified implementation - in reality, you'd group by date
      const { data, error } = await this.serviceClient
        .from('analytics_events')
        .select('timestamp, user_id')
        .gte('timestamp', startDate.toISOString())
        .lte('timestamp', endDate.toISOString());

      if (error) {
        logger.error('Error getting user activity timeline:', error);
        return [];
      }

      // Group by date (simplified)
      const timeline: Record<string, { users: Set<string>; events: number }> = {};
      
      (data || []).forEach(event => {
        const date = new Date(event.timestamp).toISOString().split('T')[0];
        if (!timeline[date]) {
          timeline[date] = { users: new Set(), events: 0 };
        }
        timeline[date].events++;
        if (event.user_id) {
          timeline[date].users.add(event.user_id);
        }
      });

      return Object.entries(timeline).map(([date, data]) => ({
        date,
        activeUsers: data.users.size,
        events: data.events
      }));
    } catch (error) {
      logger.error('Error in getUserActivityTimeline:', error);
      return [];
    }
  }

  async getProductEvents(productId: string): Promise<any[]> {
    try {
      const { data, error } = await this.serviceClient
        .from('analytics_events')
        .select('*')
        .eq('product_id', productId)
        .order('timestamp', { ascending: false });

      if (error) {
        logger.error('Error getting product events:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      logger.error('Error in getProductEvents:', error);
      return [];
    }
  }

  async getUserEvents(userId: string): Promise<any[]> {
    try {
      const { data, error } = await this.serviceClient
        .from('analytics_events')
        .select('*')
        .eq('user_id', userId)
        .order('timestamp', { ascending: false });

      if (error) {
        logger.error('Error getting user events:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      logger.error('Error in getUserEvents:', error);
      return [];
    }
  }

  async getUserProducts(userId: string): Promise<DatabaseSchema['products'][]> {
    try {
      const { data, error } = await this.serviceClient
        .from('products')
        .select('*')
        .eq('current_owner_id', userId);

      if (error) {
        logger.error('Error getting user products:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      logger.error('Error in getUserProducts:', error);
      return [];
    }
  }

  async getUserMostActiveProducts(userId: string): Promise<Array<{
    productId: string;
    productName: string;
    eventCount: number;
  }>> {
    try {
      const { data, error } = await this.serviceClient
        .from('analytics_events')
        .select('product_id, products(name)')
        .eq('user_id', userId)
        .not('product_id', 'is', null);

      if (error) {
        logger.error('Error getting user most active products:', error);
        return [];
      }

      const productCounts = (data || []).reduce((acc, event) => {
        const productId = event.product_id;
        if (!acc[productId]) {
          acc[productId] = { count: 0, name: 'Unknown' };
        }
        acc[productId].count++;
        return acc;
      }, {} as Record<string, { count: number; name: string }>);

      return Object.entries(productCounts).map(([productId, data]) => ({
        productId,
        productName: data.name,
        eventCount: data.count
      }));
    } catch (error) {
      logger.error('Error in getUserMostActiveProducts:', error);
      return [];
    }
  }

  async getSupplyChainTransfers(): Promise<any[]> {
    try {
      const { data, error } = await this.serviceClient
        .from('supply_chain_events')
        .select('*')
        .eq('event_type', 'transfer');

      if (error) {
        logger.error('Error getting supply chain transfers:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      logger.error('Error in getSupplyChainTransfers:', error);
      return [];
    }
  }

  async getIoTDevices(): Promise<DatabaseSchema['iot_devices'][]> {
    try {
      const { data, error } = await this.serviceClient
        .from('iot_devices')
        .select('*');

      if (error) {
        logger.error('Error getting IoT devices:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      logger.error('Error in getIoTDevices:', error);
      return [];
    }
  }

  async getIoTDataPointsPerDay(): Promise<number> {
    try {
      const today = new Date();
      const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      
      const { count, error } = await this.serviceClient
        .from('iot_data')
        .select('*', { count: 'exact', head: true })
        .gte('timestamp', startOfDay.toISOString());

      if (error) {
        logger.error('Error getting IoT data points per day:', error);
        return 0;
      }

      return count || 0;
    } catch (error) {
      logger.error('Error in getIoTDataPointsPerDay:', error);
      return 0;
    }
  }

  async getIoTAlertFrequency(): Promise<Record<string, number>> {
    try {
      const { data, error } = await this.serviceClient
        .from('analytics_events')
        .select('metadata')
        .like('event_type', '%alert%');

      if (error) {
        logger.error('Error getting IoT alert frequency:', error);
        return {};
      }

      const alertCounts = (data || []).reduce((acc, event) => {
        const alertType = event.metadata?.alertType || 'unknown';
        acc[alertType] = (acc[alertType] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      return alertCounts;
    } catch (error) {
      logger.error('Error in getIoTAlertFrequency:', error);
      return {};
    }
  }

  async getDeviceHealth(): Promise<Array<{
    deviceId: string;
    status: string;
    lastSeen: string;
    dataPoints: number;
  }>> {
    try {
      const { data, error } = await this.serviceClient
        .from('iot_devices')
        .select('device_id, status, last_seen');

      if (error) {
        logger.error('Error getting device health:', error);
        return [];
      }

      // Get data point counts for each device
      const deviceHealth = await Promise.all(
        (data || []).map(async (device) => {
          const { count } = await this.serviceClient
            .from('iot_data')
            .select('*', { count: 'exact', head: true })
            .eq('device_id', device.device_id);

          return {
            deviceId: device.device_id,
            status: device.status,
            lastSeen: device.last_seen,
            dataPoints: count || 0
          };
        })
      );

      return deviceHealth;
    } catch (error) {
      logger.error('Error in getDeviceHealth:', error);
      return [];
    }
  }

  async getIoTAnalytics(userId: string, timeRange: string): Promise<any> {
    try {
      // Simplified implementation
      const devices = await this.getUserIoTDevices(userId);
      const totalDataPoints = await this.serviceClient
        .from('iot_data')
        .select('*', { count: 'exact', head: true })
        .in('device_id', devices.map(d => d.device_id));

      return {
        totalDevices: devices.length,
        activeDevices: devices.filter(d => d.status === 'active').length,
        totalDataPoints: totalDataPoints.count || 0,
        devices: devices.map(device => ({
          deviceId: device.device_id,
          deviceType: device.device_type,
          status: device.status,
          lastSeen: device.last_seen
        }))
      };
    } catch (error) {
      logger.error('Error in getIoTAnalytics:', error);
      return {
        totalDevices: 0,
        activeDevices: 0,
        totalDataPoints: 0,
        devices: []
      };
    }
  }

  // Authentication methods
  async signInWithPassword(email: string, password: string): Promise<any> {
    return this.client.auth.signInWithPassword({
      email,
      password
    });
  }

  async updateAuthUser(data: any): Promise<any> {
    return this.client.auth.updateUser(data);
  }

  async verifyOtp(data: any): Promise<any> {
    return this.client.auth.verifyOtp(data);
  }

  // Wallet-based authentication
  async getUserByWallet(walletAddress: string): Promise<DatabaseSchema['users'] | null> {
    try {
      const { data, error } = await this.serviceClient
        .from('users')
        .select('*')
        .eq('wallet_address', walletAddress.toLowerCase())
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null; // User doesn't exist
        }
        logger.error('Error fetching user by wallet:', error);
        return null;
      }

      return data;
    } catch (error) {
      logger.error('Error in getUserByWallet:', error);
      return null;
    }
  }

  async createUserWithWallet(userData: {
    wallet_address: string;
    role: string;
  }): Promise<string | null> {
    try {
      const userId = crypto.randomUUID ? crypto.randomUUID() : require('uuid').v4();
      
      const { error } = await this.serviceClient
        .from('users')
        .insert({
          id: userId,
          email: `${userData.wallet_address.toLowerCase()}@wallet.local`,
          wallet_address: userData.wallet_address.toLowerCase(),
          role: userData.role,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });

      if (error) {
        logger.error('Error creating user with wallet:', error);
        return null;
      }

      logger.info(`Wallet user created: ${userData.wallet_address}`);
      return userId;
    } catch (error) {
      logger.error('Error in createUserWithWallet:', error);
      return null;
    }
  }
}

export default SupabaseService;
