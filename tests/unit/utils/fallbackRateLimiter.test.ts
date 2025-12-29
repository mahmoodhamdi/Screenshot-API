/**
 * Fallback Rate Limiter Tests
 */

import { InMemoryRateLimiter } from '../../../src/utils/fallbackRateLimiter';

describe('InMemoryRateLimiter', () => {
  let rateLimiter: InMemoryRateLimiter;

  beforeEach(() => {
    rateLimiter = new InMemoryRateLimiter(60000);
  });

  afterEach(() => {
    rateLimiter.destroy();
  });

  describe('check', () => {
    it('should allow requests under limit', async () => {
      const result = await rateLimiter.check('test-key', 5, 60000);
      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(4);
      expect(result.total).toBe(5);
    });

    it('should block requests over limit', async () => {
      const key = 'block-test';
      const max = 3;

      // Make requests up to limit
      for (let i = 0; i < max; i++) {
        await rateLimiter.check(key, max, 60000);
      }

      // Next request should be blocked
      const result = await rateLimiter.check(key, max, 60000);
      expect(result.allowed).toBe(false);
      expect(result.remaining).toBe(0);
    });

    it('should track remaining requests correctly', async () => {
      const key = 'remaining-test';
      const max = 5;

      for (let i = 0; i < max; i++) {
        const result = await rateLimiter.check(key, max, 60000);
        expect(result.remaining).toBe(max - i - 1);
      }
    });

    it('should reset after window expires', async () => {
      const key = 'expire-test';
      const max = 2;
      const windowMs = 100; // Short window for testing

      // Use up all requests
      await rateLimiter.check(key, max, windowMs);
      await rateLimiter.check(key, max, windowMs);

      // Should be blocked
      let result = await rateLimiter.check(key, max, windowMs);
      expect(result.allowed).toBe(false);

      // Wait for window to expire
      await new Promise((resolve) => setTimeout(resolve, 150));

      // Should be allowed again
      result = await rateLimiter.check(key, max, windowMs);
      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(max - 1);
    });

    it('should track per-key limits independently', async () => {
      const max = 2;

      await rateLimiter.check('key-1', max, 60000);
      await rateLimiter.check('key-1', max, 60000);
      await rateLimiter.check('key-2', max, 60000);

      // key-1 should be blocked
      const result1 = await rateLimiter.check('key-1', max, 60000);
      expect(result1.allowed).toBe(false);

      // key-2 should still have remaining
      const result2 = await rateLimiter.check('key-2', max, 60000);
      expect(result2.allowed).toBe(true);
    });

    it('should include reset time', async () => {
      const now = Date.now();
      const windowMs = 60000;

      const result = await rateLimiter.check('test-key', 5, windowMs);

      expect(result.resetAt).toBeGreaterThan(now);
      expect(result.resetAt).toBeLessThanOrEqual(now + windowMs + 100);
    });
  });

  describe('increment', () => {
    it('should increment counter', async () => {
      const count1 = await rateLimiter.increment('inc-key', 60000);
      expect(count1).toBe(1);

      const count2 = await rateLimiter.increment('inc-key', 60000);
      expect(count2).toBe(2);
    });

    it('should reset after window expires', async () => {
      await rateLimiter.increment('inc-expire', 100);
      await rateLimiter.increment('inc-expire', 100);

      await new Promise((resolve) => setTimeout(resolve, 150));

      const count = await rateLimiter.increment('inc-expire', 100);
      expect(count).toBe(1);
    });
  });

  describe('decrement', () => {
    it('should decrement counter', async () => {
      await rateLimiter.increment('dec-key', 60000);
      await rateLimiter.increment('dec-key', 60000);

      const count = await rateLimiter.decrement('dec-key');
      expect(count).toBe(1);
    });

    it('should not go below zero', async () => {
      const count = await rateLimiter.decrement('nonexistent-key');
      expect(count).toBe(0);
    });
  });

  describe('get', () => {
    it('should return current count', async () => {
      await rateLimiter.increment('get-key', 60000);
      await rateLimiter.increment('get-key', 60000);

      const count = await rateLimiter.get('get-key');
      expect(count).toBe(2);
    });

    it('should return 0 for non-existent key', async () => {
      const count = await rateLimiter.get('nonexistent');
      expect(count).toBe(0);
    });

    it('should return 0 for expired key', async () => {
      await rateLimiter.increment('expire-get', 100);

      await new Promise((resolve) => setTimeout(resolve, 150));

      const count = await rateLimiter.get('expire-get');
      expect(count).toBe(0);
    });
  });

  describe('delete', () => {
    it('should delete a key', async () => {
      await rateLimiter.increment('delete-key', 60000);

      const deleted = await rateLimiter.delete('delete-key');
      expect(deleted).toBe(true);

      const count = await rateLimiter.get('delete-key');
      expect(count).toBe(0);
    });

    it('should return false for non-existent key', async () => {
      const deleted = await rateLimiter.delete('nonexistent');
      expect(deleted).toBe(false);
    });
  });

  describe('exists', () => {
    it('should return true for existing key', async () => {
      await rateLimiter.increment('exists-key', 60000);

      const exists = await rateLimiter.exists('exists-key');
      expect(exists).toBe(true);
    });

    it('should return false for non-existent key', async () => {
      const exists = await rateLimiter.exists('nonexistent');
      expect(exists).toBe(false);
    });

    it('should return false for expired key', async () => {
      await rateLimiter.increment('expire-exists', 100);

      await new Promise((resolve) => setTimeout(resolve, 150));

      const exists = await rateLimiter.exists('expire-exists');
      expect(exists).toBe(false);
    });
  });

  describe('expire', () => {
    it('should update expiry time', async () => {
      await rateLimiter.increment('expire-test', 1000);

      // Extend expiry
      const result = await rateLimiter.expire('expire-test', 10);
      expect(result).toBe(true);

      // Key should still exist after a short delay
      await new Promise((resolve) => setTimeout(resolve, 50));
      const exists = await rateLimiter.exists('expire-test');
      expect(exists).toBe(true);
    });

    it('should return false for non-existent key', async () => {
      const result = await rateLimiter.expire('nonexistent', 10);
      expect(result).toBe(false);
    });
  });

  describe('getStats', () => {
    it('should return statistics', async () => {
      await rateLimiter.check('stats-key', 5, 60000);
      await rateLimiter.check('stats-key', 5, 60000);

      const stats = rateLimiter.getStats();
      expect(stats.totalKeys).toBe(1);
      expect(stats.totalChecks).toBe(2);
      expect(stats.totalBlocked).toBe(0);
      expect(stats.memoryUsageEstimate).toBeGreaterThan(0);
    });

    it('should track blocked requests', async () => {
      const max = 2;
      await rateLimiter.check('block-stats', max, 60000);
      await rateLimiter.check('block-stats', max, 60000);
      await rateLimiter.check('block-stats', max, 60000); // Blocked

      const stats = rateLimiter.getStats();
      expect(stats.totalBlocked).toBe(1);
    });
  });

  describe('clear', () => {
    it('should clear all entries', async () => {
      await rateLimiter.increment('key-1', 60000);
      await rateLimiter.increment('key-2', 60000);

      rateLimiter.clear();

      const stats = rateLimiter.getStats();
      expect(stats.totalKeys).toBe(0);
    });
  });

  describe('cleanup', () => {
    it('should cleanup expired entries', async () => {
      // Create rate limiter with short cleanup interval
      const rl = new InMemoryRateLimiter(100);

      await rl.increment('cleanup-test', 50);

      // Wait for entry to expire and cleanup to run
      await new Promise((resolve) => setTimeout(resolve, 200));

      const exists = await rl.exists('cleanup-test');
      expect(exists).toBe(false);

      rl.destroy();
    });
  });

  describe('destroy', () => {
    it('should stop cleanup interval and clear store', () => {
      rateLimiter.destroy();

      const stats = rateLimiter.getStats();
      expect(stats.totalKeys).toBe(0);
    });
  });
});
