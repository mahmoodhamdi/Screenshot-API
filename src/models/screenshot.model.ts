/**
 * Screenshot Model
 * Stores screenshot requests, results, and metadata
 */

import mongoose, { Schema, Model, Types } from 'mongoose';
import { IScreenshot, ScreenshotStatus, ScreenshotFormat } from '@/types';
import { DEFAULTS } from '@utils/constants';

/**
 * Cookie sub-schema
 */
const cookieSchema = new Schema(
  {
    name: { type: String, required: true },
    value: { type: String, required: true },
    domain: String,
    path: { type: String, default: '/' },
    expires: Number,
    httpOnly: Boolean,
    secure: Boolean,
    sameSite: {
      type: String,
      enum: ['Strict', 'Lax', 'None'],
    },
  },
  { _id: false }
);

/**
 * Clip rect sub-schema
 */
const clipRectSchema = new Schema(
  {
    x: { type: Number, required: true, min: 0 },
    y: { type: Number, required: true, min: 0 },
    width: { type: Number, required: true, min: 1 },
    height: { type: Number, required: true, min: 1 },
  },
  { _id: false }
);

/**
 * Screenshot options sub-schema
 */
const screenshotOptionsSchema = new Schema(
  {
    width: {
      type: Number,
      default: DEFAULTS.SCREENSHOT_WIDTH,
      min: 100,
      max: 7680,
    },
    height: {
      type: Number,
      default: DEFAULTS.SCREENSHOT_HEIGHT,
      min: 100,
      max: 4320,
    },
    fullPage: {
      type: Boolean,
      default: false,
    },
    format: {
      type: String,
      enum: ['png', 'jpeg', 'webp', 'pdf'],
      default: DEFAULTS.SCREENSHOT_FORMAT,
    },
    quality: {
      type: Number,
      default: DEFAULTS.SCREENSHOT_QUALITY,
      min: 1,
      max: 100,
    },
    delay: {
      type: Number,
      default: DEFAULTS.SCREENSHOT_DELAY,
      min: 0,
      max: 30000,
    },
    selector: String,
    clipRect: clipRectSchema,
    headers: {
      type: Map,
      of: String,
    },
    cookies: [cookieSchema],
    userAgent: String,
    darkMode: {
      type: Boolean,
      default: false,
    },
    blockAds: {
      type: Boolean,
      default: false,
    },
    blockTrackers: {
      type: Boolean,
      default: false,
    },
    waitUntil: {
      type: String,
      enum: ['load', 'domcontentloaded', 'networkidle0', 'networkidle2'],
      default: DEFAULTS.SCREENSHOT_WAIT_UNTIL,
    },
  },
  { _id: false }
);

/**
 * Screenshot result sub-schema
 */
const screenshotResultSchema = new Schema(
  {
    status: {
      type: String,
      enum: ['pending', 'processing', 'completed', 'failed'],
      default: 'pending',
    },
    url: String,
    localPath: String,
    size: {
      type: Number,
      min: 0,
    },
    duration: {
      type: Number,
      min: 0,
    },
    error: String,
  },
  { _id: false }
);

/**
 * Screenshot metadata sub-schema
 */
const screenshotMetadataSchema = new Schema(
  {
    pageTitle: String,
    pageDescription: String,
    faviconUrl: String,
    screenshotWidth: Number,
    screenshotHeight: Number,
  },
  { _id: false }
);

/**
 * Webhook sub-schema
 */
const webhookSchema = new Schema(
  {
    url: {
      type: String,
      required: true,
    },
    sentAt: Date,
    status: Number,
    response: String,
    attempts: {
      type: Number,
      default: 0,
    },
  },
  { _id: false }
);

/**
 * Screenshot schema definition
 */
const screenshotSchema = new Schema<IScreenshot>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference is required'],
      index: true,
    },
    apiKey: {
      type: Schema.Types.ObjectId,
      ref: 'ApiKey',
      required: [true, 'API key reference is required'],
      index: true,
    },
    url: {
      type: String,
      required: [true, 'URL is required'],
      trim: true,
    },
    options: {
      type: screenshotOptionsSchema,
      required: true,
      default: () => ({}),
    },
    result: {
      type: screenshotResultSchema,
      required: true,
      default: () => ({ status: 'pending' }),
    },
    metadata: {
      type: screenshotMetadataSchema,
      default: () => ({}),
    },
    webhook: webhookSchema,
    expiresAt: {
      type: Date,
      required: true,
      // Index defined below with TTL
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (_doc, ret: Record<string, unknown>) => {
        const { __v, ...rest } = ret;
        // Convert Map to object for headers
        const options = rest.options as Record<string, unknown> | undefined;
        if (options?.headers instanceof Map) {
          options.headers = Object.fromEntries(options.headers);
        }
        return rest;
      },
    },
    toObject: {
      virtuals: true,
    },
  }
);

// ============================================
// Indexes
// ============================================

screenshotSchema.index({ user: 1, createdAt: -1 });
screenshotSchema.index({ 'result.status': 1 });
screenshotSchema.index({ createdAt: 1 });
screenshotSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // TTL index for auto-deletion

// ============================================
// Virtual Fields
// ============================================

/**
 * Check if the screenshot has expired
 */
screenshotSchema.virtual('isExpired').get(function () {
  return new Date() > this.expiresAt;
});

/**
 * Check if the screenshot is ready
 */
