# API Changelog

All notable changes to the Screenshot API are documented here.

## v1.1.0 (2024-12-30)

### Added

- **Webhook Signature Verification** - All webhooks are now signed with HMAC-SHA256
  - `X-Webhook-Timestamp` header with Unix timestamp
  - `X-Webhook-Signature` header with `v1=<signature>` format
  - Endpoint: `GET /webhooks/secret` to retrieve your signing secret
  - Endpoint: `POST /webhooks/secret/regenerate` to regenerate secret

- **Password Reset Flow**
  - `POST /auth/forgot-password` - Request password reset email
  - `GET /auth/validate-reset-token` - Validate reset token before showing form
  - `POST /auth/reset-password` - Reset password with token
  - Tokens expire after 1 hour
  - Tokens are invalidated after use

- **Password Strength Checking**
  - `POST /auth/check-password-strength` - Get password strength analysis
  - Powered by zxcvbn for accurate crack time estimates
  - Returns score (0-4), label, and improvement suggestions

- **Email Verification**
  - `POST /auth/verify-email` - Verify email with token
  - Welcome email sent on registration
  - Verification reminder emails

- **Account Lockout Protection**
  - Account locks after 5 failed login attempts
  - 15-minute lockout period
  - Adaptive rate limiting for suspicious IPs
  - IP reputation tracking

- **CSRF Protection**
  - Double Submit Cookie pattern for browser forms
  - All state-changing endpoints protected
  - Token included in authentication response

- **Webhook History & Management**
  - `GET /webhooks` - List webhook delivery attempts
  - `GET /webhooks/:id` - Get webhook attempt details
  - `POST /webhooks/:id/retry` - Retry failed webhook

- **Request Correlation IDs**
  - All requests now include `X-Request-ID` header
  - Propagated through logs for debugging
  - Can be passed in request for tracing

- **Structured Audit Logging**
  - Security-sensitive operations logged
  - Login attempts, password changes, API key management
  - Searchable structured format

- **API Optimization Features**
  - ETag support for caching (`If-None-Match` header)
  - `X-Response-Time` header on all responses
  - Field selection with `fields` query parameter

### Changed

- **Rate Limits Now Plan-Based**
  - Free: 10 req/min, 100 screenshots/month
  - Starter: 30 req/min, 2,000 screenshots/month
  - Professional: 100 req/min, 10,000 screenshots/month
  - Enterprise: 500 req/min, 50,000 screenshots/month

- **Webhook URLs Must Use HTTPS** (production)
  - HTTP webhooks only allowed in development
  - Prevents credential exposure

- **Improved Error Responses**
  - Consistent error format across all endpoints
  - Error fingerprinting for grouping
  - Detailed validation error messages

- **Enhanced CSP Headers**
  - Nonce-based script execution
  - Separate policies for API vs documentation routes
  - Removed `unsafe-inline` and `unsafe-eval`

### Fixed

- **JWT Middleware Race Condition** - Resolved async flow issue in authentication
- **Redis Failure Handling** - Circuit breaker with in-memory fallback
- **Analytics Aggregation** - Fixed `$result.status` query in pipelines
- **Concurrent Request Limiting** - Moved from in-memory to Redis for distributed deployments

### Security

- HMAC-SHA256 webhook signatures prevent request forgery
- Password strength validation prevents weak passwords
- Account lockout prevents brute force attacks
- IP reputation tracking identifies suspicious activity
- CSRF tokens prevent cross-site request forgery

---

## v1.0.0 (2024-12-01)

### Initial Release

- Screenshot capture with Puppeteer
- Multiple output formats (PNG, JPEG, WebP, PDF)
- Customizable viewport and options
- JWT and API key authentication
- Subscription management with Stripe
- Usage analytics and statistics
- Storage with S3 and local fallback
- Interactive API documentation

---

## Migration Guide

### Upgrading to v1.1.0

#### Webhook Signature Verification

If you're using webhooks, you must now verify signatures:

1. Retrieve your webhook secret:
   ```bash
   curl -X GET /api/v1/webhooks/secret \
     -H "Authorization: Bearer YOUR_TOKEN"
   ```

2. Update your webhook handler to verify signatures (see [Webhooks documentation](./WEBHOOKS.md))

#### Rate Limit Changes

Rate limits are now enforced per plan. Check the [Rate Limits documentation](./RATE_LIMITS.md) for your plan's limits.

#### HTTPS Webhooks Required

In production, webhook URLs must use HTTPS. Update any HTTP webhook URLs to HTTPS before deploying.

---

## Deprecation Notices

None at this time.

---

## Upcoming Changes

### v1.2.0 (Planned)

- Batch screenshot capture
- Screenshot scheduling
- Custom browser profiles
- Geographic screenshot locations
