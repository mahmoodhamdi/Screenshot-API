# Screenshot API Documentation

Complete API reference for the Screenshot API. For interactive documentation, visit `/docs` when the server is running.

## Base URL

```
Development: http://localhost:3000/api/v1
Production:  https://api.screenshot-api.com/api/v1
```

## Authentication

The API supports two authentication methods:

### JWT Bearer Token

Obtain tokens by registering or logging in. Include the access token in requests:

```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### API Key

Create API keys from your dashboard. Include in requests:

```http
X-API-Key: ss_your_api_key_here
```

---

## Error Handling

All errors follow a consistent format:

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable message",
    "details": []
  }
}
```

### Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `VALIDATION_FAILED` | 400 | Request validation failed |
| `UNAUTHORIZED` | 401 | Authentication required |
| `AUTH_TOKEN_INVALID` | 401 | Invalid or expired token |
| `AUTH_TOKEN_EXPIRED` | 401 | Token has expired |
| `FORBIDDEN` | 403 | Insufficient permissions |
| `NOT_FOUND` | 404 | Resource not found |
| `RATE_LIMIT_EXCEEDED` | 429 | Too many requests |
| `QUOTA_EXCEEDED` | 429 | Monthly quota exceeded |
| `INTERNAL_ERROR` | 500 | Internal server error |

---

## Rate Limits

Rate limits are based on your subscription plan:

| Plan | Requests/Minute | Screenshots/Month |
|------|-----------------|-------------------|
| Free | 10 | 100 |
| Starter | 30 | 2,000 |
| Professional | 100 | 10,000 |
| Enterprise | 500 | 50,000 |

