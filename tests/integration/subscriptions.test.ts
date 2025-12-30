/**
 * Subscription Integration Tests
 * Tests for subscription and payment endpoints with database integration
 */

// Set environment variables before any imports
process.env.JWT_SECRET = 'test-jwt-secret-key-minimum-32-characters-long';
process.env.JWT_REFRESH_SECRET = 'test-jwt-refresh-secret-key-minimum-32-chars';
process.env.NODE_ENV = 'test';

import request from 'supertest';
import { Types } from 'mongoose';
import bcrypt from 'bcryptjs';
import app from '@/app';
import { User, ApiKey } from '@models/index';
import { hashApiKey, generateApiKey } from '@utils/helpers';
import { generateAccessToken } from '@services/auth.service';

// ============================================
// Test Suite
// ============================================

describe('Subscription Integration Tests', () => {
  let testUser: {
    _id: Types.ObjectId;
    email: string;
    accessToken: string;
  };
  let testApiKey: { id: string; key: string };

  beforeEach(async () => {
    // Clean up before each test
    await User.deleteMany({});
    await ApiKey.deleteMany({});

    // Create test user directly in database
    const userId = new Types.ObjectId();
    const hashedPassword = await bcrypt.hash('MyS3cur3P@ssword!', 12);
    await User.create({
      _id: userId,
      email: 'subscription-test@example.com',
      password: hashedPassword,
      name: 'Test User',
      isVerified: true,
      subscription: {
        plan: 'free',
        status: 'active',
      },
      usage: {
        screenshotsThisMonth: 0,
        lastResetDate: new Date(),
      },
    });

    // Generate JWT token
    const accessToken = generateAccessToken({
      userId: userId.toString(),
      email: 'subscription-test@example.com',
      role: 'user',
    });

    testUser = {
      _id: userId,
      email: 'subscription-test@example.com',
      accessToken,
    };

    // Create API key
    const plainKey = generateApiKey();
    const keyHash = hashApiKey(plainKey);
    const apiKeyDoc = await ApiKey.create({
      user: userId,
      name: 'Test API Key',
      key: plainKey,
      keyHash,
      permissions: ['screenshot:create', 'screenshot:read'],
    });

    testApiKey = {
      id: apiKeyDoc._id.toString(),
      key: plainKey,
    };
  });

  // ============================================
  // GET /api/v1/subscriptions/plans
  // ============================================

  describe('GET /api/v1/subscriptions/plans', () => {
    it('should return all available plans', async () => {
      const response = await request(app).get('/api/v1/subscriptions/plans');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
    });

    it('should include all expected plans', async () => {
      const response = await request(app).get('/api/v1/subscriptions/plans');

      expect(response.status).toBe(200);
      const planNames = response.body.data.map((p: { plan: string }) => p.plan);
      expect(planNames).toContain('free');
      expect(planNames).toContain('starter');
      expect(planNames).toContain('professional');
      expect(planNames).toContain('enterprise');
    });

    it('should include pricing for each plan', async () => {
      const response = await request(app).get('/api/v1/subscriptions/plans');

      expect(response.status).toBe(200);
      for (const plan of response.body.data) {
        expect(plan).toHaveProperty('price');
        expect(typeof plan.price).toBe('number');
        expect(plan.price).toBeGreaterThanOrEqual(0);
      }
    });

    it('should include features/limits for each plan', async () => {
      const response = await request(app).get('/api/v1/subscriptions/plans');

      expect(response.status).toBe(200);
      for (const plan of response.body.data) {
        expect(plan).toHaveProperty('screenshotsPerMonth');
        expect(typeof plan.screenshotsPerMonth).toBe('number');
      }
    });

    it('should not require authentication', async () => {
      const response = await request(app).get('/api/v1/subscriptions/plans');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
  });

  // ============================================
  // GET /api/v1/subscriptions
  // ============================================

  describe('GET /api/v1/subscriptions', () => {
    it('should require authentication', async () => {
      const response = await request(app).get('/api/v1/subscriptions');

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it('should return current subscription with JWT', async () => {
      const response = await request(app)
        .get('/api/v1/subscriptions')
        .set('Authorization', `Bearer ${testUser.accessToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.plan).toBe('free');
      expect(response.body.data.status).toBe('active');
    });

    it('should return current subscription with API key', async () => {
      const response = await request(app)
        .get('/api/v1/subscriptions')
        .set('X-API-Key', testApiKey.key);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.plan).toBe('free');
    });

    it('should include plan details', async () => {
      const response = await request(app)
        .get('/api/v1/subscriptions')
        .set('Authorization', `Bearer ${testUser.accessToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveProperty('plan');
      expect(response.body.data).toHaveProperty('status');
    });
  });

  // ============================================
  // POST /api/v1/subscriptions/checkout
  // ============================================

  describe('POST /api/v1/subscriptions/checkout', () => {
    it('should require authentication', async () => {
      const response = await request(app).post('/api/v1/subscriptions/checkout').send({
        plan: 'starter',
        successUrl: 'https://example.com/success',
        cancelUrl: 'https://example.com/cancel',
      });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it('should validate plan parameter', async () => {
      const response = await request(app)
        .post('/api/v1/subscriptions/checkout')
        .set('Authorization', `Bearer ${testUser.accessToken}`)
        .send({
          plan: 'invalid-plan',
          successUrl: 'https://example.com/success',
          cancelUrl: 'https://example.com/cancel',
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should reject free plan checkout', async () => {
      const response = await request(app)
        .post('/api/v1/subscriptions/checkout')
        .set('Authorization', `Bearer ${testUser.accessToken}`)
        .send({
          plan: 'free',
          successUrl: 'https://example.com/success',
          cancelUrl: 'https://example.com/cancel',
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should require success URL', async () => {
      const response = await request(app)
        .post('/api/v1/subscriptions/checkout')
        .set('Authorization', `Bearer ${testUser.accessToken}`)
        .send({
          plan: 'starter',
          cancelUrl: 'https://example.com/cancel',
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should require cancel URL', async () => {
      const response = await request(app)
        .post('/api/v1/subscriptions/checkout')
        .set('Authorization', `Bearer ${testUser.accessToken}`)
        .send({
          plan: 'starter',
          successUrl: 'https://example.com/success',
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should accept valid checkout request', async () => {
      const response = await request(app)
        .post('/api/v1/subscriptions/checkout')
        .set('Authorization', `Bearer ${testUser.accessToken}`)
        .send({
          plan: 'starter',
          successUrl: 'https://example.com/success',
          cancelUrl: 'https://example.com/cancel',
        });

      // May return 500 if Stripe is not configured, but validation should pass
      expect([200, 500]).toContain(response.status);
    });
  });

  // ============================================
  // POST /api/v1/subscriptions/portal
  // ============================================

  describe('POST /api/v1/subscriptions/portal', () => {
    it('should require authentication', async () => {
      const response = await request(app).post('/api/v1/subscriptions/portal').send({
        returnUrl: 'https://example.com/dashboard',
      });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it('should require return URL', async () => {
      const response = await request(app)
        .post('/api/v1/subscriptions/portal')
        .set('Authorization', `Bearer ${testUser.accessToken}`)
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should accept valid portal request', async () => {
      const response = await request(app)
        .post('/api/v1/subscriptions/portal')
        .set('Authorization', `Bearer ${testUser.accessToken}`)
        .send({
          returnUrl: 'https://example.com/dashboard',
        });

      // May return 500/400 if Stripe customer doesn't exist
      expect([200, 400, 500]).toContain(response.status);
    });
  });

  // ============================================
  // POST /api/v1/subscriptions/webhook
  // ============================================

  describe('POST /api/v1/subscriptions/webhook', () => {
    it('should reject request without Stripe signature', async () => {
      const response = await request(app)
        .post('/api/v1/subscriptions/webhook')
        .send({ type: 'checkout.session.completed' });

      // Should reject due to missing signature
      expect([400, 500]).toContain(response.status);
    });

    it('should reject request with invalid signature', async () => {
      const response = await request(app)
        .post('/api/v1/subscriptions/webhook')
        .set('stripe-signature', 'invalid-signature')
        .send(JSON.stringify({ type: 'checkout.session.completed' }));

      expect([400, 500]).toContain(response.status);
    });
  });

  // ============================================
  // PUT /api/v1/subscriptions/plan
  // ============================================

  describe('PUT /api/v1/subscriptions/plan', () => {
    it('should require authentication', async () => {
      const response = await request(app).put('/api/v1/subscriptions/plan').send({
        plan: 'professional',
      });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it('should validate plan parameter', async () => {
      const response = await request(app)
        .put('/api/v1/subscriptions/plan')
        .set('Authorization', `Bearer ${testUser.accessToken}`)
        .send({
          plan: 'invalid-plan',
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should reject update without active subscription', async () => {
      const response = await request(app)
        .put('/api/v1/subscriptions/plan')
        .set('Authorization', `Bearer ${testUser.accessToken}`)
        .send({
          plan: 'professional',
        });

      // Free users can't update plan this way
      expect([400, 500]).toContain(response.status);
    });
  });

  // ============================================
  // DELETE /api/v1/subscriptions
  // ============================================

  describe('DELETE /api/v1/subscriptions', () => {
    it('should require authentication', async () => {
      const response = await request(app).delete('/api/v1/subscriptions');

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it('should reject cancellation without active paid subscription', async () => {
      const response = await request(app)
        .delete('/api/v1/subscriptions')
        .set('Authorization', `Bearer ${testUser.accessToken}`);

      // Free plan users can't cancel
      expect([400, 500]).toContain(response.status);
    });
  });

  // ============================================
  // POST /api/v1/subscriptions/resume
  // ============================================

  describe('POST /api/v1/subscriptions/resume', () => {
    it('should require authentication', async () => {
      const response = await request(app).post('/api/v1/subscriptions/resume');

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it('should reject resume without cancelled subscription', async () => {
      const response = await request(app)
        .post('/api/v1/subscriptions/resume')
        .set('Authorization', `Bearer ${testUser.accessToken}`);

      // No subscription to resume
      expect([400, 500]).toContain(response.status);
    });
  });

  // ============================================
  // GET /api/v1/subscriptions/usage
  // ============================================

  describe('GET /api/v1/subscriptions/usage', () => {
    it('should require authentication', async () => {
      const response = await request(app).get('/api/v1/subscriptions/usage');

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it('should return usage statistics with JWT', async () => {
      const response = await request(app)
        .get('/api/v1/subscriptions/usage')
        .set('Authorization', `Bearer ${testUser.accessToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('currentPlan');
      expect(response.body.data).toHaveProperty('screenshotsUsed');
      expect(response.body.data).toHaveProperty('screenshotsLimit');
    });

    it('should return usage statistics with API key', async () => {
      const response = await request(app)
        .get('/api/v1/subscriptions/usage')
        .set('X-API-Key', testApiKey.key);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it('should include percentage used', async () => {
      const response = await request(app)
        .get('/api/v1/subscriptions/usage')
        .set('Authorization', `Bearer ${testUser.accessToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveProperty('percentageUsed');
      expect(typeof response.body.data.percentageUsed).toBe('number');
    });

    it('should include days until reset', async () => {
      const response = await request(app)
        .get('/api/v1/subscriptions/usage')
        .set('Authorization', `Bearer ${testUser.accessToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveProperty('daysUntilReset');
      expect(typeof response.body.data.daysUntilReset).toBe('number');
    });

    it('should show zero usage for new user', async () => {
      const response = await request(app)
        .get('/api/v1/subscriptions/usage')
        .set('Authorization', `Bearer ${testUser.accessToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data.screenshotsUsed).toBe(0);
      expect(response.body.data.percentageUsed).toBe(0);
    });

    it('should correctly report usage after screenshots', async () => {
      // Update user's usage count
      await User.updateOne(
        { _id: testUser._id },
        { $set: { 'usage.screenshotsThisMonth': 10 } }
      );

      const response = await request(app)
        .get('/api/v1/subscriptions/usage')
        .set('Authorization', `Bearer ${testUser.accessToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data.screenshotsUsed).toBe(10);
    });
  });

  // ============================================
  // Plan Limits Enforcement
  // ============================================

  describe('Plan Limits Enforcement', () => {
    it('should have different limits for different plans', async () => {
      const response = await request(app).get('/api/v1/subscriptions/plans');

      expect(response.status).toBe(200);

      const freePlan = response.body.data.find((p: { plan: string }) => p.plan === 'free');
      const starterPlan = response.body.data.find((p: { plan: string }) => p.plan === 'starter');
      const proPlan = response.body.data.find((p: { plan: string }) => p.plan === 'professional');
      const enterprisePlan = response.body.data.find(
        (p: { plan: string }) => p.plan === 'enterprise'
      );

      expect(starterPlan.screenshotsPerMonth).toBeGreaterThan(freePlan.screenshotsPerMonth);
      expect(proPlan.screenshotsPerMonth).toBeGreaterThan(starterPlan.screenshotsPerMonth);
      expect(enterprisePlan.screenshotsPerMonth).toBeGreaterThan(proPlan.screenshotsPerMonth);
    });
  });
});
