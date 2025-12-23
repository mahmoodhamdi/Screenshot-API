/**
 * Screenshot Service
 * Core service for capturing website screenshots
 */

import { Types } from 'mongoose';
import { Page, ScreenshotOptions as PuppeteerScreenshotOptions } from 'puppeteer';
import {
  getBrowser,
  releaseBrowser,
  createPage,
  closePage,
  emulateDarkMode,
} from '@config/puppeteer';
import {
  generateStorageKey,
  saveScreenshot,
  deleteScreenshot,
  getSignedScreenshotUrl,
} from './storage.service';
import Screenshot from '@models/screenshot.model';
import User from '@models/user.model';
import {
  IScreenshot,
  IUser,
  IApiKey,
  CreateScreenshotDTO,
  IScreenshotOptions,
  IScreenshotMetadata,
  ScreenshotFormat,
  ScreenshotStatus,
  PaginationOptions,
} from '@/types';
import { config } from '@config/index';
import logger from '@utils/logger';
import { cache } from '@config/redis';
import { AppError } from '@middlewares/error.middleware';
import { ERROR_CODES } from '@utils/constants';

// ============================================
// Types
// ============================================

export interface CaptureResult {
  screenshot: IScreenshot;
  buffer?: Buffer;
}

export interface ListScreenshotsResult {
  screenshots: IScreenshot[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// ============================================
// Default Options
// ============================================

const DEFAULT_OPTIONS: IScreenshotOptions = {
  width: 1280,
  height: 720,
  fullPage: false,
  format: 'png',
  quality: 80,
  delay: 0,
  darkMode: false,
  blockAds: false,
  blockTrackers: false,
  waitUntil: 'networkidle2',
};

// ============================================
// Helper Functions
// ============================================

/**
 * Validate screenshot options against user's plan limits
 */
export function validateOptionsAgainstPlan(
  options: Partial<IScreenshotOptions>,
  user: IUser
): void {
  const planLimits = user.getPlanLimits();

  // Check resolution limits
  if (options.width && options.width > planLimits.maxWidth) {
    throw new AppError(
      `Maximum width for your plan is ${planLimits.maxWidth}px`,
      400,
      ERROR_CODES.VALIDATION_ERROR
    );
  }

  if (options.height && options.height > planLimits.maxHeight) {
    throw new AppError(
      `Maximum height for your plan is ${planLimits.maxHeight}px`,
      400,
      ERROR_CODES.VALIDATION_ERROR
    );
  }

  // Check format availability
  if (options.format && !planLimits.formats.includes(options.format)) {
    throw new AppError(
      `Format '${options.format}' is not available in your plan`,
      400,
      ERROR_CODES.VALIDATION_ERROR
    );
  }

  // Check full page availability
  if (options.fullPage && !planLimits.fullPage) {
    throw new AppError(
      'Full page screenshots are not available in your plan',
      400,
      ERROR_CODES.VALIDATION_ERROR
    );
  }

  // Check custom headers availability
  if (options.headers && Object.keys(options.headers).length > 0 && !planLimits.customHeaders) {
    throw new AppError(
      'Custom headers are not available in your plan',
      400,
      ERROR_CODES.VALIDATION_ERROR
    );
  }
}

/**
 * Check if user has remaining screenshot quota
 */
export async function checkUsageQuota(user: IUser): Promise<void> {
  const planLimits = user.getPlanLimits();
  const currentUsage = user.usage.screenshotsThisMonth;

  if (currentUsage >= planLimits.screenshotsPerMonth) {
    throw new AppError(
      `Monthly screenshot limit (${planLimits.screenshotsPerMonth}) reached`,
      429,
      ERROR_CODES.USAGE_LIMIT_EXCEEDED
    );
  }
}

/**
 * Merge DTO with default options
 */
function mergeOptions(dto: CreateScreenshotDTO): IScreenshotOptions {
  return {
    width: dto.width ?? DEFAULT_OPTIONS.width,
    height: dto.height ?? DEFAULT_OPTIONS.height,
    fullPage: dto.fullPage ?? DEFAULT_OPTIONS.fullPage,
    format: dto.format ?? DEFAULT_OPTIONS.format,
    quality: dto.quality ?? DEFAULT_OPTIONS.quality,
    delay: dto.delay ?? DEFAULT_OPTIONS.delay,
    selector: dto.selector,
    clipRect: dto.clipRect,
    headers: dto.headers,
    cookies: dto.cookies,
    userAgent: dto.userAgent,
    darkMode: dto.darkMode ?? DEFAULT_OPTIONS.darkMode,
    blockAds: dto.blockAds ?? DEFAULT_OPTIONS.blockAds,
    blockTrackers: dto.blockTrackers ?? DEFAULT_OPTIONS.blockTrackers,
    waitUntil: dto.waitUntil ?? DEFAULT_OPTIONS.waitUntil,
  };
}

/**
 * Extract metadata from page
 */
async function extractPageMetadata(page: Page): Promise<IScreenshotMetadata> {
  try {
    const metadata = await page.evaluate(() => {
      const title = document.title || undefined;
      const description =
        document.querySelector('meta[name="description"]')?.getAttribute('content') || undefined;
      const favicon =
        (document.querySelector('link[rel="icon"]') as HTMLLinkElement)?.href ||
        (document.querySelector('link[rel="shortcut icon"]') as HTMLLinkElement)?.href ||
        undefined;

      return {
        pageTitle: title,
        pageDescription: description,
        faviconUrl: favicon,
      };
    });

    return metadata;
  } catch (error) {
    logger.warn('Failed to extract page metadata', { error });
    return {};
  }
}

/**
 * Take the actual screenshot
 */
async function captureScreenshot(
  page: Page,
  options: IScreenshotOptions
): Promise<{ buffer: Buffer; width: number; height: number }> {
  const puppeteerOptions: PuppeteerScreenshotOptions = {
    type: options.format === 'pdf' ? undefined : options.format,
    quality: options.format === 'png' ? undefined : options.quality,
    fullPage: options.fullPage,
    omitBackground: false,
  };

  // Handle clip rect or selector
  if (options.clipRect && !options.fullPage) {
    puppeteerOptions.clip = options.clipRect;
  } else if (options.selector && !options.fullPage) {
    const element = await page.$(options.selector);
    if (element) {
      const box = await element.boundingBox();
      if (box) {
        puppeteerOptions.clip = {
          x: box.x,
          y: box.y,
          width: box.width,
          height: box.height,
        };
      }
    }
  }

  let buffer: Buffer;
  let width = options.width;
  let height = options.height;

  if (options.format === 'pdf') {
    // PDF generation
    buffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '1cm', right: '1cm', bottom: '1cm', left: '1cm' },
    });
    // PDF dimensions are A4
    width = 595;
    height = 842;
  } else {
    // Image screenshot
    buffer = await page.screenshot(puppeteerOptions);

    // Get actual dimensions
    if (options.fullPage) {
      const dimensions = await page.evaluate(() => ({
        width: document.documentElement.scrollWidth,
        height: document.documentElement.scrollHeight,
      }));
      width = dimensions.width;
      height = dimensions.height;
    }
  }

  return { buffer, width, height };
}

