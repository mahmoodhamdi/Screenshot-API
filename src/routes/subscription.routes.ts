/**
 * Subscription Routes
 * Defines API endpoints for subscription and payment operations
 */

import { Router, raw } from 'express';
import subscriptionController from '@controllers/subscription.controller';
import { authenticateAny, defaultRateLimit, strictRateLimit } from '@middlewares/index';
import { validators } from '@middlewares/validation.middleware';

const router = Router();

// ============================================
// Public Routes
// ============================================

/**
 * @openapi
 * /subscriptions/plans:
 *   get:
 *     summary: Get available subscription plans
 *     description: |
 *       Retrieve a list of all available subscription plans with their features and pricing.
 *
 *       This endpoint is public and does not require authentication.
 *     tags: [Subscriptions]
 *     responses:
 *       200:
 *         description: Plans retrieved successfully
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
 *                       plan:
 *                         type: string
 *                         enum: [free, starter, professional, enterprise]
 *                         example: "professional"
 *                       name:
 *                         type: string
 *                         example: "Professional"
 *                       description:
 *                         type: string
 *                         example: "For growing businesses"
 *                       price:
 *                         type: integer
 *                         description: Price in cents
 *                         example: 4900
 *                       screenshotsPerMonth:
 *                         type: integer
 *                         example: 10000
 *                       priceId:
 *                         type: string
 *                         description: Stripe price ID (only for paid plans)
 *                         example: "price_1234567890"
 *             example:
 *               success: true
 *               data:
 *                 - plan: "free"
 *                   name: "Free"
 *                   description: "Basic screenshot functionality"
 *                   price: 0
 *                   screenshotsPerMonth: 100
 *                 - plan: "starter"
 *                   name: "Starter"
 *                   description: "For individuals and small projects"
 *                   price: 1900
 *                   screenshotsPerMonth: 2000
 *                   priceId: "price_starter_monthly"
 *                 - plan: "professional"
 *                   name: "Professional"
 *                   description: "For growing businesses"
 *                   price: 4900
 *                   screenshotsPerMonth: 10000
 *                   priceId: "price_professional_monthly"
 *                 - plan: "enterprise"
 *                   name: "Enterprise"
 *                   description: "For large organizations"
 *                   price: 14900
 *                   screenshotsPerMonth: 50000
 *                   priceId: "price_enterprise_monthly"
 *       429:
 *         $ref: '#/components/responses/RateLimitError'
 */
router.get('/plans', defaultRateLimit, subscriptionController.plans);

/**
 * @openapi
 * /subscriptions/webhook:
 *   post:
 *     summary: Handle Stripe webhook events
 *     description: |
 *       Endpoint for receiving Stripe webhook events.
 *
 *       **This endpoint is called by Stripe, not by your application.**
 *
 *       Handled events:
 *       - `checkout.session.completed` - Subscription created via checkout
 *       - `customer.subscription.created` - New subscription
 *       - `customer.subscription.updated` - Subscription modified
 *       - `customer.subscription.deleted` - Subscription cancelled
 *       - `invoice.payment_succeeded` - Payment successful
 *       - `invoice.payment_failed` - Payment failed
 *
 *       The endpoint verifies the Stripe signature to ensure the request is authentic.
 *     tags: [Subscriptions]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             description: Stripe event object (raw JSON)
 *     parameters:
 *       - in: header
 *         name: stripe-signature
 *         required: true
 *         schema:
 *           type: string
 *         description: Stripe webhook signature for verification
 *     responses:
 *       200:
 *         description: Webhook received and processed
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 received:
 *                   type: boolean
 *                   example: true
 *       400:
 *         description: Invalid signature or missing data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               success: false
 *               error:
 *                 code: VALIDATION_ERROR
 *                 message: "Invalid webhook signature"
 */
router.post('/webhook', raw({ type: 'application/json' }), subscriptionController.webhook);

// ============================================
// Authenticated Routes
// ============================================

/**
 * @openapi
 * /subscriptions/checkout:
 *   post:
 *     summary: Create Stripe checkout session
 *     description: |
 *       Create a Stripe checkout session to subscribe to a paid plan.
 *
 *       After creating the session, redirect the user to the returned URL to complete payment.
 *
 *       **Note:** Only available for starter, professional, and enterprise plans.
 *       Free plan users don't need to go through checkout.
 *     tags: [Subscriptions]
 *     security:
 *       - bearerAuth: []
 *       - apiKeyAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - plan
 *               - successUrl
 *               - cancelUrl
 *             properties:
 *               plan:
 *                 type: string
 *                 enum: [starter, professional, enterprise]
 *                 description: Plan to subscribe to
 *                 example: "professional"
 *               successUrl:
 *                 type: string
 *                 format: uri
 *                 description: URL to redirect after successful payment
 *                 example: "https://myapp.com/subscription/success"
 *               cancelUrl:
 *                 type: string
 *                 format: uri
 *                 description: URL to redirect if payment is cancelled
 *                 example: "https://myapp.com/subscription/cancel"
 *     responses:
 *       200:
 *         description: Checkout session created successfully
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
 *                     sessionId:
 *                       type: string
 *                       description: Stripe checkout session ID
 *                       example: "cs_test_a1b2c3d4e5f6g7h8i9j0"
 *                     url:
 *                       type: string
 *                       format: uri
 *                       description: Stripe checkout URL to redirect user
 *                       example: "https://checkout.stripe.com/c/pay/cs_test_..."
 *       400:
 *         description: Invalid plan or missing parameters
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               success: false
 *               error:
 *                 code: VALIDATION_ERROR
 *                 message: "Invalid plan"
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       429:
 *         $ref: '#/components/responses/RateLimitError'
 */
