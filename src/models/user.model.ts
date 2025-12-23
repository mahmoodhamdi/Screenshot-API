/**
 * User Model
 * Handles user accounts, authentication, and subscription management
 */

import mongoose, { Schema, Model } from 'mongoose';
import bcrypt from 'bcryptjs';
import { IUser, PlanType, PlanLimits } from '@/types';
import { planLimits } from '@config/index';

/**
 * User schema definition
 */
const userSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [8, 'Password must be at least 8 characters'],
      select: false,
    },
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    company: {
      type: String,
      trim: true,
      maxlength: [200, 'Company name cannot exceed 200 characters'],
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },
    subscription: {
      plan: {
        type: String,
        enum: ['free', 'starter', 'professional', 'enterprise'],
        default: 'free',
      },
      status: {
        type: String,
        enum: ['active', 'cancelled', 'expired', 'past_due'],
        default: 'active',
      },
      stripeCustomerId: {
        type: String,
        index: true,
        sparse: true,
      },
      stripeSubscriptionId: {
        type: String,
        index: true,
        sparse: true,
      },
      currentPeriodStart: Date,
      currentPeriodEnd: Date,
    },
    usage: {
      screenshotsThisMonth: {
        type: Number,
        default: 0,
        min: 0,
      },
      lastResetDate: {
        type: Date,
        default: () => new Date(new Date().getFullYear(), new Date().getMonth(), 1),
      },
    },
    refreshTokens: {
      type: [
        {
          token: { type: String, required: true },
          expiresAt: { type: Date, required: true },
        },
      ],
      default: [],
      select: false,
    },
    verificationToken: {
      type: String,
      select: false,
    },
    lastLoginAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (_doc, ret: Record<string, unknown>) => {
        const { password, refreshTokens, __v, ...rest } = ret;
        return rest;
      },
    },
    toObject: {
      virtuals: true,
    },
  }
);

// ============================================
// Indexes
// ============================================

userSchema.index({ 'subscription.plan': 1 });
userSchema.index({ 'subscription.status': 1 });
userSchema.index({ createdAt: 1 });

// ============================================
// Virtual Fields
// ============================================

userSchema.virtual('apiKeys', {
  ref: 'ApiKey',
  localField: '_id',
  foreignField: 'user',
});

userSchema.virtual('screenshots', {
  ref: 'Screenshot',
  localField: '_id',
  foreignField: 'user',
});

// ============================================
// Pre-save Middleware
// ============================================

userSchema.pre('save', async function (next) {
  // Only hash the password if it has been modified
  if (!this.isModified('password')) {
    return next();
  }

  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error as Error);
  }
});

// ============================================
// Instance Methods
// ============================================

/**
 * Compare a candidate password with the user's hashed password
 * @param candidatePassword - The password to compare
 * @returns Promise resolving to true if passwords match
 */
userSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  if (!this.password) {
    return false;
  }
  return bcrypt.compare(candidatePassword, this.password);
};

/**
 * Increment the user's monthly screenshot usage
 */
userSchema.methods.incrementUsage = async function (): Promise<void> {
  // Check if we need to reset the monthly count
  const now = new Date();
  const lastReset = this.usage.lastResetDate;

  if (
    lastReset.getMonth() !== now.getMonth() ||
    lastReset.getFullYear() !== now.getFullYear()
  ) {
    this.usage.screenshotsThisMonth = 1;
    this.usage.lastResetDate = new Date(now.getFullYear(), now.getMonth(), 1);
  } else {
    this.usage.screenshotsThisMonth += 1;
  }

  await this.save();
};

/**
 * Reset the user's monthly usage (typically called on subscription renewal)
 */
userSchema.methods.resetMonthlyUsage = async function (): Promise<void> {
  const now = new Date();
  this.usage.screenshotsThisMonth = 0;
  this.usage.lastResetDate = new Date(now.getFullYear(), now.getMonth(), 1);
  await this.save();
};

/**
 * Get the plan limits for this user's subscription
 * @returns Plan limits configuration
 */
userSchema.methods.getPlanLimits = function (): PlanLimits {
  const plan = this.subscription.plan as PlanType;
  return planLimits[plan];
};

// ============================================
// Static Methods
// ============================================

interface UserModel extends Model<IUser> {
  findByEmail(email: string): Promise<IUser | null>;
  findByStripeCustomerId(customerId: string): Promise<IUser | null>;
}

/**
 * Find a user by email address
 * @param email - User email
 * @returns User document or null
 */
userSchema.statics.findByEmail = function (email: string): Promise<IUser | null> {
  return this.findOne({ email: email.toLowerCase() }).select('+password +refreshTokens');
};

/**
 * Find a user by Stripe customer ID
 * @param customerId - Stripe customer ID
 * @returns User document or null
 */
userSchema.statics.findByStripeCustomerId = function (customerId: string): Promise<IUser | null> {
  return this.findOne({ 'subscription.stripeCustomerId': customerId });
};

// ============================================
// Export Model
// ============================================

const User = mongoose.model<IUser, UserModel>('User', userSchema);

export default User;
