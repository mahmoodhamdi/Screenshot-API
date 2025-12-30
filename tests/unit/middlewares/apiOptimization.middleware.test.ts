/**
 * API Optimization Middleware Unit Tests
 * Tests for ETag, response time tracking, and field selection
 */

import { Request, Response, NextFunction } from 'express';
import {
  etagMiddleware,
  responseTimeMiddleware,
  parseFieldSelection,
  applyFieldSelection,
  ALLOWED_FIELDS,
} from '@middlewares/apiOptimization.middleware';

// Mock logger
jest.mock('@utils/logger', () => ({
  warn: jest.fn(),
  info: jest.fn(),
  debug: jest.fn(),
  error: jest.fn(),
}));

describe('API Optimization Middleware', () => {
  // ============================================
  // ETag Middleware Tests
  // ============================================

  describe('etagMiddleware', () => {
    let mockReq: Partial<Request>;
    let mockRes: Partial<Response>;
    let mockNext: NextFunction;
    let originalJson: jest.Mock;

    beforeEach(() => {
      mockReq = {
        headers: {},
      };
      originalJson = jest.fn().mockReturnThis();
      mockRes = {
        json: originalJson,
        status: jest.fn().mockReturnThis(),
        end: jest.fn().mockReturnThis(),
        setHeader: jest.fn(),
        getHeader: jest.fn(),
        statusCode: 200,
      };
      mockNext = jest.fn();
    });

    it('should add ETag header to response', () => {
      etagMiddleware(mockReq as Request, mockRes as Response, mockNext);

      // Call the wrapped json method
      const data = { success: true, data: { id: '123' } };
      (mockRes.json as jest.Mock)(data);

      expect(mockRes.setHeader).toHaveBeenCalledWith('ETag', expect.stringMatching(/^"[a-f0-9]{32}"$/));
    });

    it('should return 304 when ETag matches If-None-Match', () => {
      // First, get the ETag
      etagMiddleware(mockReq as Request, mockRes as Response, mockNext);
      const data = { success: true };

      // Capture the ETag
      let capturedETag = '';
      (mockRes.setHeader as jest.Mock).mockImplementation((name: string, value: string) => {
        if (name === 'ETag') {
          capturedETag = value;
        }
      });

      (mockRes.json as jest.Mock)(data);

      // Now make a request with If-None-Match
      const mockReq2: Partial<Request> = {
        headers: { 'if-none-match': capturedETag },
      };
      const mockRes2: Partial<Response> = {
        json: jest.fn().mockReturnThis(),
        status: jest.fn().mockReturnThis(),
        end: jest.fn().mockReturnThis(),
        setHeader: jest.fn(),
        getHeader: jest.fn(),
        statusCode: 200,
      };

      etagMiddleware(mockReq2 as Request, mockRes2 as Response, mockNext);
      (mockRes2.json as jest.Mock)(data);

      expect(mockRes2.status).toHaveBeenCalledWith(304);
      expect(mockRes2.end).toHaveBeenCalled();
    });

    it('should not add ETag for error responses', () => {
      mockRes.statusCode = 400;
      etagMiddleware(mockReq as Request, mockRes as Response, mockNext);

      const data = { success: false, error: 'Bad Request' };
      (mockRes.json as jest.Mock)(data);

      expect(mockRes.setHeader).not.toHaveBeenCalledWith('ETag', expect.anything());
    });

    it('should set Cache-Control header if not already set', () => {
      (mockRes.getHeader as jest.Mock).mockReturnValue(undefined);
      etagMiddleware(mockReq as Request, mockRes as Response, mockNext);

      const data = { success: true };
      (mockRes.json as jest.Mock)(data);

      expect(mockRes.setHeader).toHaveBeenCalledWith(
        'Cache-Control',
        'private, max-age=0, must-revalidate'
      );
    });

    it('should call next', () => {
      etagMiddleware(mockReq as Request, mockRes as Response, mockNext);
      expect(mockNext).toHaveBeenCalled();
    });
  });

  // ============================================
  // Response Time Middleware Tests
  // ============================================

  describe('responseTimeMiddleware', () => {
    let mockReq: Partial<Request>;
    let mockRes: Partial<Response> & { end: jest.Mock };
    let mockNext: NextFunction;

    beforeEach(() => {
      mockReq = {
        path: '/api/test',
        method: 'GET',
        query: {},
        headers: {},
        ip: '127.0.0.1',
      };
      mockRes = {
        setHeader: jest.fn(),
        headersSent: false,
        end: jest.fn().mockReturnThis(),
        locals: {},
        statusCode: 200,
      };
      mockNext = jest.fn();
    });

    it('should store request start time in res.locals', () => {
      responseTimeMiddleware(mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.locals?.requestStartTime).toBeDefined();
      expect(typeof mockRes.locals?.requestStartTime).toBe('bigint');
    });

    it('should override res.end method', () => {
      const originalEnd = mockRes.end;
      responseTimeMiddleware(mockReq as Request, mockRes as Response, mockNext);

      // res.end should be overridden
      expect(mockRes.end).not.toBe(originalEnd);
    });

    it('should set X-Response-Time header when res.end is called', () => {
      responseTimeMiddleware(mockReq as Request, mockRes as Response, mockNext);

      // Call the overridden end method
      mockRes.end();

      expect(mockRes.setHeader).toHaveBeenCalledWith(
        'X-Response-Time',
        expect.stringMatching(/^\d+\.\d{2}ms$/)
      );
    });

    it('should call next', () => {
      responseTimeMiddleware(mockReq as Request, mockRes as Response, mockNext);
      expect(mockNext).toHaveBeenCalled();
    });
  });

  // ============================================
  // Field Selection Tests
  // ============================================

  describe('parseFieldSelection', () => {
    it('should return undefined for empty fields', () => {
      expect(parseFieldSelection(undefined, 'screenshot')).toBeUndefined();
      expect(parseFieldSelection('', 'screenshot')).toBeUndefined();
    });

    it('should parse valid field names', () => {
      const result = parseFieldSelection('_id,url,status', 'screenshot');
      expect(result).toEqual({ _id: 1, url: 1, status: 1 });
    });

    it('should filter out invalid field names', () => {
      const result = parseFieldSelection('_id,url,invalidField,password', 'screenshot');
      expect(result).toEqual({ _id: 1, url: 1 });
      expect(result).not.toHaveProperty('invalidField');
      expect(result).not.toHaveProperty('password');
    });

    it('should return undefined for unknown resource types', () => {
      const result = parseFieldSelection('_id,url', 'unknownType' as keyof typeof ALLOWED_FIELDS);
      expect(result).toBeUndefined();
    });

    it('should handle whitespace in field names', () => {
      const result = parseFieldSelection(' _id , url , status ', 'screenshot');
      expect(result).toEqual({ _id: 1, url: 1, status: 1 });
    });

    it('should return undefined if all fields are invalid', () => {
      const result = parseFieldSelection('invalid1,invalid2', 'screenshot');
      expect(result).toBeUndefined();
    });
  });

  describe('applyFieldSelection', () => {
    const testData = {
      _id: '123',
      url: 'https://example.com',
      status: 'completed',
      options: { width: 1920 },
      secretField: 'secret',
    };

    it('should return original data if no fields specified', () => {
      const result = applyFieldSelection(testData, undefined, 'screenshot');
      expect(result).toEqual(testData);
    });

    it('should filter to specified fields', () => {
      const result = applyFieldSelection(testData, '_id,url,status', 'screenshot');
      expect(result).toEqual({
        _id: '123',
        url: 'https://example.com',
        status: 'completed',
      });
      expect(result).not.toHaveProperty('options');
      expect(result).not.toHaveProperty('secretField');
    });

    it('should work with arrays', () => {
      const dataArray = [
        { _id: '1', url: 'https://a.com', status: 'completed', extra: 'x' },
        { _id: '2', url: 'https://b.com', status: 'failed', extra: 'y' },
      ];

      const result = applyFieldSelection(dataArray, '_id,url', 'screenshot');
      expect(result).toEqual([
        { _id: '1', url: 'https://a.com' },
        { _id: '2', url: 'https://b.com' },
      ]);
    });

    it('should handle missing fields gracefully', () => {
      const result = applyFieldSelection(testData, '_id,nonexistent', 'screenshot');
      expect(result).toEqual({ _id: '123' });
    });
  });

  // ============================================
  // ALLOWED_FIELDS Tests
  // ============================================

  describe('ALLOWED_FIELDS', () => {
    it('should have screenshot fields', () => {
      expect(ALLOWED_FIELDS.screenshot).toContain('_id');
      expect(ALLOWED_FIELDS.screenshot).toContain('url');
      expect(ALLOWED_FIELDS.screenshot).toContain('status');
      expect(ALLOWED_FIELDS.screenshot).toContain('metadata');
    });

    it('should have user fields', () => {
      expect(ALLOWED_FIELDS.user).toContain('_id');
      expect(ALLOWED_FIELDS.user).toContain('email');
      expect(ALLOWED_FIELDS.user).toContain('name');
      expect(ALLOWED_FIELDS.user).not.toContain('password');
    });

    it('should have apiKey fields', () => {
      expect(ALLOWED_FIELDS.apiKey).toContain('_id');
      expect(ALLOWED_FIELDS.apiKey).toContain('name');
      expect(ALLOWED_FIELDS.apiKey).toContain('permissions');
      expect(ALLOWED_FIELDS.apiKey).not.toContain('keyHash');
    });

    it('should have usage fields', () => {
      expect(ALLOWED_FIELDS.usage).toContain('_id');
      expect(ALLOWED_FIELDS.usage).toContain('date');
      expect(ALLOWED_FIELDS.usage).toContain('screenshots');
    });
  });
});
