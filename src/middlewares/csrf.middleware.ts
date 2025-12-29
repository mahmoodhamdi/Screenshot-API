/**
 * CSRF Protection Middleware
 * Uses Double Submit Cookie pattern (stateless, no session required)
 *
 * How it works:
 * 1. Server sets a random token in a cookie (csrf-token)
 * 2. Client must send the same token in request body/header (_csrf or x-csrf-token)
 * 3. Server compares both values - they must match
 */

import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import { AppError } from './error.middleware';

// ============================================
// Configuration
// ============================================

const CSRF_CONFIG = {
  cookieName: '_csrf',
  headerName: 'x-csrf-token',
  bodyField: '_csrf',
  tokenLength: 32,
  cookieOptions: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict' as const,
    maxAge: 3600000, // 1 hour
    path: '/',
  },
};

// ============================================
// Token Generation
// ============================================

/**
 * Generate a cryptographically secure random token
 */
function generateToken(): string {
  return crypto.randomBytes(CSRF_CONFIG.tokenLength).toString('hex');
}

/**
 * Timing-safe comparison of two tokens
 */
function tokensMatch(a: string | undefined, b: string | undefined): boolean {
  if (!a || !b) return false;
  if (a.length !== b.length) return false;

  try {
    return crypto.timingSafeEqual(Buffer.from(a), Buffer.from(b));
  } catch {
    return false;
  }
}

// ============================================
// Middleware Functions
// ============================================

/**
 * Set CSRF token cookie and add token getter to request
 * This should be applied to all routes that render forms
 */
export function csrfToken(req: Request, res: Response, next: NextFunction): void {
  // Check if we already have a token in cookies
  let token = req.cookies?.[CSRF_CONFIG.cookieName];

  // Generate new token if not exists
  if (!token) {
    token = generateToken();
    res.cookie(CSRF_CONFIG.cookieName, token, CSRF_CONFIG.cookieOptions);
  }

  // Add csrfToken function to request (for use in templates)
  req.csrfToken = (): string => token;

  // Also add to res.locals for easy template access
  res.locals.csrfToken = token;

  next();
}

/**
 * Verify CSRF token on state-changing requests (POST, PUT, PATCH, DELETE)
 */
export function csrfProtection(req: Request, _res: Response, next: NextFunction): void {
  // Only check on state-changing methods
  const safeMethods = ['GET', 'HEAD', 'OPTIONS'];
  if (safeMethods.includes(req.method)) {
    return next();
  }

  // Get token from cookie
  const cookieToken = req.cookies?.[CSRF_CONFIG.cookieName];

  // Get token from request (header or body)
  const requestToken =
    (req.headers[CSRF_CONFIG.headerName] as string) || req.body?.[CSRF_CONFIG.bodyField];

  // Compare tokens
  if (!tokensMatch(cookieToken, requestToken)) {
    throw new AppError('Invalid or missing CSRF token', 403, 'CSRF_ERROR');
  }

  next();
}

/**
 * Conditionally apply CSRF protection
 * Skip for API routes (they use Authorization header or X-API-Key)
 */
export function conditionalCsrf(req: Request, res: Response, next: NextFunction): void {
  // Paths that should skip CSRF protection
  const skipPaths = [
    '/api/', // All API routes (use JWT/API key)
    '/health', // Health check
    '/docs', // Swagger docs
    '/redoc', // ReDoc
    '/api-docs', // API docs page
    '/developer', // Developer portal
  ];

  // Check if path should skip CSRF
  const shouldSkip = skipPaths.some((path) => req.path.startsWith(path));

  if (shouldSkip) {
    return next();
  }

  // Apply CSRF protection for browser routes
  csrfProtection(req, res, next);
}

/**
 * CSRF error handler middleware
 * Converts CSRF errors to proper error responses
 */
export function csrfErrorHandler(
  err: Error & { code?: string },
  _req: Request,
  res: Response,
  next: NextFunction
): void {
  if (err.code === 'CSRF_ERROR' || err.message === 'Invalid or missing CSRF token') {
    res.status(403).json({
      success: false,
      error: {
        code: 'CSRF_ERROR',
        message: 'Invalid or missing CSRF token. Please refresh the page and try again.',
      },
    });
    return;
  }
  next(err);
}

// ============================================
// Type Extension
// ============================================

declare global {
  namespace Express {
    interface Request {
      csrfToken?: () => string;
    }
  }
}

// ============================================
// Export
// ============================================

export default {
  csrfToken,
  csrfProtection,
  conditionalCsrf,
  csrfErrorHandler,
};
