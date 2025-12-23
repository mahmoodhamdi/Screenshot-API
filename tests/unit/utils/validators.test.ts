/**
 * Unit Tests for Validation Schemas
 */

import {
  objectIdSchema,
  emailSchema,
  passwordSchema,
  urlSchema,
  paginationSchema,
  registerSchema,
  loginSchema,
  createApiKeySchema,
  createScreenshotSchema,
  createCheckoutSchema,
  validate,
  safeValidate,
  formatZodErrors,
  getFirstZodError,
} from '@utils/validators';
import { z } from 'zod';

describe('Validation Schemas', () => {
  describe('objectIdSchema', () => {
    it('should validate valid ObjectId', () => {
      expect(() => objectIdSchema.parse('507f1f77bcf86cd799439011')).not.toThrow();
    });

    it('should reject invalid ObjectId', () => {
      expect(() => objectIdSchema.parse('invalid')).toThrow();
      expect(() => objectIdSchema.parse('507f1f77bcf86cd79943901')).toThrow(); // 23 chars
      expect(() => objectIdSchema.parse('507f1f77bcf86cd7994390111')).toThrow(); // 25 chars
    });
  });

  describe('emailSchema', () => {
    it('should validate valid email', () => {
      expect(emailSchema.parse('test@example.com')).toBe('test@example.com');
    });

    it('should lowercase email', () => {
      expect(emailSchema.parse('TEST@EXAMPLE.COM')).toBe('test@example.com');
    });

    it('should trim whitespace', () => {
      expect(emailSchema.parse('  test@example.com  ')).toBe('test@example.com');
    });

    it('should reject invalid email', () => {
      expect(() => emailSchema.parse('invalid')).toThrow();
      expect(() => emailSchema.parse('test@')).toThrow();
      expect(() => emailSchema.parse('@example.com')).toThrow();
    });
  });

  describe('passwordSchema', () => {
    it('should validate strong password', () => {
      expect(() => passwordSchema.parse('Password123')).not.toThrow();
    });

    it('should reject short password', () => {
      expect(() => passwordSchema.parse('Pass1')).toThrow();
    });

    it('should reject password without uppercase', () => {
      expect(() => passwordSchema.parse('password123')).toThrow();
    });

    it('should reject password without lowercase', () => {
      expect(() => passwordSchema.parse('PASSWORD123')).toThrow();
    });

    it('should reject password without number', () => {
      expect(() => passwordSchema.parse('PasswordOnly')).toThrow();
    });
  });

  describe('urlSchema', () => {
    it('should validate http URL', () => {
      expect(() => urlSchema.parse('http://example.com')).not.toThrow();
    });

    it('should validate https URL', () => {
      expect(() => urlSchema.parse('https://example.com/path?query=1')).not.toThrow();
    });

    it('should reject ftp URL', () => {
      expect(() => urlSchema.parse('ftp://example.com')).toThrow();
    });

    it('should reject invalid URL', () => {
      expect(() => urlSchema.parse('not-a-url')).toThrow();
    });
  });

  describe('paginationSchema', () => {
    it('should use defaults', () => {
      const result = paginationSchema.parse({});
      expect(result.page).toBe(1);
      expect(result.limit).toBe(20);
      expect(result.order).toBe('desc');
    });

    it('should accept valid values', () => {
      const result = paginationSchema.parse({ page: '5', limit: '50', order: 'asc' });
      expect(result.page).toBe(5);
      expect(result.limit).toBe(50);
      expect(result.order).toBe('asc');
    });

    it('should reject invalid page', () => {
      expect(() => paginationSchema.parse({ page: '-1' })).toThrow();
    });

    it('should reject limit over 100', () => {
      expect(() => paginationSchema.parse({ limit: '150' })).toThrow();
    });
  });

  describe('registerSchema', () => {
    it('should validate valid registration data', () => {
      const data = {
        email: 'test@example.com',
        password: 'Password123',
        name: 'John Doe',
      };
      const result = registerSchema.parse(data);
      expect(result.email).toBe('test@example.com');
      expect(result.name).toBe('John Doe');
    });

    it('should accept optional company', () => {
      const data = {
        email: 'test@example.com',
        password: 'Password123',
        name: 'John Doe',
        company: 'Acme Inc',
      };
      const result = registerSchema.parse(data);
      expect(result.company).toBe('Acme Inc');
    });

    it('should reject missing required fields', () => {
      expect(() => registerSchema.parse({})).toThrow();
      expect(() => registerSchema.parse({ email: 'test@example.com' })).toThrow();
    });

    it('should reject short name', () => {
      expect(() =>
        registerSchema.parse({
          email: 'test@example.com',
          password: 'Password123',
          name: 'A',
        })
      ).toThrow();
    });
  });

  describe('loginSchema', () => {
    it('should validate valid login data', () => {
      const data = {
        email: 'test@example.com',
        password: 'anypassword',
      };
      const result = loginSchema.parse(data);
      expect(result.email).toBe('test@example.com');
    });

    it('should reject missing fields', () => {
      expect(() => loginSchema.parse({ email: 'test@example.com' })).toThrow();
      expect(() => loginSchema.parse({ password: 'password' })).toThrow();
    });
  });

  describe('createApiKeySchema', () => {
    it('should validate valid API key data', () => {
      const data = { name: 'My API Key' };
      const result = createApiKeySchema.parse(data);
      expect(result.name).toBe('My API Key');
      expect(result.permissions).toEqual([]);
      expect(result.ipWhitelist).toEqual([]);
    });

    it('should accept optional fields', () => {
      const data = {
        name: 'My API Key',
        permissions: ['screenshot:create'],
        rateLimit: 50,
        ipWhitelist: ['192.168.1.1'],
        domainWhitelist: ['example.com'],
      };
      const result = createApiKeySchema.parse(data);
      expect(result.permissions).toEqual(['screenshot:create']);
      expect(result.rateLimit).toBe(50);
    });

    it('should reject invalid IP format', () => {
      expect(() =>
        createApiKeySchema.parse({
          name: 'Test',
          ipWhitelist: ['invalid-ip'],
        })
      ).toThrow();
    });

    it('should reject invalid domain format', () => {
      expect(() =>
        createApiKeySchema.parse({
          name: 'Test',
          domainWhitelist: ['not a domain'],
        })
      ).toThrow();
    });

    it('should accept wildcard domains', () => {
      const result = createApiKeySchema.parse({
        name: 'Test',
        domainWhitelist: ['*.example.com'],
      });
      expect(result.domainWhitelist).toEqual(['*.example.com']);
    });
  });

  describe('createScreenshotSchema', () => {
    it('should validate minimal screenshot request', () => {
      const data = { url: 'https://example.com' };
      const result = createScreenshotSchema.parse(data);
      expect(result.url).toBe('https://example.com');
      expect(result.width).toBe(1280);
      expect(result.height).toBe(720);
      expect(result.format).toBe('png');
    });

    it('should accept all options', () => {
      const data = {
        url: 'https://example.com',
        width: 1920,
        height: 1080,
        fullPage: true,
        format: 'jpeg',
        quality: 90,
        delay: 1000,
        selector: '#main',
        darkMode: true,
        blockAds: true,
        waitUntil: 'networkidle0',
        webhook: 'https://webhook.example.com',
      };
      const result = createScreenshotSchema.parse(data);
      expect(result.width).toBe(1920);
      expect(result.fullPage).toBe(true);
      expect(result.format).toBe('jpeg');
      expect(result.darkMode).toBe(true);
    });

    it('should reject invalid dimensions', () => {
      expect(() =>
        createScreenshotSchema.parse({ url: 'https://example.com', width: 50 })
      ).toThrow();
      expect(() =>
        createScreenshotSchema.parse({ url: 'https://example.com', width: 10000 })
      ).toThrow();
    });

    it('should reject invalid format', () => {
      expect(() =>
        createScreenshotSchema.parse({ url: 'https://example.com', format: 'gif' })
      ).toThrow();
    });

    it('should reject invalid quality', () => {
      expect(() =>
        createScreenshotSchema.parse({ url: 'https://example.com', quality: 0 })
      ).toThrow();
      expect(() =>
        createScreenshotSchema.parse({ url: 'https://example.com', quality: 150 })
      ).toThrow();
    });

    it('should validate cookies', () => {
      const data = {
        url: 'https://example.com',
        cookies: [{ name: 'session', value: 'abc123', domain: 'example.com' }],
      };
      const result = createScreenshotSchema.parse(data);
      expect(result.cookies).toHaveLength(1);
      expect(result.cookies![0].name).toBe('session');
    });
  });

  describe('createCheckoutSchema', () => {
    it('should validate valid checkout data', () => {
      const data = {
        plan: 'professional',
        successUrl: 'https://example.com/success',
        cancelUrl: 'https://example.com/cancel',
      };
      const result = createCheckoutSchema.parse(data);
      expect(result.plan).toBe('professional');
    });

    it('should reject free plan', () => {
      expect(() =>
        createCheckoutSchema.parse({
          plan: 'free',
          successUrl: 'https://example.com/success',
          cancelUrl: 'https://example.com/cancel',
        })
      ).toThrow();
    });

    it('should reject invalid URLs', () => {
      expect(() =>
        createCheckoutSchema.parse({
          plan: 'starter',
          successUrl: 'not-a-url',
          cancelUrl: 'https://example.com/cancel',
        })
      ).toThrow();
    });
  });

  describe('validate helper', () => {
    it('should return parsed data on success', () => {
      const schema = z.object({ name: z.string() });
      const result = validate(schema, { name: 'test' });
      expect(result.name).toBe('test');
    });

    it('should throw on invalid data', () => {
      const schema = z.object({ name: z.string() });
      expect(() => validate(schema, { name: 123 })).toThrow();
    });
  });

  describe('safeValidate helper', () => {
    it('should return success with data', () => {
      const schema = z.object({ name: z.string() });
      const result = safeValidate(schema, { name: 'test' });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.name).toBe('test');
      }
    });

    it('should return errors on failure', () => {
      const schema = z.object({ name: z.string() });
      const result = safeValidate(schema, { name: 123 });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.errors).toBeDefined();
      }
    });
  });

  describe('formatZodErrors', () => {
    it('should format errors by path', () => {
      const schema = z.object({
        name: z.string().min(2),
        email: z.string().email(),
      });
      const result = schema.safeParse({ name: 'a', email: 'invalid' });
      if (!result.success) {
        const formatted = formatZodErrors(result.error);
        expect(formatted).toHaveProperty('name');
        expect(formatted).toHaveProperty('email');
      }
    });
  });

  describe('getFirstZodError', () => {
    it('should return first error message', () => {
      const schema = z.object({
        name: z.string().min(2),
      });
      const result = schema.safeParse({ name: 'a' });
      if (!result.success) {
        const message = getFirstZodError(result.error);
        expect(message).toContain('name');
      }
    });

    it('should return default message for empty errors', () => {
      const error = new z.ZodError([]);
      const message = getFirstZodError(error);
      expect(message).toBe('Validation failed');
    });
  });
});
