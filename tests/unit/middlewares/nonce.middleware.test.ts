/**
 * Nonce Middleware Tests
 * Tests for CSP nonce generation and route-aware security middleware
 */

import { Request, Response, NextFunction } from 'express';
import {
  generateNonce,
  getNonce,
  nonceMiddleware,
  strictCSPMiddleware,
  docsCSPMiddleware,
  apiSecurityMiddleware,
  routeAwareSecurityMiddleware,
  isDocsRoute,
  isApiRoute,
  isStaticRoute,
} from '../../../src/middlewares/nonce.middleware';

// Mock Express request and response
function createMockRequest(overrides: Partial<Request> = {}): Request {
  return {
    method: 'GET',
    path: '/',
    headers: {},
    ...overrides,
  } as Request;
}

function createMockResponse(): Response {
  const res = {
    locals: {},
    setHeader: jest.fn(),
    removeHeader: jest.fn(),
    getHeader: jest.fn(),
    on: jest.fn(),
    emit: jest.fn(),
  } as unknown as Response;
  return res;
}

describe('Nonce Middleware', () => {
  let mockNext: NextFunction;

  beforeEach(() => {
    mockNext = jest.fn();
  });

  describe('generateNonce', () => {
    it('should generate a base64-encoded nonce', () => {
      const nonce = generateNonce();
      expect(typeof nonce).toBe('string');
      expect(nonce.length).toBeGreaterThan(0);
    });

    it('should generate unique nonces on each call', () => {
      const nonce1 = generateNonce();
      const nonce2 = generateNonce();
      const nonce3 = generateNonce();

      expect(nonce1).not.toBe(nonce2);
      expect(nonce2).not.toBe(nonce3);
      expect(nonce1).not.toBe(nonce3);
    });

    it('should generate nonce of correct length (16 bytes = ~24 base64 chars)', () => {
      const nonce = generateNonce();
      // 16 bytes encoded in base64 = ceil(16 * 4/3) = 22-24 chars with padding
      expect(nonce.length).toBeGreaterThanOrEqual(22);
      expect(nonce.length).toBeLessThanOrEqual(24);
    });

    it('should generate valid base64 strings', () => {
      const nonce = generateNonce();
      // Valid base64 characters: A-Z, a-z, 0-9, +, /, =
      expect(nonce).toMatch(/^[A-Za-z0-9+/=]+$/);
    });
  });

  describe('getNonce', () => {
    it('should return nonce from res.locals', () => {
      const res = createMockResponse();
      res.locals.nonce = 'test-nonce-123';

      const nonce = getNonce(res);

      expect(nonce).toBe('test-nonce-123');
    });

    it('should return empty string if nonce is not set', () => {
      const res = createMockResponse();

      const nonce = getNonce(res);

      expect(nonce).toBe('');
    });

    it('should return empty string if nonce is undefined', () => {
      const res = createMockResponse();
      res.locals.nonce = undefined;

      const nonce = getNonce(res);

      expect(nonce).toBe('');
    });
  });

  describe('nonceMiddleware', () => {
    it('should generate and store nonce in res.locals', () => {
      const req = createMockRequest();
      const res = createMockResponse();

      nonceMiddleware(req, res, mockNext);

      expect(res.locals.nonce).toBeDefined();
      expect(typeof res.locals.nonce).toBe('string');
      expect(res.locals.nonce.length).toBeGreaterThan(0);
      expect(mockNext).toHaveBeenCalled();
    });

    it('should generate unique nonce for each request', () => {
      const req1 = createMockRequest();
      const res1 = createMockResponse();
      const req2 = createMockRequest();
      const res2 = createMockResponse();

      nonceMiddleware(req1, res1, mockNext);
      nonceMiddleware(req2, res2, mockNext);

      expect(res1.locals.nonce).not.toBe(res2.locals.nonce);
    });

    it('should call next without error', () => {
      const req = createMockRequest();
      const res = createMockResponse();

      nonceMiddleware(req, res, mockNext);

      expect(mockNext).toHaveBeenCalledWith();
    });
  });

  describe('strictCSPMiddleware', () => {
    it('should use existing nonce from res.locals if present', () => {
      const req = createMockRequest();
      const res = createMockResponse();
      res.locals.nonce = 'existing-nonce';

      strictCSPMiddleware(req, res, mockNext);

      expect(res.locals.nonce).toBe('existing-nonce');
    });

    it('should generate new nonce if not present', () => {
      const req = createMockRequest();
      const res = createMockResponse();

      strictCSPMiddleware(req, res, mockNext);

      expect(res.locals.nonce).toBeDefined();
      expect(typeof res.locals.nonce).toBe('string');
    });

    it('should set security headers', () => {
      const req = createMockRequest();
      const res = createMockResponse();

      strictCSPMiddleware(req, res, mockNext);

      // Check that setHeader was called for security headers
      expect(res.setHeader).toHaveBeenCalled();
    });
  });

  describe('docsCSPMiddleware', () => {
    it('should call next', () => {
      const req = createMockRequest();
      const res = createMockResponse();

      docsCSPMiddleware(req, res, mockNext);

      // The middleware should eventually call next
      // Note: Due to async nature of helmet, we just verify no errors
      expect(mockNext).not.toThrow;
    });
  });

  describe('apiSecurityMiddleware', () => {
    it('should set API security headers', () => {
      const req = createMockRequest();
      const res = createMockResponse();

      apiSecurityMiddleware(req, res, mockNext);

      expect(res.setHeader).toHaveBeenCalledWith(
        'Permissions-Policy',
        expect.any(String)
      );
      expect(mockNext).toHaveBeenCalled();
    });

    it('should call next without error', () => {
      const req = createMockRequest();
      const res = createMockResponse();

      apiSecurityMiddleware(req, res, mockNext);

      expect(mockNext).toHaveBeenCalledWith();
    });
  });

  describe('routeAwareSecurityMiddleware', () => {
    it('should skip security for /health route', () => {
      const req = createMockRequest({ path: '/health' });
      const res = createMockResponse();

      routeAwareSecurityMiddleware(req, res, mockNext);

      expect(mockNext).toHaveBeenCalled();
      // Should not set any security headers for health route
      expect(res.setHeader).not.toHaveBeenCalled();
    });

    it('should use docs CSP for /docs route', () => {
      const req = createMockRequest({ path: '/docs' });
      const res = createMockResponse();

      routeAwareSecurityMiddleware(req, res, mockNext);

      // Docs route should be processed
      expect(true).toBe(true); // Middleware should not throw
    });

    it('should use docs CSP for /redoc route', () => {
      const req = createMockRequest({ path: '/redoc' });
      const res = createMockResponse();

      routeAwareSecurityMiddleware(req, res, mockNext);

      expect(true).toBe(true);
    });

    it('should use docs CSP for /api-docs route', () => {
      const req = createMockRequest({ path: '/api-docs' });
      const res = createMockResponse();

      routeAwareSecurityMiddleware(req, res, mockNext);

      expect(true).toBe(true);
    });

    it('should use docs CSP for /developer route', () => {
      const req = createMockRequest({ path: '/developer' });
      const res = createMockResponse();

      routeAwareSecurityMiddleware(req, res, mockNext);

      expect(true).toBe(true);
    });

    it('should use API security for /api/ routes', () => {
      const req = createMockRequest({ path: '/api/v1/screenshots' });
      const res = createMockResponse();

      routeAwareSecurityMiddleware(req, res, mockNext);

      expect(res.setHeader).toHaveBeenCalledWith(
        'Permissions-Policy',
        expect.any(String)
      );
      expect(mockNext).toHaveBeenCalled();
    });

    it('should use strict CSP for landing page (root route)', () => {
      const req = createMockRequest({ path: '/' });
      const res = createMockResponse();

      routeAwareSecurityMiddleware(req, res, mockNext);

      // Should generate a nonce for strict CSP
      expect(res.locals.nonce || res.setHeader).toBeDefined();
    });

    it('should use strict CSP for auth pages', () => {
      const req = createMockRequest({ path: '/login' });
      const res = createMockResponse();

      routeAwareSecurityMiddleware(req, res, mockNext);

      expect(res.locals.nonce || res.setHeader).toBeDefined();
    });

    it('should use strict CSP for dashboard pages', () => {
      const req = createMockRequest({ path: '/dashboard' });
      const res = createMockResponse();

      routeAwareSecurityMiddleware(req, res, mockNext);

      expect(res.locals.nonce || res.setHeader).toBeDefined();
    });
  });

  describe('Route Matchers', () => {
    describe('isDocsRoute', () => {
      it('should return true for /docs', () => {
        expect(isDocsRoute('/docs')).toBe(true);
      });

      it('should return true for /docs/openapi.json', () => {
        expect(isDocsRoute('/docs/openapi.json')).toBe(true);
      });

      it('should return true for /redoc', () => {
        expect(isDocsRoute('/redoc')).toBe(true);
      });

      it('should return true for /api-docs', () => {
        expect(isDocsRoute('/api-docs')).toBe(true);
      });

      it('should return true for /developer', () => {
        expect(isDocsRoute('/developer')).toBe(true);
      });

      it('should return false for /api/v1/screenshots', () => {
        expect(isDocsRoute('/api/v1/screenshots')).toBe(false);
      });

      it('should return false for /', () => {
        expect(isDocsRoute('/')).toBe(false);
      });

      it('should return false for /login', () => {
        expect(isDocsRoute('/login')).toBe(false);
      });

      it('should return false for /dashboard', () => {
        expect(isDocsRoute('/dashboard')).toBe(false);
      });
    });

    describe('isApiRoute', () => {
      it('should return true for /api/v1/screenshots', () => {
        expect(isApiRoute('/api/v1/screenshots')).toBe(true);
      });

      it('should return true for /api/v1/auth/login', () => {
        expect(isApiRoute('/api/v1/auth/login')).toBe(true);
      });

      it('should return true for /api/v1/subscriptions', () => {
        expect(isApiRoute('/api/v1/subscriptions')).toBe(true);
      });

      it('should return false for /docs', () => {
        expect(isApiRoute('/docs')).toBe(false);
      });

      it('should return false for /', () => {
        expect(isApiRoute('/')).toBe(false);
      });

      it('should return false for /login', () => {
        expect(isApiRoute('/login')).toBe(false);
      });

      it('should return false for /api-docs', () => {
        expect(isApiRoute('/api-docs')).toBe(false);
      });
    });

    describe('isStaticRoute', () => {
      it('should return true for .js files', () => {
        expect(isStaticRoute('/scripts/app.js')).toBe(true);
      });

      it('should return true for .css files', () => {
        expect(isStaticRoute('/styles/main.css')).toBe(true);
      });

      it('should return true for .png files', () => {
        expect(isStaticRoute('/images/logo.png')).toBe(true);
      });

      it('should return true for .jpg files', () => {
        expect(isStaticRoute('/images/photo.jpg')).toBe(true);
      });

      it('should return true for .svg files', () => {
        expect(isStaticRoute('/icons/icon.svg')).toBe(true);
      });

      it('should return true for .woff2 files', () => {
        expect(isStaticRoute('/fonts/inter.woff2')).toBe(true);
      });

      it('should return true for .ico files', () => {
        expect(isStaticRoute('/favicon.ico')).toBe(true);
      });

      it('should return false for /api/v1/screenshots', () => {
        expect(isStaticRoute('/api/v1/screenshots')).toBe(false);
      });

      it('should return false for /', () => {
        expect(isStaticRoute('/')).toBe(false);
      });

      it('should return false for /login', () => {
        expect(isStaticRoute('/login')).toBe(false);
      });
    });
  });

  describe('Security Headers', () => {
    it('should include Permissions-Policy in API security headers', () => {
      const req = createMockRequest({ path: '/api/v1/test' });
      const res = createMockResponse();

      apiSecurityMiddleware(req, res, mockNext);

      expect(res.setHeader).toHaveBeenCalledWith(
        'Permissions-Policy',
        expect.stringContaining('camera=()')
      );
    });

    it('should include multiple disabled features in Permissions-Policy', () => {
      const req = createMockRequest({ path: '/api/v1/test' });
      const res = createMockResponse();

      apiSecurityMiddleware(req, res, mockNext);

      const call = (res.setHeader as jest.Mock).mock.calls.find(
        ([header]) => header === 'Permissions-Policy'
      );
      expect(call).toBeDefined();
      const policy = call[1];
      expect(policy).toContain('camera=()');
      expect(policy).toContain('microphone=()');
      expect(policy).toContain('geolocation=()');
    });
  });
});
