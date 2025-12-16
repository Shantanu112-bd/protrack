import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { SupabaseService } from '../services/SupabaseService';
import { generateToken, generateRefreshToken, verifyRefreshToken } from '../middleware/auth';
import { asyncHandler, BadRequestError, UnauthorizedError, NotFoundError } from '../middleware/errorHandler';
import { authRateLimiterMiddleware } from '../middleware/rateLimiter';
import { logger } from '../utils/logger';

const router = Router();
const supabaseService = new SupabaseService();

// Initialize Supabase service
router.use(async (req, res, next) => {
  if (!supabaseService.isConnected()) {
    await supabaseService.initialize();
  }
  next();
});

// Register endpoint
router.post('/register', authRateLimiterMiddleware, asyncHandler(async (req: Request, res: Response) => {
  const { email, password, role, company_name, wallet_address } = req.body;

  // Validate input
  if (!email || !password || !role) {
    throw BadRequestError('Email, password, and role are required');
  }

  // Validate role
  const validRoles = ['manufacturer', 'packager', 'wholesaler', 'seller', 'inspector', 'customer', 'admin'];
  if (!validRoles.includes(role)) {
    throw BadRequestError('Invalid role');
  }

  // Validate password strength
  if (password.length < 8) {
    throw BadRequestError('Password must be at least 8 characters long');
  }

  try {
    // Create user in Supabase
    const { user, error } = await supabaseService.createUser({
      email,
      password,
      role,
      company_name,
      wallet_address
    });

    if (error) {
      logger.error('Registration error:', error);
      throw BadRequestError(error.message || 'Registration failed');
    }

    if (!user) {
      throw BadRequestError('Failed to create user');
    }

    // Generate tokens
    const token = generateToken({
      id: user.id,
      email: user.email!,
      role,
      wallet_address
    });

    const refreshToken = generateRefreshToken(user.id);

    logger.info(`User registered successfully: ${email} (${role})`);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: {
          id: user.id,
          email: user.email,
          role,
          company_name,
          wallet_address
        },
        token,
        refreshToken
      }
    });
  } catch (error) {
    logger.error('Registration error:', error);
    throw error;
  }
}));

// Login endpoint
router.post('/login', authRateLimiterMiddleware, asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw BadRequestError('Email and password are required');
  }

  try {
    // Authenticate with Supabase
    const { data: authData, error: authError } = await supabaseService.signInWithPassword(email, password);

    if (authError) {
      logger.warn(`Login failed for ${email}:`, authError.message);
      throw UnauthorizedError('Invalid credentials');
    }

    if (!authData.user) {
      throw UnauthorizedError('Invalid credentials');
    }

    // Get user profile
    const userProfile = await supabaseService.getUserProfile(authData.user.id);
    if (!userProfile) {
      throw UnauthorizedError('User profile not found');
    }

    // Generate tokens
    const token = generateToken({
      id: authData.user.id,
      email: authData.user.email!,
      role: userProfile.role,
      wallet_address: userProfile.wallet_address
    });

    const refreshToken = generateRefreshToken(authData.user.id);

    logger.info(`User logged in successfully: ${email} (${userProfile.role})`);

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: authData.user.id,
          email: authData.user.email,
          role: userProfile.role,
          company_name: userProfile.company_name,
          wallet_address: userProfile.wallet_address
        },
        token,
        refreshToken
      }
    });
  } catch (error) {
    logger.error('Login error:', error);
    throw error;
  }
}));

// Refresh token endpoint
router.post('/refresh', authRateLimiterMiddleware, asyncHandler(async (req: Request, res: Response) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    throw BadRequestError('Refresh token is required');
  }

  try {
    const { userId, valid } = verifyRefreshToken(refreshToken);
    
    if (!valid || !userId) {
      throw UnauthorizedError('Invalid refresh token');
    }

    // Get user profile
    const userProfile = await supabaseService.getUserProfile(userId);
    if (!userProfile) {
      throw UnauthorizedError('User profile not found');
    }

    // Generate new tokens
    const token = generateToken({
      id: userId,
      email: userProfile.email,
      role: userProfile.role,
      wallet_address: userProfile.wallet_address
    });

    const newRefreshToken = generateRefreshToken(userId);

    res.json({
      success: true,
      message: 'Token refreshed successfully',
      data: {
        token,
        refreshToken: newRefreshToken
      }
    });
  } catch (error) {
    logger.error('Token refresh error:', error);
    throw error;
  }
}));

// Logout endpoint
router.post('/logout', asyncHandler(async (req: Request, res: Response) => {
  const { refreshToken } = req.body;

  if (refreshToken) {
    // In a real implementation, you would blacklist the refresh token
    logger.info('User logged out');
  }

  res.json({
    success: true,
    message: 'Logout successful'
  });
}));

