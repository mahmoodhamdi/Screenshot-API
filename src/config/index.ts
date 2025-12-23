/**
 * Application Configuration
 * Centralized configuration management with Zod validation
 */

import { z } from 'zod';
import dotenv from 'dotenv';
import path from 'path';
import { PlanLimitsConfig, PlanType, ScreenshotFormat } from '@/types';

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

/**
 * Environment schema validation using Zod
 */
const envSchema = z.object({
  // Server
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().transform(Number).default('3000'),
  API_VERSION: z.string().default('v1'),
  API_URL: z.string().url().optional().default('http://localhost:3000'),

  // MongoDB
  MONGODB_URI: z.string().default('mongodb://localhost:27017/screenshot-api'),

  // Redis
  REDIS_HOST: z.string().default('localhost'),
  REDIS_PORT: z.string().transform(Number).default('6379'),
  REDIS_PASSWORD: z.string().optional(),
  REDIS_DB: z.string().transform(Number).default('0'),

  // JWT
  JWT_SECRET: z.string().min(32),
  JWT_EXPIRES_IN: z.string().default('7d'),
  JWT_REFRESH_SECRET: z.string().min(32),
  JWT_REFRESH_EXPIRES_IN: z.string().default('30d'),

  // API Key
  API_KEY_PREFIX: z.string().default('ss_'),
  API_KEY_LENGTH: z.string().transform(Number).default('32'),

  // Puppeteer
  PUPPETEER_HEADLESS: z
    .string()
    .transform((val) => val === 'true')
    .default('true'),
  PUPPETEER_TIMEOUT: z.string().transform(Number).default('30000'),
  PUPPETEER_MAX_CONCURRENT: z.string().transform(Number).default('5'),

  // AWS S3
  AWS_ACCESS_KEY_ID: z.string().optional(),
  AWS_SECRET_ACCESS_KEY: z.string().optional(),
  AWS_REGION: z.string().default('us-east-1'),
  AWS_S3_BUCKET: z.string().optional(),

  // Storage
  STORAGE_TYPE: z.enum(['local', 's3']).default('local'),
  LOCAL_STORAGE_PATH: z.string().default('./uploads'),
  STORAGE_PUBLIC_URL: z.string().optional(),
  SCREENSHOT_EXPIRY_DAYS: z.string().transform(Number).default('7'),

  // Stripe
  STRIPE_SECRET_KEY: z.string().optional(),
  STRIPE_WEBHOOK_SECRET: z.string().optional(),
  STRIPE_STARTER_PRICE_ID: z.string().optional(),
  STRIPE_PROFESSIONAL_PRICE_ID: z.string().optional(),
  STRIPE_ENTERPRISE_PRICE_ID: z.string().optional(),

  // Rate Limiting
  RATE_LIMIT_WINDOW_MS: z.string().transform(Number).default('60000'),
  RATE_LIMIT_MAX_REQUESTS: z.string().transform(Number).default('100'),

  // Email
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.string().transform(Number).optional(),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  EMAIL_FROM: z.string().email().optional(),

  // Logging
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'http', 'debug']).default('info'),
  LOG_FORMAT: z.enum(['combined', 'common', 'dev', 'short', 'tiny']).default('combined'),

  // CORS
  CORS_ORIGIN: z.string().default('*'),
  CORS_CREDENTIALS: z
    .string()
    .transform((val) => val === 'true')
    .default('true'),
});

/**
 * Parse and validate environment variables
 */
const parseEnv = (): z.infer<typeof envSchema> => {
  try {
    return envSchema.parse(process.env);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const missingVars = error.errors.map((e) => `${e.path.join('.')}: ${e.message}`);
      throw new Error(`Environment validation failed:\n${missingVars.join('\n')}`);
    }
    throw error;
  }
};

/**
 * Validated environment configuration
 */
export const env = parseEnv();

/**
 * Plan limits configuration based on subscription tier
 */
