/**
 * Login Attempts Service Tests
 */

import { redis } from '@config/redis';
import {
  loginAttemptsService,
  createIdentifier,
  recordFailedAttempt,
  recordSuccessfulLogin,
  isLocked,
  getRemainingAttempts,
  getLockoutExpiry,
  getAttemptInfo,
  unlock,
} from '@services/loginAttempts.service';

// Mock Redis
jest.mock('@config/redis', () => ({
  redis: {
    incr: jest.fn(),
    expire: jest.fn(),
    get: jest.fn(),
    del: jest.fn(),
    setex: jest.fn(),
  },
}));

const mockRedis = redis as jest.Mocked<typeof redis>;

describe('Login Attempts Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createIdentifier', () => {
    it('should create identifier from email and IP', () => {
      const identifier = createIdentifier('Test@Example.com', '192.168.1.1');
      expect(identifier).toBe('test@example.com:192.168.1.1');
    });

    it('should lowercase the email', () => {
      const identifier = createIdentifier('USER@DOMAIN.COM', '10.0.0.1');
      expect(identifier).toBe('user@domain.com:10.0.0.1');
    });
  });

  describe('recordFailedAttempt', () => {
    it('should increment attempt count', async () => {
      mockRedis.incr.mockResolvedValue(1);
      mockRedis.expire.mockResolvedValue(1);

      const result = await recordFailedAttempt('test@example.com:192.168.1.1');

      expect(mockRedis.incr).toHaveBeenCalledWith('login:attempts:test@example.com:192.168.1.1');
      expect(result.count).toBe(1);
      expect(result.isLocked).toBe(false);
      expect(result.remainingAttempts).toBe(4); // 5 max - 1 = 4
    });

    it('should set expiry on first attempt', async () => {
      mockRedis.incr.mockResolvedValue(1);
      mockRedis.expire.mockResolvedValue(1);

      await recordFailedAttempt('test@example.com:192.168.1.1');

      expect(mockRedis.expire).toHaveBeenCalled();
    });

    it('should lock account after 5 attempts', async () => {
      mockRedis.incr.mockResolvedValue(5);
      mockRedis.setex.mockResolvedValue('OK');

      const result = await recordFailedAttempt('test@example.com:192.168.1.1');

      expect(result.isLocked).toBe(true);
      expect(result.remainingAttempts).toBe(0);
      expect(result.lockedUntil).toBeInstanceOf(Date);
      expect(mockRedis.setex).toHaveBeenCalled();
    });

    it('should return correct remaining attempts', async () => {
      mockRedis.incr.mockResolvedValue(3);
      mockRedis.expire.mockResolvedValue(1);

      const result = await recordFailedAttempt('test@example.com:192.168.1.1');

      expect(result.remainingAttempts).toBe(2); // 5 max - 3 = 2
    });

    it('should handle Redis errors gracefully', async () => {
      mockRedis.incr.mockRejectedValue(new Error('Redis connection failed'));

      const result = await recordFailedAttempt('test@example.com:192.168.1.1');

      expect(result.count).toBe(0);
      expect(result.isLocked).toBe(false);
      expect(result.remainingAttempts).toBe(5);
    });
  });

  describe('recordSuccessfulLogin', () => {
    it('should clear attempt count', async () => {
      mockRedis.del.mockResolvedValue(2);

      await recordSuccessfulLogin('test@example.com:192.168.1.1');

      expect(mockRedis.del).toHaveBeenCalledWith(
        'login:attempts:test@example.com:192.168.1.1',
        'login:lockout:test@example.com:192.168.1.1'
      );
    });

    it('should remove lockout', async () => {
      mockRedis.del.mockResolvedValue(2);

      await recordSuccessfulLogin('test@example.com:192.168.1.1');

      // del is called with both keys
      expect(mockRedis.del).toHaveBeenCalledWith(
        expect.stringContaining('attempts'),
        expect.stringContaining('lockout')
      );
    });

    it('should handle Redis errors gracefully', async () => {
      mockRedis.del.mockRejectedValue(new Error('Redis connection failed'));

      // Should not throw
      await expect(recordSuccessfulLogin('test@example.com:192.168.1.1')).resolves.toBeUndefined();
    });
  });

  describe('isLocked', () => {
    it('should return false when not locked', async () => {
      mockRedis.get.mockResolvedValue(null);

      const result = await isLocked('test@example.com:192.168.1.1');

      expect(result).toBe(false);
    });

    it('should return true when locked', async () => {
      const futureTime = Date.now() + 60000; // 1 minute in future
      mockRedis.get.mockResolvedValue(futureTime.toString());

      const result = await isLocked('test@example.com:192.168.1.1');

      expect(result).toBe(true);
    });

    it('should return false and clean up when lockout expired', async () => {
      const pastTime = Date.now() - 60000; // 1 minute in past
      mockRedis.get.mockResolvedValue(pastTime.toString());
      mockRedis.del.mockResolvedValue(1);

      const result = await isLocked('test@example.com:192.168.1.1');

      expect(result).toBe(false);
      expect(mockRedis.del).toHaveBeenCalled();
    });

    it('should handle Redis errors gracefully', async () => {
      mockRedis.get.mockRejectedValue(new Error('Redis connection failed'));

      const result = await isLocked('test@example.com:192.168.1.1');

      expect(result).toBe(false);
    });
  });

  describe('getRemainingAttempts', () => {
    it('should return max attempts for new identifier', async () => {
      mockRedis.get.mockResolvedValue(null);

      const result = await getRemainingAttempts('test@example.com:192.168.1.1');

      expect(result).toBe(5);
    });

    it('should return correct remaining after attempts', async () => {
      mockRedis.get.mockResolvedValue('2');

      const result = await getRemainingAttempts('test@example.com:192.168.1.1');

      expect(result).toBe(3); // 5 - 2 = 3
    });

    it('should return 0 when locked', async () => {
      mockRedis.get.mockResolvedValue('5');

      const result = await getRemainingAttempts('test@example.com:192.168.1.1');

      expect(result).toBe(0);
    });

    it('should handle Redis errors gracefully', async () => {
      mockRedis.get.mockRejectedValue(new Error('Redis connection failed'));

      const result = await getRemainingAttempts('test@example.com:192.168.1.1');

      expect(result).toBe(5);
    });
  });

  describe('getLockoutExpiry', () => {
    it('should return null when not locked', async () => {
      mockRedis.get.mockResolvedValue(null);

      const result = await getLockoutExpiry('test@example.com:192.168.1.1');

      expect(result).toBeNull();
    });

    it('should return expiry date when locked', async () => {
      const futureTime = Date.now() + 60000;
      mockRedis.get.mockResolvedValue(futureTime.toString());

      const result = await getLockoutExpiry('test@example.com:192.168.1.1');

      expect(result).toBeInstanceOf(Date);
      expect(result?.getTime()).toBe(futureTime);
    });

    it('should return null when lockout expired', async () => {
      const pastTime = Date.now() - 60000;
      mockRedis.get.mockResolvedValue(pastTime.toString());

      const result = await getLockoutExpiry('test@example.com:192.168.1.1');

      expect(result).toBeNull();
    });

    it('should handle Redis errors gracefully', async () => {
      mockRedis.get.mockRejectedValue(new Error('Redis connection failed'));

      const result = await getLockoutExpiry('test@example.com:192.168.1.1');

      expect(result).toBeNull();
    });
  });

  describe('getAttemptInfo', () => {
    it('should return full info for new identifier', async () => {
      mockRedis.get.mockResolvedValue(null);

      const result = await getAttemptInfo('test@example.com:192.168.1.1');

      expect(result).toEqual({
        count: 0,
        isLocked: false,
        remainingAttempts: 5,
        lockedUntil: null,
      });
    });

    it('should return locked info when account is locked', async () => {
      const futureTime = Date.now() + 60000;
      mockRedis.get
        .mockResolvedValueOnce('5') // attempts
        .mockResolvedValueOnce(futureTime.toString()); // lockout

      const result = await getAttemptInfo('test@example.com:192.168.1.1');

      expect(result.count).toBe(5);
      expect(result.isLocked).toBe(true);
      expect(result.remainingAttempts).toBe(0);
      expect(result.lockedUntil).toBeInstanceOf(Date);
    });
  });

  describe('unlock', () => {
    it('should clear attempts and lockout', async () => {
      mockRedis.del.mockResolvedValue(2);

      await unlock('test@example.com:192.168.1.1');

      expect(mockRedis.del).toHaveBeenCalledWith(
        'login:attempts:test@example.com:192.168.1.1',
        'login:lockout:test@example.com:192.168.1.1'
      );
    });

    it('should throw on Redis error', async () => {
      mockRedis.del.mockRejectedValue(new Error('Redis connection failed'));

      await expect(unlock('test@example.com:192.168.1.1')).rejects.toThrow('Redis connection failed');
    });
  });

  describe('loginAttemptsService object', () => {
    it('should export all functions', () => {
      expect(loginAttemptsService.createIdentifier).toBeDefined();
      expect(loginAttemptsService.recordFailedAttempt).toBeDefined();
      expect(loginAttemptsService.recordSuccessfulLogin).toBeDefined();
      expect(loginAttemptsService.isLocked).toBeDefined();
      expect(loginAttemptsService.getRemainingAttempts).toBeDefined();
      expect(loginAttemptsService.getLockoutExpiry).toBeDefined();
      expect(loginAttemptsService.getAttemptInfo).toBeDefined();
      expect(loginAttemptsService.unlock).toBeDefined();
      expect(loginAttemptsService.getConfig).toBeDefined();
    });

    it('should return config', () => {
      const config = loginAttemptsService.getConfig();
      expect(config.maxAttempts).toBe(5);
      expect(config.lockoutDuration).toBe(900000); // 15 minutes
      expect(config.attemptWindow).toBe(3600000); // 1 hour
    });
  });
});
