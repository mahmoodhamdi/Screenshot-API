/**
 * Screenshot API - TypeScript Type Definitions
 * This file contains all the shared types and interfaces used across the application.
 */

import { Request } from 'express';
import { Document, Types } from 'mongoose';

// ============================================
// Plan Types
// ============================================

export type PlanType = 'free' | 'starter' | 'professional' | 'enterprise';
export type SubscriptionStatus = 'active' | 'cancelled' | 'expired' | 'past_due';
export type ScreenshotFormat = 'png' | 'jpeg' | 'webp' | 'pdf';
export type ScreenshotStatus = 'pending' | 'processing' | 'completed' | 'failed';
export type UserRole = 'user' | 'admin';

// ============================================
// Plan Limits Interface
// ============================================

export interface PlanLimits {
  screenshotsPerMonth: number;
  maxWidth: number;
  maxHeight: number;
  formats: ScreenshotFormat[];
  rateLimit: number;
  fullPage: boolean;
  customHeaders: boolean;
  webhooks: boolean;
  priority: boolean;
}

export interface PlanLimitsConfig {
  free: PlanLimits;
  starter: PlanLimits;
  professional: PlanLimits;
  enterprise: PlanLimits;
}

// ============================================
// User Interfaces
// ============================================

export interface IUserSubscription {
  plan: PlanType;
  status: SubscriptionStatus;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  currentPeriodStart?: Date;
  currentPeriodEnd?: Date;
}

export interface IUserUsage {
  screenshotsThisMonth: number;
  lastResetDate: Date;
}

export interface IRefreshToken {
  token: string;
  expiresAt: Date;
}

export interface IUser extends Document {
  _id: Types.ObjectId;
  email: string;
  password: string;
  name: string;
  company?: string;
  isVerified: boolean;
  isActive: boolean;
  role: UserRole;
  subscription: IUserSubscription;
  usage: IUserUsage;
  refreshTokens: IRefreshToken[];
  verificationToken?: string;
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
  incrementUsage(): Promise<void>;
  resetMonthlyUsage(): Promise<void>;
  getPlanLimits(): PlanLimits;
}

// ============================================
// API Key Interfaces
// ============================================

export interface IApiKey extends Document {
  _id: Types.ObjectId;
  key: string;
  keyHash: string;
  name: string;
  user: Types.ObjectId | IUser;
  permissions: string[];
  isActive: boolean;
  lastUsedAt?: Date;
  expiresAt?: Date;
  ipWhitelist: string[];
  domainWhitelist: string[];
  rateLimit?: number;
  usageCount: number;
  createdAt: Date;
  updatedAt: Date;
}

// ============================================
// Screenshot Interfaces
// ============================================

export interface ScreenshotCookie {
  name: string;
  value: string;
  domain?: string;
  path?: string;
  expires?: number;
  httpOnly?: boolean;
  secure?: boolean;
  sameSite?: 'Strict' | 'Lax' | 'None';
}

export interface ScreenshotClipRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface IScreenshotOptions {
  width: number;
  height: number;
  fullPage: boolean;
  format: ScreenshotFormat;
  quality: number;
  delay: number;
  selector?: string;
  clipRect?: ScreenshotClipRect;
  headers?: Record<string, string>;
  cookies?: ScreenshotCookie[];
  userAgent?: string;
  darkMode: boolean;
  blockAds: boolean;
  blockTrackers: boolean;
  waitUntil: 'load' | 'domcontentloaded' | 'networkidle0' | 'networkidle2';
}

export interface IScreenshotResult {
  status: ScreenshotStatus;
  url?: string;
  localPath?: string;
  size?: number;
  duration?: number;
  error?: string;
}

export interface IScreenshotMetadata {
  pageTitle?: string;
  pageDescription?: string;
  faviconUrl?: string;
  screenshotWidth?: number;
  screenshotHeight?: number;
}

export interface IScreenshotWebhook {
  url: string;
  sentAt?: Date;
  status?: number;
  response?: string;
  attempts: number;
}

