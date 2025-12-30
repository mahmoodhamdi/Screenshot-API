/**
 * Puppeteer Configuration Unit Tests
 * Tests for browser pool, page cache, and request interception optimizations
 */

import {
  blockedDomains,
  blockedPatterns,
  combinedBlockPattern,
  blockableResourceTypes,
  getTimeoutForPlan,
  getNavigationTimeoutForPlan,
  getPageCacheKey,
  getPageCacheStats,
  clearPageCache,
  viewportPresets,
  userAgents,
} from '@config/puppeteer';
import { PlanType } from '@/types';

describe('Puppeteer Configuration', () => {
  // ============================================
  // Ad/Tracker Blocking Patterns
  // ============================================

  describe('Blocked Domains', () => {
    it('should have a list of blocked domains', () => {
      expect(blockedDomains).toBeInstanceOf(Array);
      expect(blockedDomains.length).toBeGreaterThan(0);
    });

    it('should include common ad networks', () => {
      expect(blockedDomains).toContain('googlesyndication.com');
      expect(blockedDomains).toContain('doubleclick.net');
      expect(blockedDomains).toContain('facebook.net');
    });

    it('should include analytics providers', () => {
      expect(blockedDomains).toContain('google-analytics.com');
      expect(blockedDomains).toContain('googletagmanager.com');
      expect(blockedDomains).toContain('hotjar.com');
      expect(blockedDomains).toContain('mixpanel.com');
    });
  });

  describe('Compiled Regex Patterns', () => {
    it('should have compiled patterns for each domain', () => {
      expect(blockedPatterns).toBeInstanceOf(Array);
      expect(blockedPatterns.length).toBe(blockedDomains.length);
    });

    it('should match URLs containing blocked domains', () => {
      const testUrl = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js';
      const matches = blockedPatterns.some((pattern) => pattern.test(testUrl));
      expect(matches).toBe(true);
    });

    it('should not match legitimate URLs', () => {
      const testUrl = 'https://example.com/page.html';
      const matches = blockedPatterns.some((pattern) => pattern.test(testUrl));
      expect(matches).toBe(false);
    });

    it('should be case-insensitive', () => {
      const testUrl = 'https://www.GOOGLESYNDICATION.COM/ads';
      const matches = blockedPatterns.some((pattern) => pattern.test(testUrl));
      expect(matches).toBe(true);
    });
  });

  describe('Combined Block Pattern', () => {
    it('should be a single RegExp', () => {
      expect(combinedBlockPattern).toBeInstanceOf(RegExp);
    });

    it('should match ad network URLs in single pass', () => {
      expect(combinedBlockPattern.test('https://www.doubleclick.net/track')).toBe(true);
      expect(combinedBlockPattern.test('https://ads.facebook.net/pixel')).toBe(true);
      expect(combinedBlockPattern.test('https://www.google-analytics.com/ga.js')).toBe(true);
    });

    it('should not match clean URLs', () => {
      expect(combinedBlockPattern.test('https://example.com')).toBe(false);
      expect(combinedBlockPattern.test('https://myapp.io/dashboard')).toBe(false);
    });

    it('should be more efficient than individual pattern checks', () => {
      const testUrls = [
        'https://example.com/page1',
        'https://example.com/page2',
        'https://example.com/page3',
        'https://ads.googlesyndication.com/ad',
      ];

      // Combined pattern - single regex test per URL
      const startCombined = performance.now();
      for (let i = 0; i < 1000; i++) {
        testUrls.forEach((url) => combinedBlockPattern.test(url));
      }
      const combinedTime = performance.now() - startCombined;

      // Individual patterns - multiple regex tests per URL
      const startIndividual = performance.now();
      for (let i = 0; i < 1000; i++) {
        testUrls.forEach((url) => blockedPatterns.some((p) => p.test(url)));
      }
      const individualTime = performance.now() - startIndividual;

      // Combined should be faster (or at least comparable)
      expect(combinedTime).toBeLessThan(individualTime * 2);
    });
  });

  // ============================================
  // Resource Type Blocking
  // ============================================

  describe('Blockable Resource Types', () => {
    it('should define blockable resource types', () => {
      expect(blockableResourceTypes).toBeDefined();
    });

    it('should have image types', () => {
      expect(blockableResourceTypes.images).toContain('image');
      expect(blockableResourceTypes.images).toContain('imageset');
    });

    it('should have media types', () => {
      expect(blockableResourceTypes.media).toContain('media');
    });

    it('should have font types', () => {
      expect(blockableResourceTypes.fonts).toContain('font');
    });

    it('should have ad-related types', () => {
      expect(blockableResourceTypes.ads).toContain('script');
      expect(blockableResourceTypes.ads).toContain('xhr');
      expect(blockableResourceTypes.ads).toContain('fetch');
    });
  });

  // ============================================
  // Plan-Based Timeouts
  // ============================================

  describe('Plan-Based Timeouts', () => {
    describe('getTimeoutForPlan', () => {
      it('should return 15 seconds for free plan', () => {
        expect(getTimeoutForPlan('free')).toBe(15000);
      });

      it('should return 30 seconds for starter plan', () => {
        expect(getTimeoutForPlan('starter')).toBe(30000);
      });

      it('should return 45 seconds for professional plan', () => {
        expect(getTimeoutForPlan('professional')).toBe(45000);
      });

      it('should return 60 seconds for enterprise plan', () => {
        expect(getTimeoutForPlan('enterprise')).toBe(60000);
      });

      it('should return default timeout for unknown plan', () => {
        const timeout = getTimeoutForPlan('unknown' as PlanType);
        expect(timeout).toBeGreaterThan(0);
      });
    });

    describe('getNavigationTimeoutForPlan', () => {
      it('should return 1.2x the screenshot timeout', () => {
        expect(getNavigationTimeoutForPlan('free')).toBe(18000); // 15000 * 1.2
        expect(getNavigationTimeoutForPlan('starter')).toBe(36000); // 30000 * 1.2
        expect(getNavigationTimeoutForPlan('professional')).toBe(54000); // 45000 * 1.2
      });

      it('should cap at 60 seconds max', () => {
        expect(getNavigationTimeoutForPlan('enterprise')).toBe(60000);
      });
    });
  });

  // ============================================
  // Page Cache
  // ============================================

  describe('Page Cache', () => {
    beforeEach(async () => {
      await clearPageCache();
    });

    describe('getPageCacheKey', () => {
      it('should generate key based on viewport and options', () => {
        const key = getPageCacheKey({
          viewport: { width: 1920, height: 1080 },
          blockAds: true,
          blockImages: false,
        });
        expect(key).toBe('1920x1080:ads=true:img=false');
      });

      it('should use defaults for missing options', () => {
        const key = getPageCacheKey({});
        expect(key).toBe('1920x1080:ads=false:img=false');
      });

      it('should generate different keys for different settings', () => {
        const key1 = getPageCacheKey({ viewport: { width: 1920, height: 1080 } });
        const key2 = getPageCacheKey({ viewport: { width: 1280, height: 720 } });
        const key3 = getPageCacheKey({ viewport: { width: 1920, height: 1080 }, blockAds: true });

        expect(key1).not.toBe(key2);
        expect(key1).not.toBe(key3);
      });
    });

    describe('getPageCacheStats', () => {
      it('should return cache statistics', () => {
        const stats = getPageCacheStats();
        expect(stats).toHaveProperty('size');
        expect(stats).toHaveProperty('maxSize');
        expect(stats).toHaveProperty('keys');
      });

      it('should start with empty cache', () => {
        const stats = getPageCacheStats();
        expect(stats.size).toBe(0);
        expect(stats.keys).toHaveLength(0);
      });
    });

    describe('clearPageCache', () => {
      it('should clear the cache', async () => {
        await clearPageCache();
        const stats = getPageCacheStats();
        expect(stats.size).toBe(0);
      });
    });
  });

  // ============================================
  // Viewport Presets
  // ============================================

  describe('Viewport Presets', () => {
    it('should have desktop preset', () => {
      expect(viewportPresets.desktop).toEqual({ width: 1920, height: 1080 });
    });

    it('should have laptop preset', () => {
      expect(viewportPresets.laptop).toEqual({ width: 1366, height: 768 });
    });

    it('should have tablet preset', () => {
      expect(viewportPresets.tablet).toEqual({ width: 768, height: 1024 });
    });

    it('should have mobile preset', () => {
      expect(viewportPresets.mobile).toEqual({ width: 375, height: 812 });
    });

    it('should have mobile landscape preset', () => {
      expect(viewportPresets.mobileLandscape).toEqual({ width: 812, height: 375 });
    });
  });

  // ============================================
  // User Agent Strings
  // ============================================

  describe('User Agent Strings', () => {
    it('should have Chrome user agent', () => {
      expect(userAgents.chrome).toContain('Chrome');
      expect(userAgents.chrome).toContain('Mozilla');
    });

    it('should have Firefox user agent', () => {
      expect(userAgents.firefox).toContain('Firefox');
      expect(userAgents.firefox).toContain('Gecko');
    });

    it('should have Safari user agent', () => {
      expect(userAgents.safari).toContain('Safari');
      expect(userAgents.safari).toContain('Macintosh');
    });

    it('should have Edge user agent', () => {
      expect(userAgents.edge).toContain('Edg');
    });

    it('should have mobile user agent', () => {
      expect(userAgents.mobile).toContain('iPhone');
      expect(userAgents.mobile).toContain('Mobile');
    });
  });
});
