/**
 * Authentication Service
 * Handles user authentication, JWT tokens, and session management
 */

import jwt, { JwtPayload } from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { Types } from 'mongoose';
import User from '@models/user.model';
import ApiKey from '@models/apiKey.model';
import { IUser, IApiKey, UserRole } from '@/types';
import { config } from '@config/index';
import { cache, invalidateCache } from '@config/redis';
import logger from '@utils/logger';

// ============================================
// Types
// ============================================

export interface TokenPayload {
  userId: string;
  email: string;
  role: UserRole;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface AuthResult {
  user: IUser;
  tokens: TokenPair;
}

export interface ApiKeyAuthResult {
  apiKey: IApiKey;
  user: IUser;
}

// ============================================
// Token Generation
// ============================================

/**
 * Generate access token
 * @param payload - Token payload
 * @returns Access token
 */
export function generateAccessToken(payload: TokenPayload): string {
  return jwt.sign(payload, config.jwt.secret, {
    expiresIn: config.jwt.expiresIn as jwt.SignOptions['expiresIn'],
  });
}

/**
 * Generate refresh token
 * @param userId - User ID
 * @returns Refresh token
 */
export function generateRefreshToken(userId: string): string {
  const token = crypto.randomBytes(40).toString('hex');
  return jwt.sign({ userId, token }, config.jwt.refreshSecret, {
    expiresIn: config.jwt.refreshExpiresIn as jwt.SignOptions['expiresIn'],
  });
}

/**
 * Generate token pair (access + refresh)
 * @param user - User document
 * @returns Token pair
 */
export function generateTokenPair(user: IUser): TokenPair {
  const payload: TokenPayload = {
    userId: user._id.toString(),
    email: user.email,
    role: user.role,
  };

  const accessToken = generateAccessToken(payload);
  const refreshToken = generateRefreshToken(user._id.toString());

  // Parse expiresIn to seconds
  const expiresIn = parseExpiry(config.jwt.expiresIn);

  return { accessToken, refreshToken, expiresIn };
}

/**
 * Parse expiry string to seconds
 * @param expiry - Expiry string (e.g., "1h", "7d")
 * @returns Seconds
 */
function parseExpiry(expiry: string): number {
  const unit = expiry.slice(-1);
  const value = parseInt(expiry.slice(0, -1), 10);

  switch (unit) {
    case 's':
      return value;
    case 'm':
      return value * 60;
    case 'h':
      return value * 60 * 60;
    case 'd':
      return value * 60 * 60 * 24;
    default:
      return value;
  }
}

// ============================================
// Token Verification
// ============================================

/**
 * Verify access token
 * @param token - Access token
 * @returns Token payload or null
 */
export function verifyAccessToken(token: string): TokenPayload | null {
  try {
    const decoded = jwt.verify(token, config.jwt.secret) as TokenPayload & JwtPayload;
    return {
      userId: decoded.userId,
      email: decoded.email,
      role: decoded.role,
    };
  } catch {
    return null;
  }
}

/**
 * Verify refresh token
 * @param token - Refresh token
 * @returns User ID or null
 */
export function verifyRefreshToken(token: string): { userId: string; token: string } | null {
  try {
    const decoded = jwt.verify(token, config.jwt.refreshSecret) as JwtPayload;
    return {
      userId: decoded.userId as string,
      token: decoded.token as string,
    };
  } catch {
    return null;
  }
}

// ============================================
// User Authentication
// ============================================

/**
 * Register a new user
 * @param data - Registration data
 * @returns Auth result with user and tokens
 */
export async function registerUser(data: {
  email: string;
  password: string;
  name: string;
  company?: string;
}): Promise<AuthResult> {
  // Check if user already exists
  const existingUser = await User.findByEmail(data.email);
  if (existingUser) {
    throw new Error('Email already registered');
  }

  // Create user
  const user = await User.create({
    email: data.email,
    password: data.password,
    name: data.name,
    company: data.company,
  });

  // Generate tokens
  const tokens = generateTokenPair(user);

  // Store refresh token
  await storeRefreshToken(user._id, tokens.refreshToken);

  logger.info('User registered', { userId: user._id, email: user.email });

  return { user, tokens };
}

/**
 * Login user with email and password
 * @param email - User email
 * @param password - User password
 * @returns Auth result with user and tokens
 */
export async function loginUser(email: string, password: string): Promise<AuthResult> {
  // Find user with password (findByEmail already includes password field)
  const user = await User.findByEmail(email);
  if (!user) {
    throw new Error('Invalid credentials');
  }

  // Check if user is active
  if (!user.isActive) {
    throw new Error('Account is disabled');
  }

  // Verify password
  const isValidPassword = await user.comparePassword(password);
  if (!isValidPassword) {
    throw new Error('Invalid credentials');
  }

  // Generate tokens
  const tokens = generateTokenPair(user);

  // Store refresh token
  await storeRefreshToken(user._id, tokens.refreshToken);

  // Update last login
  user.lastLoginAt = new Date();
  await user.save();

  logger.info('User logged in', { userId: user._id, email: user.email });

  return { user, tokens };
}

/**
 * Logout user
 * @param userId - User ID
 * @param refreshToken - Refresh token to invalidate
 */
export async function logoutUser(userId: Types.ObjectId, refreshToken: string): Promise<void> {
  await removeRefreshToken(userId, refreshToken);
  logger.info('User logged out', { userId });
}

/**
 * Refresh access token using refresh token
 * @param refreshToken - Refresh token
 * @returns New token pair
 */
export async function refreshAccessToken(refreshToken: string): Promise<TokenPair> {
  // Verify refresh token
  const decoded = verifyRefreshToken(refreshToken);
  if (!decoded) {
    throw new Error('Invalid refresh token');
  }

  // Find user
  const user = await User.findById(decoded.userId);
  if (!user || !user.isActive) {
    throw new Error('Invalid refresh token');
  }

  // Check if refresh token is stored
  const isValidToken = await isRefreshTokenValid(user._id, refreshToken);
  if (!isValidToken) {
    throw new Error('Invalid refresh token');
  }

  // Remove old refresh token
  await removeRefreshToken(user._id, refreshToken);

  // Generate new tokens
  const tokens = generateTokenPair(user);

  // Store new refresh token
  await storeRefreshToken(user._id, tokens.refreshToken);

  logger.debug('Access token refreshed', { userId: user._id });

  return tokens;
}

// ============================================
// Refresh Token Management
// ============================================

/**
 * Store refresh token for user
 * @param userId - User ID
 * @param refreshToken - Refresh token
 */
async function storeRefreshToken(userId: Types.ObjectId, refreshToken: string): Promise<void> {
  const user = await User.findById(userId).select('+refreshTokens');
  if (!user) return;

  // Add token hash to user's refresh tokens
  const tokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');
  user.refreshTokens = user.refreshTokens || [];
  user.refreshTokens.push({
    token: tokenHash,
    expiresAt: new Date(Date.now() + parseExpiry(config.jwt.refreshExpiresIn) * 1000),
  });

  // Keep only last 5 refresh tokens
  if (user.refreshTokens.length > 5) {
    user.refreshTokens = user.refreshTokens.slice(-5);
  }

  await user.save();
}

/**
 * Check if refresh token is valid for user
 * @param userId - User ID
 * @param refreshToken - Refresh token
 * @returns True if valid
 */
async function isRefreshTokenValid(userId: Types.ObjectId, refreshToken: string): Promise<boolean> {
  const user = await User.findById(userId).select('+refreshTokens');
  if (!user || !user.refreshTokens) return false;

  const tokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');
  const now = new Date();

  return user.refreshTokens.some(
    (rt) => rt.token === tokenHash && rt.expiresAt > now
  );
}

/**
 * Remove refresh token for user
 * @param userId - User ID
 * @param refreshToken - Refresh token
 */
async function removeRefreshToken(userId: Types.ObjectId, refreshToken: string): Promise<void> {
  const user = await User.findById(userId).select('+refreshTokens');
  if (!user || !user.refreshTokens) return;

  const tokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');
  user.refreshTokens = user.refreshTokens.filter((rt) => rt.token !== tokenHash);
  await user.save();

  // Invalidate user cache
  await invalidateCache(`user:${userId}`);
}

/**
 * Remove all refresh tokens for user (logout everywhere)
 * @param userId - User ID
 */
export async function removeAllRefreshTokens(userId: Types.ObjectId): Promise<void> {
  const user = await User.findById(userId).select('+refreshTokens');
  if (!user) return;

  user.refreshTokens = [];
  await user.save();

  // Invalidate user cache
  await invalidateCache(`user:${userId}`);

  logger.info('All refresh tokens removed', { userId });
}

// ============================================
// API Key Authentication
// ============================================

/**
 * Authenticate request using API key
 * @param key - API key
 * @param ip - Client IP address
 * @param origin - Request origin
 * @returns API key and user if valid
 */
export async function authenticateApiKey(
  key: string,
  ip?: string,
  origin?: string
): Promise<ApiKeyAuthResult> {
  // Try to get from cache first
  const cacheKey = `apikey:${crypto.createHash('sha256').update(key).digest('hex')}`;
  const cached = await cache.get<ApiKeyAuthResult>(cacheKey);
  if (cached) {
    // Still validate IP and domain even if cached
    const apiKey = cached.apiKey as IApiKey & {
      isValid: () => boolean;
      isIpAllowed: (ip: string) => boolean;
      isDomainAllowed: (domain: string) => boolean;
    };

    if (ip && !apiKey.isIpAllowed(ip)) {
      throw new Error('IP address not allowed');
    }
    if (origin && !apiKey.isDomainAllowed(origin)) {
      throw new Error('Domain not allowed');
    }
    return cached;
  }

  // Find API key
  const apiKey = await ApiKey.findByKey(key);
  if (!apiKey) {
    throw new Error('Invalid API key');
  }

  // Check if key is valid
  const keyWithMethods = apiKey as IApiKey & {
    isValid: () => boolean;
    isIpAllowed: (ip: string) => boolean;
    isDomainAllowed: (domain: string) => boolean;
    recordUsage: () => Promise<void>;
  };

  if (!keyWithMethods.isValid()) {
    throw new Error('API key is expired or inactive');
  }

  // Check IP whitelist
  if (ip && !keyWithMethods.isIpAllowed(ip)) {
    throw new Error('IP address not allowed');
  }

  // Check domain whitelist
  if (origin && !keyWithMethods.isDomainAllowed(origin)) {
    throw new Error('Domain not allowed');
  }

  // Get user
  const user = await User.findById(apiKey.user);
  if (!user || !user.isActive) {
    throw new Error('User account is disabled');
  }

  // Record usage
  await keyWithMethods.recordUsage();

  const result = { apiKey, user };

  // Cache for 5 minutes (but not the methods)
  await cache.set(cacheKey, result, 300);

  return result;
}

/**
 * Create API key for user
 * @param userId - User ID
 * @param options - Key options
 * @returns Created API key and plain text key
 */
export async function createApiKey(
  userId: Types.ObjectId,
  options: {
    name: string;
    permissions?: string[];
    expiresAt?: Date;
    ipWhitelist?: string[];
    domainWhitelist?: string[];
    rateLimit?: number;
  }
): Promise<{ apiKey: IApiKey; plainTextKey: string }> {
  const result = await ApiKey.createForUser(userId, options);

  logger.info('API key created', { userId, keyName: options.name });

  return result;
}

/**
 * Revoke API key
 * @param keyId - API key ID
 * @param userId - User ID (for authorization)
 */
export async function revokeApiKey(keyId: Types.ObjectId, userId: Types.ObjectId): Promise<void> {
  const apiKey = await ApiKey.findOne({ _id: keyId, user: userId });
  if (!apiKey) {
    throw new Error('API key not found');
  }

  apiKey.isActive = false;
  await apiKey.save();

  // Invalidate cache
  await invalidateCache(`apikey:${apiKey.keyHash}`);

  logger.info('API key revoked', { keyId, userId });
}

// ============================================
// Password Management
// ============================================

/**
 * Hash password
 * @param password - Plain text password
 * @returns Hashed password
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

/**
 * Compare password
 * @param password - Plain text password
 * @param hash - Password hash
 * @returns True if match
 */
export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

/**
 * Change user password
 * @param userId - User ID
 * @param currentPassword - Current password
 * @param newPassword - New password
 */
export async function changePassword(
  userId: Types.ObjectId,
  currentPassword: string,
  newPassword: string
): Promise<void> {
  const user = await User.findById(userId).select('+password');
  if (!user) {
    throw new Error('User not found');
  }

  // Verify current password
  const isValid = await user.comparePassword(currentPassword);
  if (!isValid) {
    throw new Error('Current password is incorrect');
  }

  // Update password
  user.password = newPassword;
  await user.save();

  // Invalidate all refresh tokens
  await removeAllRefreshTokens(userId);

  logger.info('Password changed', { userId });
}

/**
 * Generate password reset token
 * @param email - User email
 * @returns Reset token (or null if user not found - don't reveal user existence)
 */
export async function generatePasswordResetToken(email: string): Promise<string | null> {
  const user = await User.findByEmail(email);
  if (!user) {
    return null;
  }

  // Generate reset token
  const resetToken = crypto.randomBytes(32).toString('hex');
  // In a full implementation, you'd store this hash in the user document
  // and use it to verify the reset token later
  const _resetTokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');
  void _resetTokenHash; // Silence unused variable warning

  // Store in user document (in a real app, you'd have a separate token field)
  // For now, we'll return the token directly
  // In production, you'd email this to the user

  logger.info('Password reset token generated', { userId: user._id });

  return resetToken;
}

// ============================================
// User Verification
// ============================================

/**
 * Generate email verification token
 * @param userId - User ID
 * @returns Verification token
 */
export async function generateVerificationToken(userId: Types.ObjectId): Promise<string> {
  const user = await User.findById(userId);
  if (!user) {
    throw new Error('User not found');
  }

  const token = crypto.randomBytes(32).toString('hex');
  user.verificationToken = crypto.createHash('sha256').update(token).digest('hex');
  await user.save();

  logger.info('Verification token generated', { userId });

  return token;
}

/**
 * Verify user email
 * @param token - Verification token
 * @returns True if verified
 */
export async function verifyEmail(token: string): Promise<boolean> {
  const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

  const user = await User.findOne({ verificationToken: tokenHash });
  if (!user) {
    return false;
  }

  user.isVerified = true;
  user.verificationToken = undefined;
  await user.save();

  logger.info('Email verified', { userId: user._id });

  return true;
}

// ============================================
// Export
// ============================================

export default {
  generateAccessToken,
  generateRefreshToken,
  generateTokenPair,
  verifyAccessToken,
  verifyRefreshToken,
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  removeAllRefreshTokens,
  authenticateApiKey,
  createApiKey,
  revokeApiKey,
  hashPassword,
  comparePassword,
  changePassword,
  generatePasswordResetToken,
  generateVerificationToken,
  verifyEmail,
};
