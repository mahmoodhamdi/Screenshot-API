# OpenAPI Documentation Plan

## Overview

إضافة OpenAPI JSDoc documentation كاملة لجميع الـ endpoints الناقصة (Screenshots, Subscriptions, Analytics).

---

## Phase 1: Screenshot Endpoints Documentation

### Prompt for Phase 1
```
Read the file: D:\Screenshot-API\docs\plans\openapi-documentation-plan.md

Execute Phase 1: Screenshot Endpoints Documentation

Tasks:
1. Read src/routes/auth.routes.ts to understand the OpenAPI JSDoc format being used
2. Read src/routes/screenshot.routes.ts to see current endpoints
3. Read src/controllers/screenshot.controller.ts to understand request/response formats
4. Read src/config/swagger.ts to see existing schemas

Add complete OpenAPI JSDoc comments to src/routes/screenshot.routes.ts for:

POST /screenshots - Create screenshot
- Request body: url (required), width, height, format, fullPage, darkMode, blockAds, delay, selector, quality, headers, cookies, webhookUrl
- Response: Screenshot object with id, status, url, metadata

GET /screenshots - List screenshots
- Query params: page, limit, status, format, startDate, endDate
- Response: Paginated list of screenshots

GET /screenshots/:id - Get screenshot by ID
- Path param: id
- Response: Screenshot object

DELETE /screenshots/:id - Delete screenshot
- Path param: id
- Response: Success message

POST /screenshots/:id/retry - Retry failed screenshot
- Path param: id
- Response: Updated screenshot object

POST /screenshots/:id/refresh-url - Refresh signed URL
- Path param: id
- Response: New signed URL

GET /screenshots/:id/download - Download screenshot file
- Path param: id
- Response: Binary file stream

GET /screenshots/stats - Get screenshot statistics
- Query params: startDate, endDate
- Response: Stats object with counts

Use this exact format for each endpoint (copy from auth.routes.ts):
/**
 * @openapi
 * /api/v1/screenshots:
 *   post:
 *     tags:
 *       - Screenshots
 *     summary: Create a new screenshot
 *     description: Capture a screenshot of any website
 *     security:
 *       - ApiKeyAuth: []
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateScreenshotRequest'
 *           example:
 *             url: "https://example.com"
 *             width: 1920
 *             height: 1080
 *             format: "png"
 *     responses:
 *       201:
 *         description: Screenshot created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ScreenshotResponse'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       429:
 *         $ref: '#/components/responses/TooManyRequests'
 */

After adding JSDoc comments:
- Run npm run lint:fix
- Run npm run typecheck
- Start dev server and verify docs appear at /docs
- Create commit: "docs(api): add OpenAPI documentation for screenshot endpoints"
- Push to remote
```

---

## Phase 2: Subscription Endpoints Documentation

### Prompt for Phase 2
```
Read the file: D:\Screenshot-API\docs\plans\openapi-documentation-plan.md

Execute Phase 2: Subscription Endpoints Documentation

Tasks:
1. Read src/routes/subscription.routes.ts to see current endpoints
2. Read src/controllers/subscription.controller.ts to understand request/response formats
3. Read src/services/subscription.service.ts for business logic details

Add complete OpenAPI JSDoc comments to src/routes/subscription.routes.ts for:

GET /subscriptions/plans - Get available plans
- Response: Array of plan objects with name, price, features, limits

POST /subscriptions/checkout - Create Stripe checkout session
- Request body: plan (starter|professional|enterprise), successUrl, cancelUrl
- Response: Checkout session URL

POST /subscriptions/portal - Create Stripe billing portal session
- Request body: returnUrl
- Response: Portal session URL

GET /subscriptions - Get current subscription
- Response: Subscription object with plan, status, dates

DELETE /subscriptions - Cancel subscription
- Response: Updated subscription with canceledAt

POST /subscriptions/resume - Resume canceled subscription
- Response: Updated subscription

PUT /subscriptions/plan - Change subscription plan
- Request body: plan
- Response: Updated subscription

GET /subscriptions/usage - Get usage statistics
- Response: Usage object with screenshotCount, apiCalls, bandwidth

POST /subscriptions/webhook - Stripe webhook handler
- Request body: Stripe event object
- Response: Acknowledgment

After adding JSDoc comments:
- Run npm run lint:fix
- Run npm run typecheck
- Start dev server and verify docs appear at /docs
- Create commit: "docs(api): add OpenAPI documentation for subscription endpoints"
- Push to remote
```

---

## Phase 3: Analytics Endpoints Documentation

