/**
 * Screenshot Routes
 * Defines API endpoints for screenshot operations
 */

import { Router } from 'express';
import screenshotController from '@controllers/screenshot.controller';
import {
  authenticateAny,
  screenshotRateLimit,
  planBasedRateLimit,
  concurrentLimit,
} from '@middlewares/index';
import { validators } from '@middlewares/validation.middleware';

const router = Router();

// ============================================
// Screenshot Routes
// ============================================

/**
 * @route   GET /api/v1/screenshots/stats
 * @desc    Get screenshot statistics
 * @access  Private
 */
router.get('/stats', authenticateAny, validators.dateRange, screenshotController.stats);

/**
 * @route   POST /api/v1/screenshots
 * @desc    Create a new screenshot
 * @access  Private
 */
router.post(
  '/',
  authenticateAny,
  screenshotRateLimit,
  planBasedRateLimit(),
  concurrentLimit(5),
  validators.createScreenshot,
  screenshotController.create
);

/**
 * @route   GET /api/v1/screenshots
 * @desc    List user's screenshots
 * @access  Private
 */
router.get('/', authenticateAny, validators.listScreenshots, screenshotController.list);

/**
 * @route   GET /api/v1/screenshots/:id
 * @desc    Get screenshot by ID
 * @access  Private
 */
router.get('/:id', authenticateAny, validators.screenshotId, screenshotController.getById);

/**
 * @route   DELETE /api/v1/screenshots/:id
 * @desc    Delete a screenshot
 * @access  Private
 */
router.delete('/:id', authenticateAny, validators.screenshotId, screenshotController.remove);

/**
 * @route   POST /api/v1/screenshots/:id/refresh-url
 * @desc    Refresh screenshot URL (get new signed URL)
 * @access  Private
 */
router.post(
  '/:id/refresh-url',
  authenticateAny,
  validators.screenshotId,
  screenshotController.refreshUrl
);

/**
 * @route   POST /api/v1/screenshots/:id/retry
 * @desc    Retry a failed screenshot
 * @access  Private
 */
router.post(
  '/:id/retry',
  authenticateAny,
  screenshotRateLimit,
  validators.screenshotId,
  screenshotController.retry
);

/**
 * @route   GET /api/v1/screenshots/:id/download
 * @desc    Download/redirect to screenshot
 * @access  Private
 */
router.get(
  '/:id/download',
  authenticateAny,
  validators.screenshotId,
  screenshotController.download
);

export default router;
