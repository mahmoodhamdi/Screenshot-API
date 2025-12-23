/**
 * Controllers Index
 * Exports all controller functions
 */

export {
  create as createScreenshot,
  getById as getScreenshotById,
  list as listScreenshots,
  remove as deleteScreenshot,
  refreshUrl as refreshScreenshotUrl,
  retry as retryScreenshot,
  stats as getScreenshotStats,
  download as downloadScreenshot,
} from './screenshot.controller';

// Default exports for route use
export { default as screenshotController } from './screenshot.controller';
