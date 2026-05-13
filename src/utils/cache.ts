/**
 * Cache Utility
 * Provides caching helpers with metrics tracking and cache warming
 */

import { getCache, setCache, deleteCache, deleteCachePattern, getRedisClient } from '@config/redis';
import User from '@models/user.model';
import { PlanType, PlanLimits } from '@/types';
import { getPlanLimits, planLimits } from '@config/index';
import logger from '@utils/logger';

// ============================================
// Cache Keys & TTLs
// ============================================

export const CACHE_KEYS = {
  PLANS: 'cache:plans:all',
  USER_LIMITS: (userId: string) => `cache:user:limits:${userId}`,
  ANALYTICS: (userId: string, path: string, queryHash: string) =>
    `cache:analytics:${userId}:${path}:${queryHash}`,
} as const;

export const CACHE_TTL = {
  PLANS: 3600, // 1 hour - plans rarely change
  USER_LIMITS: 300, // 5 minutes - limits change on plan upgrade
  ANALYTICS: 60, // 1 minute - analytics data can be slightly stale
  ANALYTICS_OVERVIEW: 30, // 30 seconds - overview should be more fresh
} as const;

// ============================================
// Cache Metrics
// ============================================

interface CacheMetrics {
  hits: number;
  misses: number;
  errors: number;
  lastHit?: Date;
  lastMiss?: Date;
  lastError?: Date;
}

const metrics: Record<string, CacheMetrics> = {
  plans: { hits: 0, misses: 0, errors: 0 },
  userLimits: { hits: 0, misses: 0, errors: 0 },
  analytics: { hits: 0, misses: 0, errors: 0 },
};

/**
 * Record a cache hit
 */
function recordHit(category: keyof typeof metrics): void {
  metrics[category].hits++;
  metrics[category].lastHit = new Date();
}

/**
 * Record a cache miss
 */
function recordMiss(category: keyof typeof metrics): void {
  metrics[category].misses++;
  metrics[category].lastMiss = new Date();
}

/**
 * Record a cache error
 */
function recordError(category: keyof typeof metrics): void {
  metrics[category].errors++;
  metrics[category].lastError = new Date();
}

/**
 * Get cache statistics
 */
export function getCacheStats(): {
  overall: {
    hits: number;
    misses: number;
    errors: number;
    hitRatio: string;
  };
  byCategory: Record<
    string,
    CacheMetrics & {
      hitRatio: string;
    }
  >;
} {
  const overall = {
    hits: Object.values(metrics).reduce((sum, m) => sum + m.hits, 0),
    misses: Object.values(metrics).reduce((sum, m) => sum + m.misses, 0),
    errors: Object.values(metrics).reduce((sum, m) => sum + m.errors, 0),
    hitRatio: '0.00%',
  };

  const total = overall.hits + overall.misses;
  overall.hitRatio = total > 0 ? ((overall.hits / total) * 100).toFixed(2) + '%' : '0.00%';

  const byCategory: Record<string, CacheMetrics & { hitRatio: string }> = {};
  for (const [key, value] of Object.entries(metrics)) {
    const categoryTotal = value.hits + value.misses;
    byCategory[key] = {
      ...value,
      hitRatio: categoryTotal > 0 ? ((value.hits / categoryTotal) * 100).toFixed(2) + '%' : '0.00%',
    };
  }

  return { overall, byCategory };
}

/**
 * Reset cache metrics (useful for testing)
 */
export function resetCacheStats(): void {
  for (const key of Object.keys(metrics)) {
    metrics[key] = { hits: 0, misses: 0, errors: 0 };
  }
}

// ============================================
// Plans Cache
// ============================================

interface PlanInfo {
  plan: PlanType;
  name: string;
  description: string;
  price: number;
  screenshotsPerMonth: number;
  limits: PlanLimits;
}

/**
 * Get available plans with caching
 * Plans don't change often, so cache for 1 hour
 */
