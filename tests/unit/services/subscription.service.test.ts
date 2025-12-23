/**
 * Subscription Service Tests
 */

// Set environment variables before any imports
process.env.JWT_SECRET = 'test-jwt-secret-key-minimum-32-characters-long';
process.env.JWT_REFRESH_SECRET = 'test-jwt-refresh-secret-key-minimum-32-chars';
process.env.NODE_ENV = 'test';
process.env.STRIPE_SECRET_KEY = 'sk_test_mock_key';
process.env.STRIPE_WEBHOOK_SECRET = 'whsec_test_mock_secret';

import { Types } from 'mongoose';
import { getAvailablePlans, getUsageStats } from '@services/subscription.service';
import { IUser, PlanLimits, PlanType } from '@/types';

// ============================================
// Mock User Factory
// ============================================

const createMockUser = (
  overrides: Partial<{
    plan: PlanType;
    usage: { screenshotsThisMonth: number; lastResetDate: Date };
    subscription: Partial<{
      plan: PlanType;
      status: 'active' | 'cancelled' | 'expired' | 'past_due';
      stripeCustomerId?: string;
      stripeSubscriptionId?: string;
      currentPeriodStart?: Date;
      currentPeriodEnd?: Date;
    }>;
  }> = {}
): IUser => {
  const defaultLimits: PlanLimits = {
    screenshotsPerMonth: 100,
    maxWidth: 1280,
    maxHeight: 720,
    formats: ['png', 'jpeg'],
    rateLimit: 10,
    fullPage: false,
    customHeaders: false,
    webhooks: false,
    priority: false,
  };

  const now = new Date();
  const lastResetDate = overrides.usage?.lastResetDate || now;

  return {
    _id: new Types.ObjectId(),
    email: 'test@example.com',
    password: 'hashed',
    name: 'Test User',
    isVerified: true,
    isActive: true,
    role: 'user',
    subscription: {
      plan: overrides.subscription?.plan || overrides.plan || 'free',
      status: overrides.subscription?.status || 'active',
      stripeCustomerId: overrides.subscription?.stripeCustomerId,
      stripeSubscriptionId: overrides.subscription?.stripeSubscriptionId,
      currentPeriodStart: overrides.subscription?.currentPeriodStart,
      currentPeriodEnd: overrides.subscription?.currentPeriodEnd,
    },
    usage: {
      screenshotsThisMonth: overrides.usage?.screenshotsThisMonth ?? 0,
      lastResetDate,
    },
    refreshTokens: [],
    createdAt: new Date(),
    updatedAt: new Date(),
    comparePassword: jest.fn(),
    incrementUsage: jest.fn(),
    resetMonthlyUsage: jest.fn(),
    getPlanLimits: jest.fn().mockReturnValue(defaultLimits),
  } as unknown as IUser;
};

