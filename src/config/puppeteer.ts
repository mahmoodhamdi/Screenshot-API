/**
 * Puppeteer Configuration
 * Browser pool management for screenshot capture
 */

import puppeteer, { Browser, Page, PuppeteerLaunchOptions } from 'puppeteer';
import { config } from './index';
import { logger } from '@utils/logger';
import { PlanType } from '@/types';

// ============================================
// Types & Configuration
// ============================================

/**
 * Browser instance in pool
 */
interface BrowserInstance {
  id: string;
  browser: Browser;
  pageCount: number;
  createdAt: Date;
  usageCount: number;
  lastUsedAt: Date;
  memoryUsage: number;
}

/**
 * Pool configuration
 */
interface BrowserPoolConfig {
  minBrowsers: number;
  maxBrowsers: number;
  maxPagesPerBrowser: number;
  browserIdleTimeoutMs: number;
  browserMaxAgeMs: number;
  browserMaxUsageCount: number;
  memoryThresholdMb: number;
  cleanupIntervalMs: number;
}

/**
 * Request waiting for browser
 */
interface QueuedRequest {
  resolve: (browser: Browser) => void;
  reject: (error: Error) => void;
  timestamp: number;
  timeoutId: NodeJS.Timeout;
}

// Pool configuration with defaults
const poolConfig: BrowserPoolConfig = {
  minBrowsers: 1,
  maxBrowsers: config.puppeteer.maxConcurrent,
  maxPagesPerBrowser: 10,
  browserIdleTimeoutMs: 5 * 60 * 1000, // 5 minutes
  browserMaxAgeMs: 30 * 60 * 1000, // 30 minutes
  browserMaxUsageCount: 100,
  memoryThresholdMb: 500, // 500 MB per browser
  cleanupIntervalMs: 60 * 1000, // 1 minute
};

// Browser pool state
const browserPool: Map<string, BrowserInstance> = new Map();
const requestQueue: QueuedRequest[] = [];
let cleanupIntervalId: NodeJS.Timeout | null = null;
let browserIdCounter = 0;

// ============================================
// Plan-Based Timeout Configuration
// ============================================

/**
 * Get timeout based on user's plan
 */
export const getTimeoutForPlan = (plan: PlanType): number => {
  const timeouts: Record<PlanType, number> = {
    free: 15000, // 15 seconds
    starter: 30000, // 30 seconds
    professional: 45000, // 45 seconds
    enterprise: 60000, // 60 seconds
  };
  return timeouts[plan] || config.puppeteer.timeout;
};

/**
 * Get navigation timeout for plan
 */
export const getNavigationTimeoutForPlan = (plan: PlanType): number => {
  // Navigation can be slightly longer than screenshot timeout
  return Math.min(getTimeoutForPlan(plan) * 1.2, 60000);
};

/**
 * Default Puppeteer launch options
 */
const defaultLaunchOptions: PuppeteerLaunchOptions = {
  headless: config.puppeteer.headless,
  args: [
    '--no-sandbox',
    '--disable-setuid-sandbox',
    '--disable-dev-shm-usage',
    '--disable-accelerated-2d-canvas',
    '--disable-gpu',
    '--window-size=1920,1080',
    '--disable-web-security',
    '--disable-features=IsolateOrigins,site-per-process',
    '--disable-site-isolation-trials',
    '--disable-background-timer-throttling',
    '--disable-backgrounding-occluded-windows',
    '--disable-renderer-backgrounding',
    '--disable-infobars',
    '--hide-scrollbars',
    '--mute-audio',
  ],
  defaultViewport: {
    width: 1920,
    height: 1080,
  },
  ignoreHTTPSErrors: true,
  timeout: config.puppeteer.timeout,
};

/**
 * Ad and tracker blocking domains
 */
