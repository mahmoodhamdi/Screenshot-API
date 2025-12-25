/**
 * Subscription Controller
 * Handles HTTP requests for subscription and payment operations
 */

import { Request, Response } from 'express';
import {
  createCheckoutSession,
  createPortalSession,
  getSubscriptionDetails,
  cancelSubscription,
  resumeSubscription,
  changePlan,
  handleWebhookEvent,
  getUsageStats,
  getAvailablePlans,
} from '@services/subscription.service';
import { asyncHandler, AppError } from '@middlewares/error.middleware';
import { PlanType } from '@/types';
import { ERROR_CODES } from '@utils/constants';
import logger from '@utils/logger';

// ============================================
// Subscription Controllers
// ============================================

/**
 * Create checkout session
 * POST /api/v1/subscriptions/checkout
 */
export const checkout = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new AppError('Authentication required', 401, ERROR_CODES.UNAUTHORIZED);
  }

  const { plan, successUrl, cancelUrl } = req.body;

  // Validate plan
  if (!['starter', 'professional', 'enterprise'].includes(plan)) {
    throw new AppError('Invalid plan', 400, ERROR_CODES.VALIDATION_ERROR);
  }

  const session = await createCheckoutSession(
    req.user,
    plan as Exclude<PlanType, 'free'>,
    successUrl,
    cancelUrl
  );

  logger.info('Checkout session created', {
    userId: req.user._id,
    plan,
    sessionId: session.sessionId,
  });

  res.json({
    success: true,
    data: {
      sessionId: session.sessionId,
      url: session.url,
    },
  });
});

/**
 * Create customer portal session
 * POST /api/v1/subscriptions/portal
 */
export const portal = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new AppError('Authentication required', 401, ERROR_CODES.UNAUTHORIZED);
  }

  const { returnUrl } = req.body;

  if (!returnUrl) {
    throw new AppError('Return URL is required', 400, ERROR_CODES.VALIDATION_ERROR);
  }

  const session = await createPortalSession(req.user, returnUrl);

  res.json({
    success: true,
    data: {
      url: session.url,
    },
  });
});

/**
 * Get current subscription
 * GET /api/v1/subscriptions
 */
export const getSubscription = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new AppError('Authentication required', 401, ERROR_CODES.UNAUTHORIZED);
  }

  const subscription = await getSubscriptionDetails(req.user);

  res.json({
    success: true,
    data: {
      plan: req.user.subscription.plan,
      status: req.user.subscription.status,
      subscription,
    },
  });
});

/**
 * Cancel subscription
 * DELETE /api/v1/subscriptions
 */
export const cancel = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new AppError('Authentication required', 401, ERROR_CODES.UNAUTHORIZED);
  }

  const { immediately = false } = req.query;

  await cancelSubscription(req.user, immediately === 'true');

  logger.info('Subscription cancelled', {
    userId: req.user._id,
    immediately,
  });

  res.json({
    success: true,
    message: immediately
      ? 'Subscription cancelled immediately'
      : 'Subscription will be cancelled at the end of the billing period',
  });
});

/**
 * Resume subscription
 * POST /api/v1/subscriptions/resume
 */
export const resume = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new AppError('Authentication required', 401, ERROR_CODES.UNAUTHORIZED);
  }

  await resumeSubscription(req.user);

  logger.info('Subscription resumed', { userId: req.user._id });

  res.json({
    success: true,
    message: 'Subscription resumed',
  });
});

/**
 * Change plan
 * PUT /api/v1/subscriptions/plan
 */
export const updatePlan = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new AppError('Authentication required', 401, ERROR_CODES.UNAUTHORIZED);
  }

  const { plan } = req.body;

  // Validate plan
  if (!['starter', 'professional', 'enterprise'].includes(plan)) {
    throw new AppError('Invalid plan', 400, ERROR_CODES.VALIDATION_ERROR);
  }

  await changePlan(req.user, plan as Exclude<PlanType, 'free'>);

  logger.info('Plan changed', {
    userId: req.user._id,
    newPlan: plan,
  });

  res.json({
    success: true,
    message: `Plan changed to ${plan}`,
    data: {
      plan,
    },
  });
});

/**
 * Get usage statistics
 * GET /api/v1/subscriptions/usage
 */
// eslint-disable-next-line @typescript-eslint/require-await
export const usage = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new AppError('Authentication required', 401, ERROR_CODES.UNAUTHORIZED);
  }

  const stats = getUsageStats(req.user);

  res.json({
    success: true,
    data: stats,
  });
});

/**
 * Get available plans
 * GET /api/v1/subscriptions/plans
 */
// eslint-disable-next-line @typescript-eslint/require-await
export const plans = asyncHandler(async (_req: Request, res: Response) => {
  const availablePlans = getAvailablePlans();

  res.json({
    success: true,
    data: availablePlans,
  });
});

/**
 * Handle Stripe webhook
 * POST /api/v1/subscriptions/webhook
 */
export const webhook = asyncHandler(async (req: Request, res: Response) => {
  const signature = req.headers['stripe-signature'] as string;

  if (!signature) {
    throw new AppError('Missing stripe signature', 400, ERROR_CODES.VALIDATION_ERROR);
  }

  // Get raw body
  const payload = req.body;

  const result = await handleWebhookEvent(payload, signature);

  logger.info('Webhook processed', { type: result.type });

  res.json({
    received: true,
  });
});

// ============================================
// Export
// ============================================

export default {
  checkout,
  portal,
  getSubscription,
  cancel,
  resume,
  updatePlan,
  usage,
  plans,
  webhook,
};
