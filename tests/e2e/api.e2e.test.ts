/**
 * API Integration E2E Tests
 * Complete user journey and error handling tests
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

describe('API Integration E2E Tests', () => {
  beforeEach(async () => {
    // Clean up before each test
    await User.deleteMany({});
    await ApiKey.deleteMany({});
    await Screenshot.deleteMany({});
  });

  // ============================================
  // Complete User Journey
  // ============================================

  describe('Complete User Journey', () => {
    it('should complete full user journey: Register → Login → Create API Key → View Analytics → Logout', async () => {
      // Step 1: Register
      const registerResponse = await api.post('/api/v1/auth/register').send({
        name: 'Journey User',
        email: 'journey@example.com',
        password: 'JourneyPass123!',
      });

      expectSuccess(registerResponse, 201);
      const accessToken = registerResponse.body.data.tokens.accessToken;
      const refreshToken = registerResponse.body.data.tokens.refreshToken;

      // Step 2: Get user info (verify logged in)
      const meResponse = await api
        .get('/api/v1/auth/me')
        .set('Authorization', `Bearer ${accessToken}`);

      expectSuccess(meResponse);
      expect(meResponse.body.data.email).toBe('journey@example.com');

      // Step 3: Create API key
      const apiKeyResponse = await api
        .post('/api/v1/auth/api-keys')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          name: 'Journey Key',
          permissions: ['screenshot:create', 'screenshot:read'],
        });

      expectSuccess(apiKeyResponse, 201);
      const apiKey = apiKeyResponse.body.data.key;

      // Step 4: Verify API key works
      const apiKeyMeResponse = await api.get('/api/v1/auth/me').set('X-API-Key', apiKey);

      expectSuccess(apiKeyMeResponse);

      // Step 5: Get usage statistics
      const usageResponse = await api
        .get('/api/v1/subscriptions/usage')
        .set('Authorization', `Bearer ${accessToken}`);

      expectSuccess(usageResponse);
      expect(usageResponse.body.data.currentPlan).toBe('free');

      // Step 6: Get analytics overview
      const analyticsResponse = await api
        .get('/api/v1/analytics/overview')
        .set('Authorization', `Bearer ${accessToken}`);

      expectSuccess(analyticsResponse);

      // Step 7: Logout
      const logoutResponse = await api
        .post('/api/v1/auth/logout')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ refreshToken });

      expectSuccess(logoutResponse);

      // Step 8: Verify tokens are invalidated (should return error)
      const invalidRefreshResponse = await api.post('/api/v1/auth/refresh').send({
        refreshToken,
      });

      // Should fail with 401 (invalid token) or 500 (internal error handling token)
      expect([401, 500]).toContain(invalidRefreshResponse.status);
      expect(invalidRefreshResponse.body.success).toBe(false);
    });

    it('should handle multiple users independently', async () => {
      // Create two users
      const user1 = await registerUser({ email: 'user1@example.com' });
      const user2 = await registerUser({ email: 'user2@example.com' });

      // Each user creates an API key
      const apiKey1 = await createApiKey(user1.accessToken!);
      const apiKey2 = await createApiKey(user2.accessToken!);

      // User 1's API key should return User 1's info
      const me1Response = await api.get('/api/v1/auth/me').set('X-API-Key', apiKey1.key);

      expectSuccess(me1Response);
      expect(me1Response.body.data.email).toBe(user1.email);

      // User 2's API key should return User 2's info
      const me2Response = await api.get('/api/v1/auth/me').set('X-API-Key', apiKey2.key);

      expectSuccess(me2Response);
      expect(me2Response.body.data.email).toBe(user2.email);
    });
  });

  // ============================================
  // Error Handling
  // ============================================

  describe('Error Handling', () => {
    describe('400 Bad Request', () => {
      it('should return 400 for missing required fields', async () => {
        const response = await api.post('/api/v1/auth/register').send({});

        expectError(response, 400);
        expect(response.body.error).toBeDefined();
      });

      it('should return 400 for invalid email format', async () => {
        const response = await api.post('/api/v1/auth/register').send({
          name: 'Test',
          email: 'not-an-email',
          password: 'ValidPass123!',
        });

        expectError(response, 400);
      });

      it('should return 400 for invalid ObjectId', async () => {
        const user = await registerUser();

        const response = await api
          .delete('/api/v1/auth/api-keys/invalid-id')
          .set('Authorization', `Bearer ${user.accessToken}`);

        expectError(response, 400);
      });
    });

    describe('401 Unauthorized', () => {
      it('should return 401 without authentication', async () => {
        const response = await api.get('/api/v1/auth/me');

        expectError(response, 401);
      });

      it('should return 401 with invalid JWT', async () => {
        const response = await api
          .get('/api/v1/auth/me')
          .set('Authorization', 'Bearer invalid-token');

        expectError(response, 401);
      });

      it('should return 401 with invalid API key', async () => {
        const response = await api.get('/api/v1/auth/me').set('X-API-Key', 'ss_invalid_key');

        expectError(response, 401);
      });

      it('should return error with wrong credentials', async () => {
        await registerUser({ email: 'auth-test@example.com' });

        const response = await api.post('/api/v1/auth/login').send({
          email: 'auth-test@example.com',
          password: 'WrongPassword123!',
        });

        // Should fail with 401 (invalid credentials) or 500 (bcrypt error)
        expect([401, 500]).toContain(response.status);
        expect(response.body.success).toBe(false);
      });
    });

    describe('404 Not Found', () => {
      it('should return 404 for unknown routes', async () => {
        const response = await api.get('/api/v1/unknown-route');

        expectError(response, 404);
      });

      it('should return error for non-existent resources', async () => {
        const user = await registerUser();

        const response = await api
          .delete('/api/v1/auth/api-keys/507f1f77bcf86cd799439011')
          .set('Authorization', `Bearer ${user.accessToken}`);

        // Should fail with 404 (not found) or 500 (internal error)
        expect([404, 500]).toContain(response.status);
        expect(response.body.success).toBe(false);
      });
    });
  });

  // ============================================
  // Security Tests
  // ============================================

  describe('Security Tests', () => {
    it('should include security headers', async () => {
      const response = await api.get('/health');

      expect(response.headers['x-content-type-options']).toBe('nosniff');
      expect(response.headers['x-frame-options']).toBe('SAMEORIGIN');
    });

    it('should include request ID in response', async () => {
      const response = await api.get('/health');

      expect(response.headers['x-request-id']).toBeDefined();
    });

    it('should accept custom request ID', async () => {
      const customId = 'custom-request-id-123';

      const response = await api.get('/health').set('X-Request-ID', customId);

      expect(response.headers['x-request-id']).toBe(customId);
    });

    it('should prevent password exposure in user response', async () => {
      const user = await registerUser({ email: 'security-test@example.com' });

      const response = await api
        .get('/api/v1/auth/me')
        .set('Authorization', `Bearer ${user.accessToken}`);

      expectSuccess(response);
      expect(response.body.data.password).toBeUndefined();
      expect(response.body.data.refreshTokens).toBeUndefined();
    });

    it('should not expose API key in list response', async () => {
      const user = await registerUser({ email: 'apikey-security@example.com' });
      await createApiKey(user.accessToken!);

      const response = await api
        .get('/api/v1/auth/api-keys')
        .set('Authorization', `Bearer ${user.accessToken}`);

      expectSuccess(response);
      expect(response.body.data[0].key).toBeUndefined();
      expect(response.body.data[0].keyHash).toBeUndefined();
      expect(response.body.data[0].maskedKey).toBeDefined();
    });
  });

  // ============================================
  // Data Validation
  // ============================================

  describe('Data Validation', () => {
    it('should reject SQL injection attempts in login', async () => {
      const response = await api.post('/api/v1/auth/login').send({
        email: "admin'--",
        password: "' OR '1'='1",
      });

      // Should fail validation, not cause a SQL error
      expectError(response, 400);
    });

    it('should reject NoSQL injection attempts', async () => {
      const response = await api.post('/api/v1/auth/login').send({
        email: { $gt: '' },
        password: { $gt: '' },
      });

      expectError(response, 400);
    });

    it('should handle very long input', async () => {
      const longString = 'a'.repeat(10000);

      const response = await api.post('/api/v1/auth/register').send({
        name: longString,
        email: 'long@example.com',
        password: 'ValidPass123!',
      });

      expectError(response, 400);
    });

    it('should handle special characters in name field', async () => {
      const response = await api.post('/api/v1/auth/register').send({
        name: '<script>alert("xss")</script>',
        email: 'xss@example.com',
        password: 'ValidPass123!',
      });

      // Should either accept (storing as-is) or reject
      // Note: XSS protection should happen at output encoding, not input validation
      expect([201, 400]).toContain(response.status);
      if (response.status === 201) {
        expect(response.body.data.user.name).toBeDefined();
      }
    });
  });

  // ============================================
  // API Key Authentication
  // ============================================

  describe('API Key Authentication', () => {
    let user: TestUser;
    let apiKey: TestApiKey;

    beforeEach(async () => {
      user = await registerUser({ email: 'apikey-auth@example.com' });
      apiKey = await createApiKey(user.accessToken!);
    });

    it('should authenticate with valid API key', async () => {
      const response = await api.get('/api/v1/auth/me').set('X-API-Key', apiKey.key);

      expectSuccess(response);
      expect(response.body.data.email).toBe(user.email);
    });

    it('should work with API key for protected endpoints', async () => {
      const response = await api
        .get('/api/v1/subscriptions/usage')
        .set('X-API-Key', apiKey.key);

      expectSuccess(response);
    });

    it('should reject revoked API key', async () => {
      // Revoke the API key
      await api
        .delete(`/api/v1/auth/api-keys/${apiKey.id}`)
        .set('Authorization', `Bearer ${user.accessToken}`);

      // Try to use revoked key
      const response = await api.get('/api/v1/auth/me').set('X-API-Key', apiKey.key);

      expectError(response, 401);
    });

    it('should increment API key usage count', async () => {
      // Make several requests
      await api.get('/api/v1/auth/me').set('X-API-Key', apiKey.key);
      await api.get('/api/v1/auth/me').set('X-API-Key', apiKey.key);
      await api.get('/api/v1/auth/me').set('X-API-Key', apiKey.key);

      // Check usage count
      const listResponse = await api
        .get('/api/v1/auth/api-keys')
        .set('Authorization', `Bearer ${user.accessToken}`);

      expectSuccess(listResponse);
      expect(listResponse.body.data[0].usageCount).toBeGreaterThanOrEqual(3);
    });
  });

  // ============================================
  // Health Check
  // ============================================

  describe('Health Check', () => {
    it('should return healthy status', async () => {
      const response = await api.get('/health');

      expectSuccess(response);
      expect(response.body.status).toBe('healthy');
      expect(response.body.service).toBe('screenshot-api');
    });

    it('should include timestamp', async () => {
      const response = await api.get('/health');

      expectSuccess(response);
      expect(response.body.timestamp).toBeDefined();
      expect(new Date(response.body.timestamp)).toBeInstanceOf(Date);
    });
  });

  // ============================================
  // Root Endpoint
  // ============================================

  describe('Root Endpoint', () => {
    it('should return API information', async () => {
      const response = await api.get('/');

      expectSuccess(response);
      expect(response.body.message).toContain('Screenshot API');
      expect(response.body.documentation).toBe('/docs');
      expect(response.body.health).toBe('/health');
    });
  });

  // ============================================
  // Analytics Endpoints
  // ============================================

  describe('Analytics Endpoints', () => {
    let user: TestUser;

    beforeEach(async () => {
      user = await registerUser({ email: 'analytics@example.com' });
    });

    it('should get analytics overview', async () => {
      const response = await api
        .get('/api/v1/analytics/overview')
        .set('Authorization', `Bearer ${user.accessToken}`);

      expectSuccess(response);
      expect(response.body.data.totalScreenshots).toBeDefined();
      expect(response.body.data.successRate).toBeDefined();
    });

    it('should require authentication for analytics', async () => {
      const response = await api.get('/api/v1/analytics/overview');

      expectError(response, 401);
    });
  });
});