export const blockedDomains: string[] = [
  'googlesyndication.com',
  'googleadservices.com',
  'doubleclick.net',
  'google-analytics.com',
  'googletagmanager.com',
  'facebook.net',
  'facebook.com/tr',
  'connect.facebook.net',
  'analytics.twitter.com',
  'ads.twitter.com',
  'amazon-adsystem.com',
  'adsrvr.org',
  'adnxs.com',
  'bing.com/bat',
  'bat.bing.com',
  'criteo.com',
  'criteo.net',
  'outbrain.com',
  'taboola.com',
  'quantserve.com',
  'scorecardresearch.com',
  'hotjar.com',
  'mixpanel.com',
  'amplitude.com',
  'segment.io',
  'segment.com',
  'intercom.io',
  'zendesk.com/embeddable_framework',
  'drift.com',
  'optimizely.com',
  'crazyegg.com',
  'fullstory.com',
  'mouseflow.com',
  'clarity.ms',
];

/**
 * Compiled regex patterns for faster ad/tracker blocking
 * Pre-compiled for O(1) lookup instead of O(n) string matching
 */
export const blockedPatterns: RegExp[] = blockedDomains.map(
  (domain) => new RegExp(domain.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i')
);

/**
 * Combined pattern for single-pass URL matching (most efficient)
 */
export const combinedBlockPattern: RegExp = new RegExp(
  blockedDomains.map((d) => d.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|'),
  'i'
);

/**
 * Resource types that can be blocked for faster page loads
 */
export const blockableResourceTypes = {
  ads: ['script', 'xhr', 'fetch'] as const,
  images: ['image', 'imageset'] as const,
  media: ['media'] as const,
  fonts: ['font'] as const,
  stylesheets: ['stylesheet'] as const,
} as const;

// ============================================
// Browser Pool Management
// ============================================

/**
 * Generate unique browser ID
 */
const generateBrowserId = (): string => {
  return `browser_${++browserIdCounter}_${Date.now()}`;
};

/**
 * Create a new browser instance
 * @param options - Additional launch options
 * @returns Browser instance with ID
 */
export const createBrowser = async (
  options?: Partial<PuppeteerLaunchOptions>
): Promise<{ browser: Browser; id: string }> => {
  const id = generateBrowserId();

  try {
    const launchOptions = { ...defaultLaunchOptions, ...options };
    const browser = await puppeteer.launch(launchOptions);

    logger.info('New browser instance created', { browserId: id });

    browser.on('disconnected', () => {
      logger.warn('Browser disconnected', { browserId: id });
      // Remove from pool
      browserPool.delete(id);
      // Process queue in case there are waiting requests
      processQueue();
    });

    return { browser, id };
  } catch (error) {
    logger.error('Failed to create browser instance:', { browserId: id, error });
    throw error;
  }
};

/**
 * Find a browser with available capacity
 */
const findAvailableBrowser = (): BrowserInstance | null => {
  for (const [, instance] of browserPool) {
    if (instance.pageCount < poolConfig.maxPagesPerBrowser) {
      return instance;
    }
  }
  return null;
};

/**
 * Get an available browser from the pool or create a new one
 * Uses promise-based queue instead of polling
 * @param timeoutMs - Maximum time to wait for a browser (default: 30s)
 * @returns Browser instance
 */
export const getBrowser = async (timeoutMs: number = 30000): Promise<Browser> => {
  // Try to find an available browser
  const available = findAvailableBrowser();
  if (available) {
    available.pageCount++;
    available.usageCount++;
    available.lastUsedAt = new Date();
    return available.browser;
  }

  // Create new browser if pool not full
  if (browserPool.size < poolConfig.maxBrowsers) {
    const { browser, id } = await createBrowser();
    browserPool.set(id, {
      id,
      browser,
      pageCount: 1,
      createdAt: new Date(),
      usageCount: 1,
      lastUsedAt: new Date(),
      memoryUsage: 0,
    });

    // Start cleanup interval if not running
    startCleanupInterval();

    return browser;
  }

  // Queue the request and wait
  return new Promise((resolve, reject) => {
    const timeoutId = setTimeout(() => {
      // Remove from queue on timeout
      const index = requestQueue.findIndex((r) => r.timeoutId === timeoutId);
      if (index !== -1) {
        requestQueue.splice(index, 1);
      }
      reject(new Error('Timeout waiting for available browser'));
    }, timeoutMs);

    requestQueue.push({
      resolve,
      reject,
      timestamp: Date.now(),
      timeoutId,
    });
  });
};

/**
 * Process queued requests when a browser becomes available
 */
const processQueue = (): void => {
  if (requestQueue.length === 0) return;

  const available = findAvailableBrowser();
  if (!available) return;

  const request = requestQueue.shift();
  if (request) {
    clearTimeout(request.timeoutId);
    available.pageCount++;
    available.usageCount++;
    available.lastUsedAt = new Date();
    request.resolve(available.browser);
  }
};

/**
 * Release a browser back to the pool (decrement page count)
 * @param browser - Browser instance to release
 */
export const releaseBrowser = (browser: Browser): void => {
  for (const [, instance] of browserPool) {
    if (instance.browser === browser) {
      instance.pageCount = Math.max(0, instance.pageCount - 1);

      // Process queue to give waiting requests a chance
      processQueue();
      return;
    }
  }
};

/**
 * Check if a browser should be recycled
 */
const shouldRecycleBrowser = (instance: BrowserInstance): boolean => {
  const now = Date.now();
  const age = now - instance.createdAt.getTime();
  const idleTime = now - instance.lastUsedAt.getTime();

  return (
    // Too old
    age > poolConfig.browserMaxAgeMs ||
    // Too many usages
    instance.usageCount >= poolConfig.browserMaxUsageCount ||
    // Idle for too long (and not the last browser)
    (idleTime > poolConfig.browserIdleTimeoutMs && browserPool.size > poolConfig.minBrowsers) ||
    // Memory threshold exceeded
    instance.memoryUsage > poolConfig.memoryThresholdMb * 1024 * 1024
  );
};

/**
 * Clean up old, overused, or high-memory browsers
 */
const cleanupBrowserPool = async (): Promise<void> => {
  const browsersToClose: string[] = [];

  for (const [id, instance] of browserPool) {
    // Only close browsers that are not in use (pageCount === 0)
    if (instance.pageCount === 0 && shouldRecycleBrowser(instance)) {
      browsersToClose.push(id);
    }
  }

  for (const id of browsersToClose) {
    const instance = browserPool.get(id);
    if (instance) {
      try {
        await instance.browser.close();
        browserPool.delete(id);
        logger.info('Cleaned up browser instance', {
          browserId: id,
          reason: instance.memoryUsage > poolConfig.memoryThresholdMb * 1024 * 1024
            ? 'high_memory'
            : instance.usageCount >= poolConfig.browserMaxUsageCount
              ? 'max_usage'
              : 'age_or_idle',
        });
      } catch (error) {
        logger.error('Error closing browser:', { browserId: id, error });
        browserPool.delete(id);
      }
    }
  }
};

/**
 * Start the cleanup interval
 */
const startCleanupInterval = (): void => {
  if (cleanupIntervalId) return;

  cleanupIntervalId = setInterval(async () => {
    await cleanupBrowserPool();
    await updateMemoryMetrics();
  }, poolConfig.cleanupIntervalMs);

  // Don't prevent process from exiting
  cleanupIntervalId.unref();
};

/**
 * Stop the cleanup interval
 */
const stopCleanupInterval = (): void => {
  if (cleanupIntervalId) {
    clearInterval(cleanupIntervalId);
    cleanupIntervalId = null;
  }
};

// ============================================
// Memory Management
// ============================================

/**
 * Update memory metrics for all browsers
 */
const updateMemoryMetrics = async (): Promise<void> => {
  for (const [, instance] of browserPool) {
    try {
      const pages = await instance.browser.pages();
      let totalMemory = 0;

      for (const page of pages) {
        try {
          const metrics = await page.metrics();
          totalMemory += metrics.JSHeapUsedSize || 0;
        } catch {
          // Page might be closed
        }
      }

      instance.memoryUsage = totalMemory;

      if (totalMemory > poolConfig.memoryThresholdMb * 1024 * 1024) {
        logger.warn('Browser memory high', {
          browserId: instance.id,
          memoryMb: Math.round(totalMemory / 1024 / 1024),
          thresholdMb: poolConfig.memoryThresholdMb,
        });
      }
    } catch (error) {
      // Browser might be closed
      logger.debug('Failed to get browser memory metrics', { error });
    }
  }
};

/**
 * Force garbage collection on a browser (if available)
 */
export const triggerBrowserGC = async (browser: Browser): Promise<void> => {
  try {
    const pages = await browser.pages();
    for (const page of pages) {
      try {
        await page.evaluate(() => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const globalGc = (globalThis as any).gc;
          if (typeof globalGc === 'function') globalGc();
        });
      } catch {
        // GC might not be available
      }
    }
  } catch (error) {
    logger.debug('Failed to trigger browser GC', { error });
  }
};

/**
 * Page creation options with resource blocking
 */
export interface CreatePageOptions {
  blockAds?: boolean;
  blockTrackers?: boolean;
  blockImages?: boolean;
  blockMedia?: boolean;
  blockFonts?: boolean;
  userAgent?: string;
  headers?: Record<string, string>;
  cookies?: Array<{
    name: string;
    value: string;
    domain?: string;
    path?: string;
  }>;
  viewport?: { width: number; height: number };
}

/**
 * Setup optimized request interception
 * Only enables interception when needed for performance
 */
const setupRequestInterception = async (
  page: Page,
  options: CreatePageOptions
): Promise<void> => {
  const needsInterception =
    options.blockAds ||
    options.blockTrackers ||
    options.blockImages ||
    options.blockMedia ||
    options.blockFonts;

  if (!needsInterception) {
    return; // Skip interception setup for maximum performance
  }

  await page.setRequestInterception(true);

  // Build list of resource types to block
  const blockedTypes: Set<string> = new Set();
  if (options.blockImages) {
    blockableResourceTypes.images.forEach((t) => blockedTypes.add(t));
  }
  if (options.blockMedia) {
    blockableResourceTypes.media.forEach((t) => blockedTypes.add(t));
  }
  if (options.blockFonts) {
    blockableResourceTypes.fonts.forEach((t) => blockedTypes.add(t));
  }

  page.on('request', (request) => {
    const resourceType = request.resourceType();

    // Fast path: check resource type first (O(1) Set lookup)
    if (blockedTypes.has(resourceType)) {
      void request.abort();
      return;
    }

    // Check for ads/trackers using combined regex (single pass)
    if (options.blockAds || options.blockTrackers) {
      const url = request.url();
      if (combinedBlockPattern.test(url)) {
        void request.abort();
        return;
      }
    }

    void request.continue();
  });
};

/**
 * Create a new page with default settings
 * @param browser - Browser instance
 * @param options - Page configuration options
 * @returns Configured page
 */
export const createPage = async (
  browser: Browser,
  options?: CreatePageOptions
): Promise<Page> => {
  const page = await browser.newPage();

  // Set viewport
  if (options?.viewport) {
    await page.setViewport(options.viewport);
  }

  // Set user agent
  if (options?.userAgent) {
    await page.setUserAgent(options.userAgent);
  }

  // Set extra headers
  if (options?.headers) {
    await page.setExtraHTTPHeaders(options.headers);
  }

  // Set cookies
  if (options?.cookies && options.cookies.length > 0) {
    await page.setCookie(
      ...options.cookies.map((c) => ({
        name: c.name,
        value: c.value,
        domain: c.domain,
        path: c.path || '/',
      }))
    );
  }

  // Setup optimized request interception
  if (options) {
    await setupRequestInterception(page, options);
  }

  // Set default timeout
  page.setDefaultTimeout(config.puppeteer.timeout);
  page.setDefaultNavigationTimeout(config.puppeteer.timeout);

  return page;
};

/**
 * Close a page safely
 * @param page - Page to close
 */
export const closePage = async (page: Page): Promise<void> => {
  try {
    if (!page.isClosed()) {
      await page.close();
    }
  } catch (error) {
    logger.error('Error closing page:', error);
  }
};

/**
 * Close all browsers in the pool
 */
export const closeAllBrowsers = async (): Promise<void> => {
  logger.info('Closing all browser instances...');

  // Stop cleanup interval
  stopCleanupInterval();

  // Reject all queued requests
  for (const request of requestQueue) {
    clearTimeout(request.timeoutId);
    request.reject(new Error('Browser pool is shutting down'));
  }
  requestQueue.length = 0;

  // Close all browsers
  const closePromises: Promise<void>[] = [];
  for (const [id, instance] of browserPool) {
    closePromises.push(
      (async () => {
        try {
          await instance.browser.close();
          logger.debug('Browser closed', { browserId: id });
        } catch (error) {
          logger.error('Error closing browser:', { browserId: id, error });
        }
      })()
    );
  }

  await Promise.all(closePromises);
  browserPool.clear();

  logger.info('All browser instances closed');
};

/**
 * Get browser pool status
 * @returns Pool status information
 */
export const getPoolStatus = (): {
  total: number;
  active: number;
  available: number;
  maxSize: number;
  totalPages: number;
  queueLength: number;
  memoryUsageMb: number;
} => {
  let totalPages = 0;
  let totalMemory = 0;
  let browsersWithCapacity = 0;

  for (const [, instance] of browserPool) {
    totalPages += instance.pageCount;
    totalMemory += instance.memoryUsage;
    if (instance.pageCount < poolConfig.maxPagesPerBrowser) {
      browsersWithCapacity++;
    }
  }

  return {
    total: browserPool.size,
    active: browserPool.size - browsersWithCapacity,
    available: browsersWithCapacity,
    maxSize: poolConfig.maxBrowsers,
    totalPages,
    queueLength: requestQueue.length,
    memoryUsageMb: Math.round(totalMemory / 1024 / 1024),
  };
};

/**
 * Emulate dark mode in page
 * @param page - Page instance
 */
export const emulateDarkMode = async (page: Page): Promise<void> => {
  await page.emulateMediaFeatures([
    {
      name: 'prefers-color-scheme',
      value: 'dark',
    },
  ]);
};

/**
 * Common viewport presets
 */
export const viewportPresets = {
  desktop: { width: 1920, height: 1080 },
  laptop: { width: 1366, height: 768 },
  tablet: { width: 768, height: 1024 },
  mobile: { width: 375, height: 812 },
  mobileLandscape: { width: 812, height: 375 },
} as const;

/**
 * Common user agent strings
 */
export const userAgents = {
  chrome:
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  firefox: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0',
  safari:
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 14_1) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Safari/605.1.15',
  edge: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Edg/120.0.0.0',
  mobile:
    'Mozilla/5.0 (iPhone; CPU iPhone OS 17_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Mobile/15E148 Safari/604.1',
} as const;

