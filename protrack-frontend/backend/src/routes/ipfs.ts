import { Router, Request, Response } from 'express';
import { IPFSService } from '../services/IPFSService';
import { asyncHandler, BadRequestError, NotFoundError } from '../middleware/errorHandler';
import { uploadRateLimiterMiddleware } from '../middleware/rateLimiter';
import multer from 'multer';
import { logger } from '../utils/logger';

const router = Router();
const ipfsService = new IPFSService();

// Initialize IPFS service
router.use(async (req, res, next) => {
  if (!ipfsService.isConnected()) {
    await ipfsService.initialize();
  }
  next();
});

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'application/pdf',
      'text/plain',
      'application/json'
    ];
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type'));
    }
  }
});

// Upload file to IPFS
router.post('/upload', uploadRateLimiterMiddleware, upload.single('file'), asyncHandler(async (req: Request, res: Response) => {
  if (!req.file) {
    throw new BadRequestError('No file provided');
  }

  try {
    const { filename, mimetype, size } = req.file;
    const buffer = req.file.buffer;

    const result = await ipfsService.uploadFile(buffer, filename);
    
    if (!result) {
      throw new BadRequestError('Failed to upload file to IPFS');
    }

    logger.info(`File uploaded to IPFS: ${filename} (${size} bytes) -> ${result.hash}`);

    res.status(201).json({
      success: true,
      message: 'File uploaded successfully',
      data: {
        hash: result.hash,
        size: result.size,
        path: result.path,
        filename,
        mimetype,
        gateway_url: ipfsService.getGatewayURL(result.hash)
      }
    });
  } catch (error) {
    logger.error('File upload error:', error);
    throw error;
  }
}));

// Upload multiple files to IPFS
router.post('/upload-multiple', uploadRateLimiterMiddleware, upload.array('files', 10), asyncHandler(async (req: Request, res: Response) => {
  const files = req.files as Express.Multer.File[];
  
  if (!files || files.length === 0) {
    throw new BadRequestError('No files provided');
  }

  try {
    const uploadPromises = files.map(async (file) => {
      const result = await ipfsService.uploadFile(file.buffer, file.originalname);
      return {
        filename: file.originalname,
        mimetype: file.mimetype,
        size: file.size,
        hash: result?.hash,
        size_ipfs: result?.size,
        path: result?.path,
        gateway_url: result ? ipfsService.getGatewayURL(result.hash) : null,
        success: !!result
      };
    });

    const results = await Promise.all(uploadPromises);
    const successful = results.filter(r => r.success);
    const failed = results.filter(r => !r.success);

    logger.info(`Multiple files uploaded: ${successful.length} successful, ${failed.length} failed`);

    res.status(201).json({
      success: true,
      message: `Uploaded ${successful.length} files successfully`,
      data: {
        results,
        summary: {
          total: results.length,
          successful: successful.length,
          failed: failed.length
        }
      }
    });
  } catch (error) {
    logger.error('Multiple file upload error:', error);
    throw error;
  }
}));

// Upload JSON data to IPFS
router.post('/upload-json', asyncHandler(async (req: Request, res: Response) => {
  const { data, filename } = req.body;

  if (!data) {
    throw new BadRequestError('JSON data is required');
  }

  try {
    const result = await ipfsService.uploadJSON(data, filename);
    
    if (!result) {
      throw new BadRequestError('Failed to upload JSON to IPFS');
    }

    logger.info(`JSON uploaded to IPFS: ${filename || 'data.json'} -> ${result.hash}`);

    res.status(201).json({
      success: true,
      message: 'JSON uploaded successfully',
      data: {
        hash: result.hash,
        size: result.size,
        path: result.path,
        gateway_url: ipfsService.getGatewayURL(result.hash)
      }
    });
  } catch (error) {
    logger.error('JSON upload error:', error);
    throw error;
  }
}));

// Upload product metadata
router.post('/upload-product-metadata', asyncHandler(async (req: Request, res: Response) => {
  const { name, description, image, attributes, external_url } = req.body;

  if (!name) {
    throw new BadRequestError('Product name is required');
  }

  try {
    const metadata = {
      name,
      description: description || '',
      image: image || '',
      attributes: attributes || [],
      external_url: external_url || ''
    };

    const result = await ipfsService.uploadProductMetadata(metadata);
    
    if (!result) {
      throw new BadRequestError('Failed to upload product metadata to IPFS');
    }

    logger.info(`Product metadata uploaded to IPFS: ${name} -> ${result.hash}`);

    res.status(201).json({
      success: true,
      message: 'Product metadata uploaded successfully',
      data: {
        hash: result.hash,
        size: result.size,
        path: result.path,
        gateway_url: ipfsService.getGatewayURL(result.hash),
        metadata
      }
    });
  } catch (error) {
    logger.error('Product metadata upload error:', error);
    throw error;
  }
}));

