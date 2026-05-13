import { chromium } from '@playwright/test';
import { mkdir, rm } from 'node:fs/promises';
import { join } from 'node:path';

const BASE = 'http://localhost:3013';
const OUT = join(process.cwd(), 'screenshots');
const VIDEO_DIR = join(process.cwd(), 'videos');

const VIEWPORTS = {
  desktop: { width: 1920, height: 1080 },
  tablet: { width: 1024, height: 768 },
  mobile: { width: 390, height: 844 },
};

async function captureAt(viewport, name, route, wait = 1500) {
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const context = await browser.newContext({ viewport, locale: 'en-US' });
  const page = await context.newPage();
  await page.goto(`${BASE}${route}`, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForLoadState('networkidle', { timeout: 12000 }).catch(() => {});
  await page.waitForTimeout(wait);
  await page.screenshot({ path: join(OUT, `${name}.png`), fullPage: false });
  console.log(`Captured ${name}.png (${viewport.width}x${viewport.height})`);
  await browser.close();
}

async function recordWalkthrough() {
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const context = await browser.newContext({
    viewport: VIEWPORTS.desktop, locale: 'en-US',
    recordVideo: { dir: VIDEO_DIR, size: VIEWPORTS.desktop },
  });
  const page = await context.newPage();
  await page.goto(`${BASE}/`, { waitUntil: 'domcontentloaded' });
  await page.waitForLoadState('networkidle', { timeout: 12000 }).catch(() => {});
  await page.waitForTimeout(6000);
  for (const path of ['/login', '/register', '/dashboard', '/dashboard/screenshots', '/dashboard/api-keys', '/dashboard/webhooks', '/dashboard/billing', '/dashboard/usage', '/dashboard/settings']) {
    await page.goto(`${BASE}${path}`, { waitUntil: 'domcontentloaded' }).catch(() => {});
    await page.waitForLoadState('networkidle', { timeout: 8000 }).catch(() => {});
    await page.waitForTimeout(11000);
  }
  await page.close();
  await context.close();
  await browser.close();
  console.log('Walkthrough recorded.');
}

async function main() {
  await rm(OUT, { recursive: true, force: true });
  await mkdir(OUT, { recursive: true });
  await mkdir(VIDEO_DIR, { recursive: true });

  await captureAt(VIEWPORTS.desktop, 'desktop-01-landing', '/');
  await captureAt(VIEWPORTS.desktop, 'desktop-02-login', '/login');
  await captureAt(VIEWPORTS.desktop, 'desktop-03-dashboard', '/dashboard');

  await captureAt(VIEWPORTS.tablet, 'tablet-01-register', '/register');
  await captureAt(VIEWPORTS.tablet, 'tablet-02-dashboard', '/dashboard');

  await captureAt(VIEWPORTS.mobile, 'mobile-01-landing', '/');
  await captureAt(VIEWPORTS.mobile, 'mobile-02-login', '/login');
  await captureAt(VIEWPORTS.mobile, 'mobile-03-dashboard', '/dashboard');

  await recordWalkthrough();
}

main().catch((err) => { console.error(err); process.exit(1); });
