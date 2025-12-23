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
    }
  }
}

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

// ============================================
// Authentication Middlewares
// ============================================

/**
 * Authenticate user with JWT token
 * Requires valid Bearer token in Authorization header
 */
export function authenticateJWT(req: Request, res: Response, next: NextFunction): void {
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

  // Fetch user asynchronously
  getUser(payload.userId)
    .then((user) => {
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
      next();
    })
    .catch((error) => {
      logger.error('Error fetching user', { error: error.message, userId: payload.userId });
      res.status(500).json({
        success: false,
        error: {
          code: ERROR_CODES.INTERNAL_ERROR,
          message: ERROR_MESSAGES.INTERNAL_ERROR,
        },
      });
    });
}

/**
 * Authenticate with API key
 * Requires valid API key in X-API-Key header
 */
export function authenticateApiKeyMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): void {
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

  // Get client IP and origin
  const clientIp = req.ip || req.socket.remoteAddress || '';
  const origin = req.headers.origin || req.headers.referer || '';

  authenticateApiKey(apiKey, clientIp, origin)
    .then(({ apiKey: key, user }) => {
      req.apiKey = key;
      req.user = user;
      req.userId = user._id;
      next();
    })
    .catch((error) => {
      logger.warn('API key authentication failed', { error: error.message, ip: clientIp });

      // Determine appropriate error code
      let statusCode = 401;
      let errorCode: string = ERROR_CODES.UNAUTHORIZED;
      let errorMessage = ERROR_MESSAGES.INVALID_API_KEY;

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

      res.status(statusCode).json({
        success: false,
        error: {
          code: errorCode,
          message: errorMessage,
        },
      });
    });
}

/**
 * Authenticate with either JWT or API key
 * Tries JWT first, then API key
 */
export function authenticateAny(req: Request, res: Response, next: NextFunction): void {
  const token = extractBearerToken(req.headers.authorization);
  const apiKeyHeader = req.headers['x-api-key'] as string | undefined;
  const apiKey = extractApiKey(apiKeyHeader);

  // Try JWT first
  if (token) {
    authenticateJWT(req, res, next);
    return;
  }

  // Try API key
  if (apiKey) {
    authenticateApiKeyMiddleware(req, res, next);
    return;
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
 */
export function optionalAuth(req: Request, _res: Response, next: NextFunction): void {
  const token = extractBearerToken(req.headers.authorization);
  const apiKeyHeader = req.headers['x-api-key'] as string | undefined;
  const apiKey = extractApiKey(apiKeyHeader);

  // If no auth, just continue
  if (!token && !apiKey) {
    next();
    return;
  }

  // Try to authenticate but don't fail if it doesn't work
  if (token) {
    const payload = verifyAccessToken(token);
    if (payload) {
      req.tokenPayload = payload;
      req.userId = new Types.ObjectId(payload.userId);
      getUser(payload.userId)
        .then((user) => {
          if (user && user.isActive) {
            req.user = user;
          }
          next();
        })
        .catch(() => {
          next();
        });
      return;
    }
  }

  if (apiKey) {
    const clientIp = req.ip || req.socket.remoteAddress || '';
    const origin = req.headers.origin || req.headers.referer || '';

    authenticateApiKey(apiKey, clientIp, origin)
      .then(({ apiKey: key, user }) => {
        req.apiKey = key;
        req.user = user;
        req.userId = user._id;
        next();
      })
      .catch(() => {
        next();
      });
    return;
  }

  next();
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
