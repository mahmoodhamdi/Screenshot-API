/**
 * Auth Routes
 * Defines API endpoints for authentication and authorization
 */

import { Router } from 'express';
import authController from '@controllers/auth.controller';
import {
  authenticateJWT,
  authenticateAny,
  authRateLimit,
  strictRateLimit,
  defaultRateLimit,
  adaptiveAuthRateLimit,
} from '@middlewares/index';
import { validators } from '@middlewares/validation.middleware';
import { validatePasswordStrength, getPasswordStrengthLabel } from '@utils/passwordValidator';

const router = Router();

// ============================================
// Public Routes (with rate limiting)
// ============================================

/**
 * @openapi
 * /auth/register:
 *   post:
 *     summary: Register a new user
 *     description: Create a new user account with email and password
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RegisterRequest'
 *           example:
 *             email: user@example.com
 *             password: SecurePassword123!
 *             name: John Doe
 *             company: Acme Inc
 *     responses:
 *       201:
 *         description: User registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Registration successful
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       $ref: '#/components/schemas/User'
 *                     tokens:
 *                       $ref: '#/components/schemas/AuthTokens'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       409:
 *         description: Email already exists
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               success: false
 *               error:
 *                 code: CONFLICT
 *                 message: Email already registered
 *       429:
 *         $ref: '#/components/responses/RateLimitError'
 */
router.post('/register', adaptiveAuthRateLimit, validators.register, authController.register);

/**
 * @openapi
 * /auth/login:
 *   post:
 *     summary: Login user
 *     description: Authenticate user with email and password
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *           example:
 *             email: user@example.com
 *             password: SecurePassword123!
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Login successful
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       $ref: '#/components/schemas/User'
 *                     tokens:
 *                       $ref: '#/components/schemas/AuthTokens'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         description: Invalid credentials
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               success: false
 *               error:
 *                 code: UNAUTHORIZED
 *                 message: Invalid email or password
 *       429:
 *         $ref: '#/components/responses/RateLimitError'
 */
router.post('/login', adaptiveAuthRateLimit, validators.login, authController.login);

/**
 * @openapi
 * /auth/refresh:
 *   post:
 *     summary: Refresh access token
 *     description: Get a new access token using a valid refresh token
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - refreshToken
 *             properties:
 *               refreshToken:
 *                 type: string
 *                 description: Valid refresh token
 *           example:
 *             refreshToken: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *     responses:
 *       200:
 *         description: Tokens refreshed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/AuthTokens'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         description: Invalid or expired refresh token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               success: false
 *               error:
 *                 code: UNAUTHORIZED
 *                 message: Invalid or expired refresh token
 *       429:
 *         $ref: '#/components/responses/RateLimitError'
 */
router.post('/refresh', authRateLimit, authController.refresh);

/**
 * @openapi
 * /auth/verify-email:
 *   post:
 *     summary: Verify email address
 *     description: Verify user's email address using verification token
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - token
 *             properties:
 *               token:
 *                 type: string
 *                 description: Email verification token
 *     responses:
 *       200:
 *         description: Email verified successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Email verified successfully
 *       400:
 *         description: Invalid or expired verification token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       429:
 *         $ref: '#/components/responses/RateLimitError'
 */
router.post('/verify-email', authRateLimit, authController.verifyEmail);

/**
 * @openapi
 * /auth/forgot-password:
 *   post:
 *     summary: Request password reset
 *     description: Send password reset email to user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *           example:
 *             email: user@example.com
 *     responses:
 *       200:
 *         description: Password reset email sent (if email exists)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: If the email exists, a reset link has been sent
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       429:
 *         $ref: '#/components/responses/RateLimitError'
 */
router.post(
  '/forgot-password',
  strictRateLimit,
  validators.forgotPassword,
  authController.forgotPassword
);

/**
 * @openapi
 * /auth/check-password-strength:
 *   post:
 *     summary: Check password strength
 *     description: Analyze password strength for UI feedback during registration or password change
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - password
 *             properties:
 *               password:
 *                 type: string
 *                 description: Password to check
 *               email:
 *                 type: string
 *                 description: User email (optional, for checking similarity)
 *               name:
 *                 type: string
 *                 description: User name (optional, for checking similarity)
 *           example:
 *             password: MyP@ssword123
 *             email: user@example.com
 *     responses:
 *       200:
 *         description: Password strength analysis
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     score:
 *                       type: integer
 *                       minimum: 0
 *                       maximum: 4
 *                       description: Password strength score (0=very weak, 4=very strong)
 *                     label:
 *                       type: string
 *                       description: Human-readable strength label
 *                       enum: [Very Weak, Weak, Fair, Strong, Very Strong]
 *                     isStrong:
 *                       type: boolean
 *                       description: Whether the password meets minimum strength requirements
 *                     crackTime:
 *                       type: string
 *                       description: Estimated time to crack the password
 *                     feedback:
 *                       type: array
 *                       items:
 *                         type: string
 *                       description: Suggestions for improving password strength
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       429:
 *         $ref: '#/components/responses/RateLimitError'
 */
router.post(
  '/check-password-strength',
  defaultRateLimit,
  validators.checkPasswordStrength,
  (req, res) => {
    const { password, email, name } = req.body;

    // Build user inputs array for zxcvbn to check against
    const userInputs: string[] = [];
    if (email) userInputs.push(email);
    if (name) userInputs.push(name);

    const result = validatePasswordStrength(password, userInputs);

    res.json({
      success: true,
      data: {
        score: result.score,
        label: getPasswordStrengthLabel(result.score),
        isStrong: result.isStrong,
        crackTime: result.crackTime,
        feedback: result.feedback,
      },
    });
  }
);

