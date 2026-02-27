# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Screenshot API - A Node.js + TypeScript + Express + Puppeteer service for capturing website screenshots with a hybrid business model (pay-per-use + subscription).

## Common Commands

```bash
# Development
npm run dev              # Start dev server with ts-node-dev
npm run build            # Compile TypeScript to dist/
npm start                # Run production build

# Testing
npm test                 # Run all tests with coverage
npm run test:unit        # Run unit tests only
npm run test:integration # Run integration tests only
npm run test:e2e         # Run end-to-end tests only
npm run test:watch       # Run tests in watch mode

# Run a specific test file
npm test -- auth.service.test.ts

# Run tests matching a pattern
npm test -- --testNamePattern="should register"

# Code Quality
npm run lint             # Check for linting issues
npm run lint:fix         # Auto-fix linting issues
npm run format           # Format code with Prettier
npm run typecheck        # Type check without emitting
```

## Architecture

### Core Services Flow
```
Request → Auth Middleware (API Key validation) → Rate Limiter → Usage Quota Check → Controller → Service → Response
```

### Key Services

| Service | File | Purpose |
|---------|------|---------|
| Screenshot | `src/services/screenshot.service.ts` | Puppeteer-based capture with ad blocking, dark mode |
| Auth | `src/services/auth.service.ts` | JWT + API key management, IP/domain whitelisting |
| Subscription | `src/services/subscription.service.ts` | Stripe integration for payments |
| Storage | `src/services/storage.service.ts` | S3 upload with local fallback |
| Email | `src/services/email.service.ts` | Nodemailer with Bull queue |
| IP Reputation | `src/services/ipReputation.service.ts` | Threat detection, marks IPs suspicious after 3 lockouts |
| Login Attempts | `src/services/loginAttempts.service.ts` | Brute force protection (5 attempts, 15 min lockout) |
| Analytics | `src/services/analytics.service.ts` | Usage stats and aggregation |

### Plan-Based Limits
The system enforces limits based on subscription tier (free/starter/professional/enterprise):
- Screenshot quotas per month
- Resolution limits (720p → 8K)
- Format restrictions (PNG/JPEG/WebP/PDF)
- Rate limits per minute (10 → 500)
- Feature access (webhooks, custom headers, full-page capture)

### Middleware Chain
1. `authenticateApiKey` - Validates X-API-Key header
2. `checkIpWhitelist` - Validates client IP
3. `checkDomainWhitelist` - Validates request origin
4. `apiRateLimiter` - Enforces rate limits per plan
5. `usageQuotaLimiter` - Checks monthly quota
6. `csrfMiddleware` - Double Submit Cookie pattern for state-changing requests
7. `nonceMiddleware` - CSP nonce generation for inline scripts

### Queue System (Bull + Redis)
- **Email Queue** (`src/queues/email.queue.ts`): Async email delivery with retry
- **Webhook Queue** (`src/queues/webhook.queue.ts`): Reliable delivery with exponential backoff + jitter

Webhooks use HMAC-SHA256 signing with per-user secrets. Failed webhooks retry up to 5 times.

## Database Models

| Model | TTL Index | Notes |
|-------|-----------|-------|
| User | - | Account, subscription, webhook secrets |
| ApiKey | - | Permissions, IP/domain whitelists |
| Screenshot | - | Capture records with options/results |
| Usage | 90 days | Daily analytics aggregation |
| WebhookAttempt | 30 days | Delivery tracking with retry state |

## TypeScript Path Aliases

Configured in tsconfig.json:
- `@/*` → `src/*`
- `@config/*`, `@controllers/*`, `@services/*`, `@models/*`
- `@middlewares/*`, `@routes/*`, `@utils/*`, `@types/*`, `@queues/*`

## External Dependencies

- **MongoDB**: Primary database with TTL indexes for auto-cleanup
- **Redis**: Caching, rate limiting, circuit breaker state
- **Puppeteer/Chromium**: Screenshot capture (pooled instances)
- **Stripe**: Payment processing
- **AWS S3**: Screenshot storage (optional, has local fallback to `./uploads`)

## Testing Infrastructure

