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
 * @route   GET /api/v1/subscriptions/plans
 * @desc    Get available subscription plans
 * @access  Public
 */
router.get('/plans', defaultRateLimit, subscriptionController.plans);

/**
 * @route   POST /api/v1/subscriptions/webhook
 * @desc    Handle Stripe webhook events
 * @access  Public (Stripe webhook signature verified)
 * @note    Uses raw body parser for signature verification
 */
router.post('/webhook', raw({ type: 'application/json' }), subscriptionController.webhook);

// ============================================
// Authenticated Routes
// ============================================

/**
 * @route   POST /api/v1/subscriptions/checkout
 * @desc    Create Stripe checkout session
 * @access  Private
 */
router.post(
  '/checkout',
  authenticateAny,
  strictRateLimit,
  validators.createCheckout,
  subscriptionController.checkout
);

/**
 * @route   POST /api/v1/subscriptions/portal
 * @desc    Create Stripe customer portal session
 * @access  Private
 */
router.post('/portal', authenticateAny, strictRateLimit, subscriptionController.portal);

/**
 * @route   GET /api/v1/subscriptions
 * @desc    Get current subscription
 * @access  Private
 */
router.get('/', authenticateAny, subscriptionController.getSubscription);

/**
 * @route   DELETE /api/v1/subscriptions
 * @desc    Cancel subscription
 * @access  Private
 */
router.delete('/', authenticateAny, strictRateLimit, subscriptionController.cancel);

/**
 * @route   POST /api/v1/subscriptions/resume
 * @desc    Resume cancelled subscription
 * @access  Private
 */
router.post('/resume', authenticateAny, strictRateLimit, subscriptionController.resume);

/**
 * @route   PUT /api/v1/subscriptions/plan
 * @desc    Change subscription plan
 * @access  Private
 */
router.put('/plan', authenticateAny, strictRateLimit, subscriptionController.updatePlan);

/**
 * @route   GET /api/v1/subscriptions/usage
 * @desc    Get usage statistics
 * @access  Private
 */
router.get('/usage', authenticateAny, subscriptionController.usage);

export default router;