// ============================================
// Main Functions
// ============================================

/**
 * Create a new screenshot
 */
export async function createScreenshot(
  dto: CreateScreenshotDTO,
  user: IUser,
  apiKey?: IApiKey
): Promise<CaptureResult> {
  const startTime = Date.now();
  let browser = null;
  let page = null;
  let screenshotDoc: IScreenshot | null = null;

  try {
    // Check usage quota
    await checkUsageQuota(user);

    // Merge and validate options
    const options = mergeOptions(dto);
    validateOptionsAgainstPlan(options, user);

    // Create screenshot document with pending status
    screenshotDoc = await Screenshot.create({
      user: user._id,
      apiKey: apiKey?._id,
      url: dto.url,
      options,
      result: { status: 'pending' as ScreenshotStatus },
      metadata: {},
      webhook: dto.webhook ? { url: dto.webhook, attempts: 0 } : undefined,
      expiresAt: new Date(Date.now() + config.storage.expiryDays * 24 * 60 * 60 * 1000),
    });

    // Update status to processing
    screenshotDoc.result.status = 'processing';
    await screenshotDoc.save();

    // Get browser from pool
    browser = await getBrowser();
    page = await createPage(browser, {
      blockAds: options.blockAds,
      blockTrackers: options.blockTrackers,
      userAgent: options.userAgent,
      headers: options.headers,
      cookies: options.cookies,
      viewport: { width: options.width, height: options.height },
    });

    // Enable dark mode if requested
    if (options.darkMode) {
      await emulateDarkMode(page);
    }

    // Navigate to URL
    await page.goto(dto.url, {
      waitUntil: options.waitUntil,
      timeout: config.puppeteer.timeout,
    });

    // Wait for delay if specified
    if (options.delay > 0) {
      await new Promise((resolve) => setTimeout(resolve, options.delay));
    }

    // Extract page metadata
    const metadata = await extractPageMetadata(page);

    // Capture screenshot
    const { buffer, width, height } = await captureScreenshot(page, options);

    // Generate storage key and save
    const storageKey = generateStorageKey(
      user._id.toString(),
      options.format,
      screenshotDoc._id.toString()
    );

    const storageResult = await saveScreenshot(storageKey, buffer, options.format);

    // Calculate duration
    const duration = Date.now() - startTime;

    // Update screenshot document
    screenshotDoc.result = {
      status: 'completed',
      url: storageResult.url,
      localPath: storageKey,
      size: storageResult.size,
      duration,
    };
    screenshotDoc.metadata = {
      ...metadata,
      screenshotWidth: width,
      screenshotHeight: height,
    };
    await screenshotDoc.save();

    // Increment user usage
    await user.incrementUsage();

    logger.info('Screenshot captured successfully', {
      screenshotId: screenshotDoc._id,
      userId: user._id,
      url: dto.url,
      duration,
      size: storageResult.size,
    });

    // Send webhook if configured
    if (dto.webhook) {
      // Fire and forget - don't await
      sendWebhook(screenshotDoc).catch((error) => {
        logger.error('Failed to send webhook', { error, screenshotId: screenshotDoc?._id });
      });
    }

    return { screenshot: screenshotDoc, buffer };
  } catch (error) {
    // Update screenshot document with error
    if (screenshotDoc) {
      screenshotDoc.result = {
        status: 'failed',
        error: error instanceof Error ? error.message : 'Unknown error',
        duration: Date.now() - startTime,
      };
      await screenshotDoc.save();
    }

    logger.error('Screenshot capture failed', {
      error: error instanceof Error ? error.message : error,
      url: dto.url,
      userId: user._id,
    });

    throw error;
  } finally {
    // Cleanup
    if (page) {
      await closePage(page);
    }
    if (browser) {
      releaseBrowser(browser);
    }
  }
}

