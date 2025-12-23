/**
 * Analytics Service
 * Provides usage analytics and statistics for screenshot operations
 */

import { Types } from 'mongoose';
import { Usage, Screenshot } from '@models/index';
import { IUser, PlanType, ScreenshotStatus } from '@/types';
import { AppError } from '@middlewares/error.middleware';
import { ERROR_CODES } from '@utils/constants';

// ============================================
// Types
// ============================================

export interface DateRange {
  startDate: Date;
  endDate: Date;
}

export interface OverviewStats {
  totalScreenshots: number;
  successfulScreenshots: number;
  failedScreenshots: number;
  successRate: number;
  averageResponseTime: number;
  totalBandwidth: number;
  screenshotsToday: number;
  screenshotsThisWeek: number;
  screenshotsThisMonth: number;
  currentPlan: PlanType;
  usagePercentage: number;
  planLimit: number;
}

export interface ScreenshotStats {
  byStatus: Record<ScreenshotStatus, number>;
  byFormat: Record<string, number>;
  byResolution: Array<{ width: number; height: number; count: number }>;
  averageDuration: number;
  averageSize: number;
  fullPageCount: number;
  regularCount: number;
}

export interface UsageOverTime {
  period: 'day' | 'week' | 'month';
  data: Array<{
    date: string;
    screenshots: number;
    successful: number;
    failed: number;
    bandwidth: number;
    avgResponseTime: number;
  }>;
}

export interface ErrorBreakdown {
  totalErrors: number;
  byType: Record<string, number>;
  topErrors: Array<{
    error: string;
    count: number;
    lastOccurred: Date;
  }>;
  errorRate: number;
}

export interface PopularUrl {
  url: string;
  domain: string;
  count: number;
  lastCaptured: Date;
}

// ============================================
// Helper Functions
// ============================================

function getStartOfDay(date: Date = new Date()): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function getStartOfWeek(date: Date = new Date()): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function getStartOfMonth(date: Date = new Date()): Date {
  const d = new Date(date);
  d.setDate(1);
  d.setHours(0, 0, 0, 0);
  return d;
}

function extractDomain(url: string): string {
  try {
    const parsed = new URL(url);
    return parsed.hostname;
  } catch {
    return url;
  }
}

// ============================================
// Analytics Functions
// ============================================

/**
 * Get overview analytics for a user
 */
export async function getOverview(user: IUser): Promise<OverviewStats> {
  const userId = user._id;
  const now = new Date();
  const startOfDay = getStartOfDay(now);
  const startOfWeek = getStartOfWeek(now);
  const startOfMonth = getStartOfMonth(now);

  // Get total screenshot counts
  const [totalStats, todayCount, weekCount, monthCount] = await Promise.all([
    Screenshot.aggregate([
      { $match: { user: new Types.ObjectId(userId) } },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          successful: {
            $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] },
          },
          failed: {
            $sum: { $cond: [{ $eq: ['$status', 'failed'] }, 1, 0] },
          },
          totalDuration: {
            $sum: { $ifNull: ['$result.duration', 0] },
          },
          totalSize: {
            $sum: { $ifNull: ['$result.size', 0] },
          },
        },
      },
    ]),
    Screenshot.countDocuments({
      user: userId,
      createdAt: { $gte: startOfDay },
    }),
    Screenshot.countDocuments({
      user: userId,
      createdAt: { $gte: startOfWeek },
    }),
    Screenshot.countDocuments({
      user: userId,
      createdAt: { $gte: startOfMonth },
    }),
  ]);

  const stats = totalStats[0] || {
    total: 0,
    successful: 0,
    failed: 0,
    totalDuration: 0,
    totalSize: 0,
  };

  const planLimits = user.getPlanLimits();
  const usagePercentage =
    planLimits.screenshotsPerMonth > 0
      ? Math.round((user.usage.screenshotsThisMonth / planLimits.screenshotsPerMonth) * 100)
      : 0;

  return {
    totalScreenshots: stats.total,
    successfulScreenshots: stats.successful,
    failedScreenshots: stats.failed,
    successRate: stats.total > 0 ? Math.round((stats.successful / stats.total) * 100) : 100,
    averageResponseTime:
      stats.successful > 0 ? Math.round(stats.totalDuration / stats.successful) : 0,
    totalBandwidth: stats.totalSize,
    screenshotsToday: todayCount,
    screenshotsThisWeek: weekCount,
    screenshotsThisMonth: monthCount,
    currentPlan: user.subscription.plan,
    usagePercentage,
    planLimit: planLimits.screenshotsPerMonth,
  };
}

/**
 * Get screenshot-specific statistics
 */
