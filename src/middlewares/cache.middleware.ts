/**
 * Cache Middleware
 * Provides response caching for analytics endpoints
 */

import { Request, Response, NextFunction } from 'express';
import { getCachedAnalytics, setCachedAnalytics, CACHE_TTL } from '@utils/cache';
import logger from '@utils/logger';

// ============================================
// Analytics Cache Middleware
// ============================================

/**
 * Middleware to cache analytics responses
 * Caches responses for 60 seconds (30 seconds for overview)
 */
export function analyticsCache(customTtl?: number) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    // Skip caching for non-GET requests
    if (req.method !== 'GET') {
      return next();
    }

    // Skip if no user (should be authenticated)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const user = (req as any).user;
    if (!user?._id) {
      return next();
    }

    const userId = typeof user._id === 'string' ? user._id : user._id.toString();
    const path = req.path;
    const query = req.query as Record<string, unknown>;

    try {
      // Check cache
      const cached = await getCachedAnalytics<unknown>(userId, path, query);

      if (cached) {
        logger.debug('Analytics cache hit', { userId, path });
        res.json(cached);
        return;
      }

      // Store original json method
      const originalJson = res.json.bind(res);

      // Override json to cache the response
      res.json = function (data: unknown): Response {
        // Only cache successful responses
        if (res.statusCode >= 200 && res.statusCode < 300) {
          // Determine TTL based on path
          const ttl =
            customTtl ??
            (path.includes('overview') ? CACHE_TTL.ANALYTICS_OVERVIEW : CACHE_TTL.ANALYTICS);

          // Cache asynchronously (don't wait)
          setCachedAnalytics(userId, path, query, data, ttl).catch((err) => {
            logger.error('Failed to cache analytics response', { error: err });
          });
        }

        return originalJson(data);
      };

      next();
    } catch (error) {
      logger.error('Analytics cache middleware error', { error });
      next();
    }
  };
}

/**
 * Middleware to skip cache (force fresh data)
 * Use query param ?fresh=true to bypass cache
 */
export function skipCacheOnFresh(req: Request, res: Response, next: NextFunction): void {
  if (req.query.fresh === 'true') {
    // Set a flag to skip cache in subsequent middleware
    res.locals.skipCache = true;
  }
  next();
}

/**
 * Middleware to add cache control headers
 */
export function cacheControl(maxAge: number = 60) {
  return (_req: Request, res: Response, next: NextFunction): void => {
    // Set cache headers for CDN/browser caching
    res.set({
      'Cache-Control': `public, max-age=${maxAge}`,
      Vary: 'Authorization',
    });
    next();
  };
}

/**
 * Middleware to prevent caching
 */
export function noCache(_req: Request, res: Response, next: NextFunction): void {
  res.set({
    'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
    Pragma: 'no-cache',
    Expires: '0',
  });
  next();
}

// ============================================
// Export
// ============================================

export default {
  analyticsCache,
  skipCacheOnFresh,
  cacheControl,
  noCache,
};
