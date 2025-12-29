/**
 * Webhook API Integration Tests
 */

// Set environment variables before any imports
process.env.JWT_SECRET = 'test-jwt-secret-key-minimum-32-characters-long';
process.env.JWT_REFRESH_SECRET = 'test-jwt-refresh-secret-key-minimum-32-chars';
process.env.NODE_ENV = 'test';

import request from 'supertest';
import mongoose from 'mongoose';
import app from '../../src/app';
import User from '@models/user.model';
import { WebhookAttempt } from '@models/webhookAttempt.model';
import { generateAccessToken } from '@services/auth.service';

// Mock Bull queue to avoid Redis connection issues in tests
jest.mock('bull', () => {
  return jest.fn().mockImplementation(() => ({
    process: jest.fn(),
    add: jest.fn().mockResolvedValue({ id: 'job-123' }),
    on: jest.fn(),
    close: jest.fn().mockResolvedValue(undefined),
    getWaitingCount: jest.fn().mockResolvedValue(0),
    getActiveCount: jest.fn().mockResolvedValue(0),
    getCompletedCount: jest.fn().mockResolvedValue(0),
    getFailedCount: jest.fn().mockResolvedValue(0),
    getDelayedCount: jest.fn().mockResolvedValue(0),
  }));
});

describe('Webhook API', () => {
  let testUser: InstanceType<typeof User>;
  let accessToken: string;

  beforeEach(async () => {
    // Create test user before each test (since global afterEach clears collections)
    testUser = await User.create({
      email: 'webhook-test@example.com',
      password: 'TestPassword123!',
      name: 'Webhook Test User',
      subscription: {
        plan: 'professional',
        status: 'active',
      },
    });

    // Generate access token
    accessToken = generateAccessToken({
      userId: testUser._id.toString(),
      email: testUser.email,
      role: testUser.role,
    });
  });

  describe('GET /api/v1/webhooks', () => {
    it('should return empty array when no webhooks exist', async () => {
      const response = await request(app)
        .get('/api/v1/webhooks')
        .set('Authorization', `Bearer ${accessToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual([]);
    });

    it('should return user webhook history', async () => {
      // Create some webhook attempts
      await WebhookAttempt.create([
        {
          screenshotId: new mongoose.Types.ObjectId(),
          userId: testUser._id,
          url: 'https://example.com/webhook1',
          payload: { event: 'test1' },
          status: 'success',
        },
        {
          screenshotId: new mongoose.Types.ObjectId(),
          userId: testUser._id,
          url: 'https://example.com/webhook2',
          payload: { event: 'test2' },
          status: 'failed',
        },
      ]);

      const response = await request(app)
        .get('/api/v1/webhooks')
        .set('Authorization', `Bearer ${accessToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(2);
    });

    it('should respect limit parameter', async () => {
      // Create more webhook attempts
      const webhooks = [];
      for (let i = 0; i < 10; i++) {
        webhooks.push({
          screenshotId: new mongoose.Types.ObjectId(),
          userId: testUser._id,
          url: `https://example.com/webhook${i}`,
          payload: { event: `test${i}` },
          status: 'pending',
        });
      }
      await WebhookAttempt.create(webhooks);

      const response = await request(app)
        .get('/api/v1/webhooks?limit=5')
        .set('Authorization', `Bearer ${accessToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveLength(5);
    });

    it('should require authentication', async () => {
      const response = await request(app).get('/api/v1/webhooks');

      expect(response.status).toBe(401);
    });

    it('should not return webhooks from other users', async () => {
      // Create another user
      const otherUser = await User.create({
        email: 'other-webhook-test@example.com',
        password: 'TestPassword123!',
        name: 'Other User',
      });

      // Create webhook for other user
      await WebhookAttempt.create({
        screenshotId: new mongoose.Types.ObjectId(),
        userId: otherUser._id,
        url: 'https://example.com/other-webhook',
        payload: { event: 'other' },
        status: 'success',
      });

      const response = await request(app)
        .get('/api/v1/webhooks')
        .set('Authorization', `Bearer ${accessToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveLength(0);

      // Cleanup
      await User.deleteOne({ _id: otherUser._id });
    });
  });

  describe('GET /api/v1/webhooks/:id', () => {
    it('should return webhook attempt details', async () => {
      const webhook = await WebhookAttempt.create({
        screenshotId: new mongoose.Types.ObjectId(),
        userId: testUser._id,
        url: 'https://example.com/webhook',
        payload: { event: 'test' },
        status: 'success',
        responseStatus: 200,
      });

      const response = await request(app)
        .get(`/api/v1/webhooks/${webhook._id}`)
        .set('Authorization', `Bearer ${accessToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.url).toBe('https://example.com/webhook');
      expect(response.body.data.status).toBe('success');
    });

    it('should return 404 for non-existent webhook', async () => {
      const fakeId = new mongoose.Types.ObjectId();

      const response = await request(app)
        .get(`/api/v1/webhooks/${fakeId}`)
        .set('Authorization', `Bearer ${accessToken}`);

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });

    it('should return 404 for webhook belonging to another user', async () => {
      // Create another user
      const otherUser = await User.create({
        email: 'other2-webhook-test@example.com',
        password: 'TestPassword123!',
        name: 'Other User 2',
      });

      const webhook = await WebhookAttempt.create({
        screenshotId: new mongoose.Types.ObjectId(),
        userId: otherUser._id,
        url: 'https://example.com/webhook',
        payload: { event: 'test' },
        status: 'success',
      });

      const response = await request(app)
        .get(`/api/v1/webhooks/${webhook._id}`)
        .set('Authorization', `Bearer ${accessToken}`);

      expect(response.status).toBe(404);

      // Cleanup
      await User.deleteOne({ _id: otherUser._id });
    });

    it('should require authentication', async () => {
      const response = await request(app).get(`/api/v1/webhooks/${new mongoose.Types.ObjectId()}`);

      expect(response.status).toBe(401);
    });

    it('should validate ID format', async () => {
      const response = await request(app)
        .get('/api/v1/webhooks/invalid-id')
        .set('Authorization', `Bearer ${accessToken}`);

      expect(response.status).toBe(400);
    });
  });

  describe('POST /api/v1/webhooks/:id/retry', () => {
    it('should retry a failed webhook', async () => {
      const webhook = await WebhookAttempt.create({
        screenshotId: new mongoose.Types.ObjectId(),
        userId: testUser._id,
        url: 'https://example.com/webhook',
        payload: { event: 'test' },
        status: 'failed',
        attempts: 5,
        errorMessage: 'Connection timeout',
      });

      const response = await request(app)
        .post(`/api/v1/webhooks/${webhook._id}/retry`)
        .set('Authorization', `Bearer ${accessToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Webhook retry queued');

      // Verify the webhook was reset
      const updatedWebhook = await WebhookAttempt.findById(webhook._id);
      expect(updatedWebhook?.status).toBe('pending');
      expect(updatedWebhook?.attempts).toBe(0);
    });

    it('should return 400 for non-failed webhook', async () => {
      const webhook = await WebhookAttempt.create({
        screenshotId: new mongoose.Types.ObjectId(),
        userId: testUser._id,
        url: 'https://example.com/webhook',
        payload: { event: 'test' },
        status: 'success',
      });

      const response = await request(app)
        .post(`/api/v1/webhooks/${webhook._id}/retry`)
        .set('Authorization', `Bearer ${accessToken}`);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should return 400 for non-existent webhook', async () => {
      const fakeId = new mongoose.Types.ObjectId();

      const response = await request(app)
        .post(`/api/v1/webhooks/${fakeId}/retry`)
        .set('Authorization', `Bearer ${accessToken}`);

      expect(response.status).toBe(400);
    });

    it('should require authentication', async () => {
      const response = await request(app).post(
        `/api/v1/webhooks/${new mongoose.Types.ObjectId()}/retry`
      );

      expect(response.status).toBe(401);
    });
  });

  describe('GET /api/v1/webhooks/secret', () => {
    it('should return user webhook secret', async () => {
      const response = await request(app)
        .get('/api/v1/webhooks/secret')
        .set('Authorization', `Bearer ${accessToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('secret');
      expect(typeof response.body.data.secret).toBe('string');
      expect(response.body.data.secret.length).toBe(64); // 32 bytes hex = 64 chars
    });

    it('should require authentication', async () => {
      const response = await request(app).get('/api/v1/webhooks/secret');

      expect(response.status).toBe(401);
    });
  });

  describe('POST /api/v1/webhooks/secret/regenerate', () => {
    it('should regenerate webhook secret', async () => {
      // Get current secret
      const beforeResponse = await request(app)
        .get('/api/v1/webhooks/secret')
        .set('Authorization', `Bearer ${accessToken}`);

      const oldSecret = beforeResponse.body.data.secret;

      // Regenerate
      const response = await request(app)
        .post('/api/v1/webhooks/secret/regenerate')
        .set('Authorization', `Bearer ${accessToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('secret');
      expect(response.body.message).toBe('Webhook secret regenerated');

      // Verify it's different
      expect(response.body.data.secret).not.toBe(oldSecret);
      expect(response.body.data.secret.length).toBe(64);
    });

    it('should require authentication', async () => {
      const response = await request(app).post('/api/v1/webhooks/secret/regenerate');

      expect(response.status).toBe(401);
    });
  });
});
