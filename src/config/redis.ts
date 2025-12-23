/**
 * Redis Configuration
 * Handles Redis connection, caching, and session management
 */

import Redis, { RedisOptions } from 'ioredis';
import { config } from './index';
import { logger } from '@utils/logger';

/**
 * Redis client instance
 */
let redisClient: Redis | null = null;

/**
 * Redis connection options
 */
const redisOptions: RedisOptions = {
  host: config.redis.host,
  port: config.redis.port,
  password: config.redis.password || undefined,
  db: config.redis.db,
  retryStrategy: (times: number) => {
    if (times > 10) {
      logger.error('Redis connection failed after 10 retries');
      return null;
    }
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
  maxRetriesPerRequest: 3,
  lazyConnect: true,
  enableReadyCheck: true,
  showFriendlyErrorStack: config.env === 'development',
};

/**
 * Create and connect to Redis
 * @returns Redis client instance
 */
export const connectRedis = async (): Promise<Redis> => {
  if (redisClient && redisClient.status === 'ready') {
    logger.info('Using existing Redis connection');
    return redisClient;
  }

  try {
    redisClient = new Redis(redisOptions);

    // Set up event handlers
    redisClient.on('connect', () => {
      logger.info('Redis client connected');
    });

    redisClient.on('ready', () => {
      logger.info('Redis client ready');
    });

    redisClient.on('error', (error) => {
      logger.error('Redis client error:', error);
    });

    redisClient.on('close', () => {
      logger.warn('Redis connection closed');
    });

    redisClient.on('reconnecting', () => {
      logger.info('Redis client reconnecting');
    });

    // Connect to Redis
    await redisClient.connect();

    return redisClient;
  } catch (error) {
    logger.error('Failed to connect to Redis:', error);
    throw error;
  }
};

/**
 * Get Redis client instance
 * @returns Redis client or null if not connected
 */
export const getRedisClient = (): Redis | null => {
  return redisClient;
};

/**
 * Disconnect from Redis
 */
export const disconnectRedis = async (): Promise<void> => {
  if (redisClient) {
    await redisClient.quit();
    redisClient = null;
    logger.info('Redis disconnected successfully');
  }
};

/**
 * Check Redis connection health
 * @returns Health check result
 */
export const checkRedisHealth = async (): Promise<{
  connected: boolean;
  status: string;
  latencyMs?: number;
}> => {
  try {
    if (!redisClient || redisClient.status !== 'ready') {
      return {
        connected: false,
        status: redisClient?.status || 'disconnected',
      };
    }

    const startTime = Date.now();
    await redisClient.ping();
    const latencyMs = Date.now() - startTime;

    return {
      connected: true,
      status: 'connected',
      latencyMs,
    };
  } catch (error) {
    logger.error('Redis health check failed:', error);
    return {
      connected: false,
      status: 'error',
    };
  }
};

// ============================================
// Cache Helper Functions
// ============================================

/**
 * Default cache TTL in seconds (1 hour)
 */
const DEFAULT_TTL = 3600;

/**
 * Set a value in cache
 * @param key - Cache key
 * @param value - Value to cache (will be JSON serialized)
 * @param ttl - Time to live in seconds (default: 1 hour)
 */
export const setCache = async <T>(key: string, value: T, ttl: number = DEFAULT_TTL): Promise<void> => {
  if (!redisClient) {
    logger.warn('Redis not connected, cache set skipped');
    return;
  }

  try {
    const serialized = JSON.stringify(value);
    await redisClient.setex(key, ttl, serialized);
  } catch (error) {
    logger.error(`Failed to set cache key "${key}":`, error);
    throw error;
  }
};

/**
 * Get a value from cache
 * @param key - Cache key
 * @returns Parsed value or null if not found
 */
export const getCache = async <T>(key: string): Promise<T | null> => {
  if (!redisClient) {
    logger.warn('Redis not connected, cache get skipped');
    return null;
  }

  try {
    const value = await redisClient.get(key);
    if (!value) {
      return null;
    }
    return JSON.parse(value) as T;
  } catch (error) {
    logger.error(`Failed to get cache key "${key}":`, error);
    return null;
  }
};

/**
 * Delete a value from cache
 * @param key - Cache key
 */
export const deleteCache = async (key: string): Promise<void> => {
  if (!redisClient) {
    logger.warn('Redis not connected, cache delete skipped');
    return;
  }

  try {
    await redisClient.del(key);
  } catch (error) {
    logger.error(`Failed to delete cache key "${key}":`, error);
    throw error;
  }
};

/**
 * Delete multiple keys matching a pattern
 * @param pattern - Key pattern (e.g., "user:*")
 */
export const deleteCachePattern = async (pattern: string): Promise<number> => {
  if (!redisClient) {
    logger.warn('Redis not connected, cache pattern delete skipped');
    return 0;
  }

  try {
    const keys = await redisClient.keys(pattern);
    if (keys.length === 0) {
      return 0;
    }
    const deleted = await redisClient.del(...keys);
    return deleted;
  } catch (error) {
    logger.error(`Failed to delete cache pattern "${pattern}":`, error);
    throw error;
  }
};

/**
 * Check if a key exists in cache
 * @param key - Cache key
 * @returns True if key exists
 */
export const hasCache = async (key: string): Promise<boolean> => {
  if (!redisClient) {
    return false;
  }

  try {
    const exists = await redisClient.exists(key);
    return exists === 1;
  } catch (error) {
    logger.error(`Failed to check cache key "${key}":`, error);
    return false;
  }
};

/**
 * Get TTL for a key
 * @param key - Cache key
 * @returns TTL in seconds, -1 if no expiry, -2 if key doesn't exist
 */
export const getCacheTTL = async (key: string): Promise<number> => {
  if (!redisClient) {
    return -2;
  }

  try {
    return await redisClient.ttl(key);
  } catch (error) {
    logger.error(`Failed to get TTL for key "${key}":`, error);
    return -2;
  }
};

/**
 * Increment a counter in cache
 * @param key - Cache key
 * @param amount - Amount to increment (default: 1)
 * @returns New value after increment
 */
export const incrementCache = async (key: string, amount: number = 1): Promise<number> => {
  if (!redisClient) {
    throw new Error('Redis not connected');
  }

  try {
    return await redisClient.incrby(key, amount);
  } catch (error) {
    logger.error(`Failed to increment cache key "${key}":`, error);
    throw error;
  }
};

/**
 * Set expiry on a key
 * @param key - Cache key
 * @param ttl - Time to live in seconds
 */
export const setExpiry = async (key: string, ttl: number): Promise<void> => {
  if (!redisClient) {
    return;
  }

  try {
    await redisClient.expire(key, ttl);
  } catch (error) {
    logger.error(`Failed to set expiry for key "${key}":`, error);
    throw error;
  }
};

// ============================================
// Rate Limiting Helpers
// ============================================

/**
 * Rate limiter key generator
 */
export const getRateLimitKey = (identifier: string, window: string): string => {
  return `ratelimit:${identifier}:${window}`;
};

/**
 * Check and increment rate limit
 * @param key - Rate limit key
 * @param limit - Maximum allowed requests
 * @param windowSecs - Window duration in seconds
 * @returns Object with remaining requests and reset time
 */
export const checkRateLimit = async (
  key: string,
  limit: number,
  windowSecs: number
): Promise<{
  allowed: boolean;
  remaining: number;
  resetTime: number;
  current: number;
}> => {
  if (!redisClient) {
    // Allow if Redis is not available
    return {
      allowed: true,
      remaining: limit,
      resetTime: Date.now() + windowSecs * 1000,
      current: 0,
    };
  }

  try {
    const now = Date.now();
    const windowStart = Math.floor(now / (windowSecs * 1000)) * (windowSecs * 1000);
    const windowKey = `${key}:${windowStart}`;

    const multi = redisClient.multi();
    multi.incr(windowKey);
    multi.pexpire(windowKey, windowSecs * 1000);

    const results = await multi.exec();
    const current = (results?.[0]?.[1] as number) || 0;

    const resetTime = windowStart + windowSecs * 1000;
    const remaining = Math.max(0, limit - current);
    const allowed = current <= limit;

    return {
      allowed,
      remaining,
      resetTime,
      current,
    };
  } catch (error) {
    logger.error(`Rate limit check failed for key "${key}":`, error);
    // Allow on error
    return {
      allowed: true,
      remaining: limit,
      resetTime: Date.now() + windowSecs * 1000,
      current: 0,
    };
  }
};

// ============================================
// Named Exports for Convenience
// ============================================

/**
 * Direct access to the Redis client for low-level operations
 * Note: Use with caution - prefer the helper functions
 */
export const redis = {
  /**
   * Get a Redis client for direct operations
   * Returns an object with common Redis methods that work with the internal client
   */
  multi: () => {
    if (!redisClient) throw new Error('Redis not connected');
    return redisClient.multi();
  },
  keys: async (pattern: string): Promise<string[]> => {
    if (!redisClient) return [];
    return redisClient.keys(pattern);
  },
  del: async (...keys: string[]): Promise<number> => {
    if (!redisClient) return 0;
    return redisClient.del(...keys);
  },
  get: async (key: string): Promise<string | null> => {
    if (!redisClient) return null;
    return redisClient.get(key);
  },
  set: async (key: string, value: string, ttlSeconds?: number): Promise<'OK' | null> => {
    if (!redisClient) return null;
    if (ttlSeconds) {
      return redisClient.setex(key, ttlSeconds, value);
    }
    return redisClient.set(key, value);
  },
  zadd: async (key: string, score: number, member: string): Promise<number> => {
    if (!redisClient) return 0;
    return redisClient.zadd(key, score, member);
  },
  zremrangebyscore: async (key: string, min: number, max: number): Promise<number> => {
    if (!redisClient) return 0;
    return redisClient.zremrangebyscore(key, min, max);
  },
  zcount: async (key: string, min: number | string, max: number | string): Promise<number> => {
    if (!redisClient) return 0;
    return redisClient.zcount(key, min, max);
  },
  expire: async (key: string, seconds: number): Promise<number> => {
    if (!redisClient) return 0;
    return redisClient.expire(key, seconds);
  },
};

/**
 * Cache helper object for convenient access
 */
export const cache = {
  set: setCache,
  get: getCache,
  delete: deleteCache,
  deletePattern: deleteCachePattern,
  has: hasCache,
  ttl: getCacheTTL,
  increment: incrementCache,
  setExpiry,
};

/**
 * Invalidate cache by deleting a key
 */
export const invalidateCache = deleteCache;

export default {
  connect: connectRedis,
  disconnect: disconnectRedis,
  getClient: getRedisClient,
  checkHealth: checkRedisHealth,
  cache,
  rateLimit: {
    getKey: getRateLimitKey,
    check: checkRateLimit,
  },
};
