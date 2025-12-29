/**
 * Authentication Middleware
 * Handles JWT and API key authentication
 */

import { Request, Response, NextFunction } from 'express';
import { Types } from 'mongoose';
import { IUser, IApiKey, UserRole } from '@/types';
import { verifyAccessToken, authenticateApiKey, TokenPayload } from '@services/auth.service';
import User from '@models/user.model';
import { cache } from '@config/redis';
import logger from '@utils/logger';
import { ERROR_CODES, ERROR_MESSAGES } from '@utils/constants';

// ============================================
// Extend Express Types
// ============================================

declare global {
  namespace Express {
    interface Request {
      user?: IUser;
      apiKey?: IApiKey;
      tokenPayload?: TokenPayload;
      userId?: Types.ObjectId;
      closed?: boolean;
    }
  }
}

// ============================================
// Constants
// ============================================

const USER_LOOKUP_TIMEOUT_MS = 5000;
const API_KEY_VALIDATION_TIMEOUT_MS = 5000;

// ============================================
// Helper Functions
// ============================================

/**
 * Extract bearer token from authorization header
 * @param authHeader - Authorization header
 * @returns Token or null
 */
function extractBearerToken(authHeader?: string): string | null {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  return authHeader.slice(7);
}

/**
 * Extract API key from header
 * @param apiKeyHeader - X-API-Key header
 * @returns API key or null
 */
function extractApiKey(apiKeyHeader?: string): string | null {
  if (!apiKeyHeader) {
    return null;
  }
  return apiKeyHeader;
}

/**
 * Get user from cache or database
 * @param userId - User ID
 * @returns User or null
 */
async function getUser(userId: string): Promise<IUser | null> {
  // Try cache first
  const cacheKey = `user:${userId}`;
  const cached = await cache.get<IUser>(cacheKey);
  if (cached) {
    return cached;
  }

  // Get from database
  const user = await User.findById(userId);
  if (user) {
    // Cache for 5 minutes
    await cache.set(cacheKey, user, 300);
  }

  return user;
}

/**
 * Get user with timeout protection
 * Prevents hanging requests when database is slow
 * @param userId - User ID
 * @param timeoutMs - Timeout in milliseconds
 * @returns User or null
 * @throws Error on timeout
 */
async function getUserWithTimeout(
  userId: string,
  timeoutMs = USER_LOOKUP_TIMEOUT_MS
): Promise<IUser | null> {
  let timeoutId: NodeJS.Timeout;

  const timeoutPromise = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => reject(new Error('User lookup timeout')), timeoutMs);
  });

  try {
    const result = await Promise.race([getUser(userId), timeoutPromise]);
    clearTimeout(timeoutId!);
    return result;
  } catch (error) {
    clearTimeout(timeoutId!);
    throw error;
  }
}

/**
 * Create a safe next() wrapper that prevents multiple calls
 * @param next - Express NextFunction
 * @param context - Context for logging (e.g., middleware name)
 * @returns Wrapped next function
 */
function createSafeNext(next: NextFunction, context: string): (err?: Error | unknown) => void {
  let called = false;
  return (err?: Error | unknown): void => {
    if (called) {
      logger.warn(`next() called multiple times in ${context}`);
      return;
    }
    called = true;
    if (err) {
      next(err);
    } else {
      next();
    }
  };
}

// ============================================
// Authentication Middlewares
// ============================================

/**
 * Authenticate user with JWT token
 * Requires valid Bearer token in Authorization header
 *
 * Fixed for race conditions:
 * - Uses async/await pattern with proper error handling
 * - Prevents multiple next() calls
 * - Adds timeout protection for user lookup
 * - Handles client disconnection
 */
export async function authenticateJWT(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const safeNext = createSafeNext(next, 'authenticateJWT');

  try {
    const token = extractBearerToken(req.headers.authorization);

    if (!token) {
      res.status(401).json({
        success: false,
        error: {
          code: ERROR_CODES.UNAUTHORIZED,
          message: ERROR_MESSAGES.MISSING_TOKEN,
        },
      });
      return;
    }

    const payload = verifyAccessToken(token);
    if (!payload) {
      res.status(401).json({
        success: false,
        error: {
          code: ERROR_CODES.UNAUTHORIZED,
          message: ERROR_MESSAGES.INVALID_TOKEN,
        },
      });
      return;
    }

    // Store payload in request
    req.tokenPayload = payload;
    req.userId = new Types.ObjectId(payload.userId);

    // Check if client disconnected before async operation
    if (req.closed) {
      return;
    }

    // Fetch user with timeout protection
    let user: IUser | null;
    try {
      user = await getUserWithTimeout(payload.userId);
    } catch (error) {
      if (error instanceof Error && error.message === 'User lookup timeout') {
        logger.warn('User lookup timed out', { userId: payload.userId });
        res.status(503).json({
          success: false,
          error: {
            code: 'SERVICE_UNAVAILABLE',
            message: 'Authentication service temporarily unavailable',
          },
        });
        return;
      }
      throw error;
    }

    // Check again after async operation
    if (req.closed) {
      return;
    }

    if (!user) {
      res.status(401).json({
        success: false,
        error: {
          code: ERROR_CODES.UNAUTHORIZED,
          message: ERROR_MESSAGES.USER_NOT_FOUND,
        },
      });
      return;
    }

    if (!user.isActive) {
      res.status(403).json({
        success: false,
        error: {
          code: ERROR_CODES.FORBIDDEN,
          message: ERROR_MESSAGES.ACCOUNT_DISABLED,
        },
      });
      return;
    }

    req.user = user;
    safeNext();
  } catch (error) {
    logger.error('JWT authentication error', {
      error: error instanceof Error ? error.message : 'Unknown error',
      path: req.path,
    });
    res.status(500).json({
      success: false,
      error: {
        code: ERROR_CODES.INTERNAL_ERROR,
        message: ERROR_MESSAGES.INTERNAL_ERROR,
      },
    });
  }
}

