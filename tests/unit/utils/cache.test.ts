/**
 * Cache Utility Tests
 */

import {
  getCachedPlans,
  getCachedUserLimits,
  invalidatePlansCache,
  invalidateUserLimitsCache,
  getCachedAnalytics,
  setCachedAnalytics,
  invalidateAnalyticsCache,
  getCacheStats,
  resetCacheStats,
  CACHE_KEYS,
  CACHE_TTL,
  cacheWrapper,
} from '../../../src/utils/cache';
import * as redisModule from '../../../src/config/redis';

// Mock Redis module
jest.mock('../../../src/config/redis', () => ({
  getCache: jest.fn(),
  setCache: jest.fn(),
  deleteCache: jest.fn(),
  deleteCachePattern: jest.fn(),
  getRedisClient: jest.fn(),
}));

// Mock User model
jest.mock('../../../src/models/user.model', () => ({
  default: {
    findById: jest.fn(),
    find: jest.fn(),
  },
}));

describe('Cache Utility', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    resetCacheStats();
  });

  describe('CACHE_KEYS', () => {
    it('should generate correct plans cache key', () => {
      expect(CACHE_KEYS.PLANS).toBe('cache:plans:all');
    });

    it('should generate correct user limits cache key', () => {
      const userId = '123abc';
      expect(CACHE_KEYS.USER_LIMITS(userId)).toBe(`cache:user:limits:${userId}`);
    });

    it('should generate correct analytics cache key', () => {
      const userId = '123abc';
      const path = '/overview';
      const queryHash = 'abc123';
      expect(CACHE_KEYS.ANALYTICS(userId, path, queryHash)).toBe(
        `cache:analytics:${userId}:${path}:${queryHash}`
      );
    });
  });

  describe('CACHE_TTL', () => {
    it('should have correct TTL values', () => {
      expect(CACHE_TTL.PLANS).toBe(3600); // 1 hour
      expect(CACHE_TTL.USER_LIMITS).toBe(300); // 5 minutes
      expect(CACHE_TTL.ANALYTICS).toBe(60); // 1 minute
      expect(CACHE_TTL.ANALYTICS_OVERVIEW).toBe(30); // 30 seconds
    });
  });

  describe('getCachedPlans', () => {
    it('should return cached plans on cache hit', async () => {
      const cachedPlans = [
        { plan: 'free', name: 'Free', description: 'Basic', price: 0, screenshotsPerMonth: 100 },
      ];
      (redisModule.getCache as jest.Mock).mockResolvedValue(cachedPlans);

      const result = await getCachedPlans();

      expect(redisModule.getCache).toHaveBeenCalledWith(CACHE_KEYS.PLANS);
      expect(result).toEqual(cachedPlans);
    });

    it('should fetch and cache plans on cache miss', async () => {
      (redisModule.getCache as jest.Mock).mockResolvedValue(null);
      (redisModule.setCache as jest.Mock).mockResolvedValue(undefined);

      const result = await getCachedPlans();

      expect(redisModule.getCache).toHaveBeenCalledWith(CACHE_KEYS.PLANS);
      expect(redisModule.setCache).toHaveBeenCalledWith(
        CACHE_KEYS.PLANS,
        expect.any(Array),
        CACHE_TTL.PLANS
      );
      expect(result).toHaveLength(4); // free, starter, professional, enterprise
      expect(result[0].plan).toBe('free');
      expect(result[3].plan).toBe('enterprise');
    });

    it('should return static plans on error', async () => {
      (redisModule.getCache as jest.Mock).mockRejectedValue(new Error('Redis error'));

      const result = await getCachedPlans();

      expect(result).toHaveLength(4);
      expect(result[0].plan).toBe('free');
    });

    it('should track cache hits', async () => {
      (redisModule.getCache as jest.Mock).mockResolvedValue([{ plan: 'free' }]);

      await getCachedPlans();

      const stats = getCacheStats();
      expect(stats.byCategory.plans.hits).toBe(1);
      expect(stats.byCategory.plans.misses).toBe(0);
    });

    it('should track cache misses', async () => {
      (redisModule.getCache as jest.Mock).mockResolvedValue(null);

      await getCachedPlans();

      const stats = getCacheStats();
      expect(stats.byCategory.plans.hits).toBe(0);
      expect(stats.byCategory.plans.misses).toBe(1);
    });
  });

  describe('invalidatePlansCache', () => {
    it('should delete plans cache key', async () => {
      await invalidatePlansCache();

      expect(redisModule.deleteCache).toHaveBeenCalledWith(CACHE_KEYS.PLANS);
    });
  });

  describe('getCachedUserLimits', () => {
    const userId = '507f1f77bcf86cd799439011';
    const User = require('../../../src/models/user.model').default;

    it('should return cached user limits on cache hit', async () => {
      const cachedLimits = {
        plan: 'professional',
        limits: { screenshotsPerMonth: 10000 },
        usage: { screenshotsThisMonth: 500 },
      };
      (redisModule.getCache as jest.Mock).mockResolvedValue(cachedLimits);

      const result = await getCachedUserLimits(userId);

      expect(redisModule.getCache).toHaveBeenCalledWith(CACHE_KEYS.USER_LIMITS(userId));
      expect(result).toEqual(cachedLimits);
    });

    it('should call recordMiss on cache miss', async () => {
      // When cache misses, the function should record a miss
      (redisModule.getCache as jest.Mock).mockResolvedValue(null);
      const mockLean = jest.fn().mockResolvedValue(null); // User not found
      const mockSelect = jest.fn().mockReturnValue({ lean: mockLean });
      User.findById.mockReturnValue({ select: mockSelect });

      await getCachedUserLimits(userId);

      // Check that a miss was recorded
      const stats = getCacheStats();
      expect(stats.byCategory.userLimits.misses).toBeGreaterThanOrEqual(1);
    });

    it('should return null for non-existent user', async () => {
      (redisModule.getCache as jest.Mock).mockResolvedValue(null);
      User.findById.mockReturnValue({
        select: jest.fn().mockReturnValue({
          lean: jest.fn().mockResolvedValue(null),
        }),
      });

      const result = await getCachedUserLimits(userId);

      expect(result).toBeNull();
    });

    it('should return null on error', async () => {
      (redisModule.getCache as jest.Mock).mockRejectedValue(new Error('Redis error'));

      const result = await getCachedUserLimits(userId);

      expect(result).toBeNull();
    });
  });

  describe('invalidateUserLimitsCache', () => {
    it('should delete user limits cache key', async () => {
      const userId = '123abc';

      await invalidateUserLimitsCache(userId);

      expect(redisModule.deleteCache).toHaveBeenCalledWith(CACHE_KEYS.USER_LIMITS(userId));
    });
  });

  describe('Analytics Cache', () => {
    const userId = '123abc';
    const path = '/overview';
    const query = { period: 'day', limit: 30 };

    describe('getCachedAnalytics', () => {
      it('should return cached analytics on cache hit', async () => {
        const cachedData = { total: 100, successful: 95 };
        (redisModule.getCache as jest.Mock).mockResolvedValue(cachedData);

        const result = await getCachedAnalytics(userId, path, query);

        expect(result).toEqual(cachedData);
      });

      it('should return null on cache miss', async () => {
        (redisModule.getCache as jest.Mock).mockResolvedValue(null);

        const result = await getCachedAnalytics(userId, path, query);

        expect(result).toBeNull();
      });

      it('should return null on error', async () => {
        (redisModule.getCache as jest.Mock).mockRejectedValue(new Error('Redis error'));

        const result = await getCachedAnalytics(userId, path, query);

        expect(result).toBeNull();
      });

      it('should track analytics cache hits', async () => {
        (redisModule.getCache as jest.Mock).mockResolvedValue({ data: 'test' });

        await getCachedAnalytics(userId, path, query);

        const stats = getCacheStats();
        expect(stats.byCategory.analytics.hits).toBe(1);
      });

      it('should track analytics cache misses', async () => {
        (redisModule.getCache as jest.Mock).mockResolvedValue(null);

        await getCachedAnalytics(userId, path, query);

        const stats = getCacheStats();
        expect(stats.byCategory.analytics.misses).toBe(1);
      });
    });

    describe('setCachedAnalytics', () => {
      it('should cache analytics data', async () => {
        const data = { total: 100 };

        await setCachedAnalytics(userId, path, query, data);

        expect(redisModule.setCache).toHaveBeenCalled();
      });

      it('should use shorter TTL for overview endpoint', async () => {
        const data = { total: 100 };

        await setCachedAnalytics(userId, '/overview', query, data);

        expect(redisModule.setCache).toHaveBeenCalledWith(
          expect.any(String),
          data,
          CACHE_TTL.ANALYTICS_OVERVIEW
        );
      });

      it('should use standard TTL for other endpoints', async () => {
        const data = { total: 100 };

        await setCachedAnalytics(userId, '/screenshots', query, data);

        expect(redisModule.setCache).toHaveBeenCalledWith(
          expect.any(String),
          data,
          CACHE_TTL.ANALYTICS
        );
      });

      it('should use custom TTL when provided', async () => {
        const data = { total: 100 };
        const customTtl = 120;

        await setCachedAnalytics(userId, path, query, data, customTtl);

        expect(redisModule.setCache).toHaveBeenCalledWith(expect.any(String), data, customTtl);
      });
    });

    describe('invalidateAnalyticsCache', () => {
      it('should delete all analytics cache for user', async () => {
        await invalidateAnalyticsCache(userId);

        expect(redisModule.deleteCachePattern).toHaveBeenCalledWith(
          `cache:analytics:${userId}:*`
        );
      });
    });
  });

  describe('getCacheStats', () => {
    it('should return initial stats with zero values', () => {
      const stats = getCacheStats();

      expect(stats.overall.hits).toBe(0);
      expect(stats.overall.misses).toBe(0);
      expect(stats.overall.errors).toBe(0);
      expect(stats.overall.hitRatio).toBe('0.00%');
    });

    it('should calculate overall hit ratio', async () => {
      // Simulate some hits and misses
      (redisModule.getCache as jest.Mock)
        .mockResolvedValueOnce({ data: 'cached' }) // hit
        .mockResolvedValueOnce({ data: 'cached' }) // hit
        .mockResolvedValueOnce(null); // miss

      await getCachedPlans(); // hit
      await getCachedPlans(); // hit
      await getCachedPlans(); // miss

      const stats = getCacheStats();
      expect(stats.overall.hits).toBe(2);
      expect(stats.overall.misses).toBe(1);
      expect(stats.overall.hitRatio).toBe('66.67%');
    });

    it('should track stats by category', async () => {
      (redisModule.getCache as jest.Mock).mockResolvedValue({ data: 'cached' });

      await getCachedPlans();
      await getCachedAnalytics('user1', '/overview', {});

      const stats = getCacheStats();
      expect(stats.byCategory.plans.hits).toBe(1);
      expect(stats.byCategory.analytics.hits).toBe(1);
    });
  });

  describe('resetCacheStats', () => {
    it('should reset all cache statistics', async () => {
      (redisModule.getCache as jest.Mock).mockResolvedValue({ data: 'cached' });

      await getCachedPlans();
      await getCachedAnalytics('user1', '/overview', {});

      resetCacheStats();

      const stats = getCacheStats();
      expect(stats.overall.hits).toBe(0);
      expect(stats.overall.misses).toBe(0);
      expect(stats.overall.errors).toBe(0);
    });
  });

  describe('cacheWrapper', () => {
    it('should return cached data on cache hit', async () => {
      const cachedData = { result: 'cached' };
      (redisModule.getCache as jest.Mock).mockResolvedValue(cachedData);
      const fetchFn = jest.fn().mockResolvedValue({ result: 'fresh' });

      const result = await cacheWrapper({ key: 'test:key' }, fetchFn);

      expect(result).toEqual(cachedData);
      expect(fetchFn).not.toHaveBeenCalled();
    });

    it('should fetch and cache on cache miss', async () => {
      (redisModule.getCache as jest.Mock).mockResolvedValue(null);
      const freshData = { result: 'fresh' };
      const fetchFn = jest.fn().mockResolvedValue(freshData);

      const result = await cacheWrapper({ key: 'test:key', ttl: 300 }, fetchFn);

      expect(result).toEqual(freshData);
      expect(fetchFn).toHaveBeenCalled();
      expect(redisModule.setCache).toHaveBeenCalledWith('test:key', freshData, 300);
    });

    it('should use default TTL of 300 seconds', async () => {
      (redisModule.getCache as jest.Mock).mockResolvedValue(null);
      const fetchFn = jest.fn().mockResolvedValue({ data: 'test' });

      await cacheWrapper({ key: 'test:key' }, fetchFn);

      expect(redisModule.setCache).toHaveBeenCalledWith('test:key', expect.any(Object), 300);
    });

    it('should fall back to fetch function on error', async () => {
      (redisModule.getCache as jest.Mock).mockRejectedValue(new Error('Redis error'));
      const freshData = { result: 'fresh' };
      const fetchFn = jest.fn().mockResolvedValue(freshData);

      const result = await cacheWrapper({ key: 'test:key' }, fetchFn);

      expect(result).toEqual(freshData);
      expect(fetchFn).toHaveBeenCalled();
    });

    it('should use specified category for metrics', async () => {
      (redisModule.getCache as jest.Mock).mockResolvedValue({ data: 'cached' });
      const fetchFn = jest.fn();

      await cacheWrapper({ key: 'test:key', category: 'plans' }, fetchFn);

      const stats = getCacheStats();
      expect(stats.byCategory.plans.hits).toBe(1);
    });
  });
});