/**
 * @openapi
 * /auth/validate-reset-token:
 *   get:
 *     summary: Validate password reset token
 *     description: Check if a password reset token is valid and not expired
 *     tags: [Authentication]
 *     parameters:
 *       - in: query
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *         description: Password reset token
 *     responses:
 *       200:
 *         description: Token validation result
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     valid:
 *                       type: boolean
 *                       example: true
 *                     message:
 *                       type: string
 *                       example: Token is valid
 *       429:
 *         $ref: '#/components/responses/RateLimitError'
 */
router.get('/validate-reset-token', defaultRateLimit, authController.validateResetToken);

/**
 * @openapi
 * /auth/reset-password:
 *   post:
 *     summary: Reset password with token
 *     description: Reset user's password using a valid reset token
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - token
 *               - password
 *             properties:
 *               token:
 *                 type: string
 *                 description: Password reset token received via email
 *               password:
 *                 type: string
 *                 minLength: 8
 *                 description: New password (min 8 chars, requires uppercase, lowercase, number)
 *           example:
 *             token: abc123def456...
 *             password: NewSecurePassword123!
 *     responses:
 *       200:
 *         description: Password reset successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Password has been reset successfully
 *       400:
 *         description: Invalid token or weak password
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       429:
 *         $ref: '#/components/responses/RateLimitError'
 */
router.post(
  '/reset-password',
  strictRateLimit,
  validators.resetPassword,
  authController.resetPasswordHandler
);

// ============================================
// Protected Routes (require authentication)
// ============================================

/**
 * @openapi
 * /auth/logout:
 *   post:
 *     summary: Logout user
 *     description: Invalidate current session and refresh token
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - refreshToken
 *             properties:
 *               refreshToken:
 *                 type: string
 *     responses:
 *       200:
 *         description: Logged out successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Logged out successfully
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.post('/logout', authenticateJWT, defaultRateLimit, authController.logout);

/**
 * @openapi
 * /auth/logout-all:
 *   post:
 *     summary: Logout from all devices
 *     description: Invalidate all refresh tokens for the user
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Logged out from all devices
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Logged out from all devices
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       429:
 *         $ref: '#/components/responses/RateLimitError'
 */
router.post('/logout-all', authenticateJWT, strictRateLimit, authController.logoutAll);

/**
 * @openapi
 * /auth/me:
 *   get:
 *     summary: Get current user
 *     description: Get the authenticated user's profile
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *       - apiKeyAuth: []
 *     responses:
 *       200:
 *         description: User profile retrieved
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.get('/me', authenticateAny, defaultRateLimit, authController.me);

/**
 * @openapi
 * /auth/change-password:
 *   post:
 *     summary: Change password
 *     description: Change the authenticated user's password
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - currentPassword
 *               - newPassword
 *             properties:
 *               currentPassword:
 *                 type: string
 *               newPassword:
 *                 type: string
 *                 minLength: 8
 *                 description: Min 8 chars, requires uppercase, lowercase, number, special char
 *           example:
 *             currentPassword: OldPassword123!
 *             newPassword: NewPassword456!
 *     responses:
 *       200:
 *         description: Password changed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Password changed successfully
 *       400:
 *         description: Invalid current password or weak new password
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       429:
 *         $ref: '#/components/responses/RateLimitError'
 */
router.post('/change-password', authenticateJWT, strictRateLimit, authController.changePassword);

// ============================================
// API Key Management Routes
// ============================================

/**
 * @openapi
 * /auth/api-keys:
 *   post:
 *     summary: Create new API key
 *     description: Create a new API key for programmatic access
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateApiKeyRequest'
 *           example:
 *             name: Production API Key
 *             permissions:
 *               - screenshot:create
 *               - screenshot:read
 *             ipWhitelist:
 *               - 192.168.1.0/24
 *             domainWhitelist:
 *               - "*.myapp.com"
 *     responses:
 *       201:
 *         description: API key created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: API key created successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     name:
 *                       type: string
 *                     key:
 *                       type: string
 *                       description: Full API key (only shown once)
 *                       example: ss_abc123def456...
 *                     permissions:
 *                       type: array
 *                       items:
 *                         type: string
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       429:
 *         $ref: '#/components/responses/RateLimitError'
 *   get:
 *     summary: List user's API keys
 *     description: Get all API keys for the authenticated user
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of API keys
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/ApiKey'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.post(
  '/api-keys',
  authenticateJWT,
  strictRateLimit,
  validators.createApiKey,
  authController.createApiKey
);

router.get('/api-keys', authenticateJWT, defaultRateLimit, authController.listApiKeys);

/**
 * @openapi
 * /auth/api-keys/{id}:
 *   get:
 *     summary: Get API key details
 *     description: Get details of a specific API key
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: API key ID
 *     responses:
 *       200:
 *         description: API key details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/ApiKey'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *   delete:
 *     summary: Revoke API key
 *     description: Revoke/delete an API key
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: API key ID
 *     responses:
 *       200:
 *         description: API key revoked successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: API key revoked successfully
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       429:
 *         $ref: '#/components/responses/RateLimitError'
 */
router.get(
  '/api-keys/:id',
  authenticateJWT,
  defaultRateLimit,
  validators.id,
  authController.getApiKey
);

router.delete(
  '/api-keys/:id',
  authenticateJWT,
  strictRateLimit,
  validators.id,
  authController.revokeApiKey
);

export default router;
