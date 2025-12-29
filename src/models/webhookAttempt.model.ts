/**
 * Webhook Attempt Model
 * Tracks webhook delivery attempts for reliability and debugging
 */

import mongoose, { Schema, Document, Model, Types } from 'mongoose';

/**
 * Webhook attempt status
 */
export type WebhookAttemptStatus = 'pending' | 'success' | 'failed' | 'expired';

/**
 * Webhook attempt document interface
 */
export interface IWebhookAttempt extends Document {
  _id: Types.ObjectId;
  screenshotId: Types.ObjectId;
  userId: Types.ObjectId;
  url: string;
  payload: Record<string, unknown>;
  status: WebhookAttemptStatus;
  attempts: number;
  maxAttempts: number;
  lastAttemptAt?: Date;
  nextAttemptAt?: Date;
  responseStatus?: number;
  responseBody?: string;
  errorMessage?: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Webhook attempt schema
 */
const webhookAttemptSchema = new Schema<IWebhookAttempt>(
  {
    screenshotId: {
      type: Schema.Types.ObjectId,
      ref: 'Screenshot',
      required: true,
      index: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    url: {
      type: String,
      required: true,
    },
    payload: {
      type: Schema.Types.Mixed,
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'success', 'failed', 'expired'],
      default: 'pending',
      index: true,
    },
    attempts: {
      type: Number,
      default: 0,
      min: 0,
    },
    maxAttempts: {
      type: Number,
      default: 5,
      min: 1,
      max: 10,
    },
    lastAttemptAt: {
      type: Date,
    },
    nextAttemptAt: {
      type: Date,
      index: true,
    },
    responseStatus: {
      type: Number,
    },
    responseBody: {
      type: String,
      maxlength: 2000, // Limit stored response body
    },
    errorMessage: {
      type: String,
      maxlength: 1000,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (_doc, ret: Record<string, unknown>): Record<string, unknown> => {
        const { __v: _v, ...rest } = ret;
        return rest;
      },
    },
  }
);

// ============================================
// Indexes
// ============================================

// Compound index for finding pending webhooks to process
webhookAttemptSchema.index({ status: 1, nextAttemptAt: 1 });

// Index for user's webhook history
webhookAttemptSchema.index({ userId: 1, createdAt: -1 });

// TTL index for automatic cleanup of old webhook attempts (30 days)
// Only deletes completed/failed/expired attempts
webhookAttemptSchema.index(
  { createdAt: 1 },
  {
    expireAfterSeconds: 2592000, // 30 days
    partialFilterExpression: { status: { $in: ['success', 'failed', 'expired'] } },
  }
);

// ============================================
// Static Methods
// ============================================

interface WebhookAttemptModel extends Model<IWebhookAttempt> {
  findPendingWebhooks(limit?: number): Promise<IWebhookAttempt[]>;
  findByUser(userId: Types.ObjectId, limit?: number): Promise<IWebhookAttempt[]>;
  findByScreenshot(screenshotId: Types.ObjectId): Promise<IWebhookAttempt[]>;
  cleanupOldAttempts(olderThanDays: number): Promise<number>;
}

/**
 * Find pending webhooks that are ready to be processed
 */
webhookAttemptSchema.statics.findPendingWebhooks = function (
  limit: number = 100
): Promise<IWebhookAttempt[]> {
  const now = new Date();
  return this.find({
    status: 'pending',
    nextAttemptAt: { $lte: now },
  })
    .sort({ nextAttemptAt: 1 })
    .limit(limit);
};

/**
 * Find webhook attempts for a user
 */
webhookAttemptSchema.statics.findByUser = function (
  userId: Types.ObjectId,
  limit: number = 100
): Promise<IWebhookAttempt[]> {
  return this.find({ userId }).sort({ createdAt: -1 }).limit(limit);
};

/**
 * Find webhook attempts for a screenshot
 */
webhookAttemptSchema.statics.findByScreenshot = function (
  screenshotId: Types.ObjectId
): Promise<IWebhookAttempt[]> {
  return this.find({ screenshotId }).sort({ createdAt: -1 });
};

/**
 * Cleanup old webhook attempts
 */
webhookAttemptSchema.statics.cleanupOldAttempts = async function (
  olderThanDays: number
): Promise<number> {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - olderThanDays);

  const result = await this.deleteMany({
    createdAt: { $lt: cutoff },
    status: { $in: ['success', 'failed', 'expired'] },
  });

  return result.deletedCount || 0;
};

// ============================================
// Instance Methods
// ============================================

/**
 * Check if the webhook can be retried
 */
webhookAttemptSchema.methods.canRetry = function (): boolean {
  return this.status === 'pending' && this.attempts < this.maxAttempts;
};

/**
 * Mark the webhook as expired
 */
webhookAttemptSchema.methods.markExpired = async function (): Promise<void> {
  this.status = 'expired';
  await this.save();
};

// ============================================
// Export Model
// ============================================

export const WebhookAttempt = mongoose.model<IWebhookAttempt, WebhookAttemptModel>(
  'WebhookAttempt',
  webhookAttemptSchema
);

export default WebhookAttempt;