/**
 * Get screenshot by ID
 */
export async function getScreenshotById(
  screenshotId: string,
  userId: Types.ObjectId
): Promise<IScreenshot | null> {
  // Try cache first
  const cacheKey = `screenshot:${screenshotId}`;
  const cached = await cache.get<IScreenshot>(cacheKey);
  if (cached && cached.user.toString() === userId.toString()) {
    return cached;
  }

  const screenshot = await Screenshot.findOne({
    _id: screenshotId,
    user: userId,
  });

  if (screenshot) {
    // Cache for 5 minutes
    await cache.set(cacheKey, screenshot.toObject(), 300);
  }

  return screenshot;
}

/**
 * List user's screenshots with pagination
 */
export async function listScreenshots(
  userId: Types.ObjectId,
  options: PaginationOptions & {
    status?: ScreenshotStatus;
    format?: ScreenshotFormat;
    startDate?: Date;
    endDate?: Date;
  }
): Promise<ListScreenshotsResult> {
  const {
    page = 1,
    limit = 20,
    sort = 'createdAt',
    order = 'desc',
    status,
    format,
    startDate,
    endDate,
  } = options;

  // Build query
  const query: Record<string, unknown> = { user: userId };

  if (status) {
    query['result.status'] = status;
  }

  if (format) {
    query['options.format'] = format;
  }

  if (startDate || endDate) {
    query.createdAt = {};
    if (startDate) {
      (query.createdAt as Record<string, Date>).$gte = startDate;
    }
    if (endDate) {
      (query.createdAt as Record<string, Date>).$lte = endDate;
    }
  }

  // Execute queries
  const [screenshots, total] = await Promise.all([
    Screenshot.find(query)
      .sort({ [sort]: order === 'asc' ? 1 : -1 })
      .skip((page - 1) * limit)
      .limit(limit),
    Screenshot.countDocuments(query),
  ]);

  return {
    screenshots,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

/**
 * Delete a screenshot
 */
export async function deleteScreenshotById(
  screenshotId: string,
  userId: Types.ObjectId
): Promise<boolean> {
  const screenshot = await Screenshot.findOne({
    _id: screenshotId,
    user: userId,
  });

  if (!screenshot) {
    return false;
  }

  // Delete from storage
  if (screenshot.result.localPath) {
    try {
      await deleteScreenshot(screenshot.result.localPath);
    } catch (error) {
      logger.warn('Failed to delete screenshot from storage', {
        error,
        key: screenshot.result.localPath,
      });
    }
  }

  // Delete from database
  await screenshot.deleteOne();

  // Invalidate cache
  await cache.delete(`screenshot:${screenshotId}`);

  logger.info('Screenshot deleted', { screenshotId, userId });

  return true;
}

/**
 * Get a fresh signed URL for a screenshot
 */
export async function refreshScreenshotUrl(
  screenshotId: string,
  userId: Types.ObjectId
): Promise<string | null> {
  const screenshot = await getScreenshotById(screenshotId, userId);

  if (!screenshot || !screenshot.result.localPath) {
    return null;
  }

  // Generate new signed URL
  const signedUrl = await getSignedScreenshotUrl(screenshot.result.localPath, 3600);

  // Update screenshot document
  screenshot.result.url = signedUrl;
  await screenshot.save();

  // Invalidate cache
  await cache.delete(`screenshot:${screenshotId}`);

  return signedUrl;
}

/**
 * Send webhook notification
 */
async function sendWebhook(screenshot: IScreenshot): Promise<void> {
  if (!screenshot.webhook?.url) {
    return;
  }

  const maxAttempts = 3;
  let attempt = screenshot.webhook.attempts + 1;

  while (attempt <= maxAttempts) {
    try {
      const response = await fetch(screenshot.webhook.url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Webhook-Event': 'screenshot.completed',
        },
        body: JSON.stringify({
          id: screenshot._id,
          url: screenshot.url,
          status: screenshot.result.status,
          screenshotUrl: screenshot.result.url,
          size: screenshot.result.size,
          duration: screenshot.result.duration,
          metadata: screenshot.metadata,
          createdAt: screenshot.createdAt,
        }),
      });

      screenshot.webhook.sentAt = new Date();
      screenshot.webhook.status = response.status;
      screenshot.webhook.attempts = attempt;
      await screenshot.save();

      logger.info('Webhook sent successfully', {
        screenshotId: screenshot._id,
        webhookUrl: screenshot.webhook.url,
        status: response.status,
      });

      return;
    } catch (error) {
      logger.warn('Webhook attempt failed', {
        screenshotId: screenshot._id,
        attempt,
        error: error instanceof Error ? error.message : error,
      });

      screenshot.webhook.attempts = attempt;
      await screenshot.save();

      attempt++;

      // Wait before retry
      if (attempt <= maxAttempts) {
        await new Promise((resolve) => setTimeout(resolve, attempt * 1000));
      }
    }
  }

  logger.error('Webhook failed after max attempts', {
    screenshotId: screenshot._id,
    webhookUrl: screenshot.webhook.url,
    attempts: maxAttempts,
  });
}

