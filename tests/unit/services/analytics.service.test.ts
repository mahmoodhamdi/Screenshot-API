/**
 * Analytics Service Tests
 */

// Set environment variables before any imports
process.env.JWT_SECRET = 'test-jwt-secret-key-minimum-32-characters-long';
process.env.JWT_REFRESH_SECRET = 'test-jwt-refresh-secret-key-minimum-32-chars';
process.env.NODE_ENV = 'test';

import { Types } from 'mongoose';
import {
  getOverview,
  getScreenshotStats,
  getUsageOverTime,
  getErrorBreakdown,
  getPopularUrls,
  getApiKeyStats,
} from '@services/analytics.service';
import { IUser, PlanLimits, PlanType } from '@/types';

// ============================================
// Mock Models
// ============================================

jest.mock('@models/index', () => ({
  Screenshot: {
    aggregate: jest.fn(),
    countDocuments: jest.fn(),
    exists: jest.fn(),
    findOne: jest.fn(),
  },
  Usage: {
    aggregate: jest.fn(),
    findOneAndUpdate: jest.fn(),
  },
}));

import { Screenshot, Usage } from '@models/index';

const mockScreenshot = Screenshot as jest.Mocked<typeof Screenshot>;
const mockUsage = Usage as jest.Mocked<typeof Usage>;

// ============================================
// Mock User Factory
// ============================================

const createMockUser = (
  overrides: Partial<{
    plan: PlanType;
    usage: { screenshotsThisMonth: number; lastResetDate: Date };
    subscription: Partial<{
      plan: PlanType;
      status: 'active' | 'cancelled' | 'expired' | 'past_due';
    }>;
  }> = {}
): IUser => {
  const defaultLimits: PlanLimits = {
    screenshotsPerMonth: 100,
    maxWidth: 1280,
    maxHeight: 720,
    formats: ['png', 'jpeg'],
    rateLimit: 10,
    fullPage: false,
    customHeaders: false,
    webhooks: false,
    priority: false,
  };

  const now = new Date();
  const lastResetDate = overrides.usage?.lastResetDate || now;

  return {
    _id: new Types.ObjectId(),
    email: 'test@example.com',
    password: 'hashed',
    name: 'Test User',
    isVerified: true,
    isActive: true,
    role: 'user',
    subscription: {
      plan: overrides.subscription?.plan || overrides.plan || 'free',
      status: overrides.subscription?.status || 'active',
    },
    usage: {
      screenshotsThisMonth: overrides.usage?.screenshotsThisMonth ?? 0,
      lastResetDate,
    },
    refreshTokens: [],
    createdAt: new Date(),
    updatedAt: new Date(),
    comparePassword: jest.fn(),
    incrementUsage: jest.fn(),
    resetMonthlyUsage: jest.fn(),
    getPlanLimits: jest.fn().mockReturnValue(defaultLimits),
  } as unknown as IUser;
};

