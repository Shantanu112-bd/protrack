import { Router, Request, Response } from 'express';
import { NotificationService } from '../services/NotificationService';
import { asyncHandler, BadRequestError, NotFoundError } from '../middleware/errorHandler';
import { logger } from '../utils/logger';

const router = Router();
const notificationService = new NotificationService(null as any); // Socket.IO will be injected

// Initialize notification service
router.use(async (req, res, next) => {
  if (!notificationService) {
    await notificationService.initialize();
  }
  next();
});

// Get user notifications
router.get('/', asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  const { limit = 50, unread_only = false } = req.query;

  try {
    const notifications = await notificationService.getUserNotifications(
      userId, 
      parseInt(limit as string)
    );

    const filteredNotifications = unread_only === 'true' 
      ? notifications.filter(n => !n.read)
      : notifications;

    res.json({
      success: true,
      data: {
        notifications: filteredNotifications,
        count: filteredNotifications.length,
        unread_count: notifications.filter(n => !n.read).length
      }
    });
  } catch (error) {
    logger.error(`Error fetching notifications for user ${userId}:`, error);
    throw error;
  }
}));

// Mark notification as read
router.patch('/:notificationId/read', asyncHandler(async (req: Request, res: Response) => {
  const { notificationId } = req.params;
  const userId = (req as any).user.id;

  try {
    const success = await notificationService.markNotificationAsRead(notificationId, userId);
    
    if (!success) {
      throw new BadRequestError('Failed to mark notification as read');
    }

    res.json({
      success: true,
      message: 'Notification marked as read'
    });
  } catch (error) {
    logger.error(`Error marking notification ${notificationId} as read:`, error);
    throw error;
  }
}));

// Mark all notifications as read
router.patch('/read-all', asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as any).user.id;

  try {
    const success = await notificationService.markAllNotificationsAsRead(userId);
    
    if (!success) {
      throw new BadRequestError('Failed to mark all notifications as read');
    }

    res.json({
      success: true,
      message: 'All notifications marked as read'
    });
  } catch (error) {
    logger.error(`Error marking all notifications as read for user ${userId}:`, error);
    throw error;
  }
}));

// Delete notification
router.delete('/:notificationId', asyncHandler(async (req: Request, res: Response) => {
  const { notificationId } = req.params;
  const userId = (req as any).user.id;

  try {
    const success = await notificationService.deleteNotification(notificationId, userId);
    
    if (!success) {
      throw new BadRequestError('Failed to delete notification');
    }

    res.json({
      success: true,
      message: 'Notification deleted successfully'
    });
  } catch (error) {
    logger.error(`Error deleting notification ${notificationId}:`, error);
    throw error;
  }
}));

// Get notification statistics
router.get('/stats', asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as any).user.id;

  try {
    const stats = await notificationService.getNotificationStats(userId);
    
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    logger.error(`Error getting notification stats for user ${userId}:`, error);
    throw error;
  }
}));

// Create notification (admin only)
router.post('/', asyncHandler(async (req: Request, res: Response) => {
  const { userId, type, title, message, metadata } = req.body;

  if (!userId || !type || !title || !message) {
    throw new BadRequestError('User ID, type, title, and message are required');
  }

  const validTypes = ['alert', 'info', 'warning', 'success'];
  if (!validTypes.includes(type)) {
    throw new BadRequestError('Invalid notification type');
  }

  try {
    const notificationId = await notificationService.createNotification({
      userId,
      type: type as any,
      title,
      message,
      metadata
    });

    if (!notificationId) {
      throw new BadRequestError('Failed to create notification');
    }

    res.status(201).json({
      success: true,
      message: 'Notification created successfully',
      data: {
        notification_id: notificationId
      }
    });
  } catch (error) {
    logger.error('Error creating notification:', error);
    throw error;
  }
}));

export default router;
