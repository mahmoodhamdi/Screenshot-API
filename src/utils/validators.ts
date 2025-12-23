/**
 * Zod Validation Schemas
 * Request validation schemas for all API endpoints
 */

import { z } from 'zod';

// ============================================
// Common Schemas
// ============================================

/**
 * MongoDB ObjectId validation
 */
export const objectIdSchema = z.string().regex(/^[a-fA-F0-9]{24}$/, 'Invalid ObjectId format');

/**
 * Email validation
 */
export const emailSchema = z.string().trim().email('Invalid email format').toLowerCase();

/**
 * Password validation (min 8 chars, 1 uppercase, 1 lowercase, 1 number)
 */
export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(128, 'Password must be at most 128 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number');

/**
 * URL validation
 */
export const urlSchema = z
  .string()
  .url('Invalid URL format')
  .refine((url) => {
    try {
      const parsed = new URL(url);
      return ['http:', 'https:'].includes(parsed.protocol);
    } catch {
      return false;
    }
  }, 'URL must use http or https protocol');

/**
 * Pagination query parameters
 */
export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  sort: z.string().optional(),
  order: z.enum(['asc', 'desc']).default('desc'),
});

// ============================================
// Auth Schemas
// ============================================

/**
 * User registration schema
 */
export const registerSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  name: z.string().min(2, 'Name must be at least 2 characters').max(100).trim(),
  company: z.string().max(200).trim().optional(),
});

/**
 * User login schema
 */
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
});

/**
 * Token refresh schema
 */
export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required'),
});

/**
 * Create API key schema
 */
export const createApiKeySchema = z.object({
  name: z.string().min(1, 'Name is required').max(100).trim(),
  permissions: z.array(z.string()).optional().default([]),
  expiresAt: z.coerce.date().optional(),
  ipWhitelist: z
    .array(
      z.string().refine((ip) => {
        // Basic IP validation (IPv4 or CIDR)
        const ipv4Regex = /^(\d{1,3}\.){3}\d{1,3}(\/\d{1,2})?$/;
        return ipv4Regex.test(ip);
      }, 'Invalid IP address format')
    )
    .optional()
    .default([]),
  domainWhitelist: z
    .array(
      z.string().refine((domain) => {
        // Basic domain validation
        const domainRegex = /^(\*\.)?[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z]{2,})+$/;
        return domainRegex.test(domain);
      }, 'Invalid domain format')
    )
    .optional()
    .default([]),
  rateLimit: z.number().int().positive().max(1000).optional(),
});

// ============================================
// Screenshot Schemas
// ============================================

/**
 * Cookie schema for screenshot requests
 */
export const cookieSchema = z.object({
  name: z.string().min(1),
  value: z.string(),
  domain: z.string().optional(),
  path: z.string().default('/'),
  expires: z.number().optional(),
  httpOnly: z.boolean().optional(),
  secure: z.boolean().optional(),
  sameSite: z.enum(['Strict', 'Lax', 'None']).optional(),
});

/**
 * Clip rect schema for screenshot cropping
 */
export const clipRectSchema = z.object({
  x: z.number().int().min(0),
  y: z.number().int().min(0),
  width: z.number().int().positive(),
  height: z.number().int().positive(),
});

/**
 * Create screenshot schema
 */
export const createScreenshotSchema = z.object({
  url: urlSchema,
  width: z.number().int().min(100).max(7680).default(1280),
  height: z.number().int().min(100).max(4320).default(720),
  fullPage: z.boolean().default(false),
  format: z.enum(['png', 'jpeg', 'webp', 'pdf']).default('png'),
  quality: z.number().int().min(1).max(100).default(80),
  delay: z.number().int().min(0).max(30000).default(0),
  selector: z.string().max(500).optional(),
  clipRect: clipRectSchema.optional(),
  headers: z.record(z.string()).optional(),
  cookies: z.array(cookieSchema).max(50).optional(),
  userAgent: z.string().max(500).optional(),
  darkMode: z.boolean().default(false),
  blockAds: z.boolean().default(false),
  blockTrackers: z.boolean().default(false),
  waitUntil: z.enum(['load', 'domcontentloaded', 'networkidle0', 'networkidle2']).default('networkidle2'),
  webhook: urlSchema.optional(),
});