export async function getScreenshotStats(
  user: IUser,
  dateRange?: DateRange
): Promise<ScreenshotStats> {
  const userId = user._id;

  const matchStage: Record<string, unknown> = {
    user: new Types.ObjectId(userId),
  };

  if (dateRange) {
    matchStage.createdAt = {
      $gte: dateRange.startDate,
      $lte: dateRange.endDate,
    };
  }

  const [statusStats, formatStats, resolutionStats, generalStats] = await Promise.all([
    // By status
    Screenshot.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]),

    // By format
    Screenshot.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: '$options.format',
          count: { $sum: 1 },
        },
      },
    ]),

    // By resolution (top 5)
    Screenshot.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: {
            width: '$options.width',
            height: '$options.height',
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
      { $limit: 5 },
    ]),

    // General stats
    Screenshot.aggregate([
      { $match: { ...matchStage, status: 'completed' } },
      {
        $group: {
          _id: null,
          avgDuration: { $avg: '$result.duration' },
          avgSize: { $avg: '$result.size' },
          fullPage: {
            $sum: { $cond: [{ $eq: ['$options.fullPage', true] }, 1, 0] },
          },
          regular: {
            $sum: { $cond: [{ $ne: ['$options.fullPage', true] }, 1, 0] },
          },
        },
      },
    ]),
  ]);

  // Convert arrays to objects
  const byStatus = statusStats.reduce(
    (acc, item) => {
      acc[item._id as ScreenshotStatus] = item.count;
      return acc;
    },
    { pending: 0, processing: 0, completed: 0, failed: 0 } as Record<ScreenshotStatus, number>
  );

  const byFormat = formatStats.reduce(
    (acc, item) => {
      acc[item._id || 'png'] = item.count;
      return acc;
    },
    {} as Record<string, number>
  );

  const byResolution = resolutionStats.map((item) => ({
    width: item._id.width || 1280,
    height: item._id.height || 720,
    count: item.count,
  }));

  const general = generalStats[0] || {
    avgDuration: 0,
    avgSize: 0,
    fullPage: 0,
    regular: 0,
  };

  return {
    byStatus,
    byFormat,
    byResolution,
    averageDuration: Math.round(general.avgDuration || 0),
    averageSize: Math.round(general.avgSize || 0),
    fullPageCount: general.fullPage,
    regularCount: general.regular,
  };
}

/**
 * Get usage statistics over time
 */
export async function getUsageOverTime(
  user: IUser,
  period: 'day' | 'week' | 'month' = 'day',
  limit: number = 30
): Promise<UsageOverTime> {
  const userId = user._id;

  // Determine date format based on period
  let dateFormat: string;
  let daysBack: number;

  switch (period) {
    case 'week':
      dateFormat = '%Y-W%V';
      daysBack = limit * 7;
      break;
    case 'month':
      dateFormat = '%Y-%m';
      daysBack = limit * 30;
      break;
    case 'day':
    default:
      dateFormat = '%Y-%m-%d';
      daysBack = limit;
      break;
  }

  const startDate = new Date();
  startDate.setDate(startDate.getDate() - daysBack);

  // Get usage from Usage model first (pre-aggregated data)
  const usageData = await Usage.aggregate([
    {
      $match: {
        user: new Types.ObjectId(userId),
        date: { $gte: startDate },
      },
    },
    {
      $group: {
        _id: {
          $dateToString: { format: dateFormat, date: '$date' },
        },
        screenshots: { $sum: '$screenshots.total' },
        successful: { $sum: '$screenshots.successful' },
        failed: { $sum: '$screenshots.failed' },
        bandwidth: { $sum: '$bandwidth' },
        avgResponseTime: { $avg: '$responseTime.avg' },
      },
    },
    { $sort: { _id: 1 } },
    { $limit: limit },
  ]);

  // If no usage data, fall back to Screenshot model
  if (usageData.length === 0) {
    const screenshotData = await Screenshot.aggregate([
      {
        $match: {
          user: new Types.ObjectId(userId),
          createdAt: { $gte: startDate },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: dateFormat, date: '$createdAt' },
          },
          screenshots: { $sum: 1 },
          successful: {
            $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] },
          },
          failed: {
            $sum: { $cond: [{ $eq: ['$status', 'failed'] }, 1, 0] },
          },
          bandwidth: { $sum: { $ifNull: ['$result.size', 0] } },
          avgResponseTime: { $avg: { $ifNull: ['$result.duration', 0] } },
        },
      },
      { $sort: { _id: 1 } },
      { $limit: limit },
    ]);

    return {
      period,
      data: screenshotData.map((item) => ({
        date: item._id,
        screenshots: item.screenshots,
        successful: item.successful,
        failed: item.failed,
        bandwidth: item.bandwidth,
        avgResponseTime: Math.round(item.avgResponseTime || 0),
      })),
    };
  }

  return {
    period,
    data: usageData.map((item) => ({
      date: item._id,
      screenshots: item.screenshots,
      successful: item.successful,
      failed: item.failed,
      bandwidth: item.bandwidth,
      avgResponseTime: Math.round(item.avgResponseTime || 0),
    })),
  };
}

