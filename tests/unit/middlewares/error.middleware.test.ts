/**
 * Error Middleware Tests
 */

// Set environment variables before any imports
process.env.JWT_SECRET = 'test-jwt-secret-key-minimum-32-characters-long';
process.env.JWT_REFRESH_SECRET = 'test-jwt-refresh-secret-key-minimum-32-chars';
process.env.NODE_ENV = 'test';

import { Request, Response, NextFunction } from 'express';
import { ZodError, z } from 'zod';
import mongoose from 'mongoose';
import {
  AppError,
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  ConflictError,
  RateLimitError,
  UsageLimitError,
  PaymentRequiredError,
  errorHandler,
  notFoundHandler,
  asyncHandler,
} from '@middlewares/error.middleware';
import { ERROR_CODES } from '@utils/constants';

// Mock Express request/response
const mockRequest = (overrides = {}): Partial<Request> => ({
  path: '/test',
  method: 'GET',
  ip: '127.0.0.1',
  headers: {},
  ...overrides,
});

const mockResponse = (): Partial<Response> => {
  const res: Partial<Response> = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

const mockNext = (): NextFunction => jest.fn();

describe('Error Middleware', () => {
  // ============================================
  // Custom Error Classes Tests
  // ============================================

  describe('Custom Error Classes', () => {
    describe('AppError', () => {
      it('should create error with default values', () => {
        const error = new AppError('Test error');

        expect(error.message).toBe('Test error');
        expect(error.statusCode).toBe(500);
        expect(error.code).toBe(ERROR_CODES.INTERNAL_ERROR);
        expect(error.isOperational).toBe(true);
      });

      it('should create error with custom values', () => {
        const error = new AppError('Custom error', 400, 'CUSTOM_CODE', false, {
          field: 'value',
        });

        expect(error.message).toBe('Custom error');
        expect(error.statusCode).toBe(400);
        expect(error.code).toBe('CUSTOM_CODE');
        expect(error.isOperational).toBe(false);
        expect(error.details).toEqual({ field: 'value' });
      });

      it('should be instance of Error', () => {
        const error = new AppError('Test');

        expect(error).toBeInstanceOf(Error);
        expect(error).toBeInstanceOf(AppError);
      });

      it('should have stack trace', () => {
        const error = new AppError('Test');

        expect(error.stack).toBeDefined();
        // Stack trace format varies by environment, just ensure it exists and has the test location
        expect(error.stack).toContain('error.middleware.test.ts');
      });
    });

    describe('ValidationError', () => {
      it('should create validation error with correct status code', () => {
        const error = new ValidationError('Validation failed', { field: 'error' });

        expect(error.statusCode).toBe(400);
        expect(error.code).toBe(ERROR_CODES.VALIDATION_ERROR);
        expect(error.details).toEqual({ field: 'error' });
      });
    });

    describe('AuthenticationError', () => {
      it('should create auth error with default message', () => {
        const error = new AuthenticationError();

        expect(error.statusCode).toBe(401);
        expect(error.code).toBe(ERROR_CODES.UNAUTHORIZED);
        expect(error.message).toBe('Authentication required');
      });

      it('should create auth error with custom message', () => {
        const error = new AuthenticationError('Invalid token');

        expect(error.message).toBe('Invalid token');
      });
    });

    describe('AuthorizationError', () => {
      it('should create authorization error with default message', () => {
        const error = new AuthorizationError();

        expect(error.statusCode).toBe(403);
        expect(error.code).toBe(ERROR_CODES.FORBIDDEN);
        expect(error.message).toBe('Access denied');
      });
    });

    describe('NotFoundError', () => {
      it('should create not found error with resource name', () => {
        const error = new NotFoundError('User');

        expect(error.statusCode).toBe(404);
        expect(error.code).toBe(ERROR_CODES.NOT_FOUND);
        expect(error.message).toBe('User not found');
      });

      it('should create not found error with default resource', () => {
        const error = new NotFoundError();

        expect(error.message).toBe('Resource not found');
      });
    });

    describe('ConflictError', () => {
      it('should create conflict error', () => {
        const error = new ConflictError('Email already exists');

        expect(error.statusCode).toBe(409);
        expect(error.code).toBe(ERROR_CODES.CONFLICT);
        expect(error.message).toBe('Email already exists');
      });
    });

    describe('RateLimitError', () => {
      it('should create rate limit error with retry after', () => {
        const error = new RateLimitError(120);

        expect(error.statusCode).toBe(429);
        expect(error.code).toBe(ERROR_CODES.RATE_LIMIT_EXCEEDED);
        expect(error.retryAfter).toBe(120);
      });

      it('should use default retry after', () => {
        const error = new RateLimitError();

        expect(error.retryAfter).toBe(60);
      });
    });

    describe('UsageLimitError', () => {
      it('should create usage limit error', () => {
        const error = new UsageLimitError('Screenshot quota exceeded');

        expect(error.statusCode).toBe(429);
        expect(error.code).toBe(ERROR_CODES.USAGE_LIMIT_EXCEEDED);
        expect(error.message).toBe('Screenshot quota exceeded');
      });

      it('should use default message', () => {
        const error = new UsageLimitError();

        expect(error.message).toBe('Monthly usage limit reached');
      });
    });

    describe('PaymentRequiredError', () => {
      it('should create payment required error', () => {
        const error = new PaymentRequiredError('Upgrade required');

        expect(error.statusCode).toBe(402);
        expect(error.code).toBe(ERROR_CODES.PAYMENT_REQUIRED);
        expect(error.message).toBe('Upgrade required');
      });
    });
  });

  // ============================================
  // Error Handler Tests
  // ============================================

  describe('errorHandler', () => {
    it('should handle AppError', () => {
      const error = new AppError('Test error', 400, 'TEST_ERROR');
      const req = mockRequest() as Request;
      const res = mockResponse() as Response;
      const next = mockNext();

      errorHandler(error, req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: expect.objectContaining({
            code: 'TEST_ERROR',
            message: 'Test error',
          }),
        })
      );
    });

    it('should handle ZodError', () => {
      const schema = z.object({
        email: z.string().email(),
        age: z.number().min(18),
      });

      let zodError: ZodError | null = null;
      try {
        schema.parse({ email: 'invalid', age: 10 });
      } catch (e) {
        zodError = e as ZodError;
      }

      const req = mockRequest() as Request;
      const res = mockResponse() as Response;
      const next = mockNext();

      errorHandler(zodError!, req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: expect.objectContaining({
            code: ERROR_CODES.VALIDATION_ERROR,
            message: 'Validation failed',
            details: expect.any(Object),
          }),
        })
      );
    });

    it('should handle Mongoose ValidationError', () => {
      const error = new mongoose.Error.ValidationError();
      error.errors = {
        email: {
          message: 'Email is required',
        } as mongoose.Error.ValidatorError,
      };

      const req = mockRequest() as Request;
      const res = mockResponse() as Response;
      const next = mockNext();

      errorHandler(error, req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: expect.objectContaining({
            code: ERROR_CODES.VALIDATION_ERROR,
            details: { email: 'Email is required' },
          }),
        })
      );
    });

    it('should handle Mongoose CastError', () => {
      const error = new mongoose.Error.CastError('ObjectId', 'invalid-id', '_id');

      const req = mockRequest() as Request;
      const res = mockResponse() as Response;
      const next = mockNext();

      errorHandler(error, req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: expect.objectContaining({
            code: ERROR_CODES.VALIDATION_ERROR,
          }),
        })
      );
    });

    it('should handle MongoDB duplicate key error', () => {
      const error = {
        code: 11000,
        keyPattern: { email: 1 },
        message: 'Duplicate key error',
      };

      const req = mockRequest() as Request;
      const res = mockResponse() as Response;
      const next = mockNext();

      errorHandler(error as unknown as Error, req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: expect.objectContaining({
            code: ERROR_CODES.CONFLICT,
            message: 'Email already exists',
          }),
        })
      );
    });

    it('should handle unknown errors', () => {
      const error = new Error('Unknown error');

      const req = mockRequest() as Request;
      const res = mockResponse() as Response;
      const next = mockNext();

      errorHandler(error, req, res, next);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: expect.objectContaining({
            code: ERROR_CODES.INTERNAL_ERROR,
          }),
        })
      );
    });

    it('should include stack trace in development', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';

      const error = new Error('Dev error');
      const req = mockRequest() as Request;
      const res = mockResponse() as Response;
      const next = mockNext();

      errorHandler(error, req, res, next);

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.objectContaining({
            stack: expect.any(String),
          }),
        })
      );

      process.env.NODE_ENV = originalEnv;
    });

    it('should not include stack trace in production', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';

      const error = new Error('Prod error');
      const req = mockRequest() as Request;
      const res = mockResponse() as Response;
      const next = mockNext();

      errorHandler(error, req, res, next);

      const jsonCall = (res.json as jest.Mock).mock.calls[0][0];
      expect(jsonCall.error.stack).toBeUndefined();

      process.env.NODE_ENV = originalEnv;
    });

    it('should include request ID if present', () => {
      const error = new AppError('Test');
      const req = mockRequest({
        headers: { 'x-request-id': 'req-123' },
      }) as Request;
      const res = mockResponse() as Response;
      const next = mockNext();

      errorHandler(error, req, res, next);

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          requestId: 'req-123',
        })
      );
    });

    it('should include details for AppError with details', () => {
      const error = new AppError('Test', 400, 'TEST', true, { extra: 'info' });
      const req = mockRequest() as Request;
      const res = mockResponse() as Response;
      const next = mockNext();

      errorHandler(error, req, res, next);

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.objectContaining({
            details: { extra: 'info' },
          }),
        })
      );
    });
  });

  // ============================================
  // Not Found Handler Tests
  // ============================================

  describe('notFoundHandler', () => {
    it('should return 404 for unknown routes', () => {
      const req = mockRequest({
        method: 'GET',
        path: '/unknown/route',
      }) as Request;
      const res = mockResponse() as Response;
      const next = mockNext();

      notFoundHandler(req, res, next);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: expect.objectContaining({
            code: ERROR_CODES.NOT_FOUND,
            message: 'Route GET /unknown/route not found',
          }),
        })
      );
    });

    it('should include correct HTTP method in message', () => {
      const req = mockRequest({
        method: 'POST',
        path: '/api/test',
      }) as Request;
      const res = mockResponse() as Response;
      const next = mockNext();

      notFoundHandler(req, res, next);

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.objectContaining({
            message: 'Route POST /api/test not found',
          }),
        })
      );
    });
  });

  // ============================================
  // Async Handler Tests
  // ============================================

  describe('asyncHandler', () => {
    it('should call handler function', async () => {
      const handler = jest.fn().mockResolvedValue(undefined);
      const wrapped = asyncHandler(handler);

      const req = mockRequest() as Request;
      const res = mockResponse() as Response;
      const next = mockNext();

      await wrapped(req, res, next);

      expect(handler).toHaveBeenCalledWith(req, res, next);
    });

    it('should pass errors to next', async () => {
      const error = new Error('Async error');
      const handler = jest.fn().mockRejectedValue(error);
      const wrapped = asyncHandler(handler);

      const req = mockRequest() as Request;
      const res = mockResponse() as Response;
      const next = mockNext();

      await wrapped(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });

    it('should catch synchronous errors', async () => {
      const error = new Error('Sync error');
      const handler = jest.fn().mockImplementation(async () => {
        throw error;
      });
      const wrapped = asyncHandler(handler);

      const req = mockRequest() as Request;
      const res = mockResponse() as Response;
      const next = mockNext();

      await wrapped(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });
});
