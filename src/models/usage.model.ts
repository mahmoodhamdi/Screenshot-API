/**
 * Usage Model
 * Tracks daily usage statistics for analytics and reporting
 */

import mongoose, { Schema, Model, Types } from 'mongoose';
import { IUsage, ScreenshotFormat } from '@/types';

/**
 * Usage schema definition
 */
const usageSchema = new Schema<IUsage>(
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
      index: true,
    },
    date: {
      type: Date,
      required: true,
      index: true,
    },
    screenshots: {
      total: { type: Number, default: 0, min: 0 },
      successful: { type: Number, default: 0, min: 0 },
      failed: { type: Number, default: 0, min: 0 },
      byFormat: {
        png: { type: Number, default: 0, min: 0 },
        jpeg: { type: Number, default: 0, min: 0 },
        webp: { type: Number, default: 0, min: 0 },
        pdf: { type: Number, default: 0, min: 0 },
      },
    },
    bandwidth: {
      type: Number,
      default: 0,
      min: 0,
    },
    responseTime: {
      avg: { type: Number, default: 0, min: 0 },
      min: { type: Number, default: 0, min: 0 },
      max: { type: Number, default: 0, min: 0 },
      p95: { type: Number, default: 0, min: 0 },
      p99: { type: Number, default: 0, min: 0 },
    },
    errorBreakdown: {
      type: Map,
      of: Number,
      default: () => new Map(),
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (_doc, ret: Record<string, unknown>) => {
        const { __v, ...rest } = ret;
        // Convert errorBreakdown Map to object
        if (rest.errorBreakdown instanceof Map) {
          rest.errorBreakdown = Object.fromEntries(rest.errorBreakdown);
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

// Compound index for efficient user + date queries
usageSchema.index({ user: 1, date: 1 }, { unique: true });
usageSchema.index({ user: 1, apiKey: 1, date: 1 });
usageSchema.index({ date: 1 });

// ============================================
// Virtual Fields
// ============================================

/**
 * Calculate success rate
 */
usageSchema.virtual('successRate').get(function (this: IUsage) {
  if (this.screenshots.total === 0) return 100;
  return ((this.screenshots.successful / this.screenshots.total) * 100).toFixed(2);
});

// ============================================
// Static Methods
// ============================================

interface UsageModel extends Model<IUsage> {
  recordScreenshot(options: {
    userId: Types.ObjectId;
    apiKeyId?: Types.ObjectId;
    success: boolean;
    format: ScreenshotFormat;
    size: number;
    duration: number;
    error?: string;
  }): Promise<void>;
  getByUser(userId: Types.ObjectId, options?: {
    fromDate?: Date;
    toDate?: Date;
    apiKeyId?: Types.ObjectId;
  }): Promise<IUsage[]>;
  getOverview(userId: Types.ObjectId, options?: {
    fromDate?: Date;
    toDate?: Date;
  }): Promise<{
    totalScreenshots: number;
    successfulScreenshots: number;
    failedScreenshots: number;
    successRate: number;
    totalBandwidth: number;
    avgResponseTime: number;
  }>;
  getByDateRange(userId: Types.ObjectId, fromDate: Date, toDate: Date): Promise<IUsage[]>;
  aggregateByPeriod(userId: Types.ObjectId, options: {
    fromDate: Date;
    toDate: Date;
    groupBy: 'hour' | 'day' | 'week' | 'month';
  }): Promise<Array<{
    date: string;
    screenshots: number;
    successful: number;
    failed: number;
    avgResponseTime: number;
  }>>;
}

/**
 * Get the start of today (midnight UTC)
 */
function getDateKey(date: Date = new Date()): Date {
  const d = new Date(date);
  d.setUTCHours(0, 0, 0, 0);
  return d;
}

/**
 * Record a screenshot for usage tracking
 * @param options - Screenshot details
 */
usageSchema.statics.recordScreenshot = async function (options: {
  userId: Types.ObjectId;
  apiKeyId?: Types.ObjectId;
  success: boolean;
  format: ScreenshotFormat;
  size: number;
  duration: number;
  error?: string;
}): Promise<void> {
  const dateKey = getDateKey();

  // Find or create today's usage record
  let usage = await this.findOne({
    user: options.userId,
    date: dateKey,
  });

  if (!usage) {
    usage = new this({
      user: options.userId,
      apiKey: options.apiKeyId,
      date: dateKey,
      screenshots: {
        total: 0,
        successful: 0,
        failed: 0,
        byFormat: { png: 0, jpeg: 0, webp: 0, pdf: 0 },
      },
      bandwidth: 0,
      responseTime: {
        avg: 0,
        min: options.duration,
        max: options.duration,
        p95: options.duration,
        p99: options.duration,
      },
      errorBreakdown: new Map(),
    });
  }

  // Update screenshot counts
  usage.screenshots.total += 1;
  if (options.success) {
    usage.screenshots.successful += 1;
  } else {
    usage.screenshots.failed += 1;
  }

  // Update format count
  usage.screenshots.byFormat[options.format] = (usage.screenshots.byFormat[options.format] || 0) + 1;

  // Update bandwidth
  usage.bandwidth += options.size;

  // Update response time stats
  const oldTotal = usage.screenshots.total - 1;
  if (oldTotal === 0) {
    usage.responseTime.avg = options.duration;
    usage.responseTime.min = options.duration;
    usage.responseTime.max = options.duration;
  } else {
    // Running average
    usage.responseTime.avg =
      (usage.responseTime.avg * oldTotal + options.duration) / usage.screenshots.total;
    usage.responseTime.min = Math.min(usage.responseTime.min, options.duration);
    usage.responseTime.max = Math.max(usage.responseTime.max, options.duration);
  }

  // Update error breakdown if failed
  if (!options.success && options.error) {
    const errorKey = options.error.substring(0, 50); // Truncate error key
    const currentErrorCount = usage.errorBreakdown.get(errorKey) || 0;
    usage.errorBreakdown.set(errorKey, currentErrorCount + 1);
  }

  await usage.save();
};

/**
 * Get usage records for a user
 * @param userId - User ID
 * @param options - Query options
 * @returns Array of usage records
 */
usageSchema.statics.getByUser = function (
  userId: Types.ObjectId,
  options: {
    fromDate?: Date;
    toDate?: Date;
    apiKeyId?: Types.ObjectId;
  } = {}
): Promise<IUsage[]> {
  const query: Record<string, unknown> = { user: userId };

  if (options.apiKeyId) {
    query.apiKey = options.apiKeyId;
  }

  if (options.fromDate || options.toDate) {
    query.date = {};
    if (options.fromDate) {
      (query.date as Record<string, Date>).$gte = getDateKey(options.fromDate);
    }
    if (options.toDate) {
      (query.date as Record<string, Date>).$lte = getDateKey(options.toDate);
    }
  }

  return this.find(query).sort({ date: -1 });
};

/**
 * Get usage overview for a user
 * @param userId - User ID
 * @param options - Date range options
 * @returns Aggregated usage statistics
 */
usageSchema.statics.getOverview = async function (
  userId: Types.ObjectId,
  options: {
    fromDate?: Date;
    toDate?: Date;
  } = {}
): Promise<{
  totalScreenshots: number;
  successfulScreenshots: number;
  failedScreenshots: number;
  successRate: number;
  totalBandwidth: number;
  avgResponseTime: number;
}> {
  const matchStage: Record<string, unknown> = { user: userId };

  if (options.fromDate || options.toDate) {
    matchStage.date = {};
    if (options.fromDate) {
      (matchStage.date as Record<string, Date>).$gte = getDateKey(options.fromDate);
    }
    if (options.toDate) {
      (matchStage.date as Record<string, Date>).$lte = getDateKey(options.toDate);
    }
  }

  const result = await this.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: null,
        totalScreenshots: { $sum: '$screenshots.total' },
        successfulScreenshots: { $sum: '$screenshots.successful' },
        failedScreenshots: { $sum: '$screenshots.failed' },
        totalBandwidth: { $sum: '$bandwidth' },
        avgResponseTime: { $avg: '$responseTime.avg' },
      },
    },
  ]);

  if (result.length === 0) {
    return {
      totalScreenshots: 0,
      successfulScreenshots: 0,
      failedScreenshots: 0,
      successRate: 100,
      totalBandwidth: 0,
      avgResponseTime: 0,
    };
  }

  const data = result[0];
  const successRate =
    data.totalScreenshots > 0
      ? (data.successfulScreenshots / data.totalScreenshots) * 100
      : 100;

  return {
    totalScreenshots: data.totalScreenshots,
    successfulScreenshots: data.successfulScreenshots,
    failedScreenshots: data.failedScreenshots,
    successRate: parseFloat(successRate.toFixed(2)),
    totalBandwidth: data.totalBandwidth,
    avgResponseTime: parseFloat((data.avgResponseTime || 0).toFixed(2)),
  };
};