/**
 * Get error breakdown statistics
 */
export async function getErrorBreakdown(
  user: IUser,
  dateRange?: DateRange
): Promise<ErrorBreakdown> {
  const userId = user._id;

  const matchStage: Record<string, unknown> = {
    user: new Types.ObjectId(userId),
    status: 'failed',
  };

  if (dateRange) {
    matchStage.createdAt = {
      $gte: dateRange.startDate,
      $lte: dateRange.endDate,
    };
  }

  // Get total counts for error rate calculation
  const [totalCount, failedCount] = await Promise.all([
    Screenshot.countDocuments({
      user: userId,
      ...(dateRange ? { createdAt: { $gte: dateRange.startDate, $lte: dateRange.endDate } } : {}),
    }),
    Screenshot.countDocuments(matchStage),
  ]);

  // Get error breakdown from Usage model
  const usageErrors = await Usage.aggregate([
    {
      $match: {
        user: new Types.ObjectId(userId),
        ...(dateRange ? { date: { $gte: dateRange.startDate, $lte: dateRange.endDate } } : {}),
      },
    },
    { $unwind: { path: '$errorBreakdown', preserveNullAndEmptyArrays: false } },
    {
      $group: {
        _id: '$errorBreakdown.k',
        count: { $sum: '$errorBreakdown.v' },
        lastOccurred: { $max: '$date' },
      },
    },
    { $sort: { count: -1 } },
  ]);

  // Also get errors directly from screenshots for more detail
  const screenshotErrors = await Screenshot.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: '$result.error',
        count: { $sum: 1 },
        lastOccurred: { $max: '$createdAt' },
      },
    },
    { $sort: { count: -1 } },
    { $limit: 10 },
  ]);

  // Merge and deduplicate errors
  const errorMap = new Map<string, { count: number; lastOccurred: Date }>();

  for (const item of usageErrors) {
    if (item._id) {
      errorMap.set(item._id, {
        count: item.count,
        lastOccurred: item.lastOccurred,
      });
    }
  }

  for (const item of screenshotErrors) {
    if (item._id) {
      const existing = errorMap.get(item._id);
      if (existing) {
        existing.count += item.count;
        if (item.lastOccurred > existing.lastOccurred) {
          existing.lastOccurred = item.lastOccurred;
        }
      } else {
        errorMap.set(item._id, {
          count: item.count,
          lastOccurred: item.lastOccurred,
        });
      }
    }
  }

  const byType: Record<string, number> = {};
  const topErrors: Array<{ error: string; count: number; lastOccurred: Date }> = [];

  // Categorize errors
  for (const [error, data] of errorMap) {
    topErrors.push({
      error,
      count: data.count,
      lastOccurred: data.lastOccurred,
    });

    // Categorize by type
    let type = 'other';
    const errorLower = error.toLowerCase();
    if (errorLower.includes('timeout')) {
      type = 'timeout';
    } else if (errorLower.includes('network') || errorLower.includes('connection')) {
      type = 'network';
    } else if (errorLower.includes('navigation') || errorLower.includes('navigate')) {
      type = 'navigation';
    } else if (errorLower.includes('invalid') || errorLower.includes('url')) {
      type = 'invalid_url';
    } else if (errorLower.includes('blocked') || errorLower.includes('denied')) {
      type = 'blocked';
    }

    byType[type] = (byType[type] || 0) + data.count;
  }

  // Sort top errors by count
  topErrors.sort((a, b) => b.count - a.count);

  return {
    totalErrors: failedCount,
    byType,
    topErrors: topErrors.slice(0, 10),
    errorRate: totalCount > 0 ? Math.round((failedCount / totalCount) * 100) : 0,
  };
}

/**
 * Get popular URLs/domains
 */
