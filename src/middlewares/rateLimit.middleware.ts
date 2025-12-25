/**
 * Rate Limiting Middleware
 * Implements sliding window rate limiting using Redis
 */

import { Request, Response, NextFunction } from 'express';
import { redis } from '@config/redis';
import { config } from '@config/index';
import logger from '@utils/logger';
import { ERROR_CODES, ERROR_MESSAGES } from '@utils/constants';

// ============================================
// Types
// ============================================

interface RateLimitOptions {
  /** Window size in seconds */
  windowMs?: number;
  /** Maximum requests per window */
  max?: number;
  /** Key prefix for Redis */
  keyPrefix?: string;
  /** Custom key generator */
  keyGenerator?: (req: Request) => string;
  /** Skip rate limiting for certain requests */
  skip?: (req: Request) => boolean;
  /** Message to send when rate limited */
  message?: string;
  /** Headers to include in response */
  headers?: boolean;
}

interface RateLimitInfo {
  limit: number;
  current: number;
  remaining: number;
  resetTime: number;
}

// ============================================
// Default Configuration
// ============================================

const DEFAULT_OPTIONS: Required<RateLimitOptions> = {
  windowMs: 60 * 1000, // 1 minute
  max: 100, // 100 requests per minute
  keyPrefix: 'rl:',
  keyGenerator: (req: Request) => {
    // Use user ID if authenticated, otherwise use IP
    if (req.userId) {
      return `user:${req.userId}`;
    }
    if (req.apiKey) {
      return `apikey:${req.apiKey._id}`;
    }
    return `ip:${req.ip || req.socket.remoteAddress || 'unknown'}`;
  },
  skip: () => false,
  message: ERROR_MESSAGES.RATE_LIMIT_EXCEEDED,
  headers: true,
};

// ============================================
// Rate Limit Store
// ============================================

/**
 * Get rate limit info for a key
 * @param key - Rate limit key
 * @param windowMs - Window size in milliseconds
 * @param max - Maximum requests
 * @returns Rate limit info
 */
async function getRateLimitInfo(
  key: string,
  windowMs: number,
  max: number
): Promise<RateLimitInfo> {
  const now = Date.now();
  const windowStart = now - windowMs;
  const windowKey = `${key}:window`;

  // Use Redis sorted set for sliding window
  // Remove old entries and count current ones
  const multi = redis.multi();

  // Remove entries older than window
  multi.zremrangebyscore(windowKey, 0, windowStart);

  // Add current request
  multi.zadd(windowKey, now, `${now}:${Math.random()}`);

  // Get count of requests in window
  multi.zcount(windowKey, windowStart, '+inf');

  // Set expiry on the key
  multi.expire(windowKey, Math.ceil(windowMs / 1000) + 1);

  const results = await multi.exec();

  // Get the count from the ZCOUNT result
  const countResult = results?.[2];
  const current = typeof countResult?.[1] === 'number' ? countResult[1] : 1;

  return {
    limit: max,
    current,
    remaining: Math.max(0, max - current),
    resetTime: now + windowMs,
  };
}

/**
 * Check if request should be rate limited
 * @param key - Rate limit key
 * @param windowMs - Window size in milliseconds
 * @param max - Maximum requests
 * @returns Rate limit info with isLimited flag
 */
async function checkRateLimit(
  key: string,
  windowMs: number,
  max: number
): Promise<RateLimitInfo & { isLimited: boolean }> {
  try {
    const info = await getRateLimitInfo(key, windowMs, max);
    return {
      ...info,
      isLimited: info.current > max,
    };
  } catch (error) {
    // On Redis error, allow the request but log
    logger.error('Rate limit check failed', { error, key });
    return {
      limit: max,
      current: 0,
      remaining: max,
      resetTime: Date.now() + windowMs,
      isLimited: false,
    };
  }
}

// ============================================
// Rate Limit Middleware Factory
// ============================================

/**
 * Create rate limit middleware
 * @param options - Rate limit options
 * @returns Express middleware
 */
export function rateLimit(options: RateLimitOptions = {}) {
  const config = { ...DEFAULT_OPTIONS, ...options };

  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    // Check if should skip
    if (config.skip(req)) {
      next();
      return;
    }

    // Generate key
    const identifier = config.keyGenerator(req);
    const key = `${config.keyPrefix}${identifier}`;

    // Check rate limit
    const info = await checkRateLimit(key, config.windowMs, config.max);

    // Set headers
    if (config.headers) {
      res.set('X-RateLimit-Limit', String(info.limit));
      res.set('X-RateLimit-Remaining', String(info.remaining));
      res.set('X-RateLimit-Reset', String(Math.ceil(info.resetTime / 1000)));
    }

    // Check if limited
    if (info.isLimited) {
      res.set('Retry-After', String(Math.ceil(config.windowMs / 1000)));
      res.status(429).json({
        success: false,
        error: {
          code: ERROR_CODES.RATE_LIMIT_EXCEEDED,
          message: config.message,
          retryAfter: Math.ceil(config.windowMs / 1000),
        },
      });
      return;
    }

    next();
  };
}

