# Rate Limits

This document describes the rate limiting configuration for the Screenshot API.

## Overview

Rate limits are enforced to ensure fair usage and protect the API from abuse. Limits are applied per API key or per IP address for unauthenticated requests.

## Plan-Based Rate Limits

Rate limits vary by subscription plan:

| Plan | Requests/Minute | Screenshots/Month | Max Resolution | Formats |
|------|-----------------|-------------------|----------------|---------|
| **Free** | 10 | 100 | 1280x720 | PNG, JPEG |
| **Starter** | 30 | 2,000 | 1920x1080 | PNG, JPEG, WebP |
| **Professional** | 100 | 10,000 | 3840x2160 | PNG, JPEG, WebP, PDF |
| **Enterprise** | 500 | 50,000 | 7680x4320 | PNG, JPEG, WebP, PDF |

## Endpoint-Specific Limits

Some endpoints have stricter rate limits regardless of plan:

| Endpoint Type | Limit | Window | Description |
|---------------|-------|--------|-------------|
| Authentication | 5 req | 60s | Login, register, password reset |
| Sensitive Operations | 3 req | 60s | Password change, API key creation |
| Default | 100 req | 60s | Most API endpoints |

## Rate Limit Headers

All API responses include rate limit information in the headers:

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1703865600
Retry-After: 60
```

| Header | Description |
|--------|-------------|
| `X-RateLimit-Limit` | Maximum requests allowed in the window |
| `X-RateLimit-Remaining` | Remaining requests in the current window |
| `X-RateLimit-Reset` | Unix timestamp when the window resets |
| `Retry-After` | Seconds to wait before retrying (only on 429) |

## Rate Limit Exceeded Response

When you exceed the rate limit, you'll receive a `429 Too Many Requests` response:

```json
{
  "success": false,
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Too many requests. Please try again later.",
    "retryAfter": 60
  }
}
```

## Monthly Quota

In addition to per-minute rate limits, each plan has a monthly screenshot quota. When exceeded:

```json
{
  "success": false,
  "error": {
    "code": "QUOTA_EXCEEDED",
    "message": "Monthly screenshot quota exceeded. Upgrade your plan for more.",
    "usage": {
      "used": 100,
      "limit": 100,
      "resetDate": "2024-02-01T00:00:00Z"
    }
  }
}
```

## Account Lockout

After 5 failed login attempts, the account is locked for 15 minutes:

```json
{
  "success": false,
  "error": {
    "code": "ACCOUNT_LOCKED",
    "message": "Account locked due to too many failed attempts. Try again in 15 minutes.",
    "lockoutEndsAt": "2024-01-15T12:15:00Z"
  }
}
```

## Adaptive Rate Limiting

The API uses adaptive rate limiting for authentication endpoints:
- IPs with suspicious behavior receive stricter limits
- Repeated failed attempts trigger IP-based restrictions
- Enterprise customers can request custom limits

## Best Practices

1. **Implement exponential backoff** - When rate limited, wait and retry with increasing delays
2. **Cache responses** - Reduce API calls by caching screenshot URLs
3. **Use webhooks** - For async screenshot capture, use webhooks instead of polling
4. **Monitor usage** - Check the Analytics endpoint to track your usage
5. **Upgrade when needed** - If you regularly hit limits, consider upgrading your plan

## Concurrent Request Limits

In addition to rate limits, there are concurrent request limits:

| Plan | Max Concurrent Requests |
|------|------------------------|
| Free | 2 |
| Starter | 5 |
| Professional | 10 |
| Enterprise | 25 |

Requests exceeding concurrent limits receive a `429` response with:

```json
{
  "success": false,
  "error": {
    "code": "CONCURRENT_LIMIT_EXCEEDED",
    "message": "Too many concurrent requests. Please wait for ongoing requests to complete."
  }
}
```

## Redis Failover

If the rate limiting service is temporarily unavailable, the API uses in-memory fallback limiting. This ensures:
- Continued service availability
- Slightly more permissive limits during failover
- Automatic recovery when Redis is restored

## Need Higher Limits?

Contact us for custom enterprise limits:
- Custom rate limits per endpoint
- Dedicated infrastructure
- SLA guarantees
- Priority support

Email: support@screenshot-api.com
