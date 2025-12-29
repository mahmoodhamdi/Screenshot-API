/**
 * IP Reputation Service
 * Tracks IP addresses that trigger multiple lockouts and marks them as suspicious
 */

import { redis } from '@config/redis';
import logger from '@utils/logger';

// ============================================
// Configuration
// ============================================

const IP_REPUTATION_CONFIG = {
  lockoutsToSuspicious: 3, // Number of lockouts to mark as suspicious
  suspiciousDuration: parseInt(process.env.SUSPICIOUS_IP_DURATION || '3600', 10), // 1 hour
  lockoutTrackingDuration: 86400, // 24 hours
};

// Redis key prefixes
const LOCKOUT_COUNT_PREFIX = 'ip:lockouts:';
const SUSPICIOUS_PREFIX = 'ip:suspicious:';

// ============================================
// Helper Functions
// ============================================

/**
 * Get Redis key for lockout count
 */
function getLockoutCountKey(ip: string): string {
  return `${LOCKOUT_COUNT_PREFIX}${ip}`;
}

/**
 * Get Redis key for suspicious status
 */
function getSuspiciousKey(ip: string): string {
  return `${SUSPICIOUS_PREFIX}${ip}`;
}

// ============================================
// Core Functions
// ============================================

/**
 * Record a lockout for an IP address
 * Marks IP as suspicious after threshold is reached
 * @param ip - IP address
 * @returns Current lockout count
 */
export async function recordLockout(ip: string): Promise<number> {
  const lockoutCountKey = getLockoutCountKey(ip);

  try {
    const count = await redis.incr(lockoutCountKey);

    // Set expiry on first increment
    if (count === 1) {
      await redis.expire(lockoutCountKey, IP_REPUTATION_CONFIG.lockoutTrackingDuration);
    }

    // Check if should mark as suspicious
    if (count >= IP_REPUTATION_CONFIG.lockoutsToSuspicious) {
      await markSuspicious(ip);
    }

    logger.debug('Lockout recorded for IP', { ip, count });
    return count;
  } catch (error) {
    logger.error('Failed to record lockout for IP', { error, ip });
    return 0;
  }
}

/**
 * Mark an IP address as suspicious
 * @param ip - IP address
 */
export async function markSuspicious(ip: string): Promise<void> {
  const suspiciousKey = getSuspiciousKey(ip);

  try {
    await redis.setex(suspiciousKey, IP_REPUTATION_CONFIG.suspiciousDuration, '1');
    logger.warn('IP marked as suspicious', { ip });
  } catch (error) {
    logger.error('Failed to mark IP as suspicious', { error, ip });
  }
}

/**
 * Check if an IP is marked as suspicious
 * @param ip - IP address
 * @returns True if suspicious
 */
export async function isSuspicious(ip: string): Promise<boolean> {
  const suspiciousKey = getSuspiciousKey(ip);

  try {
    const exists = await redis.exists(suspiciousKey);
    return exists === 1;
  } catch (error) {
    logger.error('Failed to check if IP is suspicious', { error, ip });
    return false;
  }
}

/**
 * Get the lockout count for an IP
 * @param ip - IP address
 * @returns Lockout count
 */
export async function getLockoutCount(ip: string): Promise<number> {
  const lockoutCountKey = getLockoutCountKey(ip);

  try {
    const countStr = await redis.get(lockoutCountKey);
    return countStr ? parseInt(countStr, 10) : 0;
  } catch (error) {
    logger.error('Failed to get lockout count for IP', { error, ip });
    return 0;
  }
}

/**
 * Clear reputation for an IP (admin function)
 * @param ip - IP address
 */
export async function clearReputation(ip: string): Promise<void> {
  const lockoutCountKey = getLockoutCountKey(ip);
  const suspiciousKey = getSuspiciousKey(ip);

  try {
    await redis.del(lockoutCountKey, suspiciousKey);
    logger.info('IP reputation cleared', { ip });
  } catch (error) {
    logger.error('Failed to clear IP reputation', { error, ip });
    throw error;
  }
}

/**
 * Get full IP reputation info
 * @param ip - IP address
 */
export async function getReputationInfo(ip: string): Promise<{
  isSuspicious: boolean;
  lockoutCount: number;
  suspiciousUntil: Date | null;
}> {
  try {
    const [suspicious, lockoutCount] = await Promise.all([isSuspicious(ip), getLockoutCount(ip)]);

    let suspiciousUntil: Date | null = null;
    if (suspicious) {
      // Get TTL for suspicious key
      const suspiciousKey = getSuspiciousKey(ip);
      const ttl = await redis.ttl(suspiciousKey);
      if (ttl > 0) {
        suspiciousUntil = new Date(Date.now() + ttl * 1000);
      }
    }

    return {
      isSuspicious: suspicious,
      lockoutCount,
      suspiciousUntil,
    };
  } catch (error) {
    logger.error('Failed to get reputation info for IP', { error, ip });
    return {
      isSuspicious: false,
      lockoutCount: 0,
      suspiciousUntil: null,
    };
  }
}

/**
 * Get configuration
 */
export function getConfig(): typeof IP_REPUTATION_CONFIG {
  return { ...IP_REPUTATION_CONFIG };
}

// ============================================
// Export
// ============================================

export const ipReputationService = {
  recordLockout,
  markSuspicious,
  isSuspicious,
  getLockoutCount,
  clearReputation,
  getReputationInfo,
  getConfig,
};

export default ipReputationService;
