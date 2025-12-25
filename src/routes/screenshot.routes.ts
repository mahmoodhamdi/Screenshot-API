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
 * @openapi
 * /screenshots/stats:
 *   get:
 *     summary: Get screenshot statistics
 *     description: Retrieve aggregated statistics about your screenshots including total count, success rate, and format distribution
 *     tags: [Screenshots]
 *     security:
 *       - bearerAuth: []
 *       - apiKeyAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Start date for statistics period (ISO 8601 format)
 *         example: "2024-01-01T00:00:00Z"
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date-time
 *         description: End date for statistics period (ISO 8601 format)
 *         example: "2024-12-31T23:59:59Z"
 *     responses:
 *       200:
 *         description: Statistics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     totalScreenshots:
 *                       type: integer
 *                       example: 1250
 *                     successfulScreenshots:
 *                       type: integer
 *                       example: 1200
 *                     failedScreenshots:
 *                       type: integer
 *                       example: 50
 *                     successRate:
 *                       type: number
 *                       example: 96.0
 *                     averageDuration:
 *                       type: number
 *                       example: 2340
 *                       description: Average capture time in milliseconds
 *                     totalSize:
 *                       type: integer
 *                       example: 524288000
 *                       description: Total file size in bytes
 *                     formatDistribution:
 *                       type: object
 *                       properties:
 *                         png:
 *                           type: integer
 *                           example: 800
 *                         jpeg:
 *                           type: integer
 *                           example: 350
 *                         webp:
 *                           type: integer
 *                           example: 80
 *                         pdf:
 *                           type: integer
 *                           example: 20
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       429:
 *         $ref: '#/components/responses/RateLimitError'
 */
router.get('/stats', authenticateAny, validators.dateRange, screenshotController.stats);

/**
 * @openapi
 * /screenshots:
 *   post:
 *     summary: Create a new screenshot
 *     description: |
 *       Capture a screenshot of any website with customizable options.
 *
 *       ## Features
 *       - Custom viewport dimensions (up to 8K resolution)
 *       - Multiple output formats (PNG, JPEG, WebP, PDF)
 *       - Full page capture
 *       - Dark mode support
 *       - Ad blocking
 *       - Custom headers and cookies
 *       - CSS selector targeting
 *       - Webhook notifications
 *
 *       ## Rate Limits
 *       Rate limits vary by plan. See your subscription details for specific limits.
 *     tags: [Screenshots]
 *     security:
 *       - bearerAuth: []
 *       - apiKeyAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ScreenshotRequest'
 *           examples:
 *             basic:
 *               summary: Basic screenshot
 *               value:
 *                 url: "https://example.com"
 *             fullPage:
 *               summary: Full page with custom dimensions
 *               value:
 *                 url: "https://example.com"
 *                 width: 1920
 *                 height: 1080
 *                 fullPage: true
 *                 format: "png"
 *             advanced:
 *               summary: Advanced options
 *               value:
 *                 url: "https://example.com"
 *                 width: 1920
 *                 height: 1080
 *                 format: "jpeg"
 *                 quality: 90
 *                 fullPage: false
 *                 darkMode: true
 *                 blockAds: true
 *                 delay: 2000
 *                 selector: "#main-content"
 *                 headers:
 *                   Authorization: "Bearer token123"
 *                 webhook: "https://myapp.com/webhook"
 *     responses:
 *       201:
 *         description: Screenshot created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: "507f1f77bcf86cd799439011"
 *                     url:
 *                       type: string
 *                       format: uri
 *                       example: "https://example.com"
 *                     screenshotUrl:
 *                       type: string
 *                       format: uri
 *                       example: "https://storage.screenshot-api.com/screenshots/abc123.png"
 *                     status:
 *                       type: string
 *                       enum: [pending, processing, completed, failed]
 *                       example: "completed"
 *                     size:
 *                       type: integer
 *                       example: 245678
 *                       description: File size in bytes
 *                     duration:
 *                       type: integer
 *                       example: 2340
 *                       description: Capture duration in milliseconds
 *                     metadata:
 *                       type: object
 *                       properties:
 *                         pageTitle:
 *                           type: string
 *                           example: "Example Domain"
 *                         pageDescription:
 *                           type: string
 *                           example: "This domain is for use in illustrative examples"
 *                         faviconUrl:
 *                           type: string
 *                           example: "https://example.com/favicon.ico"
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                     expiresAt:
 *                       type: string
 *                       format: date-time
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       429:
 *         $ref: '#/components/responses/RateLimitError'
 *       503:
 *         description: Service temporarily unavailable
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               success: false
 *               error:
 *                 code: SERVICE_UNAVAILABLE
 *                 message: "Screenshot service is temporarily unavailable"
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
 * @openapi
 * /screenshots:
 *   get:
 *     summary: List screenshots
 *     description: |
 *       Retrieve a paginated list of your screenshots with optional filtering and sorting.
 *
 *       Results are sorted by creation date (newest first) by default.
 *     tags: [Screenshots]
 *     security:
 *       - bearerAuth: []
 *       - apiKeyAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 20
 *         description: Number of items per page
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, processing, completed, failed]
 *         description: Filter by screenshot status
 *       - in: query
 *         name: format
 *         schema:
 *           type: string
 *           enum: [png, jpeg, webp, pdf]
 *         description: Filter by output format
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Filter screenshots created after this date
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Filter screenshots created before this date
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           enum: [createdAt, size, duration]
 *           default: createdAt
 *         description: Field to sort by
 *       - in: query
 *         name: order
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *         description: Sort order
 *     responses:
 *       200:
 *         description: Screenshots retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         example: "507f1f77bcf86cd799439011"
 *                       url:
 *                         type: string
 *                         format: uri
 *                         example: "https://example.com"
 *                       screenshotUrl:
 *                         type: string
 *                         format: uri
 *                         example: "https://storage.screenshot-api.com/screenshots/abc123.png"
 *                       status:
 *                         type: string
 *                         enum: [pending, processing, completed, failed]
 *                         example: "completed"
 *                       size:
 *                         type: integer
 *                         example: 245678
 *                       duration:
 *                         type: integer
 *                         example: 2340
 *                       format:
 *                         type: string
 *                         example: "png"
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                       expiresAt:
 *                         type: string
 *                         format: date-time
 *                 meta:
 *                   type: object
 *                   properties:
 *                     page:
 *                       type: integer
 *                       example: 1
 *                     limit:
 *                       type: integer
 *                       example: 20
 *                     total:
 *                       type: integer
 *                       example: 150
 *                     totalPages:
 *                       type: integer
 *                       example: 8
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       429:
 *         $ref: '#/components/responses/RateLimitError'
 */
