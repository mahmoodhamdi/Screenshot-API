/**
 * Unit Tests for Screenshot Model
 */

// Set required environment variables before importing modules
process.env.JWT_SECRET = 'test-jwt-secret-key-minimum-32-characters';
process.env.JWT_REFRESH_SECRET = 'test-jwt-refresh-secret-key-minimum-32-chars';
process.env.NODE_ENV = 'test';

import mongoose from 'mongoose';
import Screenshot from '@models/screenshot.model';
import User from '@models/user.model';
import ApiKey from '@models/apiKey.model';

// Extended type for Screenshot with methods
interface ScreenshotWithMethods {
  isExpired: boolean;
  isReady: boolean;
  isFailed: boolean;
  markAsProcessing: () => Promise<void>;
  markAsCompleted: (options: {
    url: string;
    localPath?: string;
    size: number;
    duration: number;
    metadata?: {
      pageTitle?: string;
      pageDescription?: string;
      faviconUrl?: string;
      screenshotWidth?: number;
      screenshotHeight?: number;
    };
  }) => Promise<void>;
  markAsFailed: (error: string) => Promise<void>;
  recordWebhookAttempt: (status: number, response?: string) => Promise<void>;
}

describe('Screenshot Model', () => {
  let testUserId: mongoose.Types.ObjectId;
  let testApiKeyId: mongoose.Types.ObjectId;

  beforeAll(async () => {
    // Create a test user
    const user = await User.create({
      email: 'screenshot-test@example.com',
      password: 'Password123',
      name: 'Test User',
    });
    testUserId = user._id as mongoose.Types.ObjectId;

    // Create a test API key
    const { apiKey } = await ApiKey.createForUser(testUserId, {
      name: 'Test API Key',
    });
    testApiKeyId = apiKey._id as mongoose.Types.ObjectId;
  });

  describe('Screenshot Creation', () => {
    it('should create a screenshot with valid data', async () => {
      const screenshotData = {
        user: testUserId,
        apiKey: testApiKeyId,
        url: 'https://example.com',
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      };

      const screenshot = await Screenshot.create(screenshotData);

      expect(screenshot.url).toBe('https://example.com');
      expect(screenshot.user.toString()).toBe(testUserId.toString());
      expect(screenshot.apiKey.toString()).toBe(testApiKeyId.toString());
      expect(screenshot.result.status).toBe('pending');
    });

    it('should use default options', async () => {
      const screenshot = await Screenshot.create({
        user: testUserId,
        apiKey: testApiKeyId,
        url: 'https://default-options.com',
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      });

      expect(screenshot.options.width).toBe(1280);
      expect(screenshot.options.height).toBe(720);
      expect(screenshot.options.format).toBe('png');
      expect(screenshot.options.fullPage).toBe(false);
    });

    it('should accept custom options', async () => {
      const screenshot = await Screenshot.create({
        user: testUserId,
        apiKey: testApiKeyId,
        url: 'https://custom-options.com',
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        options: {
          width: 1920,
          height: 1080,
          format: 'jpeg',
          quality: 85,
          fullPage: true,
        },
      });

      expect(screenshot.options.width).toBe(1920);
      expect(screenshot.options.height).toBe(1080);
      expect(screenshot.options.format).toBe('jpeg');
      expect(screenshot.options.quality).toBe(85);
      expect(screenshot.options.fullPage).toBe(true);
    });

    it('should fail without required fields', async () => {
      await expect(Screenshot.create({})).rejects.toThrow();
    });

    it('should accept cookies', async () => {
      const screenshot = await Screenshot.create({
        user: testUserId,
        apiKey: testApiKeyId,
        url: 'https://cookies.com',
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        options: {
          cookies: [
            { name: 'session', value: 'abc123', domain: 'example.com' },
          ],
        },
      });

      expect(screenshot.options.cookies).toHaveLength(1);
      expect(screenshot.options.cookies?.[0].name).toBe('session');
    });

    it('should accept clip rect', async () => {
      const screenshot = await Screenshot.create({
        user: testUserId,
        apiKey: testApiKeyId,
        url: 'https://cliprect.com',
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        options: {
          clipRect: { x: 0, y: 0, width: 800, height: 600 },
        },
      });

      expect(screenshot.options.clipRect).toBeDefined();
      expect(screenshot.options.clipRect?.width).toBe(800);
      expect(screenshot.options.clipRect?.height).toBe(600);
    });

    it('should accept webhook configuration', async () => {
      const screenshot = await Screenshot.create({
        user: testUserId,
        apiKey: testApiKeyId,
        url: 'https://webhook.com',
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        webhook: {
          url: 'https://webhook.example.com/callback',
        },
      });

      expect(screenshot.webhook).toBeDefined();
      expect(screenshot.webhook?.url).toBe('https://webhook.example.com/callback');
      expect(screenshot.webhook?.attempts).toBe(0);
    });
  });

  describe('Screenshot Status Management', () => {
    it('should mark as processing', async () => {
      const screenshot = await Screenshot.create({
        user: testUserId,
        apiKey: testApiKeyId,
        url: 'https://processing.com',
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      });

      expect(screenshot.result.status).toBe('pending');

      await (screenshot as unknown as ScreenshotWithMethods).markAsProcessing();

      const updated = await Screenshot.findById(screenshot._id);
      expect(updated?.result.status).toBe('processing');
    });

    it('should mark as completed', async () => {
      const screenshot = await Screenshot.create({
        user: testUserId,
        apiKey: testApiKeyId,
        url: 'https://completed.com',
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      });

      await (screenshot as unknown as ScreenshotWithMethods).markAsCompleted({
        url: 'https://storage.example.com/screenshot.png',
        size: 1024 * 50,
        duration: 2500,
        metadata: {
          pageTitle: 'Example Domain',
          screenshotWidth: 1280,
          screenshotHeight: 720,
        },
      });

      const updated = await Screenshot.findById(screenshot._id);
      expect(updated?.result.status).toBe('completed');
      expect(updated?.result.url).toBe('https://storage.example.com/screenshot.png');
      expect(updated?.result.size).toBe(1024 * 50);
      expect(updated?.result.duration).toBe(2500);
      expect(updated?.metadata?.pageTitle).toBe('Example Domain');
    });

    it('should mark as failed', async () => {
      const screenshot = await Screenshot.create({
        user: testUserId,
        apiKey: testApiKeyId,
        url: 'https://failed.com',
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      });

      await (screenshot as unknown as ScreenshotWithMethods).markAsFailed('Navigation timeout');

      const updated = await Screenshot.findById(screenshot._id);
      expect(updated?.result.status).toBe('failed');
      expect(updated?.result.error).toBe('Navigation timeout');
    });
  });

  describe('Virtual Fields', () => {
    it('should detect expired screenshot', async () => {
      const screenshot = await Screenshot.create({
        user: testUserId,
        apiKey: testApiKeyId,
        url: 'https://expired.com',
        expiresAt: new Date(Date.now() - 1000), // Already expired
      });

      expect((screenshot as unknown as ScreenshotWithMethods).isExpired).toBe(true);
    });

    it('should detect non-expired screenshot', async () => {
      const screenshot = await Screenshot.create({
        user: testUserId,
        apiKey: testApiKeyId,
        url: 'https://not-expired.com',
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      });

      expect((screenshot as unknown as ScreenshotWithMethods).isExpired).toBe(false);
    });

    it('should detect ready screenshot', async () => {
      const screenshot = await Screenshot.create({
        user: testUserId,
        apiKey: testApiKeyId,
        url: 'https://ready.com',
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        result: { status: 'completed' },
      });

      expect((screenshot as unknown as ScreenshotWithMethods).isReady).toBe(true);
    });

    it('should detect failed screenshot', async () => {
      const screenshot = await Screenshot.create({
        user: testUserId,
        apiKey: testApiKeyId,
        url: 'https://failed-virtual.com',
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        result: { status: 'failed', error: 'Test error' },
      });

      expect((screenshot as unknown as ScreenshotWithMethods).isFailed).toBe(true);
    });
  });

  describe('Static Methods', () => {
    it('should find screenshots by user', async () => {
      // Create a dedicated user for this test
      const testUser = await User.create({
        email: 'find-by-user@example.com',
        password: 'Password123',
        name: 'Find By User',
      });

      const { apiKey } = await ApiKey.createForUser(testUser._id as mongoose.Types.ObjectId, {
        name: 'Find By User API Key',
      });

      await Screenshot.create({
        user: testUser._id,
        apiKey: apiKey._id,
        url: 'https://user1.com',
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      });
      await Screenshot.create({
        user: testUser._id,
        apiKey: apiKey._id,
        url: 'https://user2.com',
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      });

      const screenshots = await Screenshot.findByUser(testUser._id as mongoose.Types.ObjectId);
      expect(screenshots).toHaveLength(2);
    });

    it('should filter by status', async () => {
      // Create a dedicated user for this test
      const testUser = await User.create({
        email: 'filter-status@example.com',
        password: 'Password123',
        name: 'Filter Status',
      });

      const { apiKey } = await ApiKey.createForUser(testUser._id as mongoose.Types.ObjectId, {
        name: 'Filter Status API Key',
      });

      await Screenshot.create({
        user: testUser._id,
        apiKey: apiKey._id,
        url: 'https://status-completed.com',
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        result: { status: 'completed' },
      });
      await Screenshot.create({
        user: testUser._id,
        apiKey: apiKey._id,
        url: 'https://status-pending.com',
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        result: { status: 'pending' },
      });

      const completed = await Screenshot.findByUser(testUser._id as mongoose.Types.ObjectId, { status: 'completed' });
      expect(completed).toHaveLength(1);
      expect(completed[0].url).toBe('https://status-completed.com');
    });

    it('should count screenshots by user', async () => {
      // Create a dedicated user for this test
      const testUser = await User.create({
        email: 'count-user@example.com',
        password: 'Password123',
        name: 'Count User',
      });

      const { apiKey } = await ApiKey.createForUser(testUser._id as mongoose.Types.ObjectId, {
        name: 'Count User API Key',
      });

      await Screenshot.create({
        user: testUser._id,
        apiKey: apiKey._id,
        url: 'https://count1.com',
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      });
      await Screenshot.create({
        user: testUser._id,
        apiKey: apiKey._id,
        url: 'https://count2.com',
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      });

      const count = await Screenshot.countByUser(testUser._id as mongoose.Types.ObjectId);
      expect(count).toBe(2);
    });

    it('should find pending screenshots', async () => {
      // Create a dedicated user for this test
      const testUser = await User.create({
        email: 'find-pending@example.com',
        password: 'Password123',
        name: 'Find Pending',
      });

      const { apiKey } = await ApiKey.createForUser(testUser._id as mongoose.Types.ObjectId, {
        name: 'Find Pending API Key',
      });

      await Screenshot.create({
        user: testUser._id,
        apiKey: apiKey._id,
        url: 'https://pending-check.com',
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        result: { status: 'pending' },
      });

      const pending = await Screenshot.findPending();
      expect(pending.length).toBeGreaterThanOrEqual(1);
      const found = pending.find(s => s.url === 'https://pending-check.com');
      expect(found).toBeDefined();
    });

    it('should find screenshot by ID and user', async () => {
      const screenshot = await Screenshot.create({
        user: testUserId,
        apiKey: testApiKeyId,
        url: 'https://find-by-id.com',
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      });

      const found = await Screenshot.findByIdAndUser(
        screenshot._id as mongoose.Types.ObjectId,
        testUserId
      );
      expect(found).not.toBeNull();
      expect(found?.url).toBe('https://find-by-id.com');
    });

    it('should not find screenshot for different user', async () => {
      const otherUser = await User.create({
        email: 'other-user-screenshot@example.com',
        password: 'Password123',
        name: 'Other User',
      });

      const screenshot = await Screenshot.create({
        user: testUserId,
        apiKey: testApiKeyId,
        url: 'https://not-yours.com',
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      });

      const found = await Screenshot.findByIdAndUser(
        screenshot._id as mongoose.Types.ObjectId,
        otherUser._id as mongoose.Types.ObjectId
      );
      expect(found).toBeNull();
    });
  });

  describe('Webhook Recording', () => {
    it('should record webhook attempt', async () => {
      const screenshot = await Screenshot.create({
        user: testUserId,
        apiKey: testApiKeyId,
        url: 'https://webhook-attempt.com',
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        webhook: {
          url: 'https://webhook.example.com/callback',
        },
      });

      await (screenshot as unknown as ScreenshotWithMethods).recordWebhookAttempt(200, 'OK');

      const updated = await Screenshot.findById(screenshot._id);
      expect(updated?.webhook?.status).toBe(200);
      expect(updated?.webhook?.response).toBe('OK');
      expect(updated?.webhook?.attempts).toBe(1);
      expect(updated?.webhook?.sentAt).toBeDefined();
    });
  });

  describe('JSON Transformation', () => {
    it('should not include __v in JSON', async () => {
      const screenshot = await Screenshot.create({
        user: testUserId,
        apiKey: testApiKeyId,
        url: 'https://json-test.com',
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      });

      const json = screenshot.toJSON();
      expect(json).not.toHaveProperty('__v');
    });
  });
});
