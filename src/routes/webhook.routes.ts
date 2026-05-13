/**
 * Webhook Routes
 * Defines API endpoints for webhook management
 */

import { Router, Request, Response, NextFunction } from 'express';
import { authenticateJWT, defaultRateLimit } from '@middlewares/index';
import { validators } from '@middlewares/validation.middleware';
import { AuthenticatedRequest } from '@/types';
import { getUserWebhooks, getWebhookStatus, retryWebhook } from '@queues/webhook.queue';
import User from '@models/user.model';
import { generateWebhookSecret } from '@utils/webhookSignature';

const router = Router();

// ============================================
// Authenticated Routes
// ============================================

// NOTE: Specific routes (/secret, /secret/regenerate) must be defined before
// parameterized routes (/:id) to prevent Express from matching "secret" as an ID

/**
 * @openapi
 * /webhooks/secret:
 *   get:
 *     summary: Get webhook secret
 *     description: Get the user's webhook secret for signature verification
 *     tags: [Webhooks]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Webhook secret retrieved successfully
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
 *                     secret:
 *                       type: string
 *                       example: "abc123..."
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.get(
  '/secret',
  defaultRateLimit,
  authenticateJWT,
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const authReq = req as AuthenticatedRequest;
      const user = await User.findById(authReq.user!._id).select('+webhookSecret');

      res.json({
        success: true,
        data: {
          secret: user?.webhookSecret,
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @openapi
 * /webhooks/secret/regenerate:
 *   post:
 *     summary: Regenerate webhook secret
 *     description: Generate a new webhook secret (invalidates the old one)
 *     tags: [Webhooks]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Webhook secret regenerated successfully
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
 *                     secret:
 *                       type: string
 *                       example: "xyz789..."
 *                 message:
 *                   type: string
 *                   example: Webhook secret regenerated
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.post(
  '/secret/regenerate',
  defaultRateLimit,
  authenticateJWT,
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const authReq = req as AuthenticatedRequest;
      const user = await User.findById(authReq.user!._id).select('+webhookSecret');

      if (!user) {
        res.status(404).json({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'User not found',
          },
        });
        return;
      }

      // Regenerate the secret
      const newSecret = generateWebhookSecret();
      user.webhookSecret = newSecret;
      await user.save();

      res.json({
        success: true,
        data: {
          secret: newSecret,
        },
        message: 'Webhook secret regenerated',
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @openapi
 * /webhooks:
 *   get:
 *     summary: Get webhook history
 *     description: List all webhook delivery attempts for the authenticated user
 *     tags: [Webhooks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 20
 *         description: Number of results to return
 *     responses:
 *       200:
 *         description: Webhook history retrieved successfully
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
 *                     $ref: '#/components/schemas/WebhookAttempt'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.get(
  '/',
  defaultRateLimit,
  authenticateJWT,
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const authReq = req as AuthenticatedRequest;
      const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);

      const webhooks = await getUserWebhooks(authReq.user!._id, limit);

      res.json({
        success: true,
        data: webhooks,
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @openapi
 * /webhooks/{id}:
 *   get:
 *     summary: Get webhook attempt details
 *     description: Get details of a specific webhook delivery attempt
 *     tags: [Webhooks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Webhook attempt ID
 *     responses:
 *       200:
 *         description: Webhook attempt details retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/WebhookAttempt'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         description: Webhook attempt not found
 */
router.get(
  '/:id',
  defaultRateLimit,
  authenticateJWT,
  validators.id,
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const authReq = req as AuthenticatedRequest;
      const attempt = await getWebhookStatus(req.params.id);

      if (!attempt || attempt.userId.toString() !== authReq.user!._id.toString()) {
        res.status(404).json({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Webhook attempt not found',
          },
        });
        return;
      }

      res.json({
        success: true,
        data: attempt,
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @openapi
 * /webhooks/{id}/retry:
 *   post:
 *     summary: Retry a failed webhook
 *     description: Retry delivery of a failed webhook attempt
 *     tags: [Webhooks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Webhook attempt ID
 *     responses:
 *       200:
 *         description: Webhook retry queued successfully
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
 *                   example: Webhook retry queued
 *       400:
 *         description: Cannot retry webhook (not failed or not found)
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.post(
  '/:id/retry',
  defaultRateLimit,
  authenticateJWT,
  validators.id,
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const authReq = req as AuthenticatedRequest;
      const success = await retryWebhook(req.params.id, authReq.user!._id);

      if (!success) {
        res.status(400).json({
          success: false,
          error: {
            code: 'BAD_REQUEST',
            message: 'Cannot retry webhook (not found or not failed)',
          },
        });
        return;
      }

      res.json({
        success: true,
        message: 'Webhook retry queued',
      });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
