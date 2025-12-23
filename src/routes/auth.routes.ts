/**
 * Auth Routes
 * Defines API endpoints for authentication and authorization
 */

import { Router } from 'express';
import authController from '@controllers/auth.controller';
import {
  authenticateJWT,
  authenticateAny,
  authRateLimit,
  strictRateLimit,
  defaultRateLimit,
} from '@middlewares/index';
import { validators } from '@middlewares/validation.middleware';

const router = Router();

// ============================================
// Public Routes (with rate limiting)
// ============================================

/**
 * @route   POST /api/v1/auth/register
 * @desc    Register a new user
 * @access  Public
 */
router.post('/register', authRateLimit, validators.register, authController.register);

/**
 * @route   POST /api/v1/auth/login
 * @desc    Login user
 * @access  Public
 */
router.post('/login', authRateLimit, validators.login, authController.login);

/**
 * @route   POST /api/v1/auth/refresh
 * @desc    Refresh access token
 * @access  Public
 */
router.post('/refresh', authRateLimit, authController.refresh);

/**
 * @route   POST /api/v1/auth/verify-email
 * @desc    Verify email address
 * @access  Public
 */
router.post('/verify-email', authRateLimit, authController.verifyEmail);

/**
 * @route   POST /api/v1/auth/forgot-password
 * @desc    Request password reset
 * @access  Public
 */
router.post('/forgot-password', strictRateLimit, authController.forgotPassword);

// ============================================
// Protected Routes (require authentication)
// ============================================

/**
 * @route   POST /api/v1/auth/logout
 * @desc    Logout user
 * @access  Private
 */
router.post('/logout', authenticateJWT, defaultRateLimit, authController.logout);

/**
 * @route   POST /api/v1/auth/logout-all
 * @desc    Logout from all devices
 * @access  Private
 */
router.post('/logout-all', authenticateJWT, strictRateLimit, authController.logoutAll);

/**
 * @route   GET /api/v1/auth/me
 * @desc    Get current user
 * @access  Private
 */
router.get('/me', authenticateAny, defaultRateLimit, authController.me);

/**
 * @route   POST /api/v1/auth/change-password
 * @desc    Change password
 * @access  Private
 */
router.post(
  '/change-password',
  authenticateJWT,
  strictRateLimit,
  authController.changePassword
);

// ============================================
// API Key Management Routes
// ============================================

/**
 * @route   POST /api/v1/auth/api-keys
 * @desc    Create new API key
 * @access  Private
 */
router.post(
  '/api-keys',
  authenticateJWT,
  strictRateLimit,
  validators.createApiKey,
  authController.createApiKey
);

/**
 * @route   GET /api/v1/auth/api-keys
 * @desc    List user's API keys
 * @access  Private
 */
router.get('/api-keys', authenticateJWT, defaultRateLimit, authController.listApiKeys);

/**
 * @route   GET /api/v1/auth/api-keys/:id
 * @desc    Get API key details
 * @access  Private
 */
router.get(
  '/api-keys/:id',
  authenticateJWT,
  defaultRateLimit,
  validators.id,
  authController.getApiKey
);

/**
 * @route   DELETE /api/v1/auth/api-keys/:id
 * @desc    Revoke API key
 * @access  Private
 */
router.delete(
  '/api-keys/:id',
  authenticateJWT,
  strictRateLimit,
  validators.id,
  authController.revokeApiKey
);

export default router;
