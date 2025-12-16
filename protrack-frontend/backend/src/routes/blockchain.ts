import { Router, Request, Response } from 'express';
import { BlockchainService } from '../services/BlockchainService';
import { asyncHandler, BadRequestError, NotFoundError } from '../middleware/errorHandler';
import { logger } from '../utils/logger';

const router = Router();
const blockchainService = new BlockchainService();

// Initialize blockchain service
router.use(async (req, res, next) => {
  if (!blockchainService.isConnected()) {
    await blockchainService.initialize();
  }
  next();
});

// Get blockchain status
router.get('/status', asyncHandler(async (req: Request, res: Response) => {
  try {
    const isConnected = blockchainService.isConnected();
    const provider = blockchainService.getProvider();
    
    let networkInfo = null;
    if (provider) {
      try {
        const network = await provider.getNetwork();
        networkInfo = {
          name: network.name,
          chainId: network.chainId.toString()
        };
      } catch (error) {
        logger.warn('Failed to get network info:', error);
      }
    }

    res.json({
      success: true,
      data: {
        connected: isConnected,
        status: isConnected ? 'online' : 'offline',
        network: networkInfo,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    logger.error('Error getting blockchain status:', error);
    throw error;
  }
}));

// Get wallet balance
router.get('/balance/:address', asyncHandler(async (req: Request, res: Response) => {
  const { address } = req.params;

  if (!address) {
    throw BadRequestError('Address is required');
  }

  try {
    const balance = await blockchainService.getBalance(address);
    
    res.json({
      success: true,
      data: {
        address,
        balance: balance,
        balance_wei: balance // In a real implementation, you'd convert to wei
      }
    });
  } catch (error) {
    logger.error(`Error getting balance for ${address}:`, error);
    throw error;
  }
}));

// Get transaction receipt
router.get('/transaction/:txHash', asyncHandler(async (req: Request, res: Response) => {
  const { txHash } = req.params;

  if (!txHash) {
    throw BadRequestError('Transaction hash is required');
  }

  try {
    const receipt = await blockchainService.getTransactionReceipt(txHash);
    
    if (!receipt) {
      throw NotFoundError('Transaction not found');
    }

    res.json({
      success: true,
      data: {
        transaction: {
          hash: receipt.hash,
          blockNumber: receipt.blockNumber,
          blockHash: receipt.blockHash,
          transactionIndex: receipt.index,
          from: receipt.from,
          to: receipt.to,
          gasUsed: receipt.gasUsed.toString(),
          effectiveGasPrice: receipt.gasPrice?.toString(),
          status: receipt.status,
          logs: receipt.logs
        }
      }
    });
  } catch (error) {
    logger.error(`Error getting transaction ${txHash}:`, error);
    throw error;
  }
}));

// Get contract info
router.get('/contracts', asyncHandler(async (req: Request, res: Response) => {
  try {
    const contracts = [
      {
        name: 'ProTrackSupplyChain',
        address: '0x5FbDB2315678afecb367f032d93F642f64180aa3',
        description: 'Main supply chain contract'
      },
      {
        name: 'ProTrackNFT',
        address: '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512',
        description: 'NFT contract for product tokens'
      },
      {
        name: 'ProTrackOracle',
        address: '0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0',
        description: 'Oracle contract for IoT data'
      }
    ];

    res.json({
      success: true,
      data: {
        contracts,
        count: contracts.length
      }
    });
  } catch (error) {
    logger.error('Error getting contract info:', error);
    throw error;
  }
}));

// Get product info from blockchain
router.get('/product/:tokenId', asyncHandler(async (req: Request, res: Response) => {
  const { tokenId } = req.params;

  if (!tokenId) {
    throw BadRequestError('Token ID is required');
  }

  try {
    const productInfo = await blockchainService.getProductInfo(parseInt(tokenId));
    
    if (!productInfo) {
      throw NotFoundError('Product not found on blockchain');
    }

    res.json({
      success: true,
      data: {
        tokenId: parseInt(tokenId),
        product: productInfo
      }
    });
  } catch (error) {
    logger.error(`Error getting product info for token ${tokenId}:`, error);
    throw error;
  }
}));

// Get product history from blockchain
router.get('/product/:tokenId/history', asyncHandler(async (req: Request, res: Response) => {
  const { tokenId } = req.params;

  if (!tokenId) {
    throw BadRequestError('Token ID is required');
  }

  try {
    const history = await blockchainService.getProductHistory(parseInt(tokenId));
    
    res.json({
      success: true,
      data: {
        tokenId: parseInt(tokenId),
        history,
        count: history.length
      }
    });
  } catch (error) {
    logger.error(`Error getting product history for token ${tokenId}:`, error);
    throw error;
  }
}));

// Get IoT data from blockchain
router.get('/iot/:deviceId', asyncHandler(async (req: Request, res: Response) => {
  const { deviceId } = req.params;

  if (!deviceId) {
    throw BadRequestError('Device ID is required');
  }

  try {
    // This would require implementing getIoTData in BlockchainService
    // For now, return a placeholder response
    res.json({
      success: true,
      data: {
        deviceId,
        message: 'IoT data retrieval from blockchain not yet implemented',
        data: []
      }
    });
  } catch (error) {
    logger.error(`Error getting IoT data for device ${deviceId}:`, error);
    throw error;
  }
}));

// Get network statistics
router.get('/network/stats', asyncHandler(async (req: Request, res: Response) => {
  try {
    const provider = blockchainService.getProvider();
    
    if (!provider) {
      throw BadRequestError('Blockchain provider not available');
    }

    const [blockNumber, feeData] = await Promise.all([
      provider.getBlockNumber(),
      provider.getFeeData()
    ]);

    res.json({
      success: true,
      data: {
        blockNumber,
        gasPrice: feeData?.gasPrice?.toString() || '0',
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    logger.error('Error getting network stats:', error);
    throw error;
  }
}));

// Verify transaction
router.post('/verify', asyncHandler(async (req: Request, res: Response) => {
  const { txHash, expectedResult } = req.body;

  if (!txHash) {
    throw BadRequestError('Transaction hash is required');
  }

  try {
    const receipt = await blockchainService.getTransactionReceipt(txHash);
    
    if (!receipt) {
      throw NotFoundError('Transaction not found');
    }

    const isSuccessful = receipt.status === 1;
    const isVerified = expectedResult ? 
      (receipt.status === 1 && receipt.logs.length > 0) : 
      isSuccessful;

    res.json({
      success: true,
      data: {
        txHash,
        verified: isVerified,
        successful: isSuccessful,
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed.toString()
      }
    });
  } catch (error) {
    logger.error(`Error verifying transaction ${txHash}:`, error);
    throw error;
  }
}));

export default router;