/**
 * Retry a failed screenshot
 */
export async function retryScreenshot(
  screenshotId: string,
  userId: Types.ObjectId
): Promise<CaptureResult | null> {
  const originalScreenshot = await getScreenshotById(screenshotId, userId);

  if (!originalScreenshot || originalScreenshot.result.status !== 'failed') {
    return null;
  }

  // Get user
  const user = await User.findById(userId);
  if (!user) {
    return null;
  }

  // Create new screenshot with same options
  const dto: CreateScreenshotDTO = {
    url: originalScreenshot.url,
    ...originalScreenshot.options,
    webhook: originalScreenshot.webhook?.url,
  };

  // Delete the failed screenshot
  await deleteScreenshotById(screenshotId, userId);

  // Create new screenshot
  return createScreenshot(dto, user);
}

/**
 * Get screenshot statistics for a user
 */
export async function getScreenshotStats(
  userId: Types.ObjectId,
  startDate?: Date,
  endDate?: Date
): Promise<{
  total: number;
  successful: number;
  failed: number;
  pending: number;
  totalSize: number;
  avgDuration: number;
  byFormat: Record<ScreenshotFormat, number>;
}> {
  const query: Record<string, unknown> = { user: userId };

  if (startDate || endDate) {
    query.createdAt = {};
    if (startDate) {
      (query.createdAt as Record<string, Date>).$gte = startDate;
    }
    if (endDate) {
      (query.createdAt as Record<string, Date>).$lte = endDate;
    }
  }

  const stats = await Screenshot.aggregate([
    { $match: query },
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        successful: {
          $sum: { $cond: [{ $eq: ['$result.status', 'completed'] }, 1, 0] },
        },
        failed: {
          $sum: { $cond: [{ $eq: ['$result.status', 'failed'] }, 1, 0] },
        },
        pending: {
          $sum: {
            $cond: [{ $in: ['$result.status', ['pending', 'processing']] }, 1, 0],
          },
        },
        totalSize: { $sum: { $ifNull: ['$result.size', 0] } },
        avgDuration: { $avg: { $ifNull: ['$result.duration', 0] } },
      },
    },
  ]);

  const formatStats = await Screenshot.aggregate([
    { $match: query },
    {
      $group: {
        _id: '$options.format',
        count: { $sum: 1 },
      },
    },
  ]);

  const byFormat: Record<ScreenshotFormat, number> = {
    png: 0,
    jpeg: 0,
    webp: 0,
    pdf: 0,
  };

  for (const stat of formatStats) {
    if (stat._id && stat._id in byFormat) {
      byFormat[stat._id as ScreenshotFormat] = stat.count;
    }
  }

  const result = stats[0] || {
    total: 0,
    successful: 0,
    failed: 0,
    pending: 0,
    totalSize: 0,
    avgDuration: 0,
  };

  return {
    ...result,
    avgDuration: Math.round(result.avgDuration || 0),
    byFormat,
  };
}

// ============================================
// Export
// ============================================

export default {
  createScreenshot,
  getScreenshotById,
  listScreenshots,
  deleteScreenshotById,
  refreshScreenshotUrl,
  retryScreenshot,
  getScreenshotStats,
  validateOptionsAgainstPlan,
  checkUsageQuota,
};
