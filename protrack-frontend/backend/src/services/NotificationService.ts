import { Server as SocketIOServer } from 'socket.io';
import { SupabaseService } from './SupabaseService';
import { logger } from '../utils/logger';

export interface NotificationData {
  userId: string;
  type: 'alert' | 'info' | 'warning' | 'success';
  title: string;
  message: string;
  metadata?: any;
}

export interface Notification {
  id: string;
  user_id: string;
  type: 'alert' | 'info' | 'warning' | 'success';
  title: string;
  message: string;
  read: boolean;
  metadata?: any;
  created_at: string;
}

export class NotificationService {
  private io: SocketIOServer;
  private supabaseService: SupabaseService;

  constructor(io: SocketIOServer) {
    this.io = io;
    this.supabaseService = new SupabaseService();
  }

  async initialize(): Promise<void> {
    try {
      await this.supabaseService.initialize();
      logger.info('✅ Notification service initialized');
    } catch (error) {
      logger.error('❌ Failed to initialize notification service:', error);
    }
  }

  async createNotification(notificationData: NotificationData): Promise<string | null> {
    try {
      const notificationId = await this.supabaseService.createNotification({
        user_id: notificationData.userId,
        type: notificationData.type,
        title: notificationData.title,
        message: notificationData.message,
        metadata: notificationData.metadata,
        read: false,
        created_at: new Date().toISOString()
      });

      if (notificationId) {
        // Send real-time notification to user
        this.sendRealtimeNotification(notificationData.userId, {
          id: notificationId,
          user_id: notificationData.userId,
          type: notificationData.type,
          title: notificationData.title,
          message: notificationData.message,
          metadata: notificationData.metadata,
          read: false,
          created_at: new Date().toISOString()
        });

        logger.info(`📢 Notification created and sent: ${notificationId}`);
      }

      return notificationId;
    } catch (error) {
      logger.error('Error creating notification:', error);
      return null;
    }
  }

  async getUserNotifications(userId: string, limit: number = 50): Promise<Notification[]> {
    try {
      return await this.supabaseService.getUserNotifications(userId, limit);
    } catch (error) {
      logger.error(`Error getting notifications for user ${userId}:`, error);
      return [];
    }
  }

  async markNotificationAsRead(notificationId: string, userId: string): Promise<boolean> {
    try {
      // Update notification in database
      const success = await this.supabaseService.updateNotification(notificationId, { read: true });
      
      if (success) {
        // Notify user about the update
        this.io.to(`user-${userId}`).emit('notification-read', { notificationId });
        logger.info(`📢 Notification marked as read: ${notificationId}`);
      }

      return success;
    } catch (error) {
      logger.error(`Error marking notification as read: ${notificationId}`, error);
      return false;
    }
  }

  async markAllNotificationsAsRead(userId: string): Promise<boolean> {
    try {
      // Get all unread notifications for user
      const notifications = await this.supabaseService.getUserNotifications(userId, 1000);
      const unreadNotifications = notifications.filter(n => !n.read);

      // Mark all as read
      for (const notification of unreadNotifications) {
        await this.supabaseService.updateNotification(notification.id, { read: true });
      }

      // Notify user about the update
      this.io.to(`user-${userId}`).emit('all-notifications-read', { count: unreadNotifications.length });
      logger.info(`📢 All notifications marked as read for user: ${userId}`);

      return true;
    } catch (error) {
      logger.error(`Error marking all notifications as read for user ${userId}:`, error);
      return false;
    }
  }

  async deleteNotification(notificationId: string, userId: string): Promise<boolean> {
    try {
      const success = await this.supabaseService.deleteNotification(notificationId);
      
      if (success) {
        // Notify user about the deletion
        this.io.to(`user-${userId}`).emit('notification-deleted', { notificationId });
        logger.info(`📢 Notification deleted: ${notificationId}`);
      }

      return success;
    } catch (error) {
      logger.error(`Error deleting notification: ${notificationId}`, error);
      return false;
    }
  }

  private sendRealtimeNotification(userId: string, notification: Notification): void {
    try {
      this.io.to(`user-${userId}`).emit('new-notification', notification);
      logger.info(`📡 Real-time notification sent to user: ${userId}`);
    } catch (error) {
      logger.error(`Error sending real-time notification to user ${userId}:`, error);
    }
  }

  // Product-related notifications
  async notifyProductCreated(productId: string, productName: string, manufacturerId: string): Promise<void> {
    try {
      const notificationData: NotificationData = {
        userId: manufacturerId,
        type: 'success',
        title: 'Product Created',
        message: `Product "${productName}" has been successfully created and added to the blockchain.`,
        metadata: { productId, productName, type: 'product_created' }
      };

      await this.createNotification(notificationData);
    } catch (error) {
      logger.error(`Error notifying product creation: ${productId}`, error);
    }
  }

