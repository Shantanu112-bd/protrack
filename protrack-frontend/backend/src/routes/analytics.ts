import { Router, Request, Response } from 'express';
import { AnalyticsService } from '../services/AnalyticsService';
import { SupabaseService } from '../services/SupabaseService';
import { asyncHandler, BadRequestError } from '../middleware/errorHandler';
import { logger } from '../utils/logger';

const router = Router();
const supabaseService = new SupabaseService();
const analyticsService = new AnalyticsService(supabaseService);

// Initialize services
router.use(async (req, res, next) => {
  if (!supabaseService.isConnected()) {
    await supabaseService.initialize();
  }
  await analyticsService.initialize();
  next();
});

// Track event
router.post('/track', asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as any).user?.id;
  const { eventType, productId, metadata } = req.body;

  if (!eventType) {
    throw new BadRequestError('Event type is required');
  }

  try {
    await analyticsService.trackEvent({
      eventType,
      userId,
      productId,
      metadata
    });

    res.json({
      success: true,
      message: 'Event tracked successfully'
    });
  } catch (error) {
    logger.error('Error tracking event:', error);
    throw error;
  }
}));

// Get overall metrics
router.get('/metrics', asyncHandler(async (req: Request, res: Response) => {
  const { timeRange = 'month' } = req.query;

  try {
    const metrics = await analyticsService.getOverallMetrics(timeRange as any);
    
    res.json({
      success: true,
      data: metrics
    });
  } catch (error) {
    logger.error('Error getting overall metrics:', error);
    throw error;
  }
}));

// Get product analytics
router.get('/product/:productId', asyncHandler(async (req: Request, res: Response) => {
  const { productId } = req.params;

  try {
    const analytics = await analyticsService.getProductAnalytics(productId);
    
    if (!analytics) {
      throw new BadRequestError('Product analytics not found');
    }

    res.json({
      success: true,
      data: analytics
    });
  } catch (error) {
    logger.error(`Error getting product analytics for ${productId}:`, error);
    throw error;
  }
}));

// Get user analytics
router.get('/user/:userId', asyncHandler(async (req: Request, res: Response) => {
  const { userId } = req.params;

  try {
    const analytics = await analyticsService.getUserAnalytics(userId);
    
    if (!analytics) {
      throw new BadRequestError('User analytics not found');
    }

    res.json({
      success: true,
      data: analytics
    });
  } catch (error) {
    logger.error(`Error getting user analytics for ${userId}:`, error);
    throw error;
  }
}));

// Get supply chain metrics
router.get('/supply-chain', asyncHandler(async (req: Request, res: Response) => {
  try {
    const metrics = await analyticsService.getSupplyChainMetrics();
    
    res.json({
      success: true,
      data: metrics
    });
  } catch (error) {
    logger.error('Error getting supply chain metrics:', error);
    throw error;
  }
}));

// Get IoT metrics
router.get('/iot', asyncHandler(async (req: Request, res: Response) => {
  try {
    const metrics = await analyticsService.getIoTMetrics();
    
    res.json({
      success: true,
      data: metrics
    });
  } catch (error) {
    logger.error('Error getting IoT metrics:', error);
    throw error;
  }
}));

export default router;
