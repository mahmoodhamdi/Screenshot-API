/**
 * Subscription Service
 * Handles Stripe subscriptions, payments, and billing
 */

import Stripe from 'stripe';
import User from '@models/user.model';
import { IUser, PlanType, SubscriptionStatus, UsageStatsDTO } from '@/types';
import { config } from '@config/index';
import { invalidateCache } from '@config/redis';
import logger from '@utils/logger';
import { AppError } from '@middlewares/error.middleware';
import { ERROR_CODES } from '@utils/constants';

// ============================================
// Stripe Client
// ============================================

let stripeClient: Stripe | null = null;

/**
 * Get Stripe client instance
 */
function getStripe(): Stripe {
  if (!stripeClient) {
    if (!config.stripe.secretKey) {
      throw new Error('Stripe secret key not configured');
    }

    stripeClient = new Stripe(config.stripe.secretKey, {
      apiVersion: '2024-04-10',
      typescript: true,
    });
  }

  return stripeClient;
}

// ============================================
// Types
// ============================================

export interface CheckoutSession {
  sessionId: string;
  url: string;
}

export interface CustomerPortalSession {
  url: string;
}

export interface SubscriptionDetails {
  id: string;
  status: SubscriptionStatus;
  plan: PlanType;
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  cancelAtPeriodEnd: boolean;
  nextBillingDate?: Date;
  amount?: number;
  currency?: string;
}

// ============================================
// Plan Configuration
// ============================================

const PLAN_FEATURES: Record<
  PlanType,
  {
    name: string;
    description: string;
    price: number;
    screenshotsPerMonth: number;
  }
> = {
  free: {
    name: 'Free',
    description: 'Basic screenshot functionality',
    price: 0,
    screenshotsPerMonth: 100,
  },
  starter: {
    name: 'Starter',
    description: 'For individuals and small projects',
    price: 1900, // $19.00
    screenshotsPerMonth: 2000,
  },
  professional: {
    name: 'Professional',
    description: 'For growing businesses',
    price: 4900, // $49.00
    screenshotsPerMonth: 10000,
  },
  enterprise: {
    name: 'Enterprise',
    description: 'For large organizations',
    price: 14900, // $149.00
    screenshotsPerMonth: 50000,
  },
};

// ============================================
// Customer Management
// ============================================

/**
 * Get or create Stripe customer for user
 */
export async function getOrCreateCustomer(user: IUser): Promise<string> {
  // Check if user already has a customer ID
  if (user.subscription.stripeCustomerId) {
    return user.subscription.stripeCustomerId;
  }

  const stripe = getStripe();

  // Create new customer
  const customer = await stripe.customers.create({
    email: user.email,
    name: user.name,
    metadata: {
      userId: user._id.toString(),
    },
  });

  // Update user with customer ID
  user.subscription.stripeCustomerId = customer.id;
  await user.save();

  // Invalidate cache
  await invalidateCache(`user:${user._id}`);

  logger.info('Stripe customer created', {
    userId: user._id,
    customerId: customer.id,
  });

  return customer.id;
}

/**
 * Update customer email in Stripe
 */
export async function updateCustomerEmail(
  customerId: string,
  email: string
): Promise<void> {
  const stripe = getStripe();

  await stripe.customers.update(customerId, { email });

  logger.info('Stripe customer email updated', { customerId, email });
}

// ============================================
// Checkout Sessions
// ============================================

/**
 * Create checkout session for subscription
 */
