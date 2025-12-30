/**
 * Health Check Routes
 * Provides health status endpoints for monitoring and Kubernetes probes
 */

import { Router, Request, Response } from 'express';
import mongoose from 'mongoose';
import { checkRedisHealth, getRedisStatus } from '@config/redis';
import {
  getRateLimitCircuitState,
  getRateLimitCircuitStats,
} from '@middlewares/rateLimit.middleware';
import { checkRequiredServices } from '@config/validate';
import config from '@config/index';
import { version } from '../../package.json';

const router = Router();

// ============================================
// Types
// ============================================

interface ServiceHealth {
  status: 'up' | 'down' | 'degraded';
  latencyMs?: number;
  error?: string;
  details?: Record<string, unknown>;
}

interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  uptime: number;
  version: string;
  environment: string;
  services: {
    mongodb: ServiceHealth;
    redis: ServiceHealth;
    rateLimiter: ServiceHealth;
  };
  checks?: {
    database: boolean;
    redis: boolean;
    email: boolean;
    storage: boolean;
    payments: boolean;
  };
}

// Track server start time
const startTime = Date.now();

// ============================================
// Helper Functions
// ============================================

/**
 * Check MongoDB connection health
 */
async function checkMongoHealth(): Promise<ServiceHealth> {
  const startMs = Date.now();

  try {
    const state = mongoose.connection.readyState;

    if (state !== 1) {
      return {
        status: 'down',
        error: `Connection state: ${getMongoStateLabel(state)}`,
      };
    }

    // Ping the database to check latency
    await mongoose.connection.db?.admin().ping();
    const latencyMs = Date.now() - startMs;

    return {
      status: latencyMs > 1000 ? 'degraded' : 'up',
      latencyMs,
      details: {
        host: mongoose.connection.host,
        name: mongoose.connection.name,
      },
    };
  } catch (error) {
    return {
      status: 'down',
      latencyMs: Date.now() - startMs,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Get MongoDB connection state label
 */
function getMongoStateLabel(state: number): string {
  const states: Record<number, string> = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting',
  };
  return states[state] || 'unknown';
}

/**
 * Build complete health status
 */
async function buildHealthStatus(includeDetails = false): Promise<HealthStatus> {
  // Check all services in parallel
  const [mongoHealth, redisHealthResult] = await Promise.all([
    checkMongoHealth(),
    checkRedisHealth(),
  ]);

  const circuitState = getRateLimitCircuitState();
  const circuitStats = getRateLimitCircuitStats();

  // Convert Redis health to standard format
  const redisHealth: ServiceHealth = {
    status: redisHealthResult.connected
      ? redisHealthResult.latencyMs && redisHealthResult.latencyMs > 100
        ? 'degraded'
        : 'up'
      : 'down',
    latencyMs: redisHealthResult.latencyMs,
    error: redisHealthResult.error,
    details: {
      connectionStatus: getRedisStatus(),
    },
  };

  // Rate limiter health based on circuit breaker
  const rateLimiterHealth: ServiceHealth = {
    status: circuitState === 'CLOSED' ? 'up' : circuitState === 'HALF_OPEN' ? 'degraded' : 'down',
    details: {
      circuitBreaker: circuitState,
      usingFallback: circuitState === 'OPEN',
      stats: {
        failures: circuitStats.failures,
        successes: circuitStats.successes,
        totalRequests: circuitStats.totalRequests,
        fallbackRequests: circuitStats.fallbackRequests,
      },
    },
  };

  // Determine overall status
  const allServices = [mongoHealth, redisHealth, rateLimiterHealth];
  const hasDown = allServices.some((s) => s.status === 'down');
  const hasDegraded = allServices.some((s) => s.status === 'degraded');

  // MongoDB being down is critical
  const overallStatus: HealthStatus['status'] =
    mongoHealth.status === 'down'
      ? 'unhealthy'
      : hasDown || hasDegraded
        ? 'degraded'
        : 'healthy';

  const health: HealthStatus = {
    status: overallStatus,
    timestamp: new Date().toISOString(),
    uptime: Math.floor((Date.now() - startTime) / 1000),
    version,
    environment: config.server.env,
    services: {
      mongodb: mongoHealth,
      redis: redisHealth,
      rateLimiter: rateLimiterHealth,
    },
  };

  // Include service configuration checks if requested
  if (includeDetails) {
    health.checks = checkRequiredServices();
  }

  return health;
}

// ============================================
// Routes
// ============================================

/**
 * @openapi
 * /health:
 *   get:
 *     summary: Comprehensive health check
 *     description: Returns detailed health status of all services
 *     tags: [Health]
 *     parameters:
 *       - in: query
 *         name: details
 *         schema:
 *           type: boolean
 *         description: Include service configuration checks
 *     responses:
 *       200:
 *         description: Service is healthy or degraded
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   enum: [healthy, degraded, unhealthy]
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                 uptime:
 *                   type: number
 *                   description: Server uptime in seconds
 *                 version:
 *                   type: string
 *                 services:
 *                   type: object
 *       503:
 *         description: Service is unhealthy
 */
router.get('/', async (req: Request, res: Response) => {
  const includeDetails = req.query.details === 'true';
  const health = await buildHealthStatus(includeDetails);

  const statusCode = health.status === 'unhealthy' ? 503 : 200;
  res.status(statusCode).json(health);
});

/**
 * @openapi
 * /health/live:
 *   get:
 *     summary: Kubernetes liveness probe
 *     description: Simple check to verify the process is alive
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Process is alive
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: alive
 *                 timestamp:
 *                   type: string
 */
router.get('/live', (_req: Request, res: Response) => {
  res.status(200).json({
    status: 'alive',
    timestamp: new Date().toISOString(),
  });
});

/**
 * @openapi
 * /health/ready:
 *   get:
 *     summary: Kubernetes readiness probe
 *     description: Check if the service is ready to accept traffic
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Service is ready
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ready:
 *                   type: boolean
 *                 checks:
 *                   type: object
 *       503:
 *         description: Service is not ready
 */
router.get('/ready', async (_req: Request, res: Response) => {
  // Check critical services
  const mongoState = mongoose.connection.readyState;
  const redisHealth = await checkRedisHealth();

  // Service is ready if MongoDB is connected
  // Redis being down is acceptable (fallback mode)
  const isReady = mongoState === 1;

  const checks = {
    mongodb: mongoState === 1,
    redis: redisHealth.connected,
  };

  res.status(isReady ? 200 : 503).json({
    ready: isReady,
    checks,
    timestamp: new Date().toISOString(),
  });
});

/**
 * @openapi
 * /health/startup:
 *   get:
 *     summary: Kubernetes startup probe
 *     description: Check if the application has started successfully
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Application has started
 *       503:
 *         description: Application is still starting
 */
router.get('/startup', async (_req: Request, res: Response) => {
  // Check if MongoDB is connected (minimum requirement to be "started")
  const mongoState = mongoose.connection.readyState;
  const isStarted = mongoState === 1;

  if (isStarted) {
    res.status(200).json({
      started: true,
      uptime: Math.floor((Date.now() - startTime) / 1000),
      timestamp: new Date().toISOString(),
    });
  } else {
    res.status(503).json({
      started: false,
      message: 'Waiting for database connection',
      mongoState: getMongoStateLabel(mongoState),
      timestamp: new Date().toISOString(),
    });
  }
});

export default router;
