import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config/config';
import { logger } from '../utils/logger';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
    wallet_address?: string;
  };
}

export const authMiddleware = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        success: false,
        message: 'Access token required'
      });
      return;
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    
    try {
      const decoded = jwt.verify(token, config.jwt.secret) as any;
      
      // Verify token hasn't expired
      if (decoded.exp && decoded.exp < Date.now() / 1000) {
        res.status(401).json({
          success: false,
          message: 'Token expired'
        });
        return;
      }

      // Attach user info to request
      req.user = {
        id: decoded.sub || decoded.userId,
        email: decoded.email,
        role: decoded.role,
        wallet_address: decoded.wallet_address
      };

      logger.debug(`User authenticated: ${req.user.email} (${req.user.role})`);
      next();
    } catch (jwtError) {
      logger.warn('Invalid JWT token:', jwtError);
      res.status(401).json({
        success: false,
        message: 'Invalid token'
      });
      return;
    }
  } catch (error) {
    logger.error('Auth middleware error:', error);
    res.status(500).json({
      success: false,
      message: 'Authentication error'
    });
  }
};

export const requireRole = (allowedRoles: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      logger.warn(`Access denied for user ${req.user.email} with role ${req.user.role}`);
      res.status(403).json({
        success: false,
        message: 'Insufficient permissions'
      });
      return;
    }

    next();
  };
};

export const requireWallet = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
  if (!req.user) {
    res.status(401).json({
      success: false,
      message: 'Authentication required'
    });
    return;
  }

  if (!req.user.wallet_address) {
    res.status(400).json({
      success: false,
      message: 'Wallet address required for this operation'
    });
    return;
  }

  next();
};

export const optionalAuth = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      
      try {
        const decoded = jwt.verify(token, config.jwt.secret) as any;
        
        if (decoded.exp && decoded.exp >= Date.now() / 1000) {
          req.user = {
            id: decoded.sub || decoded.userId,
            email: decoded.email,
            role: decoded.role,
            wallet_address: decoded.wallet_address
          };
        }
      } catch (jwtError) {
        // Token is invalid, but we continue without user info
        logger.debug('Optional auth failed:', jwtError);
      }
    }
    
    next();
  } catch (error) {
    logger.error('Optional auth middleware error:', error);
    next(); // Continue even if there's an error
  }
};

export const generateToken = (user: {
  id: string;
  email: string;
  role: string;
  wallet_address?: string;
}): string => {
  const payload = {
    sub: user.id,
    email: user.email,
    role: user.role,
    wallet_address: user.wallet_address,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60) // 7 days
  };

  return jwt.sign(payload, config.jwt.secret);
};

export const generateRefreshToken = (userId: string): string => {
  const payload = {
    sub: userId,
    type: 'refresh',
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + (30 * 24 * 60 * 60) // 30 days
  };

  return jwt.sign(payload, config.jwt.secret);
};

export const verifyRefreshToken = (token: string): { userId: string; valid: boolean } => {
  try {
    const decoded = jwt.verify(token, config.jwt.secret) as any;
    
    if (decoded.type !== 'refresh') {
      return { userId: '', valid: false };
    }

    if (decoded.exp && decoded.exp < Date.now() / 1000) {
      return { userId: '', valid: false };
    }

    return { userId: decoded.sub, valid: true };
  } catch (error) {
    return { userId: '', valid: false };
  }
};