export async function getCachedPlans(): Promise<PlanInfo[]> {
  try {
    // Try to get from cache
    const cached = await getCache<PlanInfo[]>(CACHE_KEYS.PLANS);
    if (cached) {
      recordHit('plans');
      return cached;
    }

    recordMiss('plans');

    // Build plans data
    const plans: PlanInfo[] = [
      {
        plan: 'free',
        name: 'Free',
        description: 'Basic screenshot functionality',
        price: 0,
        screenshotsPerMonth: 100,
        limits: planLimits.free,
      },
      {
        plan: 'starter',
        name: 'Starter',
        description: 'For individuals and small projects',
        price: 1900,
        screenshotsPerMonth: 2000,
        limits: planLimits.starter,
      },
      {
        plan: 'professional',
        name: 'Professional',
        description: 'For growing businesses',
        price: 4900,
        screenshotsPerMonth: 10000,
        limits: planLimits.professional,
      },
      {
        plan: 'enterprise',
        name: 'Enterprise',
        description: 'For large organizations',
        price: 14900,
        screenshotsPerMonth: 50000,
        limits: planLimits.enterprise,
      },
    ];

    // Cache for 1 hour
    await setCache(CACHE_KEYS.PLANS, plans, CACHE_TTL.PLANS);

    return plans;
  } catch (error) {
    recordError('plans');
    logger.error('Failed to get cached plans', { error });

    // Return static data on error
    return [
      {
        plan: 'free',
        name: 'Free',
        description: 'Basic screenshot functionality',
        price: 0,
        screenshotsPerMonth: 100,
        limits: planLimits.free,
      },
      {
        plan: 'starter',
        name: 'Starter',
        description: 'For individuals and small projects',
        price: 1900,
        screenshotsPerMonth: 2000,
        limits: planLimits.starter,
      },
      {
        plan: 'professional',
        name: 'Professional',
        description: 'For growing businesses',
        price: 4900,
        screenshotsPerMonth: 10000,
        limits: planLimits.professional,
      },
      {
        plan: 'enterprise',
        name: 'Enterprise',
        description: 'For large organizations',
        price: 14900,
        screenshotsPerMonth: 50000,
        limits: planLimits.enterprise,
      },
    ];
  }
}

/**
 * Invalidate plans cache
 */
export async function invalidatePlansCache(): Promise<void> {
  await deleteCache(CACHE_KEYS.PLANS);
  logger.debug('Plans cache invalidated');
}

// ============================================
// User Limits Cache
// ============================================

interface UserLimitsCache {
  plan: PlanType;
  limits: PlanLimits;
  usage: {
    screenshotsThisMonth: number;
    lastResetDate: Date;
  };
}

/**
 * Get user limits with caching
 * Cache for 5 minutes to balance freshness with performance
 */
export async function getCachedUserLimits(userId: string): Promise<UserLimitsCache | null> {
  const cacheKey = CACHE_KEYS.USER_LIMITS(userId);

  try {
    // Try to get from cache
    const cached = await getCache<UserLimitsCache>(cacheKey);
    if (cached) {
      recordHit('userLimits');
      return cached;
    }

    recordMiss('userLimits');

    // Fetch from database
    const user = await User.findById(userId).select('subscription usage').lean();
    if (!user) {
      return null;
    }

    const limits = getPlanLimits(user.subscription.plan);
    const data: UserLimitsCache = {
      plan: user.subscription.plan,
      limits,
      usage: {
        screenshotsThisMonth: user.usage.screenshotsThisMonth,
        lastResetDate: user.usage.lastResetDate,
      },
    };

    // Cache for 5 minutes
    await setCache(cacheKey, data, CACHE_TTL.USER_LIMITS);

    return data;
  } catch (error) {
    recordError('userLimits');
    logger.error('Failed to get cached user limits', { userId, error });
    return null;
  }
}

/**
 * Invalidate user limits cache
 */
export async function invalidateUserLimitsCache(userId: string): Promise<void> {
  await deleteCache(CACHE_KEYS.USER_LIMITS(userId));
  logger.debug('User limits cache invalidated', { userId });
}

// ============================================
// Analytics Cache
// ============================================

/**
 * Generate a hash for query parameters
 */
function hashQuery(query: Record<string, unknown>): string {
  const sorted = Object.keys(query)
    .sort()
    .map((key) => `${key}=${query[key]}`)
    .join('&');
  // Simple hash function
  let hash = 0;
  for (let i = 0; i < sorted.length; i++) {
    const char = sorted.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash).toString(36);
}

/**
 * Get cached analytics response
 */
