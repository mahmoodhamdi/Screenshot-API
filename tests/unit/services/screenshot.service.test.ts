/**
 * Screenshot Service Tests
 */

// Set environment variables before any imports
process.env.JWT_SECRET = 'test-jwt-secret-key-minimum-32-characters-long';
process.env.JWT_REFRESH_SECRET = 'test-jwt-refresh-secret-key-minimum-32-chars';
process.env.NODE_ENV = 'test';
process.env.STORAGE_TYPE = 'local';
process.env.LOCAL_STORAGE_PATH = './test-uploads';

import { Types } from 'mongoose';
import {
  validateOptionsAgainstPlan,
  checkUsageQuota,
} from '@services/screenshot.service';
import {
  generateStorageKey,
  getContentType,
  getFileExtension,
} from '@services/storage.service';
import { IUser, PlanLimits, ScreenshotFormat } from '@/types';
import { AppError } from '@middlewares/error.middleware';

// ============================================
// Mock User Factory
// ============================================

const createMockUser = (overrides: Partial<{
  planLimits: Partial<PlanLimits>;
  usage: { screenshotsThisMonth: number };
}> = {}): IUser => {
  const defaultLimits: PlanLimits = {
    screenshotsPerMonth: 100,
    maxWidth: 1920,
    maxHeight: 1080,
    formats: ['png', 'jpeg', 'webp'],
    rateLimit: 10,
    fullPage: true,
    customHeaders: true,
    webhooks: true,
    priority: false,
  };

  const planLimits = { ...defaultLimits, ...overrides.planLimits };

  return {
    _id: new Types.ObjectId(),
    email: 'test@example.com',
    password: 'hashed',
    name: 'Test User',
    isVerified: true,
    isActive: true,
    role: 'user',
    subscription: {
      plan: 'starter',
      status: 'active',
    },
    usage: {
      screenshotsThisMonth: overrides.usage?.screenshotsThisMonth ?? 0,
      lastResetDate: new Date(),
    },
    refreshTokens: [],
    createdAt: new Date(),
    updatedAt: new Date(),
    comparePassword: jest.fn(),
    incrementUsage: jest.fn(),
    resetMonthlyUsage: jest.fn(),
    getPlanLimits: jest.fn().mockReturnValue(planLimits),
  } as unknown as IUser;
};

