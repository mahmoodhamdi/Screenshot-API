/**
 * Cookie Sanitizer Tests
 */

import { sanitizeCookies, Cookie } from '@utils/cookieSanitizer';

describe('Cookie Sanitizer', () => {
  const targetUrl = 'https://example.com/page';

  describe('Cookie name validation', () => {
    it('should accept valid cookie names', () => {
      const cookies: Cookie[] = [
        { name: 'session', value: 'abc123' },
        { name: 'user_id', value: '12345' },
        { name: 'token', value: 'xyz' },
      ];

      const result = sanitizeCookies(cookies, targetUrl);
      expect(result.cookies.length).toBe(3);
      expect(result.blocked.length).toBe(0);
    });

    it('should reject cookies without name', () => {
      const cookies = [{ name: '', value: 'abc' }];
      const result = sanitizeCookies(cookies, targetUrl);
      expect(result.cookies.length).toBe(0);
      expect(result.blocked.length).toBe(1);
    });

    it('should reject cookie names with spaces', () => {
      const cookies: Cookie[] = [{ name: 'invalid name', value: 'abc' }];
      const result = sanitizeCookies(cookies, targetUrl);
      expect(result.cookies.length).toBe(0);
      expect(result.warnings.some(w => w.includes('Invalid cookie name'))).toBe(true);
    });

    it('should reject cookie names with control characters', () => {
      const cookies: Cookie[] = [{ name: 'name\x00test', value: 'abc' }];
      const result = sanitizeCookies(cookies, targetUrl);
      expect(result.cookies.length).toBe(0);
    });

    it('should reject cookie names with separators', () => {
      const invalidNames = ['name;test', 'name=test', 'name(test)', 'name[test]'];

      for (const name of invalidNames) {
        const result = sanitizeCookies([{ name, value: 'abc' }], targetUrl);
        expect(result.cookies.length).toBe(0);
      }
    });

    it('should reject cookie names exceeding max length', () => {
      const cookies: Cookie[] = [{ name: 'x'.repeat(300), value: 'abc' }];
      const result = sanitizeCookies(cookies, targetUrl, { maxNameLength: 256 });
      expect(result.cookies.length).toBe(0);
      expect(result.warnings.some(w => w.includes('name too long'))).toBe(true);
    });
  });

  describe('Cookie value validation', () => {
    it('should accept valid cookie values', () => {
      const cookies: Cookie[] = [
        { name: 'test', value: 'simple_value' },
        { name: 'test2', value: 'value-with-hyphen' },
        { name: 'test3', value: 'value.with.dots' },
      ];

      const result = sanitizeCookies(cookies, targetUrl);
      expect(result.cookies.length).toBe(3);
    });

    it('should reject cookie values with control characters', () => {
      const cookies: Cookie[] = [{ name: 'test', value: 'value\x00' }];
      const result = sanitizeCookies(cookies, targetUrl);
      expect(result.cookies.length).toBe(0);
      expect(result.warnings.some(w => w.includes('Invalid cookie value'))).toBe(true);
    });

    it('should reject cookie values with semicolons', () => {
      const cookies: Cookie[] = [{ name: 'test', value: 'value;path=/' }];
      const result = sanitizeCookies(cookies, targetUrl);
      expect(result.cookies.length).toBe(0);
    });

    it('should reject cookie values with backslashes', () => {
      const cookies: Cookie[] = [{ name: 'test', value: 'value\\escape' }];
      const result = sanitizeCookies(cookies, targetUrl);
      expect(result.cookies.length).toBe(0);
    });

    it('should reject cookie values exceeding max length', () => {
      const cookies: Cookie[] = [{ name: 'test', value: 'x'.repeat(5000) }];
      const result = sanitizeCookies(cookies, targetUrl, { maxValueLength: 4096 });
      expect(result.cookies.length).toBe(0);
      expect(result.warnings.some(w => w.includes('value too long'))).toBe(true);
    });
  });

  describe('Domain validation', () => {
    it('should accept matching domain', () => {
      const cookies: Cookie[] = [
        { name: 'test', value: 'abc', domain: 'example.com' },
      ];

      const result = sanitizeCookies(cookies, 'https://example.com/page');
      expect(result.cookies.length).toBe(1);
    });

    it('should accept subdomain cookies', () => {
      const cookies: Cookie[] = [
        { name: 'test', value: 'abc', domain: '.example.com' },
      ];

      const result = sanitizeCookies(cookies, 'https://sub.example.com/page');
      expect(result.cookies.length).toBe(1);
    });

    it('should accept cookies with leading dot in domain', () => {
      const cookies: Cookie[] = [
        { name: 'test', value: 'abc', domain: '.example.com' },
      ];

      const result = sanitizeCookies(cookies, 'https://example.com/page');
      expect(result.cookies.length).toBe(1);
    });

    it('should reject mismatched domains', () => {
      const cookies: Cookie[] = [
        { name: 'test', value: 'abc', domain: 'other.com' },
      ];

      const result = sanitizeCookies(cookies, 'https://example.com/page');
      expect(result.cookies.length).toBe(0);
      expect(result.warnings.some(w => w.includes('domain mismatch'))).toBe(true);
    });

    it('should reject superdomain cookies', () => {
      const cookies: Cookie[] = [
        { name: 'test', value: 'abc', domain: 'example.com' },
      ];

      // sub.example.com cannot set cookies for example.com
      const result = sanitizeCookies(cookies, 'https://notexample.com/page');
      expect(result.cookies.length).toBe(0);
    });

    it('should handle cookies without domain', () => {
      const cookies: Cookie[] = [{ name: 'test', value: 'abc' }];

      const result = sanitizeCookies(cookies, targetUrl);
      expect(result.cookies.length).toBe(1);
    });
  });

  describe('Path validation', () => {
    it('should accept valid paths', () => {
      const cookies: Cookie[] = [
        { name: 'test', value: 'abc', path: '/' },
        { name: 'test2', value: 'def', path: '/api/v1' },
      ];

      const result = sanitizeCookies(cookies, targetUrl);
      expect(result.cookies.length).toBe(2);
    });

    it('should reject paths not starting with /', () => {
      const cookies: Cookie[] = [
        { name: 'test', value: 'abc', path: 'invalid' },
      ];

      const result = sanitizeCookies(cookies, targetUrl);
      expect(result.cookies.length).toBe(0);
      expect(result.warnings.some(w => w.includes('Invalid cookie path'))).toBe(true);
    });

    it('should reject paths with control characters', () => {
      const cookies: Cookie[] = [
        { name: 'test', value: 'abc', path: '/path\x00' },
      ];

      const result = sanitizeCookies(cookies, targetUrl);
      expect(result.cookies.length).toBe(0);
    });

    it('should default path to / when not specified', () => {
      const cookies: Cookie[] = [{ name: 'test', value: 'abc' }];

      const result = sanitizeCookies(cookies, targetUrl);
      expect(result.cookies[0].path).toBe('/');
    });
  });

  describe('Expires validation', () => {
    it('should accept valid expires timestamp', () => {
      const futureTimestamp = Math.floor(Date.now() / 1000) + 3600; // 1 hour from now
      const cookies: Cookie[] = [
        { name: 'test', value: 'abc', expires: futureTimestamp },
      ];

      const result = sanitizeCookies(cookies, targetUrl);
      expect(result.cookies.length).toBe(1);
      expect(result.cookies[0].expires).toBe(futureTimestamp);
    });

    it('should reject negative expires', () => {
      const cookies: Cookie[] = [
        { name: 'test', value: 'abc', expires: -1 },
      ];

      const result = sanitizeCookies(cookies, targetUrl);
      expect(result.cookies.length).toBe(0);
      expect(result.warnings.some(w => w.includes('Invalid cookie expires'))).toBe(true);
    });

    it('should reject expires too far in future', () => {
      const tooFarFuture = Math.floor(Date.now() / 1000) + 20 * 365 * 24 * 60 * 60; // 20 years
      const cookies: Cookie[] = [
        { name: 'test', value: 'abc', expires: tooFarFuture },
      ];

      const result = sanitizeCookies(cookies, targetUrl);
      expect(result.cookies.length).toBe(0);
    });

    it('should accept cookies without expires', () => {
      const cookies: Cookie[] = [{ name: 'test', value: 'abc' }];

      const result = sanitizeCookies(cookies, targetUrl);
      expect(result.cookies.length).toBe(1);
      expect(result.cookies[0].expires).toBeUndefined();
    });
  });

  describe('SameSite validation', () => {
    it('should accept valid sameSite values', () => {
      const cookies: Cookie[] = [
        { name: 'test1', value: 'abc', sameSite: 'Strict' },
        { name: 'test2', value: 'def', sameSite: 'Lax' },
        { name: 'test3', value: 'ghi', sameSite: 'None' },
      ];

      const result = sanitizeCookies(cookies, targetUrl);
      expect(result.cookies.length).toBe(3);
    });

    it('should reject invalid sameSite values', () => {
      const cookies: Cookie[] = [
        { name: 'test', value: 'abc', sameSite: 'Invalid' as 'Strict' },
      ];

      const result = sanitizeCookies(cookies, targetUrl);
      expect(result.cookies.length).toBe(0);
      expect(result.warnings.some(w => w.includes('Invalid cookie sameSite'))).toBe(true);
    });
  });

  describe('Cookie count limits', () => {
    it('should limit number of cookies', () => {
      const cookies: Cookie[] = [];
      for (let i = 0; i < 100; i++) {
        cookies.push({ name: `cookie${i}`, value: `value${i}` });
      }

      const result = sanitizeCookies(cookies, targetUrl, { maxCookies: 50 });
      expect(result.cookies.length).toBe(50);
      expect(result.warnings.some(w => w.includes('Too many cookies'))).toBe(true);
    });

    it('should respect custom maxCookies option', () => {
      const cookies: Cookie[] = [];
      for (let i = 0; i < 20; i++) {
        cookies.push({ name: `cookie${i}`, value: `value${i}` });
      }

      const result = sanitizeCookies(cookies, targetUrl, { maxCookies: 10 });
      expect(result.cookies.length).toBe(10);
    });
  });

  describe('Invalid input handling', () => {
    it('should handle non-array input', () => {
      const result = sanitizeCookies('invalid' as unknown as Cookie[], targetUrl);
      expect(result.cookies).toEqual([]);
    });

    it('should handle invalid target URL', () => {
      const cookies: Cookie[] = [
        { name: 'test', value: 'abc', domain: 'example.com' },
      ];

      const result = sanitizeCookies(cookies, 'invalid-url');
      expect(result.warnings.some(w => w.includes('Invalid target URL'))).toBe(true);
    });

    it('should handle cookies with non-string name', () => {
      const cookies = [{ name: 123 as unknown as string, value: 'abc' }];
      const result = sanitizeCookies(cookies, targetUrl);
      expect(result.cookies.length).toBe(0);
    });

    it('should handle cookies with non-string value', () => {
      const cookies: Cookie[] = [
        { name: 'test', value: 123 as unknown as string },
      ];
      const result = sanitizeCookies(cookies, targetUrl);
      expect(result.cookies.length).toBe(0);
    });
  });

  describe('Boolean flags', () => {
    it('should preserve secure flag', () => {
      const cookies: Cookie[] = [
        { name: 'test', value: 'abc', secure: true },
      ];

      const result = sanitizeCookies(cookies, targetUrl);
      expect(result.cookies[0].secure).toBe(true);
    });

    it('should preserve httpOnly flag', () => {
      const cookies: Cookie[] = [
        { name: 'test', value: 'abc', httpOnly: true },
      ];

      const result = sanitizeCookies(cookies, targetUrl);
      expect(result.cookies[0].httpOnly).toBe(true);
    });
  });
});
