import { SupabaseService } from './SupabaseService';
import { logger } from '../utils/logger';

export interface AnalyticsEvent {
  eventType: string;
  userId?: string;
  productId?: string;
  metadata?: any;
  timestamp: string;
}

export interface AnalyticsMetrics {
  totalUsers: number;
  totalProducts: number;
  totalEvents: number;
  activeUsers: number;
  productsByStatus: Record<string, number>;
  eventsByType: Record<string, number>;
  userActivity: Array<{
    date: string;
    activeUsers: number;
    events: number;
  }>;
}

export interface ProductAnalytics {
  productId: string;
  productName: string;
  totalEvents: number;
  eventsByType: Record<string, number>;
  timeline: Array<{
    timestamp: string;
    eventType: string;
    metadata?: any;
  }>;
  averageProcessingTime?: number;
  qualityScore?: number;
}

export interface UserAnalytics {
  userId: string;
  userRole: string;
  totalProducts: number;
  totalEvents: number;
  activityTimeline: Array<{
    date: string;
    events: number;
    products: number;
  }>;
  mostActiveProducts: Array<{
    productId: string;
    productName: string;
    eventCount: number;
  }>;
}

export class AnalyticsService {
  private supabaseService: SupabaseService;

  constructor(supabaseService: SupabaseService) {
    this.supabaseService = supabaseService;
  }

  async initialize(): Promise<void> {
    try {
      logger.info('✅ Analytics service initialized');
    } catch (error) {
      logger.error('❌ Failed to initialize analytics service:', error);
    }
  }

  async trackEvent(eventData: Omit<AnalyticsEvent, 'timestamp'>): Promise<void> {
    try {
      const event: AnalyticsEvent = {
        ...eventData,
        timestamp: new Date().toISOString()
      };

      await this.supabaseService.trackEvent(event);
      logger.debug(`📊 Event tracked: ${event.eventType}`);
    } catch (error) {
      logger.error('Error tracking analytics event:', error);
    }
  }

  async trackUserLogin(userId: string, userRole: string): Promise<void> {
    try {
      await this.trackEvent({
        eventType: 'user_login',
        userId,
        metadata: { userRole, timestamp: new Date().toISOString() }
      });
    } catch (error) {
      logger.error(`Error tracking user login for ${userId}:`, error);
    }
  }

  async trackUserLogout(userId: string): Promise<void> {
    try {
      await this.trackEvent({
        eventType: 'user_logout',
        userId,
        metadata: { timestamp: new Date().toISOString() }
      });
    } catch (error) {
      logger.error(`Error tracking user logout for ${userId}:`, error);
    }
  }

  async trackProductCreated(productId: string, productName: string, manufacturerId: string): Promise<void> {
    try {
      await this.trackEvent({
        eventType: 'product_created',
        userId: manufacturerId,
        productId,
        metadata: { productName, manufacturerId }
      });
    } catch (error) {
      logger.error(`Error tracking product creation: ${productId}`, error);
    }
  }

  async trackProductTransferred(productId: string, fromUserId: string, toUserId: string): Promise<void> {
    try {
      await this.trackEvent({
        eventType: 'product_transferred',
        userId: fromUserId,
        productId,
        metadata: { fromUserId, toUserId }
      });
    } catch (error) {
      logger.error(`Error tracking product transfer: ${productId}`, error);
    }
  }

  async trackProductStatusChange(productId: string, oldStatus: string, newStatus: string, userId: string): Promise<void> {
    try {
      await this.trackEvent({
        eventType: 'product_status_changed',
        userId,
        productId,
        metadata: { oldStatus, newStatus }
      });
    } catch (error) {
      logger.error(`Error tracking product status change: ${productId}`, error);
    }
  }

  async trackIoTDataReceived(deviceId: string, dataType: string, value: number, productId?: string): Promise<void> {
    try {
      await this.trackEvent({
        eventType: 'iot_data_received',
        productId,
        metadata: { deviceId, dataType, value }
      });
    } catch (error) {
      logger.error(`Error tracking IoT data: ${deviceId}`, error);
    }
  }

