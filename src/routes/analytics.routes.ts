/**
 * Analytics Routes
 * Defines API endpoints for analytics and usage statistics
 */

import { Router } from 'express';
import analyticsController from '@controllers/analytics.controller';
import { authenticateAny, defaultRateLimit } from '@middlewares/index';

const router = Router();

// All analytics routes require authentication
router.use(authenticateAny);
router.use(defaultRateLimit);

// ============================================
// Analytics Routes
// ============================================

/**
 * @route   GET /api/v1/analytics/overview
 * @desc    Get dashboard overview statistics
 * @access  Private
 * @query   None
 * @returns OverviewStats
 */
router.get('/overview', analyticsController.overview);

/**
 * @route   GET /api/v1/analytics/screenshots
 * @desc    Get screenshot-specific statistics
 * @access  Private
 * @query   startDate?: string (ISO date)
 * @query   endDate?: string (ISO date)
 * @returns ScreenshotStats
 */
router.get('/screenshots', analyticsController.screenshots);

/**
 * @route   GET /api/v1/analytics/usage
 * @desc    Get usage statistics over time
 * @access  Private
 * @query   period?: 'day' | 'week' | 'month' (default: 'day')
 * @query   limit?: number (default: 30, max: 365)
 * @returns UsageOverTime
 */
router.get('/usage', analyticsController.usage);

/**
 * @route   GET /api/v1/analytics/errors
 * @desc    Get error breakdown statistics
 * @access  Private
 * @query   startDate?: string (ISO date)
 * @query   endDate?: string (ISO date)
 * @returns ErrorBreakdown
 */
router.get('/errors', analyticsController.errors);

/**
 * @route   GET /api/v1/analytics/urls
 * @desc    Get popular captured URLs
 * @access  Private
 * @query   limit?: number (default: 10, max: 100)
 * @query   startDate?: string (ISO date)
 * @query   endDate?: string (ISO date)
 * @returns PopularUrl[]
 */
router.get('/urls', analyticsController.popularUrls);

/**
 * @route   GET /api/v1/analytics/api-keys/:id
 * @desc    Get statistics for a specific API key
 * @access  Private
 * @params  id: string (API key ID)
 * @returns ApiKeyStats
 */
router.get('/api-keys/:id', analyticsController.apiKeyStats);

export default router;