/**
 * Authenticate with API key
 * Requires valid API key in X-API-Key header
 *
 * Fixed for race conditions:
 * - Uses async/await pattern with proper error handling
 * - Prevents multiple next() calls
 * - Adds timeout protection for API key validation
 * - Handles client disconnection
 */
export async function authenticateApiKeyMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const safeNext = createSafeNext(next, 'authenticateApiKeyMiddleware');

  try {
    const apiKeyHeader = req.headers['x-api-key'] as string | undefined;
    const apiKey = extractApiKey(apiKeyHeader);

    if (!apiKey) {
      res.status(401).json({
        success: false,
        error: {
          code: ERROR_CODES.UNAUTHORIZED,
          message: ERROR_MESSAGES.MISSING_API_KEY,
        },
      });
      return;
    }

    // Check if client disconnected before async operation
    if (req.closed) {
      return;
    }

    // Get client IP and origin
    const clientIp = req.ip || req.socket.remoteAddress || '';
    const origin = req.headers.origin || req.headers.referer || '';

    // Validate API key with timeout protection
    let timeoutId: NodeJS.Timeout;
    const timeoutPromise = new Promise<never>((_, reject) => {
      timeoutId = setTimeout(
        () => reject(new Error('API key validation timeout')),
        API_KEY_VALIDATION_TIMEOUT_MS
      );
    });

    let result: { apiKey: IApiKey; user: IUser };
    try {
      result = await Promise.race([authenticateApiKey(apiKey, clientIp, origin), timeoutPromise]);
      clearTimeout(timeoutId!);
    } catch (error) {
      clearTimeout(timeoutId!);
      if (error instanceof Error && error.message === 'API key validation timeout') {
        logger.warn('API key validation timed out', { ip: clientIp });
        res.status(503).json({
          success: false,
          error: {
            code: 'SERVICE_UNAVAILABLE',
            message: 'Authentication service temporarily unavailable',
          },
        });
        return;
      }
      throw error;
    }

    // Check again after async operation
    if (req.closed) {
      return;
    }

    req.apiKey = result.apiKey;
    req.user = result.user;
    req.userId = result.user._id;
    safeNext();
  } catch (error) {
    const clientIp = req.ip || req.socket.remoteAddress || '';
    logger.warn('API key authentication failed', {
      error: error instanceof Error ? error.message : 'Unknown error',
      ip: clientIp,
    });

    // Determine appropriate error code
    let statusCode = 401;
    let errorCode: string = ERROR_CODES.UNAUTHORIZED;
    let errorMessage = ERROR_MESSAGES.INVALID_API_KEY;

    if (error instanceof Error) {
      if (error.message.includes('IP address')) {
        statusCode = 403;
        errorCode = ERROR_CODES.FORBIDDEN;
        errorMessage = 'IP address not allowed for this API key';
      } else if (error.message.includes('Domain')) {
        statusCode = 403;
        errorCode = ERROR_CODES.FORBIDDEN;
        errorMessage = 'Domain not allowed for this API key';
      } else if (error.message.includes('expired')) {
        errorMessage = 'API key has expired';
      } else if (error.message.includes('disabled')) {
        statusCode = 403;
        errorCode = ERROR_CODES.FORBIDDEN;
        errorMessage = 'User account is disabled';
      }
    }

    res.status(statusCode).json({
      success: false,
      error: {
        code: errorCode,
        message: errorMessage,
      },
    });
  }
}

/**
 * Authenticate with either JWT or API key
 * Tries JWT first, then API key
 *
 * Fixed for race conditions:
 * - Delegates to already-fixed auth functions
 * - Uses async/await pattern
 */
export async function authenticateAny(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const token = extractBearerToken(req.headers.authorization);
  const apiKeyHeader = req.headers['x-api-key'] as string | undefined;
  const apiKey = extractApiKey(apiKeyHeader);

  // Try JWT first
  if (token) {
    return authenticateJWT(req, res, next);
  }

  // Try API key
  if (apiKey) {
    return authenticateApiKeyMiddleware(req, res, next);
  }

  // No authentication provided
  res.status(401).json({
    success: false,
    error: {
      code: ERROR_CODES.UNAUTHORIZED,
      message: ERROR_MESSAGES.MISSING_AUTHENTICATION,
    },
  });
}