Rate limit headers are included in responses:

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640995200
```

---

## Authentication Endpoints

### Register User

Create a new user account.

```http
POST /auth/register
```

**Request Body:**

```json
{
  "email": "user@example.com",
  "password": "SecurePassword123!",
  "name": "John Doe",
  "company": "Acme Inc"
}
```

**Response (201):**

```json
{
  "success": true,
  "message": "Registration successful. Please verify your email.",
  "data": {
    "user": {
      "id": "507f1f77bcf86cd799439011",
      "email": "user@example.com",
      "name": "John Doe",
      "isVerified": false,
      "subscription": {
        "plan": "free",
        "status": "active"
      }
    },
    "tokens": {
      "accessToken": "eyJhbGc...",
      "refreshToken": "eyJhbGc..."
    }
  }
}
```

### Login

Authenticate an existing user.

```http
POST /auth/login
```

**Request Body:**

```json
{
  "email": "user@example.com",
  "password": "SecurePassword123!"
}
```

**Response (200):**

```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "507f1f77bcf86cd799439011",
      "email": "user@example.com",
      "name": "John Doe",
      "role": "user",
      "subscription": {
        "plan": "professional",
        "status": "active"
      }
    },
    "tokens": {
      "accessToken": "eyJhbGc...",
      "refreshToken": "eyJhbGc..."
    }
  }
}
```

### Get Current User

Get the authenticated user's profile.

```http
GET /auth/me
Authorization: Bearer <token>
```

**Response (200):**

```json
{
  "success": true,
  "data": {
    "id": "507f1f77bcf86cd799439011",
    "email": "user@example.com",
    "name": "John Doe",
    "company": "Acme Inc",
    "isVerified": true,
    "role": "user",
    "subscription": {
      "plan": "professional",
      "status": "active"
    },
    "usage": {
      "screenshotsThisMonth": 150,
      "lastResetDate": "2024-01-01T00:00:00.000Z"
    },
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### Refresh Token

Get a new access token using a refresh token.

```http
POST /auth/refresh
```

**Request Body:**

```json
{
  "refreshToken": "eyJhbGc..."
}
```

**Response (200):**

```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGc...",
    "refreshToken": "eyJhbGc..."
  }
}
```

### Logout

Invalidate the current refresh token.

```http
POST /auth/logout
Authorization: Bearer <token>
```

**Request Body:**

```json
{
  "refreshToken": "eyJhbGc..."
}
```

**Response (200):**

```json
{
  "success": true,
  "message": "Logout successful"
}
```

### Change Password

Change the authenticated user's password.

```http
POST /auth/change-password
Authorization: Bearer <token>
```

**Request Body:**

```json
{
  "currentPassword": "OldPassword123!",
  "newPassword": "NewPassword456!"
}
```

**Response (200):**

```json
{
  "success": true,
  "message": "Password changed successfully"
}
```

---

## API Key Management

### Create API Key

Create a new API key for programmatic access.

```http
POST /auth/api-keys
Authorization: Bearer <token>
```

**Request Body:**

```json
{
  "name": "Production API Key",
  "permissions": ["read", "screenshot:create"],
  "ipWhitelist": ["192.168.1.1", "10.0.0.0/8"],
  "domainWhitelist": ["example.com", "*.myapp.com"],
  "expiresAt": "2025-12-31T23:59:59.000Z",
  "rateLimit": 50
}
```

**Response (201):**

```json
{
  "success": true,
  "message": "API key created successfully. Store the key securely - it cannot be retrieved again.",
  "data": {
    "id": "507f1f77bcf86cd799439011",
    "name": "Production API Key",
    "key": "ss_live_a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6",
    "permissions": ["read", "screenshot:create"],
    "ipWhitelist": ["192.168.1.1", "10.0.0.0/8"],
    "domainWhitelist": ["example.com", "*.myapp.com"],
    "expiresAt": "2025-12-31T23:59:59.000Z",
    "rateLimit": 50,
    "createdAt": "2024-01-15T10:30:00.000Z"
  }
}
```

### List API Keys

Get all API keys for the authenticated user.

```http
GET /auth/api-keys
Authorization: Bearer <token>
```

**Response (200):**

```json
{
  "success": true,
  "data": [
    {
      "id": "507f1f77bcf86cd799439011",
      "name": "Production API Key",
      "maskedKey": "ss_****************************p5p6",
      "permissions": ["read", "screenshot:create"],
      "usageCount": 1250,
      "lastUsedAt": "2024-01-15T14:30:00.000Z",
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

### Revoke API Key

Permanently revoke an API key.

```http
DELETE /auth/api-keys/:id
Authorization: Bearer <token>
```

**Response (200):**

```json
{
  "success": true,
  "message": "API key revoked successfully"
}
```

---

## Screenshot Endpoints

### Create Screenshot

Capture a screenshot of a website.

```http
POST /screenshots
Authorization: Bearer <token>
X-API-Key: <api_key>
```

**Request Body:**

```json
{
  "url": "https://example.com",
  "width": 1920,
  "height": 1080,
  "fullPage": false,
  "format": "png",
  "quality": 80,
  "delay": 1000,
  "selector": "#main-content",
  "headers": {
    "Accept-Language": "en-US"
  },
  "cookies": [
    {
      "name": "session",
      "value": "abc123",
      "domain": "example.com"
    }
  ],
  "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
  "darkMode": false,
  "blockAds": true,
  "waitForSelector": ".loaded",
  "waitForNavigation": "networkidle2",
  "webhook": "https://myapp.com/webhook/screenshot"
}
```

**Response (201):**

```json
{
  "success": true,
  "data": {
    "id": "507f1f77bcf86cd799439011",
    "url": "https://example.com",
    "options": {
      "width": 1920,
      "height": 1080,
      "fullPage": false,
      "format": "png",
      "quality": 80
    },
    "result": {
      "status": "completed",
      "url": "https://storage.example.com/screenshots/abc123.png",
      "size": 245678,
      "duration": 2340
    },
    "metadata": {
      "pageTitle": "Example Domain",
      "pageDescription": "This domain is for use in illustrative examples.",
      "faviconUrl": "https://example.com/favicon.ico"
    },
    "createdAt": "2024-01-15T10:30:00.000Z",
    "expiresAt": "2024-01-22T10:30:00.000Z"
  }
}
```

### Screenshot Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `url` | string | required | URL to capture |
| `width` | number | 1280 | Viewport width (320-7680) |
| `height` | number | 720 | Viewport height (240-4320) |
| `fullPage` | boolean | false | Capture full page scroll |
| `format` | string | "png" | Output format: png, jpeg, webp, pdf |
| `quality` | number | 80 | Image quality (1-100, jpeg/webp only) |
| `delay` | number | 0 | Wait before capture (ms, 0-30000) |
| `selector` | string | - | CSS selector to capture |
| `headers` | object | - | Custom HTTP headers |
| `cookies` | array | - | Custom cookies to set |
| `userAgent` | string | - | Custom user agent |
| `darkMode` | boolean | false | Enable dark mode |
| `blockAds` | boolean | false | Block advertisements |
| `waitForSelector` | string | - | Wait for element |
| `waitForNavigation` | string | "networkidle2" | Navigation strategy |
| `webhook` | string | - | Webhook URL for async notification |

### List Screenshots

Get all screenshots for the authenticated user.

```http
GET /screenshots?page=1&limit=20&status=completed
Authorization: Bearer <token>
```

**Query Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | number | 1 | Page number |
| `limit` | number | 20 | Items per page (max 100) |
| `status` | string | - | Filter by status |
| `format` | string | - | Filter by format |
| `startDate` | string | - | Filter by date range |
| `endDate` | string | - | Filter by date range |

**Response (200):**

```json
{
  "success": true,
  "data": [
    {
      "id": "507f1f77bcf86cd799439011",
      "url": "https://example.com",
      "result": {
        "status": "completed",
        "url": "https://storage.example.com/screenshots/abc123.png"
      },
      "createdAt": "2024-01-15T10:30:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "pages": 8
  }
}
```

### Get Screenshot

Get a specific screenshot by ID.

```http
GET /screenshots/:id
Authorization: Bearer <token>
```

**Response (200):**

```json
{
  "success": true,
  "data": {
    "id": "507f1f77bcf86cd799439011",
    "url": "https://example.com",
    "options": { ... },
    "result": { ... },
    "metadata": { ... },
    "createdAt": "2024-01-15T10:30:00.000Z"
  }
}
```

### Delete Screenshot

Delete a screenshot.

```http
DELETE /screenshots/:id
Authorization: Bearer <token>
```

**Response (200):**

```json
{
  "success": true,
  "message": "Screenshot deleted successfully"
}
```

### Retry Screenshot

Retry a failed screenshot.

```http
POST /screenshots/:id/retry
Authorization: Bearer <token>
```

**Response (200):**

```json
{
  "success": true,
  "data": {
    "id": "507f1f77bcf86cd799439011",
    "result": {
      "status": "processing"
    }
  }
}
```

### Download Screenshot

Get a redirect to the screenshot file.

```http
GET /screenshots/:id/download
Authorization: Bearer <token>
```

**Response (302):** Redirects to the screenshot URL

---

## Subscription Endpoints

### Get Plans

Get available subscription plans (public endpoint).

```http
GET /subscriptions/plans
```

**Response (200):**

```json
{
  "success": true,
  "data": [
    {
      "id": "free",
      "name": "Free",
      "price": 0,
      "currency": "USD",
      "features": {
        "screenshotsPerMonth": 100,
        "maxWidth": 1280,
        "maxHeight": 720,
        "formats": ["png", "jpeg"],
        "rateLimit": 10,
        "fullPage": false,
        "customHeaders": false,
        "webhooks": false
      }
    },
    {
      "id": "starter",
      "name": "Starter",
      "price": 19,
      "currency": "USD",
      "interval": "month",
      "features": { ... }
    },
    {
      "id": "professional",
      "name": "Professional",
      "price": 49,
      "currency": "USD",
      "interval": "month",
      "features": { ... }
    },
    {
      "id": "enterprise",
      "name": "Enterprise",
      "price": 149,
      "currency": "USD",
      "interval": "month",
      "features": { ... }
    }
  ]
}
```

### Create Checkout Session

Create a Stripe checkout session for subscription.

```http
POST /subscriptions/checkout
Authorization: Bearer <token>
```

**Request Body:**

```json
{
  "plan": "professional",
  "successUrl": "https://myapp.com/success",
  "cancelUrl": "https://myapp.com/cancel"
}
```

**Response (200):**

```json
{
  "success": true,
  "data": {
    "checkoutUrl": "https://checkout.stripe.com/c/pay/cs_test_..."
  }
}
```

### Get Current Subscription

Get the authenticated user's subscription.

```http
GET /subscriptions
Authorization: Bearer <token>
```

**Response (200):**

```json
{
  "success": true,
  "data": {
    "plan": "professional",
    "status": "active",
    "currentPeriodStart": "2024-01-01T00:00:00.000Z",
    "currentPeriodEnd": "2024-02-01T00:00:00.000Z",
    "cancelAtPeriodEnd": false
  }
}
```

### Cancel Subscription

Cancel the current subscription.

```http
DELETE /subscriptions
Authorization: Bearer <token>
```

**Response (200):**

```json
{
  "success": true,
  "message": "Subscription cancelled. Access continues until period end."
}
```

### Get Usage

Get current usage statistics.

```http
GET /subscriptions/usage
Authorization: Bearer <token>
```

**Response (200):**

```json
{
  "success": true,
  "data": {
    "used": 150,
    "limit": 10000,
    "remaining": 9850,
    "percentage": 1.5,
    "resetDate": "2024-02-01T00:00:00.000Z"
  }
}
```

---

## Analytics Endpoints

### Overview

Get dashboard overview statistics.

```http
GET /analytics/overview
Authorization: Bearer <token>
```

**Response (200):**

```json
{
  "success": true,
  "data": {
    "totalScreenshots": 1500,
    "successfulScreenshots": 1475,
    "failedScreenshots": 25,
    "successRate": 98.33,
    "averageResponseTime": 2340,
    "totalBandwidth": 157286400,
    "activeApiKeys": 3,
    "periodStart": "2024-01-01T00:00:00.000Z",
    "periodEnd": "2024-01-31T23:59:59.000Z"
  }
}
```

### Screenshot Statistics

Get detailed screenshot statistics.

```http
GET /analytics/screenshots?startDate=2024-01-01&endDate=2024-01-31
Authorization: Bearer <token>
```

**Response (200):**

```json
{
  "success": true,
  "data": {
    "total": 1500,
    "byStatus": {
      "completed": 1475,
      "failed": 25,
      "pending": 0
    },
    "byFormat": {
      "png": 1200,
      "jpeg": 200,
      "webp": 80,
      "pdf": 20
    },
    "averageDuration": 2340,
    "averageSize": 104857
  }
}
```

### Usage Over Time

Get usage statistics over time.

```http
GET /analytics/usage?period=day&limit=30
Authorization: Bearer <token>
```

**Query Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `period` | string | "day" | Aggregation period: day, week, month |
| `limit` | number | 30 | Number of periods (max 365) |

**Response (200):**

```json
{
  "success": true,
  "data": [
    {
      "date": "2024-01-15",
      "screenshots": 50,
      "successful": 49,
      "failed": 1,
      "bandwidth": 5242880
    },
    {
      "date": "2024-01-14",
      "screenshots": 45,
      "successful": 45,
      "failed": 0,
      "bandwidth": 4718592
    }
  ]
}
```

### Error Breakdown

Get error statistics.

```http
GET /analytics/errors?startDate=2024-01-01&endDate=2024-01-31
Authorization: Bearer <token>
```

**Response (200):**

```json
{
  "success": true,
  "data": {
    "total": 25,
    "byType": {
      "TIMEOUT": 10,
      "NAVIGATION_FAILED": 8,
      "SELECTOR_NOT_FOUND": 5,
      "NETWORK_ERROR": 2
    },
    "byHour": [
      { "hour": 0, "count": 1 },
      { "hour": 1, "count": 0 },
      ...
    ]
  }
}
```

### Popular URLs

Get most captured URLs.

```http
GET /analytics/urls?limit=10
Authorization: Bearer <token>
```

**Response (200):**

```json
{
  "success": true,
  "data": [
    {
      "url": "https://example.com",
      "count": 150,
      "lastCaptured": "2024-01-15T14:30:00.000Z"
    },
    {
      "url": "https://example.org",
      "count": 120,
      "lastCaptured": "2024-01-15T12:00:00.000Z"
    }
  ]
}
```

---

## Webhooks

When a webhook URL is provided, the API will send a POST request upon screenshot completion.

### Webhook Payload

```json
{
  "event": "screenshot.completed",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "data": {
    "id": "507f1f77bcf86cd799439011",
    "url": "https://example.com",
    "status": "completed",
    "result": {
      "url": "https://storage.example.com/screenshots/abc123.png",
      "size": 245678,
      "duration": 2340
    }
  }
}
```

### Webhook Events

| Event | Description |
|-------|-------------|
| `screenshot.completed` | Screenshot capture completed successfully |
| `screenshot.failed` | Screenshot capture failed |

### Webhook Security

Webhooks include a signature header for verification:

```
X-Webhook-Signature: sha256=abc123...
```

Verify by computing HMAC-SHA256 of the request body using your API key as the secret.

---

## SDKs and Code Examples

### cURL

```bash
# Create a screenshot
curl -X POST https://api.screenshot-api.com/api/v1/screenshots \
  -H "X-API-Key: ss_your_api_key" \
  -H "Content-Type: application/json" \
  -d '{"url": "https://example.com", "width": 1920, "height": 1080}'
```

### Node.js

```javascript
const axios = require('axios');

const screenshot = await axios.post(
  'https://api.screenshot-api.com/api/v1/screenshots',
  {
    url: 'https://example.com',
    width: 1920,
    height: 1080,
    format: 'png'
  },
  {
    headers: {
      'X-API-Key': 'ss_your_api_key'
    }
  }
);

console.log(screenshot.data.data.result.url);
```

### Python

```python
import requests

response = requests.post(
    'https://api.screenshot-api.com/api/v1/screenshots',
    json={
        'url': 'https://example.com',
        'width': 1920,
        'height': 1080,
        'format': 'png'
    },
    headers={
        'X-API-Key': 'ss_your_api_key'
    }
)

data = response.json()
print(data['data']['result']['url'])
```

### PHP

```php
<?php
$ch = curl_init();

curl_setopt_array($ch, [
    CURLOPT_URL => 'https://api.screenshot-api.com/api/v1/screenshots',
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_POST => true,
    CURLOPT_POSTFIELDS => json_encode([
        'url' => 'https://example.com',
        'width' => 1920,
        'height' => 1080,
        'format' => 'png'
    ]),
    CURLOPT_HTTPHEADER => [
        'Content-Type: application/json',
        'X-API-Key: ss_your_api_key'
    ]
]);

$response = curl_exec($ch);
$data = json_decode($response, true);

echo $data['data']['result']['url'];
```

---

## Health Check

```http
GET /health
```

**Response (200):**

```json
{
  "success": true,
  "status": "healthy",
  "service": "screenshot-api",
  "version": "v1",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```