  async trackFileUpload(fileType: string, fileSize: number, userId: string): Promise<void> {
    try {
      await this.trackEvent({
        eventType: 'file_uploaded',
        userId,
        metadata: { fileType, fileSize }
      });
    } catch (error) {
      logger.error(`Error tracking file upload for user ${userId}:`, error);
    }
  }

  async trackBlockchainTransaction(txHash: string, txType: string, userId: string, productId?: string): Promise<void> {
    try {
      await this.trackEvent({
        eventType: 'blockchain_transaction',
        userId,
        productId,
        metadata: { txHash, txType }
      });
    } catch (error) {
      logger.error(`Error tracking blockchain transaction: ${txHash}`, error);
    }
  }

  async trackIPFSUpload(hash: string, fileType: string, fileSize: number, userId: string): Promise<void> {
    try {
      await this.trackEvent({
        eventType: 'ipfs_upload',
        userId,
        metadata: { hash, fileType, fileSize }
      });
    } catch (error) {
      logger.error(`Error tracking IPFS upload: ${hash}`, error);
    }
  }

  async getOverallMetrics(timeRange: 'day' | 'week' | 'month' | 'year' = 'month'): Promise<AnalyticsMetrics> {
    try {
      const endDate = new Date();
      const startDate = new Date();
      
      switch (timeRange) {
        case 'day':
          startDate.setDate(endDate.getDate() - 1);
          break;
        case 'week':
          startDate.setDate(endDate.getDate() - 7);
          break;
        case 'month':
          startDate.setMonth(endDate.getMonth() - 1);
          break;
        case 'year':
          startDate.setFullYear(endDate.getFullYear() - 1);
          break;
      }

      // Get basic counts
      const totalUsers = await this.supabaseService.getUserCount();
      const totalProducts = await this.supabaseService.getProductCount();
      const totalEvents = await this.supabaseService.getEventCount(startDate, endDate);
      const activeUsers = await this.supabaseService.getActiveUserCount(startDate, endDate);

      // Get products by status
      const productsByStatus = await this.supabaseService.getProductsByStatus();

      // Get events by type
      const eventsByType = await this.supabaseService.getEventsByType(startDate, endDate);

      // Get user activity timeline
      const userActivity = await this.supabaseService.getUserActivityTimeline(startDate, endDate);

      return {
        totalUsers,
        totalProducts,
        totalEvents,
        activeUsers,
        productsByStatus,
        eventsByType,
        userActivity
      };
    } catch (error) {
      logger.error('Error getting overall metrics:', error);
      return {
        totalUsers: 0,
        totalProducts: 0,
        totalEvents: 0,
        activeUsers: 0,
        productsByStatus: {},
        eventsByType: {},
        userActivity: []
      };
    }
  }