/**
 * Optional authentication - doesn't fail if no auth provided
 * Useful for endpoints that behave differently for authenticated users
 *
 * Fixed for race conditions:
 * - Uses async/await pattern with proper error handling
 * - Prevents multiple next() calls
 * - Adds timeout protection
 * - Handles client disconnection
 */
export async function optionalAuth(
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> {
  const safeNext = createSafeNext(next, 'optionalAuth');

  const token = extractBearerToken(req.headers.authorization);
  const apiKeyHeader = req.headers['x-api-key'] as string | undefined;
  const apiKey = extractApiKey(apiKeyHeader);

  // If no auth, just continue
  if (!token && !apiKey) {
    safeNext();
    return;
  }

  // Check if client disconnected
  if (req.closed) {
    return;
  }

  // Try to authenticate but don't fail if it doesn't work
  if (token) {
    const payload = verifyAccessToken(token);
    if (payload) {
      req.tokenPayload = payload;
      req.userId = new Types.ObjectId(payload.userId);

      try {
        const user = await getUserWithTimeout(payload.userId);
        if (req.closed) return;
        if (user && user.isActive) {
          req.user = user;
        }
      } catch {
        // Silently ignore errors in optional auth
      }

      safeNext();
      return;
    }
  }

  if (apiKey) {
    const clientIp = req.ip || req.socket.remoteAddress || '';
    const origin = req.headers.origin || req.headers.referer || '';

    let timeoutId: NodeJS.Timeout;
    try {
      const timeoutPromise = new Promise<never>((_, reject) => {
        timeoutId = setTimeout(
          () => reject(new Error('API key validation timeout')),
          API_KEY_VALIDATION_TIMEOUT_MS
        );
      });

      const result = await Promise.race([
        authenticateApiKey(apiKey, clientIp, origin),
        timeoutPromise,
      ]);
      clearTimeout(timeoutId!);

      if (req.closed) return;

      req.apiKey = result.apiKey;
      req.user = result.user;
      req.userId = result.user._id;
    } catch {
      clearTimeout(timeoutId!);
      // Silently ignore errors in optional auth
    }

    safeNext();
    return;
  }

  safeNext();
}

// ============================================
// Authorization Middlewares
// ============================================

/**
 * Require specific role(s)
 * @param roles - Required roles (any of them)
 */
export function requireRole(...roles: UserRole[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: {
          code: ERROR_CODES.UNAUTHORIZED,
          message: ERROR_MESSAGES.MISSING_AUTHENTICATION,
        },
      });
      return;
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        error: {
          code: ERROR_CODES.FORBIDDEN,
          message: ERROR_MESSAGES.INSUFFICIENT_PERMISSIONS,
        },
      });
      return;
    }

    next();
  };
}

/**
 * Require admin role
 */
export const requireAdmin = requireRole('admin');

/**
 * Require verified email
 */
export function requireVerified(req: Request, res: Response, next: NextFunction): void {
  if (!req.user) {
    res.status(401).json({
      success: false,
      error: {
        code: ERROR_CODES.UNAUTHORIZED,
        message: ERROR_MESSAGES.MISSING_AUTHENTICATION,
      },
    });
    return;
  }

  if (!req.user.isVerified) {
    res.status(403).json({
      success: false,
      error: {
        code: ERROR_CODES.FORBIDDEN,
        message: ERROR_MESSAGES.EMAIL_NOT_VERIFIED,
      },
    });
    return;
  }

  next();
}

/**
 * Require API key permission
 * @param permission - Required permission
 */
export function requirePermission(permission: string) {
  return (req: Request, res: Response, next: NextFunction): void => {
    // If authenticated via JWT, allow (full access)
    if (req.tokenPayload && !req.apiKey) {
      next();
      return;
    }

    // If authenticated via API key, check permission
    if (!req.apiKey) {
      res.status(401).json({
        success: false,
        error: {
          code: ERROR_CODES.UNAUTHORIZED,
          message: ERROR_MESSAGES.MISSING_AUTHENTICATION,
        },
      });
      return;
    }

    const apiKey = req.apiKey as IApiKey & {
      hasPermission: (permission: string) => boolean;
    };

    if (!apiKey.hasPermission(permission)) {
      res.status(403).json({
        success: false,
        error: {
          code: ERROR_CODES.FORBIDDEN,
          message: `Permission '${permission}' is required`,
        },
      });
      return;
    }

    next();
  };
}

// ============================================
// Export
// ============================================

export default {
  authenticateJWT,
  authenticateApiKeyMiddleware,
  authenticateAny,
  optionalAuth,
  requireRole,
  requireAdmin,
  requireVerified,
  requirePermission,
};
