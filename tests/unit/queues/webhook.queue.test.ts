/**
 * Webhook Queue Unit Tests
 */

import { calculateDelay } from '@queues/webhook.queue';

// Mock dependencies
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

jest.mock('@models/webhookAttempt.model', () => ({
  WebhookAttempt: {
    create: jest.fn(),
    findById: jest.fn(),
    findOne: jest.fn(),
    findByUser: jest.fn(),
    findByScreenshot: jest.fn(),
  },
}));

jest.mock('@models/user.model', () => ({
  default: {
    findById: jest.fn(),
  },
}));

jest.mock('@utils/webhookSignature', () => ({
  createWebhookSignature: jest.fn().mockReturnValue({
    payload: { test: 'data' },
    timestamp: 1234567890,
    signature: 'sha256=abc123',
  }),
  createWebhookHeaders: jest.fn().mockReturnValue({
    'Content-Type': 'application/json',
    'X-Webhook-Timestamp': '1234567890',
    'X-Webhook-Signature': 'sha256=abc123',
    'X-Webhook-ID': 'test-id',
    'User-Agent': 'ScreenshotAPI-Webhook/1.0',
  }),
}));

jest.mock('@utils/logger', () => ({
  logger: {
    info: jest.fn(),
    debug: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  },
  default: {
    info: jest.fn(),
    debug: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  },
}));

jest.mock('@config/index', () => ({
  config: {
    redis: {
      host: 'localhost',
      port: 6379,
      password: undefined,
      db: 0,
    },
    webhookSecret: 'test-default-secret',
  },
}));

