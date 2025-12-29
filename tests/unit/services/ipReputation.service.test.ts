/**
 * IP Reputation Service Tests
 */

import { redis } from '@config/redis';
import {
  ipReputationService,
  recordLockout,
  markSuspicious,
  isSuspicious,
  getLockoutCount,
  clearReputation,
  getReputationInfo,
} from '@services/ipReputation.service';

// Mock Redis
jest.mock('@config/redis', () => ({
  redis: {
    incr: jest.fn(),
    expire: jest.fn(),
    get: jest.fn(),
    del: jest.fn(),
    setex: jest.fn(),
    exists: jest.fn(),
    ttl: jest.fn(),
  },
}));

const mockRedis = redis as jest.Mocked<typeof redis>;

describe('IP Reputation Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('recordLockout', () => {
    it('should increment lockout count', async () => {
      mockRedis.incr.mockResolvedValue(1);
      mockRedis.expire.mockResolvedValue(1);

      const result = await recordLockout('192.168.1.1');

      expect(mockRedis.incr).toHaveBeenCalledWith('ip:lockouts:192.168.1.1');
      expect(result).toBe(1);
    });

    it('should set expiry on first lockout', async () => {
      mockRedis.incr.mockResolvedValue(1);
      mockRedis.expire.mockResolvedValue(1);

      await recordLockout('192.168.1.1');

      expect(mockRedis.expire).toHaveBeenCalledWith('ip:lockouts:192.168.1.1', 86400);
    });

    it('should mark IP as suspicious after 3 lockouts', async () => {
      mockRedis.incr.mockResolvedValue(3);
      mockRedis.setex.mockResolvedValue('OK');

      await recordLockout('192.168.1.1');

      expect(mockRedis.setex).toHaveBeenCalledWith(
        'ip:suspicious:192.168.1.1',
        3600, // 1 hour default
        '1'
      );
    });

    it('should not mark as suspicious with less than 3 lockouts', async () => {
      mockRedis.incr.mockResolvedValue(2);
      mockRedis.expire.mockResolvedValue(1);

      await recordLockout('192.168.1.1');

      expect(mockRedis.setex).not.toHaveBeenCalled();
    });

    it('should handle Redis errors gracefully', async () => {
      mockRedis.incr.mockRejectedValue(new Error('Redis connection failed'));

      const result = await recordLockout('192.168.1.1');

      expect(result).toBe(0);
    });
  });

  describe('markSuspicious', () => {
    it('should mark IP as suspicious', async () => {
      mockRedis.setex.mockResolvedValue('OK');

      await markSuspicious('192.168.1.1');

      expect(mockRedis.setex).toHaveBeenCalledWith(
        'ip:suspicious:192.168.1.1',
        3600,
        '1'
      );
    });

    it('should handle Redis errors gracefully', async () => {
      mockRedis.setex.mockRejectedValue(new Error('Redis connection failed'));

      // Should not throw
      await expect(markSuspicious('192.168.1.1')).resolves.toBeUndefined();
    });
  });

  describe('isSuspicious', () => {
    it('should return false for new IP', async () => {
      mockRedis.exists.mockResolvedValue(0);

      const result = await isSuspicious('192.168.1.1');

      expect(result).toBe(false);
    });

    it('should return true for marked IP', async () => {
      mockRedis.exists.mockResolvedValue(1);

      const result = await isSuspicious('192.168.1.1');

      expect(result).toBe(true);
    });

    it('should handle Redis errors gracefully', async () => {
      mockRedis.exists.mockRejectedValue(new Error('Redis connection failed'));

      const result = await isSuspicious('192.168.1.1');

      expect(result).toBe(false);
    });
  });

  describe('getLockoutCount', () => {
    it('should return 0 for new IP', async () => {
      mockRedis.get.mockResolvedValue(null);

      const result = await getLockoutCount('192.168.1.1');

      expect(result).toBe(0);
    });

    it('should return correct count', async () => {
      mockRedis.get.mockResolvedValue('5');

      const result = await getLockoutCount('192.168.1.1');

      expect(result).toBe(5);
    });

    it('should handle Redis errors gracefully', async () => {
      mockRedis.get.mockRejectedValue(new Error('Redis connection failed'));

      const result = await getLockoutCount('192.168.1.1');

      expect(result).toBe(0);
    });
  });

  describe('clearReputation', () => {
    it('should clear all reputation data', async () => {
      mockRedis.del.mockResolvedValue(2);

      await clearReputation('192.168.1.1');

      expect(mockRedis.del).toHaveBeenCalledWith(
        'ip:lockouts:192.168.1.1',
        'ip:suspicious:192.168.1.1'
      );
    });

    it('should throw on Redis error', async () => {
      mockRedis.del.mockRejectedValue(new Error('Redis connection failed'));

      await expect(clearReputation('192.168.1.1')).rejects.toThrow('Redis connection failed');
    });
  });

  describe('getReputationInfo', () => {
    it('should return clean reputation for new IP', async () => {
      mockRedis.exists.mockResolvedValue(0);
      mockRedis.get.mockResolvedValue(null);

      const result = await getReputationInfo('192.168.1.1');

      expect(result).toEqual({
        isSuspicious: false,
        lockoutCount: 0,
        suspiciousUntil: null,
      });
    });

    it('should return full reputation for suspicious IP', async () => {
      mockRedis.exists.mockResolvedValue(1);
      mockRedis.get.mockResolvedValue('3');
      mockRedis.ttl.mockResolvedValue(1800); // 30 minutes remaining

      const result = await getReputationInfo('192.168.1.1');

      expect(result.isSuspicious).toBe(true);
      expect(result.lockoutCount).toBe(3);
      expect(result.suspiciousUntil).toBeInstanceOf(Date);
    });

    it('should handle Redis errors gracefully', async () => {
      // When isSuspicious fails, getReputationInfo catches the error and returns defaults
      mockRedis.exists.mockRejectedValue(new Error('Redis connection failed'));
      mockRedis.get.mockRejectedValue(new Error('Redis connection failed'));

      const result = await getReputationInfo('192.168.1.1');

      expect(result).toEqual({
        isSuspicious: false,
        lockoutCount: 0,
        suspiciousUntil: null,
      });
    });
  });

  describe('ipReputationService object', () => {
    it('should export all functions', () => {
      expect(ipReputationService.recordLockout).toBeDefined();
      expect(ipReputationService.markSuspicious).toBeDefined();
      expect(ipReputationService.isSuspicious).toBeDefined();
      expect(ipReputationService.getLockoutCount).toBeDefined();
      expect(ipReputationService.clearReputation).toBeDefined();
      expect(ipReputationService.getReputationInfo).toBeDefined();
      expect(ipReputationService.getConfig).toBeDefined();
    });

    it('should return config', () => {
      const config = ipReputationService.getConfig();
      expect(config.lockoutsToSuspicious).toBe(3);
      expect(config.suspiciousDuration).toBe(3600); // 1 hour
      expect(config.lockoutTrackingDuration).toBe(86400); // 24 hours
    });
  });
});