/**
 * Get usage records by date range
 * @param userId - User ID
 * @param fromDate - Start date
 * @param toDate - End date
 * @returns Array of usage records
 */
usageSchema.statics.getByDateRange = function (
  userId: Types.ObjectId,
  fromDate: Date,
  toDate: Date
): Promise<IUsage[]> {
  return this.find({
    user: userId,
    date: {
      $gte: getDateKey(fromDate),
      $lte: getDateKey(toDate),
    },
  }).sort({ date: 1 });
};

/**
 * Aggregate usage by time period
 * @param userId - User ID
 * @param options - Aggregation options
 * @returns Aggregated usage data
 */
usageSchema.statics.aggregateByPeriod = async function (
  userId: Types.ObjectId,
  options: {
    fromDate: Date;
    toDate: Date;
    groupBy: 'hour' | 'day' | 'week' | 'month';
  }
): Promise<Array<{
  date: string;
  screenshots: number;
  successful: number;
  failed: number;
  avgResponseTime: number;
}>> {
  let dateFormat: string;
  switch (options.groupBy) {
    case 'hour':
      dateFormat = '%Y-%m-%d %H:00';
      break;
    case 'week':
      dateFormat = '%Y-W%V';
      break;
    case 'month':
      dateFormat = '%Y-%m';
      break;
    default:
      dateFormat = '%Y-%m-%d';
  }

  const result = await this.aggregate([
    {
      $match: {
        user: userId,
        date: {
          $gte: getDateKey(options.fromDate),
          $lte: getDateKey(options.toDate),
        },
      },
    },
    {
      $group: {
        _id: { $dateToString: { format: dateFormat, date: '$date' } },
        screenshots: { $sum: '$screenshots.total' },
        successful: { $sum: '$screenshots.successful' },
        failed: { $sum: '$screenshots.failed' },
        avgResponseTime: { $avg: '$responseTime.avg' },
      },
    },
    { $sort: { _id: 1 } },
    {
      $project: {
        _id: 0,
        date: '$_id',
        screenshots: 1,
        successful: 1,
        failed: 1,
        avgResponseTime: { $round: ['$avgResponseTime', 2] },
      },
    },
  ]);

  return result;
};

// ============================================
// Export Model
// ============================================

const Usage = mongoose.model<IUsage, UsageModel>('Usage', usageSchema);

export default Usage;