export async function createCheckoutSession(
  user: IUser,
  plan: Exclude<PlanType, 'free'>,
  successUrl: string,
  cancelUrl: string
): Promise<CheckoutSession> {
  const stripe = getStripe();

  // Get or create customer
  const customerId = await getOrCreateCustomer(user);

  // Get price ID for plan
  const priceId = config.stripe.priceIds[plan];
  if (!priceId) {
    throw new AppError(`Price not configured for plan: ${plan}`, 400, ERROR_CODES.VALIDATION_ERROR);
  }

  // Create checkout session
  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    success_url: `${successUrl}?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: cancelUrl,
    metadata: {
      userId: user._id.toString(),
      plan,
    },
    subscription_data: {
      metadata: {
        userId: user._id.toString(),
        plan,
      },
    },
    allow_promotion_codes: true,
    billing_address_collection: 'auto',
  });

  logger.info('Checkout session created', {
    userId: user._id,
    plan,
    sessionId: session.id,
  });

  return {
    sessionId: session.id,
    url: session.url!,
  };
}

/**
 * Create customer portal session
 */
export async function createPortalSession(
  user: IUser,
  returnUrl: string
): Promise<CustomerPortalSession> {
  const stripe = getStripe();

  // User must have a customer ID
  if (!user.subscription.stripeCustomerId) {
    throw new AppError(
      'No subscription found',
      400,
      ERROR_CODES.VALIDATION_ERROR
    );
  }

  const session = await stripe.billingPortal.sessions.create({
    customer: user.subscription.stripeCustomerId,
    return_url: returnUrl,
  });

  logger.info('Portal session created', {
    userId: user._id,
    customerId: user.subscription.stripeCustomerId,
  });

  return {
    url: session.url,
  };
}

// ============================================
// Subscription Management
// ============================================

/**
 * Get subscription details for user
 */
export async function getSubscriptionDetails(
  user: IUser
): Promise<SubscriptionDetails | null> {
  if (!user.subscription.stripeSubscriptionId) {
    return null;
  }

  const stripe = getStripe();

  try {
    const subscription = await stripe.subscriptions.retrieve(
      user.subscription.stripeSubscriptionId
    );

    // Map Stripe status to our status
    let status: SubscriptionStatus;
    switch (subscription.status) {
      case 'active':
      case 'trialing':
        status = 'active';
        break;
      case 'canceled':
        status = 'cancelled';
        break;
      case 'past_due':
        status = 'past_due';
        break;
      default:
        status = 'expired';
    }

    return {
      id: subscription.id,
      status,
      plan: user.subscription.plan,
      currentPeriodStart: new Date(subscription.current_period_start * 1000),
      currentPeriodEnd: new Date(subscription.current_period_end * 1000),
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
      nextBillingDate: subscription.cancel_at_period_end
        ? undefined
        : new Date(subscription.current_period_end * 1000),
      amount: subscription.items.data[0]?.price.unit_amount || undefined,
      currency: subscription.currency.toUpperCase(),
    };
  } catch (error) {
    logger.error('Failed to get subscription details', {
      error,
      subscriptionId: user.subscription.stripeSubscriptionId,
    });
    return null;
  }
}

/**
 * Cancel subscription
 */
export async function cancelSubscription(
  user: IUser,
  immediately = false
): Promise<void> {
  if (!user.subscription.stripeSubscriptionId) {
    throw new AppError(
      'No subscription to cancel',
      400,
      ERROR_CODES.VALIDATION_ERROR
    );
  }

  const stripe = getStripe();

  if (immediately) {
    // Cancel immediately
    await stripe.subscriptions.cancel(user.subscription.stripeSubscriptionId);

    // Update user
    user.subscription.status = 'cancelled';
    user.subscription.plan = 'free';
    await user.save();
  } else {
    // Cancel at period end
    await stripe.subscriptions.update(user.subscription.stripeSubscriptionId, {
      cancel_at_period_end: true,
    });
  }

  // Invalidate cache
  await invalidateCache(`user:${user._id}`);

  logger.info('Subscription cancelled', {
    userId: user._id,
    immediately,
    subscriptionId: user.subscription.stripeSubscriptionId,
  });
}

/**
 * Resume cancelled subscription
 */
export async function resumeSubscription(user: IUser): Promise<void> {
  if (!user.subscription.stripeSubscriptionId) {
    throw new AppError(
      'No subscription to resume',
      400,
      ERROR_CODES.VALIDATION_ERROR
    );
  }

  const stripe = getStripe();

  // Get current subscription
  const subscription = await stripe.subscriptions.retrieve(
    user.subscription.stripeSubscriptionId
  );

  if (!subscription.cancel_at_period_end) {
    throw new AppError(
      'Subscription is not scheduled for cancellation',
      400,
      ERROR_CODES.VALIDATION_ERROR
    );
  }

  // Resume subscription
  await stripe.subscriptions.update(user.subscription.stripeSubscriptionId, {
    cancel_at_period_end: false,
  });

  // Invalidate cache
  await invalidateCache(`user:${user._id}`);

  logger.info('Subscription resumed', {
    userId: user._id,
    subscriptionId: user.subscription.stripeSubscriptionId,
  });
}

/**
 * Change subscription plan
 */
export async function changePlan(
  user: IUser,
  newPlan: Exclude<PlanType, 'free'>
): Promise<void> {
  if (!user.subscription.stripeSubscriptionId) {
    throw new AppError(
      'No active subscription to change',
      400,
      ERROR_CODES.VALIDATION_ERROR
    );
  }

  const stripe = getStripe();

  // Get price ID for new plan
  const priceId = config.stripe.priceIds[newPlan];
  if (!priceId) {
    throw new AppError(
      `Price not configured for plan: ${newPlan}`,
      400,
      ERROR_CODES.VALIDATION_ERROR
    );
  }

  // Get current subscription
  const subscription = await stripe.subscriptions.retrieve(
    user.subscription.stripeSubscriptionId
  );

  // Update subscription with new plan
  await stripe.subscriptions.update(user.subscription.stripeSubscriptionId, {
    items: [
      {
        id: subscription.items.data[0].id,
        price: priceId,
      },
    ],
    proration_behavior: 'create_prorations',
    metadata: {
      plan: newPlan,
    },
  });

  // Update user
  user.subscription.plan = newPlan;
  await user.save();

  // Invalidate cache
  await invalidateCache(`user:${user._id}`);

  logger.info('Plan changed', {
    userId: user._id,
    newPlan,
    subscriptionId: user.subscription.stripeSubscriptionId,
  });
}

// ============================================
// Webhook Handling
// ============================================

/**
 * Handle Stripe webhook event
 */
export async function handleWebhookEvent(
  payload: string | Buffer,
  signature: string
): Promise<{ received: boolean; type?: string }> {
  const stripe = getStripe();

  let event: Stripe.Event;

  if (!config.stripe.webhookSecret) {
    throw new AppError('Webhook secret not configured', 500, ERROR_CODES.INTERNAL_ERROR);
  }

  try {
    event = stripe.webhooks.constructEvent(
      payload,
      signature,
      config.stripe.webhookSecret
    );
  } catch (error) {
    logger.error('Webhook signature verification failed', { error });
    throw new AppError('Invalid webhook signature', 400, ERROR_CODES.VALIDATION_ERROR);
  }

  logger.info('Webhook event received', { type: event.type, id: event.id });

  switch (event.type) {
    case 'checkout.session.completed':
      await handleCheckoutComplete(event.data.object as Stripe.Checkout.Session);
      break;

    case 'customer.subscription.created':
    case 'customer.subscription.updated':
      await handleSubscriptionUpdate(event.data.object as Stripe.Subscription);
      break;

    case 'customer.subscription.deleted':
      await handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
      break;

    case 'invoice.payment_succeeded':
      await handlePaymentSucceeded(event.data.object as Stripe.Invoice);
      break;

    case 'invoice.payment_failed':
      await handlePaymentFailed(event.data.object as Stripe.Invoice);
      break;

    default:
      logger.debug('Unhandled webhook event type', { type: event.type });
  }

  return { received: true, type: event.type };
}

/**
 * Handle checkout session completion
 */
async function handleCheckoutComplete(session: Stripe.Checkout.Session): Promise<void> {
  const userId = session.metadata?.userId;
  if (!userId) {
    logger.warn('Checkout session missing userId', { sessionId: session.id });
    return;
  }

  const user = await User.findById(userId);
  if (!user) {
    logger.warn('User not found for checkout', { userId });
    return;
  }

  const plan = session.metadata?.plan as PlanType;
  const subscriptionId = session.subscription as string;

  // Update user subscription
  user.subscription.plan = plan || 'starter';
  user.subscription.status = 'active';
  user.subscription.stripeSubscriptionId = subscriptionId;

  await user.save();

  // Invalidate cache
  await invalidateCache(`user:${userId}`);

  logger.info('Checkout completed', {
    userId,
    plan,
    subscriptionId,
  });
}

/**
 * Handle subscription update
 */
async function handleSubscriptionUpdate(subscription: Stripe.Subscription): Promise<void> {
  const userId = subscription.metadata?.userId;
  if (!userId) {
    logger.warn('Subscription missing userId', { subscriptionId: subscription.id });
    return;
  }

  const user = await User.findById(userId);
  if (!user) {
    logger.warn('User not found for subscription update', { userId });
    return;
  }

  // Map Stripe status to our status
  let status: SubscriptionStatus;
  switch (subscription.status) {
    case 'active':
    case 'trialing':
      status = 'active';
      break;
    case 'canceled':
      status = 'cancelled';
      break;
    case 'past_due':
      status = 'past_due';
      break;
    default:
      status = 'expired';
  }

  // Update user subscription
  user.subscription.status = status;
  user.subscription.currentPeriodStart = new Date(subscription.current_period_start * 1000);
  user.subscription.currentPeriodEnd = new Date(subscription.current_period_end * 1000);

  // Update plan if specified
  if (subscription.metadata?.plan) {
    user.subscription.plan = subscription.metadata.plan as PlanType;
  }

  await user.save();

  // Invalidate cache
  await invalidateCache(`user:${userId}`);

  logger.info('Subscription updated', {
    userId,
    status,
    plan: user.subscription.plan,
  });
}

/**
 * Handle subscription deletion
 */
async function handleSubscriptionDeleted(subscription: Stripe.Subscription): Promise<void> {
  const userId = subscription.metadata?.userId;
  if (!userId) {
    logger.warn('Subscription missing userId', { subscriptionId: subscription.id });
    return;
  }

  const user = await User.findById(userId);
  if (!user) {
    logger.warn('User not found for subscription deletion', { userId });
    return;
  }

  // Downgrade to free plan
  user.subscription.status = 'cancelled';
  user.subscription.plan = 'free';
  user.subscription.stripeSubscriptionId = undefined;

  await user.save();

  // Invalidate cache
  await invalidateCache(`user:${userId}`);

  logger.info('Subscription deleted', { userId });
}

/**
 * Handle successful payment
 */
async function handlePaymentSucceeded(invoice: Stripe.Invoice): Promise<void> {
  const customerId = invoice.customer as string;

  // Find user by customer ID
  const user = await User.findOne({
    'subscription.stripeCustomerId': customerId,
  });

  if (!user) {
    logger.warn('User not found for payment success', { customerId });
    return;
  }

  // Ensure status is active
  if (user.subscription.status !== 'active') {
    user.subscription.status = 'active';
    await user.save();
    await invalidateCache(`user:${user._id}`);
  }

  logger.info('Payment succeeded', {
    userId: user._id,
    amount: invoice.amount_paid,
  });
}

/**
 * Handle failed payment
 */
async function handlePaymentFailed(invoice: Stripe.Invoice): Promise<void> {
  const customerId = invoice.customer as string;

  // Find user by customer ID
  const user = await User.findOne({
    'subscription.stripeCustomerId': customerId,
  });

  if (!user) {
    logger.warn('User not found for payment failure', { customerId });
    return;
  }

  // Update status to past_due
  user.subscription.status = 'past_due';
  await user.save();

  // Invalidate cache
  await invalidateCache(`user:${user._id}`);

  logger.warn('Payment failed', {
    userId: user._id,
    amount: invoice.amount_due,
  });

  // TODO: Send email notification to user
}

// ============================================
// Usage Statistics
// ============================================

/**
 * Get usage statistics for user
 */
export async function getUsageStats(user: IUser): Promise<UsageStatsDTO> {
  const planLimits = user.getPlanLimits();
  const usage = user.usage;

  // Calculate days until reset
  const now = new Date();
  const lastReset = new Date(usage.lastResetDate);
  const nextReset = new Date(lastReset);
  nextReset.setMonth(nextReset.getMonth() + 1);
  const daysUntilReset = Math.ceil(
    (nextReset.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
  );

  return {
    currentPlan: user.subscription.plan,
    screenshotsUsed: usage.screenshotsThisMonth,
    screenshotsLimit: planLimits.screenshotsPerMonth,
    percentageUsed:
      planLimits.screenshotsPerMonth > 0
        ? Math.round((usage.screenshotsThisMonth / planLimits.screenshotsPerMonth) * 100)
        : 0,
    daysUntilReset: Math.max(0, daysUntilReset),
    currentPeriodStart: user.subscription.currentPeriodStart,
    currentPeriodEnd: user.subscription.currentPeriodEnd,
  };
}

/**
 * Get available plans with pricing
 */
export function getAvailablePlans(): Array<{
  plan: PlanType;
  name: string;
  description: string;
  price: number;
  screenshotsPerMonth: number;
  priceId?: string;
}> {
  return Object.entries(PLAN_FEATURES).map(([plan, features]) => ({
    plan: plan as PlanType,
    ...features,
    priceId: plan !== 'free' ? config.stripe.priceIds[plan as Exclude<PlanType, 'free'>] : undefined,
  }));
}

// ============================================
// Export
// ============================================

export default {
  getOrCreateCustomer,
  updateCustomerEmail,
  createCheckoutSession,
  createPortalSession,
  getSubscriptionDetails,
  cancelSubscription,
  resumeSubscription,
  changePlan,
  handleWebhookEvent,
  getUsageStats,
  getAvailablePlans,
};