### Prompt for Phase 3
```
Read the file: D:\Screenshot-API\docs\plans\openapi-documentation-plan.md

Execute Phase 3: Analytics Endpoints Documentation

Tasks:
1. Read src/routes/analytics.routes.ts to see current endpoints
2. Read src/controllers/analytics.controller.ts to understand request/response formats

Add complete OpenAPI JSDoc comments to src/routes/analytics.routes.ts for:

GET /analytics/overview - Get analytics overview
- Query params: startDate, endDate, period (day|week|month)
- Response: Overview with totalScreenshots, successRate, avgDuration, topFormats

GET /analytics/screenshots - Get screenshot analytics
- Query params: startDate, endDate, groupBy (day|week|month)
- Response: Array of daily/weekly/monthly screenshot counts

GET /analytics/usage - Get API usage analytics
- Query params: startDate, endDate
- Response: Usage data with apiCalls, bandwidth, errors

GET /analytics/errors - Get error analytics
- Query params: startDate, endDate
- Response: Array of error types with counts

GET /analytics/urls - Get top URLs analytics
- Query params: startDate, endDate, limit
- Response: Array of most captured URLs

GET /analytics/api-keys/:id - Get API key specific analytics
- Path param: id (API key ID)
- Query params: startDate, endDate
- Response: Analytics for specific API key

After adding JSDoc comments:
- Run npm run lint:fix
- Run npm run typecheck
- Start dev server and verify docs appear at /docs
- Create commit: "docs(api): add OpenAPI documentation for analytics endpoints"
- Push to remote
```

---

## Phase 4: Update Swagger Schemas

### Prompt for Phase 4
```
Read the file: D:\Screenshot-API\docs\plans\openapi-documentation-plan.md

Execute Phase 4: Update Swagger Schemas

Tasks:
1. Read src/config/swagger.ts to see existing schemas
2. Add any missing request/response schemas

Add these schemas to src/config/swagger.ts if not already present:

CreateScreenshotRequest:
  type: object
  required:
    - url
  properties:
    url:
      type: string
      format: uri
      description: URL to capture
    width:
      type: integer
      minimum: 320
      maximum: 7680
      default: 1280
    height:
      type: integer
      minimum: 240
      maximum: 4320
      default: 720
    format:
      type: string
      enum: [png, jpeg, webp, pdf]
      default: png
    fullPage:
      type: boolean
      default: false
    darkMode:
      type: boolean
      default: false
    blockAds:
      type: boolean
      default: false
    delay:
      type: integer
      minimum: 0
      maximum: 10000
      default: 0
    selector:
      type: string
    quality:
      type: integer
      minimum: 1
      maximum: 100
      default: 80
    headers:
      type: object
    cookies:
      type: array
      items:
        type: object
    webhookUrl:
      type: string
      format: uri

ScreenshotResponse:
  type: object
  properties:
    success:
      type: boolean
    data:
      $ref: '#/components/schemas/Screenshot'

CreateCheckoutRequest:
  type: object
  required:
    - plan
    - successUrl
    - cancelUrl
  properties:
    plan:
      type: string
      enum: [starter, professional, enterprise]
    successUrl:
      type: string
      format: uri
    cancelUrl:
      type: string
      format: uri

AnalyticsOverview:
  type: object
  properties:
    totalScreenshots:
      type: integer
    successRate:
      type: number
    avgDuration:
      type: number
    topFormats:
      type: array
      items:
        type: object
        properties:
          format:
            type: string
          count:
            type: integer

After updating schemas:
- Run npm run lint:fix
- Run npm run typecheck
- Start dev server and verify schemas appear in /docs
- Create commit: "docs(api): add missing OpenAPI schemas"
- Push to remote
```

---

## Phase 5: Verify and Test Documentation

### Prompt for Phase 5
```
Read the file: D:\Screenshot-API\docs\plans\openapi-documentation-plan.md

Execute Phase 5: Verify and Test Documentation

Tasks:
1. Start the dev server: npm run dev
2. Open http://localhost:3000/docs in browser
3. Verify all endpoints are documented:
   - Screenshots section shows 8 endpoints
   - Subscriptions section shows 9 endpoints
   - Analytics section shows 6 endpoints
4. Test "Try it out" functionality for each endpoint
5. Verify schemas are correctly linked
6. Check that examples are accurate

Create integration tests for documentation endpoints:
- Test /docs returns 200
- Test /docs/openapi.json returns valid OpenAPI spec
- Test all endpoint paths exist in spec
- Test all schemas are defined

File: tests/integration/openapi.test.ts

After testing:
- Run npm test
- Fix any issues found
- Create commit: "test(api): add OpenAPI documentation tests"
- Push to remote
```

---

## Success Criteria

- [ ] All 8 Screenshot endpoints documented with full OpenAPI JSDoc
- [ ] All 9 Subscription endpoints documented with full OpenAPI JSDoc
- [ ] All 6 Analytics endpoints documented with full OpenAPI JSDoc
- [ ] All request/response schemas defined in swagger.ts
- [ ] Documentation visible and correct at /docs
- [ ] All "Try it out" buttons work correctly
- [ ] Tests pass for documentation endpoints
