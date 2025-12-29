/**
 * Header Sanitizer Tests
 */

import {
  sanitizeHeaders,
  isForbiddenHeader,
  isSensitiveHeader,
} from '@utils/headerSanitizer';

describe('Header Sanitizer', () => {
  describe('sanitizeHeaders', () => {
    describe('Forbidden headers', () => {
      it('should block host header', () => {
        const result = sanitizeHeaders({ Host: 'evil.com' });
        expect(result.headers).not.toHaveProperty('Host');
        expect(result.blocked).toContain('Host');
      });

      it('should block content-length header', () => {
        const result = sanitizeHeaders({ 'Content-Length': '100' });
        expect(result.headers).not.toHaveProperty('Content-Length');
        expect(result.blocked).toContain('Content-Length');
      });

      it('should block transfer-encoding header', () => {
        const result = sanitizeHeaders({ 'Transfer-Encoding': 'chunked' });
        expect(result.headers).not.toHaveProperty('Transfer-Encoding');
        expect(result.blocked).toContain('Transfer-Encoding');
      });

      it('should block connection header', () => {
        const result = sanitizeHeaders({ Connection: 'keep-alive' });
        expect(result.headers).not.toHaveProperty('Connection');
        expect(result.blocked).toContain('Connection');
      });

      it('should block upgrade header', () => {
        const result = sanitizeHeaders({ Upgrade: 'websocket' });
        expect(result.headers).not.toHaveProperty('Upgrade');
        expect(result.blocked).toContain('Upgrade');
      });
    });

    describe('Sensitive headers', () => {
      it('should block authorization header by default', () => {
        const result = sanitizeHeaders({ Authorization: 'Bearer token' });
        expect(result.headers).not.toHaveProperty('Authorization');
        expect(result.blocked).toContain('Authorization');
        expect(result.warnings).toContain('Sensitive header blocked: Authorization');
      });

      it('should block cookie header by default', () => {
        const result = sanitizeHeaders({ Cookie: 'session=abc' });
        expect(result.headers).not.toHaveProperty('Cookie');
        expect(result.blocked).toContain('Cookie');
      });

      it('should block x-forwarded-for header by default', () => {
        const result = sanitizeHeaders({ 'X-Forwarded-For': '1.2.3.4' });
        expect(result.headers).not.toHaveProperty('X-Forwarded-For');
        expect(result.blocked).toContain('X-Forwarded-For');
      });

      it('should allow sensitive headers when allowSensitive is true', () => {
        const result = sanitizeHeaders(
          { Authorization: 'Bearer token' },
          { allowSensitive: true }
        );
        expect(result.headers).toHaveProperty('Authorization', 'Bearer token');
        expect(result.blocked).not.toContain('Authorization');
        expect(result.warnings).toContain('Sensitive header allowed: Authorization');
      });
    });

    describe('Header name validation', () => {
      it('should reject invalid header names', () => {
        const result = sanitizeHeaders({ 'Invalid Header': 'value' });
        expect(result.headers).not.toHaveProperty('Invalid Header');
        expect(result.blocked).toContain('Invalid Header');
        expect(result.warnings.some(w => w.includes('Invalid header name'))).toBe(true);
      });

      it('should reject header names with special characters', () => {
        const result = sanitizeHeaders({ 'Header<>Name': 'value' });
        expect(result.blocked).toContain('Header<>Name');
      });

      it('should accept valid header names', () => {
        const result = sanitizeHeaders({
          'X-Custom-Header': 'value',
          Accept: 'application/json',
          'User-Agent': 'test',
        });
        expect(result.headers).toHaveProperty('X-Custom-Header', 'value');
        expect(result.headers).toHaveProperty('Accept', 'application/json');
        expect(result.headers).toHaveProperty('User-Agent', 'test');
      });
    });

    describe('CRLF injection', () => {
      it('should reject headers with carriage return', () => {
        const result = sanitizeHeaders({ 'X-Test': 'value\rinjected' });
        expect(result.headers).not.toHaveProperty('X-Test');
        expect(result.blocked).toContain('X-Test');
        expect(result.warnings.some(w => w.includes('CRLF'))).toBe(true);
      });

      it('should reject headers with newline', () => {
        const result = sanitizeHeaders({ 'X-Test': 'value\ninjected' });
        expect(result.headers).not.toHaveProperty('X-Test');
        expect(result.blocked).toContain('X-Test');
      });

      it('should reject headers with both CR and LF', () => {
        const result = sanitizeHeaders({ 'X-Test': 'value\r\nSet-Cookie: evil' });
        expect(result.headers).not.toHaveProperty('X-Test');
        expect(result.blocked).toContain('X-Test');
      });
    });

    describe('Null byte injection', () => {
      it('should reject headers with null bytes', () => {
        const result = sanitizeHeaders({ 'X-Test': 'value\x00injected' });
        expect(result.headers).not.toHaveProperty('X-Test');
        expect(result.blocked).toContain('X-Test');
        expect(result.warnings.some(w => w.includes('null bytes'))).toBe(true);
      });
    });

    describe('Header count limits', () => {
      it('should limit number of headers', () => {
        const headers: Record<string, string> = {};
        for (let i = 0; i < 30; i++) {
          headers[`X-Header-${i}`] = `value${i}`;
        }

        const result = sanitizeHeaders(headers, { maxHeaders: 20 });
        expect(Object.keys(result.headers).length).toBeLessThanOrEqual(20);
        expect(result.warnings.some(w => w.includes('Too many headers'))).toBe(true);
      });

      it('should respect custom maxHeaders option', () => {
        const headers: Record<string, string> = {};
        for (let i = 0; i < 10; i++) {
          headers[`X-Header-${i}`] = `value${i}`;
        }

        const result = sanitizeHeaders(headers, { maxHeaders: 5 });
        expect(Object.keys(result.headers).length).toBeLessThanOrEqual(5);
      });
    });

    describe('Header value truncation', () => {
      it('should truncate long header values', () => {
        const longValue = 'x'.repeat(10000);
        const result = sanitizeHeaders(
          { 'X-Test': longValue },
          { maxHeaderValueLength: 100 }
        );
        expect(result.headers['X-Test'].length).toBe(100);
        expect(result.warnings.some(w => w.includes('truncated'))).toBe(true);
      });
    });

    describe('Empty values', () => {
      it('should skip empty header values', () => {
        const result = sanitizeHeaders({ 'X-Test': '   ' });
        expect(result.headers).not.toHaveProperty('X-Test');
        expect(result.warnings.some(w => w.includes('Empty header value'))).toBe(true);
      });

      it('should trim whitespace from header values', () => {
        const result = sanitizeHeaders({ 'X-Test': '  value  ' });
        expect(result.headers['X-Test']).toBe('value');
      });
    });

    describe('Invalid input handling', () => {
      it('should handle null input', () => {
        const result = sanitizeHeaders(null as unknown as Record<string, string>);
        expect(result.headers).toEqual({});
        expect(result.warnings).toEqual([]);
        expect(result.blocked).toEqual([]);
      });

      it('should handle undefined input', () => {
        const result = sanitizeHeaders(undefined as unknown as Record<string, string>);
        expect(result.headers).toEqual({});
      });

      it('should handle non-string header values', () => {
        const result = sanitizeHeaders({
          'X-Test': 123 as unknown as string,
        });
        expect(result.headers).not.toHaveProperty('X-Test');
        expect(result.warnings.some(w => w.includes('must be string'))).toBe(true);
      });
    });

    describe('Case sensitivity', () => {
      it('should handle forbidden headers case-insensitively', () => {
        const result = sanitizeHeaders({ 'HOST': 'evil.com' });
        expect(result.headers).not.toHaveProperty('HOST');
        expect(result.blocked).toContain('HOST');
      });

      it('should handle sensitive headers case-insensitively', () => {
        const result = sanitizeHeaders({ 'AUTHORIZATION': 'Bearer token' });
        expect(result.headers).not.toHaveProperty('AUTHORIZATION');
        expect(result.blocked).toContain('AUTHORIZATION');
      });
    });
  });

  describe('isForbiddenHeader', () => {
    it('should identify forbidden headers', () => {
      expect(isForbiddenHeader('host')).toBe(true);
      expect(isForbiddenHeader('Host')).toBe(true);
      expect(isForbiddenHeader('HOST')).toBe(true);
      expect(isForbiddenHeader('content-length')).toBe(true);
      expect(isForbiddenHeader('transfer-encoding')).toBe(true);
    });

    it('should return false for non-forbidden headers', () => {
      expect(isForbiddenHeader('X-Custom')).toBe(false);
      expect(isForbiddenHeader('Accept')).toBe(false);
      expect(isForbiddenHeader('Content-Type')).toBe(false);
    });
  });

  describe('isSensitiveHeader', () => {
    it('should identify sensitive headers', () => {
      expect(isSensitiveHeader('authorization')).toBe(true);
      expect(isSensitiveHeader('Authorization')).toBe(true);
      expect(isSensitiveHeader('cookie')).toBe(true);
      expect(isSensitiveHeader('x-forwarded-for')).toBe(true);
    });

    it('should return false for non-sensitive headers', () => {
      expect(isSensitiveHeader('X-Custom')).toBe(false);
      expect(isSensitiveHeader('Accept')).toBe(false);
      expect(isSensitiveHeader('Content-Type')).toBe(false);
    });
  });
});