export async function getCachedAnalytics<T>(
  userId: string,
  path: string,
  query: Record<string, unknown>
): Promise<T | null> {
  const queryHash = hashQuery(query);
  const cacheKey = CACHE_KEYS.ANALYTICS(userId, path, queryHash);

  try {
    const cached = await getCache<T>(cacheKey);
    if (cached) {
      recordHit('analytics');
      return cached;
    }

    recordMiss('analytics');
    return null;
  } catch (error) {
    recordError('analytics');
    logger.error('Failed to get cached analytics', { userId, path, error });
    return null;
  }
}

/**
 * Set cached analytics response
 */
export async function setCachedAnalytics<T>(
  userId: string,
  path: string,
  query: Record<string, unknown>,
  data: T,
  ttl?: number
): Promise<void> {
  const queryHash = hashQuery(query);
  const cacheKey = CACHE_KEYS.ANALYTICS(userId, path, queryHash);

  // Use shorter TTL for overview endpoint
  const cacheTtl =
    ttl ?? (path.includes('overview') ? CACHE_TTL.ANALYTICS_OVERVIEW : CACHE_TTL.ANALYTICS);

  try {
    await setCache(cacheKey, data, cacheTtl);
  } catch (error) {
    logger.error('Failed to set cached analytics', { userId, path, error });
  }
}

/**
 * Invalidate all analytics cache for a user
 */
export async function invalidateAnalyticsCache(userId: string): Promise<void> {
  await deleteCachePattern(`cache:analytics:${userId}:*`);
  logger.debug('Analytics cache invalidated', { userId });
}

// ============================================
// Cache Warming
// ============================================

/**
 * Warm caches on application startup
 * This pre-populates frequently accessed data
 */
export async function warmCaches(): Promise<void> {
  const startTime = Date.now();
  logger.info('Starting cache warming...');

  try {
    // Check if Redis is available
    const redis = getRedisClient();
    if (!redis || redis.status !== 'ready') {
      logger.warn('Redis not available, skipping cache warming');
      return;
    }

    // 1. Warm plans cache
    await getCachedPlans();
    logger.debug('Plans cache warmed');

    // 2. Warm active users' limits (limit to prevent overwhelming DB)
    const activeUsers = await User.find({ 'subscription.status': 'active' })
      .select('_id')
      .limit(1000)
      .lean();

    let warmedUsers = 0;
    for (const user of activeUsers) {
      await getCachedUserLimits(user._id.toString());
      warmedUsers++;

      // Add small delay to prevent overwhelming Redis
      if (warmedUsers % 100 === 0) {
        await new Promise((resolve) => setTimeout(resolve, 10));
      }
    }

    const duration = Date.now() - startTime;
    logger.info('Cache warming completed', {
      plansWarmed: true,
      usersWarmed: warmedUsers,
      durationMs: duration,
    });
  } catch (error) {
    logger.error('Cache warming failed', { error });
  }
}

// ============================================
// Cache Wrapper (get-or-fetch pattern)
// ============================================

interface CacheOptions {
  key: string;
  ttl?: number;
  category?: keyof typeof metrics;
}

/**
 * Generic cache wrapper with get-or-fetch pattern
 * @param options - Cache options (key, ttl, category)
 * @param fetchFn - Function to fetch data if not cached
 * @returns Cached or freshly fetched data
 */
export async function cacheWrapper<T>(
  options: CacheOptions,
  fetchFn: () => Promise<T>
): Promise<T> {
  const { key, ttl = 300, category = 'analytics' } = options;

  try {
    // Try cache first
    const cached = await getCache<T>(key);
    if (cached !== null) {
      recordHit(category);
      return cached;
    }

    recordMiss(category);

    // Fetch fresh data
    const data = await fetchFn();

    // Cache it
    await setCache(key, data, ttl);

    return data;
  } catch (error) {
    recordError(category);
    logger.error('Cache wrapper error', { key, error });

    // Fall back to fetch function
    return fetchFn();
  }
}

// ============================================
// Export
// ============================================

export default {
  CACHE_KEYS,
  CACHE_TTL,
  getCachedPlans,
  invalidatePlansCache,
  getCachedUserLimits,
  invalidateUserLimitsCache,
  getCachedAnalytics,
  setCachedAnalytics,
  invalidateAnalyticsCache,
  warmCaches,
  getCacheStats,
  resetCacheStats,
  cacheWrapper,
};
