/**
 * Analytics Integration Tests
 * Tests for analytics endpoints with database integration
 */

// Set environment variables before any imports
process.env.JWT_SECRET = 'test-jwt-secret-key-minimum-32-characters-long';
process.env.JWT_REFRESH_SECRET = 'test-jwt-refresh-secret-key-minimum-32-chars';
process.env.NODE_ENV = 'test';

import request from 'supertest';
import { Types } from 'mongoose';
import bcrypt from 'bcryptjs';
import app from '@/app';
import { User, ApiKey, Screenshot } from '@models/index';
import { hashApiKey, generateApiKey } from '@utils/helpers';
import { generateAccessToken } from '@services/auth.service';

// ============================================
// Test Helpers
// ============================================

let currentApiKeyId: Types.ObjectId;

async function createTestScreenshot(
  userId: string,
  options: { url?: string; format?: string; width?: number; height?: number; fullPage?: boolean } = {},
  result: { status?: string; url?: string; error?: string; size?: number; duration?: number } = {},
  createdAt?: Date
) {
  const url = options.url || 'https://example.com';
  const screenshot = await Screenshot.create({
    user: userId,
    apiKey: currentApiKeyId,
    url,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    options: {
      width: options.width || 1280,
      height: options.height || 720,
      format: options.format || 'png',
      fullPage: options.fullPage || false,
    },
    result: {
      status: result.status || 'completed',
      url: result.url || 'https://storage.example.com/test.png',
      size: result.size || 12345,
      duration: result.duration || 2500,
      error: result.error,
    },
  });

  if (createdAt) {
    await Screenshot.updateOne({ _id: screenshot._id }, { $set: { createdAt } });
  }

  return screenshot;
}

// ============================================
// Test Suite
// ============================================