router.get('/', authenticateAny, validators.listScreenshots, screenshotController.list);

/**
 * @openapi
 * /screenshots/{id}:
 *   get:
 *     summary: Get screenshot by ID
 *     description: Retrieve detailed information about a specific screenshot including metadata and capture options
 *     tags: [Screenshots]
 *     security:
 *       - bearerAuth: []
 *       - apiKeyAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Screenshot ID
 *         example: "507f1f77bcf86cd799439011"
 *     responses:
 *       200:
 *         description: Screenshot retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: "507f1f77bcf86cd799439011"
 *                     url:
 *                       type: string
 *                       format: uri
 *                       example: "https://example.com"
 *                     screenshotUrl:
 *                       type: string
 *                       format: uri
 *                       example: "https://storage.screenshot-api.com/screenshots/abc123.png"
 *                     status:
 *                       type: string
 *                       enum: [pending, processing, completed, failed]
 *                       example: "completed"
 *                     size:
 *                       type: integer
 *                       example: 245678
 *                     duration:
 *                       type: integer
 *                       example: 2340
 *                     error:
 *                       type: string
 *                       nullable: true
 *                       description: Error message if status is failed
 *                     metadata:
 *                       type: object
 *                       properties:
 *                         pageTitle:
 *                           type: string
 *                           example: "Example Domain"
 *                         pageDescription:
 *                           type: string
 *                         faviconUrl:
 *                           type: string
 *                     options:
 *                       type: object
 *                       properties:
 *                         width:
 *                           type: integer
 *                           example: 1920
 *                         height:
 *                           type: integer
 *                           example: 1080
 *                         fullPage:
 *                           type: boolean
 *                           example: false
 *                         format:
 *                           type: string
 *                           example: "png"
 *                         quality:
 *                           type: integer
 *                           example: 80
 *                         darkMode:
 *                           type: boolean
 *                           example: false
 *                         blockAds:
 *                           type: boolean
 *                           example: false
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                     expiresAt:
 *                       type: string
 *                       format: date-time
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       429:
 *         $ref: '#/components/responses/RateLimitError'
 */
