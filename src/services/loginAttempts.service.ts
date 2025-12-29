/**
 * Login Attempts Service
 * Tracks failed login attempts and implements account lockout
 */

import { redis } from '@config/redis';
import logger from '@utils/logger';

// ============================================
// Configuration
// ============================================

const LOCKOUT_CONFIG = {
  maxAttempts: parseInt(process.env.AUTH_MAX_ATTEMPTS || '5', 10),
  lockoutDuration: parseInt(process.env.AUTH_LOCKOUT_DURATION || '900000', 10), // 15 minutes
  attemptWindow: parseInt(process.env.AUTH_ATTEMPT_WINDOW || '3600000', 10), // 1 hour
};

// Redis key prefixes
const ATTEMPT_KEY_PREFIX = 'login:attempts:';
const LOCKOUT_KEY_PREFIX = 'login:lockout:';

// ============================================
// Types
// ============================================

export interface LoginAttemptInfo {
  count: number;
  isLocked: boolean;
  remainingAttempts: number;
  lockedUntil: Date | null;
}

// ============================================
// Helper Functions
// ============================================

/**
 * Get Redis key for attempts
 */
function getAttemptKey(identifier: string): string {
  return `${ATTEMPT_KEY_PREFIX}${identifier}`;
}

/**
 * Get Redis key for lockout
 */
function getLockoutKey(identifier: string): string {
  return `${LOCKOUT_KEY_PREFIX}${identifier}`;
}

/**
 * Create identifier from email and IP
 * Uses both to prevent:
 * - Single IP attacking multiple accounts
 * - Single account attacked from multiple IPs
 */
export function createIdentifier(email: string, ip: string): string {
  return `${email.toLowerCase()}:${ip}`;
}

// ============================================
// Core Functions
// ============================================

/**
 * Record a failed login attempt
 * @param identifier - Unique identifier (email:ip)
 * @returns Updated attempt info
 */
export async function recordFailedAttempt(identifier: string): Promise<LoginAttemptInfo> {
  const attemptKey = getAttemptKey(identifier);
  const lockoutKey = getLockoutKey(identifier);

  try {
    // Increment attempt count
    const count = await redis.incr(attemptKey);

    // Set expiry on first attempt
    if (count === 1) {
      await redis.expire(attemptKey, Math.ceil(LOCKOUT_CONFIG.attemptWindow / 1000));
    }

    const remainingAttempts = Math.max(0, LOCKOUT_CONFIG.maxAttempts - count);

    // Check if should lock out
    if (count >= LOCKOUT_CONFIG.maxAttempts) {
      const lockoutExpiry = Date.now() + LOCKOUT_CONFIG.lockoutDuration;
      await redis.setex(
        lockoutKey,
        Math.ceil(LOCKOUT_CONFIG.lockoutDuration / 1000),
        lockoutExpiry.toString()
      );

      logger.warn('Account locked due to failed attempts', {
        identifier: identifier.split(':')[0], // Log only email part
        attempts: count,
        lockedUntil: new Date(lockoutExpiry).toISOString(),
      });

      return {
        count,
        isLocked: true,
        remainingAttempts: 0,
        lockedUntil: new Date(lockoutExpiry),
      };
    }

    logger.debug('Failed login attempt recorded', {
      identifier: identifier.split(':')[0],
      attempts: count,
      remainingAttempts,
    });

    return {
      count,
      isLocked: false,
      remainingAttempts,
      lockedUntil: null,
    };
  } catch (error) {
    logger.error('Failed to record login attempt', { error, identifier: identifier.split(':')[0] });
    // On Redis error, allow the request but don't track
    return {
      count: 0,
      isLocked: false,
      remainingAttempts: LOCKOUT_CONFIG.maxAttempts,
      lockedUntil: null,
    };
  }
}

/**
 * Record a successful login (clears attempts)
 * @param identifier - Unique identifier (email:ip)
 */
export async function recordSuccessfulLogin(identifier: string): Promise<void> {
  const attemptKey = getAttemptKey(identifier);
  const lockoutKey = getLockoutKey(identifier);

  try {
    await redis.del(attemptKey, lockoutKey);
    logger.debug('Login attempts cleared on successful login', {
      identifier: identifier.split(':')[0],
    });
  } catch (error) {
    logger.error('Failed to clear login attempts', { error, identifier: identifier.split(':')[0] });
  }
}

/**
 * Check if an identifier is locked out
 * @param identifier - Unique identifier (email:ip)
 * @returns True if locked out
 */
