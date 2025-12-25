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
 * @openapi
 * /analytics/overview:
 *   get:
 *     summary: Get analytics overview
 *     description: |
 *       Get comprehensive analytics overview for the authenticated user.
 *
 *       This endpoint provides a high-level summary of screenshot activity including:
 *       - Total screenshot counts (all-time, today, this week, this month)
 *       - Success and failure rates
 *       - Average response times
 *       - Total bandwidth consumed
 *       - Current plan and usage percentage
 *
 *       This is ideal for dashboard widgets and quick status checks.
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *       - apiKeyAuth: []
 *     responses:
 *       200:
 *         description: Analytics overview retrieved successfully
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
 *                       description: Total screenshots captured all-time
 *                       example: 1250
 *                     successfulScreenshots:
 *                       type: integer
 *                       description: Number of successful screenshots
 *                       example: 1200
 *                     failedScreenshots:
 *                       type: integer
 *                       description: Number of failed screenshots
 *                       example: 50
 *                     successRate:
 *                       type: integer
 *                       description: Success rate as percentage (0-100)
 *                       example: 96
 *                     averageResponseTime:
 *                       type: integer
 *                       description: Average response time in milliseconds
 *                       example: 2500
 *                     totalBandwidth:
 *                       type: integer
 *                       description: Total bandwidth in bytes
 *                       example: 524288000
 *                     screenshotsToday:
 *                       type: integer
 *                       description: Screenshots captured today
 *                       example: 25
 *                     screenshotsThisWeek:
 *                       type: integer
 *                       description: Screenshots captured this week
 *                       example: 150
 *                     screenshotsThisMonth:
 *                       type: integer
 *                       description: Screenshots captured this month
 *                       example: 500
 *                     currentPlan:
 *                       type: string
 *                       enum: [free, starter, professional, enterprise]
 *                       description: User's current subscription plan
 *                       example: professional
 *                     usagePercentage:
 *                       type: integer
 *                       description: Percentage of monthly quota used (0-100)
 *                       example: 45
 *                     planLimit:
 *                       type: integer
 *                       description: Monthly screenshot limit for current plan
 *                       example: 1000
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       429:
 *         $ref: '#/components/responses/RateLimitExceeded'
 */
router.get('/overview', analyticsController.overview);

/**
 * @openapi
 * /analytics/screenshots:
 *   get:
 *     summary: Get screenshot analytics
 *     description: |
 *       Get detailed screenshot-specific statistics for the authenticated user.
 *
 *       This endpoint provides breakdowns of screenshots by:
 *       - Status (pending, processing, completed, failed)
 *       - Format (PNG, JPEG, WebP, PDF)
 *       - Resolution (top 5 most used resolutions)
 *       - Full-page vs regular captures
 *
 *       Use the optional date range parameters to filter statistics to a specific period.
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *       - apiKeyAuth: []
 *     parameters:
 *       - name: startDate
 *         in: query
 *         description: Start date for filtering (ISO 8601 format)
 *         required: false
 *         schema:
 *           type: string
 *           format: date-time
 *           example: "2024-01-01T00:00:00Z"
 *       - name: endDate
 *         in: query
 *         description: End date for filtering (ISO 8601 format)
 *         required: false
 *         schema:
 *           type: string
 *           format: date-time
 *           example: "2024-12-31T23:59:59Z"
 *     responses:
 *       200:
 *         description: Screenshot statistics retrieved successfully
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
 *                     byStatus:
 *                       type: object
 *                       description: Screenshot counts by status
 *                       properties:
 *                         pending:
 *                           type: integer
 *                           example: 5
 *                         processing:
 *                           type: integer
 *                           example: 2
 *                         completed:
 *                           type: integer
 *                           example: 1200
 *                         failed:
 *                           type: integer
 *                           example: 50
 *                     byFormat:
 *                       type: object
 *                       description: Screenshot counts by format
 *                       additionalProperties:
 *                         type: integer
 *                       example:
 *                         png: 800
 *                         jpeg: 300
 *                         webp: 100
 *                         pdf: 50
 *                     byResolution:
 *                       type: array
 *                       description: Top 5 resolutions used
 *                       items:
 *                         type: object
 *                         properties:
 *                           width:
 *                             type: integer
 *                             example: 1920
 *                           height:
 *                             type: integer
 *                             example: 1080
 *                           count:
 *                             type: integer
 *                             example: 450
 *                     averageDuration:
 *                       type: integer
 *                       description: Average capture duration in milliseconds
 *                       example: 2500
 *                     averageSize:
 *                       type: integer
 *                       description: Average file size in bytes
 *                       example: 524288
 *                     fullPageCount:
 *                       type: integer
 *                       description: Number of full-page screenshots
 *                       example: 300
 *                     regularCount:
 *                       type: integer
 *                       description: Number of regular screenshots
 *                       example: 950
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       429:
 *         $ref: '#/components/responses/RateLimitExceeded'
 */
