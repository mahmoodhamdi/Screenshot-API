/**
 * Auth Integration Tests
 * Tests authentication endpoints with database integration
 */

// Set environment variables before any imports
process.env.JWT_SECRET = 'test-jwt-secret-key-minimum-32-characters-long';
process.env.JWT_REFRESH_SECRET = 'test-jwt-refresh-secret-key-minimum-32-chars';
process.env.NODE_ENV = 'test';

import request from 'supertest';
import app from '@/app';
import { User, ApiKey } from '@models/index';

describe('Auth Endpoints', () => {
  let testUser: {
    email: string;
    password: string;
    name: string;
    accessToken?: string;
    refreshToken?: string;
    userId?: string;
  };

  beforeEach(async () => {
    // Clean up test data before each test
    await User.deleteMany({});
    await ApiKey.deleteMany({});

    testUser = {
      email: 'test@example.com',
      password: 'TestPassword123!',
      name: 'Test User',
    };
  });

  describe('POST /api/v1/auth/register', () => {
    it('should register a new user successfully', async () => {
      const response = await request(app)
        .post('/api/v1/auth/register')
        .send({
          email: testUser.email,
          password: testUser.password,
          name: testUser.name,
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.user.email).toBe(testUser.email);
      expect(response.body.data.tokens.accessToken).toBeDefined();
      expect(response.body.data.tokens.refreshToken).toBeDefined();
    });

    it('should reject duplicate email', async () => {
      // Create first user
      await request(app)
        .post('/api/v1/auth/register')
        .send({
          email: testUser.email,
          password: testUser.password,
          name: testUser.name,
        });

      // Try to register with same email
      const response = await request(app)
        .post('/api/v1/auth/register')
        .send({
          email: testUser.email,
          password: testUser.password,
          name: 'Another User',
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should reject weak password', async () => {
      const response = await request(app)
        .post('/api/v1/auth/register')
        .send({
          email: testUser.email,
          password: 'weak',
          name: testUser.name,
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should reject invalid email format', async () => {
      const response = await request(app)
        .post('/api/v1/auth/register')
        .send({
          email: 'invalid-email',
          password: testUser.password,
          name: testUser.name,
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/v1/auth/login', () => {
    beforeEach(async () => {
      // Create a user before login tests
      await request(app)
        .post('/api/v1/auth/register')
        .send({
          email: testUser.email,
          password: testUser.password,
          name: testUser.name,
        });
    });

    it('should login with valid credentials', async () => {
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password,
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.tokens.accessToken).toBeDefined();
      expect(response.body.data.tokens.refreshToken).toBeDefined();
      expect(response.body.data.user.email).toBe(testUser.email);
    });

    it('should reject invalid password', async () => {
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: testUser.email,
          password: 'WrongPassword123!',
        });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it('should reject non-existent email', async () => {
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: testUser.password,
        });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/v1/auth/me', () => {
    let accessToken: string;

    beforeEach(async () => {
      // Create and login user
      const registerResponse = await request(app)
        .post('/api/v1/auth/register')
        .send({
          email: testUser.email,
          password: testUser.password,
          name: testUser.name,
        });

      accessToken = registerResponse.body.data.tokens.accessToken;
      testUser.userId = registerResponse.body.data.user.id;
    });

    it('should return current user info', async () => {
      const response = await request(app)
        .get('/api/v1/auth/me')
        .set('Authorization', `Bearer ${accessToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.email).toBe(testUser.email);
      expect(response.body.data.name).toBe(testUser.name);
    });

    it('should reject without auth token', async () => {
      const response = await request(app).get('/api/v1/auth/me');

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it('should reject with invalid token', async () => {
      const response = await request(app)
        .get('/api/v1/auth/me')
        .set('Authorization', 'Bearer invalid-token');

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/v1/auth/refresh', () => {
    let refreshToken: string;

    beforeEach(async () => {
      const registerResponse = await request(app)
        .post('/api/v1/auth/register')
        .send({
          email: testUser.email,
          password: testUser.password,
          name: testUser.name,
        });

      refreshToken = registerResponse.body.data.tokens.refreshToken;
    });

    it('should refresh access token', async () => {
      const response = await request(app)
        .post('/api/v1/auth/refresh')
        .send({ refreshToken });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.accessToken).toBeDefined();
      expect(response.body.data.refreshToken).toBeDefined();
    });

    it('should reject invalid refresh token', async () => {
      const response = await request(app)
        .post('/api/v1/auth/refresh')
        .send({ refreshToken: 'invalid-token' });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it('should reject missing refresh token', async () => {
      const response = await request(app)
        .post('/api/v1/auth/refresh')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/v1/auth/logout', () => {
    let accessToken: string;
    let refreshToken: string;

    beforeEach(async () => {
      const registerResponse = await request(app)
        .post('/api/v1/auth/register')
        .send({
          email: testUser.email,
          password: testUser.password,
          name: testUser.name,
        });

      accessToken = registerResponse.body.data.tokens.accessToken;
      refreshToken = registerResponse.body.data.tokens.refreshToken;
    });

    it('should logout successfully', async () => {
      const response = await request(app)
        .post('/api/v1/auth/logout')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ refreshToken });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it('should reject without refresh token', async () => {
      const response = await request(app)
        .post('/api/v1/auth/logout')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  describe('API Key Management', () => {
    let accessToken: string;

    beforeEach(async () => {
      const registerResponse = await request(app)
        .post('/api/v1/auth/register')
        .send({
          email: testUser.email,
          password: testUser.password,
          name: testUser.name,
        });

      accessToken = registerResponse.body.data.tokens.accessToken;
    });

    describe('POST /api/v1/auth/api-keys', () => {
      it('should create an API key', async () => {
        const response = await request(app)
          .post('/api/v1/auth/api-keys')
          .set('Authorization', `Bearer ${accessToken}`)
          .send({ name: 'Test API Key' });

        expect(response.status).toBe(201);
        expect(response.body.success).toBe(true);
        expect(response.body.data.name).toBe('Test API Key');
        expect(response.body.data.key).toBeDefined();
        expect(response.body.data.key.startsWith('ss_')).toBe(true);
      });

      it('should create API key with permissions', async () => {
        const response = await request(app)
          .post('/api/v1/auth/api-keys')
          .set('Authorization', `Bearer ${accessToken}`)
          .send({
            name: 'Limited API Key',
            permissions: ['read', 'screenshot:create'],
          });

        expect(response.status).toBe(201);
        expect(response.body.data.permissions).toEqual(['read', 'screenshot:create']);
      });

      it('should reject without name', async () => {
        const response = await request(app)
          .post('/api/v1/auth/api-keys')
          .set('Authorization', `Bearer ${accessToken}`)
          .send({});

        expect(response.status).toBe(400);
        expect(response.body.success).toBe(false);
      });
    });

    describe('GET /api/v1/auth/api-keys', () => {
      beforeEach(async () => {
        // Create an API key
        await request(app)
          .post('/api/v1/auth/api-keys')
          .set('Authorization', `Bearer ${accessToken}`)
          .send({ name: 'Test Key' });
      });

      it('should list API keys', async () => {
        const response = await request(app)
          .get('/api/v1/auth/api-keys')
          .set('Authorization', `Bearer ${accessToken}`);

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(Array.isArray(response.body.data)).toBe(true);
        expect(response.body.data.length).toBe(1);
        expect(response.body.data[0].name).toBe('Test Key');
        // Key should be masked
        expect(response.body.data[0].maskedKey).toBeDefined();
        expect(response.body.data[0].key).toBeUndefined();
      });
    });

    describe('DELETE /api/v1/auth/api-keys/:id', () => {
      let apiKeyId: string;

      beforeEach(async () => {
        const createResponse = await request(app)
          .post('/api/v1/auth/api-keys')
          .set('Authorization', `Bearer ${accessToken}`)
          .send({ name: 'Key to Delete' });

        apiKeyId = createResponse.body.data.id;
      });

      it('should revoke an API key', async () => {
        const response = await request(app)
          .delete(`/api/v1/auth/api-keys/${apiKeyId}`)
          .set('Authorization', `Bearer ${accessToken}`);

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);

        // Verify key is no longer listed
        const listResponse = await request(app)
          .get('/api/v1/auth/api-keys')
          .set('Authorization', `Bearer ${accessToken}`);

        expect(listResponse.body.data.length).toBe(0);
      });

      it('should reject invalid API key ID', async () => {
        const response = await request(app)
          .delete('/api/v1/auth/api-keys/invalid-id')
          .set('Authorization', `Bearer ${accessToken}`);

        expect(response.status).toBe(400);
      });
    });
  });

  describe('API Key Authentication', () => {
    let apiKey: string;

    beforeEach(async () => {
      // Create a user and API key
      const registerResponse = await request(app)
        .post('/api/v1/auth/register')
        .send({
          email: testUser.email,
          password: testUser.password,
          name: testUser.name,
        });

      const accessToken = registerResponse.body.data.tokens.accessToken;

      const keyResponse = await request(app)
        .post('/api/v1/auth/api-keys')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ name: 'Auth Test Key' });

      apiKey = keyResponse.body.data.key;
    });

    it('should authenticate with X-API-Key header', async () => {
      const response = await request(app)
        .get('/api/v1/auth/me')
        .set('X-API-Key', apiKey);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.email).toBe(testUser.email);
    });

    it('should reject invalid API key', async () => {
      const response = await request(app)
        .get('/api/v1/auth/me')
        .set('X-API-Key', 'ss_invalid_key_12345678901234567890');

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });
});