router.post(
  '/checkout',
  authenticateAny,
  strictRateLimit,
  validators.createCheckout,
  subscriptionController.checkout
);

/**
 * @openapi
 * /subscriptions/portal:
 *   post:
 *     summary: Create Stripe customer portal session
 *     description: |
 *       Create a Stripe customer portal session for managing billing.
 *
 *       The portal allows users to:
 *       - Update payment methods
 *       - View invoice history
 *       - Download invoices
 *       - Cancel subscription
 *
 *       After creating the session, redirect the user to the returned URL.
 *     tags: [Subscriptions]
 *     security:
 *       - bearerAuth: []
 *       - apiKeyAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - returnUrl
 *             properties:
 *               returnUrl:
 *                 type: string
 *                 format: uri
 *                 description: URL to redirect after leaving the portal
 *                 example: "https://myapp.com/dashboard/billing"
 *     responses:
 *       200:
 *         description: Portal session created successfully
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
 *                     url:
 *                       type: string
 *                       format: uri
 *                       description: Stripe customer portal URL
 *                       example: "https://billing.stripe.com/p/session/..."
 *       400:
 *         description: No subscription found or missing return URL
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               success: false
 *               error:
 *                 code: VALIDATION_ERROR
 *                 message: "No subscription found"
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       429:
 *         $ref: '#/components/responses/RateLimitError'
 */
router.post('/portal', authenticateAny, strictRateLimit, subscriptionController.portal);

/**
 * @openapi
 * /subscriptions:
 *   get:
 *     summary: Get current subscription
 *     description: |
 *       Retrieve details about the current user's subscription including plan, status, and billing dates.
 *     tags: [Subscriptions]
 *     security:
 *       - bearerAuth: []
 *       - apiKeyAuth: []
 *     responses:
 *       200:
 *         description: Subscription details retrieved successfully
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
 *                     plan:
 *                       type: string
 *                       enum: [free, starter, professional, enterprise]
 *                       example: "professional"
 *                     status:
 *                       type: string
 *                       enum: [active, cancelled, expired, past_due]
 *                       example: "active"
 *                     subscription:
 *                       type: object
 *                       nullable: true
 *                       description: Stripe subscription details (null for free plan)
 *                       properties:
 *                         id:
 *                           type: string
 *                           example: "sub_1234567890"
 *                         status:
 *                           type: string
 *                           example: "active"
 *                         plan:
 *                           type: string
 *                           example: "professional"
 *                         currentPeriodStart:
 *                           type: string
 *                           format: date-time
 *                         currentPeriodEnd:
 *                           type: string
 *                           format: date-time
 *                         cancelAtPeriodEnd:
 *                           type: boolean
 *                           example: false
 *                         nextBillingDate:
 *                           type: string
 *                           format: date-time
 *                         amount:
 *                           type: integer
 *                           description: Amount in cents
 *                           example: 4900
 *                         currency:
 *                           type: string
 *                           example: "USD"
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       429:
 *         $ref: '#/components/responses/RateLimitError'
 */
router.get('/', authenticateAny, subscriptionController.getSubscription);

/**
 * @openapi
 * /subscriptions:
 *   delete:
 *     summary: Cancel subscription
 *     description: |
 *       Cancel the current subscription.
 *
 *       By default, the subscription will remain active until the end of the current billing period,
 *       then automatically downgrade to the free plan.
 *
 *       Use `immediately=true` to cancel immediately (no refund).
 *     tags: [Subscriptions]
 *     security:
 *       - bearerAuth: []
 *       - apiKeyAuth: []
 *     parameters:
 *       - in: query
 *         name: immediately
 *         schema:
 *           type: boolean
 *           default: false
 *         description: If true, cancel immediately. Otherwise, cancel at end of billing period.
 *     responses:
 *       200:
 *         description: Subscription cancelled successfully
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
 *                   example: "Subscription will be cancelled at the end of the billing period"
 *       400:
 *         description: No subscription to cancel
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               success: false
 *               error:
 *                 code: VALIDATION_ERROR
 *                 message: "No subscription to cancel"
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       429:
 *         $ref: '#/components/responses/RateLimitError'
 */