export async function getPopularUrls(
  user: IUser,
  limit: number = 10,
  dateRange?: DateRange
): Promise<PopularUrl[]> {
  const userId = user._id;

  const matchStage: Record<string, unknown> = {
    user: new Types.ObjectId(userId),
  };

  if (dateRange) {
    matchStage.createdAt = {
      $gte: dateRange.startDate,
      $lte: dateRange.endDate,
    };
  }

  const popularUrls = await Screenshot.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: '$url',
        count: { $sum: 1 },
        lastCaptured: { $max: '$createdAt' },
      },
    },
    { $sort: { count: -1 } },
    { $limit: limit },
  ]);

  return popularUrls.map((item) => ({
    url: item._id,
    domain: extractDomain(item._id),
    count: item.count,
    lastCaptured: item.lastCaptured,
  }));
}

/**
 * Get API key usage statistics
 */
export async function getApiKeyStats(
  user: IUser,
  apiKeyId: string
): Promise<{
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  lastUsed: Date | null;
  usageByDay: Array<{ date: string; count: number }>;
}> {
  if (!Types.ObjectId.isValid(apiKeyId)) {
    throw new AppError('Invalid API key ID', 400, ERROR_CODES.VALIDATION_ERROR);
  }

  const keyId = new Types.ObjectId(apiKeyId);
  const userId = new Types.ObjectId(user._id);

  // Verify API key belongs to user
  const keyExists = await Screenshot.exists({
    user: userId,
    apiKey: keyId,
  });

  if (!keyExists) {
    throw new AppError('API key not found', 404, ERROR_CODES.NOT_FOUND);
  }

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const [stats, usageByDay, lastUsedDoc] = await Promise.all([
    Screenshot.aggregate([
      { $match: { apiKey: keyId } },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          successful: {
            $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] },
          },
          failed: {
            $sum: { $cond: [{ $eq: ['$status', 'failed'] }, 1, 0] },
          },
        },
      },
    ]),
    Screenshot.aggregate([
      {
        $match: {
          apiKey: keyId,
          createdAt: { $gte: thirtyDaysAgo },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]),
    Screenshot.findOne({ apiKey: keyId }).sort({ createdAt: -1 }).select('createdAt').lean(),
  ]);

  const totals = stats[0] || { total: 0, successful: 0, failed: 0 };

  return {
    totalRequests: totals.total,
    successfulRequests: totals.successful,
    failedRequests: totals.failed,
    lastUsed: lastUsedDoc?.createdAt || null,
    usageByDay: usageByDay.map((item) => ({
      date: item._id,
      count: item.count,
    })),
  };
}

/**
 * Record usage statistics (called after each screenshot operation)
 */
export async function recordUsage(
  userId: Types.ObjectId,
  apiKeyId: Types.ObjectId | undefined,
  success: boolean,
  duration: number,
  size: number,
  error?: string
): Promise<void> {
  const today = getStartOfDay();

  const update: Record<string, unknown> = {
    $inc: {
      'screenshots.total': 1,
      [`screenshots.${success ? 'successful' : 'failed'}`]: 1,
      bandwidth: size,
    },
    $setOnInsert: {
      user: userId,
      apiKey: apiKeyId,
      date: today,
    },
  };

  // Update response time stats
  if (success && duration > 0) {
    update.$min = { 'responseTime.min': duration };
    update.$max = { 'responseTime.max': duration };
    // For average, we'll recalculate it
  }

  // Record error type
  if (!success && error) {
    // Categorize error
    let errorType = 'other';
    const errorLower = error.toLowerCase();
    if (errorLower.includes('timeout')) {
      errorType = 'timeout';
    } else if (errorLower.includes('network') || errorLower.includes('connection')) {
      errorType = 'network';
    } else if (errorLower.includes('navigation')) {
      errorType = 'navigation';
    } else if (errorLower.includes('invalid') || errorLower.includes('url')) {
      errorType = 'invalid_url';
    }

    update.$inc = {
      ...(update.$inc as Record<string, number>),
      [`errorBreakdown.${errorType}`]: 1,
    };
  }

  await Usage.findOneAndUpdate(
    {
      user: userId,
      apiKey: apiKeyId,
      date: today,
    },
    update,
    { upsert: true }
  );

  // Update average response time separately
  if (success && duration > 0) {
    await Usage.findOneAndUpdate(
      {
        user: userId,
        apiKey: apiKeyId,
        date: today,
      },
      [
        {
          $set: {
            'responseTime.avg': {
              $cond: {
                if: { $eq: ['$screenshots.successful', 1] },
                then: duration,
                else: {
                  $divide: [
                    {
                      $add: [
                        {
                          $multiply: [
                            '$responseTime.avg',
                            { $subtract: ['$screenshots.successful', 1] },
                          ],
                        },
                        duration,
                      ],
                    },
                    '$screenshots.successful',
                  ],
                },
              },
            },
          },
        },
      ]
    );
  }
}