export const planLimits: PlanLimitsConfig = {
  free: {
    screenshotsPerMonth: 100,
    maxWidth: 1280,
    maxHeight: 720,
    formats: ['png', 'jpeg'] as ScreenshotFormat[],
    rateLimit: 10,
    fullPage: false,
    customHeaders: false,
    webhooks: false,
    priority: false,
  },
  starter: {
    screenshotsPerMonth: 2000,
    maxWidth: 1920,
    maxHeight: 1080,
    formats: ['png', 'jpeg', 'webp'] as ScreenshotFormat[],
    rateLimit: 30,
    fullPage: true,
    customHeaders: false,
    webhooks: false,
    priority: false,
  },
  professional: {
    screenshotsPerMonth: 10000,
    maxWidth: 3840,
    maxHeight: 2160,
    formats: ['png', 'jpeg', 'webp', 'pdf'] as ScreenshotFormat[],
    rateLimit: 100,
    fullPage: true,
    customHeaders: true,
    webhooks: true,
    priority: true,
  },
  enterprise: {
    screenshotsPerMonth: 50000,
    maxWidth: 7680,
    maxHeight: 4320,
    formats: ['png', 'jpeg', 'webp', 'pdf'] as ScreenshotFormat[],
    rateLimit: 500,
    fullPage: true,
    customHeaders: true,
    webhooks: true,
    priority: true,
  },
};

/**
 * Get plan limits for a specific plan type
 * @param plan - The subscription plan type
 * @returns Plan limits configuration
 */
export const getPlanLimits = (plan: PlanType) => {
  return planLimits[plan];
};

/**
 * Stripe price IDs mapped to plan types
 */
export const stripePriceIds: Record<Exclude<PlanType, 'free'>, string | undefined> = {
  starter: env.STRIPE_STARTER_PRICE_ID,
  professional: env.STRIPE_PROFESSIONAL_PRICE_ID,
  enterprise: env.STRIPE_ENTERPRISE_PRICE_ID,
};

/**
 * Get plan type from Stripe price ID
 * @param priceId - Stripe price ID
 * @returns Plan type or undefined if not found
 */
export const getPlanFromPriceId = (priceId: string): PlanType | undefined => {
  for (const [plan, id] of Object.entries(stripePriceIds)) {
    if (id === priceId) {
      return plan as PlanType;
    }
  }
  return undefined;
};

/**
 * Application configuration object
 */
export const config = {
  env: env.NODE_ENV,
  port: env.PORT,
  apiVersion: env.API_VERSION,
  apiUrl: env.API_URL,

  // Server configuration
  server: {
    env: env.NODE_ENV,
    port: env.PORT,
    trustProxy: true,
    shutdownTimeout: 30000,
  },

  // API configuration
  api: {
    version: env.API_VERSION,
    url: env.API_URL,
  },

  mongo: {
    uri: env.MONGODB_URI,
  },

  redis: {
    host: env.REDIS_HOST,
    port: env.REDIS_PORT,
    password: env.REDIS_PASSWORD,
    db: env.REDIS_DB,
  },

  jwt: {
    secret: env.JWT_SECRET,
    expiresIn: env.JWT_EXPIRES_IN,
    refreshSecret: env.JWT_REFRESH_SECRET,
    refreshExpiresIn: env.JWT_REFRESH_EXPIRES_IN,
  },

  apiKey: {
    prefix: env.API_KEY_PREFIX,
    length: env.API_KEY_LENGTH,
  },

  puppeteer: {
    headless: env.PUPPETEER_HEADLESS,
    timeout: env.PUPPETEER_TIMEOUT,
    maxConcurrent: env.PUPPETEER_MAX_CONCURRENT,
  },

  aws: {
    accessKeyId: env.AWS_ACCESS_KEY_ID,
    secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
    region: env.AWS_REGION,
    s3Bucket: env.AWS_S3_BUCKET,
  },

  storage: {
    type: env.STORAGE_TYPE,
    localPath: env.LOCAL_STORAGE_PATH,
    publicUrl: env.STORAGE_PUBLIC_URL,
    expiryDays: env.SCREENSHOT_EXPIRY_DAYS,
    s3Bucket: env.AWS_S3_BUCKET,
    s3Region: env.AWS_REGION,
    s3AccessKey: env.AWS_ACCESS_KEY_ID,
    s3SecretKey: env.AWS_SECRET_ACCESS_KEY,
    s3SignedUrls: env.STORAGE_TYPE === 's3',
  },

  stripe: {
    secretKey: env.STRIPE_SECRET_KEY,
    webhookSecret: env.STRIPE_WEBHOOK_SECRET,
    priceIds: stripePriceIds,
  },

  rateLimit: {
    windowMs: env.RATE_LIMIT_WINDOW_MS,
    maxRequests: env.RATE_LIMIT_MAX_REQUESTS,
  },

  email: {
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    user: env.SMTP_USER,
    pass: env.SMTP_PASS,
    from: env.EMAIL_FROM,
  },

  logging: {
    level: env.LOG_LEVEL,
    format: env.LOG_FORMAT,
  },

  cors: {
    origin: env.CORS_ORIGIN,
    credentials: env.CORS_CREDENTIALS,
  },
};

export default config;