router.delete('/', authenticateAny, strictRateLimit, subscriptionController.cancel);

/**
 * @openapi
 * /subscriptions/resume:
 *   post:
 *     summary: Resume cancelled subscription
 *     description: |
 *       Resume a subscription that was scheduled for cancellation.
 *
 *       This only works if the subscription was cancelled with `immediately=false`
 *       and the current billing period has not ended yet.
 *     tags: [Subscriptions]
 *     security:
 *       - bearerAuth: []
 *       - apiKeyAuth: []
 *     responses:
 *       200:
 *         description: Subscription resumed successfully
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
 *                   example: "Subscription resumed"
 *       400:
 *         description: No subscription to resume or not scheduled for cancellation
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             examples:
 *               noSubscription:
 *                 summary: No subscription
 *                 value:
 *                   success: false
 *                   error:
 *                     code: VALIDATION_ERROR
 *                     message: "No subscription to resume"
 *               notCancelled:
 *                 summary: Not scheduled for cancellation
 *                 value:
 *                   success: false
 *                   error:
 *                     code: VALIDATION_ERROR
 *                     message: "Subscription is not scheduled for cancellation"
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       429:
 *         $ref: '#/components/responses/RateLimitError'
 */
router.post('/resume', authenticateAny, strictRateLimit, subscriptionController.resume);

/**
 * @openapi
 * /subscriptions/plan:
 *   put:
 *     summary: Change subscription plan
 *     description: |
 *       Upgrade or downgrade the current subscription to a different plan.
 *
 *       - **Upgrades**: Take effect immediately with prorated billing
 *       - **Downgrades**: Take effect at the end of the current billing period
 *
 *       **Note:** You cannot change to the free plan using this endpoint.
 *       To downgrade to free, cancel your subscription instead.
 *     tags: [Subscriptions]
 *     security:
 *       - bearerAuth: []
 *       - apiKeyAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - plan
 *             properties:
 *               plan:
 *                 type: string
 *                 enum: [starter, professional, enterprise]
 *                 description: New plan to switch to
 *                 example: "enterprise"
 *     responses:
 *       200:
 *         description: Plan changed successfully
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
 *                   example: "Plan changed to enterprise"
 *                 data:
 *                   type: object
 *                   properties:
 *                     plan:
 *                       type: string
 *                       example: "enterprise"
 *       400:
 *         description: Invalid plan or no active subscription
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             examples:
 *               invalidPlan:
 *                 summary: Invalid plan
 *                 value:
 *                   success: false
 *                   error:
 *                     code: VALIDATION_ERROR
 *                     message: "Invalid plan"
 *               noSubscription:
 *                 summary: No active subscription
 *                 value:
 *                   success: false
 *                   error:
 *                     code: VALIDATION_ERROR
 *                     message: "No active subscription to change"
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       429:
 *         $ref: '#/components/responses/RateLimitError'
 */
router.put('/plan', authenticateAny, strictRateLimit, subscriptionController.updatePlan);

/**
 * @openapi
 * /subscriptions/usage:
 *   get:
 *     summary: Get usage statistics
 *     description: |
 *       Retrieve current usage statistics for the billing period including:
 *       - Screenshots used vs limit
 *       - Usage percentage
 *       - Days until usage resets
 *       - Billing period dates
 *     tags: [Subscriptions]
 *     security:
 *       - bearerAuth: []
 *       - apiKeyAuth: []
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
 *                     currentPlan:
 *                       type: string
 *                       enum: [free, starter, professional, enterprise]
 *                       example: "professional"
 *                     screenshotsUsed:
 *                       type: integer
 *                       description: Screenshots used this billing period
 *                       example: 2500
 *                     screenshotsLimit:
 *                       type: integer
 *                       description: Maximum screenshots allowed per period
 *                       example: 10000
 *                     percentageUsed:
 *                       type: integer
 *                       description: Percentage of quota used
 *                       example: 25
 *                     daysUntilReset:
 *                       type: integer
 *                       description: Days until usage resets
 *                       example: 15
 *                     currentPeriodStart:
 *                       type: string
 *                       format: date-time
 *                       description: Start of current billing period
 *                     currentPeriodEnd:
 *                       type: string
 *                       format: date-time
 *                       description: End of current billing period
 *             example:
 *               success: true
 *               data:
 *                 currentPlan: "professional"
 *                 screenshotsUsed: 2500
 *                 screenshotsLimit: 10000
 *                 percentageUsed: 25
 *                 daysUntilReset: 15
 *                 currentPeriodStart: "2024-01-01T00:00:00.000Z"
 *                 currentPeriodEnd: "2024-02-01T00:00:00.000Z"
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       429:
 *         $ref: '#/components/responses/RateLimitError'
 */
router.get('/usage', authenticateAny, subscriptionController.usage);

export default router;