/**
 * Screenshot query parameters (for listing)
 */
export const screenshotQuerySchema = paginationSchema.extend({
  status: z.enum(['pending', 'processing', 'completed', 'failed']).optional(),
  format: z.enum(['png', 'jpeg', 'webp', 'pdf']).optional(),
  fromDate: z.coerce.date().optional(),
  toDate: z.coerce.date().optional(),
});

// ============================================
// Subscription Schemas
// ============================================

/**
 * Create checkout session schema
 */
export const createCheckoutSchema = z.object({
  plan: z.enum(['starter', 'professional', 'enterprise']),
  successUrl: urlSchema,
  cancelUrl: urlSchema,
});

/**
 * Stripe webhook event schema (basic validation)
 */
export const stripeWebhookSchema = z.object({
  id: z.string(),
  type: z.string(),
  data: z.object({
    object: z.record(z.unknown()),
  }),
});

// ============================================
// Analytics Schemas
// ============================================

/**
 * Analytics query parameters
 */
export const analyticsQuerySchema = z.object({
  fromDate: z.coerce.date().optional(),
  toDate: z.coerce.date().optional(),
  groupBy: z.enum(['hour', 'day', 'week', 'month']).default('day'),
  apiKeyId: objectIdSchema.optional(),
});

/**
 * Date range schema
 */
export const dateRangeSchema = z.object({
  fromDate: z.coerce.date(),
  toDate: z.coerce.date(),
}).refine((data) => data.fromDate <= data.toDate, {
  message: 'fromDate must be before or equal to toDate',
});

// ============================================
// User Schemas
// ============================================

/**
 * Update user profile schema
 */
export const updateProfileSchema = z.object({
  name: z.string().min(2).max(100).trim().optional(),
  company: z.string().max(200).trim().optional(),
});

/**
 * Change password schema
 */
export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: passwordSchema,
});

// ============================================
// Validation Helper Functions
// ============================================

/**
 * Validate data against a schema
 * @param schema - Zod schema
 * @param data - Data to validate
 * @returns Validated data or throws ZodError
 */
export const validate = <T>(schema: z.ZodSchema<T>, data: unknown): T => {
  return schema.parse(data);
};

/**
 * Safely validate data against a schema
 * @param schema - Zod schema
 * @param data - Data to validate
 * @returns Validation result
 */
export const safeValidate = <T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; errors: z.ZodError } => {
  const result = schema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }
  return { success: false, errors: result.error };
};

/**
 * Format Zod errors for API response
 * @param error - Zod error
 * @returns Formatted error messages
 */
export const formatZodErrors = (error: z.ZodError): Record<string, string[]> => {
  const errors: Record<string, string[]> = {};

  error.errors.forEach((err) => {
    const path = err.path.join('.');
    if (!errors[path]) {
      errors[path] = [];
    }
    errors[path].push(err.message);
  });

  return errors;
};

/**
 * Get first error message from Zod error
 * @param error - Zod error
 * @returns First error message
 */
export const getFirstZodError = (error: z.ZodError): string => {
  const firstError = error.errors[0];
  if (!firstError) return 'Validation failed';

  const path = firstError.path.join('.');
  return path ? `${path}: ${firstError.message}` : firstError.message;
};

export default {
  objectIdSchema,
  emailSchema,
  passwordSchema,
  urlSchema,
  paginationSchema,
  registerSchema,
  loginSchema,
  refreshTokenSchema,
  createApiKeySchema,
  cookieSchema,
  clipRectSchema,
  createScreenshotSchema,
  screenshotQuerySchema,
  createCheckoutSchema,
  stripeWebhookSchema,
  analyticsQuerySchema,
  dateRangeSchema,
  updateProfileSchema,
  changePasswordSchema,
  validate,
  safeValidate,
  formatZodErrors,
  getFirstZodError,
};