export async function isLocked(identifier: string): Promise<boolean> {
  const lockoutKey = getLockoutKey(identifier);

  try {
    const lockoutExpiry = await redis.get(lockoutKey);
    if (!lockoutExpiry) {
      return false;
    }

    const expiryTime = parseInt(lockoutExpiry, 10);
    if (Date.now() >= expiryTime) {
      // Lockout expired, clean up
      await redis.del(lockoutKey);
      return false;
    }

    return true;
  } catch (error) {
    logger.error('Failed to check lockout status', { error, identifier: identifier.split(':')[0] });
    // On Redis error, don't lock out
    return false;
  }
}

/**
 * Get remaining login attempts
 * @param identifier - Unique identifier (email:ip)
 * @returns Number of remaining attempts
 */
export async function getRemainingAttempts(identifier: string): Promise<number> {
  const attemptKey = getAttemptKey(identifier);

  try {
    const countStr = await redis.get(attemptKey);
    if (!countStr) {
      return LOCKOUT_CONFIG.maxAttempts;
    }

    const count = parseInt(countStr, 10);
    return Math.max(0, LOCKOUT_CONFIG.maxAttempts - count);
  } catch (error) {
    logger.error('Failed to get remaining attempts', {
      error,
      identifier: identifier.split(':')[0],
    });
    return LOCKOUT_CONFIG.maxAttempts;
  }
}

/**
 * Get lockout expiry time
 * @param identifier - Unique identifier (email:ip)
 * @returns Lockout expiry date or null if not locked
 */
export async function getLockoutExpiry(identifier: string): Promise<Date | null> {
  const lockoutKey = getLockoutKey(identifier);

  try {
    const lockoutExpiry = await redis.get(lockoutKey);
    if (!lockoutExpiry) {
      return null;
    }

    const expiryTime = parseInt(lockoutExpiry, 10);
    if (Date.now() >= expiryTime) {
      return null;
    }

    return new Date(expiryTime);
  } catch (error) {
    logger.error('Failed to get lockout expiry', { error, identifier: identifier.split(':')[0] });
    return null;
  }
}

/**
 * Get full login attempt info
 * @param identifier - Unique identifier (email:ip)
 * @returns Login attempt info
 */
export async function getAttemptInfo(identifier: string): Promise<LoginAttemptInfo> {
  const attemptKey = getAttemptKey(identifier);
  const lockoutKey = getLockoutKey(identifier);

  try {
    const [countStr, lockoutExpiry] = await Promise.all([
      redis.get(attemptKey),
      redis.get(lockoutKey),
    ]);

    const count = countStr ? parseInt(countStr, 10) : 0;
    let isLockedOut = false;
    let lockedUntil: Date | null = null;

    if (lockoutExpiry) {
      const expiryTime = parseInt(lockoutExpiry, 10);
      if (Date.now() < expiryTime) {
        isLockedOut = true;
        lockedUntil = new Date(expiryTime);
      }
    }

    return {
      count,
      isLocked: isLockedOut,
      remainingAttempts: isLockedOut ? 0 : Math.max(0, LOCKOUT_CONFIG.maxAttempts - count),
      lockedUntil,
    };
  } catch (error) {
    logger.error('Failed to get attempt info', { error, identifier: identifier.split(':')[0] });
    return {
      count: 0,
      isLocked: false,
      remainingAttempts: LOCKOUT_CONFIG.maxAttempts,
      lockedUntil: null,
    };
  }
}

/**
 * Manually unlock an identifier (admin function)
 * @param identifier - Unique identifier (email:ip)
 */
export async function unlock(identifier: string): Promise<void> {
  const attemptKey = getAttemptKey(identifier);
  const lockoutKey = getLockoutKey(identifier);

  try {
    await redis.del(attemptKey, lockoutKey);
    logger.info('Account manually unlocked', { identifier: identifier.split(':')[0] });
  } catch (error) {
    logger.error('Failed to unlock account', { error, identifier: identifier.split(':')[0] });
    throw error;
  }
}

/**
 * Get lockout configuration
 */
export function getConfig(): typeof LOCKOUT_CONFIG {
  return { ...LOCKOUT_CONFIG };
}

// ============================================
// Export
// ============================================

export const loginAttemptsService = {
  createIdentifier,
  recordFailedAttempt,
  recordSuccessfulLogin,
  isLocked,
  getRemainingAttempts,
  getLockoutExpiry,
  getAttemptInfo,
  unlock,
  getConfig,
};

export default loginAttemptsService;