describe('Analytics Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ============================================
  // Overview Tests
  // ============================================

  describe('getOverview', () => {
    it('should return overview stats for user with no screenshots', async () => {
      const user = createMockUser({ plan: 'free' });

      (mockScreenshot.aggregate as jest.Mock).mockResolvedValue([]);
      (mockScreenshot.countDocuments as jest.Mock)
        .mockResolvedValueOnce(0) // today
        .mockResolvedValueOnce(0) // week
        .mockResolvedValueOnce(0); // month

      const result = await getOverview(user);

      expect(result.totalScreenshots).toBe(0);
      expect(result.successfulScreenshots).toBe(0);
      expect(result.failedScreenshots).toBe(0);
      expect(result.successRate).toBe(100);
      expect(result.averageResponseTime).toBe(0);
      expect(result.totalBandwidth).toBe(0);
      expect(result.currentPlan).toBe('free');
    });

    it('should calculate correct stats for user with screenshots', async () => {
      const user = createMockUser({
        plan: 'starter',
        usage: { screenshotsThisMonth: 50, lastResetDate: new Date() },
      });
      user.getPlanLimits = jest.fn().mockReturnValue({
        screenshotsPerMonth: 2000,
        maxWidth: 1920,
        maxHeight: 1080,
        formats: ['png', 'jpeg', 'webp'],
        rateLimit: 30,
        fullPage: true,
        customHeaders: true,
        webhooks: true,
        priority: false,
      });
      user.subscription.plan = 'starter';

      (mockScreenshot.aggregate as jest.Mock).mockResolvedValue([
        {
          _id: null,
          total: 100,
          successful: 90,
          failed: 10,
          totalDuration: 90000,
          totalSize: 10000000,
        },
      ]);
      (mockScreenshot.countDocuments as jest.Mock)
        .mockResolvedValueOnce(10) // today
        .mockResolvedValueOnce(30) // week
        .mockResolvedValueOnce(50); // month

      const result = await getOverview(user);

      expect(result.totalScreenshots).toBe(100);
      expect(result.successfulScreenshots).toBe(90);
      expect(result.failedScreenshots).toBe(10);
      expect(result.successRate).toBe(90);
      expect(result.averageResponseTime).toBe(1000);
      expect(result.totalBandwidth).toBe(10000000);
      expect(result.screenshotsToday).toBe(10);
      expect(result.screenshotsThisWeek).toBe(30);
      expect(result.screenshotsThisMonth).toBe(50);
      expect(result.currentPlan).toBe('starter');
      expect(result.usagePercentage).toBe(3); // 50/2000 * 100 = 2.5 -> rounded to 3
    });

    it('should handle zero plan limit gracefully', async () => {
      const user = createMockUser({ plan: 'free' });
      user.getPlanLimits = jest.fn().mockReturnValue({
        screenshotsPerMonth: 0,
        maxWidth: 1280,
        maxHeight: 720,
        formats: ['png'],
        rateLimit: 10,
        fullPage: false,
        customHeaders: false,
        webhooks: false,
        priority: false,
      });

      (mockScreenshot.aggregate as jest.Mock).mockResolvedValue([]);
      (mockScreenshot.countDocuments as jest.Mock)
        .mockResolvedValueOnce(0)
        .mockResolvedValueOnce(0)
        .mockResolvedValueOnce(0);

      const result = await getOverview(user);

      expect(result.usagePercentage).toBe(0);
    });
  });

  // ============================================
  // Screenshot Stats Tests
  // ============================================

  describe('getScreenshotStats', () => {
    it('should return screenshot statistics', async () => {
      const user = createMockUser();

      (mockScreenshot.aggregate as jest.Mock)
        .mockResolvedValueOnce([
          { _id: 'completed', count: 80 },
          { _id: 'failed', count: 20 },
        ])
        .mockResolvedValueOnce([
          { _id: 'png', count: 60 },
          { _id: 'jpeg', count: 30 },
          { _id: 'webp', count: 10 },
        ])
        .mockResolvedValueOnce([
          { _id: { width: 1280, height: 720 }, count: 50 },
          { _id: { width: 1920, height: 1080 }, count: 30 },
        ])
        .mockResolvedValueOnce([
          {
            _id: null,
            avgDuration: 2500,
            avgSize: 150000,
            fullPage: 20,
            regular: 60,
          },
        ]);

      const result = await getScreenshotStats(user);

      expect(result.byStatus.completed).toBe(80);
      expect(result.byStatus.failed).toBe(20);
      expect(result.byFormat.png).toBe(60);
      expect(result.byFormat.jpeg).toBe(30);
      expect(result.byResolution).toHaveLength(2);
      expect(result.averageDuration).toBe(2500);
      expect(result.averageSize).toBe(150000);
      expect(result.fullPageCount).toBe(20);
      expect(result.regularCount).toBe(60);
    });

    it('should handle date range filter', async () => {
      const user = createMockUser();
      const dateRange = {
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-01-31'),
      };

      (mockScreenshot.aggregate as jest.Mock)
        .mockResolvedValue([]);

      await getScreenshotStats(user, dateRange);

      expect(mockScreenshot.aggregate).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            $match: expect.objectContaining({
              createdAt: expect.objectContaining({
                $gte: dateRange.startDate,
                $lte: dateRange.endDate,
              }),
            }),
          }),
        ])
      );
    });

    it('should return empty stats when no screenshots', async () => {
      const user = createMockUser();

      (mockScreenshot.aggregate as jest.Mock)
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([]);

      const result = await getScreenshotStats(user);

      expect(result.byStatus.pending).toBe(0);
      expect(result.byStatus.completed).toBe(0);
      expect(result.byFormat).toEqual({});
      expect(result.byResolution).toHaveLength(0);
      expect(result.averageDuration).toBe(0);
    });
  });

  // ============================================
  // Usage Over Time Tests
  // ============================================

  describe('getUsageOverTime', () => {
    it('should return daily usage by default', async () => {
      const user = createMockUser();

      (mockUsage.aggregate as jest.Mock).mockResolvedValue([
        {
          _id: '2024-01-15',
          screenshots: 10,
          successful: 8,
          failed: 2,
          bandwidth: 1500000,
          avgResponseTime: 2000,
        },
        {
          _id: '2024-01-16',
          screenshots: 15,
          successful: 14,
          failed: 1,
          bandwidth: 2000000,
          avgResponseTime: 1800,
        },
      ]);

      const result = await getUsageOverTime(user);

      expect(result.period).toBe('day');
      expect(result.data).toHaveLength(2);
      expect(result.data[0].date).toBe('2024-01-15');
      expect(result.data[0].screenshots).toBe(10);
      expect(result.data[0].successful).toBe(8);
    });

    it('should return weekly usage when specified', async () => {
      const user = createMockUser();

      (mockUsage.aggregate as jest.Mock).mockResolvedValue([
        {
          _id: '2024-W03',
          screenshots: 50,
          successful: 45,
          failed: 5,
          bandwidth: 5000000,
          avgResponseTime: 2100,
        },
      ]);

      const result = await getUsageOverTime(user, 'week', 4);

      expect(result.period).toBe('week');
      expect(result.data).toHaveLength(1);
    });

    it('should fall back to Screenshot model when Usage is empty', async () => {
      const user = createMockUser();

      (mockUsage.aggregate as jest.Mock).mockResolvedValue([]);
      (mockScreenshot.aggregate as jest.Mock).mockResolvedValue([
        {
          _id: '2024-01-20',
          screenshots: 5,
          successful: 4,
          failed: 1,
          bandwidth: 500000,
          avgResponseTime: 1500,
        },
      ]);

      const result = await getUsageOverTime(user, 'day', 7);

      expect(result.data).toHaveLength(1);
      expect(mockScreenshot.aggregate).toHaveBeenCalled();
    });
  });

  // ============================================
  // Error Breakdown Tests
  // ============================================

  describe('getErrorBreakdown', () => {
    it('should return error breakdown', async () => {
      const user = createMockUser();

      (mockScreenshot.countDocuments as jest.Mock)
        .mockResolvedValueOnce(100) // total
        .mockResolvedValueOnce(10); // failed

      (mockUsage.aggregate as jest.Mock).mockResolvedValue([]);

      (mockScreenshot.aggregate as jest.Mock).mockResolvedValue([
        {
          _id: 'Navigation timeout of 30000 ms exceeded',
          count: 5,
          lastOccurred: new Date('2024-01-15'),
        },
        {
          _id: 'net::ERR_CONNECTION_REFUSED',
          count: 3,
          lastOccurred: new Date('2024-01-14'),
        },
        {
          _id: 'Invalid URL format',
          count: 2,
          lastOccurred: new Date('2024-01-13'),
        },
      ]);

      const result = await getErrorBreakdown(user);

      expect(result.totalErrors).toBe(10);
      expect(result.errorRate).toBe(10);
      expect(result.topErrors).toHaveLength(3);
      expect(result.byType.timeout).toBe(5);
      expect(result.byType.network).toBe(3);
      expect(result.byType.invalid_url).toBe(2);
    });

    it('should handle zero errors gracefully', async () => {
      const user = createMockUser();

      (mockScreenshot.countDocuments as jest.Mock)
        .mockResolvedValueOnce(50) // total
        .mockResolvedValueOnce(0); // failed

      (mockUsage.aggregate as jest.Mock).mockResolvedValue([]);
      (mockScreenshot.aggregate as jest.Mock).mockResolvedValue([]);

      const result = await getErrorBreakdown(user);

      expect(result.totalErrors).toBe(0);
      expect(result.errorRate).toBe(0);
      expect(result.topErrors).toHaveLength(0);
    });

    it('should categorize errors correctly', async () => {
      const user = createMockUser();

      (mockScreenshot.countDocuments as jest.Mock)
        .mockResolvedValueOnce(100)
        .mockResolvedValueOnce(15);

      (mockUsage.aggregate as jest.Mock).mockResolvedValue([]);

      (mockScreenshot.aggregate as jest.Mock).mockResolvedValue([
        { _id: 'Timeout exceeded', count: 3, lastOccurred: new Date() },
        { _id: 'Network error', count: 3, lastOccurred: new Date() },
        { _id: 'Connection refused', count: 2, lastOccurred: new Date() },
        { _id: 'Navigation failed', count: 2, lastOccurred: new Date() },
        { _id: 'Invalid URL', count: 2, lastOccurred: new Date() },
        { _id: 'Access blocked', count: 2, lastOccurred: new Date() },
        { _id: 'Something else', count: 1, lastOccurred: new Date() },
      ]);

      const result = await getErrorBreakdown(user);

      expect(result.byType.timeout).toBe(3);
      expect(result.byType.network).toBe(5); // Network + Connection
      expect(result.byType.navigation).toBe(2);
      expect(result.byType.invalid_url).toBe(2);
      expect(result.byType.blocked).toBe(2);
      expect(result.byType.other).toBe(1);
    });
  });

  // ============================================
  // Popular URLs Tests
  // ============================================

  describe('getPopularUrls', () => {
    it('should return popular URLs', async () => {
      const user = createMockUser();

      (mockScreenshot.aggregate as jest.Mock).mockResolvedValue([
        {
          _id: 'https://example.com/page1',
          count: 50,
          lastCaptured: new Date('2024-01-20'),
        },
        {
          _id: 'https://google.com',
          count: 30,
          lastCaptured: new Date('2024-01-19'),
        },
        {
          _id: 'https://github.com/repo',
          count: 20,
          lastCaptured: new Date('2024-01-18'),
        },
      ]);

      const result = await getPopularUrls(user, 10);

      expect(result).toHaveLength(3);
      expect(result[0].url).toBe('https://example.com/page1');
      expect(result[0].domain).toBe('example.com');
      expect(result[0].count).toBe(50);
      expect(result[1].domain).toBe('google.com');
    });

    it('should respect limit parameter', async () => {
      const user = createMockUser();

      (mockScreenshot.aggregate as jest.Mock).mockResolvedValue([
        { _id: 'https://example.com', count: 10, lastCaptured: new Date() },
        { _id: 'https://test.com', count: 5, lastCaptured: new Date() },
      ]);

      await getPopularUrls(user, 5);

      expect(mockScreenshot.aggregate).toHaveBeenCalledWith(
        expect.arrayContaining([{ $limit: 5 }])
      );
    });

    it('should handle date range filter', async () => {
      const user = createMockUser();
      const dateRange = {
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-01-31'),
      };

      (mockScreenshot.aggregate as jest.Mock).mockResolvedValue([]);

      await getPopularUrls(user, 10, dateRange);

      expect(mockScreenshot.aggregate).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            $match: expect.objectContaining({
              createdAt: expect.objectContaining({
                $gte: dateRange.startDate,
                $lte: dateRange.endDate,
              }),
            }),
          }),
        ])
      );
    });

    it('should handle malformed URLs gracefully', async () => {
      const user = createMockUser();

      (mockScreenshot.aggregate as jest.Mock).mockResolvedValue([
        {
          _id: 'not-a-valid-url',
          count: 5,
          lastCaptured: new Date(),
        },
      ]);

      const result = await getPopularUrls(user, 10);

      expect(result[0].domain).toBe('not-a-valid-url');
    });
  });

  // ============================================
  // API Key Stats Tests
  // ============================================

  describe('getApiKeyStats', () => {
    it('should return API key statistics', async () => {
      const user = createMockUser();
      const apiKeyId = new Types.ObjectId().toString();

      (mockScreenshot.exists as jest.Mock).mockResolvedValue({ _id: apiKeyId });

      (mockScreenshot.aggregate as jest.Mock)
        .mockResolvedValueOnce([
          { _id: null, total: 100, successful: 95, failed: 5 },
        ])
        .mockResolvedValueOnce([
          { _id: '2024-01-15', count: 20 },
          { _id: '2024-01-16', count: 25 },
        ]);

      (mockScreenshot.findOne as jest.Mock).mockReturnValue({
        sort: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            lean: jest.fn().mockResolvedValue({ createdAt: new Date('2024-01-20') }),
          }),
        }),
      });

      const result = await getApiKeyStats(user, apiKeyId);

      expect(result.totalRequests).toBe(100);
      expect(result.successfulRequests).toBe(95);
      expect(result.failedRequests).toBe(5);
      expect(result.usageByDay).toHaveLength(2);
    });

    it('should throw error for invalid API key ID', async () => {
      const user = createMockUser();

      await expect(getApiKeyStats(user, 'invalid-id')).rejects.toThrow(
        'Invalid API key ID'
      );
    });

    it('should throw error when API key not found', async () => {
      const user = createMockUser();
      const apiKeyId = new Types.ObjectId().toString();

      (mockScreenshot.exists as jest.Mock).mockResolvedValue(null);

      await expect(getApiKeyStats(user, apiKeyId)).rejects.toThrow(
        'API key not found'
      );
    });

    it('should handle API key with no usage', async () => {
      const user = createMockUser();
      const apiKeyId = new Types.ObjectId().toString();

      (mockScreenshot.exists as jest.Mock).mockResolvedValue({ _id: apiKeyId });

      (mockScreenshot.aggregate as jest.Mock)
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([]);

      (mockScreenshot.findOne as jest.Mock).mockReturnValue({
        sort: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            lean: jest.fn().mockResolvedValue(null),
          }),
        }),
      });

      const result = await getApiKeyStats(user, apiKeyId);

      expect(result.totalRequests).toBe(0);
      expect(result.successfulRequests).toBe(0);
      expect(result.failedRequests).toBe(0);
      expect(result.lastUsed).toBeNull();
      expect(result.usageByDay).toHaveLength(0);
    });
  });
});
