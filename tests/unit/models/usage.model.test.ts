/**
 * Unit Tests for Usage Model
 */

// Set required environment variables before importing modules
process.env.JWT_SECRET = 'test-jwt-secret-key-minimum-32-characters';
process.env.JWT_REFRESH_SECRET = 'test-jwt-refresh-secret-key-minimum-32-chars';
process.env.NODE_ENV = 'test';

import mongoose from 'mongoose';
import Usage from '@models/usage.model';
import User from '@models/user.model';

describe('Usage Model', () => {

  describe('Usage Recording', () => {
    it('should record a successful screenshot', async () => {
      // Create a dedicated user for this test
      const testUser = await User.create({
        email: 'usage-record-success@example.com',
        password: 'Password123',
        name: 'Usage Record Success',
      });

      await Usage.recordScreenshot({
        userId: testUser._id as mongoose.Types.ObjectId,
        success: true,
        format: 'png',
        size: 50000,
        duration: 2500,
      });

      const usageRecords = await Usage.find({ user: testUser._id });
      expect(usageRecords).toHaveLength(1);
      expect(usageRecords[0].screenshots.total).toBe(1);
      expect(usageRecords[0].screenshots.successful).toBe(1);
      expect(usageRecords[0].screenshots.failed).toBe(0);
      expect(usageRecords[0].screenshots.byFormat.png).toBe(1);
      expect(usageRecords[0].bandwidth).toBe(50000);
    });

    it('should record a failed screenshot with error', async () => {
      // Create a dedicated user for this test
      const testUser = await User.create({
        email: 'usage-record-fail@example.com',
        password: 'Password123',
        name: 'Usage Record Fail',
      });

      await Usage.recordScreenshot({
        userId: testUser._id as mongoose.Types.ObjectId,
        success: false,
        format: 'png',
        size: 0,
        duration: 500,
        error: 'Navigation timeout',
      });

      const usageRecords = await Usage.find({ user: testUser._id });
      expect(usageRecords).toHaveLength(1);
      expect(usageRecords[0].screenshots.total).toBe(1);
      expect(usageRecords[0].screenshots.successful).toBe(0);
      expect(usageRecords[0].screenshots.failed).toBe(1);
      // errorBreakdown is stored as a Map in mongoose, cast properly
      const errorBreakdown = usageRecords[0].errorBreakdown as unknown as Map<string, number>;
      expect(errorBreakdown.get('Navigation timeout')).toBe(1);
    });

    it('should accumulate usage on the same day', async () => {
      // Create a dedicated user for this test
      const testUser = await User.create({
        email: 'usage-accumulate@example.com',
        password: 'Password123',
        name: 'Usage Accumulate',
      });

      // Record multiple screenshots
      await Usage.recordScreenshot({
        userId: testUser._id as mongoose.Types.ObjectId,
        success: true,
        format: 'png',
        size: 50000,
        duration: 2000,
      });

      await Usage.recordScreenshot({
        userId: testUser._id as mongoose.Types.ObjectId,
        success: true,
        format: 'jpeg',
        size: 30000,
        duration: 1500,
      });

      await Usage.recordScreenshot({
        userId: testUser._id as mongoose.Types.ObjectId,
        success: false,
        format: 'png',
        size: 0,
        duration: 500,
        error: 'Timeout',
      });

      const usageRecords = await Usage.find({ user: testUser._id });
      expect(usageRecords).toHaveLength(1);
      expect(usageRecords[0].screenshots.total).toBe(3);
      expect(usageRecords[0].screenshots.successful).toBe(2);
      expect(usageRecords[0].screenshots.failed).toBe(1);
      expect(usageRecords[0].screenshots.byFormat.png).toBe(2);
      expect(usageRecords[0].screenshots.byFormat.jpeg).toBe(1);
      expect(usageRecords[0].bandwidth).toBe(80000);
    });

    it('should track response time statistics', async () => {
      // Create a dedicated user for this test
      const testUser = await User.create({
        email: 'usage-response-time@example.com',
        password: 'Password123',
        name: 'Usage Response Time',
      });

      await Usage.recordScreenshot({
        userId: testUser._id as mongoose.Types.ObjectId,
        success: true,
        format: 'png',
        size: 50000,
        duration: 2000,
      });

      await Usage.recordScreenshot({
        userId: testUser._id as mongoose.Types.ObjectId,
        success: true,
        format: 'png',
        size: 50000,
        duration: 3000,
      });

      await Usage.recordScreenshot({
        userId: testUser._id as mongoose.Types.ObjectId,
        success: true,
        format: 'png',
        size: 50000,
        duration: 1000,
      });

      const usageRecords = await Usage.find({ user: testUser._id });
      expect(usageRecords[0].responseTime.min).toBe(1000);
      expect(usageRecords[0].responseTime.max).toBe(3000);
      expect(usageRecords[0].responseTime.avg).toBe(2000);
    });
  });

  describe('Usage Queries', () => {
    // Helper to setup query test data
    const setupQueryTestData = async () => {
      // Create a dedicated user for query tests
      const user = await User.create({
        email: `usage-query-${Date.now()}@example.com`,
        password: 'Password123',
        name: 'Usage Query User',
      });
      const queryTestUser = user._id as mongoose.Types.ObjectId;

      // Create usage records for different dates
      const today = new Date();
      today.setUTCHours(0, 0, 0, 0);

      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      const twoDaysAgo = new Date(today);
      twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

      await Usage.create({
        user: queryTestUser,
        date: today,
        screenshots: { total: 10, successful: 9, failed: 1, byFormat: { png: 5, jpeg: 5 } },
        bandwidth: 500000,
        responseTime: { avg: 2000, min: 1000, max: 3000, p95: 2800, p99: 2950 },
      });

      await Usage.create({
        user: queryTestUser,
        date: yesterday,
        screenshots: { total: 20, successful: 18, failed: 2, byFormat: { png: 10, jpeg: 10 } },
        bandwidth: 1000000,
        responseTime: { avg: 2500, min: 1500, max: 3500, p95: 3200, p99: 3400 },
      });

      await Usage.create({
        user: queryTestUser,
        date: twoDaysAgo,
        screenshots: { total: 5, successful: 5, failed: 0, byFormat: { png: 5 } },
        bandwidth: 250000,
        responseTime: { avg: 1800, min: 1200, max: 2400, p95: 2200, p99: 2350 },
      });

      return { queryTestUser, today, yesterday, twoDaysAgo };
    };

    it('should get usage by user', async () => {
      const { queryTestUser } = await setupQueryTestData();
      const usage = await Usage.getByUser(queryTestUser);
      expect(usage).toHaveLength(3);
    });

    it('should get usage by date range', async () => {
      const { queryTestUser, today, yesterday } = await setupQueryTestData();

      const usage = await Usage.getByDateRange(queryTestUser, yesterday, today);
      expect(usage).toHaveLength(2);
    });

    it('should get usage overview', async () => {
      const { queryTestUser } = await setupQueryTestData();
      const overview = await Usage.getOverview(queryTestUser);

      expect(overview.totalScreenshots).toBe(35);
      expect(overview.successfulScreenshots).toBe(32);
      expect(overview.failedScreenshots).toBe(3);
      expect(overview.totalBandwidth).toBe(1750000);
      expect(overview.successRate).toBeCloseTo(91.43, 1);
    });

    it('should get usage overview with date filter', async () => {
      const { queryTestUser, today } = await setupQueryTestData();

      const overview = await Usage.getOverview(queryTestUser, { fromDate: today, toDate: today });

      expect(overview.totalScreenshots).toBe(10);
      expect(overview.successfulScreenshots).toBe(9);
      expect(overview.failedScreenshots).toBe(1);
    });

    it('should aggregate by day', async () => {
      const { queryTestUser, today, twoDaysAgo } = await setupQueryTestData();

      const aggregated = await Usage.aggregateByPeriod(queryTestUser, {
        fromDate: twoDaysAgo,
        toDate: today,
        groupBy: 'day',
      });

      expect(aggregated).toHaveLength(3);
      // Results should be sorted by date ascending
      expect(aggregated[0].screenshots).toBe(5);  // Oldest first
      expect(aggregated[2].screenshots).toBe(10); // Most recent last
    });
  });

  describe('Virtual Fields', () => {
    it('should calculate success rate', async () => {
      // Create a dedicated user for this test
      const testUser = await User.create({
        email: 'virtual-success-rate@example.com',
        password: 'Password123',
        name: 'Virtual Success Rate',
      });

      const usage = await Usage.create({
        user: testUser._id,
        date: new Date(),
        screenshots: { total: 100, successful: 95, failed: 5 },
        bandwidth: 5000000,
        responseTime: { avg: 2000, min: 1000, max: 3000, p95: 2800, p99: 2950 },
      });

      // The successRate virtual returns a string with 2 decimal places
      expect((usage as unknown as { successRate: string }).successRate).toBe('95.00');
    });

    it('should return 100 when no screenshots', async () => {
      // Create a dedicated user for this test
      const testUser = await User.create({
        email: 'virtual-no-screenshots@example.com',
        password: 'Password123',
        name: 'Virtual No Screenshots',
      });

      const usage = await Usage.create({
        user: testUser._id,
        date: new Date(),
        screenshots: { total: 0, successful: 0, failed: 0 },
        bandwidth: 0,
        responseTime: { avg: 0, min: 0, max: 0, p95: 0, p99: 0 },
      });

      expect((usage as unknown as { successRate: number }).successRate).toBe(100);
    });
  });

  describe('JSON Transformation', () => {
    it('should not include __v in JSON', async () => {
      // Create a dedicated user for this test
      const testUser = await User.create({
        email: 'json-no-v@example.com',
        password: 'Password123',
        name: 'JSON No V',
      });

      const usage = await Usage.create({
        user: testUser._id,
        date: new Date(),
        screenshots: { total: 10, successful: 9, failed: 1 },
        bandwidth: 500000,
        responseTime: { avg: 2000, min: 1000, max: 3000, p95: 2800, p99: 2950 },
      });

      const json = usage.toJSON();
      expect(json).not.toHaveProperty('__v');
    });

    it('should convert errorBreakdown Map to object', async () => {
      // Create a dedicated user for this test
      const testUser = await User.create({
        email: 'json-error-breakdown@example.com',
        password: 'Password123',
        name: 'JSON Error Breakdown',
      });

      await Usage.recordScreenshot({
        userId: testUser._id as mongoose.Types.ObjectId,
        success: false,
        format: 'png',
        size: 0,
        duration: 500,
        error: 'Test Error',
      });

      const usage = await Usage.findOne({ user: testUser._id });
      const json = usage?.toJSON();

      // After transformation, errorBreakdown should be a plain object
      expect(json?.errorBreakdown).toBeDefined();
      expect(typeof json?.errorBreakdown).toBe('object');
    });
  });
});