// Get current user profile
router.get('/profile', asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as any).user?.id;
  
  if (!userId) {
    throw UnauthorizedError('User not authenticated');
  }

  const userProfile = await supabaseService.getUserProfile(userId);
  if (!userProfile) {
    throw NotFoundError('User profile not found');
  }

  res.json({
    success: true,
    data: {
      user: {
        id: userProfile.id,
        email: userProfile.email,
        role: userProfile.role,
        company_name: userProfile.company_name,
        wallet_address: userProfile.wallet_address,
        created_at: userProfile.created_at,
        updated_at: userProfile.updated_at
      }
    }
  });
}));

// Update user profile
router.put('/profile', asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as any).user?.id;
  const { company_name, wallet_address } = req.body;
  
  if (!userId) {
    throw UnauthorizedError('User not authenticated');
  }

  const updates: any = {};
  if (company_name !== undefined) updates.company_name = company_name;
  if (wallet_address !== undefined) updates.wallet_address = wallet_address;

  if (Object.keys(updates).length === 0) {
    throw BadRequestError('No valid fields to update');
  }

  const success = await supabaseService.updateUserProfile(userId, updates);
  if (!success) {
    throw BadRequestError('Failed to update profile');
  }

  // Get updated profile
  const userProfile = await supabaseService.getUserProfile(userId);
  
  res.json({
    success: true,
    message: 'Profile updated successfully',
    data: {
      user: {
        id: userProfile!.id,
        email: userProfile!.email,
        role: userProfile!.role,
        company_name: userProfile!.company_name,
        wallet_address: userProfile!.wallet_address,
        created_at: userProfile!.created_at,
        updated_at: userProfile!.updated_at
      }
    }
  });
}));

// Change password
router.post('/change-password', authRateLimiterMiddleware, asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as any).user?.id;
  const { currentPassword, newPassword } = req.body;
  
  if (!userId) {
    throw UnauthorizedError('User not authenticated');
  }

  if (!currentPassword || !newPassword) {
    throw BadRequestError('Current password and new password are required');
  }

  if (newPassword.length < 8) {
    throw BadRequestError('New password must be at least 8 characters long');
  }

  try {
    // Update password in Supabase
    const { error } = await supabaseService.updateAuthUser({
      password: newPassword
    });

    if (error) {
      logger.error('Password change error:', error);
      throw BadRequestError('Failed to change password');
    }

    logger.info(`Password changed for user: ${userId}`);

    res.json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    logger.error('Password change error:', error);
    throw error;
  }
}));

// Verify email
router.post('/verify-email', authRateLimiterMiddleware, asyncHandler(async (req: Request, res: Response) => {
  const { token } = req.body;

  if (!token) {
    throw BadRequestError('Verification token is required');
  }

  try {
    const { error } = await supabaseService.verifyOtp({
      token_hash: token,
      type: 'email'
    });

    if (error) {
      logger.error('Email verification error:', error);
      throw BadRequestError('Invalid verification token');
    }

    res.json({
      success: true,
      message: 'Email verified successfully'
    });
  } catch (error) {
    logger.error('Email verification error:', error);
    throw error;
  }
}));

// Wallet-based login endpoint
router.post('/wallet-login', authRateLimiterMiddleware, asyncHandler(async (req: Request, res: Response) => {
  const { wallet_address, role } = req.body;

  // Validate input
  if (!wallet_address) {
    throw BadRequestError('Wallet address is required');
  }

  if (!role) {
    throw BadRequestError('Role is required');
  }

  // Validate role
  const validRoles = ['manufacturer', 'transporter', 'retailer', 'consumer', 'admin', 'packager', 'wholesaler', 'seller', 'inspector', 'customer'];
  if (!validRoles.includes(role)) {
    throw BadRequestError('Invalid role');
  }

  try {
    // Check if user exists
    const existingUser = await supabaseService.getUserByWallet(wallet_address);

    if (existingUser) {
      // User exists, log them in
      const token = generateToken({
        id: existingUser.id,
        email: existingUser.email,
        role: existingUser.role,
        wallet_address: existingUser.wallet_address,
      });
      const refreshToken = generateRefreshToken(existingUser.id);

      logger.info(`Wallet login successful: ${wallet_address}`);
      
      res.json({
        success: true,
        message: 'Login successful',
        token,
        refreshToken,
        user: {
          id: existingUser.id,
          email: existingUser.email,
          role: existingUser.role,
          wallet_address: existingUser.wallet_address,
        },
      });
    } else {
      // Create new user with wallet address
      const userId = await supabaseService.createUserWithWallet({
        wallet_address,
        role,
      });

      if (!userId) {
        throw BadRequestError('Failed to create user account');
      }

      const token = generateToken({
        id: userId,
        email: `${wallet_address.toLowerCase()}@wallet.local`,
        role,
        wallet_address: wallet_address.toLowerCase(),
      });
      const refreshToken = generateRefreshToken(userId);

      logger.info(`New wallet user created: ${wallet_address}`);

      res.status(201).json({
        success: true,
        message: 'Account created and logged in successfully',
        token,
        refreshToken,
        user: {
          id: userId,
          wallet_address,
          role,
        },
      });
    }
  } catch (error) {
    logger.error('Wallet login error:', error);
    throw error;
  }
}));

export default router;
