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
  validatePasswordResetToken,
  resetPassword,
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

// Subscription Service
export {
  getOrCreateCustomer,
  updateCustomerEmail,
  createCheckoutSession,
  createPortalSession,
  getSubscriptionDetails,
  cancelSubscription,
  resumeSubscription,
  changePlan,
  handleWebhookEvent,
  getUsageStats,
  getAvailablePlans,
} from './subscription.service';

// Analytics Service
export {
  getOverview,
  getScreenshotStats as getAnalyticsScreenshotStats,
  getUsageOverTime,
  getErrorBreakdown,
  getPopularUrls,
  getApiKeyStats,
  recordUsage,
} from './analytics.service';

// Login Attempts Service
export {
  loginAttemptsService,
  createIdentifier,
  recordFailedAttempt,
  recordSuccessfulLogin,
  isLocked as isAccountLocked,
  getRemainingAttempts,
  getLockoutExpiry,
  getAttemptInfo,
} from './loginAttempts.service';

// IP Reputation Service
export {
  ipReputationService,
  recordLockout,
  markSuspicious,
  isSuspicious,
  getLockoutCount,
  clearReputation,
  getReputationInfo,
} from './ipReputation.service';

// Email Service
export { emailService, EmailService, EmailOptions, EmailResult } from './email.service';
