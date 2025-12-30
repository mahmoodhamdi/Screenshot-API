/**
 * Audit Logging Utility Unit Tests
 */

import {
  auditLog,
  auditSuccess,
  auditFailure,
  auditAuth,
  auditApiKey,
  auditScreenshot,
  auditSubscription,
} from '@utils/audit';
import logger from '@utils/logger';

// Mock logger
jest.mock('@utils/logger', () => ({
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  debug: jest.fn(),
}));

describe('Audit Logging Utility', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ============================================
  // auditLog Tests
  // ============================================

  describe('auditLog', () => {
    it('should log audit event with correct structure', () => {
      auditLog({
        action: 'auth.login',
        userId: 'user123',
        resourceType: 'user',
        resourceId: 'user123',
        ip: '127.0.0.1',
      });

      expect(logger.info).toHaveBeenCalledWith(
        'Audit event',
        expect.objectContaining({
          type: 'audit',
          category: 'auth',
          action: 'auth.login',
          userId: 'user123',
          resourceType: 'user',
          resourceId: 'user123',
          ip: '127.0.0.1',
          timestamp: expect.any(String),
        })
      );
    });

    it('should use warn level for failure events', () => {
      auditLog({
        action: 'auth.login_failed',
        userId: 'user123',
        resourceType: 'user',
        result: 'failure',
        errorMessage: 'Invalid password',
      });

      expect(logger.warn).toHaveBeenCalledWith(
        'Audit event',
        expect.objectContaining({
          action: 'auth.login_failed',
          result: 'failure',
          errorMessage: 'Invalid password',
        })
      );
    });

    it('should extract correct category from action', () => {
      auditLog({
        action: 'api_key.create',
        userId: 'user123',
        resourceType: 'apiKey',
      });

      expect(logger.info).toHaveBeenCalledWith(
        'Audit event',
        expect.objectContaining({
          category: 'api_key',
        })
      );
    });

    it('should default to system category for unknown actions', () => {
      auditLog({
        action: 'custom.action',
        userId: 'user123',
        resourceType: 'system',
      });

      expect(logger.info).toHaveBeenCalledWith(
        'Audit event',
        expect.objectContaining({
          category: 'system',
        })
      );
    });

    it('should include additional details', () => {
      auditLog({
        action: 'screenshot.create',
        userId: 'user123',
        resourceType: 'screenshot',
        resourceId: 'ss123',
        details: { url: 'https://example.com', format: 'png' },
        requestId: 'req-123',
      });

      expect(logger.info).toHaveBeenCalledWith(
        'Audit event',
        expect.objectContaining({
          details: { url: 'https://example.com', format: 'png' },
          requestId: 'req-123',
        })
      );
    });
  });

  // ============================================
  // auditSuccess / auditFailure Tests
  // ============================================

  describe('auditSuccess', () => {
    it('should log success event', () => {
      auditSuccess('api_key.create', 'user123', 'apiKey', {
        resourceId: 'key123',
        details: { name: 'My API Key' },
      });

      expect(logger.info).toHaveBeenCalledWith(
        'Audit event',
        expect.objectContaining({
          action: 'api_key.create',
          userId: 'user123',
          resourceType: 'apiKey',
          resourceId: 'key123',
          result: 'success',
          details: { name: 'My API Key' },
        })
      );
    });
  });

  describe('auditFailure', () => {
    it('should log failure event with error message', () => {
      auditFailure('auth.login', 'user123', 'user', 'Invalid credentials', {
        ip: '10.0.0.1',
      });

      expect(logger.warn).toHaveBeenCalledWith(
        'Audit event',
        expect.objectContaining({
          action: 'auth.login',
          userId: 'user123',
          resourceType: 'user',
          result: 'failure',
          errorMessage: 'Invalid credentials',
          ip: '10.0.0.1',
        })
      );
    });
  });

  // ============================================
  // Convenience Function Tests
  // ============================================

  describe('auditAuth', () => {
    it('should log login event', () => {
      auditAuth('login', 'user123', { ip: '192.168.1.1' });

      expect(logger.info).toHaveBeenCalledWith(
        'Audit event',
        expect.objectContaining({
          action: 'auth.login',
          userId: 'user123',
          resourceType: 'user',
          resourceId: 'user123',
          ip: '192.168.1.1',
        })
      );
    });

    it('should log login failure', () => {
      auditAuth('login_failed', 'unknown', {
        result: 'failure',
        errorMessage: 'User not found',
      });

      expect(logger.warn).toHaveBeenCalledWith(
        'Audit event',
        expect.objectContaining({
          action: 'auth.login_failed',
          result: 'failure',
          errorMessage: 'User not found',
        })
      );
    });

    it('should log password change', () => {
      auditAuth('password_change', 'user123');

      expect(logger.info).toHaveBeenCalledWith(
        'Audit event',
        expect.objectContaining({
          action: 'auth.password_change',
        })
      );
    });
  });

  describe('auditApiKey', () => {
    it('should log API key creation', () => {
      auditApiKey('create', 'user123', 'key456', {
        details: { name: 'Production Key' },
      });

      expect(logger.info).toHaveBeenCalledWith(
        'Audit event',
        expect.objectContaining({
          action: 'api_key.create',
          userId: 'user123',
          resourceType: 'apiKey',
          resourceId: 'key456',
        })
      );
    });

    it('should log API key deletion', () => {
      auditApiKey('delete', 'user123', 'key456');

      expect(logger.info).toHaveBeenCalledWith(
        'Audit event',
        expect.objectContaining({
          action: 'api_key.delete',
        })
      );
    });
  });

  describe('auditScreenshot', () => {
    it('should log screenshot creation', () => {
      auditScreenshot('create', 'user123', 'ss789', {
        details: { url: 'https://example.com' },
      });

      expect(logger.info).toHaveBeenCalledWith(
        'Audit event',
        expect.objectContaining({
          action: 'screenshot.create',
          resourceType: 'screenshot',
          resourceId: 'ss789',
        })
      );
    });

    it('should log screenshot failure', () => {
      auditScreenshot('create', 'user123', 'ss789', {
        result: 'failure',
        errorMessage: 'Navigation timeout',
      });

      expect(logger.warn).toHaveBeenCalledWith(
        'Audit event',
        expect.objectContaining({
          action: 'screenshot.create',
          result: 'failure',
          errorMessage: 'Navigation timeout',
        })
      );
    });
  });

  describe('auditSubscription', () => {
    it('should log subscription creation', () => {
      auditSubscription('create', 'user123', 'sub_abc');

      expect(logger.info).toHaveBeenCalledWith(
        'Audit event',
        expect.objectContaining({
          action: 'subscription.create',
          resourceType: 'subscription',
          resourceId: 'sub_abc',
        })
      );
    });

    it('should log payment failure with failure result', () => {
      auditSubscription('payment_failed', 'user123', 'sub_abc');

      expect(logger.warn).toHaveBeenCalledWith(
        'Audit event',
        expect.objectContaining({
          action: 'subscription.payment_failed',
          result: 'failure',
        })
      );
    });
  });
});
