/**
 * Auth Controller
 * Handles HTTP requests for authentication and authorization
 */

import { Request, Response } from 'express';
import { Types } from 'mongoose';
import { asyncHandler, AppError } from '@middlewares/error.middleware';
import { ERROR_CODES } from '@utils/constants';
import * as authService from '@services/auth.service';
import { IUser } from '@/types';

// ============================================
// Controller Methods
// ============================================

/**
 * Register a new user
 * POST /api/v1/auth/register
 */
const register = asyncHandler(async (req: Request, res: Response) => {
  const { email, password, name, company } = req.body;

  const { user, tokens } = await authService.registerUser({
    email,
    password,
    name,
    company,
  });

  // Generate verification token
  const verificationToken = await authService.generateVerificationToken(email);

  res.status(201).json({
    success: true,
    message: 'Registration successful. Please verify your email.',
    data: {
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        company: user.company,
        isVerified: user.isVerified,
        subscription: user.subscription,
      },
      tokens,
      // In production, send this via email instead
      ...(process.env.NODE_ENV === 'development' && verificationToken && { verificationToken }),
    },
  });
});

/**
 * Login user
 * POST /api/v1/auth/login
 */
const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  const { user, tokens } = await authService.loginUser(email, password);

  res.json({
    success: true,
    message: 'Login successful',
    data: {
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        company: user.company,
        isVerified: user.isVerified,
        subscription: user.subscription,
        role: user.role,
      },
      tokens,
    },
  });
});

/**
 * Logout user
 * POST /api/v1/auth/logout
 */
const logout = asyncHandler(async (req: Request, res: Response) => {
  const user = req.user as IUser;
  const refreshToken = req.body.refreshToken;

  if (!refreshToken) {
    throw new AppError('Refresh token is required', 400, ERROR_CODES.VALIDATION_FAILED);
  }

  await authService.logoutUser(new Types.ObjectId(user._id), refreshToken);

  res.json({
    success: true,
    message: 'Logout successful',
  });
});

/**
 * Logout from all devices
 * POST /api/v1/auth/logout-all
 */
const logoutAll = asyncHandler(async (req: Request, res: Response) => {
  const user = req.user as IUser;

  await authService.removeAllRefreshTokens(new Types.ObjectId(user._id));

  res.json({
    success: true,
    message: 'Logged out from all devices',
  });
});

/**
 * Refresh access token
 * POST /api/v1/auth/refresh
 */
const refresh = asyncHandler(async (req: Request, res: Response) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    throw new AppError('Refresh token is required', 400, ERROR_CODES.VALIDATION_FAILED);
  }

  const tokens = await authService.refreshAccessToken(refreshToken);

  res.json({
    success: true,
    data: tokens,
  });
});

/**
 * Get current user
 * GET /api/v1/auth/me
 */
const me = asyncHandler(async (req: Request, res: Response) => {
  const user = req.user as IUser;

  res.json({
    success: true,
    data: {
      id: user._id,
      email: user.email,
      name: user.name,
      company: user.company,
      isVerified: user.isVerified,
      isActive: user.isActive,
      role: user.role,
      subscription: user.subscription,
      usage: user.usage,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    },
  });
});

/**
 * Verify email
 * POST /api/v1/auth/verify-email
 */
const verifyEmail = asyncHandler(async (req: Request, res: Response) => {
  const { token } = req.body;

  if (!token) {
    throw new AppError('Verification token is required', 400, ERROR_CODES.VALIDATION_FAILED);
  }

  const success = await authService.verifyEmail(token);

  if (!success) {
    throw new AppError(
      'Invalid or expired verification token',
      400,
      ERROR_CODES.AUTH_TOKEN_INVALID
    );
  }

  res.json({
    success: true,
    message: 'Email verified successfully',
  });
});

/**
 * Request password reset
 * POST /api/v1/auth/forgot-password
 */
const forgotPassword = asyncHandler(async (req: Request, res: Response) => {
  const { email } = req.body;

  if (!email) {
    throw new AppError('Email is required', 400, ERROR_CODES.VALIDATION_FAILED);
  }

  const resetToken = await authService.generatePasswordResetToken(email);

  // In production, send this via email
  res.json({
    success: true,
    message: 'If an account exists with this email, a password reset link will be sent.',
    // Only include token in development
    ...(process.env.NODE_ENV === 'development' && resetToken && { resetToken }),
  });
});

