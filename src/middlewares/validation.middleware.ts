/**
 * Validation Middleware
 * Provides Zod-based request validation
 */

import { Request, Response, NextFunction } from 'express';
import { z, ZodError, ZodSchema } from 'zod';
import { ERROR_CODES } from '@utils/constants';

// ============================================
// Types
// ============================================

type ValidationTarget = 'body' | 'query' | 'params';

interface ValidationOptions {
  stripUnknown?: boolean;
}

// ============================================
// Validation Schemas
// ============================================

/**
 * Screenshot creation schema
 */
export const createScreenshotSchema = z.object({
  url: z
    .string()
    .url('Invalid URL format')
    .refine(
      (url) => {
        try {
          const parsed = new URL(url);
          return ['http:', 'https:'].includes(parsed.protocol);
        } catch {
          return false;
        }
      },
      { message: 'URL must use HTTP or HTTPS protocol' }
    ),
  width: z.number().int().min(320).max(7680).optional(),
  height: z.number().int().min(240).max(4320).optional(),
  fullPage: z.boolean().optional(),
  format: z.enum(['png', 'jpeg', 'webp', 'pdf']).optional(),
  quality: z.number().int().min(1).max(100).optional(),
  delay: z.number().int().min(0).max(30000).optional(),
  selector: z.string().max(500).optional(),
  clipRect: z
    .object({
      x: z.number().int().min(0),
      y: z.number().int().min(0),
      width: z.number().int().min(1),
      height: z.number().int().min(1),
    })
    .optional(),
  headers: z.record(z.string()).optional(),
  cookies: z
    .array(
      z.object({
        name: z.string().min(1).max(256),
        value: z.string().max(4096),
        domain: z.string().optional(),
        path: z.string().optional(),
        expires: z.number().optional(),
        httpOnly: z.boolean().optional(),
        secure: z.boolean().optional(),
        sameSite: z.enum(['Strict', 'Lax', 'None']).optional(),
      })
    )
    .max(50)
    .optional(),
  userAgent: z.string().max(500).optional(),
  darkMode: z.boolean().optional(),
  blockAds: z.boolean().optional(),
  blockTrackers: z.boolean().optional(),
  waitUntil: z.enum(['load', 'domcontentloaded', 'networkidle0', 'networkidle2']).optional(),
  webhook: z.string().url('Invalid webhook URL').optional(),
});

/**
 * Screenshot list query schema
 */
export const listScreenshotsSchema = z.object({
  page: z.string().regex(/^\d+$/).transform(Number).default('1'),
  limit: z.string().regex(/^\d+$/).transform(Number).pipe(z.number().min(1).max(100)).default('20'),
  sort: z.enum(['createdAt', 'url', 'status']).optional().default('createdAt'),
  order: z.enum(['asc', 'desc']).optional().default('desc'),
  status: z.enum(['pending', 'processing', 'completed', 'failed']).optional(),
  format: z.enum(['png', 'jpeg', 'webp', 'pdf']).optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
});

/**
 * ID parameter schema
 */
export const idParamSchema = z.object({
  id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid ID format'),
});

/**
 * User registration schema
 */
export const registerSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(100)
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Password must contain at least one uppercase letter, one lowercase letter, and one number'
    ),
  name: z.string().min(2).max(100),
  company: z.string().max(200).optional(),
});

/**
 * User login schema
 */
export const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required'),
});

/**
 * Token refresh schema
 */
export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required'),
});

/**
 * Change password schema
 */
export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(100)
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Password must contain at least one uppercase letter, one lowercase letter, and one number'
    ),
});

/**
 * API key creation schema
 */
export const createApiKeySchema = z.object({
  name: z.string().min(1).max(100),
  permissions: z.array(z.string()).optional(),
  expiresAt: z.string().datetime().optional(),
  ipWhitelist: z.array(z.string().ip()).max(20).optional(),
  domainWhitelist: z.array(z.string().max(256)).max(20).optional(),
  rateLimit: z.number().int().min(1).max(10000).optional(),
});

/**
 * Checkout session schema
 */
export const createCheckoutSchema = z.object({
  plan: z.enum(['starter', 'professional', 'enterprise']),
  successUrl: z.string().url(),
  cancelUrl: z.string().url(),
});

/**
 * Date range query schema
 */
export const dateRangeSchema = z.object({
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  period: z.enum(['day', 'week', 'month', 'year']).optional(),
});

/**
 * Pagination query schema
 */
export const paginationSchema = z.object({
  page: z.string().regex(/^\d+$/).transform(Number).default('1'),
  limit: z.string().regex(/^\d+$/).transform(Number).pipe(z.number().min(1).max(100)).default('20'),
  sort: z.string().optional(),
  order: z.enum(['asc', 'desc']).optional().default('desc'),
});