router.get('/:id', authenticateAny, validators.screenshotId, screenshotController.getById);

/**
 * @openapi
 * /screenshots/{id}:
 *   delete:
 *     summary: Delete a screenshot
 *     description: Permanently delete a screenshot and its associated file from storage
 *     tags: [Screenshots]
 *     security:
 *       - bearerAuth: []
 *       - apiKeyAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Screenshot ID to delete
 *         example: "507f1f77bcf86cd799439011"
 *     responses:
 *       200:
 *         description: Screenshot deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Screenshot deleted successfully"
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       429:
 *         $ref: '#/components/responses/RateLimitError'
 */
router.delete('/:id', authenticateAny, validators.screenshotId, screenshotController.remove);

/**
 * @openapi
 * /screenshots/{id}/refresh-url:
 *   post:
 *     summary: Refresh screenshot URL
 *     description: |
 *       Generate a new signed URL for the screenshot file.
 *
 *       Use this when the original URL has expired or you need a fresh signed URL for secure access.
 *     tags: [Screenshots]
 *     security:
 *       - bearerAuth: []
 *       - apiKeyAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Screenshot ID
 *         example: "507f1f77bcf86cd799439011"
 *     responses:
 *       200:
 *         description: URL refreshed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     screenshotUrl:
 *                       type: string
 *                       format: uri
 *                       example: "https://storage.screenshot-api.com/screenshots/abc123.png?signature=xyz"
 *                       description: New signed URL with fresh expiration
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       429:
 *         $ref: '#/components/responses/RateLimitError'
 */
router.post(
  '/:id/refresh-url',
  authenticateAny,
  validators.screenshotId,
  screenshotController.refreshUrl
);

/**
 * @openapi
 * /screenshots/{id}/retry:
 *   post:
 *     summary: Retry a failed screenshot
 *     description: |
 *       Retry capturing a screenshot that previously failed.
 *
 *       This creates a new screenshot attempt with the same options as the original.
 *       The original failed screenshot record is preserved for reference.
 *
 *       **Note:** Only screenshots with status "failed" can be retried.
 *     tags: [Screenshots]
 *     security:
 *       - bearerAuth: []
 *       - apiKeyAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the failed screenshot to retry
 *         example: "507f1f77bcf86cd799439011"
 *     responses:
 *       201:
 *         description: Screenshot retry initiated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Screenshot retry initiated"
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: "507f1f77bcf86cd799439012"
 *                       description: ID of the new screenshot attempt
 *                     url:
 *                       type: string
 *                       format: uri
 *                       example: "https://example.com"
 *                     screenshotUrl:
 *                       type: string
 *                       format: uri
 *                     status:
 *                       type: string
 *                       example: "completed"
 *                     size:
 *                       type: integer
 *                       example: 245678
 *                     duration:
 *                       type: integer
 *                       example: 2340
 *                     metadata:
 *                       type: object
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                     expiresAt:
 *                       type: string
 *                       format: date-time
 *       400:
 *         description: Screenshot is not in failed state or not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               success: false
 *               error:
 *                 code: VALIDATION_ERROR
 *                 message: "Screenshot not found or is not in failed state"
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       429:
 *         $ref: '#/components/responses/RateLimitError'
 */
router.post(
  '/:id/retry',
  authenticateAny,
  screenshotRateLimit,
  validators.screenshotId,
  screenshotController.retry
);

/**
 * @openapi
 * /screenshots/{id}/download:
 *   get:
 *     summary: Download screenshot
 *     description: |
 *       Download or redirect to the screenshot file.
 *
 *       This endpoint redirects (HTTP 302) to the actual screenshot file URL.
 *       The screenshot must be in "completed" status to be downloadable.
 *     tags: [Screenshots]
 *     security:
 *       - bearerAuth: []
 *       - apiKeyAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Screenshot ID
 *         example: "507f1f77bcf86cd799439011"
 *     responses:
 *       302:
 *         description: Redirect to screenshot file
 *         headers:
 *           Location:
 *             description: URL of the screenshot file
 *             schema:
 *               type: string
 *               format: uri
 *       400:
 *         description: Screenshot is not available for download
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               success: false
 *               error:
 *                 code: VALIDATION_ERROR
 *                 message: "Screenshot is not available for download"
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       429:
 *         $ref: '#/components/responses/RateLimitError'
 */
router.get(
  '/:id/download',
  authenticateAny,
  validators.screenshotId,
  screenshotController.download
);

export default router;