// Alias for graceful shutdown
export const closeBrowserPool = closeAllBrowsers;

// ============================================
// Page Cache for Rapid Requests
// ============================================

/**
 * Cached page with metadata
 */
interface CachedPage {
  page: Page;
  browserId: string;
  cacheKey: string;
  lastUsed: number;
  useCount: number;
}

/**
 * Page cache configuration
 */
const pageCacheConfig = {
  maxCachedPages: 5,
  maxPageAge: 60000, // 1 minute max age
  maxPageUseCount: 10, // Reuse up to 10 times before recycling
};

const pageCache: Map<string, CachedPage> = new Map();

/**
 * Generate cache key based on page settings
 */
export const getPageCacheKey = (options: CreatePageOptions): string => {
  const width = options.viewport?.width || 1920;
  const height = options.viewport?.height || 1080;
  const blockAds = options.blockAds || false;
  const blockImages = options.blockImages || false;
  return `${width}x${height}:ads=${blockAds}:img=${blockImages}`;
};

/**
 * Get a page from cache or create a new one
 * Optimized for rapid requests with same settings
 */
export const getOrCreatePage = async (
  browser: Browser,
  options?: CreatePageOptions
): Promise<{ page: Page; fromCache: boolean }> => {
  if (!options) {
    const page = await createPage(browser);
    return { page, fromCache: false };
  }

  const cacheKey = getPageCacheKey(options);
  const cached = pageCache.get(cacheKey);

  // Check if cached page is still valid
  if (cached) {
    const now = Date.now();
    const isExpired = now - cached.lastUsed > pageCacheConfig.maxPageAge;
    const isOverused = cached.useCount >= pageCacheConfig.maxPageUseCount;

    if (!isExpired && !isOverused && !cached.page.isClosed()) {
      cached.lastUsed = now;
      cached.useCount++;
      logger.debug('Page cache hit', { cacheKey, useCount: cached.useCount });
      return { page: cached.page, fromCache: true };
    }

    // Remove expired/overused page
    pageCache.delete(cacheKey);
    if (!cached.page.isClosed()) {
      await closePage(cached.page);
    }
  }

  // Create new page
  const page = await createPage(browser, options);

  // Add to cache if under limit
  if (pageCache.size < pageCacheConfig.maxCachedPages) {
    // Find browser ID for tracking
    let browserId = 'unknown';
    for (const [id, instance] of browserPool) {
      if (instance.browser === browser) {
        browserId = id;
        break;
      }
    }

    pageCache.set(cacheKey, {
      page,
      browserId,
      cacheKey,
      lastUsed: Date.now(),
      useCount: 1,
    });
    logger.debug('Page cached', { cacheKey, cacheSize: pageCache.size });
  }

  return { page, fromCache: false };
};

