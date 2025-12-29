/**
 * Redis Failover Integration Tests
 * Tests circuit breaker and fallback rate limiting behavior
 */

// Set environment variables before any imports
process.env.JWT_SECRET = 'test-jwt-secret-key-minimum-32-characters-long';
process.env.JWT_REFRESH_SECRET = 'test-jwt-refresh-secret-key-minimum-32-chars';
process.env.NODE_ENV = 'test';

import request from 'supertest';
import app from '@/app';
import { redisCircuitBreaker, CircuitState } from '@utils/circuitBreaker';
import { fallbackRateLimiter } from '@utils/fallbackRateLimiter';

describe('Redis Failover', () => {
  beforeEach(() => {
    // Reset circuit breaker before each test
    redisCircuitBreaker.reset();
    fallbackRateLimiter.clear();
  });

  describe('Health Endpoint', () => {
    it('should return health status with Redis info', async () => {
      const response = await request(app).get('/health');

      // Health endpoint returns 200 for healthy or degraded, 503 only for critical failures
      expect([200, 503]).toContain(response.status);
      expect(response.body.success).toBe(true);
      expect(response.body.services).toBeDefined();
      expect(response.body.services.redis).toBeDefined();
      expect(response.body.services.rateLimiter).toBeDefined();
    });

    it('should include circuit breaker state in health', async () => {
      const response = await request(app).get('/health');

      expect(response.body.services.rateLimiter.circuitBreaker).toBeDefined();
      expect(['CLOSED', 'OPEN', 'HALF_OPEN']).toContain(
        response.body.services.rateLimiter.circuitBreaker
      );
    });

    it('should include rate limiter stats', async () => {
      const response = await request(app).get('/health');

      expect(response.body.services.rateLimiter.stats).toBeDefined();
      expect(response.body.services.rateLimiter.stats.totalRequests).toBeDefined();
      expect(response.body.services.rateLimiter.stats.failures).toBeDefined();
    });

    it('should indicate if using fallback', async () => {
      const response = await request(app).get('/health');

      expect(response.body.services.rateLimiter.usingFallback).toBeDefined();
      expect(typeof response.body.services.rateLimiter.usingFallback).toBe('boolean');
    });
  });

  describe('Circuit Breaker State', () => {
    it('should start with CLOSED circuit breaker', async () => {
      const response = await request(app).get('/health');

      expect(response.body.services.rateLimiter.circuitBreaker).toBe('CLOSED');
    });

    it('should report usingFallback=false when circuit is closed', async () => {
      const response = await request(app).get('/health');

      expect(response.body.services.rateLimiter.usingFallback).toBe(false);
    });
  });

  describe('Degraded Mode Detection', () => {
    it('should return appropriate status when healthy', async () => {
      const response = await request(app).get('/health');

      // When Redis is connected, status should be healthy
      if (response.body.services.redis.status === 'up') {
        expect(response.body.status).toBe('healthy');
      }
    });

    it('should include Redis connection status', async () => {
      const response = await request(app).get('/health');

      expect(['up', 'down']).toContain(response.body.services.redis.status);
    });

    it('should include Redis latency when connected', async () => {
      const response = await request(app).get('/health');

      if (response.body.services.redis.status === 'up') {
        expect(response.body.services.redis.latencyMs).toBeDefined();
        expect(typeof response.body.services.redis.latencyMs).toBe('number');
      }
    });
  });

  describe('Rate Limiting with Fallback', () => {
    it('should continue to work when making multiple requests', async () => {
      // Make several requests to test rate limiting
      const responses = await Promise.all([
        request(app).get('/health'),
        request(app).get('/health'),
        request(app).get('/health'),
      ]);

      // All should respond (either 200 or 503 depending on Redis state)
      responses.forEach((response) => {
        expect([200, 503]).toContain(response.status);
        expect(response.body.success).toBe(true);
      });
    });

    it('should track requests in stats', async () => {
      // Make a request first
      await request(app).get('/health');

      // Check stats - note that stats are for rate limit circuit breaker, not health requests
      const response = await request(app).get('/health');
      expect(response.body.services.rateLimiter.stats).toBeDefined();
      expect(typeof response.body.services.rateLimiter.stats.totalRequests).toBe('number');
    });
  });

  describe('Fallback Rate Limiter', () => {
    it('should have fallback rate limiter available', () => {
      expect(fallbackRateLimiter).toBeDefined();
      expect(typeof fallbackRateLimiter.check).toBe('function');
    });

    it('should be able to check rate limits in memory', async () => {
      const result = await fallbackRateLimiter.check('test-key', 10, 60000);

      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(9);
    });

    it('should block when limit exceeded', async () => {
      const key = 'block-test-key';
      const max = 3;

      for (let i = 0; i < max; i++) {
        await fallbackRateLimiter.check(key, max, 60000);
      }

      const result = await fallbackRateLimiter.check(key, max, 60000);
      expect(result.allowed).toBe(false);
    });
  });

  describe('Circuit Breaker Behavior', () => {
    it('should have circuit breaker available', () => {
      expect(redisCircuitBreaker).toBeDefined();
      expect(typeof redisCircuitBreaker.execute).toBe('function');
    });

    it('should execute operations through circuit breaker', async () => {
      let operationCalled = false;

      const result = await redisCircuitBreaker.execute(
        async () => {
          operationCalled = true;
          return 'success';
        },
        () => 'fallback'
      );

      expect(operationCalled).toBe(true);
      expect(result).toBe('success');
    });

    it('should use fallback when operation fails', async () => {
      const result = await redisCircuitBreaker.execute(
        async () => {
          throw new Error('simulated failure');
        },
        () => 'fallback-value'
      );

      expect(result).toBe('fallback-value');
    });

    it('should track statistics', () => {
      const stats = redisCircuitBreaker.getStats();

      expect(stats).toBeDefined();
      expect(typeof stats.failures).toBe('number');
      expect(typeof stats.successes).toBe('number');
      expect(typeof stats.totalRequests).toBe('number');
    });

    it('should be resettable', () => {
      redisCircuitBreaker.reset();

      const stats = redisCircuitBreaker.getStats();
      expect(stats.state).toBe(CircuitState.CLOSED);
      expect(stats.failures).toBe(0);
    });
  });

  describe('Service Resilience', () => {
    it('should handle concurrent requests', async () => {
      const requests = Array(10)
        .fill(null)
        .map(() => request(app).get('/health'));

      const responses = await Promise.all(requests);

      // All should respond (either 200 or 503 depending on Redis state)
      responses.forEach((response) => {
        expect([200, 503]).toContain(response.status);
        expect(response.body.success).toBe(true);
      });
    });

    it('should return consistent health status format', async () => {
      const response = await request(app).get('/health');

      expect(response.body).toHaveProperty('success');
      expect(response.body).toHaveProperty('status');
      expect(response.body).toHaveProperty('service');
      expect(response.body).toHaveProperty('version');
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body).toHaveProperty('services');
    });
  });
});
