/**
 * API Key Model
 * Handles API key generation, validation, and management
 */

import mongoose, { Schema, Model, Types } from 'mongoose';
import { IApiKey } from '@/types';
import { generateApiKey, hashApiKey } from '@utils/helpers';
import { DEFAULT_PERMISSIONS } from '@utils/constants';

/**
 * API Key schema definition
 */
const apiKeySchema = new Schema<IApiKey>(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    keyHash: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, 'API key name is required'],
      trim: true,
      maxlength: [100, 'API key name cannot exceed 100 characters'],
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference is required'],
      index: true,
    },
    permissions: {
      type: [String],
      default: DEFAULT_PERMISSIONS,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    lastUsedAt: {
      type: Date,
    },
    expiresAt: {
      type: Date,
      // Index defined below with TTL
    },
    ipWhitelist: {
      type: [String],
      default: [],
    },
    domainWhitelist: {
      type: [String],
      default: [],
    },
    rateLimit: {
      type: Number,
      min: 1,
      max: 1000,
    },
    usageCount: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (_doc, ret: Record<string, unknown>) => {
        // Never expose the actual key in JSON responses
        const { key, keyHash, __v, ...rest } = ret;
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

apiKeySchema.index({ user: 1, isActive: 1 });
apiKeySchema.index({ createdAt: 1 });
apiKeySchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // TTL index for auto-deletion

// ============================================
// Virtual Fields
// ============================================

/**
 * Check if the API key has expired
 */
apiKeySchema.virtual('isExpired').get(function () {
  if (!this.expiresAt) return false;
  return new Date() > this.expiresAt;
});

/**
 * Get masked key for display
 */
apiKeySchema.virtual('maskedKey').get(function () {
  if (!this.key) return undefined;
  const prefix = this.key.substring(0, 7); // "ss_" + first 4 chars
  const suffix = this.key.substring(this.key.length - 4);
  return `${prefix}${'*'.repeat(this.key.length - 11)}${suffix}`;
});

// ============================================
// Pre-save Middleware
// ============================================

apiKeySchema.pre('save', function (next) {
  // Generate key hash if key is new or modified
  if (this.isNew && !this.keyHash) {
    this.keyHash = hashApiKey(this.key);
  }
  next();
});

// ============================================
// Instance Methods
// ============================================

/**
 * Check if the API key is valid (active and not expired)
 * @returns True if the key is valid
 */
apiKeySchema.methods.isValid = function (): boolean {
  if (!this.isActive) return false;
  if (this.expiresAt && new Date() > this.expiresAt) return false;
  return true;
};

/**
 * Check if an IP address is allowed
 * @param ip - Client IP address
 * @returns True if the IP is allowed or no whitelist exists
 */
apiKeySchema.methods.isIpAllowed = function (ip: string): boolean {
  // If no whitelist, allow all
  if (!this.ipWhitelist || this.ipWhitelist.length === 0) return true;

  // Check for exact match or CIDR match
  return this.ipWhitelist.some((allowed: string) => {
    if (allowed === ip) return true;
    // Simple CIDR check (basic implementation)
    if (allowed.includes('/')) {
      const [network, bits] = allowed.split('/');
      const mask = -1 << (32 - parseInt(bits, 10));
      const ipNum = ipToNumber(ip);
      const networkNum = ipToNumber(network);
      return (ipNum & mask) === (networkNum & mask);
    }
    return false;
  });
};

/**
 * Check if a domain is allowed
 * @param domain - Request origin domain
 * @returns True if the domain is allowed or no whitelist exists
 */
apiKeySchema.methods.isDomainAllowed = function (domain: string): boolean {
  // If no whitelist, allow all
  if (!this.domainWhitelist || this.domainWhitelist.length === 0) return true;

  const normalizedDomain = domain.toLowerCase().replace(/^https?:\/\//, '').split('/')[0];

  return this.domainWhitelist.some((allowed: string) => {
    const normalizedAllowed = allowed.toLowerCase();

    // Check for wildcard subdomain match
    if (normalizedAllowed.startsWith('*.')) {
      const baseDomain = normalizedAllowed.substring(2);
      return (
        normalizedDomain === baseDomain || normalizedDomain.endsWith(`.${baseDomain}`)
      );
    }

    return normalizedDomain === normalizedAllowed;
  });
};

/**
 * Check if the API key has a specific permission
 * @param permission - Permission to check
 * @returns True if the key has the permission
 */
apiKeySchema.methods.hasPermission = function (permission: string): boolean {
  return this.permissions.includes(permission);
};

/**
 * Update last used timestamp and increment usage count
 */
apiKeySchema.methods.recordUsage = async function (): Promise<void> {
  this.lastUsedAt = new Date();
  this.usageCount += 1;
  await this.save();
};

// ============================================
// Static Methods
// ============================================

interface ApiKeyModel extends Model<IApiKey> {
  createForUser(
    userId: Types.ObjectId,
    options: {
      name: string;
      permissions?: string[];
      expiresAt?: Date;
      ipWhitelist?: string[];
      domainWhitelist?: string[];
      rateLimit?: number;
    }
  ): Promise<{ apiKey: IApiKey; plainTextKey: string }>;
  findByKey(key: string): Promise<IApiKey | null>;
  findByKeyHash(keyHash: string): Promise<IApiKey | null>;
  findActiveByUser(userId: Types.ObjectId): Promise<IApiKey[]>;
}

/**
 * Create a new API key for a user
 * @param userId - User ID
 * @param options - Key options
 * @returns Created API key and plain text key (only time the key is available)
 */
apiKeySchema.statics.createForUser = async function (
  userId: Types.ObjectId,
  options: {
    name: string;
    permissions?: string[];
    expiresAt?: Date;
    ipWhitelist?: string[];
    domainWhitelist?: string[];
    rateLimit?: number;
  }
): Promise<{ apiKey: IApiKey; plainTextKey: string }> {
  const plainTextKey = generateApiKey();
  const keyHash = hashApiKey(plainTextKey);

  const apiKey = await this.create({
    key: plainTextKey,
    keyHash,
    name: options.name,
    user: userId,
    permissions: options.permissions || DEFAULT_PERMISSIONS,
    expiresAt: options.expiresAt,
    ipWhitelist: options.ipWhitelist || [],
    domainWhitelist: options.domainWhitelist || [],
    rateLimit: options.rateLimit,
  });

  return { apiKey, plainTextKey };
};

/**
 * Find an API key by its plain text value
 * @param key - Plain text API key
 * @returns API key document or null
 */
apiKeySchema.statics.findByKey = function (key: string): Promise<IApiKey | null> {
  const keyHash = hashApiKey(key);
  return this.findOne({ keyHash, isActive: true }).populate('user');
};

/**
 * Find an API key by its hash
 * @param keyHash - Hashed API key
 * @returns API key document or null
 */
apiKeySchema.statics.findByKeyHash = function (keyHash: string): Promise<IApiKey | null> {
  return this.findOne({ keyHash, isActive: true }).populate('user');
};

/**
 * Find all active API keys for a user
 * @param userId - User ID
 * @returns Array of active API keys
 */
apiKeySchema.statics.findActiveByUser = function (userId: Types.ObjectId): Promise<IApiKey[]> {
  return this.find({
    user: userId,
    isActive: true,
    $or: [{ expiresAt: { $exists: false } }, { expiresAt: { $gt: new Date() } }],
  }).sort({ createdAt: -1 });
};

// ============================================
// Helper Functions
// ============================================

/**
 * Convert an IPv4 address to a number
 * @param ip - IPv4 address string
 * @returns Numeric representation
 */
function ipToNumber(ip: string): number {
  const parts = ip.split('.').map(Number);
  return (parts[0] << 24) | (parts[1] << 16) | (parts[2] << 8) | parts[3];
}

// ============================================
// Export Model
// ============================================

const ApiKey = mongoose.model<IApiKey, ApiKeyModel>('ApiKey', apiKeySchema);

export default ApiKey;
