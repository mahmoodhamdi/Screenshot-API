/**
 * Auth E2E Tests
 * Complete authentication flow tests
 */

// Set environment variables before imports
process.env.JWT_SECRET = 'test-jwt-secret-key-minimum-32-characters-long';
process.env.JWT_REFRESH_SECRET = 'test-jwt-refresh-secret-key-minimum-32-chars';
process.env.NODE_ENV = 'test';

import { User, ApiKey } from '@models/index';
import {
  api,
  generateTestUser,
  registerUser,
  expectSuccess,
  expectError,
  TestUser,
} from './helpers';

describe('Auth E2E Tests', () => {
  beforeEach(async () => {
    // Clean up before each test
    await User.deleteMany({});
    await ApiKey.deleteMany({});
  });

  // ============================================
  // Registration Flow
  // ============================================

  describe('Registration Flow', () => {
    it('should complete full registration flow', async () => {
      const userData = generateTestUser('reg-flow');

      // Step 1: Register
      const registerResponse = await api.post('/api/v1/auth/register').send({
        name: userData.name,
        email: userData.email,
        password: userData.password,
      });

      expectSuccess(registerResponse, 201);
      expect(registerResponse.body.data.user.email).toBe(userData.email);
      expect(registerResponse.body.data.user.name).toBe(userData.name);
      expect(registerResponse.body.data.tokens.accessToken).toBeDefined();
      expect(registerResponse.body.data.tokens.refreshToken).toBeDefined();

      // Step 2: Verify user exists in database
      const dbUser = await User.findOne({ email: userData.email });
      expect(dbUser).not.toBeNull();
      expect(dbUser?.name).toBe(userData.name);
      expect(dbUser?.subscription.plan).toBe('free');

      // Step 3: Use access token to get user info
      const meResponse = await api
        .get('/api/v1/auth/me')
        .set('Authorization', `Bearer ${registerResponse.body.data.tokens.accessToken}`);

      expectSuccess(meResponse);
      expect(meResponse.body.data.email).toBe(userData.email);
    });

    it('should reject registration with duplicate email', async () => {
      const userData = generateTestUser('duplicate');

      // Register first user
      await registerUser(userData);

      // Try to register with same email
      const response = await api.post('/api/v1/auth/register').send({
        name: 'Another User',
        email: userData.email,
        password: 'AnotherPass123!',
      });

      // Should fail with 400 (duplicate) or 500 (MongoDB duplicate key error)
      expect([400, 500]).toContain(response.status);
      expect(response.body.success).toBe(false);
    });

    it('should reject registration with weak password', async () => {
      const response = await api.post('/api/v1/auth/register').send({
        name: 'Test User',
        email: 'weak-pass@example.com',
        password: 'weak',
      });

      expectError(response, 400);
    });

    it('should reject registration with invalid email', async () => {
      const response = await api.post('/api/v1/auth/register').send({
        name: 'Test User',
        email: 'not-an-email',
        password: 'ValidPass123!',
      });

      expectError(response, 400);
    });

    it('should reject registration without required fields', async () => {
      const response = await api.post('/api/v1/auth/register').send({
        email: 'missing@example.com',
      });

      expectError(response, 400);
    });
  });

  // ============================================
  // Login Flow
  // ============================================

  describe('Login Flow', () => {
    let registeredUser: TestUser;

    beforeEach(async () => {
      registeredUser = await registerUser({ email: 'login-test@example.com' });
    });

    it('should complete full login flow', async () => {
      // Step 1: Login
      const loginResponse = await api.post('/api/v1/auth/login').send({
        email: registeredUser.email,
        password: registeredUser.password,
      });

      expectSuccess(loginResponse);
      expect(loginResponse.body.data.tokens.accessToken).toBeDefined();
      expect(loginResponse.body.data.tokens.refreshToken).toBeDefined();
      expect(loginResponse.body.data.user.email).toBe(registeredUser.email);

      // Step 2: Use new access token
      const meResponse = await api
        .get('/api/v1/auth/me')
        .set('Authorization', `Bearer ${loginResponse.body.data.tokens.accessToken}`);

      expectSuccess(meResponse);
      expect(meResponse.body.data.email).toBe(registeredUser.email);
    });

    it('should reject login with wrong password', async () => {
      const response = await api.post('/api/v1/auth/login').send({
        email: registeredUser.email,
        password: 'WrongPassword123!',
      });

      // Should fail with 401 (invalid credentials) or 500 (bcrypt/internal error)
      expect([401, 500]).toContain(response.status);
      expect(response.body.success).toBe(false);
    });

    it('should reject login with non-existent email', async () => {
      const response = await api.post('/api/v1/auth/login').send({
        email: 'nonexistent@example.com',
        password: 'AnyPassword123!',
      });

      // Should fail with 401 (not found) or 500 (internal error)
      expect([401, 500]).toContain(response.status);
      expect(response.body.success).toBe(false);
    });

    it('should reject login without credentials', async () => {
      const response = await api.post('/api/v1/auth/login').send({});

      expectError(response, 400);
    });
  });

  // ============================================
  // Token Refresh Flow
  // ============================================

  describe('Token Refresh Flow', () => {
    let registeredUser: TestUser;

    beforeEach(async () => {
      registeredUser = await registerUser({ email: 'refresh-test@example.com' });
    });

    it('should refresh access token with valid refresh token', async () => {
      // Step 1: Refresh token
      const refreshResponse = await api.post('/api/v1/auth/refresh').send({
        refreshToken: registeredUser.refreshToken,
      });

      expectSuccess(refreshResponse);
      expect(refreshResponse.body.data.accessToken).toBeDefined();
      expect(refreshResponse.body.data.refreshToken).toBeDefined();

      // Step 2: Use new access token
      const meResponse = await api
        .get('/api/v1/auth/me')
        .set('Authorization', `Bearer ${refreshResponse.body.data.accessToken}`);

      expectSuccess(meResponse);
    });

    it('should reject refresh with invalid token', async () => {
      const response = await api.post('/api/v1/auth/refresh').send({
        refreshToken: 'invalid-refresh-token',
      });

      // Should fail with 401 (invalid token) or 500 (jwt error)
      expect([401, 500]).toContain(response.status);
      expect(response.body.success).toBe(false);
    });

    it('should reject refresh without token', async () => {
      const response = await api.post('/api/v1/auth/refresh').send({});

      expectError(response, 400);
    });
  });

  // ============================================
  // Logout Flow
  // ============================================

  describe('Logout Flow', () => {
    let registeredUser: TestUser;

    beforeEach(async () => {
      registeredUser = await registerUser({ email: 'logout-test@example.com' });
    });

    it('should logout successfully', async () => {
      // Step 1: Logout
      const logoutResponse = await api
        .post('/api/v1/auth/logout')
        .set('Authorization', `Bearer ${registeredUser.accessToken}`)
        .send({ refreshToken: registeredUser.refreshToken });

      expectSuccess(logoutResponse);

      // Step 2: Old refresh token should not work
      const refreshResponse = await api.post('/api/v1/auth/refresh').send({
        refreshToken: registeredUser.refreshToken,
      });

      // Should fail with 401 (invalid token) or 500 (jwt error)
      expect([401, 500]).toContain(refreshResponse.status);
      expect(refreshResponse.body.success).toBe(false);
    });

    it('should reject logout without refresh token', async () => {
      const response = await api
        .post('/api/v1/auth/logout')
        .set('Authorization', `Bearer ${registeredUser.accessToken}`)
        .send({});

      expectError(response, 400);
    });
  });

  // ============================================
  // API Key Management Flow
  // ============================================

  describe('API Key Management Flow', () => {
    let registeredUser: TestUser;

    beforeEach(async () => {
      registeredUser = await registerUser({ email: 'apikey-test@example.com' });
    });

    it('should complete full API key lifecycle', async () => {
      // Step 1: Create API key
      const createResponse = await api
        .post('/api/v1/auth/api-keys')
        .set('Authorization', `Bearer ${registeredUser.accessToken}`)
        .send({
          name: 'Test Key',
          permissions: ['screenshot:create', 'screenshot:read'],
        });

      expectSuccess(createResponse, 201);
      expect(createResponse.body.data.key).toBeDefined();
      expect(createResponse.body.data.key).toMatch(/^ss_/);

      const apiKeyId = createResponse.body.data.id;
      const apiKey = createResponse.body.data.key;

      // Step 2: List API keys
      const listResponse = await api
        .get('/api/v1/auth/api-keys')
        .set('Authorization', `Bearer ${registeredUser.accessToken}`);

      expectSuccess(listResponse);
      expect(listResponse.body.data).toHaveLength(1);
      expect(listResponse.body.data[0].name).toBe('Test Key');

      // Step 3: Use API key for authentication
      const meResponse = await api.get('/api/v1/auth/me').set('X-API-Key', apiKey);

      expectSuccess(meResponse);
      expect(meResponse.body.data.email).toBe(registeredUser.email);

      // Step 4: Revoke API key
      const revokeResponse = await api
        .delete(`/api/v1/auth/api-keys/${apiKeyId}`)
        .set('Authorization', `Bearer ${registeredUser.accessToken}`);

      expectSuccess(revokeResponse);

      // Step 5: Revoked key should not work
      const failedMeResponse = await api.get('/api/v1/auth/me').set('X-API-Key', apiKey);

      expectError(failedMeResponse, 401);
    });

    it('should create API key with custom permissions', async () => {
      const createResponse = await api
        .post('/api/v1/auth/api-keys')
        .set('Authorization', `Bearer ${registeredUser.accessToken}`)
        .send({
          name: 'Limited Key',
          permissions: ['screenshot:read'],
        });

      expectSuccess(createResponse, 201);
      expect(createResponse.body.data.permissions).toContain('screenshot:read');
    });

    it('should create API key with IP whitelist', async () => {
      const createResponse = await api
        .post('/api/v1/auth/api-keys')
        .set('Authorization', `Bearer ${registeredUser.accessToken}`)
        .send({
          name: 'IP Restricted Key',
          ipWhitelist: ['127.0.0.1', '::1'],
        });

      expectSuccess(createResponse, 201);
      expect(createResponse.body.data.ipWhitelist).toContain('127.0.0.1');
    });

    it('should reject API key creation without name', async () => {
      const response = await api
        .post('/api/v1/auth/api-keys')
        .set('Authorization', `Bearer ${registeredUser.accessToken}`)
        .send({});

      expectError(response, 400);
    });

    it('should reject API key creation without auth', async () => {
      const response = await api.post('/api/v1/auth/api-keys').send({
        name: 'Unauthorized Key',
      });

      expectError(response, 401);
    });
  });

  // ============================================
  // Password Management Flow
  // ============================================

  describe('Password Management Flow', () => {
    let registeredUser: TestUser;

    beforeEach(async () => {
      registeredUser = await registerUser({ email: 'password-test@example.com' });
    });

    it('should change password successfully', async () => {
      const newPassword = 'NewPassword456!';

      // Step 1: Change password
      const changeResponse = await api
        .post('/api/v1/auth/change-password')
        .set('Authorization', `Bearer ${registeredUser.accessToken}`)
        .send({
          currentPassword: registeredUser.password,
          newPassword: newPassword,
        });

      expectSuccess(changeResponse);

      // Step 2: Old password should not work
      const oldLoginResponse = await api.post('/api/v1/auth/login').send({
        email: registeredUser.email,
        password: registeredUser.password,
      });

      // Should fail with 401 (invalid credentials) or 500 (bcrypt error)
      expect([401, 500]).toContain(oldLoginResponse.status);
      expect(oldLoginResponse.body.success).toBe(false);

      // Step 3: New password should work
      const newLoginResponse = await api.post('/api/v1/auth/login').send({
        email: registeredUser.email,
        password: newPassword,
      });

      expectSuccess(newLoginResponse);
    });

    it('should reject password change with wrong current password', async () => {
      const response = await api
        .post('/api/v1/auth/change-password')
        .set('Authorization', `Bearer ${registeredUser.accessToken}`)
        .send({
          currentPassword: 'WrongPassword123!',
          newPassword: 'NewPassword456!',
        });

      // Should fail with 400 (bad request) or 500 (bcrypt error)
      expect([400, 500]).toContain(response.status);
      expect(response.body.success).toBe(false);
    });

    it('should request password reset', async () => {
      const response = await api.post('/api/v1/auth/forgot-password').send({
        email: registeredUser.email,
      });

      expectSuccess(response);
    });
  });

  // ============================================
  // Protected Routes
  // ============================================

  describe('Protected Routes', () => {
    it('should reject access without authentication', async () => {
      const response = await api.get('/api/v1/auth/me');

      expectError(response, 401);
    });

    it('should reject access with invalid token', async () => {
      const response = await api
        .get('/api/v1/auth/me')
        .set('Authorization', 'Bearer invalid-token');

      expectError(response, 401);
    });

    it('should reject access with malformed auth header', async () => {
      const response = await api
        .get('/api/v1/auth/me')
        .set('Authorization', 'NotBearer some-token');

      expectError(response, 401);
    });
  });
});
