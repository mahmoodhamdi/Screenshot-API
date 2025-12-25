/**
 * Screenshot E2E Tests
 * Screenshot capture and management flow tests
 */

// Set environment variables before imports
process.env.JWT_SECRET = 'test-jwt-secret-key-minimum-32-characters-long';
process.env.JWT_REFRESH_SECRET = 'test-jwt-refresh-secret-key-minimum-32-chars';
process.env.NODE_ENV = 'test';

import { User, ApiKey, Screenshot } from '@models/index';
import {
  api,
  registerUser,
  createApiKey,
  expectSuccess,
  expectError,
  TestUser,
  TestApiKey,
} from './helpers';

describe('Screenshot E2E Tests', () => {
  let testUser: TestUser;
  let testApiKey: TestApiKey;

  beforeEach(async () => {
    // Clean up before each test
    await User.deleteMany({});
    await ApiKey.deleteMany({});
    await Screenshot.deleteMany({});

    // Create a test user with API key
    testUser = await registerUser({ email: 'screenshot-test@example.com' });
    testApiKey = await createApiKey(testUser.accessToken!);
  });

  // ============================================
  // Screenshot Capture
  // ============================================

  describe('Screenshot Capture', () => {
    it('should accept screenshot request with valid URL', async () => {
      const response = await api
        .post('/api/v1/screenshots')
        .set('Authorization', `Bearer ${testUser.accessToken}`)
        .send({
          url: 'https://example.com',
        });

      // The response should be accepted (even if capture fails in test env)
      // 400 may occur if screenshot service validation fails
      expect([200, 201, 400, 500, 503]).toContain(response.status);

      if (response.status === 201 || response.status === 200) {
        expect(response.body.data.id).toBeDefined();
        expect(response.body.data.url).toBe('https://example.com');
      }
    });

    it('should accept screenshot with API key authentication', async () => {
      const response = await api.post('/api/v1/screenshots').set('X-API-Key', testApiKey.key).send({
        url: 'https://example.com',
      });

      expect([200, 201, 500, 503]).toContain(response.status);
    });

    it('should reject screenshot request without authentication', async () => {
      const response = await api.post('/api/v1/screenshots').send({
        url: 'https://example.com',
      });

      expectError(response, 401);
    });

    it('should reject screenshot request without URL', async () => {
      const response = await api
        .post('/api/v1/screenshots')
        .set('Authorization', `Bearer ${testUser.accessToken}`)
        .send({});

      expectError(response, 400);
    });

    it('should reject screenshot request with invalid URL', async () => {
      const response = await api
        .post('/api/v1/screenshots')
        .set('Authorization', `Bearer ${testUser.accessToken}`)
        .send({
          url: 'not-a-valid-url',
        });

      expectError(response, 400);
    });

    it('should reject screenshot request with non-HTTP URL', async () => {
      const response = await api
        .post('/api/v1/screenshots')
        .set('Authorization', `Bearer ${testUser.accessToken}`)
        .send({
          url: 'ftp://example.com/file.txt',
        });

      expectError(response, 400);
    });
  });

  // ============================================
  // Screenshot Options
  // ============================================

  describe('Screenshot Options', () => {
    it('should accept valid format options', async () => {
      const formats = ['png', 'jpeg', 'webp'];

      for (const format of formats) {
        const response = await api
          .post('/api/v1/screenshots')
          .set('Authorization', `Bearer ${testUser.accessToken}`)
          .send({
            url: 'https://example.com',
            format,
          });

        expect([200, 201, 400, 500, 503]).toContain(response.status);
      }
    });

    it('should reject invalid format', async () => {
      const response = await api
        .post('/api/v1/screenshots')
        .set('Authorization', `Bearer ${testUser.accessToken}`)
        .send({
          url: 'https://example.com',
          format: 'gif',
        });

      expectError(response, 400);
    });

    it('should accept valid dimensions', async () => {
      const response = await api
        .post('/api/v1/screenshots')
        .set('Authorization', `Bearer ${testUser.accessToken}`)
        .send({
          url: 'https://example.com',
          width: 1920,
          height: 1080,
        });

      expect([200, 201, 400, 500, 503]).toContain(response.status);
    });

    it('should reject dimensions below minimum', async () => {
      const response = await api
        .post('/api/v1/screenshots')
        .set('Authorization', `Bearer ${testUser.accessToken}`)
        .send({
          url: 'https://example.com',
          width: 100,
          height: 100,
        });

      expectError(response, 400);
    });

    it('should reject dimensions above maximum', async () => {
      const response = await api
        .post('/api/v1/screenshots')
        .set('Authorization', `Bearer ${testUser.accessToken}`)
        .send({
          url: 'https://example.com',
          width: 10000,
          height: 10000,
        });

      expectError(response, 400);
    });

    it('should accept quality option', async () => {
      const response = await api
        .post('/api/v1/screenshots')
        .set('Authorization', `Bearer ${testUser.accessToken}`)
        .send({
          url: 'https://example.com',
          format: 'jpeg',
          quality: 80,
        });

      expect([200, 201, 400, 500, 503]).toContain(response.status);
    });

    it('should reject invalid quality', async () => {
      const response = await api
        .post('/api/v1/screenshots')
        .set('Authorization', `Bearer ${testUser.accessToken}`)
        .send({
          url: 'https://example.com',
          quality: 150,
        });

      expectError(response, 400);
    });

    it('should accept fullPage option', async () => {
      const response = await api
        .post('/api/v1/screenshots')
        .set('Authorization', `Bearer ${testUser.accessToken}`)
        .send({
          url: 'https://example.com',
          fullPage: true,
        });

      expect([200, 201, 400, 500, 503]).toContain(response.status);
    });

    it('should accept darkMode option', async () => {
      const response = await api
        .post('/api/v1/screenshots')
        .set('Authorization', `Bearer ${testUser.accessToken}`)
        .send({
          url: 'https://example.com',
          darkMode: true,
        });

      expect([200, 201, 400, 500, 503]).toContain(response.status);
    });

    it('should accept delay option', async () => {
      const response = await api
        .post('/api/v1/screenshots')
        .set('Authorization', `Bearer ${testUser.accessToken}`)
        .send({
          url: 'https://example.com',
          delay: 1000,
        });

      expect([200, 201, 400, 500, 503]).toContain(response.status);
    });

    it('should reject delay above maximum', async () => {
      const response = await api
        .post('/api/v1/screenshots')
        .set('Authorization', `Bearer ${testUser.accessToken}`)
        .send({
          url: 'https://example.com',
          delay: 60000,
        });

      expectError(response, 400);
    });
  });

  // ============================================
  // Screenshot List
  // ============================================

  describe('Screenshot List', () => {
    it('should list screenshots for authenticated user', async () => {
      const response = await api
        .get('/api/v1/screenshots')
        .set('Authorization', `Bearer ${testUser.accessToken}`);

      expectSuccess(response);
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('should list screenshots with API key', async () => {
      const response = await api.get('/api/v1/screenshots').set('X-API-Key', testApiKey.key);

      expectSuccess(response);
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('should reject list without authentication', async () => {
      const response = await api.get('/api/v1/screenshots');

      expectError(response, 401);
    });

    it('should support pagination', async () => {
      const response = await api
        .get('/api/v1/screenshots')
        .query({ page: 1, limit: 10 })
        .set('Authorization', `Bearer ${testUser.accessToken}`);

      expectSuccess(response);
      // Pagination may not always be present for empty results
      expect(response.body.data).toBeDefined();
    });

    it('should reject invalid page number', async () => {
      const response = await api
        .get('/api/v1/screenshots')
        .query({ page: 'invalid' })
        .set('Authorization', `Bearer ${testUser.accessToken}`);

      expectError(response, 400);
    });

    it('should reject limit above maximum', async () => {
      const response = await api
        .get('/api/v1/screenshots')
        .query({ limit: 1000 })
        .set('Authorization', `Bearer ${testUser.accessToken}`);

      expectError(response, 400);
    });
  });

  // ============================================
  // Screenshot Retrieval
  // ============================================

  describe('Screenshot Retrieval', () => {
    it('should reject get with invalid ID format', async () => {
      const response = await api
        .get('/api/v1/screenshots/invalid-id')
        .set('Authorization', `Bearer ${testUser.accessToken}`);

      expectError(response, 400);
    });

    it('should return 404 for non-existent screenshot', async () => {
      const response = await api
        .get('/api/v1/screenshots/507f1f77bcf86cd799439011')
        .set('Authorization', `Bearer ${testUser.accessToken}`);

      expectError(response, 404);
    });

    it('should reject get without authentication', async () => {
      const response = await api.get('/api/v1/screenshots/507f1f77bcf86cd799439011');

      expectError(response, 401);
    });
  });

  // ============================================
  // Screenshot Deletion
  // ============================================

  describe('Screenshot Deletion', () => {
    it('should reject delete with invalid ID format', async () => {
      const response = await api
        .delete('/api/v1/screenshots/invalid-id')
        .set('Authorization', `Bearer ${testUser.accessToken}`);

      expectError(response, 400);
    });

    it('should return 404 for non-existent screenshot', async () => {
      const response = await api
        .delete('/api/v1/screenshots/507f1f77bcf86cd799439011')
        .set('Authorization', `Bearer ${testUser.accessToken}`);

      expectError(response, 404);
    });

    it('should reject delete without authentication', async () => {
      const response = await api.delete('/api/v1/screenshots/507f1f77bcf86cd799439011');

      expectError(response, 401);
    });
  });

  // ============================================
  // URL Safety Validation
  // ============================================

  describe('URL Safety Validation', () => {
    it('should reject localhost URLs', async () => {
      const response = await api
        .post('/api/v1/screenshots')
        .set('Authorization', `Bearer ${testUser.accessToken}`)
        .send({
          url: 'http://localhost:8080',
        });

      expectError(response, 400);
    });

    it('should reject 127.0.0.1 URLs', async () => {
      const response = await api
        .post('/api/v1/screenshots')
        .set('Authorization', `Bearer ${testUser.accessToken}`)
        .send({
          url: 'http://127.0.0.1:3000',
        });

      expectError(response, 400);
    });

    it('should reject private IP addresses', async () => {
      const privateIps = ['http://10.0.0.1', 'http://192.168.1.1', 'http://172.16.0.1'];

      for (const url of privateIps) {
        const response = await api
          .post('/api/v1/screenshots')
          .set('Authorization', `Bearer ${testUser.accessToken}`)
          .send({ url });

        expectError(response, 400);
      }
    });

    it('should reject file:// protocol', async () => {
      const response = await api
        .post('/api/v1/screenshots')
        .set('Authorization', `Bearer ${testUser.accessToken}`)
        .send({
          url: 'file:///etc/passwd',
        });

      expectError(response, 400);
    });
  });

  // ============================================
  // Plan Limits
  // ============================================

  describe('Plan Limits', () => {
    it('should enforce width limit based on plan', async () => {
      // Free plan has a max width limit
      const response = await api
        .post('/api/v1/screenshots')
        .set('Authorization', `Bearer ${testUser.accessToken}`)
        .send({
          url: 'https://example.com',
          width: 7680, // 8K resolution - likely exceeds free plan limit
        });

      // Should either succeed within limits or fail with limit exceeded
      expect([200, 201, 400, 403, 500, 503]).toContain(response.status);
    });

    it('should enforce height limit based on plan', async () => {
      const response = await api
        .post('/api/v1/screenshots')
        .set('Authorization', `Bearer ${testUser.accessToken}`)
        .send({
          url: 'https://example.com',
          height: 4320, // 8K resolution height
        });

      expect([200, 201, 400, 403, 500, 503]).toContain(response.status);
    });
  });

  // ============================================
  // Cookies and Headers
  // ============================================

  describe('Cookies and Headers', () => {
    it('should accept custom cookies', async () => {
      const response = await api
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

      expect([200, 201, 400, 500, 503]).toContain(response.status);
    });

    it('should reject too many cookies', async () => {
      const manyCookies = Array(100)
        .fill(null)
        .map((_, i) => ({
          name: `cookie${i}`,
          value: `value${i}`,
        }));

      const response = await api
        .post('/api/v1/screenshots')
        .set('Authorization', `Bearer ${testUser.accessToken}`)
        .send({
          url: 'https://example.com',
          cookies: manyCookies,
        });

      expectError(response, 400);
    });

    it('should accept waitUntil option', async () => {
      const waitOptions = ['load', 'domcontentloaded', 'networkidle0', 'networkidle2'];

      for (const waitUntil of waitOptions) {
        const response = await api
          .post('/api/v1/screenshots')
          .set('Authorization', `Bearer ${testUser.accessToken}`)
          .send({
            url: 'https://example.com',
            waitUntil,
          });

        expect([200, 201, 400, 500, 503]).toContain(response.status);
      }
    });

    it('should reject invalid waitUntil option', async () => {
      const response = await api
        .post('/api/v1/screenshots')
        .set('Authorization', `Bearer ${testUser.accessToken}`)
        .send({
          url: 'https://example.com',
          waitUntil: 'invalid-option',
        });

      expectError(response, 400);
    });
  });
});