/**
 * Reset a cached page for reuse (clear cookies, local storage, etc.)
 */
export const resetPageForReuse = async (page: Page): Promise<void> => {
  try {
    // Clear cookies
    const cookies = await page.cookies();
    if (cookies.length > 0) {
      await page.deleteCookie(...cookies);
    }

    // Clear local storage and session storage
    await page.evaluate(() => {
      try {
        localStorage.clear();
        sessionStorage.clear();
      } catch {
        // Storage might not be available
      }
    });

    // Navigate to blank page to clear state
    await page.goto('about:blank', { waitUntil: 'domcontentloaded', timeout: 5000 });
  } catch (error) {
    logger.debug('Failed to reset page', { error });
  }
};

/**
 * Clear all cached pages
 */
export const clearPageCache = async (): Promise<void> => {
  for (const [, cached] of pageCache) {
    if (!cached.page.isClosed()) {
      await closePage(cached.page);
    }
  }
  pageCache.clear();
  logger.debug('Page cache cleared');
};

/**
 * Get page cache stats
 */
export const getPageCacheStats = (): {
  size: number;
  maxSize: number;
  keys: string[];
} => {
  return {
    size: pageCache.size,
    maxSize: pageCacheConfig.maxCachedPages,
    keys: Array.from(pageCache.keys()),
  };
};

export default {
  createBrowser,
  getBrowser,
  releaseBrowser,
  createPage,
  closePage,
  closeAllBrowsers,
  closeBrowserPool,
  getPoolStatus,
  emulateDarkMode,
  viewportPresets,
  userAgents,
  blockedDomains,
  blockedPatterns,
  combinedBlockPattern,
  blockableResourceTypes,
  getTimeoutForPlan,
  getNavigationTimeoutForPlan,
  triggerBrowserGC,
  getOrCreatePage,
  resetPageForReuse,
  clearPageCache,
  getPageCacheStats,
  getPageCacheKey,
};