describe('Screenshot Service', () => {
  // ============================================
  // Storage Helper Tests
  // ============================================

  describe('Storage Helpers', () => {
    describe('generateStorageKey', () => {
      it('should generate a valid storage key', () => {
        const userId = new Types.ObjectId().toString();
        const format: ScreenshotFormat = 'png';

        const key = generateStorageKey(userId, format);

        expect(key).toContain('screenshots/');
        expect(key).toContain(userId);
        expect(key.endsWith('.png')).toBe(true);
      });

      it('should include screenshot ID when provided', () => {
        const userId = new Types.ObjectId().toString();
        const screenshotId = 'custom-screenshot-id';
        const format: ScreenshotFormat = 'jpeg';

        const key = generateStorageKey(userId, format, screenshotId);

        expect(key).toContain(screenshotId);
        expect(key.endsWith('.jpg')).toBe(true);
      });

      it('should generate unique keys for same user and format', () => {
        const userId = new Types.ObjectId().toString();
        const format: ScreenshotFormat = 'png';

        const key1 = generateStorageKey(userId, format);
        const key2 = generateStorageKey(userId, format);

        expect(key1).not.toBe(key2);
      });
    });

    describe('getContentType', () => {
      it('should return correct content type for png', () => {
        expect(getContentType('png')).toBe('image/png');
      });

      it('should return correct content type for jpeg', () => {
        expect(getContentType('jpeg')).toBe('image/jpeg');
      });

      it('should return correct content type for webp', () => {
        expect(getContentType('webp')).toBe('image/webp');
      });

      it('should return correct content type for pdf', () => {
        expect(getContentType('pdf')).toBe('application/pdf');
      });
    });

    describe('getFileExtension', () => {
      it('should return correct extension for png', () => {
        expect(getFileExtension('png')).toBe('png');
      });

      it('should return jpg for jpeg format', () => {
        expect(getFileExtension('jpeg')).toBe('jpg');
      });

      it('should return correct extension for webp', () => {
        expect(getFileExtension('webp')).toBe('webp');
      });

      it('should return correct extension for pdf', () => {
        expect(getFileExtension('pdf')).toBe('pdf');
      });
    });
  });

  // ============================================
  // Plan Validation Tests
  // ============================================

  describe('validateOptionsAgainstPlan', () => {
    it('should pass validation for valid options', () => {
      const user = createMockUser();
      const options = {
        width: 1280,
        height: 720,
        format: 'png' as ScreenshotFormat,
        fullPage: false,
      };

      expect(() => validateOptionsAgainstPlan(options, user)).not.toThrow();
    });

    it('should throw error when width exceeds plan limit', () => {
      const user = createMockUser({ planLimits: { maxWidth: 1280 } });
      const options = { width: 1920 };

      expect(() => validateOptionsAgainstPlan(options, user)).toThrow(AppError);
      expect(() => validateOptionsAgainstPlan(options, user)).toThrow('Maximum width');
    });

    it('should throw error when height exceeds plan limit', () => {
      const user = createMockUser({ planLimits: { maxHeight: 720 } });
      const options = { height: 1080 };

      expect(() => validateOptionsAgainstPlan(options, user)).toThrow(AppError);
      expect(() => validateOptionsAgainstPlan(options, user)).toThrow('Maximum height');
    });

    it('should throw error when format is not available', () => {
      const user = createMockUser({ planLimits: { formats: ['png', 'jpeg'] } });
      const options = { format: 'webp' as ScreenshotFormat };

      expect(() => validateOptionsAgainstPlan(options, user)).toThrow(AppError);
      expect(() => validateOptionsAgainstPlan(options, user)).toThrow("Format 'webp'");
    });

    it('should throw error when fullPage is not available', () => {
      const user = createMockUser({ planLimits: { fullPage: false } });
      const options = { fullPage: true };

      expect(() => validateOptionsAgainstPlan(options, user)).toThrow(AppError);
      expect(() => validateOptionsAgainstPlan(options, user)).toThrow('Full page');
    });

    it('should throw error when custom headers are not available', () => {
      const user = createMockUser({ planLimits: { customHeaders: false } });
      const options = { headers: { 'X-Custom': 'value' } };

      expect(() => validateOptionsAgainstPlan(options, user)).toThrow(AppError);
      expect(() => validateOptionsAgainstPlan(options, user)).toThrow('Custom headers');
    });

    it('should allow empty headers object', () => {
      const user = createMockUser({ planLimits: { customHeaders: false } });
      const options = { headers: {} };

      expect(() => validateOptionsAgainstPlan(options, user)).not.toThrow();
    });
  });

  // ============================================
  // Usage Quota Tests
  // ============================================

  describe('checkUsageQuota', () => {
    it('should pass when usage is under limit', async () => {
      const user = createMockUser({
        planLimits: { screenshotsPerMonth: 100 },
        usage: { screenshotsThisMonth: 50 },
      });

      await expect(checkUsageQuota(user)).resolves.toBeUndefined();
    });

    it('should throw error when usage equals limit', async () => {
      const user = createMockUser({
        planLimits: { screenshotsPerMonth: 100 },
        usage: { screenshotsThisMonth: 100 },
      });

      await expect(checkUsageQuota(user)).rejects.toThrow(AppError);
      await expect(checkUsageQuota(user)).rejects.toThrow('Monthly screenshot limit');
    });

    it('should throw error when usage exceeds limit', async () => {
      const user = createMockUser({
        planLimits: { screenshotsPerMonth: 100 },
        usage: { screenshotsThisMonth: 150 },
      });

      await expect(checkUsageQuota(user)).rejects.toThrow(AppError);
    });

    it('should pass when usage is at zero', async () => {
      const user = createMockUser({
        planLimits: { screenshotsPerMonth: 100 },
        usage: { screenshotsThisMonth: 0 },
      });

      await expect(checkUsageQuota(user)).resolves.toBeUndefined();
    });
  });
});