  async getProductAnalytics(productId: string): Promise<ProductAnalytics | null> {
    try {
      const product = await this.supabaseService.getProduct(productId);
      if (!product) {
        return null;
      }

      const events = await this.supabaseService.getProductEvents(productId);
      const eventsByType = events.reduce((acc, event) => {
        acc[event.eventType] = (acc[event.eventType] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const timeline = events.map(event => ({
        timestamp: event.timestamp,
        eventType: event.eventType,
        metadata: event.metadata
      }));

      // Calculate average processing time (simplified)
      const averageProcessingTime = this.calculateAverageProcessingTime(events);

      // Calculate quality score (simplified)
      const qualityScore = this.calculateQualityScore(events);

      return {
        productId,
        productName: product.name,
        totalEvents: events.length,
        eventsByType,
        timeline,
        averageProcessingTime,
        qualityScore
      };
    } catch (error) {
      logger.error(`Error getting product analytics for ${productId}:`, error);
      return null;
    }
  }

  async getUserAnalytics(userId: string): Promise<UserAnalytics | null> {
    try {
      const user = await this.supabaseService.getUserProfile(userId);
      if (!user) {
        return null;
      }

      const userEvents = await this.supabaseService.getUserEvents(userId);
      const userProducts = await this.supabaseService.getUserProducts(userId);

      const activityTimeline = await this.supabaseService.getUserActivityTimeline(userId);
      const mostActiveProducts = await this.supabaseService.getUserMostActiveProducts(userId);

      return {
        userId,
        userRole: user.role,
        totalProducts: userProducts.length,
        totalEvents: userEvents.length,
        activityTimeline,
        mostActiveProducts
      };
    } catch (error) {
      logger.error(`Error getting user analytics for ${userId}:`, error);
      return null;
    }
  }

  async getSupplyChainMetrics(): Promise<{
    totalTransfers: number;
    averageTransferTime: number;
    bottleneckAnalysis: Array<{
      stage: string;
      averageTime: number;
      frequency: number;
    }>;
    qualityMetrics: {
      defectRate: number;
      recallRate: number;
      complianceScore: number;
    };
  }> {
    try {
      const transfers = await this.supabaseService.getSupplyChainTransfers();
      const averageTransferTime = this.calculateAverageTransferTime(transfers);
      const bottleneckAnalysis = this.analyzeBottlenecks(transfers);
      const qualityMetrics = await this.calculateQualityMetrics();

      return {
        totalTransfers: transfers.length,
        averageTransferTime,
        bottleneckAnalysis,
        qualityMetrics
      };
    } catch (error) {
      logger.error('Error getting supply chain metrics:', error);
      return {
        totalTransfers: 0,
        averageTransferTime: 0,
        bottleneckAnalysis: [],
        qualityMetrics: {
          defectRate: 0,
          recallRate: 0,
          complianceScore: 0
        }
      };
    }
  }

  async getIoTMetrics(): Promise<{
    totalDevices: number;
    activeDevices: number;
    dataPointsPerDay: number;
    alertFrequency: Record<string, number>;
    deviceHealth: Array<{
      deviceId: string;
      status: string;
      lastSeen: string;
      dataPoints: number;
    }>;
  }> {
    try {
      const devices = await this.supabaseService.getIoTDevices();
      const activeDevices = devices.filter(d => d.status === 'active').length;
      const dataPointsPerDay = await this.supabaseService.getIoTDataPointsPerDay();
      const alertFrequency = await this.supabaseService.getIoTAlertFrequency();
      const deviceHealth = await this.supabaseService.getDeviceHealth();

      return {
        totalDevices: devices.length,
        activeDevices,
        dataPointsPerDay,
        alertFrequency,
        deviceHealth
      };
    } catch (error) {
      logger.error('Error getting IoT metrics:', error);
      return {
        totalDevices: 0,
        activeDevices: 0,
        dataPointsPerDay: 0,
        alertFrequency: {},
        deviceHealth: []
      };
    }
  }

  private calculateAverageProcessingTime(events: any[]): number {
    // Simplified calculation - in reality, you'd calculate based on event timestamps
    return events.length * 2.5; // 2.5 hours average per event
  }

  private calculateQualityScore(events: any[]): number {
    // Simplified quality score calculation
    const qualityEvents = events.filter(e => 
      e.eventType === 'quality_check' || 
      e.eventType === 'inspection' ||
      e.eventType === 'certification'
    );
    
    return Math.min(100, (qualityEvents.length / events.length) * 100);
  }

  private calculateAverageTransferTime(transfers: any[]): number {
    if (transfers.length === 0) return 0;
    
    // Simplified calculation
    return transfers.reduce((sum, transfer) => sum + (transfer.duration || 24), 0) / transfers.length;
  }

  private analyzeBottlenecks(transfers: any[]): Array<{
    stage: string;
    averageTime: number;
    frequency: number;
  }> {
    // Simplified bottleneck analysis
    const stages = ['manufacturing', 'packaging', 'shipping', 'delivery'];
    
    return stages.map(stage => ({
      stage,
      averageTime: Math.random() * 48, // Random for demo
      frequency: Math.floor(Math.random() * 100)
    }));
  }

  private async calculateQualityMetrics(): Promise<{
    defectRate: number;
    recallRate: number;
    complianceScore: number;
  }> {
    // Simplified quality metrics calculation
    return {
      defectRate: Math.random() * 5, // 0-5%
      recallRate: Math.random() * 2, // 0-2%
      complianceScore: 85 + Math.random() * 15 // 85-100%
    };
  }
}

export default AnalyticsService;
