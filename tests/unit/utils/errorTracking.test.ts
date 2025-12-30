/**
 * Error Tracking Utility Unit Tests
 */

import {
  captureError,
  captureRequestError,
  captureFatalError,
  captureWarning,
  withErrorTracking,
} from '@utils/errorTracking';
import logger from '@utils/logger';

// Mock logger
jest.mock('@utils/logger', () => ({
  log: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  debug: jest.fn(),
}));

// Mock config
jest.mock('@config/index', () => ({
  env: 'test',
}));

describe('Error Tracking Utility', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    delete process.env.SENTRY_DSN;
    delete process.env.ROLLBAR_TOKEN;
  });

  // ============================================
  // captureError Tests
  // ============================================

  describe('captureError', () => {
    it('should log error with correct structure', () => {
      const error = new Error('Test error');
      captureError(error);

      expect(logger.log).toHaveBeenCalledWith(
        'error',
        'Captured error',
        expect.objectContaining({
          type: 'error_tracking',
          error: expect.objectContaining({
            name: 'Error',
            message: 'Test error',
            stack: expect.any(String),
            timestamp: expect.any(String),
            fingerprint: expect.any(String),
          }),
        })
      );
    });

    it('should include user context', () => {
      const error = new Error('User error');
      captureError(error, {
        user: { id: 'user123', email: 'test@example.com' },
      });

      expect(logger.log).toHaveBeenCalledWith(
        'error',
        'Captured error',
        expect.objectContaining({
          error: expect.objectContaining({
            context: expect.objectContaining({
              user: { id: 'user123', email: 'test@example.com' },
            }),
          }),
        })
      );
    });

    it('should include request context', () => {
      const error = new Error('Request error');
      captureError(error, {
        request: {
          path: '/api/test',
          method: 'POST',
          ip: '127.0.0.1',
        },
      });

      expect(logger.log).toHaveBeenCalledWith(
        'error',
        'Captured error',
        expect.objectContaining({
          error: expect.objectContaining({
            context: expect.objectContaining({
              request: {
                path: '/api/test',
                method: 'POST',
                ip: '127.0.0.1',
              },
            }),
          }),
        })
      );
    });

    it('should sanitize sensitive headers', () => {
      const error = new Error('Header error');
      captureError(error, {
        request: {
          path: '/api/test',
          method: 'GET',
          headers: {
            authorization: 'Bearer secret',
            'x-api-key': 'api-key-value',
            cookie: 'session=abc',
            'content-type': 'application/json',
          },
        },
      });

      const call = (logger.log as jest.Mock).mock.calls[0];
      const context = call[2].error.context;

      expect(context.request.headers).not.toHaveProperty('authorization');
      expect(context.request.headers).not.toHaveProperty('x-api-key');
      expect(context.request.headers).not.toHaveProperty('cookie');
      expect(context.request.headers).toHaveProperty('content-type');
    });

    it('should sanitize sensitive body fields', () => {
      const error = new Error('Body error');
      captureError(error, {
        request: {
          path: '/api/login',
          method: 'POST',
          body: {
            email: 'test@example.com',
            password: 'secret123',
            token: 'refresh-token',
          },
        },
      });

      const call = (logger.log as jest.Mock).mock.calls[0];
      const context = call[2].error.context;

      expect(context.request.body).toHaveProperty('email');
      expect(context.request.body).not.toHaveProperty('password');
      expect(context.request.body).not.toHaveProperty('token');
    });

    it('should generate fingerprint for error grouping', () => {
      const error = new Error('Duplicate error');
      captureError(error, {
        request: { path: '/api/test', method: 'GET' },
      });

      const call = (logger.log as jest.Mock).mock.calls[0];
      expect(call[2].error.fingerprint).toBe('Error:Duplicate error:/api/test:GET');
    });

    it('should replace MongoDB IDs in fingerprint', () => {
      const error = new Error('Not found: 507f1f77bcf86cd799439011');
      captureError(error, {
        request: { path: '/api/test', method: 'GET' },
      });

      const call = (logger.log as jest.Mock).mock.calls[0];
      expect(call[2].error.fingerprint).toBe('Error:Not found: <id>:/api/test:GET');
    });

    it('should use warning level for warning severity', () => {
      const error = new Error('Warning error');
      captureError(error, { severity: 'warning' });

      expect(logger.log).toHaveBeenCalledWith('warning', 'Captured error', expect.any(Object));
    });
  });

  // ============================================
  // captureRequestError Tests
  // ============================================

  describe('captureRequestError', () => {
    it('should capture error with request context', () => {
      const error = new Error('Request failed');
      const mockReq = {
        requestId: 'req-123',
        path: '/api/screenshots',
        method: 'POST',
        query: { format: 'png' },
        ip: '192.168.1.1',
        user: { _id: 'user123', email: 'test@example.com' },
      };

      captureRequestError(error, mockReq);

      expect(logger.log).toHaveBeenCalledWith(
        'error',
        'Captured error',
        expect.objectContaining({
          error: expect.objectContaining({
            context: expect.objectContaining({
              requestId: 'req-123',
              request: expect.objectContaining({
                path: '/api/screenshots',
                method: 'POST',
              }),
              user: expect.objectContaining({
                id: 'user123',
                email: 'test@example.com',
              }),
            }),
          }),
        })
      );
    });

    it('should handle missing user', () => {
      const error = new Error('Anonymous error');
      const mockReq = {
        path: '/api/public',
        method: 'GET',
      };

      captureRequestError(error, mockReq);

      const call = (logger.log as jest.Mock).mock.calls[0];
      expect(call[2].error.context.user).toBeUndefined();
    });
  });

  // ============================================
  // captureFatalError Tests
  // ============================================

  describe('captureFatalError', () => {
    it('should capture error with fatal severity', () => {
      const error = new Error('Fatal error');
      captureFatalError(error);

      expect(logger.log).toHaveBeenCalledWith(
        'error',
        'Captured error',
        expect.objectContaining({
          error: expect.objectContaining({
            context: expect.objectContaining({
              severity: 'fatal',
            }),
          }),
        })
      );
    });
  });

  // ============================================
  // captureWarning Tests
  // ============================================

  describe('captureWarning', () => {
    it('should capture error with warning severity', () => {
      const error = new Error('Warning');
      captureWarning(error);

      expect(logger.log).toHaveBeenCalledWith(
        'warning',
        'Captured error',
        expect.objectContaining({
          error: expect.objectContaining({
            context: expect.objectContaining({
              severity: 'warning',
            }),
          }),
        })
      );
    });
  });

  // ============================================
  // withErrorTracking Tests
  // ============================================

  describe('withErrorTracking', () => {
    it('should return result on success', async () => {
      const fn = async (...args: unknown[]) => (args[0] as number) * 2;
      const wrapped = withErrorTracking(fn);

      const result = await wrapped(5);
      expect(result).toBe(10);
      expect(logger.log).not.toHaveBeenCalled();
    });

    it('should capture and rethrow errors', async () => {
      const fn = async () => {
        throw new Error('Async error');
      };
      const wrapped = withErrorTracking(fn);

      await expect(wrapped()).rejects.toThrow('Async error');
      expect(logger.log).toHaveBeenCalledWith(
        'error',
        'Captured error',
        expect.any(Object)
      );
    });

    it('should include provided context', async () => {
      const fn = async () => {
        throw new Error('Context error');
      };
      const wrapped = withErrorTracking(fn, {
        tags: { component: 'test' },
      });

      await expect(wrapped()).rejects.toThrow('Context error');

      const call = (logger.log as jest.Mock).mock.calls[0];
      expect(call[2].error.context.tags).toEqual({ component: 'test' });
    });
  });
});
