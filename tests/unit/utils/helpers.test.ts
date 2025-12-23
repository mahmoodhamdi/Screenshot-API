/**
 * Unit Tests for Helper Functions
 */

// Set required environment variables before importing modules
process.env.JWT_SECRET = 'test-jwt-secret-key-minimum-32-characters';
process.env.JWT_REFRESH_SECRET = 'test-jwt-refresh-secret-key-minimum-32-chars';
process.env.NODE_ENV = 'test';

import {
  generateRandomString,
  generateApiKey,
  hashString,
  hashApiKey,
  generateUUID,
  sleep,
  retryWithBackoff,
  isValidUrl,
  sanitizeUrl,
  parseDuration,
  formatBytes,
  formatDuration,
  calculatePercentage,
  daysUntil,
  getMonthStart,
  getMonthEnd,
  isCurrentMonth,
  maskString,
  deepClone,
  pick,
  omit,
  isProduction,
  isDevelopment,
  isTest,
  safeJsonParse,
  truncate,
  toQueryString,
  getClientIp,
} from '@utils/helpers';

describe('Helper Functions', () => {
  describe('generateRandomString', () => {
    it('should generate a string of specified length', () => {
      const result = generateRandomString(16);
      expect(result).toHaveLength(16);
    });

    it('should generate different strings on each call', () => {
      const result1 = generateRandomString(32);
      const result2 = generateRandomString(32);
      expect(result1).not.toBe(result2);
    });

    it('should use default length of 32', () => {
      const result = generateRandomString();
      expect(result).toHaveLength(32);
    });

    it('should use custom charset', () => {
      const result = generateRandomString(10, '0123456789');
      expect(result).toMatch(/^[0-9]+$/);
    });
  });

  describe('generateApiKey', () => {
    it('should generate an API key with correct prefix', () => {
      const key = generateApiKey();
      expect(key).toMatch(/^ss_/);
    });

    it('should generate unique keys', () => {
      const key1 = generateApiKey();
      const key2 = generateApiKey();
      expect(key1).not.toBe(key2);
    });
  });

  describe('hashString', () => {
    it('should produce consistent hashes', () => {
      const hash1 = hashString('test');
      const hash2 = hashString('test');
      expect(hash1).toBe(hash2);
    });

    it('should produce different hashes for different inputs', () => {
      const hash1 = hashString('test1');
      const hash2 = hashString('test2');
      expect(hash1).not.toBe(hash2);
    });

    it('should produce 64 character hex string', () => {
      const hash = hashString('test');
      expect(hash).toHaveLength(64);
      expect(hash).toMatch(/^[a-f0-9]+$/);
    });
  });

  describe('hashApiKey', () => {
    it('should hash API keys consistently', () => {
      const key = 'ss_test123';
      const hash1 = hashApiKey(key);
      const hash2 = hashApiKey(key);
      expect(hash1).toBe(hash2);
    });
  });

  describe('generateUUID', () => {
    it('should generate valid UUID v4', () => {
      const uuid = generateUUID();
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      expect(uuid).toMatch(uuidRegex);
    });

    it('should generate unique UUIDs', () => {
      const uuid1 = generateUUID();
      const uuid2 = generateUUID();
      expect(uuid1).not.toBe(uuid2);
    });
  });

  describe('sleep', () => {
    it('should delay for specified duration', async () => {
      const start = Date.now();
      await sleep(100);
      const elapsed = Date.now() - start;
      expect(elapsed).toBeGreaterThanOrEqual(95);
      expect(elapsed).toBeLessThan(200);
    });
  });

  describe('retryWithBackoff', () => {
    it('should return result on first success', async () => {
      const fn = jest.fn().mockResolvedValue('success');
      const result = await retryWithBackoff(fn, 3, 10);
      expect(result).toBe('success');
      expect(fn).toHaveBeenCalledTimes(1);
    });

    it('should retry on failure', async () => {
      const fn = jest
        .fn()
        .mockRejectedValueOnce(new Error('fail'))
        .mockResolvedValue('success');
      const result = await retryWithBackoff(fn, 3, 10);
      expect(result).toBe('success');
      expect(fn).toHaveBeenCalledTimes(2);
    });

    it('should throw after max retries', async () => {
      const fn = jest.fn().mockRejectedValue(new Error('always fail'));
      await expect(retryWithBackoff(fn, 2, 10)).rejects.toThrow('always fail');
      expect(fn).toHaveBeenCalledTimes(3);
    });
  });

  describe('isValidUrl', () => {
    it('should validate http URLs', () => {
      expect(isValidUrl('http://example.com')).toBe(true);
    });

    it('should validate https URLs', () => {
      expect(isValidUrl('https://example.com')).toBe(true);
    });

    it('should reject invalid URLs', () => {
      expect(isValidUrl('not-a-url')).toBe(false);
    });

    it('should reject non-http protocols', () => {
      expect(isValidUrl('ftp://example.com')).toBe(false);
    });

    it('should handle URLs with paths and query strings', () => {
      expect(isValidUrl('https://example.com/path?query=value')).toBe(true);
    });
  });

  describe('sanitizeUrl', () => {
    it('should redact sensitive query parameters', () => {
      const url = 'https://example.com?token=secret&api_key=key123';
      const sanitized = sanitizeUrl(url);
      // URL encodes brackets, so check for encoded or unencoded
      expect(sanitized.includes('[REDACTED]') || sanitized.includes('%5BREDACTED%5D')).toBe(true);
      expect(sanitized).not.toContain('secret');
      expect(sanitized).not.toContain('key123');
    });

    it('should preserve non-sensitive parameters', () => {
      const url = 'https://example.com?page=1&limit=20';
      const sanitized = sanitizeUrl(url);
      expect(sanitized).toContain('page=1');
      expect(sanitized).toContain('limit=20');
    });

    it('should handle invalid URLs gracefully', () => {
      const result = sanitizeUrl('not-a-url');
      expect(result).toBe('not-a-url');
    });
  });

  describe('parseDuration', () => {
    it('should parse seconds', () => {
      expect(parseDuration('30s')).toBe(30000);
    });

    it('should parse minutes', () => {
      expect(parseDuration('5m')).toBe(300000);
    });

    it('should parse hours', () => {
      expect(parseDuration('2h')).toBe(7200000);
    });

    it('should parse days', () => {
      expect(parseDuration('7d')).toBe(604800000);
    });

    it('should parse weeks', () => {
      expect(parseDuration('1w')).toBe(604800000);
    });

    it('should throw on invalid format', () => {
      expect(() => parseDuration('invalid')).toThrow();
    });
  });

  describe('formatBytes', () => {
    it('should format bytes', () => {
      expect(formatBytes(0)).toBe('0 Bytes');
      expect(formatBytes(500)).toBe('500 Bytes');
    });

    it('should format kilobytes', () => {
      expect(formatBytes(1024)).toBe('1 KB');
    });

    it('should format megabytes', () => {
      expect(formatBytes(1048576)).toBe('1 MB');
    });

    it('should format with decimals', () => {
      expect(formatBytes(1536, 1)).toBe('1.5 KB');
    });
  });

  describe('formatDuration', () => {
    it('should format milliseconds', () => {
      expect(formatDuration(500)).toBe('500ms');
    });

    it('should format seconds', () => {
      expect(formatDuration(2500)).toBe('2.5s');
    });

    it('should format minutes and seconds', () => {
      expect(formatDuration(65000)).toBe('1m 5s');
    });

    it('should format hours and minutes', () => {
      expect(formatDuration(3665000)).toBe('1h 1m');
    });
  });

  describe('calculatePercentage', () => {
    it('should calculate percentage correctly', () => {
      expect(calculatePercentage(50, 100)).toBe(50);
    });

    it('should handle zero total', () => {
      expect(calculatePercentage(50, 0)).toBe(0);
    });

    it('should respect decimal places', () => {
      expect(calculatePercentage(1, 3, 2)).toBe(33.33);
    });
  });

  describe('daysUntil', () => {
    it('should calculate days until future date', () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 5);
      expect(daysUntil(futureDate)).toBeGreaterThanOrEqual(4);
      expect(daysUntil(futureDate)).toBeLessThanOrEqual(6);
    });

    it('should return 0 for past dates', () => {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 5);
      expect(daysUntil(pastDate)).toBe(0);
    });
  });

  describe('getMonthStart', () => {
    it('should return first day of current month', () => {
      const start = getMonthStart();
      expect(start.getDate()).toBe(1);
      expect(start.getHours()).toBe(0);
      expect(start.getMinutes()).toBe(0);
    });
  });

  describe('getMonthEnd', () => {
    it('should return last day of current month', () => {
      const end = getMonthEnd();
      expect(end.getDate()).toBeGreaterThanOrEqual(28);
      expect(end.getHours()).toBe(23);
      expect(end.getMinutes()).toBe(59);
    });
  });

  describe('isCurrentMonth', () => {
    it('should return true for dates in current month', () => {
      expect(isCurrentMonth(new Date())).toBe(true);
    });

    it('should return false for dates in other months', () => {
      const otherMonth = new Date();
      otherMonth.setMonth(otherMonth.getMonth() - 2);
      expect(isCurrentMonth(otherMonth)).toBe(false);
    });
  });

  describe('maskString', () => {
    it('should mask middle of string', () => {
      expect(maskString('1234567890', 2)).toBe('12******90');
    });

    it('should mask short strings completely', () => {
      expect(maskString('abc', 4)).toBe('***');
    });

    it('should use default visible chars', () => {
      expect(maskString('1234567890abcd')).toBe('1234******abcd');
    });
  });

  describe('deepClone', () => {
    it('should create deep copy of object', () => {
      const original = { a: 1, b: { c: 2 } };
      const clone = deepClone(original);
      clone.b.c = 3;
      expect(original.b.c).toBe(2);
    });

    it('should handle arrays', () => {
      const original = [1, [2, 3]];
      const clone = deepClone(original);
      expect(clone).toEqual(original);
      expect(clone).not.toBe(original);
    });
  });

  describe('pick', () => {
    it('should pick specified keys', () => {
      const obj = { a: 1, b: 2, c: 3 };
      const result = pick(obj, ['a', 'c']);
      expect(result).toEqual({ a: 1, c: 3 });
    });

    it('should ignore missing keys', () => {
      const obj = { a: 1 };
      const result = pick(obj, ['a', 'b' as keyof typeof obj]);
      expect(result).toEqual({ a: 1 });
    });
  });

  describe('omit', () => {
    it('should omit specified keys', () => {
      const obj = { a: 1, b: 2, c: 3 };
      const result = omit(obj, ['b']);
      expect(result).toEqual({ a: 1, c: 3 });
    });
  });

  describe('environment checks', () => {
    it('isProduction should check NODE_ENV', () => {
      const original = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';
      expect(isProduction()).toBe(true);
      process.env.NODE_ENV = original;
    });

    it('isDevelopment should check NODE_ENV', () => {
      const original = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';
      expect(isDevelopment()).toBe(true);
      process.env.NODE_ENV = original;
    });

    it('isTest should check NODE_ENV', () => {
      expect(isTest()).toBe(true); // We're in test environment
    });
  });

  describe('safeJsonParse', () => {
    it('should parse valid JSON', () => {
      const result = safeJsonParse('{"a":1}', {});
      expect(result).toEqual({ a: 1 });
    });

    it('should return fallback for invalid JSON', () => {
      const result = safeJsonParse('invalid', { default: true });
      expect(result).toEqual({ default: true });
    });
  });

  describe('truncate', () => {
    it('should truncate long strings', () => {
      expect(truncate('1234567890', 7)).toBe('1234...');
    });

    it('should not truncate short strings', () => {
      expect(truncate('short', 10)).toBe('short');
    });
  });

  describe('toQueryString', () => {
    it('should convert object to query string', () => {
      const result = toQueryString({ a: '1', b: 2, c: true });
      expect(result).toBe('a=1&b=2&c=true');
    });

    it('should skip undefined values', () => {
      const result = toQueryString({ a: '1', b: undefined });
      expect(result).toBe('a=1');
    });
  });

  describe('getClientIp', () => {
    it('should extract IP from x-forwarded-for', () => {
      const headers = { 'x-forwarded-for': '1.2.3.4, 5.6.7.8' };
      expect(getClientIp(headers)).toBe('1.2.3.4');
    });

    it('should extract IP from x-real-ip', () => {
      const headers = { 'x-real-ip': '1.2.3.4' };
      expect(getClientIp(headers)).toBe('1.2.3.4');
    });

    it('should return undefined if no headers', () => {
      expect(getClientIp({})).toBeUndefined();
    });
  });
});
