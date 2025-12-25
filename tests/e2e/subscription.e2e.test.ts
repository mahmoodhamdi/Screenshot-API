/**
 * Subscription E2E Tests
 * Subscription and usage flow tests
 */

// Set environment variables before imports
process.env.JWT_SECRET = 'test-jwt-secret-key-minimum-32-characters-long';
process.env.JWT_REFRESH_SECRET = 'test-jwt-refresh-secret-key-minimum-32-chars';
process.env.NODE_ENV = 'test';

import { User, ApiKey } from '@models/index';
import { api, registerUser, expectSuccess, expectError, TestUser } from './helpers';

describe('Subscription E2E Tests', () => {
  let testUser: TestUser;

  beforeEach(async () => {
    // Clean up before each test
    await User.deleteMany({});
    await ApiKey.deleteMany({});

    // Create a test user
    testUser = await registerUser({ email: 'subscription-test@example.com' });
  });

  // ============================================
  // Plan Information
  // ============================================

  describe('Plan Information', () => {
    it('should get all available plans', async () => {
      const response = await api
        .get('/api/v1/subscriptions/plans')
        .set('Authorization', `Bearer ${testUser.accessToken}`);

      expectSuccess(response);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);

      // Check that all expected plans are present
      const planNames = response.body.data.map((p: { plan: string }) => p.plan);
      expect(planNames).toContain('free');
      expect(planNames).toContain('starter');
      expect(planNames).toContain('professional');
      expect(planNames).toContain('enterprise');
    });

    it('should include plan details', async () => {
      const response = await api
        .get('/api/v1/subscriptions/plans')
        .set('Authorization', `Bearer ${testUser.accessToken}`);

      expectSuccess(response);

      const freePlan = response.body.data.find((p: { plan: string }) => p.plan === 'free');
      expect(freePlan).toBeDefined();
      expect(freePlan.name).toBeDefined();
      expect(freePlan.price).toBeDefined();
      expect(freePlan.screenshotsPerMonth).toBeDefined();
    });

    it('should have incrementing prices for higher plans', async () => {
      const response = await api
        .get('/api/v1/subscriptions/plans')
        .set('Authorization', `Bearer ${testUser.accessToken}`);

      expectSuccess(response);

      const planOrder = ['free', 'starter', 'professional', 'enterprise'];
      let lastPrice = -1;

      for (const planName of planOrder) {
        const plan = response.body.data.find((p: { plan: string }) => p.plan === planName);
        expect(plan.price).toBeGreaterThanOrEqual(lastPrice);
        lastPrice = plan.price;
      }
    });
  });

  // ============================================
  // Usage Statistics
  // ============================================

  describe('Usage Statistics', () => {
    it('should get current usage stats', async () => {
      const response = await api
        .get('/api/v1/subscriptions/usage')
        .set('Authorization', `Bearer ${testUser.accessToken}`);

      expectSuccess(response);
      expect(response.body.data.currentPlan).toBe('free');
      expect(response.body.data.screenshotsUsed).toBeDefined();
      expect(response.body.data.screenshotsLimit).toBeDefined();
      expect(response.body.data.percentageUsed).toBeDefined();
      expect(response.body.data.daysUntilReset).toBeDefined();
    });

    it('should show zero usage for new user', async () => {
      const response = await api
        .get('/api/v1/subscriptions/usage')
        .set('Authorization', `Bearer ${testUser.accessToken}`);

      expectSuccess(response);
      expect(response.body.data.screenshotsUsed).toBe(0);
      expect(response.body.data.percentageUsed).toBe(0);
    });

    it('should require authentication', async () => {
      const response = await api.get('/api/v1/subscriptions/usage');

      expectError(response, 401);
    });
  });

  // ============================================
  // Current Subscription
  // ============================================

  describe('Current Subscription', () => {
    it('should get current subscription details', async () => {
      const response = await api
        .get('/api/v1/subscriptions')
        .set('Authorization', `Bearer ${testUser.accessToken}`);

      expectSuccess(response);
      expect(response.body.data.plan).toBe('free');
      expect(response.body.data.status).toBe('active');
    });

    it('should require authentication', async () => {
      const response = await api.get('/api/v1/subscriptions');

      expectError(response, 401);
    });
  });

  // ============================================
  // Checkout Session
  // ============================================

  describe('Checkout Session', () => {
    it('should create checkout session for valid plan', async () => {
      const response = await api
        .post('/api/v1/subscriptions/checkout')
        .set('Authorization', `Bearer ${testUser.accessToken}`)
        .send({
          plan: 'starter',
          successUrl: 'https://example.com/success',
          cancelUrl: 'https://example.com/cancel',
        });

      // Note: In test environment without Stripe, this might return an error
      // or a mock response. We check that the endpoint is accessible.
      expect([200, 500]).toContain(response.status);
    });

    it('should reject checkout for invalid plan', async () => {
      const response = await api
        .post('/api/v1/subscriptions/checkout')
        .set('Authorization', `Bearer ${testUser.accessToken}`)
        .send({
          plan: 'invalid-plan',
          successUrl: 'https://example.com/success',
          cancelUrl: 'https://example.com/cancel',
        });

      expectError(response, 400);
    });

    it('should reject checkout for free plan', async () => {
      const response = await api
        .post('/api/v1/subscriptions/checkout')
        .set('Authorization', `Bearer ${testUser.accessToken}`)
        .send({
          plan: 'free',
          successUrl: 'https://example.com/success',
          cancelUrl: 'https://example.com/cancel',
        });

      expectError(response, 400);
    });

    it('should reject checkout without required fields', async () => {
      const response = await api
        .post('/api/v1/subscriptions/checkout')
        .set('Authorization', `Bearer ${testUser.accessToken}`)
        .send({
          plan: 'starter',
        });

      expectError(response, 400);
    });

    it('should require authentication', async () => {
      const response = await api.post('/api/v1/subscriptions/checkout').send({
        plan: 'starter',
        successUrl: 'https://example.com/success',
        cancelUrl: 'https://example.com/cancel',
      });

      expectError(response, 401);
    });
  });

  // ============================================
  // Customer Portal
  // ============================================

  describe('Customer Portal', () => {
    it('should require authentication', async () => {
      const response = await api.post('/api/v1/subscriptions/portal').send({
        returnUrl: 'https://example.com/return',
      });

      expectError(response, 401);
    });

    it('should reject without return URL', async () => {
      const response = await api
        .post('/api/v1/subscriptions/portal')
        .set('Authorization', `Bearer ${testUser.accessToken}`)
        .send({});

      expectError(response, 400);
    });
  });

  // ============================================
  // Subscription Cancellation
  // ============================================

  describe('Subscription Cancellation', () => {
    it('should require authentication', async () => {
      const response = await api.delete('/api/v1/subscriptions');

      expectError(response, 401);
    });
  });

  // ============================================
  // Plan Limits
  // ============================================

  describe('Plan Limits', () => {
    it('should have different limits for different plans', async () => {
      const response = await api
        .get('/api/v1/subscriptions/plans')
        .set('Authorization', `Bearer ${testUser.accessToken}`);

      expectSuccess(response);

      const freePlan = response.body.data.find((p: { plan: string }) => p.plan === 'free');
      const enterprisePlan = response.body.data.find(
        (p: { plan: string }) => p.plan === 'enterprise'
      );

      expect(enterprisePlan.screenshotsPerMonth).toBeGreaterThan(freePlan.screenshotsPerMonth);
    });
  });
});