describe('Subscription Service', () => {
  // ============================================
  // Available Plans Tests
  // ============================================

  describe('getAvailablePlans', () => {
    it('should return all available plans', () => {
      const plans = getAvailablePlans();

      expect(plans).toHaveLength(4);
      expect(plans.map((p) => p.plan)).toEqual(['free', 'starter', 'professional', 'enterprise']);
    });

    it('should include correct free plan details', () => {
      const plans = getAvailablePlans();
      const freePlan = plans.find((p) => p.plan === 'free');

      expect(freePlan).toBeDefined();
      expect(freePlan!.price).toBe(0);
      expect(freePlan!.screenshotsPerMonth).toBe(100);
      expect(freePlan!.priceId).toBeUndefined();
    });

    it('should include correct starter plan details', () => {
      const plans = getAvailablePlans();
      const starterPlan = plans.find((p) => p.plan === 'starter');

      expect(starterPlan).toBeDefined();
      expect(starterPlan!.price).toBe(1900); // $19.00
      expect(starterPlan!.screenshotsPerMonth).toBe(2000);
    });

    it('should include correct professional plan details', () => {
      const plans = getAvailablePlans();
      const proPlan = plans.find((p) => p.plan === 'professional');

      expect(proPlan).toBeDefined();
      expect(proPlan!.price).toBe(4900); // $49.00
      expect(proPlan!.screenshotsPerMonth).toBe(10000);
    });

    it('should include correct enterprise plan details', () => {
      const plans = getAvailablePlans();
      const enterprisePlan = plans.find((p) => p.plan === 'enterprise');

      expect(enterprisePlan).toBeDefined();
      expect(enterprisePlan!.price).toBe(14900); // $149.00
      expect(enterprisePlan!.screenshotsPerMonth).toBe(50000);
    });

    it('should include name and description for each plan', () => {
      const plans = getAvailablePlans();

      for (const plan of plans) {
        expect(plan.name).toBeDefined();
        expect(plan.name.length).toBeGreaterThan(0);
        expect(plan.description).toBeDefined();
        expect(plan.description.length).toBeGreaterThan(0);
      }
    });
  });

  // ============================================
  // Usage Stats Tests
  // ============================================

  describe('getUsageStats', () => {
    it('should return correct usage stats for user with no usage', async () => {
      const user = createMockUser({
        plan: 'free',
        usage: { screenshotsThisMonth: 0, lastResetDate: new Date() },
      });

      const stats = await getUsageStats(user);

      expect(stats.currentPlan).toBe('free');
      expect(stats.screenshotsUsed).toBe(0);
      expect(stats.screenshotsLimit).toBe(100);
      expect(stats.percentageUsed).toBe(0);
    });

    it('should calculate percentage used correctly', async () => {
      const user = createMockUser({
        plan: 'starter',
        usage: { screenshotsThisMonth: 500, lastResetDate: new Date() },
      });
      // Override getPlanLimits for starter plan
      user.getPlanLimits = jest.fn().mockReturnValue({
        screenshotsPerMonth: 2000,
        maxWidth: 1920,
        maxHeight: 1080,
        formats: ['png', 'jpeg', 'webp'],
        rateLimit: 30,
        fullPage: true,
        customHeaders: true,
        webhooks: true,
        priority: false,
      });
      user.subscription.plan = 'starter';

      const stats = await getUsageStats(user);

      expect(stats.screenshotsUsed).toBe(500);
      expect(stats.screenshotsLimit).toBe(2000);
      expect(stats.percentageUsed).toBe(25);
    });

    it('should calculate days until reset correctly', async () => {
      const now = new Date();
      const lastResetDate = new Date(now);
      lastResetDate.setDate(1); // First of current month

      const user = createMockUser({
        usage: { screenshotsThisMonth: 50, lastResetDate },
      });

      const stats = await getUsageStats(user);

      // Days until reset should be positive and less than or equal to 31
      expect(stats.daysUntilReset).toBeGreaterThanOrEqual(0);
      expect(stats.daysUntilReset).toBeLessThanOrEqual(31);
    });

    it('should return current plan', async () => {
      const user = createMockUser({
        subscription: { plan: 'professional', status: 'active' },
      });

      const stats = await getUsageStats(user);

      expect(stats.currentPlan).toBe('professional');
    });

    it('should handle zero limit gracefully', async () => {
      const user = createMockUser({
        usage: { screenshotsThisMonth: 10, lastResetDate: new Date() },
      });
      // Override with zero limit
      user.getPlanLimits = jest.fn().mockReturnValue({
        screenshotsPerMonth: 0,
        maxWidth: 1280,
        maxHeight: 720,
        formats: ['png'],
        rateLimit: 10,
        fullPage: false,
        customHeaders: false,
        webhooks: false,
        priority: false,
      });

      const stats = await getUsageStats(user);

      expect(stats.percentageUsed).toBe(0);
    });

    it('should include subscription period dates', async () => {
      const now = new Date();
      const periodStart = new Date(now);
      periodStart.setDate(1);
      const periodEnd = new Date(now);
      periodEnd.setMonth(periodEnd.getMonth() + 1);
      periodEnd.setDate(0);

      const user = createMockUser({
        subscription: {
          plan: 'starter',
          status: 'active',
          currentPeriodStart: periodStart,
          currentPeriodEnd: periodEnd,
        },
      });

      const stats = await getUsageStats(user);

      expect(stats.currentPeriodStart).toEqual(periodStart);
      expect(stats.currentPeriodEnd).toEqual(periodEnd);
    });
  });

  // ============================================
  // Plan Pricing Tests
  // ============================================

  describe('Plan Pricing', () => {
    it('should have incrementing prices for plans', () => {
      const plans = getAvailablePlans();

      const freePrice = plans.find((p) => p.plan === 'free')!.price;
      const starterPrice = plans.find((p) => p.plan === 'starter')!.price;
      const proPrice = plans.find((p) => p.plan === 'professional')!.price;
      const enterprisePrice = plans.find((p) => p.plan === 'enterprise')!.price;

      expect(freePrice).toBeLessThan(starterPrice);
      expect(starterPrice).toBeLessThan(proPrice);
      expect(proPrice).toBeLessThan(enterprisePrice);
    });

    it('should have incrementing screenshot limits for plans', () => {
      const plans = getAvailablePlans();

      const freeLimit = plans.find((p) => p.plan === 'free')!.screenshotsPerMonth;
      const starterLimit = plans.find((p) => p.plan === 'starter')!.screenshotsPerMonth;
      const proLimit = plans.find((p) => p.plan === 'professional')!.screenshotsPerMonth;
      const enterpriseLimit = plans.find((p) => p.plan === 'enterprise')!.screenshotsPerMonth;

      expect(freeLimit).toBeLessThan(starterLimit);
      expect(starterLimit).toBeLessThan(proLimit);
      expect(proLimit).toBeLessThan(enterpriseLimit);
    });
  });
});
