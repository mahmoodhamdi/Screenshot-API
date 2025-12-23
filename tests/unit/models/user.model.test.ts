/**
 * Unit Tests for User Model
 */

// Set required environment variables before importing modules
process.env.JWT_SECRET = 'test-jwt-secret-key-minimum-32-characters';
process.env.JWT_REFRESH_SECRET = 'test-jwt-refresh-secret-key-minimum-32-chars';
process.env.NODE_ENV = 'test';

import User from '@models/user.model';
import { PlanLimits } from '@/types';

// Extended type for User with methods
interface UserWithMethods {
  comparePassword: (password: string) => Promise<boolean>;
  incrementUsage: () => Promise<void>;
  resetMonthlyUsage: () => Promise<void>;
  getPlanLimits: () => PlanLimits;
}

describe('User Model', () => {
  describe('User Creation', () => {
    it('should create a user with valid data', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'Password123',
        name: 'Test User',
      };

      const user = await User.create(userData);

      expect(user.email).toBe('test@example.com');
      expect(user.name).toBe('Test User');
      expect(user.isActive).toBe(true);
      expect(user.isVerified).toBe(false);
      expect(user.role).toBe('user');
      expect(user.subscription.plan).toBe('free');
      expect(user.subscription.status).toBe('active');
    });

    it('should hash password before saving', async () => {
      const user = await User.create({
        email: 'test2@example.com',
        password: 'Password123',
        name: 'Test User',
      });

      // Fetch with password
      const savedUser = await User.findById(user._id).select('+password');
      expect(savedUser?.password).not.toBe('Password123');
      expect(savedUser?.password).toMatch(/^\$2[ab]\$/); // bcrypt hash prefix
    });

    it('should lowercase email', async () => {
      const user = await User.create({
        email: 'TEST3@EXAMPLE.COM',
        password: 'Password123',
        name: 'Test User',
      });

      expect(user.email).toBe('test3@example.com');
    });

    it('should fail without required fields', async () => {
      await expect(User.create({})).rejects.toThrow();
    });

    it('should fail with duplicate email', async () => {
      await User.create({
        email: 'duplicate@example.com',
        password: 'Password123',
        name: 'Test User',
      });

      await expect(
        User.create({
          email: 'duplicate@example.com',
          password: 'Password456',
          name: 'Another User',
        })
      ).rejects.toThrow();
    });

    it('should accept optional company field', async () => {
      const user = await User.create({
        email: 'company@example.com',
        password: 'Password123',
        name: 'Test User',
        company: 'Acme Inc',
      });

      expect(user.company).toBe('Acme Inc');
    });
  });

  describe('Password Comparison', () => {
    it('should return true for correct password', async () => {
      const user = await User.create({
        email: 'pwd1@example.com',
        password: 'Password123',
        name: 'Test User',
      });

      const savedUser = await User.findById(user._id).select('+password');
      const isMatch = await (savedUser as unknown as UserWithMethods)?.comparePassword('Password123');
      expect(isMatch).toBe(true);
    });

    it('should return false for incorrect password', async () => {
      const user = await User.create({
        email: 'pwd2@example.com',
        password: 'Password123',
        name: 'Test User',
      });

      const savedUser = await User.findById(user._id).select('+password');
      const isMatch = await (savedUser as unknown as UserWithMethods)?.comparePassword('WrongPassword');
      expect(isMatch).toBe(false);
    });
  });

  describe('Usage Tracking', () => {
    it('should increment usage count', async () => {
      const user = await User.create({
        email: 'usage1@example.com',
        password: 'Password123',
        name: 'Test User',
      });

      expect(user.usage.screenshotsThisMonth).toBe(0);

      await (user as unknown as UserWithMethods).incrementUsage();

      const updatedUser = await User.findById(user._id);
      expect(updatedUser?.usage.screenshotsThisMonth).toBe(1);
    });

    it('should reset monthly usage', async () => {
      const user = await User.create({
        email: 'usage2@example.com',
        password: 'Password123',
        name: 'Test User',
      });

      user.usage.screenshotsThisMonth = 50;
      await user.save();

      await (user as unknown as UserWithMethods).resetMonthlyUsage();

      const updatedUser = await User.findById(user._id);
      expect(updatedUser?.usage.screenshotsThisMonth).toBe(0);
    });
  });

  describe('Plan Limits', () => {
    it('should return correct limits for free plan', async () => {
      const user = await User.create({
        email: 'free@example.com',
        password: 'Password123',
        name: 'Test User',
      });

      const limits = (user as unknown as UserWithMethods).getPlanLimits();
      expect(limits.screenshotsPerMonth).toBe(100);
      expect(limits.maxWidth).toBe(1280);
      expect(limits.maxHeight).toBe(720);
      expect(limits.rateLimit).toBe(10);
    });

    it('should return correct limits for professional plan', async () => {
      const user = await User.create({
        email: 'pro@example.com',
        password: 'Password123',
        name: 'Test User',
        subscription: {
          plan: 'professional',
          status: 'active',
        },
      });

      const limits = (user as unknown as UserWithMethods).getPlanLimits();
      expect(limits.screenshotsPerMonth).toBe(10000);
      expect(limits.maxWidth).toBe(3840);
      expect(limits.formats).toContain('pdf');
      expect(limits.webhooks).toBe(true);
    });
  });

  describe('Static Methods', () => {
    it('should find user by email', async () => {
      await User.create({
        email: 'findme@example.com',
        password: 'Password123',
        name: 'Test User',
      });

      const user = await User.findByEmail('findme@example.com');
      expect(user).not.toBeNull();
      expect(user?.name).toBe('Test User');
    });

    it('should find user by Stripe customer ID', async () => {
      await User.create({
        email: 'stripe@example.com',
        password: 'Password123',
        name: 'Test User',
        subscription: {
          plan: 'starter',
          status: 'active',
          stripeCustomerId: 'cus_test123',
        },
      });

      const user = await User.findByStripeCustomerId('cus_test123');
      expect(user).not.toBeNull();
      expect(user?.email).toBe('stripe@example.com');
    });
  });

  describe('JSON Transformation', () => {
    it('should remove sensitive fields from JSON', async () => {
      const user = await User.create({
        email: 'json@example.com',
        password: 'Password123',
        name: 'Test User',
      });

      const json = user.toJSON();
      expect(json).not.toHaveProperty('password');
      expect(json).not.toHaveProperty('refreshTokens');
      expect(json).not.toHaveProperty('__v');
    });
  });
});