/**
 * Change password
 * POST /api/v1/auth/change-password
 */
const changePassword = asyncHandler(async (req: Request, res: Response) => {
  const user = req.user as IUser;
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    throw new AppError(
      'Current password and new password are required',
      400,
      ERROR_CODES.VALIDATION_FAILED
    );
  }

  await authService.changePassword(new Types.ObjectId(user._id), currentPassword, newPassword);

  res.json({
    success: true,
    message: 'Password changed successfully',
  });
});

/**
 * Create API key
 * POST /api/v1/auth/api-keys
 */
const createApiKey = asyncHandler(async (req: Request, res: Response) => {
  const user = req.user as IUser;
  const { name, permissions, ipWhitelist, domainWhitelist, expiresAt, rateLimit } = req.body;

  if (!name) {
    throw new AppError('API key name is required', 400, ERROR_CODES.VALIDATION_FAILED);
  }

  const result = await authService.createApiKey(new Types.ObjectId(user._id), {
    name,
    permissions,
    ipWhitelist,
    domainWhitelist,
    expiresAt: expiresAt ? new Date(expiresAt) : undefined,
    rateLimit,
  });

  res.status(201).json({
    success: true,
    message: 'API key created successfully. Store the key securely - it cannot be retrieved again.',
    data: {
      id: result.apiKey._id,
      name: result.apiKey.name,
      key: result.plainTextKey,
      permissions: result.apiKey.permissions,
      ipWhitelist: result.apiKey.ipWhitelist,
      domainWhitelist: result.apiKey.domainWhitelist,
      expiresAt: result.apiKey.expiresAt,
      rateLimit: result.apiKey.rateLimit,
      createdAt: result.apiKey.createdAt,
    },
  });
});

/**
 * List API keys
 * GET /api/v1/auth/api-keys
 */
const listApiKeys = asyncHandler(async (req: Request, res: Response) => {
  const user = req.user as IUser;

  const { ApiKey } = await import('@models/index');
  const apiKeys = await ApiKey.findActiveByUser(user._id);

  res.json({
    success: true,
    data: apiKeys.map((key) => ({
      id: key._id,
      name: key.name,
      maskedKey: key.maskedKey,
      permissions: key.permissions,
      ipWhitelist: key.ipWhitelist,
      domainWhitelist: key.domainWhitelist,
      expiresAt: key.expiresAt,
      rateLimit: key.rateLimit,
      usageCount: key.usageCount,
      lastUsedAt: key.lastUsedAt,
      createdAt: key.createdAt,
    })),
  });
});

/**
 * Get API key details
 * GET /api/v1/auth/api-keys/:id
 */
const getApiKey = asyncHandler(async (req: Request, res: Response) => {
  const user = req.user as IUser;
  const { id } = req.params;

  const { ApiKey } = await import('@models/index');
  const apiKey = await ApiKey.findOne({
    _id: id,
    user: user._id,
    isActive: true,
  });

  if (!apiKey) {
    throw new AppError('API key not found', 404, ERROR_CODES.API_KEY_NOT_FOUND);
  }

  res.json({
    success: true,
    data: {
      id: apiKey._id,
      name: apiKey.name,
      maskedKey: apiKey.maskedKey,
      permissions: apiKey.permissions,
      ipWhitelist: apiKey.ipWhitelist,
      domainWhitelist: apiKey.domainWhitelist,
      expiresAt: apiKey.expiresAt,
      rateLimit: apiKey.rateLimit,
      usageCount: apiKey.usageCount,
      lastUsedAt: apiKey.lastUsedAt,
      createdAt: apiKey.createdAt,
    },
  });
});

/**
 * Revoke API key
 * DELETE /api/v1/auth/api-keys/:id
 */
const revokeApiKey = asyncHandler(async (req: Request, res: Response) => {
  const user = req.user as IUser;
  const { id } = req.params;

  await authService.revokeApiKey(new Types.ObjectId(id), new Types.ObjectId(user._id));

  res.json({
    success: true,
    message: 'API key revoked successfully',
  });
});

// ============================================
// Export Controller
// ============================================

export default {
  register,
  login,
  logout,
  logoutAll,
  refresh,
  me,
  verifyEmail,
  forgotPassword,
  changePassword,
  createApiKey,
  listApiKeys,
  getApiKey,
  revokeApiKey,
};
