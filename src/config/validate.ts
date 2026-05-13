/**
 * Production Environment Validation
 * Stricter validation for production deployments
 */

import { z } from 'zod';
import logger from '@utils/logger';

/**
 * Production-required environment schema
 * These variables MUST be set in production
 */
const productionEnvSchema = z.object({
  NODE_ENV: z.literal('production'),

  // Server
  PORT: z.string().transform(Number),

  // Database - Required in production
  MONGODB_URI: z
    .string()
    .url()
    .refine((uri) => !uri.includes('localhost'), {
      message: 'Production MONGODB_URI should not point to localhost',
    }),

  // Redis - Required in production
  REDIS_HOST: z.string().min(1),
  REDIS_PORT: z.string().transform(Number),

  // JWT - Required with minimum length
  JWT_SECRET: z
    .string()
    .min(32)
    .refine((secret) => !/^(secret|password|test)/i.test(secret), {
      message: 'JWT_SECRET appears to be a default/weak value',
    }),
  JWT_REFRESH_SECRET: z
    .string()
    .min(32)
    .refine((secret) => !/^(secret|password|test)/i.test(secret), {
      message: 'JWT_REFRESH_SECRET appears to be a default/weak value',
    }),

  // Stripe - Required for payments
  STRIPE_SECRET_KEY: z
    .string()
    .startsWith('sk_live_')
    .optional()
    .or(z.string().startsWith('sk_test_')),
  STRIPE_WEBHOOK_SECRET: z.string().startsWith('whsec_').optional(),

  // Email - Required for user communication
  SMTP_HOST: z.string().min(1),
  SMTP_PORT: z.string().transform(Number),
  SMTP_USER: z.string().min(1),
  SMTP_PASS: z.string().min(1),
  EMAIL_FROM: z.string().email(),

  // Storage
  STORAGE_TYPE: z.enum(['local', 's3']),
  AWS_ACCESS_KEY_ID: z.string().optional(),
  AWS_SECRET_ACCESS_KEY: z.string().optional(),
  AWS_S3_BUCKET: z.string().optional(),
});

/**
 * Development environment schema (more permissive)
 */
const developmentEnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'test']),
  JWT_SECRET: z.string().min(32),
  JWT_REFRESH_SECRET: z.string().min(32),
});

/**
 * Security checks for common misconfigurations
 */
interface SecurityCheck {
  name: string;
  check: () => boolean;
  severity: 'error' | 'warning';
  message: string;
}

const securityChecks: SecurityCheck[] = [
  {
    name: 'jwt_secret_length',
    check: () => (process.env.JWT_SECRET?.length || 0) >= 64,
    severity: 'warning',
    message: 'JWT_SECRET should be at least 64 characters for optimal security',
  },
  {
    name: 'https_api_url',
    check: () => {
      const apiUrl = process.env.API_URL || '';
      return process.env.NODE_ENV !== 'production' || apiUrl.startsWith('https://');
    },
    severity: 'warning',
    message: 'API_URL should use HTTPS in production',
  },
  {
    name: 'cors_origin',
    check: () => {
      const corsOrigin = process.env.CORS_ORIGIN || '*';
      return process.env.NODE_ENV !== 'production' || corsOrigin !== '*';
    },
    severity: 'warning',
    message: 'CORS_ORIGIN should not be "*" in production',
  },
  {
    name: 's3_config',
    check: () => {
      if (process.env.STORAGE_TYPE !== 's3') return true;
      return !!(
        process.env.AWS_ACCESS_KEY_ID &&
        process.env.AWS_SECRET_ACCESS_KEY &&
        process.env.AWS_S3_BUCKET
      );
    },
    severity: 'error',
    message: 'S3 storage requires AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, and AWS_S3_BUCKET',
  },
  {
    name: 'stripe_live_keys',
    check: () => {
      if (process.env.NODE_ENV !== 'production') return true;
      const stripeKey = process.env.STRIPE_SECRET_KEY || '';
      // In production, Stripe key should be live (not test) - but allow it to be unset
      return !stripeKey || stripeKey.startsWith('sk_live_');
    },
    severity: 'warning',
    message: 'Using Stripe test keys in production',
  },
];

/**
 * Validate environment variables
 * @param exitOnError - Whether to exit the process on validation failure
 * @returns Validation result with any warnings
 */
export function validateEnvironment(exitOnError = true): {
  valid: boolean;
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];
  const nodeEnv = process.env.NODE_ENV || 'development';

  // Schema validation based on environment
  try {
    if (nodeEnv === 'production') {
      productionEnvSchema.parse(process.env);
      logger.info('Production environment validation passed');
    } else {
      developmentEnvSchema.parse(process.env);
      logger.debug('Development environment validation passed');
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      error.errors.forEach((e) => {
        errors.push(`${e.path.join('.')}: ${e.message}`);
      });
    }
  }

  // Run security checks
  securityChecks.forEach((check) => {
    if (!check.check()) {
      if (check.severity === 'error') {
        errors.push(check.message);
      } else {
        warnings.push(check.message);
      }
    }
  });

  // Log results
  if (warnings.length > 0) {
    logger.warn('Environment validation warnings', { warnings });
  }

  if (errors.length > 0) {
    logger.error('Environment validation failed', { errors });
    if (exitOnError && nodeEnv === 'production') {
      process.exit(1);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Check if all required services are configured
 */
export function checkRequiredServices(): {
  database: boolean;
  redis: boolean;
  email: boolean;
  storage: boolean;
  payments: boolean;
} {
  return {
    database: !!process.env.MONGODB_URI,
    redis: !!(process.env.REDIS_HOST && process.env.REDIS_PORT),
    email: !!(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS),
    storage:
      process.env.STORAGE_TYPE === 'local' ||
      !!(
        process.env.AWS_ACCESS_KEY_ID &&
        process.env.AWS_SECRET_ACCESS_KEY &&
        process.env.AWS_S3_BUCKET
      ),
    payments: !!(process.env.STRIPE_SECRET_KEY && process.env.STRIPE_WEBHOOK_SECRET),
  };
}

export default {
  validateEnvironment,
  checkRequiredServices,
};