router.get('/screenshots', analyticsController.screenshots);

/**
 * @openapi
 * /analytics/usage:
 *   get:
 *     summary: Get API usage analytics
 *     description: |
 *       Get usage statistics over time for the authenticated user.
 *
 *       This endpoint returns time-series data showing:
 *       - Total screenshots per period
 *       - Successful vs failed screenshots
 *       - Bandwidth consumed
 *       - Average response times
 *
 *       The data can be grouped by day, week, or month to analyze usage trends.
 *       Perfect for generating charts and usage reports.
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *       - apiKeyAuth: []
 *     parameters:
 *       - name: period
 *         in: query
 *         description: Time period for grouping data
 *         required: false
 *         schema:
 *           type: string
 *           enum: [day, week, month]
 *           default: day
 *           example: day
 *       - name: limit
 *         in: query
 *         description: Number of periods to return (1-365)
 *         required: false
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 365
 *           default: 30
 *           example: 30
 *     responses:
 *       200:
 *         description: Usage statistics retrieved successfully
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
 *                     period:
 *                       type: string
 *                       enum: [day, week, month]
 *                       description: Time period used for grouping
 *                       example: day
 *                     data:
 *                       type: array
 *                       description: Usage data points
 *                       items:
 *                         type: object
 *                         properties:
 *                           date:
 *                             type: string
 *                             description: Date/period identifier
 *                             example: "2024-12-25"
 *                           screenshots:
 *                             type: integer
 *                             description: Total screenshots in this period
 *                             example: 45
 *                           successful:
 *                             type: integer
 *                             description: Successful screenshots
 *                             example: 43
 *                           failed:
 *                             type: integer
 *                             description: Failed screenshots
 *                             example: 2
 *                           bandwidth:
 *                             type: integer
 *                             description: Bandwidth consumed in bytes
 *                             example: 23592960
 *                           avgResponseTime:
 *                             type: integer
 *                             description: Average response time in milliseconds
 *                             example: 2350
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       429:
 *         $ref: '#/components/responses/RateLimitExceeded'
 */
router.get('/usage', analyticsController.usage);

/**
 * @openapi
 * /analytics/errors:
 *   get:
 *     summary: Get error analytics
 *     description: |
 *       Get detailed error breakdown statistics for the authenticated user.
 *
 *       This endpoint provides insight into screenshot failures including:
 *       - Total error count
 *       - Error rate percentage
 *       - Errors categorized by type (timeout, network, navigation, invalid_url, blocked, other)
 *       - Top 10 most frequent specific error messages
 *
 *       Use this data to identify and troubleshoot common issues.
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *       - apiKeyAuth: []
 *     parameters:
 *       - name: startDate
 *         in: query
 *         description: Start date for filtering (ISO 8601 format)
 *         required: false
 *         schema:
 *           type: string
 *           format: date-time
 *           example: "2024-01-01T00:00:00Z"
 *       - name: endDate
 *         in: query
 *         description: End date for filtering (ISO 8601 format)
 *         required: false
 *         schema:
 *           type: string
 *           format: date-time
 *           example: "2024-12-31T23:59:59Z"
 *     responses:
 *       200:
 *         description: Error statistics retrieved successfully
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
 *                     totalErrors:
 *                       type: integer
 *                       description: Total number of failed screenshots
 *                       example: 50
 *                     byType:
 *                       type: object
 *                       description: Error counts by category
 *                       additionalProperties:
 *                         type: integer
 *                       example:
 *                         timeout: 20
 *                         network: 15
 *                         navigation: 8
 *                         invalid_url: 5
 *                         blocked: 2
 *                     topErrors:
 *                       type: array
 *                       description: Top 10 most frequent error messages
 *                       items:
 *                         type: object
 *                         properties:
 *                           error:
 *                             type: string
 *                             description: Error message
 *                             example: "Navigation timeout of 30000 ms exceeded"
 *                           count:
 *                             type: integer
 *                             description: Number of occurrences
 *                             example: 15
 *                           lastOccurred:
 *                             type: string
 *                             format: date-time
 *                             description: When this error last occurred
 *                             example: "2024-12-25T10:30:00Z"
 *                     errorRate:
 *                       type: integer
 *                       description: Error rate as percentage (0-100)
 *                       example: 4
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       429:
 *         $ref: '#/components/responses/RateLimitExceeded'
 */
