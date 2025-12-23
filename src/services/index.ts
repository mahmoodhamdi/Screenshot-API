/**
 * Services Index
 * Exports all service functions
 */

// Auth Service
export {
  generateAccessToken,
  generateRefreshToken,
  generateTokenPair,
  verifyAccessToken,
  verifyRefreshToken,
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  removeAllRefreshTokens,
  authenticateApiKey,
  createApiKey,
  revokeApiKey,
  hashPassword,
  comparePassword,
  changePassword,
  generatePasswordResetToken,
  generateVerificationToken,
  verifyEmail,
} from './auth.service';

// Screenshot Service
export {
  createScreenshot,
  getScreenshotById,
  listScreenshots,
  deleteScreenshotById,
  refreshScreenshotUrl,
  retryScreenshot,
  getScreenshotStats,
  validateOptionsAgainstPlan,
  checkUsageQuota,
} from './screenshot.service';

// Storage Service
export {
  generateStorageKey,
  getContentType,
  getFileExtension,
  saveScreenshot,
  getScreenshot,
  deleteScreenshot,
  screenshotExists,
  getScreenshotMetadata,
  getSignedScreenshotUrl,
  cleanupExpiredScreenshots,
} from './storage.service';
