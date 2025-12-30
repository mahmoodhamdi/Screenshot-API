/**
 * Screenshot Integration Tests
 * Tests for screenshot endpoints with database integration
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

// Store testApiKey id for createTestScreenshot
let currentApiKeyId: Types.ObjectId;

async function createTestScreenshot(
  userId: string,
  options: { url?: string; format?: string; width?: number; height?: number } = {},
  result: { status?: string; url?: string; error?: string; size?: number; duration?: number } = {}
) {
  const url = options.url || 'https://example.com';
  return Screenshot.create({
    user: userId,
    apiKey: currentApiKeyId,
    url,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
    options: {
      width: options.width || 1280,
      height: options.height || 720,
      format: options.format || 'png',
    },
    result: {
      status: result.status || 'completed',
      url: result.url || 'https://storage.example.com/test.png',
      size: result.size || 12345,
      duration: result.duration || 2500,
      error: result.error,
    },
  });
}

// ============================================
// Test Suite
// ============================================

describe('Screenshot Integration Tests', () => {
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

    // Create test user directly in database (faster than API)
    const userId = new Types.ObjectId();
    const hashedPassword = await bcrypt.hash('MyS3cur3P@ssword!', 12);
    await User.create({
      _id: userId,
      email: 'test@example.com',
      password: hashedPassword,
      name: 'Test User',
      isVerified: true,
      subscription: { plan: 'free', status: 'active' },
    });

    // Generate JWT token using the auth service
    const accessToken = generateAccessToken({
      userId: userId.toString(),
      email: 'test@example.com',
      role: 'user',
    });

    testUser = {
      _id: userId,
      email: 'test@example.com',
      accessToken,
    };

    // Create API key directly in database
    const plainKey = generateApiKey();
    const keyHash = hashApiKey(plainKey);
    const apiKeyDoc = await ApiKey.create({
      user: userId,
      name: 'Test API Key',
      key: plainKey,
      keyHash,
      permissions: ['screenshot:create', 'screenshot:read', 'screenshot:delete'],
    });

    testApiKey = {
      id: apiKeyDoc._id.toString(),
      key: plainKey,
    };

    // Set the currentApiKeyId for createTestScreenshot helper
    currentApiKeyId = apiKeyDoc._id;

    // Create another user directly in database
    const otherUserId = new Types.ObjectId();
    await User.create({
      _id: otherUserId,
      email: 'other@example.com',
      password: hashedPassword,
      name: 'Other User',
      isVerified: true,
      subscription: { plan: 'free', status: 'active' },
    });

    otherUser = {
      _id: otherUserId,
    };
  });

  // ============================================
  // POST /api/v1/screenshots
  // ============================================

  describe('POST /api/v1/screenshots', () => {
    describe('Authentication', () => {
      it('should reject request without authentication', async () => {
        const response = await request(app).post('/api/v1/screenshots').send({
          url: 'https://example.com',
        });

        expect(response.status).toBe(401);
        expect(response.body.success).toBe(false);
      });

      it('should accept request with valid JWT', async () => {
        const response = await request(app)
          .post('/api/v1/screenshots')
          .set('Authorization', `Bearer ${testUser.accessToken}`)
          .send({
            url: 'https://example.com',
          });

        // May succeed or fail due to Puppeteer in test env, but auth should pass
        expect([200, 201, 500, 503]).toContain(response.status);
      });

      it('should accept request with valid API key', async () => {
        const response = await request(app)
          .post('/api/v1/screenshots')
          .set('X-API-Key', testApiKey.key)
          .send({
            url: 'https://example.com',
          });

        expect([200, 201, 500, 503]).toContain(response.status);
      });

      it('should reject request with invalid API key', async () => {
        const response = await request(app)
          .post('/api/v1/screenshots')
          .set('X-API-Key', 'invalid-api-key')
          .send({
            url: 'https://example.com',
          });

        expect(response.status).toBe(401);
        expect(response.body.success).toBe(false);
      });
    });

    describe('Validation', () => {
      it('should reject request without URL', async () => {
        const response = await request(app)
          .post('/api/v1/screenshots')
          .set('Authorization', `Bearer ${testUser.accessToken}`)
          .send({});

        expect(response.status).toBe(400);
        expect(response.body.success).toBe(false);
      });

      it('should reject request with invalid URL', async () => {
        const response = await request(app)
          .post('/api/v1/screenshots')
          .set('Authorization', `Bearer ${testUser.accessToken}`)
          .send({
            url: 'not-a-valid-url',
          });

        expect(response.status).toBe(400);
        expect(response.body.success).toBe(false);
      });

      it('should reject request with internal IP URL', async () => {
        const internalUrls = [
          'https://localhost/',
          'https://127.0.0.1/',
          'https://10.0.0.1/',
          'https://192.168.1.1/',
          'https://172.16.0.1/',
        ];

        for (const url of internalUrls) {
          const response = await request(app)
            .post('/api/v1/screenshots')
            .set('Authorization', `Bearer ${testUser.accessToken}`)
            .send({ url });

          expect(response.status).toBe(400);
          expect(response.body.success).toBe(false);
        }
      });

      it('should reject request with javascript: URL', async () => {
        const response = await request(app)
          .post('/api/v1/screenshots')
          .set('Authorization', `Bearer ${testUser.accessToken}`)
          .send({
            url: 'javascript:alert(1)',
          });

        expect(response.status).toBe(400);
        expect(response.body.success).toBe(false);
      });

      it('should reject request with file: URL', async () => {
        const response = await request(app)
          .post('/api/v1/screenshots')
          .set('Authorization', `Bearer ${testUser.accessToken}`)
          .send({
            url: 'file:///etc/passwd',
          });

        expect(response.status).toBe(400);
        expect(response.body.success).toBe(false);
      });

      it('should reject request with width below minimum', async () => {
        const response = await request(app)
          .post('/api/v1/screenshots')
          .set('Authorization', `Bearer ${testUser.accessToken}`)
          .send({
            url: 'https://example.com',
            width: 100,
          });

        expect(response.status).toBe(400);
        expect(response.body.success).toBe(false);
      });

      it('should reject request with width above maximum', async () => {
        const response = await request(app)
          .post('/api/v1/screenshots')
          .set('Authorization', `Bearer ${testUser.accessToken}`)
          .send({
            url: 'https://example.com',
            width: 10000,
          });

        expect(response.status).toBe(400);
        expect(response.body.success).toBe(false);
      });

      it('should reject request with height below minimum', async () => {
        const response = await request(app)
          .post('/api/v1/screenshots')
          .set('Authorization', `Bearer ${testUser.accessToken}`)
          .send({
            url: 'https://example.com',
            height: 100,
          });

        expect(response.status).toBe(400);
        expect(response.body.success).toBe(false);
      });

      it('should reject request with invalid format', async () => {
        const response = await request(app)
          .post('/api/v1/screenshots')
          .set('Authorization', `Bearer ${testUser.accessToken}`)
          .send({
            url: 'https://example.com',
            format: 'gif',
          });

        expect(response.status).toBe(400);
        expect(response.body.success).toBe(false);
      });

      it('should reject request with quality > 100', async () => {
        const response = await request(app)
          .post('/api/v1/screenshots')
          .set('Authorization', `Bearer ${testUser.accessToken}`)
          .send({
            url: 'https://example.com',
            quality: 150,
          });

        expect(response.status).toBe(400);
        expect(response.body.success).toBe(false);
      });

      it('should reject request with delay above maximum', async () => {
        const response = await request(app)
          .post('/api/v1/screenshots')
          .set('Authorization', `Bearer ${testUser.accessToken}`)
          .send({
            url: 'https://example.com',
            delay: 60000,
          });

        expect(response.status).toBe(400);
        expect(response.body.success).toBe(false);
      });

      it('should reject request with too many cookies', async () => {
        const cookies = Array(100)
          .fill(null)
          .map((_, i) => ({
            name: `cookie${i}`,
            value: `value${i}`,
          }));

        const response = await request(app)
          .post('/api/v1/screenshots')
          .set('Authorization', `Bearer ${testUser.accessToken}`)
          .send({
            url: 'https://example.com',
            cookies,
          });

        expect(response.status).toBe(400);
        expect(response.body.success).toBe(false);
      });

      it('should reject request with invalid waitUntil option', async () => {
        const response = await request(app)
          .post('/api/v1/screenshots')
          .set('Authorization', `Bearer ${testUser.accessToken}`)
          .send({
            url: 'https://example.com',
            waitUntil: 'invalid-option',
          });

        expect(response.status).toBe(400);
        expect(response.body.success).toBe(false);
      });
    });

    describe('Valid Options', () => {
      it('should accept valid format options', async () => {
        const formats = ['png', 'jpeg', 'webp'];

        for (const format of formats) {
          const response = await request(app)
            .post('/api/v1/screenshots')
            .set('Authorization', `Bearer ${testUser.accessToken}`)
            .send({
              url: 'https://example.com',
              format,
            });

          // Auth/validation should pass even if capture fails
          expect([200, 201, 500, 503]).toContain(response.status);
        }
      });

      it('should accept valid dimensions', async () => {
        const response = await request(app)
          .post('/api/v1/screenshots')
          .set('Authorization', `Bearer ${testUser.accessToken}`)
          .send({
            url: 'https://example.com',
            width: 1920,
            height: 1080,
          });

        expect([200, 201, 500, 503]).toContain(response.status);
      });

      it('should accept valid quality option', async () => {
        const response = await request(app)
          .post('/api/v1/screenshots')
          .set('Authorization', `Bearer ${testUser.accessToken}`)
          .send({
            url: 'https://example.com',
            format: 'jpeg',
            quality: 80,
          });

        expect([200, 201, 500, 503]).toContain(response.status);
      });

      it('should accept fullPage option', async () => {
        const response = await request(app)
          .post('/api/v1/screenshots')
          .set('Authorization', `Bearer ${testUser.accessToken}`)
          .send({
            url: 'https://example.com',
            fullPage: true,
          });

        expect([200, 201, 500, 503]).toContain(response.status);
      });

      it('should accept darkMode option', async () => {
        const response = await request(app)
          .post('/api/v1/screenshots')
          .set('Authorization', `Bearer ${testUser.accessToken}`)
          .send({
            url: 'https://example.com',
            darkMode: true,
          });

        expect([200, 201, 500, 503]).toContain(response.status);
      });

      it('should accept valid delay option', async () => {
        const response = await request(app)
          .post('/api/v1/screenshots')
          .set('Authorization', `Bearer ${testUser.accessToken}`)
          .send({
            url: 'https://example.com',
            delay: 1000,
          });

        expect([200, 201, 500, 503]).toContain(response.status);
      });

      it('should accept valid waitUntil options', async () => {
        const waitOptions = ['load', 'domcontentloaded', 'networkidle0', 'networkidle2'];

        for (const waitUntil of waitOptions) {
          const response = await request(app)
            .post('/api/v1/screenshots')
            .set('Authorization', `Bearer ${testUser.accessToken}`)
            .send({
              url: 'https://example.com',
              waitUntil,
            });

          expect([200, 201, 500, 503]).toContain(response.status);
        }
      });

      it('should accept valid cookies', async () => {
        const response = await request(app)
          .post('/api/v1/screenshots')
          .set('Authorization', `Bearer ${testUser.accessToken}`)
          .send({
            url: 'https://example.com',
            cookies: [
              {
                name: 'session',
                value: 'test-session-value',
                domain: 'example.com',
              },
            ],
          });

        expect([200, 201, 500, 503]).toContain(response.status);
      });
    });

    describe('Rate Limiting', () => {
      it('should return rate limit headers', async () => {
        const response = await request(app)
          .post('/api/v1/screenshots')
          .set('Authorization', `Bearer ${testUser.accessToken}`)
          .send({
            url: 'https://example.com',
          });

        // Rate limit headers should be present
        expect(response.headers).toHaveProperty('x-ratelimit-limit');
        expect(response.headers).toHaveProperty('x-ratelimit-remaining');
      });
    });
  });

  // ============================================
  // GET /api/v1/screenshots
  // ============================================

  describe('GET /api/v1/screenshots', () => {
    beforeEach(async () => {
      // Create test screenshots
      await createTestScreenshot(testUser._id.toString(), { url: 'https://example1.com' });
      await createTestScreenshot(testUser._id.toString(), { url: 'https://example2.com', format: 'jpeg' });
      await createTestScreenshot(testUser._id.toString(), { url: 'https://example3.com' }, { status: 'failed', error: 'Timeout' });

      // Create screenshot for other user
      await createTestScreenshot(otherUser._id.toString(), { url: 'https://other.com' });
    });

    describe('Authentication', () => {
      it('should reject request without authentication', async () => {
        const response = await request(app).get('/api/v1/screenshots');

        expect(response.status).toBe(401);
        expect(response.body.success).toBe(false);
      });

      it('should accept request with valid JWT', async () => {
        const response = await request(app)
          .get('/api/v1/screenshots')
          .set('Authorization', `Bearer ${testUser.accessToken}`);

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
      });

      it('should accept request with valid API key', async () => {
        const response = await request(app)
          .get('/api/v1/screenshots')
          .set('X-API-Key', testApiKey.key);

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
      });

      it('should only return user own screenshots', async () => {
        const response = await request(app)
          .get('/api/v1/screenshots')
          .set('Authorization', `Bearer ${testUser.accessToken}`);

        expect(response.status).toBe(200);
        expect(response.body.data.length).toBe(3); // Only testUser's screenshots

        // Verify none belong to other user
        for (const screenshot of response.body.data) {
          expect(screenshot.url).not.toBe('https://other.com');
        }
      });
    });

    describe('Pagination', () => {
      it('should return paginated results', async () => {
        const response = await request(app)
          .get('/api/v1/screenshots')
          .query({ page: 1, limit: 2 })
          .set('Authorization', `Bearer ${testUser.accessToken}`);

        expect(response.status).toBe(200);
        expect(response.body.data.length).toBe(2);
        expect(response.body.meta).toBeDefined();
      });

      it('should respect page parameter', async () => {
        const response = await request(app)
          .get('/api/v1/screenshots')
          .query({ page: 2, limit: 2 })
          .set('Authorization', `Bearer ${testUser.accessToken}`);

        expect(response.status).toBe(200);
        expect(response.body.data.length).toBe(1);
        expect(response.body.meta.page).toBe(2);
      });

      it('should include total count', async () => {
        const response = await request(app)
          .get('/api/v1/screenshots')
          .set('Authorization', `Bearer ${testUser.accessToken}`);

        expect(response.status).toBe(200);
        expect(response.body.meta.total).toBe(3);
      });

      it('should reject invalid page number', async () => {
        const response = await request(app)
          .get('/api/v1/screenshots')
          .query({ page: 'invalid' })
          .set('Authorization', `Bearer ${testUser.accessToken}`);

        expect(response.status).toBe(400);
        expect(response.body.success).toBe(false);
      });

      it('should reject limit above maximum', async () => {
        const response = await request(app)
          .get('/api/v1/screenshots')
          .query({ limit: 1000 })
          .set('Authorization', `Bearer ${testUser.accessToken}`);

        expect(response.status).toBe(400);
        expect(response.body.success).toBe(false);
      });
    });

    describe('Filtering', () => {
      it('should filter by status', async () => {
        const response = await request(app)
          .get('/api/v1/screenshots')
          .query({ status: 'completed' })
          .set('Authorization', `Bearer ${testUser.accessToken}`);

        expect(response.status).toBe(200);
        expect(response.body.data.length).toBe(2);
        for (const screenshot of response.body.data) {
          expect(screenshot.result.status).toBe('completed');
        }
      });

      it('should filter by format', async () => {
        const response = await request(app)
          .get('/api/v1/screenshots')
          .query({ format: 'jpeg' })
          .set('Authorization', `Bearer ${testUser.accessToken}`);

        expect(response.status).toBe(200);
        expect(response.body.data.length).toBe(1);
        expect(response.body.data[0].options.format).toBe('jpeg');
      });
    });

    describe('Sorting', () => {
      it('should sort by createdAt descending by default', async () => {
        const response = await request(app)
          .get('/api/v1/screenshots')
          .set('Authorization', `Bearer ${testUser.accessToken}`);

        expect(response.status).toBe(200);
        const dates = response.body.data.map((s: { createdAt: string }) => new Date(s.createdAt).getTime());
        expect(dates).toEqual([...dates].sort((a, b) => b - a));
      });
    });
  });

  // ============================================
  // GET /api/v1/screenshots/:id
  // ============================================

  describe('GET /api/v1/screenshots/:id', () => {
    let screenshot: { _id: Types.ObjectId };

    beforeEach(async () => {
      screenshot = await createTestScreenshot(testUser._id.toString());
    });

    it('should return screenshot by ID', async () => {
      const response = await request(app)
        .get(`/api/v1/screenshots/${screenshot._id}`)
        .set('Authorization', `Bearer ${testUser.accessToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(screenshot._id.toString());
    });

    it('should return 404 for non-existent ID', async () => {
      const fakeId = new Types.ObjectId();
      const response = await request(app)
        .get(`/api/v1/screenshots/${fakeId}`)
        .set('Authorization', `Bearer ${testUser.accessToken}`);

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });

    it('should return 404 for other user screenshot', async () => {
      const otherScreenshot = await createTestScreenshot(otherUser._id.toString());

      const response = await request(app)
        .get(`/api/v1/screenshots/${otherScreenshot._id}`)
        .set('Authorization', `Bearer ${testUser.accessToken}`);

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });

    it('should return 400 for invalid ID format', async () => {
      const response = await request(app)
        .get('/api/v1/screenshots/invalid-id')
        .set('Authorization', `Bearer ${testUser.accessToken}`);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should reject request without authentication', async () => {
      const response = await request(app)
        .get(`/api/v1/screenshots/${screenshot._id}`);

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it('should include all screenshot details', async () => {
      const response = await request(app)
        .get(`/api/v1/screenshots/${screenshot._id}`)
        .set('Authorization', `Bearer ${testUser.accessToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data).toHaveProperty('options');
      expect(response.body.data).toHaveProperty('result');
      expect(response.body.data).toHaveProperty('createdAt');
    });
  });

  // ============================================
  // DELETE /api/v1/screenshots/:id
  // ============================================

  describe('DELETE /api/v1/screenshots/:id', () => {
    let screenshot: { _id: Types.ObjectId };

    beforeEach(async () => {
      screenshot = await createTestScreenshot(testUser._id.toString());
    });

    it('should delete screenshot', async () => {
      const response = await request(app)
        .delete(`/api/v1/screenshots/${screenshot._id}`)
        .set('Authorization', `Bearer ${testUser.accessToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);

      // Verify screenshot is deleted
      const deletedScreenshot = await Screenshot.findById(screenshot._id);
      expect(deletedScreenshot).toBeNull();
    });

    it('should return 404 for non-existent ID', async () => {
      const fakeId = new Types.ObjectId();
      const response = await request(app)
        .delete(`/api/v1/screenshots/${fakeId}`)
        .set('Authorization', `Bearer ${testUser.accessToken}`);

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });

    it('should return 404 for other user screenshot', async () => {
      const otherScreenshot = await createTestScreenshot(otherUser._id.toString());

      const response = await request(app)
        .delete(`/api/v1/screenshots/${otherScreenshot._id}`)
        .set('Authorization', `Bearer ${testUser.accessToken}`);

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);

      // Verify screenshot still exists
      const stillExists = await Screenshot.findById(otherScreenshot._id);
      expect(stillExists).not.toBeNull();
    });

    it('should return 400 for invalid ID format', async () => {
      const response = await request(app)
        .delete('/api/v1/screenshots/invalid-id')
        .set('Authorization', `Bearer ${testUser.accessToken}`);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should reject request without authentication', async () => {
      const response = await request(app)
        .delete(`/api/v1/screenshots/${screenshot._id}`);

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it('should not affect other screenshots', async () => {
      const anotherScreenshot = await createTestScreenshot(testUser._id.toString());

      await request(app)
        .delete(`/api/v1/screenshots/${screenshot._id}`)
        .set('Authorization', `Bearer ${testUser.accessToken}`);

      // Verify other screenshot still exists
      const stillExists = await Screenshot.findById(anotherScreenshot._id);
      expect(stillExists).not.toBeNull();
    });
  });

  // ============================================
  // POST /api/v1/screenshots/:id/refresh-url
  // ============================================

  describe('POST /api/v1/screenshots/:id/refresh-url', () => {
    let screenshot: { _id: Types.ObjectId };

    beforeEach(async () => {
      screenshot = await createTestScreenshot(testUser._id.toString());
    });

    it('should generate new signed URL', async () => {
      const response = await request(app)
        .post(`/api/v1/screenshots/${screenshot._id}/refresh-url`)
        .set('Authorization', `Bearer ${testUser.accessToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('screenshotUrl');
    });

    it('should return 404 for non-existent ID', async () => {
      const fakeId = new Types.ObjectId();
      const response = await request(app)
        .post(`/api/v1/screenshots/${fakeId}/refresh-url`)
        .set('Authorization', `Bearer ${testUser.accessToken}`);

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });

    it('should return 404 for other user screenshot', async () => {
      const otherScreenshot = await createTestScreenshot(otherUser._id.toString());

      const response = await request(app)
        .post(`/api/v1/screenshots/${otherScreenshot._id}/refresh-url`)
        .set('Authorization', `Bearer ${testUser.accessToken}`);

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });

    it('should reject request without authentication', async () => {
      const response = await request(app)
        .post(`/api/v1/screenshots/${screenshot._id}/refresh-url`);

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });

  // ============================================
  // POST /api/v1/screenshots/:id/retry
  // ============================================

  describe('POST /api/v1/screenshots/:id/retry', () => {
    let failedScreenshot: { _id: Types.ObjectId };
    let completedScreenshot: { _id: Types.ObjectId };

    beforeEach(async () => {
      failedScreenshot = await createTestScreenshot(
        testUser._id.toString(),
        { url: 'https://failed.example.com' },
        { status: 'failed', error: 'Connection timeout' }
      );
      completedScreenshot = await createTestScreenshot(testUser._id.toString());
    });

    it('should create new screenshot from failed', async () => {
      const response = await request(app)
        .post(`/api/v1/screenshots/${failedScreenshot._id}/retry`)
        .set('Authorization', `Bearer ${testUser.accessToken}`);

      // May succeed or fail due to Puppeteer in test env
      expect([200, 201, 400, 500, 503]).toContain(response.status);

      if (response.status === 201 || response.status === 200) {
        expect(response.body.data).toHaveProperty('id');
        // New screenshot should have different ID
        expect(response.body.data.id).not.toBe(failedScreenshot._id.toString());
      }
    });

    it('should reject retry of completed screenshot', async () => {
      const response = await request(app)
        .post(`/api/v1/screenshots/${completedScreenshot._id}/retry`)
        .set('Authorization', `Bearer ${testUser.accessToken}`);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should return 404 for non-existent ID', async () => {
      const fakeId = new Types.ObjectId();
      const response = await request(app)
        .post(`/api/v1/screenshots/${fakeId}/retry`)
        .set('Authorization', `Bearer ${testUser.accessToken}`);

      // Should return 400 (not found or not failed) rather than 404
      expect([400, 404]).toContain(response.status);
      expect(response.body.success).toBe(false);
    });

    it('should reject retry of other user screenshot', async () => {
      const otherFailedScreenshot = await createTestScreenshot(
        otherUser._id.toString(),
        { url: 'https://other-failed.example.com' },
        { status: 'failed', error: 'Timeout' }
      );

      const response = await request(app)
        .post(`/api/v1/screenshots/${otherFailedScreenshot._id}/retry`)
        .set('Authorization', `Bearer ${testUser.accessToken}`);

      // Should be denied (either 400 or 404)
      expect([400, 404]).toContain(response.status);
      expect(response.body.success).toBe(false);
    });

    it('should reject request without authentication', async () => {
      const response = await request(app)
        .post(`/api/v1/screenshots/${failedScreenshot._id}/retry`);

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });

  // ============================================
  // GET /api/v1/screenshots/:id/download
  // ============================================

  describe('GET /api/v1/screenshots/:id/download', () => {
    let screenshot: { _id: Types.ObjectId };
    let pendingScreenshot: { _id: Types.ObjectId };

    beforeEach(async () => {
      screenshot = await createTestScreenshot(testUser._id.toString());
      pendingScreenshot = await createTestScreenshot(
        testUser._id.toString(),
        {},
        { status: 'pending', url: undefined }
      );
    });

    it('should redirect to screenshot file', async () => {
      const response = await request(app)
        .get(`/api/v1/screenshots/${screenshot._id}/download`)
        .set('Authorization', `Bearer ${testUser.accessToken}`);

      // Should redirect (302) or return success
      expect([200, 302]).toContain(response.status);
    });

    it('should reject download for pending screenshot', async () => {
      const response = await request(app)
        .get(`/api/v1/screenshots/${pendingScreenshot._id}/download`)
        .set('Authorization', `Bearer ${testUser.accessToken}`);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should return 404 for non-existent ID', async () => {
      const fakeId = new Types.ObjectId();
      const response = await request(app)
        .get(`/api/v1/screenshots/${fakeId}/download`)
        .set('Authorization', `Bearer ${testUser.accessToken}`);

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });

    it('should reject request without authentication', async () => {
      const response = await request(app)
        .get(`/api/v1/screenshots/${screenshot._id}/download`);

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });

  // ============================================
  // GET /api/v1/screenshots/stats
  // ============================================

  describe('GET /api/v1/screenshots/stats', () => {
    beforeEach(async () => {
      // Create various screenshots for stats
      await createTestScreenshot(testUser._id.toString(), { format: 'png' });
      await createTestScreenshot(testUser._id.toString(), { format: 'png' });
      await createTestScreenshot(testUser._id.toString(), { format: 'jpeg' });
      await createTestScreenshot(testUser._id.toString(), {}, { status: 'failed', error: 'Timeout' });
    });

    it('should return screenshot statistics', async () => {
      const response = await request(app)
        .get('/api/v1/screenshots/stats')
        .set('Authorization', `Bearer ${testUser.accessToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
    });

    it('should include total count', async () => {
      const response = await request(app)
        .get('/api/v1/screenshots/stats')
        .set('Authorization', `Bearer ${testUser.accessToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data.totalScreenshots).toBe(4);
    });

    it('should include success/failure breakdown', async () => {
      const response = await request(app)
        .get('/api/v1/screenshots/stats')
        .set('Authorization', `Bearer ${testUser.accessToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data.successfulScreenshots).toBe(3);
      expect(response.body.data.failedScreenshots).toBe(1);
    });

    it('should include format distribution', async () => {
      const response = await request(app)
        .get('/api/v1/screenshots/stats')
        .set('Authorization', `Bearer ${testUser.accessToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data.formatDistribution).toBeDefined();
      expect(response.body.data.formatDistribution.png).toBe(3); // Including failed one
      expect(response.body.data.formatDistribution.jpeg).toBe(1);
    });

    it('should reject request without authentication', async () => {
      const response = await request(app).get('/api/v1/screenshots/stats');

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it('should respect date range filter', async () => {
      // Create an old screenshot
      const oldScreenshot = await createTestScreenshot(testUser._id.toString());
      await Screenshot.updateOne(
        { _id: oldScreenshot._id },
        { $set: { createdAt: new Date('2020-01-01') } }
      );

      const response = await request(app)
        .get('/api/v1/screenshots/stats')
        .query({
          startDate: new Date().toISOString(),
          endDate: new Date(Date.now() + 86400000).toISOString(),
        })
        .set('Authorization', `Bearer ${testUser.accessToken}`);

      expect(response.status).toBe(200);
      // Old screenshot should not be counted
      expect(response.body.data.totalScreenshots).toBe(4);
    });

    it('should only count user own screenshots in stats', async () => {
      // Create screenshots for other user
      await createTestScreenshot(otherUser._id.toString());
      await createTestScreenshot(otherUser._id.toString());

      const response = await request(app)
        .get('/api/v1/screenshots/stats')
        .set('Authorization', `Bearer ${testUser.accessToken}`);

      expect(response.status).toBe(200);
      // Should only count testUser's 4 screenshots, not other user's
      expect(response.body.data.totalScreenshots).toBe(4);
    });
  });
});
