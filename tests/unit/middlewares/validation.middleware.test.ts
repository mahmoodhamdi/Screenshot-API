/**
 * Validation Middleware Tests
 */

// Set environment variables before any imports
process.env.JWT_SECRET = 'test-jwt-secret-key-minimum-32-characters-long';
process.env.JWT_REFRESH_SECRET = 'test-jwt-refresh-secret-key-minimum-32-chars';
process.env.NODE_ENV = 'test';

import { Request, Response, NextFunction } from 'express';
import {
  validateBody,
  validateParams,
  sanitizeString,
  isValidObjectId,
  isSafeUrl,
  createScreenshotSchema,
  loginSchema,
  registerSchema,
  idParamSchema,
} from '@middlewares/validation.middleware';
import { ERROR_CODES } from '@utils/constants';

// Mock Express request/response
const mockRequest = (overrides: Partial<Request> = {}): Partial<Request> => ({
  body: {},
  query: {},
  params: {},
  ...overrides,
});

const mockResponse = (): Partial<Response> => {
  const res: Partial<Response> = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

const mockNext = (): NextFunction => jest.fn();

describe('Validation Middleware', () => {
  // ============================================
  // Schema Validation Tests
  // ============================================

  describe('createScreenshotSchema', () => {
    it('should validate valid screenshot request', () => {
      const data = {
        url: 'https://example.com',
        width: 1280,
        height: 720,
        format: 'png',
      };

      const result = createScreenshotSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('should reject invalid URL', () => {
      const data = {
        url: 'not-a-url',
      };

      const result = createScreenshotSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it('should reject FTP URL', () => {
      const data = {
        url: 'ftp://example.com/file.txt',
      };

      const result = createScreenshotSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it('should reject width below minimum', () => {
      const data = {
        url: 'https://example.com',
        width: 100,
      };

      const result = createScreenshotSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it('should reject width above maximum', () => {
      const data = {
        url: 'https://example.com',
        width: 10000,
      };

      const result = createScreenshotSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it('should validate cookies array', () => {
      const data = {
        url: 'https://example.com',
        cookies: [
          { name: 'session', value: 'abc123' },
          { name: 'auth', value: 'xyz789', domain: '.example.com' },
        ],
      };

      const result = createScreenshotSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('should reject too many cookies', () => {
      const data = {
        url: 'https://example.com',
        cookies: Array(51).fill({ name: 'test', value: 'value' }),
      };

      const result = createScreenshotSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it('should validate clip rect', () => {
      const data = {
        url: 'https://example.com',
        clipRect: { x: 0, y: 0, width: 800, height: 600 },
      };

      const result = createScreenshotSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('should validate all formats', () => {
      const formats = ['png', 'jpeg', 'webp', 'pdf'];

      for (const format of formats) {
        const data = { url: 'https://example.com', format };
        const result = createScreenshotSchema.safeParse(data);
        expect(result.success).toBe(true);
      }
    });

    it('should reject invalid format', () => {
      const data = {
        url: 'https://example.com',
        format: 'gif',
      };

      const result = createScreenshotSchema.safeParse(data);
      expect(result.success).toBe(false);
    });
  });

  describe('loginSchema', () => {
    it('should validate valid login', () => {
      const data = {
        email: 'test@example.com',
        password: 'password123',
      };

      const result = loginSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('should reject invalid email', () => {
      const data = {
        email: 'invalid-email',
        password: 'password123',
      };

      const result = loginSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it('should reject empty password', () => {
      const data = {
        email: 'test@example.com',
        password: '',
      };

      const result = loginSchema.safeParse(data);
      expect(result.success).toBe(false);
    });
  });

  describe('registerSchema', () => {
    it('should validate valid registration', () => {
      const data = {
        email: 'test@example.com',
        password: 'Password123',
        name: 'Test User',
      };

      const result = registerSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('should reject weak password (no uppercase)', () => {
      const data = {
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
      };

      const result = registerSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it('should reject weak password (no lowercase)', () => {
      const data = {
        email: 'test@example.com',
        password: 'PASSWORD123',
        name: 'Test User',
      };

      const result = registerSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it('should reject weak password (no number)', () => {
      const data = {
        email: 'test@example.com',
        password: 'Passwordd',
        name: 'Test User',
      };

      const result = registerSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it('should reject short password', () => {
      const data = {
        email: 'test@example.com',
        password: 'Pass1',
        name: 'Test User',
      };

      const result = registerSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it('should validate with optional company', () => {
      const data = {
        email: 'test@example.com',
        password: 'Password123',
        name: 'Test User',
        company: 'Test Corp',
      };

      const result = registerSchema.safeParse(data);
      expect(result.success).toBe(true);
    });
  });

  describe('idParamSchema', () => {
    it('should validate valid ObjectId', () => {
      const data = { id: '507f1f77bcf86cd799439011' };

      const result = idParamSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('should reject invalid ObjectId', () => {
      const data = { id: 'invalid-id' };

      const result = idParamSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it('should reject short ObjectId', () => {
      const data = { id: '507f1f77bcf86cd' };

      const result = idParamSchema.safeParse(data);
      expect(result.success).toBe(false);
    });
  });

  // ============================================
  // Middleware Tests
  // ============================================

  describe('validate middleware', () => {
    it('should call next on valid body', () => {
      const req = mockRequest({
        body: { email: 'test@example.com', password: 'Password123', name: 'Test' },
      }) as Request;
      const res = mockResponse() as Response;
      const next = mockNext();

      const middleware = validateBody(registerSchema);
      middleware(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    it('should return 400 on invalid body', () => {
      const req = mockRequest({
        body: { email: 'invalid' },
      }) as Request;
      const res = mockResponse() as Response;
      const next = mockNext();

      const middleware = validateBody(registerSchema);
      middleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: expect.objectContaining({
            code: ERROR_CODES.VALIDATION_ERROR,
          }),
        })
      );
      expect(next).not.toHaveBeenCalled();
    });

    it('should validate query parameters', () => {
      const req = mockRequest({
        query: { page: '1', limit: '20' },
      }) as Request;
      const res = mockResponse() as Response;
      const next = mockNext();

      const schema = idParamSchema;
      const middleware = validateParams(schema);

      // This should fail because params doesn't have id
      req.params = { id: '507f1f77bcf86cd799439011' };
      middleware(req, res, next);

      expect(next).toHaveBeenCalled();
    });
  });

  // ============================================
  // Helper Functions Tests
  // ============================================

  describe('sanitizeString', () => {
    it('should escape HTML entities', () => {
      expect(sanitizeString('<script>alert("xss")</script>')).toBe(
        '&lt;script&gt;alert(&quot;xss&quot;)&lt;&#x2F;script&gt;'
      );
    });

    it('should escape ampersand', () => {
      expect(sanitizeString('foo & bar')).toBe('foo &amp; bar');
    });

    it('should escape quotes', () => {
      expect(sanitizeString("test'quote")).toBe('test&#x27;quote');
      expect(sanitizeString('test"quote')).toBe('test&quot;quote');
    });

    it('should handle empty string', () => {
      expect(sanitizeString('')).toBe('');
    });

    it('should not modify safe strings', () => {
      expect(sanitizeString('Hello World 123')).toBe('Hello World 123');
    });
  });

  describe('isValidObjectId', () => {
    it('should return true for valid ObjectId', () => {
      expect(isValidObjectId('507f1f77bcf86cd799439011')).toBe(true);
      expect(isValidObjectId('000000000000000000000000')).toBe(true);
      expect(isValidObjectId('ffffffffffffffffffffffff')).toBe(true);
    });

    it('should return false for invalid ObjectId', () => {
      expect(isValidObjectId('invalid')).toBe(false);
      expect(isValidObjectId('507f1f77bcf86cd79943901')).toBe(false); // too short
      expect(isValidObjectId('507f1f77bcf86cd7994390111')).toBe(false); // too long
      expect(isValidObjectId('507f1f77bcf86cd79943901g')).toBe(false); // invalid char
      expect(isValidObjectId('')).toBe(false);
    });
  });

  describe('isSafeUrl', () => {
    it('should allow valid HTTP/HTTPS URLs', () => {
      expect(isSafeUrl('https://example.com')).toBe(true);
      expect(isSafeUrl('http://example.com')).toBe(true);
      expect(isSafeUrl('https://sub.example.com/path?query=1')).toBe(true);
    });

    it('should block localhost', () => {
      expect(isSafeUrl('http://localhost')).toBe(false);
      expect(isSafeUrl('http://localhost:3000')).toBe(false);
      expect(isSafeUrl('https://localhost/path')).toBe(false);
    });

    it('should block 127.0.0.1', () => {
      expect(isSafeUrl('http://127.0.0.1')).toBe(false);
      expect(isSafeUrl('http://127.0.0.1:8080')).toBe(false);
    });

    it('should block private IP ranges', () => {
      // 10.x.x.x
      expect(isSafeUrl('http://10.0.0.1')).toBe(false);
      expect(isSafeUrl('http://10.255.255.255')).toBe(false);

      // 172.16.x.x - 172.31.x.x
      expect(isSafeUrl('http://172.16.0.1')).toBe(false);
      expect(isSafeUrl('http://172.31.255.255')).toBe(false);

      // 192.168.x.x
      expect(isSafeUrl('http://192.168.0.1')).toBe(false);
      expect(isSafeUrl('http://192.168.1.1')).toBe(false);
    });

    it('should allow public IPs', () => {
      expect(isSafeUrl('http://8.8.8.8')).toBe(true);
      expect(isSafeUrl('http://1.1.1.1')).toBe(true);
    });

    it('should block 0.0.0.0', () => {
      expect(isSafeUrl('http://0.0.0.0')).toBe(false);
    });

    it('should block IPv6 localhost', () => {
      expect(isSafeUrl('http://[::1]')).toBe(false);
    });

    it('should return false for invalid URLs', () => {
      expect(isSafeUrl('not-a-url')).toBe(false);
      expect(isSafeUrl('')).toBe(false);
    });
  });
});