// ============================================
// Validation Middleware Factory
// ============================================

/**
 * Create validation middleware for a specific target and schema
 */
export function validate<T extends ZodSchema>(
  schema: T,
  target: ValidationTarget = 'body',
  options: ValidationOptions = {}
) {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      const dataToValidate = req[target];

      // Parse and validate
      const result = schema.parse(dataToValidate);

      // Strip unknown fields if requested
      if (options.stripUnknown) {
        req[target] = result;
      } else {
        // Merge validated data back
        Object.assign(req[target], result);
      }

      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errors = formatZodErrors(error);

        res.status(400).json({
          success: false,
          error: {
            code: ERROR_CODES.VALIDATION_ERROR,
            message: 'Validation failed',
            details: errors,
          },
        });
        return;
      }

      // Unknown error
      res.status(500).json({
        success: false,
        error: {
          code: ERROR_CODES.INTERNAL_ERROR,
          message: 'Validation error',
        },
      });
    }
  };
}

/**
 * Validate request body
 */
export function validateBody<T extends ZodSchema>(
  schema: T,
  options?: ValidationOptions
): (req: Request, res: Response, next: NextFunction) => void {
  return validate(schema, 'body', options);
}

/**
 * Validate query parameters
 */
export function validateQuery<T extends ZodSchema>(
  schema: T,
  options?: ValidationOptions
): (req: Request, res: Response, next: NextFunction) => void {
  return validate(schema, 'query', options);
}

/**
 * Validate URL parameters
 */
export function validateParams<T extends ZodSchema>(
  schema: T,
  options?: ValidationOptions
): (req: Request, res: Response, next: NextFunction) => void {
  return validate(schema, 'params', options);
}

// ============================================
// Helper Functions
// ============================================

/**
 * Format Zod errors for API response
 */
function formatZodErrors(error: ZodError): Record<string, string> {
  const errors: Record<string, string> = {};

  for (const issue of error.issues) {
    const path = issue.path.join('.');
    errors[path || 'root'] = issue.message;
  }

  return errors;
}

/**
 * Sanitize string input (basic XSS prevention)
 */
export function sanitizeString(input: string): string {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

/**
 * Check if string is a valid MongoDB ObjectId
 */
export function isValidObjectId(id: string): boolean {
  return /^[0-9a-fA-F]{24}$/.test(id);
}

/**
 * Check if URL is safe (not internal/localhost)
 */
export function isSafeUrl(url: string): boolean {
  try {
    const parsed = new URL(url);

    // Block internal addresses
    const hostname = parsed.hostname.toLowerCase();
    const blockedHosts = ['localhost', '127.0.0.1', '0.0.0.0', '::1', '[::1]', 'internal', 'local'];

    if (blockedHosts.includes(hostname)) {
      return false;
    }

    // Block private IP ranges
    const ipv4Regex = /^(\d{1,3}\.){3}\d{1,3}$/;
    if (ipv4Regex.test(hostname)) {
      const parts = hostname.split('.').map(Number);
      // 10.x.x.x
      if (parts[0] === 10) return false;
      // 172.16.x.x - 172.31.x.x
      if (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) return false;
      // 192.168.x.x
      if (parts[0] === 192 && parts[1] === 168) return false;
      // 169.254.x.x (link-local)
      if (parts[0] === 169 && parts[1] === 254) return false;
    }

    // Block file protocol
    if (parsed.protocol === 'file:') return false;

    return true;
  } catch {
    return false;
  }
}

// ============================================
// Pre-built Validators
// ============================================

export const validators = {
  // Screenshot validators
  createScreenshot: validateBody(createScreenshotSchema),
  listScreenshots: validateQuery(listScreenshotsSchema),
  screenshotId: validateParams(idParamSchema),

  // Auth validators
  register: validateBody(registerSchema),
  login: validateBody(loginSchema),
  refreshToken: validateBody(refreshTokenSchema),
  changePassword: validateBody(changePasswordSchema),

  // API key validators
  createApiKey: validateBody(createApiKeySchema),
  apiKeyId: validateParams(idParamSchema),

  // Subscription validators
  createCheckout: validateBody(createCheckoutSchema),

  // Common validators
  dateRange: validateQuery(dateRangeSchema),
  pagination: validateQuery(paginationSchema),
  id: validateParams(idParamSchema),
};

// ============================================
// Export
// ============================================

export default {
  validate,
  validateBody,
  validateQuery,
  validateParams,
  validators,
  sanitizeString,
  isValidObjectId,
  isSafeUrl,
  // Schemas
  createScreenshotSchema,
  listScreenshotsSchema,
  idParamSchema,
  registerSchema,
  loginSchema,
  refreshTokenSchema,
  changePasswordSchema,
  createApiKeySchema,
  createCheckoutSchema,
  dateRangeSchema,
  paginationSchema,
};
