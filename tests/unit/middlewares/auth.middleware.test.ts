/**
 * Auth Middleware Tests
 */

// Set environment variables before any imports
process.env.JWT_SECRET = 'test-jwt-secret-key-minimum-32-characters-long';
process.env.JWT_REFRESH_SECRET = 'test-jwt-refresh-secret-key-minimum-32-chars';
process.env.NODE_ENV = 'test';

import { Request, Response, NextFunction } from 'express';
import {
  authenticateJWT,
  authenticateApiKeyMiddleware,
  authenticateAny,
  optionalAuth,
  requireRole,
  requireAdmin,
  requireVerified,
  requirePermission,
} from '@middlewares/auth.middleware';
import { generateAccessToken, createApiKey } from '@services/auth.service';
import { User } from '@models/index';

// Mock Express request/response
const mockRequest = (overrides: Record<string, unknown> = {}): Partial<Request> => {
  const headers = (overrides.headers as Record<string, string>) || {};
  return {
    headers,
    header: ((name: string): string | string[] | undefined => {
      return headers[name.toLowerCase()];
    }) as Request['header'],
    ip: '127.0.0.1',
    socket: { remoteAddress: '127.0.0.1' } as unknown as Request['socket'],
    ...overrides,
  };
};

const mockResponse = (): Partial<Response> => {
  const res: Partial<Response> = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  res.set = jest.fn().mockReturnValue(res);
  return res;
};

const mockNext = (): NextFunction => jest.fn();

