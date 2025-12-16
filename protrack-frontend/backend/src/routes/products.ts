import { Router, Request, Response } from 'express';
import { SupabaseService } from '../services/SupabaseService';
import { BlockchainService } from '../services/BlockchainService';
import { IPFSService } from '../services/ipfsService';
import { asyncHandler, BadRequestError, NotFoundError, ForbiddenError } from '../middleware/errorHandler';
import { requireRole } from '../middleware/auth';
import { logger } from '../utils/logger';

const router = Router();
const supabaseService = new SupabaseService();
const blockchainService = new BlockchainService();
const ipfsService = new IPFSService();

// Initialize services
router.use(async (req, res, next) => {
  if (!supabaseService.isConnected()) {
    await supabaseService.initialize();
  }
  if (!blockchainService.isConnected()) {
    await blockchainService.initialize();
  }
  if (!ipfsService.isConnected()) {
    await ipfsService.initialize();
  }
  next();
});

// Create product
router.post('/', requireRole(['manufacturer', 'admin']), asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  const { name, sku, batch_id, category, metadata } = req.body;

  if (!name || !sku || !batch_id || !category) {
    throw BadRequestError('Name, SKU, batch ID, and category are required');
  }

  try {
    // Upload metadata to IPFS if provided
    let ipfsMetadataHash = null;
    if (metadata) {
      const ipfsResult = await ipfsService.uploadProductMetadata({
        name,
        description: metadata.description || '',
        image: metadata.image || '',
        attributes: metadata.attributes || []
      });
      
      if (ipfsResult) {
        ipfsMetadataHash = ipfsResult;
      }
    }

    // Create product in database
    const productId = await supabaseService.createProduct({
      name,
      sku,
      batch_id,
      category,
      manufacturer_id: userId,
      current_owner_id: userId,
      ipfs_metadata_hash: ipfsMetadataHash,
      status: 'manufactured'
    });

    if (!productId) {
      throw BadRequestError('Failed to create product');
    }

    // Create product on blockchain
    let blockchainTokenId = null;
    let blockchainTxHash = null;
    if (blockchainService.isConnected()) {
      const blockchainResult = await blockchainService.createProduct(name, sku, batch_id);
      if (blockchainResult.success) {
        blockchainTokenId = 1; // In a real implementation, you'd get this from the blockchain
        blockchainTxHash = blockchainResult.hash;
      }
    }

    // Update product with blockchain token ID
    if (blockchainTokenId) {
      await supabaseService.updateProduct(productId, { blockchain_token_id: blockchainTokenId });
    }

    // Add initial supply chain event
    await supabaseService.addSupplyChainEvent({
      product_id: productId,
      event_type: 'manufacture',
      from_user_id: userId,
      to_user_id: userId,
      location: 'Manufacturing Facility',
      timestamp: new Date().toISOString(),
      metadata: { blockchain_tx_hash: blockchainTxHash }
    });

    logger.info(`Product created: ${productId} by user ${userId}`);

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: {
        product: {
          id: productId,
          name,
          sku,
          batch_id,
          category,
          manufacturer_id: userId,
          current_owner_id: userId,
          blockchain_token_id: blockchainTokenId,
          ipfs_metadata_hash: ipfsMetadataHash,
          status: 'manufactured'
        }
      }
    });
  } catch (error) {
    logger.error('Product creation error:', error);
    throw error;
  }
}));

// Get all products
router.get('/', asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as any).user?.id;
  const { page = 1, limit = 20, status, category } = req.query;

  try {
    const products = await supabaseService.getProducts({
      page: parseInt(page as string),
      limit: parseInt(limit as string),
      status: status as string,
      category: category as string,
      userId: userId
    });

    res.json({
      success: true,
      data: {
        products: products.data,
        pagination: {
          page: parseInt(page as string),
          limit: parseInt(limit as string),
          total: products.total,
          pages: Math.ceil(products.total / parseInt(limit as string))
        }
      }
    });
  } catch (error) {
    logger.error('Error fetching products:', error);
    throw error;
  }
}));

// Get product by ID
router.get('/:id', asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = (req as any).user?.id;

  try {
    const product = await supabaseService.getProduct(id);
    if (!product) {
      throw NotFoundError('Product not found');
    }

    // Get product history
    const history = await supabaseService.getProductHistory(id);

    // Get blockchain info if available
    let blockchainInfo = null;
    if (product.blockchain_token_id && blockchainService.isConnected()) {
      blockchainInfo = await blockchainService.getProductInfo(product.blockchain_token_id);
    }

    // Get IPFS metadata if available
    let ipfsMetadata = null;
    if (product.ipfs_metadata_hash && ipfsService.isConnected()) {
      ipfsMetadata = await ipfsService.retrieveJSON(product.ipfs_metadata_hash);
    }

    res.json({
      success: true,
      data: {
        product: {
          ...product,
          history,
          blockchain_info: blockchainInfo,
          ipfs_metadata: ipfsMetadata
        }
      }
    });
  } catch (error) {
    logger.error(`Error fetching product ${id}:`, error);
    throw error;
  }
}));

// Update product
router.put('/:id', requireRole(['manufacturer', 'packager', 'wholesaler', 'seller', 'admin']), asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = (req as any).user.id;
  const updates = req.body;

  try {
    const product = await supabaseService.getProduct(id);
    if (!product) {
      throw NotFoundError('Product not found');
    }

    // Check if user has permission to update this product
    if (product.current_owner_id !== userId && (req as any).user.role !== 'admin') {
      throw ForbiddenError('You do not have permission to update this product');
    }

    const success = await supabaseService.updateProduct(id, updates);
    if (!success) {
      throw BadRequestError('Failed to update product');
    }

    logger.info(`Product updated: ${id} by user ${userId}`);

    res.json({
      success: true,
      message: 'Product updated successfully'
    });
  } catch (error) {
    logger.error(`Error updating product ${id}:`, error);
    throw error;
  }
}));

