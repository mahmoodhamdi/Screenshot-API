import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import IORedis from 'ioredis';

// Set test environment variables at module load time so they are
// available before any test file's transitive imports (e.g. src/config)
// trigger schema validation.
process.env.NODE_ENV = process.env.NODE_ENV || 'test';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-jwt-secret-key-minimum-32-characters';
process.env.JWT_REFRESH_SECRET =
  process.env.JWT_REFRESH_SECRET || 'test-jwt-refresh-secret-key-minimum-32-chars';
process.env.JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1h';
process.env.JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '7d';
process.env.API_KEY_PREFIX = process.env.API_KEY_PREFIX || 'ss_test_';
process.env.REDIS_HOST = process.env.REDIS_HOST || 'localhost';
process.env.REDIS_PORT = process.env.REDIS_PORT || '6379';

declare global {
  // eslint-disable-next-line no-var
  var __MONGO_INSTANCE__: MongoMemoryServer | undefined;
}

// Heuristic: only do real Redis wiring + cross-test cleanup when this
// test process is running integration or e2e tests. Unit tests mock
// internal modules (including the logger) and break if we eagerly load
// production code or trigger Redis event handlers in afterAll.
const isStatefulTestRun =
  process.env.STATEFUL_TEST_REDIS === '1' ||
  process.argv.some((arg) => /tests\/(integration|e2e)/.test(arg));

// Lazy-loaded references to internal modules. Required late so the env
// vars set above are visible when src/config validates its schema.
// Loading is best-effort: unit tests that mock @config/index can leave
// these refs null and the test infra still works.
let connectRedisFn: (() => Promise<unknown>) | null = null;
let disconnectRedisFn: (() => Promise<unknown>) | null = null;
let redisCircuitBreakerRef: { reset: () => void } | null = null;
let fallbackRateLimiterRef: { clear: () => void; destroy?: () => void } | null = null;
let appModulesLoadAttempted = false;

async function loadAppModules(): Promise<void> {
  if (appModulesLoadAttempted) return;
  appModulesLoadAttempted = true;
  try {
    if (!connectRedisFn) {
      const redisModule = await import('@config/redis');
      connectRedisFn = redisModule.connectRedis;
      disconnectRedisFn = redisModule.disconnectRedis;
    }
  } catch {
    /* unit tests that mock @config/index hit this path; non-fatal */
  }
  try {
    if (!redisCircuitBreakerRef) {
      const cbModule = await import('@utils/circuitBreaker');
      redisCircuitBreakerRef = cbModule.redisCircuitBreaker;
    }
  } catch {
    /* non-fatal */
  }
  try {
    if (!fallbackRateLimiterRef) {
      const fbModule = await import('@utils/fallbackRateLimiter');
      fallbackRateLimiterRef = fbModule.fallbackRateLimiter;
    }
  } catch {
    /* non-fatal */
  }
}

// Dedicated Redis client for cleanup between tests. Connects lazily and
// silently swallows errors so test files that don't touch Redis still run
// when Redis is unavailable.
let testRedis: IORedis | null = null;
function getTestRedis(): IORedis {
  if (!testRedis) {
    testRedis = new IORedis({
      host: process.env.REDIS_HOST,
      port: Number(process.env.REDIS_PORT),
      password: process.env.REDIS_PASSWORD || undefined,
      lazyConnect: true,
      maxRetriesPerRequest: 1,
      retryStrategy: () => null,
      enableOfflineQueue: false,
    });
    testRedis.on('error', () => {
      /* ignore — test setup must not crash on Redis outage */
    });
  }
  return testRedis;
}

beforeAll(async () => {
  // Connect to in-memory MongoDB if not already connected
  if (mongoose.connection.readyState === 0 && global.__MONGO_INSTANCE__) {
    const uri = global.__MONGO_INSTANCE__.getUri();
    await mongoose.connect(uri);
  }

  if (!isStatefulTestRun) return;

  // Initialise the app's Redis client so the rate limiter, login attempt
  // service, and IP reputation service use the real Redis path. Without
  // this, every state-bearing service falls back to in-process memory,
  // which leaks state across tests inside the same file.
  await loadAppModules();
  try {
    if (connectRedisFn) {
      await connectRedisFn();
    }
  } catch {
    /* tests that don't touch Redis still run; circuit breaker handles the rest */
  }
});

afterAll(async () => {
  // Disconnect from MongoDB
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }

  if (!isStatefulTestRun) return;

  // Disconnect the app's Redis client (started in beforeAll)
  if (disconnectRedisFn) {
    try {
      await disconnectRedisFn();
    } catch {
      /* ignore */
    }
  }
  // Close test Redis client
  if (testRedis) {
    try {
      await testRedis.quit();
    } catch {
      testRedis.disconnect();
    }
    testRedis = null;
  }
});

afterEach(async () => {
  // Clear all collections after each test
  if (mongoose.connection.readyState !== 0) {
    const collections = mongoose.connection.collections;
    for (const key in collections) {
      await collections[key].deleteMany({});
    }
  }

  if (!isStatefulTestRun) return;

  // Reset circuit breaker + fallback store so a single Redis blip in one
  // test doesn't leave the next test stuck on the in-memory fallback.
  // Wrapped in try/catch — unit tests that mock @utils/logger may not
  // provide all methods these helpers use internally.
  try {
    redisCircuitBreakerRef?.reset();
  } catch {
    /* non-fatal */
  }
  try {
    fallbackRateLimiterRef?.clear();
  } catch {
    /* non-fatal */
  }

  // Clear Redis state (rate limits, login attempts, IP reputation, caches)
  // so each test starts from a clean slate. Failures are non-fatal —
  // test files that don't depend on Redis don't need it running.
  try {
    const client = getTestRedis();
    if (client.status === 'wait' || client.status === 'end') {
      await client.connect();
    }
    if (client.status === 'ready') {
      await client.flushdb();
    }
  } catch {
    /* ignore — tests that don't need Redis must still pass */
  }
}, 10000);
