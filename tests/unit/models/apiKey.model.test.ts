/**
 * Unit Tests for API Key Model
 */

// Set required environment variables before importing modules
process.env.JWT_SECRET = 'test-jwt-secret-key-minimum-32-characters';
process.env.JWT_REFRESH_SECRET = 'test-jwt-refresh-secret-key-minimum-32-chars';
process.env.NODE_ENV = 'test';

import mongoose from 'mongoose';
import ApiKey from '@models/apiKey.model';
import User from '@models/user.model';

// Extended type for API key with methods
interface ApiKeyWithMethods {
  isValid: () => boolean;
  isIpAllowed: (ip: string) => boolean;
  isDomainAllowed: (domain: string) => boolean;
  hasPermission: (permission: string) => boolean;
  recordUsage: () => Promise<void>;
  maskedKey: string;
}

describe('API Key Model', () => {
  let testUserId: mongoose.Types.ObjectId;

  beforeAll(async () => {
    // Create a test user
    const user = await User.create({
      email: 'apikey-test@example.com',
      password: 'Password123',
      name: 'Test User',
    });
    testUserId = user._id as mongoose.Types.ObjectId;
  });

  describe('API Key Creation', () => {
    it('should create an API key for a user', async () => {
      const { apiKey, plainTextKey } = await ApiKey.createForUser(testUserId, {
        name: 'Test API Key',
      });

      expect(apiKey.name).toBe('Test API Key');
      expect(apiKey.user.toString()).toBe(testUserId.toString());
      expect(apiKey.isActive).toBe(true);
      expect(plainTextKey).toMatch(/^ss_/);
    });

    it('should hash the API key', async () => {
      const { apiKey, plainTextKey } = await ApiKey.createForUser(testUserId, {
        name: 'Hash Test Key',
      });

      expect(apiKey.keyHash).not.toBe(plainTextKey);
      expect(apiKey.keyHash).toHaveLength(64); // SHA-256 hex
    });

    it('should set default permissions', async () => {
      const { apiKey } = await ApiKey.createForUser(testUserId, {
        name: 'Default Perms Key',
      });

      expect(apiKey.permissions).toContain('screenshot:create');
      expect(apiKey.permissions).toContain('screenshot:read');
      expect(apiKey.permissions).toContain('screenshot:delete');
    });

    it('should accept custom permissions', async () => {
      const { apiKey } = await ApiKey.createForUser(testUserId, {
        name: 'Custom Perms Key',
        permissions: ['screenshot:create'],
      });

      expect(apiKey.permissions).toEqual(['screenshot:create']);
    });

    it('should accept IP whitelist', async () => {
      const { apiKey } = await ApiKey.createForUser(testUserId, {
        name: 'IP Whitelist Key',
        ipWhitelist: ['192.168.1.1', '10.0.0.0/8'],
      });

      expect(apiKey.ipWhitelist).toHaveLength(2);
      expect(apiKey.ipWhitelist).toContain('192.168.1.1');
    });

    it('should accept domain whitelist', async () => {
      const { apiKey } = await ApiKey.createForUser(testUserId, {
        name: 'Domain Whitelist Key',
        domainWhitelist: ['example.com', '*.mysite.com'],
      });

      expect(apiKey.domainWhitelist).toHaveLength(2);
    });

    it('should accept expiration date', async () => {
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
      const { apiKey } = await ApiKey.createForUser(testUserId, {
        name: 'Expiring Key',
        expiresAt,
      });

      expect(apiKey.expiresAt).toEqual(expiresAt);
    });
  });

  describe('API Key Finding', () => {
    it('should find API key by plain text key', async () => {
      const { plainTextKey } = await ApiKey.createForUser(testUserId, {
        name: 'Findable Key',
      });

      const found = await ApiKey.findByKey(plainTextKey);
      expect(found).not.toBeNull();
      expect(found?.name).toBe('Findable Key');
    });

    it('should not find inactive API key', async () => {
      const { apiKey, plainTextKey } = await ApiKey.createForUser(testUserId, {
        name: 'Inactive Key',
      });

      apiKey.isActive = false;
      await apiKey.save();

      const found = await ApiKey.findByKey(plainTextKey);
      expect(found).toBeNull();
    });

    it('should find all active keys for user', async () => {
      // Create a new user for this test to avoid conflicts
      const testUser = await User.create({
        email: 'active-keys-test@example.com',
        password: 'Password123',
        name: 'Active Keys Test User',
      });

      await ApiKey.createForUser(testUser._id as mongoose.Types.ObjectId, { name: 'Active Key 1' });
      await ApiKey.createForUser(testUser._id as mongoose.Types.ObjectId, { name: 'Active Key 2' });

      const { apiKey: key3 } = await ApiKey.createForUser(testUser._id as mongoose.Types.ObjectId, { name: 'Inactive Key 3' });
      key3.isActive = false;
      await key3.save();

      const keys = await ApiKey.findActiveByUser(testUser._id as mongoose.Types.ObjectId);
      expect(keys).toHaveLength(2);
    });
  });

  describe('API Key Validation', () => {
    it('should validate active non-expired key', async () => {
      const { apiKey } = await ApiKey.createForUser(testUserId, {
        name: 'Valid Key',
      });

      expect((apiKey as unknown as ApiKeyWithMethods).isValid()).toBe(true);
    });

    it('should invalidate inactive key', async () => {
      const { apiKey } = await ApiKey.createForUser(testUserId, {
        name: 'Will Be Inactive',
      });

      apiKey.isActive = false;
      await apiKey.save();

      expect((apiKey as unknown as ApiKeyWithMethods).isValid()).toBe(false);
    });

    it('should invalidate expired key', async () => {
      const { apiKey } = await ApiKey.createForUser(testUserId, {
        name: 'Expired Key',
        expiresAt: new Date(Date.now() - 1000), // Already expired
      });

      expect((apiKey as unknown as ApiKeyWithMethods).isValid()).toBe(false);
    });
  });

  describe('IP Whitelist', () => {
    it('should allow any IP when whitelist is empty', async () => {
      const { apiKey } = await ApiKey.createForUser(testUserId, {
        name: 'No IP Whitelist',
      });

      expect((apiKey as unknown as ApiKeyWithMethods).isIpAllowed('1.2.3.4')).toBe(true);
    });

    it('should allow whitelisted IP', async () => {
      const { apiKey } = await ApiKey.createForUser(testUserId, {
        name: 'IP Whitelisted',
        ipWhitelist: ['192.168.1.1'],
      });

      expect((apiKey as unknown as ApiKeyWithMethods).isIpAllowed('192.168.1.1')).toBe(true);
      expect((apiKey as unknown as ApiKeyWithMethods).isIpAllowed('192.168.1.2')).toBe(false);
    });

    it('should support CIDR notation', async () => {
      const { apiKey } = await ApiKey.createForUser(testUserId, {
        name: 'CIDR Key',
        ipWhitelist: ['192.168.1.0/24'],
      });

      expect((apiKey as unknown as ApiKeyWithMethods).isIpAllowed('192.168.1.50')).toBe(true);
      expect((apiKey as unknown as ApiKeyWithMethods).isIpAllowed('192.168.2.1')).toBe(false);
    });
  });

  describe('Domain Whitelist', () => {
    it('should allow any domain when whitelist is empty', async () => {
      const { apiKey } = await ApiKey.createForUser(testUserId, {
        name: 'No Domain Whitelist',
      });

      expect((apiKey as unknown as ApiKeyWithMethods).isDomainAllowed('https://example.com')).toBe(true);
    });

    it('should allow whitelisted domain', async () => {
      const { apiKey } = await ApiKey.createForUser(testUserId, {
        name: 'Domain Whitelisted',
        domainWhitelist: ['example.com'],
      });

      expect((apiKey as unknown as ApiKeyWithMethods).isDomainAllowed('example.com')).toBe(true);
      expect((apiKey as unknown as ApiKeyWithMethods).isDomainAllowed('https://example.com')).toBe(true);
      expect((apiKey as unknown as ApiKeyWithMethods).isDomainAllowed('other.com')).toBe(false);
    });

    it('should support wildcard subdomains', async () => {
      const { apiKey } = await ApiKey.createForUser(testUserId, {
        name: 'Wildcard Domain',
        domainWhitelist: ['*.example.com'],
      });

      expect((apiKey as unknown as ApiKeyWithMethods).isDomainAllowed('api.example.com')).toBe(true);
      expect((apiKey as unknown as ApiKeyWithMethods).isDomainAllowed('sub.api.example.com')).toBe(true);
      expect((apiKey as unknown as ApiKeyWithMethods).isDomainAllowed('example.com')).toBe(true);
      expect((apiKey as unknown as ApiKeyWithMethods).isDomainAllowed('other.com')).toBe(false);
    });
  });

  describe('Permissions', () => {
    it('should check for permission', async () => {
      const { apiKey } = await ApiKey.createForUser(testUserId, {
        name: 'Permission Check Key',
        permissions: ['screenshot:create', 'screenshot:read'],
      });

      expect((apiKey as unknown as ApiKeyWithMethods).hasPermission('screenshot:create')).toBe(true);
      expect((apiKey as unknown as ApiKeyWithMethods).hasPermission('screenshot:delete')).toBe(false);
    });
  });

  describe('Usage Recording', () => {
    it('should record usage', async () => {
      const { apiKey } = await ApiKey.createForUser(testUserId, {
        name: 'Usage Recording Key',
      });

      expect(apiKey.usageCount).toBe(0);
      expect(apiKey.lastUsedAt).toBeUndefined();

      await (apiKey as unknown as ApiKeyWithMethods).recordUsage();

      expect(apiKey.usageCount).toBe(1);
      expect(apiKey.lastUsedAt).toBeDefined();
    });
  });

  describe('JSON Transformation', () => {
    it('should not expose key in JSON', async () => {
      const { apiKey } = await ApiKey.createForUser(testUserId, {
        name: 'JSON Key',
      });

      const json = apiKey.toJSON();
      expect(json).not.toHaveProperty('key');
      expect(json).not.toHaveProperty('keyHash');
    });

    it('should expose masked key in virtual', async () => {
      const { apiKey } = await ApiKey.createForUser(testUserId, {
        name: 'Masked Key',
      });

      expect((apiKey as unknown as ApiKeyWithMethods).maskedKey).toBeDefined();
      expect((apiKey as unknown as ApiKeyWithMethods).maskedKey).toMatch(/^ss_[a-zA-Z0-9]{4}\*+[a-zA-Z0-9]{4}$/);
    });
  });
});
