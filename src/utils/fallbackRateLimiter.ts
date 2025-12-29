/**
 * In-Memory Fallback Rate Limiter
 * Used when Redis is unavailable (circuit breaker open)
 */

import logger from './logger';

// ============================================
// Types and Interfaces
// ============================================

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number;
  total: number;
}

export interface FallbackRateLimiterStats {
  totalKeys: number;
  totalChecks: number;
  totalBlocked: number;
  memoryUsageEstimate: number;
}

// ============================================
// In-Memory Rate Limiter Class
// ============================================

export class InMemoryRateLimiter {
  private store: Map<string, RateLimitEntry> = new Map();
  private cleanupInterval: NodeJS.Timeout | null = null;
  private totalChecks: number = 0;
  private totalBlocked: number = 0;

  constructor(private cleanupIntervalMs: number = 60000) {
    this.startCleanup();
  }

  /**
   * Start periodic cleanup of expired entries
   */
  private startCleanup(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
    this.cleanupInterval = setInterval(() => this.cleanup(), this.cleanupIntervalMs);
    // Ensure the interval doesn't prevent process exit
    this.cleanupInterval.unref();
  }

  /**
   * Check rate limit for a key
   * @param key - The rate limit key (e.g., IP address, user ID)
   * @param max - Maximum requests allowed in the window
   * @param windowMs - Time window in milliseconds
   */
  async check(key: string, max: number, windowMs: number): Promise<RateLimitResult> {
    this.totalChecks++;
    const now = Date.now();
    const entry = this.store.get(key);

    // New entry or expired window
    if (!entry || now > entry.resetAt) {
      this.store.set(key, {
        count: 1,
        resetAt: now + windowMs,
      });
      return {
        allowed: true,
        remaining: max - 1,
        resetAt: now + windowMs,
        total: max,
      };
    }

    // Check if over limit
    if (entry.count >= max) {
      this.totalBlocked++;
      return {
        allowed: false,
        remaining: 0,
        resetAt: entry.resetAt,
        total: max,
      };
    }

    // Increment count
    entry.count++;
    return {
      allowed: true,
      remaining: max - entry.count,
      resetAt: entry.resetAt,
      total: max,
    };
  }

  /**
   * Increment rate limit counter without checking
   * @param key - The rate limit key
   * @param windowMs - Time window in milliseconds
   */
  async increment(key: string, windowMs: number): Promise<number> {
    const now = Date.now();
    const entry = this.store.get(key);

    if (!entry || now > entry.resetAt) {
      this.store.set(key, {
        count: 1,
        resetAt: now + windowMs,
      });
      return 1;
    }

    entry.count++;
    return entry.count;
  }

  /**
   * Decrement rate limit counter
   * @param key - The rate limit key
   */
  async decrement(key: string): Promise<number> {
    const entry = this.store.get(key);

    if (!entry) {
      return 0;
    }

    entry.count = Math.max(0, entry.count - 1);
    return entry.count;
  }

  /**
   * Get current count for a key
   * @param key - The rate limit key
   */
  async get(key: string): Promise<number> {
    const now = Date.now();
    const entry = this.store.get(key);

    if (!entry || now > entry.resetAt) {
      return 0;
    }

    return entry.count;
  }

  /**
   * Delete a key from the store
   * @param key - The rate limit key
   */
  async delete(key: string): Promise<boolean> {
    return this.store.delete(key);
  }

  /**
   * Check if a key exists
   * @param key - The rate limit key
   */
  async exists(key: string): Promise<boolean> {
    const now = Date.now();
    const entry = this.store.get(key);

    if (!entry || now > entry.resetAt) {
      return false;
    }

    return true;
  }

  /**
   * Set expiration for a key (for compatibility with Redis-like API)
   * @param key - The rate limit key
   * @param seconds - TTL in seconds
   */
  async expire(key: string, seconds: number): Promise<boolean> {
    const entry = this.store.get(key);

    if (!entry) {
      return false;
    }

    entry.resetAt = Date.now() + seconds * 1000;
    return true;
  }

  /**
   * Clean up expired entries
   */
  private cleanup(): void {
    const now = Date.now();
    let cleaned = 0;

    for (const [key, entry] of this.store.entries()) {
      if (now > entry.resetAt) {
        this.store.delete(key);
        cleaned++;
      }
    }

    if (cleaned > 0) {
      logger.debug(`Fallback rate limiter cleanup: removed ${cleaned} expired entries`, {
        remaining: this.store.size,
      });
    }
  }

  /**
   * Get statistics about the rate limiter
   */
  getStats(): FallbackRateLimiterStats {
    // Estimate memory usage (rough approximation)
    // Each entry: key string (~50 bytes avg) + count (8) + resetAt (8) + Map overhead (~50)
    const avgEntrySize = 116;
    const memoryUsageEstimate = this.store.size * avgEntrySize;

    return {
      totalKeys: this.store.size,
      totalChecks: this.totalChecks,
      totalBlocked: this.totalBlocked,
      memoryUsageEstimate,
    };
  }

  /**
   * Clear all entries
   */
  clear(): void {
    this.store.clear();
    logger.info('Fallback rate limiter cleared');
  }

  /**
   * Destroy the rate limiter (stop cleanup interval)
   */
  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
    this.store.clear();
  }
}

// ============================================
// Singleton Instance
// ============================================

/**
 * Singleton fallback rate limiter instance
 */
export const fallbackRateLimiter = new InMemoryRateLimiter(60000);

export default InMemoryRateLimiter;
