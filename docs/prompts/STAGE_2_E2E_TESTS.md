# Stage 2: End-to-End Tests

## Overview
Create comprehensive E2E tests covering complete user flows from registration to screenshot capture.

## Directory Structure to Create
```
tests/
└── e2e/
    ├── auth.e2e.test.ts        # Complete auth flow
    ├── screenshot.e2e.test.ts  # Screenshot capture flow
    ├── subscription.e2e.test.ts # Subscription flow
    └── api.e2e.test.ts         # Full API integration
```

## Test Scenarios

### File 1: `tests/e2e/auth.e2e.test.ts`

#### Test Cases:
1. **Complete Registration Flow**
   - Register new user with valid data
   - Verify email format validation
   - Check duplicate email rejection
   - Verify user is created in database

2. **Complete Login Flow**
   - Login with valid credentials
   - Verify access token is returned
   - Verify refresh token is returned
   - Test invalid credentials rejection

3. **Token Refresh Flow**
   - Use refresh token to get new access token
   - Verify old token still works until expiry
   - Test invalid refresh token rejection

4. **API Key Management Flow**
   - Create API key after login
   - List all API keys
   - Verify API key works for authentication
   - Delete API key
   - Verify deleted key no longer works

5. **Password Reset Flow**
   - Request password reset
   - Verify reset token is generated
   - Reset password with token
   - Login with new password

---

### File 2: `tests/e2e/screenshot.e2e.test.ts`

#### Test Cases:
1. **Basic Screenshot Capture**
   - Capture screenshot of valid URL
   - Verify response contains screenshot data
   - Check screenshot is saved in database
   - Verify file exists in storage

2. **Screenshot with Options**
   - Test different formats (PNG, JPEG, WebP)
   - Test different resolutions
   - Test full-page capture
   - Test element selector capture
   - Test dark mode option

3. **Screenshot List and Retrieval**
   - List user's screenshots
   - Get screenshot by ID
   - Verify pagination works
   - Filter by date range

4. **Screenshot Deletion**
   - Delete screenshot by ID
   - Verify file is removed from storage
   - Verify database record is deleted
   - Test delete non-existent screenshot

5. **Rate Limiting**
   - Make requests up to rate limit
   - Verify 429 response when exceeded
   - Wait for rate limit reset
   - Verify requests work again

6. **Quota Enforcement**
   - Track usage count
   - Verify quota limit is enforced
   - Test quota reset behavior

---

### File 3: `tests/e2e/subscription.e2e.test.ts`

#### Test Cases:
1. **Plan Information**
   - Get available plans
   - Verify plan details match configuration
   - Check feature differences between plans

2. **Usage Statistics**
   - Get current usage stats
   - Verify usage matches actual activity
   - Check usage breakdown by date

3. **Checkout Session (Mock)**
   - Create checkout session
   - Verify session URL is returned
   - Test with different plan IDs

4. **Webhook Handling (Mock)**
   - Simulate checkout.session.completed
   - Verify user plan is updated
   - Simulate subscription cancelled
   - Verify user reverts to free plan

---

### File 4: `tests/e2e/api.e2e.test.ts`

#### Test Cases:
1. **Complete User Journey**
   ```
   Register → Login → Create API Key → Capture Screenshot → View Analytics → Logout
   ```

2. **Error Handling**
   - Test 400 Bad Request scenarios
   - Test 401 Unauthorized scenarios
   - Test 403 Forbidden scenarios
   - Test 404 Not Found scenarios
   - Test 429 Rate Limited scenarios
   - Test 500 Server Error handling

3. **Security Tests**
   - Test without authentication
   - Test with invalid API key
   - Test with expired JWT
   - Test CORS headers
   - Test rate limiting per IP

4. **Data Validation**
   - Test invalid URL formats
   - Test invalid screenshot options
   - Test oversized requests
   - Test SQL/NoSQL injection attempts

---

## Implementation Details

### Test Setup
```typescript
// tests/e2e/setup.ts
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import { createApp } from '@/app';
import supertest from 'supertest';

let mongoServer: MongoMemoryServer;
let app: Express.Application;

export const setupE2E = async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());
  app = createApp();
  return supertest(app);
};

export const teardownE2E = async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
};
```

### Test Helpers
```typescript
// tests/e2e/helpers.ts
export const createTestUser = async (request: supertest.SuperTest) => {
  const userData = {
    name: 'Test User',
    email: `test-${Date.now()}@example.com`,
    password: 'Password123!'
  };

  const response = await request
    .post('/api/v1/auth/register')
    .send(userData);

  return { ...userData, ...response.body.data };
};

export const loginUser = async (request: supertest.SuperTest, email: string, password: string) => {
  const response = await request
    .post('/api/v1/auth/login')
    .send({ email, password });

  return response.body.data;
};

export const createApiKey = async (request: supertest.SuperTest, token: string) => {
  const response = await request
    .post('/api/v1/auth/api-keys')
    .set('Authorization', `Bearer ${token}`)
    .send({ name: 'Test Key', permissions: ['screenshot:create'] });

  return response.body.data;
};
```

---

## Execution Steps

### Step 1: Create E2E directory
```bash
mkdir -p tests/e2e
```

### Step 2: Create test files in order
1. Create `tests/e2e/helpers.ts`
2. Create `tests/e2e/auth.e2e.test.ts`
3. Create `tests/e2e/screenshot.e2e.test.ts`
4. Create `tests/e2e/subscription.e2e.test.ts`
5. Create `tests/e2e/api.e2e.test.ts`

### Step 3: Update Jest config if needed
Ensure `jest.config.js` includes e2e pattern:
```javascript
testMatch: ['**/*.test.ts', '**/*.spec.ts', '**/*.e2e.test.ts']
```

### Step 4: Run tests
```bash
npm run test:e2e
```

---

## Success Criteria
- [ ] All E2E test files created
- [ ] `npm run test:e2e` passes
- [ ] Coverage includes all main user flows
- [ ] Tests are isolated and don't depend on each other
- [ ] Tests clean up after themselves

## Commit Message
```
test(e2e): add comprehensive end-to-end test suite

- Add complete auth flow tests (register, login, API keys)
- Add screenshot capture flow tests
- Add subscription and usage tests
- Add full API integration tests
- Cover error handling and edge cases
```