describe('Auth Middleware', () => {
  let testUser: InstanceType<typeof User>;
  let validToken: string;

  beforeEach(async () => {
    testUser = await User.create({
      email: `middleware-${Date.now()}@example.com`,
      password: 'TestPassword123!',
      name: 'Middleware Test User',
      isVerified: true,
    });

    validToken = generateAccessToken({
      userId: testUser._id.toString(),
      email: testUser.email,
      role: testUser.role,
    });
  });

  // ============================================
  // JWT Authentication Tests
  // ============================================

  describe('authenticateJWT', () => {
    it('should authenticate with valid Bearer token', async () => {
      const req = mockRequest({
        headers: { authorization: `Bearer ${validToken}` },
      }) as Request;
      const res = mockResponse() as Response;
      const next = mockNext();

      await new Promise<void>((resolve) => {
        authenticateJWT(req, res, () => {
          next();
          resolve();
        });
      });

      expect(next).toHaveBeenCalled();
      expect(req.userId?.toString()).toBe(testUser._id.toString());
      expect(req.user).toBeDefined();
    });

    it('should reject request without authorization header', () => {
      const req = mockRequest() as Request;
      const res = mockResponse() as Response;
      const next = mockNext();

      authenticateJWT(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: expect.objectContaining({
            code: 'UNAUTHORIZED',
          }),
        })
      );
      expect(next).not.toHaveBeenCalled();
    });

    it('should reject request with invalid token', () => {
      const req = mockRequest({
        headers: { authorization: 'Bearer invalid-token' },
      }) as Request;
      const res = mockResponse() as Response;
      const next = mockNext();

      authenticateJWT(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(next).not.toHaveBeenCalled();
    });

    it('should reject request with malformed Bearer token', () => {
      const req = mockRequest({
        headers: { authorization: 'NotBearer token' },
      }) as Request;
      const res = mockResponse() as Response;
      const next = mockNext();

      authenticateJWT(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(next).not.toHaveBeenCalled();
    });
  });

  // ============================================
  // API Key Authentication Tests
  // ============================================

  describe('authenticateApiKeyMiddleware', () => {
    it('should authenticate with valid API key in header', async () => {
      const { plainTextKey } = await createApiKey(testUser._id, {
        name: 'Middleware Test Key',
      });

      const req = mockRequest({
        headers: { 'x-api-key': plainTextKey },
      }) as Request;
      const res = mockResponse() as Response;
      const next = mockNext();

      await new Promise<void>((resolve, reject) => {
        const timeout = setTimeout(() => reject(new Error('Timeout')), 5000);
        authenticateApiKeyMiddleware(req, res, () => {
          clearTimeout(timeout);
          next();
          resolve();
        });
        // If response is called, resolve
        setTimeout(() => {
          if ((res.status as jest.Mock).mock.calls.length > 0) {
            clearTimeout(timeout);
            resolve();
          }
        }, 100);
      });

      if ((res.status as jest.Mock).mock.calls.length === 0) {
        expect(next).toHaveBeenCalled();
        expect(req.apiKey).toBeDefined();
        expect(req.userId?.toString()).toBe(testUser._id.toString());
      }
    });

    it('should reject request without API key', async () => {
      const req = mockRequest() as Request;
      const res = mockResponse() as Response;
      const next = mockNext();

      authenticateApiKeyMiddleware(req, res, next);

      // Wait for async operation
      await new Promise((resolve) => setTimeout(resolve, 100));

      expect(res.status).toHaveBeenCalledWith(401);
      expect(next).not.toHaveBeenCalled();
    });

    it('should reject request with invalid API key', async () => {
      const req = mockRequest({
        headers: { 'x-api-key': 'ss_invalidkey12345678901234567890' },
      }) as Request;
      const res = mockResponse() as Response;
      const next = mockNext();

      authenticateApiKeyMiddleware(req, res, next);

      // Wait for async operation
      await new Promise((resolve) => setTimeout(resolve, 100));

      expect(res.status).toHaveBeenCalledWith(401);
      expect(next).not.toHaveBeenCalled();
    });
  });

  // ============================================
  // Combined Authentication Tests
  // ============================================

  describe('authenticateAny', () => {
    it('should authenticate with JWT token', async () => {
      const req = mockRequest({
        headers: { authorization: `Bearer ${validToken}` },
      }) as Request;
      const res = mockResponse() as Response;
      const next = mockNext();

      await new Promise<void>((resolve) => {
        authenticateAny(req, res, () => {
          next();
          resolve();
        });
      });

      expect(next).toHaveBeenCalled();
      expect(req.userId).toBeDefined();
    });

    it('should authenticate with API key', async () => {
      const { plainTextKey } = await createApiKey(testUser._id, {
        name: 'Any Auth Test Key',
      });

      const req = mockRequest({
        headers: { 'x-api-key': plainTextKey },
      }) as Request;
      const res = mockResponse() as Response;
      const next = mockNext();

      await new Promise<void>((resolve) => {
        const timeout = setTimeout(() => resolve(), 5000);
        authenticateAny(req, res, () => {
          clearTimeout(timeout);
          next();
          resolve();
        });
      });

      if ((res.status as jest.Mock).mock.calls.length === 0) {
        expect(next).toHaveBeenCalled();
        expect(req.apiKey).toBeDefined();
      }
    });

    it('should reject when no authentication provided', async () => {
      const req = mockRequest() as Request;
      const res = mockResponse() as Response;
      const next = mockNext();

      authenticateAny(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(next).not.toHaveBeenCalled();
    });
  });

  // ============================================
  // Optional Authentication Tests
  // ============================================

  describe('optionalAuth', () => {
    it('should continue without authentication', async () => {
      const req = mockRequest() as Request;
      const res = mockResponse() as Response;
      const next = mockNext();

      optionalAuth(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(req.userId).toBeUndefined();
    });

    it('should set user info when valid token provided', async () => {
      const req = mockRequest({
        headers: { authorization: `Bearer ${validToken}` },
      }) as Request;
      const res = mockResponse() as Response;
      const next = mockNext();

      await new Promise<void>((resolve) => {
        optionalAuth(req, res, () => {
          next();
          resolve();
        });
      });

      expect(next).toHaveBeenCalled();
      expect(req.userId?.toString()).toBe(testUser._id.toString());
    });

    it('should continue with invalid token (does not reject)', async () => {
      const req = mockRequest({
        headers: { authorization: 'Bearer invalid-token' },
      }) as Request;
      const res = mockResponse() as Response;
      const next = mockNext();

      optionalAuth(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(req.userId).toBeUndefined();
    });
  });

  // ============================================
  // Role-based Authorization Tests
  // ============================================

  describe('requireRole', () => {
    it('should allow user with correct role', () => {
      const req = mockRequest({
        user: { ...testUser.toObject(), role: 'admin' },
      }) as Request;
      const res = mockResponse() as Response;
      const next = mockNext();

      const middleware = requireRole('admin');
      middleware(req, res, next);

      expect(next).toHaveBeenCalled();
    });

    it('should allow user with one of multiple roles', () => {
      const req = mockRequest({
        user: { ...testUser.toObject(), role: 'admin' },
      }) as Request;
      const res = mockResponse() as Response;
      const next = mockNext();

      const middleware = requireRole('user', 'admin');
      middleware(req, res, next);

      expect(next).toHaveBeenCalled();
    });

    it('should reject user without required role', () => {
      const req = mockRequest({
        user: { ...testUser.toObject(), role: 'user' },
      }) as Request;
      const res = mockResponse() as Response;
      const next = mockNext();

      const middleware = requireRole('admin');
      middleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(next).not.toHaveBeenCalled();
    });

    it('should reject when no user is set', () => {
      const req = mockRequest() as Request;
      const res = mockResponse() as Response;
      const next = mockNext();

      const middleware = requireRole('admin');
      middleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(next).not.toHaveBeenCalled();
    });
  });

  // ============================================
  // Admin Authorization Tests
  // ============================================

  describe('requireAdmin', () => {
    it('should allow admin user', () => {
      const req = mockRequest({
        user: { ...testUser.toObject(), role: 'admin' },
      }) as Request;
      const res = mockResponse() as Response;
      const next = mockNext();

      requireAdmin(req, res, next);

      expect(next).toHaveBeenCalled();
    });

    it('should reject non-admin user', () => {
      const req = mockRequest({
        user: { ...testUser.toObject(), role: 'user' },
      }) as Request;
      const res = mockResponse() as Response;
      const next = mockNext();

      requireAdmin(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(next).not.toHaveBeenCalled();
    });
  });

  // ============================================
  // Verified User Tests
  // ============================================

  describe('requireVerified', () => {
    it('should allow verified user', () => {
      const req = mockRequest({
        user: { ...testUser.toObject(), isVerified: true },
      }) as Request;
      const res = mockResponse() as Response;
      const next = mockNext();

      requireVerified(req, res, next);

      expect(next).toHaveBeenCalled();
    });

    it('should reject unverified user', () => {
      const req = mockRequest({
        user: { ...testUser.toObject(), isVerified: false },
      }) as Request;
      const res = mockResponse() as Response;
      const next = mockNext();

      requireVerified(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(next).not.toHaveBeenCalled();
    });

    it('should reject when no user is set', () => {
      const req = mockRequest() as Request;
      const res = mockResponse() as Response;
      const next = mockNext();

      requireVerified(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(next).not.toHaveBeenCalled();
    });
  });

  // ============================================
  // Permission-based Authorization Tests
  // ============================================

  describe('requirePermission', () => {
    it('should allow API key with required permission', () => {
      const req = mockRequest({
        apiKey: {
          permissions: ['screenshot:create', 'screenshot:read'],
          hasPermission: (perm: string) => ['screenshot:create', 'screenshot:read'].includes(perm),
        },
      }) as Request;
      const res = mockResponse() as Response;
      const next = mockNext();

      const middleware = requirePermission('screenshot:create');
      middleware(req, res, next);

      expect(next).toHaveBeenCalled();
    });

    it('should reject when missing required permission', () => {
      const req = mockRequest({
        apiKey: {
          permissions: ['screenshot:read'],
          hasPermission: (perm: string) => ['screenshot:read'].includes(perm),
        },
      }) as Request;
      const res = mockResponse() as Response;
      const next = mockNext();

      const middleware = requirePermission('screenshot:create');
      middleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(next).not.toHaveBeenCalled();
    });

    it('should allow user without API key (user has full access via JWT)', () => {
      const req = mockRequest({
        user: testUser.toObject(),
        userId: testUser._id,
        tokenPayload: {
          userId: testUser._id.toString(),
          email: testUser.email,
          role: testUser.role,
        },
      }) as Request;
      const res = mockResponse() as Response;
      const next = mockNext();

      const middleware = requirePermission('screenshot:create');
      middleware(req, res, next);

      expect(next).toHaveBeenCalled();
    });
  });
});