  async notifyProductTransferred(productId: string, productName: string, fromUserId: string, toUserId: string): Promise<void> {
    try {
      // Notify sender
      const senderNotification: NotificationData = {
        userId: fromUserId,
        type: 'info',
        title: 'Product Transferred',
        message: `Product "${productName}" has been transferred successfully.`,
        metadata: { productId, productName, type: 'product_transferred', direction: 'sent' }
      };

      // Notify receiver
      const receiverNotification: NotificationData = {
        userId: toUserId,
        type: 'info',
        title: 'Product Received',
        message: `You have received product "${productName}".`,
        metadata: { productId, productName, type: 'product_transferred', direction: 'received' }
      };

      await Promise.all([
        this.createNotification(senderNotification),
        this.createNotification(receiverNotification)
      ]);
    } catch (error) {
      logger.error(`Error notifying product transfer: ${productId}`, error);
    }
  }

  async notifyProductRecall(productId: string, productName: string, userIds: string[]): Promise<void> {
    try {
      const notifications = userIds.map(userId => ({
        userId,
        type: 'alert' as const,
        title: 'Product Recall Alert',
        message: `Product "${productName}" has been recalled. Please take immediate action.`,
        metadata: { productId, productName, type: 'product_recall' }
      }));

      await Promise.all(notifications.map(notification => this.createNotification(notification)));
    } catch (error) {
      logger.error(`Error notifying product recall: ${productId}`, error);
    }
  }

  // IoT-related notifications
  async notifyIoTAlert(deviceId: string, alertType: string, message: string, userId: string): Promise<void> {
    try {
      const notificationData: NotificationData = {
        userId,
        type: 'warning',
        title: 'IoT Device Alert',
        message: `Device ${deviceId}: ${message}`,
        metadata: { deviceId, alertType, type: 'iot_alert' }
      };

      await this.createNotification(notificationData);
    } catch (error) {
      logger.error(`Error notifying IoT alert: ${deviceId}`, error);
    }
  }

  async notifyTemperatureAlert(deviceId: string, temperature: number, threshold: number, userId: string): Promise<void> {
    try {
      const notificationData: NotificationData = {
        userId,
        type: 'alert',
        title: 'Temperature Alert',
        message: `Device ${deviceId} temperature (${temperature}°C) exceeds threshold (${threshold}°C).`,
        metadata: { deviceId, temperature, threshold, type: 'temperature_alert' }
      };

      await this.createNotification(notificationData);
    } catch (error) {
      logger.error(`Error notifying temperature alert: ${deviceId}`, error);
    }
  }

  async notifyHumidityAlert(deviceId: string, humidity: number, threshold: number, userId: string): Promise<void> {
    try {
      const notificationData: NotificationData = {
        userId,
        type: 'alert',
        title: 'Humidity Alert',
        message: `Device ${deviceId} humidity (${humidity}%) exceeds threshold (${threshold}%).`,
        metadata: { deviceId, humidity, threshold, type: 'humidity_alert' }
      };

      await this.createNotification(notificationData);
    } catch (error) {
      logger.error(`Error notifying humidity alert: ${deviceId}`, error);
    }
  }

  // System notifications
  async notifySystemMaintenance(message: string, userIds: string[]): Promise<void> {
    try {
      const notifications = userIds.map(userId => ({
        userId,
        type: 'info' as const,
        title: 'System Maintenance',
        message,
        metadata: { type: 'system_maintenance' }
      }));

      await Promise.all(notifications.map(notification => this.createNotification(notification)));
    } catch (error) {
      logger.error('Error notifying system maintenance:', error);
    }
  }

  async notifySecurityAlert(userId: string, message: string): Promise<void> {
    try {
      const notificationData: NotificationData = {
        userId,
        type: 'alert',
        title: 'Security Alert',
        message,
        metadata: { type: 'security_alert' }
      };

      await this.createNotification(notificationData);
    } catch (error) {
      logger.error(`Error notifying security alert for user ${userId}:`, error);
    }
  }

  // Broadcast notifications to all users
  async broadcastNotification(title: string, message: string, type: 'alert' | 'info' | 'warning' | 'success' = 'info'): Promise<void> {
    try {
      // Get all users (in a real implementation, you'd get this from the database)
      // For now, we'll broadcast to all connected clients
      this.io.emit('broadcast-notification', {
        type,
        title,
        message,
        timestamp: new Date().toISOString()
      });

      logger.info(`📢 Broadcast notification sent: ${title}`);
    } catch (error) {
      logger.error('Error broadcasting notification:', error);
    }
  }

  // Get notification statistics
  async getNotificationStats(userId: string): Promise<{
    total: number;
    unread: number;
    byType: Record<string, number>;
  }> {
    try {
      const notifications = await this.supabaseService.getUserNotifications(userId, 1000);
      
      const stats = {
        total: notifications.length,
        unread: notifications.filter(n => !n.read).length,
        byType: notifications.reduce((acc, notification) => {
          acc[notification.type] = (acc[notification.type] || 0) + 1;
          return acc;
        }, {} as Record<string, number>)
      };

      return stats;
    } catch (error) {
      logger.error(`Error getting notification stats for user ${userId}:`, error);
      return { total: 0, unread: 0, byType: {} };
    }
  }
}

export default NotificationService;
