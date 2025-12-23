/**
 * Puppeteer Configuration
 * Browser pool management for screenshot capture
 */

import puppeteer, { Browser, Page, PuppeteerLaunchOptions } from 'puppeteer';
import { config } from './index';
import { logger } from '@utils/logger';

/**
 * Browser instance pool
 */
interface BrowserInstance {
  browser: Browser;
  inUse: boolean;
  createdAt: Date;
  usageCount: number;
}

const browserPool: BrowserInstance[] = [];
const MAX_BROWSER_AGE_MS = 30 * 60 * 1000; // 30 minutes
const MAX_USAGE_COUNT = 100;

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
 * Create a new browser instance
 * @param options - Additional launch options
 * @returns Browser instance
 */
export const createBrowser = async (
  options?: Partial<PuppeteerLaunchOptions>
): Promise<Browser> => {
  try {
    const launchOptions = { ...defaultLaunchOptions, ...options };
    const browser = await puppeteer.launch(launchOptions);

    logger.info('New browser instance created');

    browser.on('disconnected', () => {
      logger.warn('Browser disconnected');
      // Remove from pool
      const index = browserPool.findIndex((b) => b.browser === browser);
      if (index !== -1) {
        browserPool.splice(index, 1);
      }
    });

    return browser;
  } catch (error) {
    logger.error('Failed to create browser instance:', error);
    throw error;
  }
};

/**
 * Get an available browser from the pool or create a new one
 * @returns Browser instance
 */
export const getBrowser = async (): Promise<Browser> => {
  // Clean up old or overused browsers
  await cleanupBrowserPool();

  // Find an available browser
  const available = browserPool.find((b) => !b.inUse);
  if (available) {
    available.inUse = true;
    available.usageCount++;
    return available.browser;
  }

  // Create new browser if pool not full
  if (browserPool.length < config.puppeteer.maxConcurrent) {
    const browser = await createBrowser();
    browserPool.push({
      browser,
      inUse: true,
      createdAt: new Date(),
      usageCount: 1,
    });
    return browser;
  }

  // Wait for an available browser
  return new Promise((resolve) => {
    const checkInterval = setInterval(async () => {
      const available = browserPool.find((b) => !b.inUse);
      if (available) {
        clearInterval(checkInterval);
        available.inUse = true;
        available.usageCount++;
        resolve(available.browser);
      }
    }, 100);
  });
};

/**
 * Release a browser back to the pool
 * @param browser - Browser instance to release
 */
export const releaseBrowser = (browser: Browser): void => {
  const instance = browserPool.find((b) => b.browser === browser);
  if (instance) {
    instance.inUse = false;
  }
};

/**
 * Clean up old or overused browsers
 */
const cleanupBrowserPool = async (): Promise<void> => {
  const now = Date.now();

  for (let i = browserPool.length - 1; i >= 0; i--) {
    const instance = browserPool[i];
    const age = now - instance.createdAt.getTime();

    // Close old or overused browsers that are not in use
    if (!instance.inUse && (age > MAX_BROWSER_AGE_MS || instance.usageCount >= MAX_USAGE_COUNT)) {
      try {
        await instance.browser.close();
        browserPool.splice(i, 1);
        logger.info('Cleaned up old browser instance');
      } catch (error) {
        logger.error('Error closing browser:', error);
        browserPool.splice(i, 1);
      }
    }
  }
};

/**
 * Create a new page with default settings
 * @param browser - Browser instance
 * @param options - Page configuration options
 * @returns Configured page
 */
export const createPage = async (
  browser: Browser,
  options?: {
    blockAds?: boolean;
    blockTrackers?: boolean;
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

  // Block ads and trackers
  if (options?.blockAds || options?.blockTrackers) {
    await page.setRequestInterception(true);
    page.on('request', (request) => {
      const url = request.url();
      const shouldBlock = blockedDomains.some((domain) => url.includes(domain));

      if (shouldBlock) {
        void request.abort();
      } else {
        void request.continue();
      }
    });
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

  const closePromises = browserPool.map(async (instance) => {
    try {
      await instance.browser.close();
    } catch (error) {
      logger.error('Error closing browser:', error);
    }
  });

  await Promise.all(closePromises);
  browserPool.length = 0;

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
} => {
  const active = browserPool.filter((b) => b.inUse).length;
  return {
    total: browserPool.length,
    active,
    available: browserPool.length - active,
    maxSize: config.puppeteer.maxConcurrent,
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
};