// ============================================
// Pre-configured Rate Limiters
// ============================================

/**
 * Default API rate limiter
 * 100 requests per minute
 */
export const defaultRateLimit = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  keyPrefix: 'rl:api:',
});

/**
 * Strict rate limiter for sensitive endpoints
 * 10 requests per minute
 */
export const strictRateLimit = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  keyPrefix: 'rl:strict:',
});

/**
 * Auth rate limiter for login/register
 * 5 requests per minute per IP
 */
export const authRateLimit = rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  keyPrefix: 'rl:auth:',
  keyGenerator: (req) => `ip:${req.ip || req.socket.remoteAddress || 'unknown'}`,
});

/**
 * Screenshot rate limiter
 * Uses user's plan limit
 */
export const screenshotRateLimit = rateLimit({
  windowMs: 60 * 1000,
  max: 10, // Default, will be overridden by plan limits
  keyPrefix: 'rl:screenshot:',
  keyGenerator: (req) => {
    if (req.userId) {
      return `user:${req.userId}`;
    }
    if (req.apiKey) {
      return `apikey:${req.apiKey._id}`;
    }
    return `ip:${req.ip || 'unknown'}`;
  },
});

/**
 * Create plan-based rate limiter
 * Respects user's subscription plan limits
 */
export function planBasedRateLimit(operation: 'screenshot' | 'api' = 'api') {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    // Get user's plan limits
    let maxRequests = config.rateLimit.maxRequests;

    if (req.user) {
      const user = req.user as typeof req.user & {
        getPlanLimits: () => { rateLimit: number };
      };
      const planLimits = user.getPlanLimits();
      maxRequests = planLimits.rateLimit;
    } else if (req.apiKey && req.apiKey.rateLimit) {
      // API key can have its own rate limit
      maxRequests = req.apiKey.rateLimit;
    }

    // Create rate limiter with user's limit
    const limiter = rateLimit({
      windowMs: 60 * 1000,
      max: maxRequests,
      keyPrefix: `rl:${operation}:`,
      keyGenerator: (req) => {
        if (req.userId) {
          return `user:${req.userId}`;
        }
        if (req.apiKey) {
          return `apikey:${req.apiKey._id}`;
        }
        return `ip:${req.ip || 'unknown'}`;
      },
    });

    await limiter(req, res, next);
  };
}

// ============================================
// IP-based Rate Limiting
// ============================================

/**
 * Create IP-based rate limiter
 * @param max - Maximum requests
 * @param windowMs - Window in milliseconds
 */
export function ipRateLimit(
  max: number,
  windowMs: number = 60000
): (req: Request, res: Response, next: NextFunction) => Promise<void> {
  return rateLimit({
    windowMs,
    max,
    keyPrefix: 'rl:ip:',
    keyGenerator: (req) => req.ip || req.socket.remoteAddress || 'unknown',
  });
}

// ============================================
// Concurrent Request Limiting
// ============================================

/**
 * Limit concurrent requests per user/key
 * @param max - Maximum concurrent requests
 */
export function concurrentLimit(
  max: number = 5
): (req: Request, res: Response, next: NextFunction) => void {
  const inFlight = new Map<string, number>();

  return (req: Request, res: Response, next: NextFunction): void => {
    const key = req.userId?.toString() || req.apiKey?._id.toString() || req.ip || 'unknown';

    const current = inFlight.get(key) || 0;

    if (current >= max) {
      res.status(429).json({
        success: false,
        error: {
          code: ERROR_CODES.RATE_LIMIT_EXCEEDED,
          message: `Maximum ${max} concurrent requests allowed`,
        },
      });
      return;
    }

    inFlight.set(key, current + 1);

    // Clean up on response finish
    res.on('finish', () => {
      const count = inFlight.get(key) || 1;
      if (count <= 1) {
        inFlight.delete(key);
      } else {
        inFlight.set(key, count - 1);
      }
    });

    next();
  };
}

// ============================================
// Export
// ============================================

export default {
  rateLimit,
  defaultRateLimit,
  strictRateLimit,
  authRateLimit,
  screenshotRateLimit,
  planBasedRateLimit,
  ipRateLimit,
  concurrentLimit,
};
