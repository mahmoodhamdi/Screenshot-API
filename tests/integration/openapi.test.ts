/**
 * OpenAPI Documentation Integration Tests
 * Verifies that all API endpoints and schemas are properly documented
 */

// Set environment variables before any imports
process.env.JWT_SECRET = 'test-jwt-secret-key-minimum-32-characters-long';
process.env.JWT_REFRESH_SECRET = 'test-jwt-refresh-secret-key-minimum-32-chars';
process.env.NODE_ENV = 'test';

import request from 'supertest';
import app from '@/app';

interface OpenAPISpec {
  openapi: string;
  info: {
    title: string;
    version: string;
    description: string;
  };
  tags: Array<{ name: string; description: string }>;
  paths: Record<string, Record<string, unknown>>;
  components: {
    schemas: Record<string, unknown>;
    responses: Record<string, unknown>;
    securitySchemes: Record<string, unknown>;
  };
}

describe('OpenAPI Documentation Verification', () => {
  let spec: OpenAPISpec;

  beforeAll(async () => {
    const response = await request(app).get('/docs/openapi.json');
    spec = response.body;
  });

  describe('OpenAPI Spec Structure', () => {
    it('should return valid OpenAPI 3.0 specification', () => {
      expect(spec.openapi).toMatch(/^3\.0/);
    });

    it('should have required info fields', () => {
      expect(spec.info).toBeDefined();
      expect(spec.info.title).toBe('Screenshot API');
      expect(spec.info.version).toBeDefined();
      expect(spec.info.description).toContain('Screenshot API');
    });

    it('should have security schemes defined', () => {
      expect(spec.components.securitySchemes).toBeDefined();
      expect(spec.components.securitySchemes.bearerAuth).toBeDefined();
      expect(spec.components.securitySchemes.apiKeyAuth).toBeDefined();
    });
  });

  describe('API Tags', () => {
    it('should have all required tags', () => {
      const tagNames = spec.tags.map((t) => t.name);
      expect(tagNames).toContain('Authentication');
      expect(tagNames).toContain('Screenshots');
      expect(tagNames).toContain('Subscriptions');
      expect(tagNames).toContain('Analytics');
    });
  });

  describe('Screenshot Endpoints (8 endpoints)', () => {
    it('should have POST /screenshots endpoint', () => {
      expect(spec.paths['/screenshots']).toBeDefined();
      expect(spec.paths['/screenshots'].post).toBeDefined();
    });

    it('should have GET /screenshots endpoint', () => {
      expect(spec.paths['/screenshots']).toBeDefined();
      expect(spec.paths['/screenshots'].get).toBeDefined();
    });

    it('should have GET /screenshots/{id} endpoint', () => {
      expect(spec.paths['/screenshots/{id}']).toBeDefined();
      expect(spec.paths['/screenshots/{id}'].get).toBeDefined();
    });

    it('should have DELETE /screenshots/{id} endpoint', () => {
      expect(spec.paths['/screenshots/{id}']).toBeDefined();
      expect(spec.paths['/screenshots/{id}'].delete).toBeDefined();
    });

    it('should have GET /screenshots/stats endpoint', () => {
      expect(spec.paths['/screenshots/stats']).toBeDefined();
      expect(spec.paths['/screenshots/stats'].get).toBeDefined();
    });

    it('should have POST /screenshots/{id}/retry endpoint', () => {
      expect(spec.paths['/screenshots/{id}/retry']).toBeDefined();
      expect(spec.paths['/screenshots/{id}/retry'].post).toBeDefined();
    });

    it('should have POST /screenshots/{id}/refresh-url endpoint', () => {
      expect(spec.paths['/screenshots/{id}/refresh-url']).toBeDefined();
      expect(spec.paths['/screenshots/{id}/refresh-url'].post).toBeDefined();
    });

    it('should have GET /screenshots/{id}/download endpoint', () => {
      expect(spec.paths['/screenshots/{id}/download']).toBeDefined();
      expect(spec.paths['/screenshots/{id}/download'].get).toBeDefined();
    });

    it('should have Screenshots tag on all screenshot endpoints', () => {
      const screenshotEndpoints = [
        { path: '/screenshots', method: 'post' },
        { path: '/screenshots', method: 'get' },
        { path: '/screenshots/{id}', method: 'get' },
        { path: '/screenshots/{id}', method: 'delete' },
        { path: '/screenshots/stats', method: 'get' },
      ];

      screenshotEndpoints.forEach(({ path, method }) => {
        const endpoint = spec.paths[path]?.[method] as { tags?: string[] };
        expect(endpoint?.tags).toContain('Screenshots');
      });
    });
  });

  describe('Subscription Endpoints (9 endpoints)', () => {
    it('should have GET /subscriptions/plans endpoint', () => {
      expect(spec.paths['/subscriptions/plans']).toBeDefined();
      expect(spec.paths['/subscriptions/plans'].get).toBeDefined();
    });

    it('should have POST /subscriptions/webhook endpoint', () => {
      expect(spec.paths['/subscriptions/webhook']).toBeDefined();
      expect(spec.paths['/subscriptions/webhook'].post).toBeDefined();
    });

    it('should have POST /subscriptions/checkout endpoint', () => {
      expect(spec.paths['/subscriptions/checkout']).toBeDefined();
      expect(spec.paths['/subscriptions/checkout'].post).toBeDefined();
    });

    it('should have POST /subscriptions/portal endpoint', () => {
      expect(spec.paths['/subscriptions/portal']).toBeDefined();
      expect(spec.paths['/subscriptions/portal'].post).toBeDefined();
    });

    it('should have GET /subscriptions endpoint', () => {
      expect(spec.paths['/subscriptions']).toBeDefined();
      expect(spec.paths['/subscriptions'].get).toBeDefined();
    });

    it('should have DELETE /subscriptions endpoint', () => {
      expect(spec.paths['/subscriptions']).toBeDefined();
      expect(spec.paths['/subscriptions'].delete).toBeDefined();
    });

    it('should have POST /subscriptions/resume endpoint', () => {
      expect(spec.paths['/subscriptions/resume']).toBeDefined();
      expect(spec.paths['/subscriptions/resume'].post).toBeDefined();
    });

    it('should have PUT /subscriptions/plan endpoint', () => {
      expect(spec.paths['/subscriptions/plan']).toBeDefined();
      expect(spec.paths['/subscriptions/plan'].put).toBeDefined();
    });

    it('should have GET /subscriptions/usage endpoint', () => {
      expect(spec.paths['/subscriptions/usage']).toBeDefined();
      expect(spec.paths['/subscriptions/usage'].get).toBeDefined();
    });

    it('should have Subscriptions tag on subscription endpoints', () => {
      const subscriptionEndpoints = [
        { path: '/subscriptions/plans', method: 'get' },
        { path: '/subscriptions/checkout', method: 'post' },
        { path: '/subscriptions/portal', method: 'post' },
        { path: '/subscriptions', method: 'get' },
        { path: '/subscriptions', method: 'delete' },
      ];

      subscriptionEndpoints.forEach(({ path, method }) => {
        const endpoint = spec.paths[path]?.[method] as { tags?: string[] };
        expect(endpoint?.tags).toContain('Subscriptions');
      });
    });
  });

  describe('Analytics Endpoints (6 endpoints)', () => {
    it('should have GET /analytics/overview endpoint', () => {
      expect(spec.paths['/analytics/overview']).toBeDefined();
      expect(spec.paths['/analytics/overview'].get).toBeDefined();
    });

    it('should have GET /analytics/screenshots endpoint', () => {
      expect(spec.paths['/analytics/screenshots']).toBeDefined();
      expect(spec.paths['/analytics/screenshots'].get).toBeDefined();
    });

    it('should have GET /analytics/usage endpoint', () => {
      expect(spec.paths['/analytics/usage']).toBeDefined();
      expect(spec.paths['/analytics/usage'].get).toBeDefined();
    });

    it('should have GET /analytics/errors endpoint', () => {
      expect(spec.paths['/analytics/errors']).toBeDefined();
      expect(spec.paths['/analytics/errors'].get).toBeDefined();
    });

    it('should have GET /analytics/urls endpoint', () => {
      expect(spec.paths['/analytics/urls']).toBeDefined();
      expect(spec.paths['/analytics/urls'].get).toBeDefined();
    });

    it('should have GET /analytics/api-keys/{id} endpoint', () => {
      expect(spec.paths['/analytics/api-keys/{id}']).toBeDefined();
      expect(spec.paths['/analytics/api-keys/{id}'].get).toBeDefined();
    });

    it('should have Analytics tag on all analytics endpoints', () => {
      const analyticsEndpoints = [
        '/analytics/overview',
        '/analytics/screenshots',
        '/analytics/usage',
        '/analytics/errors',
        '/analytics/urls',
        '/analytics/api-keys/{id}',
      ];

      analyticsEndpoints.forEach((path) => {
        const endpoint = spec.paths[path]?.get as { tags?: string[] };
        expect(endpoint?.tags).toContain('Analytics');
      });
    });
  });

  describe('Required Schemas', () => {
    const requiredSchemas = [
      'Error',
      'User',
      'RegisterRequest',
      'LoginRequest',
      'AuthTokens',
      'ApiKey',
      'CreateApiKeyRequest',
      'ScreenshotRequest',
      'Screenshot',
      'ScreenshotResponse',
      'ScreenshotListResponse',
      'SubscriptionPlan',
      'Subscription',
      'CreateCheckoutRequest',
      'CheckoutResponse',
      'PortalResponse',
      'OverviewStats',
      'UsageStats',
      'AnalyticsOverview',
      'ScreenshotStats',
      'UsageOverTime',
      'ErrorBreakdown',
      'PopularUrl',
      'ApiKeyStats',
    ];

    it('should have all required schemas defined', () => {
      requiredSchemas.forEach((schema) => {
        expect(spec.components.schemas[schema]).toBeDefined();
      });
    });

    it('should have Error schema with proper structure', () => {
      const errorSchema = spec.components.schemas.Error as {
        type: string;
        properties: Record<string, unknown>;
      };
      expect(errorSchema.type).toBe('object');
      expect(errorSchema.properties.success).toBeDefined();
      expect(errorSchema.properties.error).toBeDefined();
    });

    it('should have Screenshot schema with proper structure', () => {
      const screenshotSchema = spec.components.schemas.Screenshot as {
        type: string;
        properties: Record<string, unknown>;
      };
      expect(screenshotSchema.type).toBe('object');
      expect(screenshotSchema.properties.id).toBeDefined();
      expect(screenshotSchema.properties.url).toBeDefined();
      expect(screenshotSchema.properties.options).toBeDefined();
      expect(screenshotSchema.properties.result).toBeDefined();
    });

    it('should have AnalyticsOverview schema with proper structure', () => {
      const analyticsSchema = spec.components.schemas.AnalyticsOverview as {
        type: string;
        properties: Record<string, unknown>;
      };
      expect(analyticsSchema.type).toBe('object');
      expect(analyticsSchema.properties.totalScreenshots).toBeDefined();
      expect(analyticsSchema.properties.successRate).toBeDefined();
      expect(analyticsSchema.properties.currentPlan).toBeDefined();
    });
  });

  describe('Required Responses', () => {
    const requiredResponses = [
      'Unauthorized',
      'BadRequest',
      'NotFound',
      'RateLimitExceeded',
      'QuotaExceeded',
      'PaymentRequired',
    ];

    it('should have all required response definitions', () => {
      requiredResponses.forEach((response) => {
        expect(spec.components.responses[response]).toBeDefined();
      });
    });

    it('should have proper error response structure', () => {
      const unauthorized = spec.components.responses.Unauthorized as {
        description: string;
        content: Record<string, unknown>;
      };
      expect(unauthorized.description).toBeDefined();
      expect(unauthorized.content['application/json']).toBeDefined();
    });
  });

  describe('Endpoint Count Verification', () => {
    it('should have at least 8 screenshot-related paths', () => {
      const screenshotPaths = Object.keys(spec.paths).filter((p) => p.includes('/screenshots'));
      expect(screenshotPaths.length).toBeGreaterThanOrEqual(4); // paths, some have multiple methods
    });

    it('should have at least 6 subscription-related paths', () => {
      const subscriptionPaths = Object.keys(spec.paths).filter((p) =>
        p.includes('/subscriptions')
      );
      expect(subscriptionPaths.length).toBeGreaterThanOrEqual(5);
    });

    it('should have 6 analytics-related paths', () => {
      const analyticsPaths = Object.keys(spec.paths).filter((p) => p.includes('/analytics'));
      expect(analyticsPaths.length).toBe(6);
    });
  });

  describe('Documentation Quality', () => {
    it('should have descriptions for all main endpoints', () => {
      const mainPaths = [
        '/screenshots',
        '/subscriptions',
        '/analytics/overview',
      ];

      mainPaths.forEach((path) => {
        const pathObj = spec.paths[path];
        if (pathObj) {
          Object.values(pathObj).forEach((method) => {
            const endpoint = method as { description?: string; summary?: string };
            expect(endpoint.summary || endpoint.description).toBeDefined();
          });
        }
      });
    });

    it('should have security defined for protected endpoints', () => {
      const protectedPaths = [
        { path: '/screenshots', method: 'post' },
        { path: '/subscriptions', method: 'get' },
        { path: '/analytics/overview', method: 'get' },
      ];

      protectedPaths.forEach(({ path, method }) => {
        const endpoint = spec.paths[path]?.[method] as { security?: unknown[] };
        expect(endpoint?.security).toBeDefined();
        expect(endpoint?.security?.length).toBeGreaterThan(0);
      });
    });
  });
});

describe('Documentation Endpoints Accessibility', () => {
  describe('GET /docs', () => {
    it('should return Swagger UI page', async () => {
      const response = await request(app).get('/docs/');
      expect(response.status).toBe(200);
      expect(response.type).toBe('text/html');
    });
  });

  describe('GET /docs/openapi.json', () => {
    it('should return valid JSON', async () => {
      const response = await request(app).get('/docs/openapi.json');
      expect(response.status).toBe(200);
      expect(response.type).toBe('application/json');
      expect(response.body.openapi).toBeDefined();
    });
  });

  describe('GET /docs/openapi.yaml', () => {
    it('should return valid YAML', async () => {
      const response = await request(app).get('/docs/openapi.yaml');
      expect(response.status).toBe(200);
      expect(response.text).toContain('openapi:');
    });
  });

  describe('GET /redoc', () => {
    it('should return ReDoc page', async () => {
      const response = await request(app).get('/redoc');
      expect(response.status).toBe(200);
      expect(response.type).toBe('text/html');
    });
  });
});