export interface IScreenshot extends Document {
  _id: Types.ObjectId;
  user: Types.ObjectId | IUser;
  apiKey: Types.ObjectId | IApiKey;
  url: string;
  options: IScreenshotOptions;
  result: IScreenshotResult;
  metadata: IScreenshotMetadata;
  webhook?: IScreenshotWebhook;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

// ============================================
// Usage/Analytics Interfaces
// ============================================

export interface IUsageScreenshots {
  total: number;
  successful: number;
  failed: number;
  byFormat: Record<ScreenshotFormat, number>;
}

export interface IUsageResponseTime {
  avg: number;
  min: number;
  max: number;
  p95: number;
  p99: number;
}

export interface IUsage extends Document {
  _id: Types.ObjectId;
  user: Types.ObjectId | IUser;
  apiKey?: Types.ObjectId | IApiKey;
  date: Date;
  screenshots: IUsageScreenshots;
  bandwidth: number;
  responseTime: IUsageResponseTime;
  errorBreakdown: Record<string, number>;
  createdAt: Date;
  updatedAt: Date;
}

// ============================================
// Request Interfaces
// ============================================

export interface AuthenticatedRequest extends Request {
  user?: IUser;
  apiKey?: IApiKey;
}

export interface JWTPayload {
  userId: string;
  email: string;
  role: UserRole;
  type: 'access' | 'refresh';
  iat?: number;
  exp?: number;
}

// ============================================
// API Response Interfaces
// ============================================

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
  };
}

export interface PaginationOptions {
  page: number;
  limit: number;
  sort?: string;
  order?: 'asc' | 'desc';
}

// ============================================
// Screenshot Request/Response DTOs
// ============================================

export interface CreateScreenshotDTO {
  url: string;
  width?: number;
  height?: number;
  fullPage?: boolean;
  format?: ScreenshotFormat;
  quality?: number;
  delay?: number;
  selector?: string;
  clipRect?: ScreenshotClipRect;
  headers?: Record<string, string>;
  cookies?: ScreenshotCookie[];
  userAgent?: string;
  darkMode?: boolean;
  blockAds?: boolean;
  blockTrackers?: boolean;
  waitUntil?: 'load' | 'domcontentloaded' | 'networkidle0' | 'networkidle2';
  webhook?: string;
}

export interface ScreenshotResponseDTO {
  id: string;
  url: string;
  screenshotUrl?: string;
  status: ScreenshotStatus;
  size?: number;
  duration?: number;
  metadata: IScreenshotMetadata;
  createdAt: Date;
  expiresAt: Date;
}

// ============================================
// Auth DTOs
// ============================================

export interface RegisterDTO {
  email: string;
  password: string;
  name: string;
  company?: string;
}

export interface LoginDTO {
  email: string;
  password: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface CreateApiKeyDTO {
  name: string;
  permissions?: string[];
  expiresAt?: Date;
  ipWhitelist?: string[];
  domainWhitelist?: string[];
  rateLimit?: number;
}

export interface ApiKeyResponseDTO {
  id: string;
  key?: string; // Only returned on creation
  name: string;
  permissions: string[];
  isActive: boolean;
  lastUsedAt?: Date;
  expiresAt?: Date;
  usageCount: number;
  createdAt: Date;
}

// ============================================
// Subscription DTOs
// ============================================

export interface CreateCheckoutDTO {
  plan: Exclude<PlanType, 'free'>;
  successUrl: string;
  cancelUrl: string;
}

export interface UsageStatsDTO {
  currentPlan: PlanType;
  screenshotsUsed: number;
  screenshotsLimit: number;
  percentageUsed: number;
  daysUntilReset: number;
  currentPeriodStart?: Date;
  currentPeriodEnd?: Date;
}

// ============================================
// Analytics DTOs
// ============================================

export interface AnalyticsOverview {
  totalScreenshots: number;
  successfulScreenshots: number;
  failedScreenshots: number;
  successRate: number;
  averageResponseTime: number;
  totalBandwidth: number;
}

export interface AnalyticsTimeSeriesPoint {
  date: string;
  screenshots: number;
  successful: number;
  failed: number;
  avgResponseTime: number;
}

export interface ErrorBreakdown {
  errorType: string;
  count: number;
  percentage: number;
}
