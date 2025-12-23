/**
 * Screenshot Controller
 * Handles HTTP requests for screenshot operations
 */

import { Request, Response } from 'express';
import {
  createScreenshot,
  getScreenshotById,
  listScreenshots,
  deleteScreenshotById,
  refreshScreenshotUrl,
  retryScreenshot,
  getScreenshotStats,
} from '@services/screenshot.service';
import { asyncHandler, NotFoundError, AppError } from '@middlewares/error.middleware';
import { isSafeUrl } from '@middlewares/validation.middleware';
import { CreateScreenshotDTO, ScreenshotStatus, ScreenshotFormat } from '@/types';
import { ERROR_CODES } from '@utils/constants';
import logger from '@utils/logger';

// ============================================
// Screenshot Controllers
// ============================================

/**
 * Create a new screenshot
 * POST /api/v1/screenshots
 */
export const create = asyncHandler(async (req: Request, res: Response) => {
  const dto: CreateScreenshotDTO = req.body;

  // Validate URL is safe (not internal)
  if (!isSafeUrl(dto.url)) {
    throw new AppError(
      'URL is not allowed (internal/private addresses are blocked)',
      400,
      ERROR_CODES.VALIDATION_ERROR
    );
  }

  // User must be authenticated
  if (!req.user) {
    throw new AppError('Authentication required', 401, ERROR_CODES.UNAUTHORIZED);
  }

  // Create screenshot
  const { screenshot } = await createScreenshot(dto, req.user, req.apiKey);

  logger.info('Screenshot created', {
    screenshotId: screenshot._id,
    userId: req.user._id,
    url: dto.url,
  });

  res.status(201).json({
    success: true,
    data: {
      id: screenshot._id,
      url: screenshot.url,
      screenshotUrl: screenshot.result.url,
      status: screenshot.result.status,
      size: screenshot.result.size,
      duration: screenshot.result.duration,
      metadata: screenshot.metadata,
      createdAt: screenshot.createdAt,
      expiresAt: screenshot.expiresAt,
    },
  });
});

/**
 * Get screenshot by ID
 * GET /api/v1/screenshots/:id
 */
export const getById = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  if (!req.user) {
    throw new AppError('Authentication required', 401, ERROR_CODES.UNAUTHORIZED);
  }

  const screenshot = await getScreenshotById(id, req.user._id);

  if (!screenshot) {
    throw new NotFoundError('Screenshot');
  }

  res.json({
    success: true,
    data: {
      id: screenshot._id,
      url: screenshot.url,
      screenshotUrl: screenshot.result.url,
      status: screenshot.result.status,
      size: screenshot.result.size,
      duration: screenshot.result.duration,
      error: screenshot.result.error,
      metadata: screenshot.metadata,
      options: screenshot.options,
      createdAt: screenshot.createdAt,
      expiresAt: screenshot.expiresAt,
    },
  });
});

/**
 * List user's screenshots
 * GET /api/v1/screenshots
 */
export const list = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new AppError('Authentication required', 401, ERROR_CODES.UNAUTHORIZED);
  }

  const {
    page = 1,
    limit = 20,
    sort = 'createdAt',
    order = 'desc',
    status,
    format,
    startDate,
    endDate,
  } = req.query;

  const result = await listScreenshots(req.user._id, {
    page: Number(page),
    limit: Number(limit),
    sort: sort as string,
    order: order as 'asc' | 'desc',
    status: status as ScreenshotStatus | undefined,
    format: format as ScreenshotFormat | undefined,
    startDate: startDate ? new Date(startDate as string) : undefined,
    endDate: endDate ? new Date(endDate as string) : undefined,
  });

  res.json({
    success: true,
    data: result.screenshots.map((s) => ({
      id: s._id,
      url: s.url,
      screenshotUrl: s.result.url,
      status: s.result.status,
      size: s.result.size,
      duration: s.result.duration,
      format: s.options.format,
      createdAt: s.createdAt,
      expiresAt: s.expiresAt,
    })),
    meta: {
      page: result.page,
      limit: result.limit,
      total: result.total,
      totalPages: result.totalPages,
    },
  });
});

/**
 * Delete a screenshot
 * DELETE /api/v1/screenshots/:id
 */
export const remove = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  if (!req.user) {
    throw new AppError('Authentication required', 401, ERROR_CODES.UNAUTHORIZED);
  }

  const deleted = await deleteScreenshotById(id, req.user._id);

  if (!deleted) {
    throw new NotFoundError('Screenshot');
  }

  logger.info('Screenshot deleted', {
    screenshotId: id,
    userId: req.user._id,
  });

  res.json({
    success: true,
    message: 'Screenshot deleted successfully',
  });
});

/**
 * Refresh screenshot URL (get new signed URL)
 * POST /api/v1/screenshots/:id/refresh-url
 */
export const refreshUrl = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  if (!req.user) {
    throw new AppError('Authentication required', 401, ERROR_CODES.UNAUTHORIZED);
  }

  const newUrl = await refreshScreenshotUrl(id, req.user._id);

  if (!newUrl) {
    throw new NotFoundError('Screenshot');
  }

  res.json({
    success: true,
    data: {
      screenshotUrl: newUrl,
    },
  });
});

/**
 * Retry a failed screenshot
 * POST /api/v1/screenshots/:id/retry
 */
export const retry = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  if (!req.user) {
    throw new AppError('Authentication required', 401, ERROR_CODES.UNAUTHORIZED);
  }

  const result = await retryScreenshot(id, req.user._id);

  if (!result) {
    throw new AppError(
      'Screenshot not found or is not in failed state',
      400,
      ERROR_CODES.VALIDATION_ERROR
    );
  }

  logger.info('Screenshot retry initiated', {
    originalId: id,
    newId: result.screenshot._id,
    userId: req.user._id,
  });

  res.status(201).json({
    success: true,
    data: {
      id: result.screenshot._id,
      url: result.screenshot.url,
      screenshotUrl: result.screenshot.result.url,
      status: result.screenshot.result.status,
      size: result.screenshot.result.size,
      duration: result.screenshot.result.duration,
      metadata: result.screenshot.metadata,
      createdAt: result.screenshot.createdAt,
      expiresAt: result.screenshot.expiresAt,
    },
    message: 'Screenshot retry initiated',
  });
});

/**
 * Get screenshot statistics
 * GET /api/v1/screenshots/stats
 */
export const stats = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new AppError('Authentication required', 401, ERROR_CODES.UNAUTHORIZED);
  }

  const { startDate, endDate } = req.query;

  const statistics = await getScreenshotStats(
    req.user._id,
    startDate ? new Date(startDate as string) : undefined,
    endDate ? new Date(endDate as string) : undefined
  );

  res.json({
    success: true,
    data: statistics,
  });
});

/**
 * Download screenshot (proxy)
 * GET /api/v1/screenshots/:id/download
 */
export const download = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  if (!req.user) {
    throw new AppError('Authentication required', 401, ERROR_CODES.UNAUTHORIZED);
  }

  const screenshot = await getScreenshotById(id, req.user._id);

  if (!screenshot) {
    throw new NotFoundError('Screenshot');
  }

  if (screenshot.result.status !== 'completed' || !screenshot.result.url) {
    throw new AppError(
      'Screenshot is not available for download',
      400,
      ERROR_CODES.VALIDATION_ERROR
    );
  }

  // Redirect to the screenshot URL
  res.redirect(screenshot.result.url);
});

// ============================================
// Export
// ============================================

export default {
  create,
  getById,
  list,
  remove,
  refreshUrl,
  retry,
  stats,
  download,
};