// Transfer product
router.post('/:id/transfer', requireRole(['manufacturer', 'packager', 'wholesaler', 'seller', 'admin']), asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = (req as any).user.id;
  const { to_user_id, location, metadata } = req.body;

  if (!to_user_id) {
    throw BadRequestError('Recipient user ID is required');
  }

  try {
    const product = await supabaseService.getProduct(id);
    if (!product) {
      throw NotFoundError('Product not found');
    }

    // Check if user has permission to transfer this product
    if (product.current_owner_id !== userId && (req as any).user.role !== 'admin') {
      throw ForbiddenError('You do not have permission to transfer this product');
    }

    // Update product ownership
    const success = await supabaseService.updateProduct(id, {
      current_owner_id: to_user_id,
      status: 'in_transit'
    });

    if (!success) {
      throw BadRequestError('Failed to transfer product');
    }

    // Add transfer event
    await supabaseService.addSupplyChainEvent({
      product_id: id,
      event_type: 'transfer',
      from_user_id: userId,
      to_user_id: to_user_id,
      location: location || 'Unknown',
      timestamp: new Date().toISOString(),
      metadata: metadata
    });

    // Transfer on blockchain if available
    if (product.blockchain_token_id && blockchainService.isConnected()) {
      const blockchainResult = await blockchainService.transferProduct(product.blockchain_token_id, to_user_id);
      if (blockchainResult.success) {
        logger.info(`Product transferred on blockchain: ${blockchainResult.hash}`);
      }
    }

    logger.info(`Product transferred: ${id} from ${userId} to ${to_user_id}`);

    res.json({
      success: true,
      message: 'Product transferred successfully'
    });
  } catch (error) {
    logger.error(`Error transferring product ${id}:`, error);
    throw error;
  }
}));

// Update product status
router.patch('/:id/status', requireRole(['manufacturer', 'packager', 'wholesaler', 'seller', 'inspector', 'admin']), asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = (req as any).user.id;
  const { status, location, metadata } = req.body;

  if (!status) {
    throw BadRequestError('Status is required');
  }

  const validStatuses = ['manufactured', 'in_transit', 'delivered', 'recalled'];
  if (!validStatuses.includes(status)) {
    throw BadRequestError('Invalid status');
  }

  try {
    const product = await supabaseService.getProduct(id);
    if (!product) {
      throw NotFoundError('Product not found');
    }

    // Update product status
    const success = await supabaseService.updateProduct(id, { status });
    if (!success) {
      throw BadRequestError('Failed to update product status');
    }

    // Add status change event
    await supabaseService.addSupplyChainEvent({
      product_id: id,
      event_type: 'quality_check',
      from_user_id: userId,
      to_user_id: userId,
      location: location || 'Unknown',
      timestamp: new Date().toISOString(),
      metadata: { status_change: status, ...metadata }
    });

    // Update status on blockchain if available
    if (product.blockchain_token_id && blockchainService.isConnected()) {
      const statusMap = { manufactured: 0, in_transit: 1, delivered: 2, recalled: 3 };
      const blockchainResult = await blockchainService.updateProductStatus(product.blockchain_token_id, statusMap[status]);
      if (blockchainResult.success) {
        logger.info(`Product status updated on blockchain: ${blockchainResult.hash}`);
      }
    }

    logger.info(`Product status updated: ${id} to ${status} by user ${userId}`);

    res.json({
      success: true,
      message: 'Product status updated successfully'
    });
  } catch (error) {
    logger.error(`Error updating product status ${id}:`, error);
    throw error;
  }
}));

// Get product history
router.get('/:id/history', asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const history = await supabaseService.getProductHistory(id);
    
    res.json({
      success: true,
      data: {
        history
      }
    });
  } catch (error) {
    logger.error(`Error fetching product history ${id}:`, error);
    throw error;
  }
}));

// Add supply chain event
router.post('/:id/events', requireRole(['manufacturer', 'packager', 'wholesaler', 'seller', 'inspector', 'admin']), asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = (req as any).user.id;
  const { event_type, location, metadata } = req.body;

  if (!event_type) {
    throw BadRequestError('Event type is required');
  }

  const validEventTypes = ['manufacture', 'transfer', 'quality_check', 'delivery', 'recall'];
  if (!validEventTypes.includes(event_type)) {
    throw BadRequestError('Invalid event type');
  }

  try {
    const product = await supabaseService.getProduct(id);
    if (!product) {
      throw NotFoundError('Product not found');
    }

    // Add supply chain event
    const eventId = await supabaseService.addSupplyChainEvent({
      product_id: id,
      event_type: event_type as any,
      from_user_id: userId,
      to_user_id: userId,
      location: location || 'Unknown',
      timestamp: new Date().toISOString(),
      metadata: metadata
    });

    if (!eventId) {
      throw BadRequestError('Failed to add supply chain event');
    }

    logger.info(`Supply chain event added: ${eventId} for product ${id}`);

    res.status(201).json({
      success: true,
      message: 'Supply chain event added successfully',
      data: {
        event_id: eventId
      }
    });
  } catch (error) {
    logger.error(`Error adding supply chain event for product ${id}:`, error);
    throw error;
  }
}));

export default router;