describe('Analytics Integration Tests', () => {
  let testUser: {
    _id: Types.ObjectId;
    email: string;
    accessToken: string;
  };
  let testApiKey: { id: string; key: string };
  let otherUser: { _id: Types.ObjectId };

  beforeEach(async () => {
    // Clean up before each test
    await User.deleteMany({});
    await ApiKey.deleteMany({});
    await Screenshot.deleteMany({});

    // Create test user directly in database
    const userId = new Types.ObjectId();
    const hashedPassword = await bcrypt.hash('MyS3cur3P@ssword!', 12);
    await User.create({
      _id: userId,
      email: 'analytics-test@example.com',
      password: hashedPassword,
      name: 'Test User',
      isVerified: true,
      subscription: { plan: 'free', status: 'active' },
    });

    // Generate JWT token
    const accessToken = generateAccessToken({
      userId: userId.toString(),
      email: 'analytics-test@example.com',
      role: 'user',
    });

    testUser = {
      _id: userId,
      email: 'analytics-test@example.com',
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

    currentApiKeyId = apiKeyDoc._id;

    // Create other user
    const otherUserId = new Types.ObjectId();
    await User.create({
      _id: otherUserId,
      email: 'other@example.com',
      password: hashedPassword,
      name: 'Other User',
      isVerified: true,
      subscription: { plan: 'free', status: 'active' },
    });

    otherUser = { _id: otherUserId };
  });

  // ============================================
  // GET /api/v1/analytics/overview
  // ============================================

  describe('GET /api/v1/analytics/overview', () => {
    beforeEach(async () => {
      // Create test screenshots
      await createTestScreenshot(testUser._id.toString(), { format: 'png' }, { size: 10000, duration: 2000 });
      await createTestScreenshot(testUser._id.toString(), { format: 'png' }, { size: 15000, duration: 2500 });
      await createTestScreenshot(testUser._id.toString(), { format: 'jpeg' }, { size: 8000, duration: 1500 });
      await createTestScreenshot(testUser._id.toString(), {}, { status: 'failed', error: 'Timeout' });
    });

    it('should require authentication', async () => {
      const response = await request(app).get('/api/v1/analytics/overview');

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it('should return overview stats with JWT', async () => {
      const response = await request(app)
        .get('/api/v1/analytics/overview')
        .set('Authorization', `Bearer ${testUser.accessToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
    });

    it('should return overview stats with API key', async () => {
      const response = await request(app)
        .get('/api/v1/analytics/overview')
        .set('X-API-Key', testApiKey.key);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it('should include total screenshots count', async () => {
      const response = await request(app)
        .get('/api/v1/analytics/overview')
        .set('Authorization', `Bearer ${testUser.accessToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data.totalScreenshots).toBe(4);
    });

    it('should include success rate', async () => {
      const response = await request(app)
        .get('/api/v1/analytics/overview')
        .set('Authorization', `Bearer ${testUser.accessToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveProperty('successRate');
      // 3 successful out of 4 = 75%
      expect(response.body.data.successRate).toBe(75);
    });

    it('should include average response time', async () => {
      const response = await request(app)
        .get('/api/v1/analytics/overview')
        .set('Authorization', `Bearer ${testUser.accessToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveProperty('averageResponseTime');
      expect(typeof response.body.data.averageResponseTime).toBe('number');
    });

    it('should include total bandwidth', async () => {
      const response = await request(app)
        .get('/api/v1/analytics/overview')
        .set('Authorization', `Bearer ${testUser.accessToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveProperty('totalBandwidth');
    });

    it('should only count user own screenshots', async () => {
      // Create screenshots for other user
      await createTestScreenshot(otherUser._id.toString());
      await createTestScreenshot(otherUser._id.toString());

      const response = await request(app)
        .get('/api/v1/analytics/overview')
        .set('Authorization', `Bearer ${testUser.accessToken}`);

      expect(response.status).toBe(200);
      // Should only count testUser's 4 screenshots
      expect(response.body.data.totalScreenshots).toBe(4);
    });
  });

  // ============================================
  // GET /api/v1/analytics/screenshots
  // ============================================

  describe('GET /api/v1/analytics/screenshots', () => {
    beforeEach(async () => {
      // Create varied screenshots for testing
      await createTestScreenshot(testUser._id.toString(), { format: 'png', width: 1920, height: 1080 });
      await createTestScreenshot(testUser._id.toString(), { format: 'png', width: 1920, height: 1080 });
      await createTestScreenshot(testUser._id.toString(), { format: 'jpeg', width: 1280, height: 720 });
      await createTestScreenshot(testUser._id.toString(), { format: 'webp', width: 800, height: 600, fullPage: true });
      await createTestScreenshot(testUser._id.toString(), {}, { status: 'failed', error: 'Network error' });
    });

    it('should require authentication', async () => {
      const response = await request(app).get('/api/v1/analytics/screenshots');

      expect(response.status).toBe(401);
    });

    it('should return screenshot statistics', async () => {
      const response = await request(app)
        .get('/api/v1/analytics/screenshots')
        .set('Authorization', `Bearer ${testUser.accessToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
    });

    it('should include breakdown by status', async () => {
      const response = await request(app)
        .get('/api/v1/analytics/screenshots')
        .set('Authorization', `Bearer ${testUser.accessToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveProperty('byStatus');
      expect(response.body.data.byStatus).toHaveProperty('completed');
      expect(response.body.data.byStatus.completed).toBe(4);
      expect(response.body.data.byStatus).toHaveProperty('failed');
      expect(response.body.data.byStatus.failed).toBe(1);
    });

    it('should include breakdown by format', async () => {
      const response = await request(app)
        .get('/api/v1/analytics/screenshots')
        .set('Authorization', `Bearer ${testUser.accessToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveProperty('byFormat');
      expect(response.body.data.byFormat.png).toBe(3); // 2 png + 1 failed (default format)
      expect(response.body.data.byFormat.jpeg).toBe(1);
      expect(response.body.data.byFormat.webp).toBe(1);
    });

    it('should include average duration', async () => {
      const response = await request(app)
        .get('/api/v1/analytics/screenshots')
        .set('Authorization', `Bearer ${testUser.accessToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveProperty('averageDuration');
      expect(typeof response.body.data.averageDuration).toBe('number');
    });

    it('should include average size', async () => {
      const response = await request(app)
        .get('/api/v1/analytics/screenshots')
        .set('Authorization', `Bearer ${testUser.accessToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveProperty('averageSize');
      expect(typeof response.body.data.averageSize).toBe('number');
    });

    it('should support date range filter', async () => {
      // Create an old screenshot
      const oldDate = new Date('2020-01-01');
      await createTestScreenshot(testUser._id.toString(), {}, {}, oldDate);

      const response = await request(app)
        .get('/api/v1/analytics/screenshots')
        .query({
          startDate: new Date(Date.now() - 86400000).toISOString(), // Yesterday
          endDate: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
        })
        .set('Authorization', `Bearer ${testUser.accessToken}`);

      expect(response.status).toBe(200);
      // Old screenshot should not be counted - only today's 5
      const totalByStatus = Object.values(response.body.data.byStatus as Record<string, number>).reduce(
        (a, b) => a + b,
        0
      );
      expect(totalByStatus).toBe(5);
    });
  });

  // ============================================
  // GET /api/v1/analytics/usage
  // ============================================

  describe('GET /api/v1/analytics/usage', () => {
    beforeEach(async () => {
      // Create screenshots over multiple days
      const today = new Date();
      const yesterday = new Date(today.getTime() - 86400000);
      const twoDaysAgo = new Date(today.getTime() - 2 * 86400000);

      await createTestScreenshot(testUser._id.toString(), {}, { size: 10000 }, today);
      await createTestScreenshot(testUser._id.toString(), {}, { size: 15000 }, today);
      await createTestScreenshot(testUser._id.toString(), {}, { size: 12000 }, yesterday);
      await createTestScreenshot(testUser._id.toString(), {}, { status: 'failed' }, twoDaysAgo);
    });

    it('should require authentication', async () => {
      const response = await request(app).get('/api/v1/analytics/usage');

      expect(response.status).toBe(401);
    });

    it('should return time-series usage data', async () => {
      const response = await request(app)
        .get('/api/v1/analytics/usage')
        .set('Authorization', `Bearer ${testUser.accessToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('period');
      expect(response.body.data).toHaveProperty('data');
      expect(Array.isArray(response.body.data.data)).toBe(true);
    });

    it('should support daily granularity', async () => {
      const response = await request(app)
        .get('/api/v1/analytics/usage')
        .query({ period: 'day' })
        .set('Authorization', `Bearer ${testUser.accessToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data.period).toBe('day');
    });

    it('should support weekly granularity', async () => {
      const response = await request(app)
        .get('/api/v1/analytics/usage')
        .query({ period: 'week' })
        .set('Authorization', `Bearer ${testUser.accessToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data.period).toBe('week');
    });

    it('should support monthly granularity', async () => {
      const response = await request(app)
        .get('/api/v1/analytics/usage')
        .query({ period: 'month' })
        .set('Authorization', `Bearer ${testUser.accessToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data.period).toBe('month');
    });

    it('should include success/failure counts in data points', async () => {
      const response = await request(app)
        .get('/api/v1/analytics/usage')
        .query({ period: 'day', limit: 7 })
        .set('Authorization', `Bearer ${testUser.accessToken}`);

      expect(response.status).toBe(200);
      for (const dataPoint of response.body.data.data) {
        expect(dataPoint).toHaveProperty('date');
        expect(dataPoint).toHaveProperty('screenshots');
        expect(dataPoint).toHaveProperty('successful');
        expect(dataPoint).toHaveProperty('failed');
      }
    });

    it('should include bandwidth usage', async () => {
      const response = await request(app)
        .get('/api/v1/analytics/usage')
        .query({ period: 'day', limit: 7 })
        .set('Authorization', `Bearer ${testUser.accessToken}`);

      expect(response.status).toBe(200);
      for (const dataPoint of response.body.data.data) {
        expect(dataPoint).toHaveProperty('bandwidth');
      }
    });

    it('should respect limit parameter', async () => {
      const response = await request(app)
        .get('/api/v1/analytics/usage')
        .query({ period: 'day', limit: 3 })
        .set('Authorization', `Bearer ${testUser.accessToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data.data.length).toBeLessThanOrEqual(3);
    });
  });

  // ============================================
  // GET /api/v1/analytics/errors
  // ============================================

  describe('GET /api/v1/analytics/errors', () => {
    beforeEach(async () => {
      // Create screenshots with various errors
      await createTestScreenshot(testUser._id.toString());
      await createTestScreenshot(testUser._id.toString());
      await createTestScreenshot(testUser._id.toString(), {}, { status: 'failed', error: 'Navigation timeout of 30000 ms exceeded' });
      await createTestScreenshot(testUser._id.toString(), {}, { status: 'failed', error: 'Navigation timeout of 30000 ms exceeded' });
      await createTestScreenshot(testUser._id.toString(), {}, { status: 'failed', error: 'net::ERR_CONNECTION_REFUSED' });
      await createTestScreenshot(testUser._id.toString(), {}, { status: 'failed', error: 'Invalid URL format' });
    });

    it('should require authentication', async () => {
      const response = await request(app).get('/api/v1/analytics/errors');

      expect(response.status).toBe(401);
    });

    it('should return error breakdown', async () => {
      const response = await request(app)
        .get('/api/v1/analytics/errors')
        .set('Authorization', `Bearer ${testUser.accessToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
    });

    it('should include total error count', async () => {
      const response = await request(app)
        .get('/api/v1/analytics/errors')
        .set('Authorization', `Bearer ${testUser.accessToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveProperty('totalErrors');
      expect(response.body.data.totalErrors).toBe(4);
    });

    it('should categorize errors by type', async () => {
      const response = await request(app)
        .get('/api/v1/analytics/errors')
        .set('Authorization', `Bearer ${testUser.accessToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveProperty('byType');
    });

    it('should include top error messages', async () => {
      const response = await request(app)
        .get('/api/v1/analytics/errors')
        .set('Authorization', `Bearer ${testUser.accessToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveProperty('topErrors');
      expect(Array.isArray(response.body.data.topErrors)).toBe(true);
    });

    it('should include error rate', async () => {
      const response = await request(app)
        .get('/api/v1/analytics/errors')
        .set('Authorization', `Bearer ${testUser.accessToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveProperty('errorRate');
      // 4 errors out of 6 total = ~67%
      expect(response.body.data.errorRate).toBeGreaterThan(0);
    });

    it('should support date range filter', async () => {
      const response = await request(app)
        .get('/api/v1/analytics/errors')
        .query({
          startDate: new Date(Date.now() - 86400000).toISOString(),
          endDate: new Date(Date.now() + 86400000).toISOString(),
        })
        .set('Authorization', `Bearer ${testUser.accessToken}`);

      expect(response.status).toBe(200);
    });
  });

  // ============================================
  // GET /api/v1/analytics/urls
  // ============================================

  describe('GET /api/v1/analytics/urls', () => {
    beforeEach(async () => {
      // Create screenshots with different URLs
      await createTestScreenshot(testUser._id.toString(), { url: 'https://example.com/page1' });
      await createTestScreenshot(testUser._id.toString(), { url: 'https://example.com/page1' });
      await createTestScreenshot(testUser._id.toString(), { url: 'https://example.com/page1' });
      await createTestScreenshot(testUser._id.toString(), { url: 'https://example.com/page2' });
      await createTestScreenshot(testUser._id.toString(), { url: 'https://example.com/page2' });
      await createTestScreenshot(testUser._id.toString(), { url: 'https://other-site.com/' });
    });

    it('should require authentication', async () => {
      const response = await request(app).get('/api/v1/analytics/urls');

      expect(response.status).toBe(401);
    });

    it('should return popular URLs', async () => {
      const response = await request(app)
        .get('/api/v1/analytics/urls')
        .set('Authorization', `Bearer ${testUser.accessToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('should sort by capture count', async () => {
      const response = await request(app)
        .get('/api/v1/analytics/urls')
        .set('Authorization', `Bearer ${testUser.accessToken}`);

      expect(response.status).toBe(200);
      const urls = response.body.data;
      // Most captured URL should be first
      expect(urls[0].count).toBeGreaterThanOrEqual(urls[urls.length - 1].count);
    });

    it('should include domain information', async () => {
      const response = await request(app)
        .get('/api/v1/analytics/urls')
        .set('Authorization', `Bearer ${testUser.accessToken}`);

      expect(response.status).toBe(200);
      for (const urlData of response.body.data) {
        expect(urlData).toHaveProperty('url');
        expect(urlData).toHaveProperty('domain');
        expect(urlData).toHaveProperty('count');
      }
    });

    it('should respect limit parameter', async () => {
      const response = await request(app)
        .get('/api/v1/analytics/urls')
        .query({ limit: 2 })
        .set('Authorization', `Bearer ${testUser.accessToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data.length).toBeLessThanOrEqual(2);
    });

    it('should support date range filter', async () => {
      const response = await request(app)
        .get('/api/v1/analytics/urls')
        .query({
          startDate: new Date(Date.now() - 86400000).toISOString(),
          endDate: new Date(Date.now() + 86400000).toISOString(),
        })
        .set('Authorization', `Bearer ${testUser.accessToken}`);

      expect(response.status).toBe(200);
    });
  });

  // ============================================
  // GET /api/v1/analytics/api-keys/:id
  // ============================================

  describe('GET /api/v1/analytics/api-keys/:id', () => {
    beforeEach(async () => {
      // Create screenshots using the test API key
      await createTestScreenshot(testUser._id.toString());
      await createTestScreenshot(testUser._id.toString());
      await createTestScreenshot(testUser._id.toString(), {}, { status: 'failed' });
    });

    it('should require authentication', async () => {
      const response = await request(app).get(`/api/v1/analytics/api-keys/${testApiKey.id}`);

      expect(response.status).toBe(401);
    });

    it('should return per-key analytics', async () => {
      const response = await request(app)
        .get(`/api/v1/analytics/api-keys/${testApiKey.id}`)
        .set('Authorization', `Bearer ${testUser.accessToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
    });

    it('should include total requests', async () => {
      const response = await request(app)
        .get(`/api/v1/analytics/api-keys/${testApiKey.id}`)
        .set('Authorization', `Bearer ${testUser.accessToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveProperty('totalRequests');
      expect(response.body.data.totalRequests).toBe(3);
    });

    it('should include success/failure breakdown', async () => {
      const response = await request(app)
        .get(`/api/v1/analytics/api-keys/${testApiKey.id}`)
        .set('Authorization', `Bearer ${testUser.accessToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveProperty('successfulRequests');
      expect(response.body.data).toHaveProperty('failedRequests');
      expect(response.body.data.successfulRequests).toBe(2);
      expect(response.body.data.failedRequests).toBe(1);
    });

    it('should return 404 for other user API key', async () => {
      // Create API key for other user
      const otherKey = generateApiKey();
      const otherKeyHash = hashApiKey(otherKey);
      const otherApiKeyDoc = await ApiKey.create({
        user: otherUser._id,
        name: 'Other User Key',
        key: otherKey,
        keyHash: otherKeyHash,
        permissions: ['screenshot:create'],
      });

      const response = await request(app)
        .get(`/api/v1/analytics/api-keys/${otherApiKeyDoc._id}`)
        .set('Authorization', `Bearer ${testUser.accessToken}`);

      expect(response.status).toBe(404);
    });

    it('should return 400 for invalid ID format', async () => {
      const response = await request(app)
        .get('/api/v1/analytics/api-keys/invalid-id')
        .set('Authorization', `Bearer ${testUser.accessToken}`);

      expect(response.status).toBe(400);
    });

    it('should return 404 for non-existent ID', async () => {
      const fakeId = new Types.ObjectId();
      const response = await request(app)
        .get(`/api/v1/analytics/api-keys/${fakeId}`)
        .set('Authorization', `Bearer ${testUser.accessToken}`);

      expect(response.status).toBe(404);
    });

    it('should include usage by day', async () => {
      const response = await request(app)
        .get(`/api/v1/analytics/api-keys/${testApiKey.id}`)
        .set('Authorization', `Bearer ${testUser.accessToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveProperty('usageByDay');
      expect(Array.isArray(response.body.data.usageByDay)).toBe(true);
    });
  });

  // ============================================
  // Cache Behavior
  // ============================================

  describe('Cache Behavior', () => {
    it('should bypass cache with fresh=true parameter', async () => {
      await createTestScreenshot(testUser._id.toString());

      const response = await request(app)
        .get('/api/v1/analytics/overview')
        .query({ fresh: 'true' })
        .set('Authorization', `Bearer ${testUser.accessToken}`);

      expect(response.status).toBe(200);
    });
  });
});
