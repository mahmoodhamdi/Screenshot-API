/**
 * Auth Service Tests
 */

// Set environment variables before any imports
process.env.JWT_SECRET = 'test-jwt-secret-key-minimum-32-characters-long';
process.env.JWT_REFRESH_SECRET = 'test-jwt-refresh-secret-key-minimum-32-chars';
process.env.NODE_ENV = 'test';

import { Types } from 'mongoose';
import {
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
} from '@services/auth.service';
import { User } from '@models/index';

describe('Auth Service', () => {
  // Test user data
  const testUserData = {
    email: 'authtest@example.com',
    password: 'TestPassword123!',
    name: 'Auth Test User',
  };

  let testUser: InstanceType<typeof User>;

  beforeEach(async () => {
    // Create a fresh test user for each test
    testUser = await User.create({
      email: `authtest-${Date.now()}@example.com`,
      password: testUserData.password,
      name: testUserData.name,
    });
  });

  // ============================================
  // Token Generation Tests
  // ============================================

  describe('Token Generation', () => {
    describe('generateAccessToken', () => {
      it('should generate a valid access token', () => {
        const payload = {
          userId: testUser._id.toString(),
          email: testUser.email,
          role: testUser.role,
        };

        const token = generateAccessToken(payload);

        expect(token).toBeDefined();
        expect(typeof token).toBe('string');
        expect(token.split('.')).toHaveLength(3); // JWT has 3 parts
      });

      it('should include payload data in token', () => {
        const payload = {
          userId: testUser._id.toString(),
          email: testUser.email,
          role: testUser.role,
        };

        const token = generateAccessToken(payload);
        const decoded = verifyAccessToken(token);

        expect(decoded).toBeDefined();
        expect(decoded?.userId).toBe(payload.userId);
        expect(decoded?.email).toBe(payload.email);
        expect(decoded?.role).toBe(payload.role);
      });
    });

    describe('generateRefreshToken', () => {
      it('should generate a valid refresh token', () => {
        const token = generateRefreshToken(testUser._id.toString());

        expect(token).toBeDefined();
        expect(typeof token).toBe('string');
        expect(token.split('.')).toHaveLength(3);
      });
    });

    describe('generateTokenPair', () => {
      it('should generate both access and refresh tokens', () => {
        const result = generateTokenPair(testUser);

        expect(result.accessToken).toBeDefined();
        expect(result.refreshToken).toBeDefined();
        expect(result.expiresIn).toBeGreaterThan(0);
      });
    });
  });

  // ============================================
  // Token Verification Tests
  // ============================================

  describe('Token Verification', () => {
    describe('verifyAccessToken', () => {
      it('should verify a valid access token', () => {
        const payload = {
          userId: testUser._id.toString(),
          email: testUser.email,
          role: testUser.role,
        };
        const token = generateAccessToken(payload);

        const decoded = verifyAccessToken(token);

        expect(decoded).toBeDefined();
        expect(decoded?.userId).toBe(payload.userId);
      });

      it('should return null for invalid token', () => {
        const decoded = verifyAccessToken('invalid-token');

        expect(decoded).toBeNull();
      });

      it('should return null for malformed token', () => {
        const decoded = verifyAccessToken('not.a.valid.jwt.token');

        expect(decoded).toBeNull();
      });
    });

    describe('verifyRefreshToken', () => {
      it('should verify a valid refresh token', () => {
        const token = generateRefreshToken(testUser._id.toString());

        const decoded = verifyRefreshToken(token);

        expect(decoded).toBeDefined();
        expect(decoded?.userId).toBe(testUser._id.toString());
      });

      it('should return null for invalid token', () => {
        const decoded = verifyRefreshToken('invalid-token');

        expect(decoded).toBeNull();
      });
    });
  });

  // ============================================
  // User Registration Tests
  // ============================================

  describe('User Registration', () => {
    describe('registerUser', () => {
      it('should register a new user successfully', async () => {
        const newUserData = {
          email: `newuser-${Date.now()}@example.com`,
          password: 'NewPassword123!',
          name: 'New User',
        };

        const result = await registerUser(newUserData);

        expect(result.user).toBeDefined();
        expect(result.user.email).toBe(newUserData.email);
        expect(result.user.name).toBe(newUserData.name);
        expect(result.tokens.accessToken).toBeDefined();
        expect(result.tokens.refreshToken).toBeDefined();
      });

      it('should throw error for duplicate email', async () => {
        const duplicateData = {
          email: testUser.email, // Same email as existing user
          password: 'Password123!',
          name: 'Duplicate User',
        };

        await expect(registerUser(duplicateData)).rejects.toThrow();
      });

      it('should hash the password', async () => {
        const newUserData = {
          email: `hashtest-${Date.now()}@example.com`,
          password: 'PlainPassword123!',
          name: 'Hash Test User',
        };

        const result = await registerUser(newUserData);
        const user = await User.findById(result.user._id).select('+password');

        expect(user?.password).not.toBe(newUserData.password);
        expect(user?.password).toMatch(/^\$2[aby]\$/); // bcrypt hash pattern
      });
    });
  });

  // ============================================
  // User Login Tests
  // ============================================

  describe('User Login', () => {
    describe('loginUser', () => {
      it('should login user with correct credentials', async () => {
        const result = await loginUser(testUser.email, testUserData.password);

        expect(result.user).toBeDefined();
        expect(result.user.email).toBe(testUser.email);
        expect(result.tokens.accessToken).toBeDefined();
        expect(result.tokens.refreshToken).toBeDefined();
      });

      it('should throw error for invalid email', async () => {
        await expect(
          loginUser('nonexistent@example.com', testUserData.password)
        ).rejects.toThrow('Invalid credentials');
      });

      it('should throw error for invalid password', async () => {
        await expect(
          loginUser(testUser.email, 'WrongPassword123!')
        ).rejects.toThrow('Invalid credentials');
      });

      it('should update lastLoginAt timestamp', async () => {
        const beforeLogin = new Date();

        await loginUser(testUser.email, testUserData.password);

        const updatedUser = await User.findById(testUser._id);
        expect(updatedUser?.lastLoginAt).toBeDefined();
        expect(updatedUser!.lastLoginAt!.getTime()).toBeGreaterThanOrEqual(beforeLogin.getTime());
      });
    });
  });

  // ============================================
  // Logout Tests
  // ============================================

  describe('User Logout', () => {
    describe('logoutUser', () => {
      it('should logout user and invalidate refresh token', async () => {
        // First login to get a refresh token
        const loginResult = await loginUser(testUser.email, testUserData.password);

        // Then logout
        await logoutUser(testUser._id, loginResult.tokens.refreshToken);

        // Refresh token should now be invalid
        await expect(refreshAccessToken(loginResult.tokens.refreshToken)).rejects.toThrow();
      });
    });

    describe('removeAllRefreshTokens', () => {
      it('should remove all refresh tokens for user', async () => {
        // Login multiple times to create multiple refresh tokens
        const login1 = await loginUser(testUser.email, testUserData.password);
        const login2 = await loginUser(testUser.email, testUserData.password);

        // Remove all tokens
        await removeAllRefreshTokens(testUser._id);

        // Both refresh tokens should be invalid
        await expect(refreshAccessToken(login1.tokens.refreshToken)).rejects.toThrow();
        await expect(refreshAccessToken(login2.tokens.refreshToken)).rejects.toThrow();
      });
    });
  });

  // ============================================
  // Refresh Token Tests
  // ============================================

  describe('Refresh Access Token', () => {
    describe('refreshAccessToken', () => {
      it('should generate new access token with valid refresh token', async () => {
        const loginResult = await loginUser(testUser.email, testUserData.password);

        // Wait a moment to ensure different timestamp in JWT
        await new Promise((resolve) => setTimeout(resolve, 1100));

        const result = await refreshAccessToken(loginResult.tokens.refreshToken);

        expect(result).toBeDefined();
        expect(result.accessToken).toBeDefined();
        expect(result.refreshToken).toBeDefined();
        // New refresh token should be different (contains random component)
        expect(result.refreshToken).not.toBe(loginResult.tokens.refreshToken);
        // Access token should also be different due to different iat timestamp
        expect(result.accessToken).not.toBe(loginResult.tokens.accessToken);
      });

      it('should throw error for invalid refresh token', async () => {
        await expect(refreshAccessToken('invalid-refresh-token')).rejects.toThrow();
      });
    });
  });

  // ============================================
  // Password Management Tests
  // ============================================

  describe('Password Management', () => {
    describe('hashPassword', () => {
      it('should hash a password', async () => {
        const plainPassword = 'MySecretPassword123!';

        const hash = await hashPassword(plainPassword);

        expect(hash).toBeDefined();
        expect(hash).not.toBe(plainPassword);
        expect(hash).toMatch(/^\$2[aby]\$/);
      });

      it('should generate different hashes for same password', async () => {
        const password = 'SamePassword123!';

        const hash1 = await hashPassword(password);
        const hash2 = await hashPassword(password);

        expect(hash1).not.toBe(hash2);
      });
    });

    describe('comparePassword', () => {
      it('should return true for matching password', async () => {
        const password = 'MatchingPassword123!';
        const hash = await hashPassword(password);

        const result = await comparePassword(password, hash);

        expect(result).toBe(true);
      });

      it('should return false for non-matching password', async () => {
        const password = 'OriginalPassword123!';
        const hash = await hashPassword(password);

        const result = await comparePassword('DifferentPassword123!', hash);

        expect(result).toBe(false);
      });
    });

    describe('changePassword', () => {
      it('should change password with correct current password', async () => {
        const newPassword = 'NewSecurePassword123!';

        await changePassword(
          testUser._id,
          testUserData.password,
          newPassword
        );

        // Should be able to login with new password
        const result = await loginUser(testUser.email, newPassword);
        expect(result.user).toBeDefined();
      });

      it('should throw error for incorrect current password', async () => {
        await expect(
          changePassword(
            testUser._id,
            'WrongCurrentPassword!',
            'NewPassword123!'
          )
        ).rejects.toThrow('Current password is incorrect');
      });
    });

    describe('generatePasswordResetToken', () => {
      it('should generate a password reset token for existing user', async () => {
        const result = await generatePasswordResetToken(testUser.email);

        expect(result).toBeDefined();
        expect(result).not.toBeNull();
        expect(result?.token).toBeDefined();
        expect(typeof result?.token).toBe('string');
        expect(result!.token.length).toBe(64); // 32 bytes as hex = 64 chars
        expect(result?.user).toBeDefined();
        expect(result?.user.email).toBe(testUser.email);
      });

      it('should return null for non-existent email', async () => {
        const result = await generatePasswordResetToken('nonexistent@example.com');
        expect(result).toBeNull();
      });

      it('should hash the token before storing', async () => {
        const result = await generatePasswordResetToken(testUser.email);

        // Get user from database with reset token
        const userWithToken = await User.findById(testUser._id).select(
          '+passwordResetToken +passwordResetExpires'
        );

        expect(userWithToken?.passwordResetToken).toBeDefined();
        // Stored token should be different from returned token (it's hashed)
        expect(userWithToken?.passwordResetToken).not.toBe(result?.token);
        // Should be a SHA256 hash (64 hex chars)
        expect(userWithToken?.passwordResetToken?.length).toBe(64);
      });

      it('should set expiry to 1 hour in the future', async () => {
        const beforeGeneration = new Date();
        await generatePasswordResetToken(testUser.email);
        const afterGeneration = new Date();

        const userWithToken = await User.findById(testUser._id).select(
          '+passwordResetToken +passwordResetExpires'
        );

        expect(userWithToken?.passwordResetExpires).toBeDefined();

        // Expiry should be approximately 1 hour from now
        const expiresTime = userWithToken!.passwordResetExpires!.getTime();
        const oneHourFromBefore = beforeGeneration.getTime() + 60 * 60 * 1000;
        const oneHourFromAfter = afterGeneration.getTime() + 60 * 60 * 1000;

        expect(expiresTime).toBeGreaterThanOrEqual(oneHourFromBefore);
        expect(expiresTime).toBeLessThanOrEqual(oneHourFromAfter);
      });

      it('should overwrite existing token when generating new one', async () => {
        // Generate first token
        const result1 = await generatePasswordResetToken(testUser.email);
        const user1 = await User.findById(testUser._id).select('+passwordResetToken');

        // Generate second token
        const result2 = await generatePasswordResetToken(testUser.email);
        const user2 = await User.findById(testUser._id).select('+passwordResetToken');

        // Tokens should be different
        expect(result1?.token).not.toBe(result2?.token);
        expect(user1?.passwordResetToken).not.toBe(user2?.passwordResetToken);
      });
    });

    describe('validatePasswordResetToken', () => {
      it('should return user for valid token', async () => {
        const result = await generatePasswordResetToken(testUser.email);
        expect(result).not.toBeNull();

        const user = await validatePasswordResetToken(result!.token);

        expect(user).toBeDefined();
        expect(user).not.toBeNull();
        expect(user!._id.toString()).toBe(testUser._id.toString());
      });

      it('should return null for invalid token', async () => {
        const user = await validatePasswordResetToken('invalid-token-string-1234567890abcdef');
        expect(user).toBeNull();
      });

      it('should return null for expired token', async () => {
        // Generate token
        const result = await generatePasswordResetToken(testUser.email);

        // Manually expire the token
        await User.findByIdAndUpdate(testUser._id, {
          passwordResetExpires: new Date(Date.now() - 1000), // 1 second ago
        });

        const user = await validatePasswordResetToken(result!.token);
        expect(user).toBeNull();
      });

      it('should return null for tampered token', async () => {
        await generatePasswordResetToken(testUser.email);

        // Try with a random valid-looking token
        const tamperedToken = 'a'.repeat(64);
        const user = await validatePasswordResetToken(tamperedToken);

        expect(user).toBeNull();
      });
    });

    describe('resetPassword', () => {
      it('should update password with valid token', async () => {
        const result = await generatePasswordResetToken(testUser.email);
        const newPassword = 'NewSecurePassword123!';

        const resetResult = await resetPassword(result!.token, newPassword);

        expect(resetResult.success).toBe(true);
        expect(resetResult.message).toContain('successfully');

        // Should be able to login with new password
        const loginResult = await loginUser(testUser.email, newPassword);
        expect(loginResult.user).toBeDefined();
      });

      it('should clear reset token after use', async () => {
        const result = await generatePasswordResetToken(testUser.email);
        const newPassword = 'NewSecurePassword123!';

        await resetPassword(result!.token, newPassword);

        // Token should no longer work
        const user = await validatePasswordResetToken(result!.token);
        expect(user).toBeNull();
      });

      it('should invalidate all existing sessions', async () => {
        // Login to create refresh tokens
        const loginResult = await loginUser(testUser.email, testUserData.password);

        // Generate reset token and reset password
        const resetTokenResult = await generatePasswordResetToken(testUser.email);
        await resetPassword(resetTokenResult!.token, 'NewSecurePassword123!');

        // Old refresh token should no longer work
        await expect(refreshAccessToken(loginResult.tokens.refreshToken)).rejects.toThrow();
      });

      it('should throw error for invalid token', async () => {
        await expect(
          resetPassword('invalid-token-1234567890abcdef1234567890abcdef', 'NewPassword123!')
        ).rejects.toThrow('invalid or has expired');
      });

      it('should throw error for weak password', async () => {
        const result = await generatePasswordResetToken(testUser.email);

        await expect(resetPassword(result!.token, 'short')).rejects.toThrow(
          'at least 8 characters'
        );
      });

      it('should not allow using the same token twice', async () => {
        const result = await generatePasswordResetToken(testUser.email);

        // First reset should succeed
        await resetPassword(result!.token, 'FirstNewPassword123!');

        // Second reset with same token should fail
        await expect(resetPassword(result!.token, 'SecondNewPassword123!')).rejects.toThrow(
          'invalid or has expired'
        );
      });
    });
  });

  // ============================================
  // Email Verification Tests
  // ============================================

  describe('Email Verification', () => {
    describe('generateVerificationToken', () => {
      it('should generate a verification token', async () => {
        const token = await generateVerificationToken(testUser._id);

        expect(token).toBeDefined();
        expect(typeof token).toBe('string');
      });
    });

    describe('verifyEmail', () => {
      it('should verify email with valid token', async () => {
        const token = await generateVerificationToken(testUser._id);

        const result = await verifyEmail(token);

        expect(result).toBe(true);

        // User should now be verified
        const user = await User.findById(testUser._id);
        expect(user?.isVerified).toBe(true);
      });

      it('should return false for invalid token', async () => {
        const result = await verifyEmail('invalid-verification-token');

        expect(result).toBe(false);
      });
    });
  });

  // ============================================
  // API Key Authentication Tests
  // ============================================

  describe('API Key Management', () => {
    describe('createApiKey', () => {
      it('should create a new API key', async () => {
        const result = await createApiKey(testUser._id, {
          name: 'Test API Key',
        });

        expect(result.apiKey).toBeDefined();
        expect(result.plainTextKey).toBeDefined();
        expect(result.plainTextKey).toMatch(/^ss_/); // Should start with prefix
      });

      it('should create API key with permissions', async () => {
        const result = await createApiKey(testUser._id, {
          name: 'Test API Key with Permissions',
          permissions: ['screenshot:create', 'screenshot:read'],
        });

        expect(result.apiKey.permissions).toContain('screenshot:create');
        expect(result.apiKey.permissions).toContain('screenshot:read');
      });

      it('should create API key with IP whitelist', async () => {
        const result = await createApiKey(testUser._id, {
          name: 'IP Restricted Key',
          ipWhitelist: ['192.168.1.1', '10.0.0.0/24'],
        });

        expect(result.apiKey.ipWhitelist).toContain('192.168.1.1');
        expect(result.apiKey.ipWhitelist).toContain('10.0.0.0/24');
      });
    });

    describe('authenticateApiKey', () => {
      it('should authenticate with valid API key', async () => {
        const { plainTextKey } = await createApiKey(testUser._id, {
          name: 'Auth Test Key',
        });

        const result = await authenticateApiKey(plainTextKey);

        expect(result).toBeDefined();
        expect(result.user._id.toString()).toBe(testUser._id.toString());
      });

      it('should throw error for invalid API key', async () => {
        await expect(
          authenticateApiKey('ss_invalidkey123456789012345678901')
        ).rejects.toThrow();
      });

      it('should throw error for malformed API key', async () => {
        await expect(
          authenticateApiKey('not-a-valid-key')
        ).rejects.toThrow();
      });

      it('should check IP whitelist if configured', async () => {
        const { plainTextKey } = await createApiKey(testUser._id, {
          name: 'IP Restricted Key',
          ipWhitelist: ['192.168.1.1'],
        });

        // Should fail with different IP
        await expect(
          authenticateApiKey(plainTextKey, '10.0.0.1')
        ).rejects.toThrow('IP address not allowed');
      });

      it('should allow request from whitelisted IP', async () => {
        const { plainTextKey } = await createApiKey(testUser._id, {
          name: 'IP Restricted Key',
          ipWhitelist: ['192.168.1.1'],
        });

        const result = await authenticateApiKey(plainTextKey, '192.168.1.1');

        expect(result).toBeDefined();
      });
    });

    describe('revokeApiKey', () => {
      it('should revoke an API key', async () => {
        const { apiKey, plainTextKey } = await createApiKey(testUser._id, {
          name: 'Key to Revoke',
        });

        await revokeApiKey(apiKey._id as Types.ObjectId, testUser._id);

        // Key should no longer authenticate
        await expect(authenticateApiKey(plainTextKey)).rejects.toThrow();
      });

      it('should throw error when revoking non-existent key', async () => {
        const fakeId = new Types.ObjectId();

        await expect(
          revokeApiKey(fakeId, testUser._id)
        ).rejects.toThrow();
      });
    });
  });
});