router.get('/errors', analyticsController.errors);

/**
 * @openapi
 * /analytics/urls:
 *   get:
 *     summary: Get top URLs analytics
 *     description: |
 *       Get the most frequently captured URLs for the authenticated user.
 *
 *       This endpoint returns a list of URLs ranked by capture frequency, including:
 *       - Full URL
 *       - Extracted domain
 *       - Total capture count
 *       - Last capture timestamp
 *
 *       Useful for understanding which websites are captured most often.
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *       - apiKeyAuth: []
 *     parameters:
 *       - name: limit
 *         in: query
 *         description: Maximum number of URLs to return (1-100)
 *         required: false
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *           example: 10
 *       - name: startDate
 *         in: query
 *         description: Start date for filtering (ISO 8601 format)
 *         required: false
 *         schema:
 *           type: string
 *           format: date-time
 *           example: "2024-01-01T00:00:00Z"
 *       - name: endDate
 *         in: query
 *         description: End date for filtering (ISO 8601 format)
 *         required: false
 *         schema:
 *           type: string
 *           format: date-time
 *           example: "2024-12-31T23:59:59Z"
 *     responses:
 *       200:
 *         description: Popular URLs retrieved successfully
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
 *                   description: List of popular URLs sorted by capture count
 *                   items:
 *                     type: object
 *                     properties:
 *                       url:
 *                         type: string
 *                         format: uri
 *                         description: Full URL that was captured
 *                         example: "https://example.com/page"
 *                       domain:
 *                         type: string
 *                         description: Extracted domain from URL
 *                         example: "example.com"
 *                       count:
 *                         type: integer
 *                         description: Number of times this URL was captured
 *                         example: 45
 *                       lastCaptured:
 *                         type: string
 *                         format: date-time
 *                         description: When this URL was last captured
 *                         example: "2024-12-25T14:30:00Z"
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       429:
 *         $ref: '#/components/responses/RateLimitExceeded'
 */
router.get('/urls', analyticsController.popularUrls);

/**
 * @openapi
 * /analytics/api-keys/{id}:
 *   get:
 *     summary: Get API key specific analytics
 *     description: |
 *       Get usage statistics for a specific API key.
 *
 *       This endpoint provides detailed analytics for individual API keys including:
 *       - Total requests made with this key
 *       - Success and failure counts
 *       - Last usage timestamp
 *       - Daily usage breakdown for the last 30 days
 *
 *       The API key must belong to the authenticated user.
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *       - apiKeyAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         description: API key ID (MongoDB ObjectId)
 *         required: true
 *         schema:
 *           type: string
 *           example: "507f1f77bcf86cd799439011"
 *     responses:
 *       200:
 *         description: API key analytics retrieved successfully
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
 *                     totalRequests:
 *                       type: integer
 *                       description: Total requests made with this API key
 *                       example: 500
 *                     successfulRequests:
 *                       type: integer
 *                       description: Number of successful requests
 *                       example: 480
 *                     failedRequests:
 *                       type: integer
 *                       description: Number of failed requests
 *                       example: 20
 *                     lastUsed:
 *                       type: string
 *                       format: date-time
 *                       nullable: true
 *                       description: When this API key was last used
 *                       example: "2024-12-25T15:45:00Z"
 *                     usageByDay:
 *                       type: array
 *                       description: Daily usage for the last 30 days
 *                       items:
 *                         type: object
 *                         properties:
 *                           date:
 *                             type: string
 *                             description: Date (YYYY-MM-DD format)
 *                             example: "2024-12-25"
 *                           count:
 *                             type: integer
 *                             description: Number of requests on this date
 *                             example: 25
 *       400:
 *         description: Invalid API key ID format
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               success: false
 *               error:
 *                 code: "VALIDATION_ERROR"
 *                 message: "Invalid API key ID"
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       404:
 *         description: API key not found or doesn't belong to user
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               success: false
 *               error:
 *                 code: "NOT_FOUND"
 *                 message: "API key not found"
 *       429:
 *         $ref: '#/components/responses/RateLimitExceeded'
 */
router.get('/api-keys/:id', analyticsController.apiKeyStats);

export default router;