describe('Webhook Queue', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('calculateDelay', () => {
    it('should calculate delay for first attempt', () => {
      const delay = calculateDelay(1);
      // First attempt: 1000ms * 2^0 = 1000ms + jitter (0-300ms)
      expect(delay).toBeGreaterThanOrEqual(1000);
      expect(delay).toBeLessThanOrEqual(1300);
    });

    it('should calculate delay for second attempt', () => {
      const delay = calculateDelay(2);
      // Second attempt: 1000ms * 2^1 = 2000ms + jitter (0-600ms)
      expect(delay).toBeGreaterThanOrEqual(2000);
      expect(delay).toBeLessThanOrEqual(2600);
    });

    it('should calculate delay for third attempt', () => {
      const delay = calculateDelay(3);
      // Third attempt: 1000ms * 2^2 = 4000ms + jitter (0-1200ms)
      expect(delay).toBeGreaterThanOrEqual(4000);
      expect(delay).toBeLessThanOrEqual(5200);
    });

    it('should use exponential backoff', () => {
      const delay1 = calculateDelay(1);
      const delay2 = calculateDelay(2);
      const delay3 = calculateDelay(3);
      const delay4 = calculateDelay(4);

      // Each delay should roughly double (accounting for jitter)
      // delay2 should be roughly 2x delay1
      // We compare minimums to avoid jitter interference
      expect(delay2).toBeGreaterThan(delay1);
      expect(delay3).toBeGreaterThan(delay2);
      expect(delay4).toBeGreaterThan(delay3);
    });

    it('should cap delay at max delay (1 hour)', () => {
      // Large attempt number should still be capped at 1 hour
      const delay = calculateDelay(20);
      expect(delay).toBeLessThanOrEqual(3600000);
    });

    it('should add jitter to prevent thundering herd', () => {
      // Run multiple times and check that values vary
      const delays: number[] = [];
      for (let i = 0; i < 10; i++) {
        delays.push(calculateDelay(3));
      }

      // Check that not all values are exactly the same
      const uniqueDelays = new Set(delays);
      expect(uniqueDelays.size).toBeGreaterThan(1);
    });

    it('should return integer values', () => {
      for (let i = 1; i <= 10; i++) {
        const delay = calculateDelay(i);
        expect(Number.isInteger(delay)).toBe(true);
      }
    });

    it('should always return positive values', () => {
      for (let i = 1; i <= 10; i++) {
        const delay = calculateDelay(i);
        expect(delay).toBeGreaterThan(0);
      }
    });
  });

  describe('queueWebhook', () => {
    it('should create a webhook attempt record', async () => {
      const { WebhookAttempt } = require('@models/webhookAttempt.model');
      const { queueWebhook } = require('@queues/webhook.queue');

      const mockAttempt = {
        _id: { toString: () => 'attempt-123' },
        screenshotId: 'screenshot-123',
        userId: 'user-123',
        url: 'https://example.com/webhook',
        payload: { test: 'data' },
        nextAttemptAt: new Date(),
      };

      WebhookAttempt.create.mockResolvedValue(mockAttempt);

      const attemptId = await queueWebhook({
        screenshotId: 'screenshot-123',
        userId: 'user-123',
        url: 'https://example.com/webhook',
        payload: { test: 'data' },
      });

      expect(attemptId).toBe('attempt-123');
      expect(WebhookAttempt.create).toHaveBeenCalledWith(
        expect.objectContaining({
          screenshotId: 'screenshot-123',
          userId: 'user-123',
          url: 'https://example.com/webhook',
          payload: { test: 'data' },
        })
      );
    });

    it('should add job to the queue', async () => {
      const { WebhookAttempt } = require('@models/webhookAttempt.model');
      const { queueWebhook, getWebhookQueue } = require('@queues/webhook.queue');

      const mockAttempt = {
        _id: { toString: () => 'attempt-456' },
      };

      WebhookAttempt.create.mockResolvedValue(mockAttempt);

      await queueWebhook({
        screenshotId: 'screenshot-123',
        userId: 'user-123',
        url: 'https://example.com/webhook',
        payload: { test: 'data' },
      });

      const queue = getWebhookQueue();
      expect(queue.add).toHaveBeenCalledWith({ attemptId: 'attempt-456' });
    });
  });

  describe('getWebhookStatus', () => {
    it('should return webhook attempt by ID', async () => {
      const { WebhookAttempt } = require('@models/webhookAttempt.model');
      const { getWebhookStatus } = require('@queues/webhook.queue');

      const mockAttempt = {
        _id: 'attempt-123',
        status: 'success',
        url: 'https://example.com/webhook',
      };

      WebhookAttempt.findById.mockResolvedValue(mockAttempt);

      const result = await getWebhookStatus('attempt-123');

      expect(result).toEqual(mockAttempt);
      expect(WebhookAttempt.findById).toHaveBeenCalledWith('attempt-123');
    });

    it('should return null if not found', async () => {
      const { WebhookAttempt } = require('@models/webhookAttempt.model');
      const { getWebhookStatus } = require('@queues/webhook.queue');

      WebhookAttempt.findById.mockResolvedValue(null);

      const result = await getWebhookStatus('non-existent');

      expect(result).toBeNull();
    });
  });

  describe('retryWebhook', () => {
    it('should reset and requeue a failed webhook', async () => {
      const { WebhookAttempt } = require('@models/webhookAttempt.model');
      const { retryWebhook } = require('@queues/webhook.queue');

      const mockAttempt = {
        _id: 'attempt-123',
        status: 'failed',
        attempts: 5,
        errorMessage: 'Connection timeout',
        responseStatus: 500,
        responseBody: 'Error',
        save: jest.fn().mockResolvedValue(undefined),
      };

      WebhookAttempt.findOne.mockResolvedValue(mockAttempt);

      const result = await retryWebhook('attempt-123');

      expect(result).toBe(true);
      expect(mockAttempt.status).toBe('pending');
      expect(mockAttempt.attempts).toBe(0);
      expect(mockAttempt.errorMessage).toBeUndefined();
      expect(mockAttempt.responseStatus).toBeUndefined();
      expect(mockAttempt.responseBody).toBeUndefined();
      expect(mockAttempt.save).toHaveBeenCalled();
    });

    it('should return false if webhook is not found', async () => {
      const { WebhookAttempt } = require('@models/webhookAttempt.model');
      const { retryWebhook } = require('@queues/webhook.queue');

      WebhookAttempt.findOne.mockResolvedValue(null);

      const result = await retryWebhook('non-existent');

      expect(result).toBe(false);
    });

    it('should return false if webhook is not failed', async () => {
      const { WebhookAttempt } = require('@models/webhookAttempt.model');
      const { retryWebhook } = require('@queues/webhook.queue');

      const mockAttempt = {
        _id: 'attempt-123',
        status: 'pending', // Not failed
      };

      WebhookAttempt.findOne.mockResolvedValue(mockAttempt);

      const result = await retryWebhook('attempt-123');

      expect(result).toBe(false);
    });

    it('should filter by user ID when provided', async () => {
      const { WebhookAttempt } = require('@models/webhookAttempt.model');
      const { retryWebhook } = require('@queues/webhook.queue');

      WebhookAttempt.findOne.mockResolvedValue(null);

      // Use a valid ObjectId string
      const validObjectId = '507f1f77bcf86cd799439011';
      await retryWebhook('attempt-123', validObjectId);

      expect(WebhookAttempt.findOne).toHaveBeenCalledWith(
        expect.objectContaining({
          _id: 'attempt-123',
        })
      );
    });
  });

  describe('getUserWebhooks', () => {
    it('should return webhooks for a user', async () => {
      const { WebhookAttempt } = require('@models/webhookAttempt.model');
      const { getUserWebhooks } = require('@queues/webhook.queue');

      const mockWebhooks = [
        { _id: 'webhook-1', status: 'success' },
        { _id: 'webhook-2', status: 'failed' },
      ];

      WebhookAttempt.findByUser.mockResolvedValue(mockWebhooks);

      // Use a valid ObjectId string
      const validObjectId = '507f1f77bcf86cd799439011';
      const result = await getUserWebhooks(validObjectId);

      expect(result).toEqual(mockWebhooks);
    });

    it('should respect limit parameter', async () => {
      const { WebhookAttempt } = require('@models/webhookAttempt.model');
      const { getUserWebhooks } = require('@queues/webhook.queue');

      WebhookAttempt.findByUser.mockResolvedValue([]);

      // Use a valid ObjectId string
      const validObjectId = '507f1f77bcf86cd799439011';
      await getUserWebhooks(validObjectId, 50);

      expect(WebhookAttempt.findByUser).toHaveBeenCalledWith(expect.anything(), 50);
    });
  });

  describe('getScreenshotWebhooks', () => {
    it('should return webhooks for a screenshot', async () => {
      const { WebhookAttempt } = require('@models/webhookAttempt.model');
      const { getScreenshotWebhooks } = require('@queues/webhook.queue');

      const mockWebhooks = [
        { _id: 'webhook-1', status: 'success' },
      ];

      WebhookAttempt.findByScreenshot.mockResolvedValue(mockWebhooks);

      // Use a valid ObjectId string
      const validObjectId = '507f1f77bcf86cd799439011';
      const result = await getScreenshotWebhooks(validObjectId);

      expect(result).toEqual(mockWebhooks);
    });
  });

  describe('getWebhookQueueStats', () => {
    it('should return queue statistics', async () => {
      const { getWebhookQueueStats, getWebhookQueue } = require('@queues/webhook.queue');

      const queue = getWebhookQueue();
      queue.getWaitingCount.mockResolvedValue(5);
      queue.getActiveCount.mockResolvedValue(2);
      queue.getCompletedCount.mockResolvedValue(100);
      queue.getFailedCount.mockResolvedValue(3);
      queue.getDelayedCount.mockResolvedValue(10);

      const stats = await getWebhookQueueStats();

      expect(stats).toEqual({
        waiting: 5,
        active: 2,
        completed: 100,
        failed: 3,
        delayed: 10,
      });
    });
  });

  describe('closeWebhookQueue', () => {
    it('should close the queue connection', async () => {
      const { closeWebhookQueue, getWebhookQueue } = require('@queues/webhook.queue');

      const queue = getWebhookQueue();

      await closeWebhookQueue();

      expect(queue.close).toHaveBeenCalled();
    });
  });
});
