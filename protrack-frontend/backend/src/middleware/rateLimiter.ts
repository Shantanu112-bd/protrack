import { Request, Response, NextFunction } from 'express';
import { RateLimiterMemory } from 'rate-limiter-flexible';
import { config } from '../config/config';
import { logger } from '../utils/logger';

// Create rate limiter instances
const rateLimiter = new RateLimiterMemory({
  keyPrefix: 'middleware',
  points: config.rateLimiting.maxRequests,
  duration: config.rateLimiting.windowMs / 1000, // Convert to seconds
});

const strictRateLimiter = new RateLimiterMemory({
  keyPrefix: 'strict',
  points: 5, // 5 requests
  duration: 60, // per minute
});

const authRateLimiter = new RateLimiterMemory({
  keyPrefix: 'auth',
  points: 10, // 10 requests
  duration: 900, // per 15 minutes
});

const uploadRateLimiter = new RateLimiterMemory({
  keyPrefix: 'upload',
  points: 20, // 20 requests
  duration: 3600, // per hour
});

export const rateLimiterMiddleware = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const key = req.ip || 'unknown';
    
    await rateLimiter.consume(key);
    next();
  } catch (rejRes: any) {
    const secs = Math.round(rejRes.msBeforeNext / 1000) || 1;
    
    logger.warn(`Rate limit exceeded for IP: ${req.ip}`);
    
    res.set('Retry-After', String(secs));
    res.status(429).json({
      success: false,
      message: 'Too many requests',
      retryAfter: secs
    });
  }
};

export const strictRateLimiterMiddleware = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const key = req.ip || 'unknown';
    
    await strictRateLimiter.consume(key);
    next();
  } catch (rejRes: any) {
    const secs = Math.round(rejRes.msBeforeNext / 1000) || 1;
    
    logger.warn(`Strict rate limit exceeded for IP: ${req.ip}`);
    
    res.set('Retry-After', String(secs));
    res.status(429).json({
      success: false,
      message: 'Rate limit exceeded. Please slow down.',
      retryAfter: secs
    });
  }
};

export const authRateLimiterMiddleware = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const key = req.ip || 'unknown';
    
    await authRateLimiter.consume(key);
    next();
  } catch (rejRes: any) {
    const secs = Math.round(rejRes.msBeforeNext / 1000) || 1;
    
    logger.warn(`Auth rate limit exceeded for IP: ${req.ip}`);
    
    res.set('Retry-After', String(secs));
    res.status(429).json({
      success: false,
      message: 'Too many authentication attempts. Please try again later.',
      retryAfter: secs
    });
  }
};

export const uploadRateLimiterMiddleware = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const key = req.ip || 'unknown';
    
    await uploadRateLimiter.consume(key);
    next();
  } catch (rejRes: any) {
    const secs = Math.round(rejRes.msBeforeNext / 1000) || 1;
    
    logger.warn(`Upload rate limit exceeded for IP: ${req.ip}`);
    
    res.set('Retry-After', String(secs));
    res.status(429).json({
      success: false,
      message: 'Too many file uploads. Please try again later.',
      retryAfter: secs
    });
  }
};

// Dynamic rate limiter based on user role
export const roleBasedRateLimiter = (roleLimits: Record<string, { points: number; duration: number }>) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userRole = (req as any).user?.role || 'anonymous';
      const limits = roleLimits[userRole] || roleLimits['default'] || { points: 100, duration: 60 };
      
      const key = `${req.ip}:${userRole}`;
      
      const limiter = new RateLimiterMemory({
        keyPrefix: `role:${userRole}`,
        points: limits.points,
        duration: limits.duration,
      });
      
      await limiter.consume(key);
      next();
    } catch (rejRes) {
      const secs = Math.round(rejRes.msBeforeNext / 1000) || 1;
      
      logger.warn(`Role-based rate limit exceeded for IP: ${req.ip}, Role: ${(req as any).user?.role}`);
      
      res.set('Retry-After', String(secs));
      res.status(429).json({
        success: false,
        message: 'Rate limit exceeded for your role',
        retryAfter: secs
      });
    }
  };
};

// Rate limiter for specific endpoints
export const endpointRateLimiter = (endpoint: string, points: number, duration: number) => {
  const limiter = new RateLimiterMemory({
    keyPrefix: `endpoint:${endpoint}`,
    points,
    duration,
  });

  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const key = req.ip || 'unknown';
      
      await limiter.consume(key);
      next();
    } catch (rejRes) {
      const secs = Math.round(rejRes.msBeforeNext / 1000) || 1;
      
      logger.warn(`Endpoint rate limit exceeded for IP: ${req.ip}, Endpoint: ${endpoint}`);
      
      res.set('Retry-After', String(secs));
      res.status(429).json({
        success: false,
        message: `Rate limit exceeded for ${endpoint}`,
        retryAfter: secs
      });
    }
  };
};

// Reset rate limit for a specific key
export const resetRateLimit = async (key: string, limiter: RateLimiterMemory): Promise<void> => {
  try {
    await limiter.delete(key);
    logger.info(`Rate limit reset for key: ${key}`);
  } catch (error) {
    logger.error(`Error resetting rate limit for key ${key}:`, error);
  }
};

// Get rate limit info for a key
export const getRateLimitInfo = async (key: string, limiter: RateLimiterMemory): Promise<{
  remainingPoints: number;
  msBeforeNext: number;
  totalHits: number;
} | null> => {
  try {
    const res = await limiter.get(key);
    if (res) {
      return {
        remainingPoints: res.remainingPoints,
        msBeforeNext: res.msBeforeNext,
        totalHits: (res as any).totalHits || 0
      };
    }
    return null;
  } catch (error) {
    logger.error(`Error getting rate limit info for key ${key}:`, error);
    return null;
  }
};

// Export default rate limiter
export { rateLimiterMiddleware as rateLimiter };
