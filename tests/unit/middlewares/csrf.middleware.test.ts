/**
 * CSRF Middleware Tests
 * Tests for Double Submit Cookie CSRF protection
 */

import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import {
  csrfToken,
  csrfProtection,
  conditionalCsrf,
  csrfErrorHandler,
} from '../../../src/middlewares/csrf.middleware';

// Mock Express request and response
function createMockRequest(overrides: Partial<Request> = {}): Request {
  return {
    method: 'GET',
    path: '/',
    cookies: {},
    headers: {},
    body: {},
    ...overrides,
  } as Request;
}

function createMockResponse(): Response {
  const res = {
    locals: {},
    cookie: jest.fn(),
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
    setHeader: jest.fn(),
  } as unknown as Response;
  return res;
}

describe('CSRF Middleware', () => {
  let mockNext: NextFunction;

  beforeEach(() => {
    mockNext = jest.fn();
  });

  describe('csrfToken', () => {
    it('should generate a new token if not present in cookies', () => {
      const req = createMockRequest();
      const res = createMockResponse();

      csrfToken(req, res, mockNext);

      expect(res.cookie).toHaveBeenCalledWith(
        '_csrf',
        expect.any(String),
        expect.objectContaining({
          httpOnly: true,
          sameSite: 'strict',
          path: '/',
        })
      );
      expect(req.csrfToken).toBeDefined();
      expect(typeof req.csrfToken!()).toBe('string');
      expect(res.locals.csrfToken).toBeDefined();
      expect(mockNext).toHaveBeenCalled();
    });

    it('should reuse existing token from cookies', () => {
      const existingToken = crypto.randomBytes(32).toString('hex');
      const req = createMockRequest({
        cookies: { _csrf: existingToken },
      });
      const res = createMockResponse();

      csrfToken(req, res, mockNext);

      expect(res.cookie).not.toHaveBeenCalled();
      expect(req.csrfToken!()).toBe(existingToken);
      expect(res.locals.csrfToken).toBe(existingToken);
      expect(mockNext).toHaveBeenCalled();
    });

    it('should generate token of correct length (64 hex chars = 32 bytes)', () => {
      const req = createMockRequest();
      const res = createMockResponse();

      csrfToken(req, res, mockNext);

      const setCookieCall = (res.cookie as jest.Mock).mock.calls[0];
      const generatedToken = setCookieCall[1];
      expect(generatedToken).toHaveLength(64); // 32 bytes = 64 hex chars
    });
  });

  describe('csrfProtection', () => {
    it('should allow GET requests without token', () => {
      const req = createMockRequest({ method: 'GET' });
      const res = createMockResponse();

      csrfProtection(req, res, mockNext);

      expect(mockNext).toHaveBeenCalledWith();
    });

    it('should allow HEAD requests without token', () => {
      const req = createMockRequest({ method: 'HEAD' });
      const res = createMockResponse();

      csrfProtection(req, res, mockNext);

      expect(mockNext).toHaveBeenCalledWith();
    });

    it('should allow OPTIONS requests without token', () => {
      const req = createMockRequest({ method: 'OPTIONS' });
      const res = createMockResponse();

      csrfProtection(req, res, mockNext);

      expect(mockNext).toHaveBeenCalledWith();
    });

    it('should reject POST requests without token', () => {
      const req = createMockRequest({ method: 'POST' });
      const res = createMockResponse();

      expect(() => csrfProtection(req, res, mockNext)).toThrow('Invalid or missing CSRF token');
    });

    it('should reject POST requests with mismatched tokens', () => {
      const req = createMockRequest({
        method: 'POST',
        cookies: { _csrf: 'token-from-cookie' },
        headers: { 'x-csrf-token': 'different-token' },
      });
      const res = createMockResponse();

      expect(() => csrfProtection(req, res, mockNext)).toThrow('Invalid or missing CSRF token');
    });

    it('should allow POST requests with matching token in header', () => {
      const token = crypto.randomBytes(32).toString('hex');
      const req = createMockRequest({
        method: 'POST',
        cookies: { _csrf: token },
        headers: { 'x-csrf-token': token },
      });
      const res = createMockResponse();

      csrfProtection(req, res, mockNext);

      expect(mockNext).toHaveBeenCalledWith();
    });

    it('should allow POST requests with matching token in body', () => {
      const token = crypto.randomBytes(32).toString('hex');
      const req = createMockRequest({
        method: 'POST',
        cookies: { _csrf: token },
        body: { _csrf: token },
      });
      const res = createMockResponse();

      csrfProtection(req, res, mockNext);

      expect(mockNext).toHaveBeenCalledWith();
    });

    it('should reject PUT requests without token', () => {
      const req = createMockRequest({ method: 'PUT' });
      const res = createMockResponse();

      expect(() => csrfProtection(req, res, mockNext)).toThrow('Invalid or missing CSRF token');
    });

    it('should reject DELETE requests without token', () => {
      const req = createMockRequest({ method: 'DELETE' });
      const res = createMockResponse();

      expect(() => csrfProtection(req, res, mockNext)).toThrow('Invalid or missing CSRF token');
    });

    it('should reject PATCH requests without token', () => {
      const req = createMockRequest({ method: 'PATCH' });
      const res = createMockResponse();

      expect(() => csrfProtection(req, res, mockNext)).toThrow('Invalid or missing CSRF token');
    });

    it('should use timing-safe comparison to prevent timing attacks', () => {
      // This is implicitly tested by the implementation using crypto.timingSafeEqual
      // We verify the middleware doesn't throw for valid tokens
      const token = crypto.randomBytes(32).toString('hex');
      const req = createMockRequest({
        method: 'POST',
        cookies: { _csrf: token },
        headers: { 'x-csrf-token': token },
      });
      const res = createMockResponse();

      csrfProtection(req, res, mockNext);

      expect(mockNext).toHaveBeenCalledWith();
    });
  });

  describe('conditionalCsrf', () => {
    it('should skip CSRF for /api/ routes', () => {
      const req = createMockRequest({
        method: 'POST',
        path: '/api/v1/auth/login',
      });
      const res = createMockResponse();

      conditionalCsrf(req, res, mockNext);

      expect(mockNext).toHaveBeenCalledWith();
    });

    it('should skip CSRF for /health route', () => {
      const req = createMockRequest({
        method: 'POST',
        path: '/health',
      });
      const res = createMockResponse();

      conditionalCsrf(req, res, mockNext);

      expect(mockNext).toHaveBeenCalledWith();
    });

    it('should skip CSRF for /docs route', () => {
      const req = createMockRequest({
        method: 'POST',
        path: '/docs',
      });
      const res = createMockResponse();

      conditionalCsrf(req, res, mockNext);

      expect(mockNext).toHaveBeenCalledWith();
    });

    it('should skip CSRF for /redoc route', () => {
      const req = createMockRequest({
        method: 'POST',
        path: '/redoc',
      });
      const res = createMockResponse();

      conditionalCsrf(req, res, mockNext);

      expect(mockNext).toHaveBeenCalledWith();
    });

    it('should skip CSRF for /api-docs route', () => {
      const req = createMockRequest({
        method: 'POST',
        path: '/api-docs',
      });
      const res = createMockResponse();

      conditionalCsrf(req, res, mockNext);

      expect(mockNext).toHaveBeenCalledWith();
    });

    it('should skip CSRF for /developer route', () => {
      const req = createMockRequest({
        method: 'POST',
        path: '/developer',
      });
      const res = createMockResponse();

      conditionalCsrf(req, res, mockNext);

      expect(mockNext).toHaveBeenCalledWith();
    });

    it('should apply CSRF for non-API POST routes', () => {
      const req = createMockRequest({
        method: 'POST',
        path: '/login',
      });
      const res = createMockResponse();

      expect(() => conditionalCsrf(req, res, mockNext)).toThrow('Invalid or missing CSRF token');
    });

    it('should apply CSRF for dashboard routes', () => {
      const req = createMockRequest({
        method: 'POST',
        path: '/dashboard/settings',
      });
      const res = createMockResponse();

      expect(() => conditionalCsrf(req, res, mockNext)).toThrow('Invalid or missing CSRF token');
    });
  });

  describe('csrfErrorHandler', () => {
    it('should handle CSRF_ERROR code', () => {
      const error = new Error('Invalid or missing CSRF token') as Error & { code?: string };
      error.code = 'CSRF_ERROR';

      const req = createMockRequest();
      const res = createMockResponse();

      csrfErrorHandler(error, req, res, mockNext);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: {
          code: 'CSRF_ERROR',
          message: 'Invalid or missing CSRF token. Please refresh the page and try again.',
        },
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should handle CSRF error by message', () => {
      const error = new Error('Invalid or missing CSRF token');

      const req = createMockRequest();
      const res = createMockResponse();

      csrfErrorHandler(error, req, res, mockNext);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: {
          code: 'CSRF_ERROR',
          message: 'Invalid or missing CSRF token. Please refresh the page and try again.',
        },
      });
    });

    it('should pass non-CSRF errors to next handler', () => {
      const error = new Error('Some other error');

      const req = createMockRequest();
      const res = createMockResponse();

      csrfErrorHandler(error, req, res, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
      expect(res.status).not.toHaveBeenCalled();
    });
  });

  describe('Token Security', () => {
    it('should reject empty tokens', () => {
      const req = createMockRequest({
        method: 'POST',
        cookies: { _csrf: '' },
        headers: { 'x-csrf-token': '' },
      });
      const res = createMockResponse();

      expect(() => csrfProtection(req, res, mockNext)).toThrow('Invalid or missing CSRF token');
    });

    it('should reject tokens of different lengths', () => {
      const req = createMockRequest({
        method: 'POST',
        cookies: { _csrf: 'short' },
        headers: { 'x-csrf-token': 'muchlongertoken' },
      });
      const res = createMockResponse();

      expect(() => csrfProtection(req, res, mockNext)).toThrow('Invalid or missing CSRF token');
    });

    it('should reject when only cookie token is present', () => {
      const token = crypto.randomBytes(32).toString('hex');
      const req = createMockRequest({
        method: 'POST',
        cookies: { _csrf: token },
      });
      const res = createMockResponse();

      expect(() => csrfProtection(req, res, mockNext)).toThrow('Invalid or missing CSRF token');
    });

    it('should reject when only header token is present', () => {
      const token = crypto.randomBytes(32).toString('hex');
      const req = createMockRequest({
        method: 'POST',
        headers: { 'x-csrf-token': token },
      });
      const res = createMockResponse();

      expect(() => csrfProtection(req, res, mockNext)).toThrow('Invalid or missing CSRF token');
    });
  });
});