- Tests use `mongodb-memory-server` for isolated in-memory MongoDB
- Test setup in `tests/setup.ts` auto-clears all collections after each test
- Coverage thresholds: 60% lines/functions/statements, 40% branches
- Test timeout: 30 seconds (important for Puppeteer-based tests)

## Utility Modules

### Security (`src/utils/`)
- **urlValidator.ts**: SSRF protection - blocks internal IPs, localhost, private ranges, dangerous protocols (file://, javascript:, data:)
- **headerSanitizer.ts**: Blocks dangerous headers (Host, Authorization, X-Forwarded-*, etc.)
- **cookieSanitizer.ts**: Validates cookie structure and limits
- **passwordValidator.ts**: zxcvbn-based password strength checking
- **webhookSignature.ts**: HMAC-SHA256 webhook signing and verification

### Resilience (`src/utils/`)
- **circuitBreaker.ts**: Circuit breaker for external services (Redis, S3). States: closed → open → half-open
- **alerts.ts**: Alert/notification utilities for system events

### Performance (`src/utils/`)
- **cache.ts**: Redis caching with `getOrSet()`, `invalidate()`, cache warming, hit/miss metrics
- **pagination.ts**: Cursor-based pagination for large datasets

## Environment Setup

```bash
# Copy and configure environment
cp .env.example .env
# Edit .env with your MongoDB URI, Redis host, JWT secrets, Stripe keys, etc.

# Start dependencies (MongoDB + Redis)
docker-compose up -d mongodb redis

# Or use Docker for everything
docker-compose up -d
```

Key environment variables:
- `MONGODB_URI` - MongoDB connection string
- `REDIS_HOST/REDIS_PORT` - Redis for caching/rate limiting (optional, has in-memory fallback)
- `JWT_SECRET/JWT_REFRESH_SECRET` - Must be 32+ characters
- `STRIPE_SECRET_KEY/STRIPE_WEBHOOK_SECRET` - For payment processing
- `PUPPETEER_MAX_CONCURRENT` - Browser pool size (default: 5)

## Development Reference

### Plans Directory
The `plans/MASTER_PLAN.md` file tracks all development phases (all 21 milestones completed):
- Phase 1: Security (CSRF, JWT fixes, auth hardening, CSP, Redis failsafe)
- Phase 2: Features (password reset, email service, webhook security, input validation)
- Phase 3: Testing (endpoint tests, service tests, E2E tests)
- Phase 4: Performance (DB optimization, caching, Puppeteer tuning, API optimization)
- Phase 5: Polish (logging, documentation, production checklist)

## Views Architecture

The `src/views/` directory contains TypeScript template generators for server-rendered HTML pages.

### Structure
- **Landing** (`src/views/landing/`): Marketing page at `/`
- **Auth** (`src/views/auth/`): Login, register, password reset, email verification
- **Dashboard** (`src/views/dashboard/`): User dashboard with stats, screenshots, API keys, billing

### Page Generator Pattern
Each page exports: `generateXxxForm()` or `generateXxxPage()`, `getXxxStyles()`, `getXxxScripts()`

### Design System
- Colors: Primary `#0a0a0f`, Accent `#6366f1` (Indigo), Secondary `#8b5cf6` (Purple)
- Typography: Inter (sans), JetBrains Mono (mono)
- Breakpoints: 375px, 640px, 768px, 1024px

## Key Implementation Details

- **Input Validation**: Zod schemas in `src/middlewares/validation.middleware.ts`
- **Logging**: Winston with structured JSON output
- **Browser Pool**: Puppeteer instances pooled (`PUPPETEER_MAX_CONCURRENT` controls size)
- **Redis Failsafe**: In-memory fallback when Redis is down, circuit breaker protects services
- **Code Generator**: `src/utils/docs/code-generator.ts` - examples in 10 languages
- **Collection Generator**: `src/utils/docs/collection-generator.ts` - Postman/Insomnia/Bruno

## Documentation Endpoints

| Endpoint | Description |
|----------|-------------|
| `/developer` | Developer Portal with code examples |
| `/docs` | Swagger UI (interactive) |
| `/redoc` | ReDoc (readable) |
| `/docs/openapi.json` | OpenAPI 3.0 spec |
| `/health` | Health check |