// Retrieve file from IPFS
router.get('/retrieve/:hash', asyncHandler(async (req: Request, res: Response) => {
  const { hash } = req.params;

  if (!hash) {
    throw new BadRequestError('Hash is required');
  }

  try {
    const buffer = await ipfsService.retrieveFile(hash);
    
    if (!buffer) {
      throw new NotFoundError('File not found in IPFS');
    }

    // Set appropriate headers
    res.set({
      'Content-Type': 'application/octet-stream',
      'Content-Length': buffer.length.toString(),
      'Cache-Control': 'public, max-age=31536000' // 1 year cache
    });

    res.send(buffer);
  } catch (error) {
    logger.error(`Error retrieving file ${hash}:`, error);
    throw error;
  }
}));

// Retrieve JSON from IPFS
router.get('/retrieve-json/:hash', asyncHandler(async (req: Request, res: Response) => {
  const { hash } = req.params;

  if (!hash) {
    throw new BadRequestError('Hash is required');
  }

  try {
    const data = await ipfsService.retrieveJSON(hash);
    
    if (!data) {
      throw new NotFoundError('JSON data not found in IPFS');
    }

    res.json({
      success: true,
      data
    });
  } catch (error) {
    logger.error(`Error retrieving JSON ${hash}:`, error);
    throw error;
  }
}));

// Pin hash to IPFS
router.post('/pin/:hash', asyncHandler(async (req: Request, res: Response) => {
  const { hash } = req.params;

  if (!hash) {
    throw new BadRequestError('Hash is required');
  }

  try {
    const success = await ipfsService.pinHash(hash);
    
    if (!success) {
      throw new BadRequestError('Failed to pin hash to IPFS');
    }

    logger.info(`Hash pinned to IPFS: ${hash}`);

    res.json({
      success: true,
      message: 'Hash pinned successfully',
      data: {
        hash
      }
    });
  } catch (error) {
    logger.error(`Error pinning hash ${hash}:`, error);
    throw error;
  }
}));

// Unpin hash from IPFS
router.delete('/pin/:hash', asyncHandler(async (req: Request, res: Response) => {
  const { hash } = req.params;

  if (!hash) {
    throw new BadRequestError('Hash is required');
  }

  try {
    const success = await ipfsService.unpinHash(hash);
    
    if (!success) {
      throw new BadRequestError('Failed to unpin hash from IPFS');
    }

    logger.info(`Hash unpinned from IPFS: ${hash}`);

    res.json({
      success: true,
      message: 'Hash unpinned successfully',
      data: {
        hash
      }
    });
  } catch (error) {
    logger.error(`Error unpinning hash ${hash}:`, error);
    throw error;
  }
}));

// Get pinned hashes
router.get('/pins', asyncHandler(async (req: Request, res: Response) => {
  try {
    const hashes = await ipfsService.getPinnedHashes();
    
    res.json({
      success: true,
      data: {
        hashes,
        count: hashes.length
      }
    });
  } catch (error) {
    logger.error('Error getting pinned hashes:', error);
    throw error;
  }
}));

// Get IPFS status
router.get('/status', asyncHandler(async (req: Request, res: Response) => {
  try {
    const isConnected = ipfsService.isConnected();
    
    res.json({
      success: true,
      data: {
        connected: isConnected,
        status: isConnected ? 'online' : 'offline',
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    logger.error('Error getting IPFS status:', error);
    throw error;
  }
}));

// Get gateway URL for a hash
router.get('/gateway/:hash', asyncHandler(async (req: Request, res: Response) => {
  const { hash } = req.params;

  if (!hash) {
    throw new BadRequestError('Hash is required');
  }

  try {
    const gatewayUrl = ipfsService.getGatewayURL(hash);
    
    res.json({
      success: true,
      data: {
        hash,
        gateway_url: gatewayUrl
      }
    });
  } catch (error) {
    logger.error(`Error getting gateway URL for ${hash}:`, error);
    throw error;
  }
}));

export default router;