screenshotSchema.virtual('isReady').get(function () {
  return this.result.status === 'completed';
});

/**
 * Check if the screenshot failed
 */
screenshotSchema.virtual('isFailed').get(function () {
  return this.result.status === 'failed';
});

// ============================================
// Instance Methods
// ============================================

/**
 * Mark the screenshot as processing
 */
screenshotSchema.methods.markAsProcessing = async function (): Promise<void> {
  this.result.status = 'processing';
  await this.save();
};

/**
 * Mark the screenshot as completed
 * @param options - Completion options
 */
screenshotSchema.methods.markAsCompleted = async function (options: {
  url: string;
  localPath?: string;
  size: number;
  duration: number;
  metadata?: {
    pageTitle?: string;
    pageDescription?: string;
    faviconUrl?: string;
    screenshotWidth?: number;
    screenshotHeight?: number;
  };
}): Promise<void> {
  this.result.status = 'completed';
  this.result.url = options.url;
  this.result.localPath = options.localPath;
  this.result.size = options.size;
  this.result.duration = options.duration;

  if (options.metadata) {
    this.metadata = { ...this.metadata, ...options.metadata };
  }

  await this.save();
};

/**
 * Mark the screenshot as failed
 * @param error - Error message
 */
screenshotSchema.methods.markAsFailed = async function (error: string): Promise<void> {
  this.result.status = 'failed';
  this.result.error = error;
  await this.save();
};

/**
 * Record a webhook attempt
 * @param status - HTTP status code
 * @param response - Response body (truncated)
 */
screenshotSchema.methods.recordWebhookAttempt = async function (
  status: number,
  response?: string
): Promise<void> {
  if (!this.webhook) return;

  this.webhook.sentAt = new Date();
  this.webhook.status = status;
  this.webhook.response = response?.substring(0, 500);
  this.webhook.attempts += 1;

  await this.save();
};

// ============================================
// Static Methods
// ============================================

interface ScreenshotModel extends Model<IScreenshot> {
  findByUser(userId: Types.ObjectId, options?: {
    status?: ScreenshotStatus;
    format?: ScreenshotFormat;
    limit?: number;
    skip?: number;
    fromDate?: Date;
    toDate?: Date;
  }): Promise<IScreenshot[]>;
  countByUser(userId: Types.ObjectId, status?: ScreenshotStatus): Promise<number>;
  findPending(limit?: number): Promise<IScreenshot[]>;
  findByIdAndUser(id: Types.ObjectId, userId: Types.ObjectId): Promise<IScreenshot | null>;
  cleanupExpired(): Promise<number>;
}

/**
 * Find screenshots by user with optional filtering
 * @param userId - User ID
 * @param options - Query options
 * @returns Array of screenshots
 */
screenshotSchema.statics.findByUser = function (
  userId: Types.ObjectId,
  options: {
    status?: ScreenshotStatus;
    format?: ScreenshotFormat;
    limit?: number;
    skip?: number;
    fromDate?: Date;
    toDate?: Date;
  } = {}
): Promise<IScreenshot[]> {
  const query: Record<string, unknown> = { user: userId };

  if (options.status) {
    query['result.status'] = options.status;
  }

  if (options.format) {
    query['options.format'] = options.format;
  }

  if (options.fromDate || options.toDate) {
    query.createdAt = {};
    if (options.fromDate) {
      (query.createdAt as Record<string, Date>).$gte = options.fromDate;
    }
    if (options.toDate) {
      (query.createdAt as Record<string, Date>).$lte = options.toDate;
    }
  }

  return this.find(query)
    .sort({ createdAt: -1 })
    .skip(options.skip || 0)
    .limit(options.limit || 20)
    .populate('apiKey', 'name');
};

/**
 * Count screenshots by user
 * @param userId - User ID
 * @param status - Optional status filter
 * @returns Screenshot count
 */
screenshotSchema.statics.countByUser = function (
  userId: Types.ObjectId,
  status?: ScreenshotStatus
): Promise<number> {
  const query: Record<string, unknown> = { user: userId };
  if (status) {
    query['result.status'] = status;
  }
  return this.countDocuments(query);
};

/**
 * Find pending screenshots for processing
 * @param limit - Maximum number to return
 * @returns Array of pending screenshots
 */
screenshotSchema.statics.findPending = function (limit: number = 10): Promise<IScreenshot[]> {
  return this.find({ 'result.status': 'pending' })
    .sort({ createdAt: 1 }) // Process oldest first
    .limit(limit)
    .populate('user')
    .populate('apiKey');
};

/**
 * Find a screenshot by ID and user
 * @param id - Screenshot ID
 * @param userId - User ID
 * @returns Screenshot or null
 */
screenshotSchema.statics.findByIdAndUser = function (
  id: Types.ObjectId,
  userId: Types.ObjectId
): Promise<IScreenshot | null> {
  return this.findOne({ _id: id, user: userId });
};

/**
 * Clean up expired screenshots (manual cleanup if TTL index doesn't work)
 * @returns Number of deleted screenshots
 */
screenshotSchema.statics.cleanupExpired = async function (): Promise<number> {
  const result = await this.deleteMany({ expiresAt: { $lt: new Date() } });
  return result.deletedCount;
};

// ============================================
// Export Model
// ============================================

const Screenshot = mongoose.model<IScreenshot, ScreenshotModel>('Screenshot', screenshotSchema);

export default Screenshot;
