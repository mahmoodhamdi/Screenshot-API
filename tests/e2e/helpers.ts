/**
 * E2E Test Helpers
 * Common utilities and functions for E2E testing
 */

import request from 'supertest';
import app from '@/app';

// ============================================
// Types
// ============================================

export interface TestUser {
  name: string;
  email: string;
  password: string;
  userId?: string;
  accessToken?: string;
  refreshToken?: string;
}

export interface TestApiKey {
  id: string;
  name: string;
  key: string;
  permissions: string[];
}

// ============================================
// Request Instance
// ============================================

export const api = request(app);

// ============================================
// User Helpers
// ============================================

/**
 * Generate unique test user data
 */
export function generateTestUser(suffix?: string): TestUser {
  const timestamp = Date.now();
  const uniqueSuffix = suffix || timestamp.toString();
  return {
    name: `Test User ${uniqueSuffix}`,
    email: `test-${uniqueSuffix}@example.com`,
    password: 'TestPassword123!',
  };
}

/**
 * Register a new test user
 */
export async function registerUser(userData?: Partial<TestUser>): Promise<TestUser> {
  const user = { ...generateTestUser(), ...userData };

  const response = await api.post('/api/v1/auth/register').send({
    name: user.name,
    email: user.email,
    password: user.password,
  });

  if (response.status === 201 && response.body.success) {
    return {
      ...user,
      userId: response.body.data.user.id,
      accessToken: response.body.data.tokens.accessToken,
      refreshToken: response.body.data.tokens.refreshToken,
    };
  }

  throw new Error(`Failed to register user: ${JSON.stringify(response.body)}`);
}

/**
 * Login an existing user
 */
export async function loginUser(
  email: string,
  password: string
): Promise<{ accessToken: string; refreshToken: string; userId: string }> {
  const response = await api.post('/api/v1/auth/login').send({
    email,
    password,
  });

  if (response.status === 200 && response.body.success) {
    return {
      accessToken: response.body.data.tokens.accessToken,
      refreshToken: response.body.data.tokens.refreshToken,
      userId: response.body.data.user.id,
    };
  }

  throw new Error(`Failed to login: ${JSON.stringify(response.body)}`);
}

/**
 * Create an API key for a user
 */
export async function createApiKey(
  accessToken: string,
  options?: {
    name?: string;
    permissions?: string[];
    ipWhitelist?: string[];
    domainWhitelist?: string[];
  }
): Promise<TestApiKey> {
  const response = await api
    .post('/api/v1/auth/api-keys')
    .set('Authorization', `Bearer ${accessToken}`)
    .send({
      name: options?.name || 'Test API Key',
      permissions: options?.permissions || ['screenshot:create', 'screenshot:read'],
      ipWhitelist: options?.ipWhitelist,
      domainWhitelist: options?.domainWhitelist,
    });

  if (response.status === 201 && response.body.success) {
    return {
      id: response.body.data.id,
      name: response.body.data.name,
      key: response.body.data.key,
      permissions: response.body.data.permissions,
    };
  }

  throw new Error(`Failed to create API key: ${JSON.stringify(response.body)}`);
}

/**
 * Create a user with API key
 */
export async function createUserWithApiKey(): Promise<{
  user: TestUser;
  apiKey: TestApiKey;
}> {
  const user = await registerUser();
  const apiKey = await createApiKey(user.accessToken!);
  return { user, apiKey };
}

// ============================================
// Auth Header Helpers
// ============================================

/**
 * Create Bearer auth header
 */
export function bearerAuth(token: string): { Authorization: string } {
  return { Authorization: `Bearer ${token}` };
}

/**
 * Create API key auth header
 */
export function apiKeyAuth(key: string): { 'X-API-Key': string } {
  return { 'X-API-Key': key };
}

// ============================================
// Screenshot Helpers
// ============================================

/**
 * Create a screenshot request
 */
export async function createScreenshot(
  authToken: string,
  options?: {
    url?: string;
    width?: number;
    height?: number;
    format?: 'png' | 'jpeg' | 'webp' | 'pdf';
    fullPage?: boolean;
    darkMode?: boolean;
  },
  useApiKey: boolean = false
): Promise<{ id: string; url: string; status: string }> {
  const req = api.post('/api/v1/screenshots').send({
    url: options?.url || 'https://example.com',
    width: options?.width,
    height: options?.height,
    format: options?.format,
    fullPage: options?.fullPage,
    darkMode: options?.darkMode,
  });

  if (useApiKey) {
    req.set('X-API-Key', authToken);
  } else {
    req.set('Authorization', `Bearer ${authToken}`);
  }

  const response = await req;

  if (response.body.success) {
    return {
      id: response.body.data.id,
      url: response.body.data.url,
      status: response.body.data.status || response.body.data.result?.status,
    };
  }

  throw new Error(`Failed to create screenshot: ${JSON.stringify(response.body)}`);
}

// ============================================
// Assertion Helpers
// ============================================

/**
 * Assert successful response
 */
export function expectSuccess(response: request.Response, statusCode: number = 200): void {
  expect(response.status).toBe(statusCode);
  expect(response.body.success).toBe(true);
}

/**
 * Assert error response
 */
export function expectError(
  response: request.Response,
  statusCode: number,
  errorCode?: string
): void {
  expect(response.status).toBe(statusCode);
  expect(response.body.success).toBe(false);
  if (errorCode) {
    expect(response.body.error?.code).toBe(errorCode);
  }
}

/**
 * Assert response has required fields
 */
export function expectFields(obj: Record<string, unknown>, fields: string[]): void {
  for (const field of fields) {
    expect(obj).toHaveProperty(field);
  }
}

// ============================================
// Cleanup Helpers
// ============================================

/**
 * Wait for a specified time
 */
export function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Retry an async operation
 */
export async function retry<T>(
  fn: () => Promise<T>,
  maxAttempts: number = 3,
  delayMs: number = 100
): Promise<T> {
  let lastError: Error | undefined;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      if (attempt < maxAttempts) {
        await wait(delayMs * attempt);
      }
    }
  }

  throw lastError;
}
