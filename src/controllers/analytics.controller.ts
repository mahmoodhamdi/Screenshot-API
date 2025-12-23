/**
 * Analytics Controller
 * Handles HTTP requests for analytics and usage statistics
 */

import { Request, Response } from 'express';
import { asyncHandler } from '@middlewares/error.middleware';
import * as analyticsService from '@services/analytics.service';
import { IUser } from '@/types';

// ============================================
// Controller Methods
// ============================================

/**
 * Get overview analytics
 * GET /api/v1/analytics/overview
 */
const overview = asyncHandler(async (req: Request, res: Response) => {
  const user = req.user as IUser;
  const stats = await analyticsService.getOverview(user);

  res.json({
    success: true,
    data: stats,
  });
});

/**
 * Get screenshot statistics
 * GET /api/v1/analytics/screenshots
 */
const screenshots = asyncHandler(async (req: Request, res: Response) => {
  const user = req.user as IUser;
  const { startDate, endDate } = req.query;

  let dateRange: analyticsService.DateRange | undefined;

  if (startDate && endDate) {
    dateRange = {
      startDate: new Date(startDate as string),
      endDate: new Date(endDate as string),
    };
  }

  const stats = await analyticsService.getScreenshotStats(user, dateRange);

  res.json({
    success: true,
    data: stats,
  });
});

/**
 * Get usage over time
 * GET /api/v1/analytics/usage
 */
const usage = asyncHandler(async (req: Request, res: Response) => {
  const user = req.user as IUser;
  const { period = 'day', limit = '30' } = req.query;

  const validPeriods = ['day', 'week', 'month'] as const;
  const usagePeriod = validPeriods.includes(period as (typeof validPeriods)[number])
    ? (period as 'day' | 'week' | 'month')
    : 'day';

  const usageLimit = Math.min(Math.max(parseInt(limit as string) || 30, 1), 365);

  const stats = await analyticsService.getUsageOverTime(user, usagePeriod, usageLimit);

  res.json({
    success: true,
    data: stats,
  });
});

/**
 * Get error breakdown
 * GET /api/v1/analytics/errors
 */
const errors = asyncHandler(async (req: Request, res: Response) => {
  const user = req.user as IUser;
  const { startDate, endDate } = req.query;

  let dateRange: analyticsService.DateRange | undefined;

  if (startDate && endDate) {
    dateRange = {
      startDate: new Date(startDate as string),
      endDate: new Date(endDate as string),
    };
  }

  const stats = await analyticsService.getErrorBreakdown(user, dateRange);

  res.json({
    success: true,
    data: stats,
  });
});

/**
 * Get popular URLs
 * GET /api/v1/analytics/urls
 */
const popularUrls = asyncHandler(async (req: Request, res: Response) => {
  const user = req.user as IUser;
  const { limit = '10', startDate, endDate } = req.query;

  const urlLimit = Math.min(Math.max(parseInt(limit as string) || 10, 1), 100);

  let dateRange: analyticsService.DateRange | undefined;

  if (startDate && endDate) {
    dateRange = {
      startDate: new Date(startDate as string),
      endDate: new Date(endDate as string),
    };
  }

  const urls = await analyticsService.getPopularUrls(user, urlLimit, dateRange);

  res.json({
    success: true,
    data: urls,
  });
});

/**
 * Get API key statistics
 * GET /api/v1/analytics/api-keys/:id
 */
const apiKeyStats = asyncHandler(async (req: Request, res: Response) => {
  const user = req.user as IUser;
  const { id } = req.params;

  const stats = await analyticsService.getApiKeyStats(user, id);

  res.json({
    success: true,
    data: stats,
  });
});

// ============================================
// Export Controller
// ============================================

export default {
  overview,
  screenshots,
  usage,
  errors,
  popularUrls,
  apiKeyStats,
};
