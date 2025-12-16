import { Router, Request, Response } from 'express';
import { SupabaseService } from '../services/SupabaseService';
import { BlockchainService } from '../services/BlockchainService';
import { asyncHandler, BadRequestError, NotFoundError } from '../middleware/errorHandler';
import { logger } from '../utils/logger';

const router = Router();
const supabaseService = new SupabaseService();
const blockchainService = new BlockchainService();

// Initialize services
router.use(async (req, res, next) => {
  if (!supabaseService.isConnected()) {
    await supabaseService.initialize();
  }
  if (!blockchainService.isConnected()) {
    await blockchainService.initialize();
  }
  next();
});

// Register IoT device
router.post('/devices', asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  const { device_id, device_type, product_id, metadata } = req.body;

  if (!device_id || !device_type) {
    throw BadRequestError('Device ID and device type are required');
  }

  const validDeviceTypes = ['temperature', 'humidity', 'gps', 'rfid', 'camera'];
  if (!validDeviceTypes.includes(device_type)) {
    throw BadRequestError('Invalid device type');
  }

  try {
    const deviceId = await supabaseService.registerIoTDevice({
      device_id,
      device_type: device_type as any,
      owner_id: userId,
      product_id: product_id || null,
      status: 'active',
      last_seen: new Date().toISOString(),
      metadata: metadata || {}
    });

    if (!deviceId) {
      throw BadRequestError('Failed to register IoT device');
    }

    logger.info(`IoT device registered: ${device_id} by user ${userId}`);

    res.status(201).json({
      success: true,
      message: 'IoT device registered successfully',
      data: {
        device: {
          id: deviceId,
          device_id,
          device_type,
          owner_id: userId,
          product_id,
          status: 'active',
          metadata
        }
      }
    });
  } catch (error) {
    logger.error('IoT device registration error:', error);
    throw error;
  }
}));

// Submit IoT data
router.post('/data', asyncHandler(async (req: Request, res: Response) => {
  const { device_id, data_type, value, unit, location, product_id } = req.body;

  if (!device_id || !data_type || value === undefined) {
    throw BadRequestError('Device ID, data type, and value are required');
  }

  try {
    // Add IoT data to database
    const dataId = await supabaseService.addIoTData({
      device_id,
      product_id: product_id || null,
      data_type,
      value: parseFloat(value),
      unit: unit || '',
      location: location || '',
      timestamp: new Date().toISOString(),
      blockchain_verified: false
    });

    if (!dataId) {
      throw BadRequestError('Failed to add IoT data');
    }

    // Submit to blockchain if available
    if (blockchainService.isConnected()) {
      const blockchainResult = await blockchainService.submitIoTData(
        device_id,
        data_type,
        parseFloat(value),
        unit || '',
        location || ''
      );

      if (blockchainResult.success) {
        // Update data with blockchain verification
        await supabaseService.updateIoTData(dataId, { blockchain_verified: true });
        logger.info(`IoT data submitted to blockchain: ${blockchainResult.hash}`);
      }
    }

    logger.info(`IoT data submitted: ${device_id} - ${data_type}: ${value}`);

    res.status(201).json({
      success: true,
      message: 'IoT data submitted successfully',
      data: {
        data_id: dataId,
        device_id,
        data_type,
        value: parseFloat(value),
        unit,
        location,
        timestamp: new Date().toISOString(),
        blockchain_verified: blockchainService.isConnected()
      }
    });
  } catch (error) {
    logger.error('IoT data submission error:', error);
    throw error;
  }
}));

// Get IoT data for a device
router.get('/data/:device_id', asyncHandler(async (req: Request, res: Response) => {
  const { device_id } = req.params;
  const { limit = 100 } = req.query;

  try {
    const data = await supabaseService.getIoTData(device_id, parseInt(limit as string));
    
    res.json({
      success: true,
      data: {
        device_id,
        data_points: data,
        count: data.length
      }
    });
  } catch (error) {
    logger.error(`Error fetching IoT data for device ${device_id}:`, error);
    throw error;
  }
}));

// Get IoT devices for user
router.get('/devices', asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as any).user.id;

  try {
    const devices = await supabaseService.getUserIoTDevices(userId);
    
    res.json({
      success: true,
      data: {
        devices,
        count: devices.length
      }
    });
  } catch (error) {
    logger.error(`Error fetching IoT devices for user ${userId}:`, error);
    throw error;
  }
}));

// Update device status
router.patch('/devices/:device_id/status', asyncHandler(async (req: Request, res: Response) => {
  const { device_id } = req.params;
  const { status } = req.body;

  if (!status) {
    throw BadRequestError('Status is required');
  }

  const validStatuses = ['active', 'inactive', 'maintenance'];
  if (!validStatuses.includes(status)) {
    throw BadRequestError('Invalid status');
  }

  try {
    const success = await supabaseService.updateIoTDeviceStatus(device_id, status);
    
    if (!success) {
      throw BadRequestError('Failed to update device status');
    }

    logger.info(`IoT device status updated: ${device_id} -> ${status}`);

    res.json({
      success: true,
      message: 'Device status updated successfully'
    });
  } catch (error) {
    logger.error(`Error updating device status ${device_id}:`, error);
    throw error;
  }
}));

// Get IoT analytics
router.get('/analytics', asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  const { timeRange = '24h' } = req.query;

  try {
    const analytics = await supabaseService.getIoTAnalytics(userId, timeRange as string);
    
    res.json({
      success: true,
      data: analytics
    });
  } catch (error) {
    logger.error(`Error fetching IoT analytics for user ${userId}:`, error);
    throw error;
  }
}));

export default router;
