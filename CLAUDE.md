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

### Key Components

- **Screenshot Service** (`src/services/screenshot.service.ts`): Core Puppeteer-based capture logic with ad blocking, dark mode, and metadata extraction
- **Auth Service** (`src/services/auth.service.ts`): JWT + API key management with IP/domain whitelisting
- **Subscription Service** (`src/services/subscription.service.ts`): Stripe integration for payments and plan management
- **Storage Service** (`src/services/storage.service.ts`): S3 upload with local fallback

### Plan-Based Limits
The system enforces limits based on subscription tier (free/starter/professional/enterprise):
- Screenshot quotas per month
- Resolution limits
- Format restrictions (PNG/JPEG/WebP/PDF)
- Rate limits per minute
- Feature access (webhooks, custom headers, full-page capture)

### Middleware Chain
1. `authenticateApiKey` - Validates X-API-Key header
2. `checkIpWhitelist` - Validates client IP
3. `checkDomainWhitelist` - Validates request origin
4. `apiRateLimiter` - Enforces rate limits per plan
5. `usageQuotaLimiter` - Checks monthly quota

## Database Models

- **User**: Account with subscription info and usage tracking
- **ApiKey**: Keys with permissions, IP/domain whitelists, rate limits
- **Screenshot**: Capture records with options, results, and metadata
- **Usage**: Daily analytics aggregation per user/key

## API Endpoints

```
# Authentication
POST   /api/v1/auth/register
POST   /api/v1/auth/login
POST   /api/v1/auth/api-keys
GET    /api/v1/auth/api-keys
DELETE /api/v1/auth/api-keys/:id

# Screenshots
POST   /api/v1/screenshots        # Capture a screenshot
GET    /api/v1/screenshots        # List user's screenshots
GET    /api/v1/screenshots/:id    # Get screenshot by ID
DELETE /api/v1/screenshots/:id    # Delete screenshot

# Subscriptions
POST   /api/v1/subscriptions/checkout
POST   /api/v1/subscriptions/portal
POST   /api/v1/subscriptions/webhook
GET    /api/v1/subscriptions/usage

# Analytics
GET    /api/v1/analytics/overview
GET    /api/v1/analytics/screenshots
GET    /api/v1/analytics/usage
```

## TypeScript Path Aliases

Configured in tsconfig.json:
- `@/*` → `src/*`
- `@config/*` → `src/config/*`
- `@controllers/*` → `src/controllers/*`
- `@services/*` → `src/services/*`
- `@models/*` → `src/models/*`
- `@middlewares/*` → `src/middlewares/*`
- `@routes/*` → `src/routes/*`
- `@utils/*` → `src/utils/*`
- `@types/*` → `src/types/*`

## External Dependencies

- **MongoDB**: Primary database
- **Redis**: Caching and rate limiting
- **Puppeteer/Chromium**: Screenshot capture
- **Stripe**: Payment processing
- **AWS S3**: Screenshot storage (optional, has local fallback)

## Docker

```bash
docker-compose up        # Start API with MongoDB and Redis
docker-compose up -d     # Start in detached mode
```

## Testing Infrastructure

- Tests use `mongodb-memory-server` for an isolated in-memory MongoDB instance
- Test setup in `tests/setup.ts` auto-clears collections between tests
- Global setup/teardown in `tests/globalSetup.ts` and `tests/globalTeardown.ts`
- Coverage thresholds: 60% lines/functions/statements, 40% branches

## Environment Variables

Copy `.env.example` to `.env` and configure:
- Database connections (MongoDB, Redis)
- JWT secrets
- Stripe API keys
- AWS credentials (optional)
- Rate limiting defaults

## Health & Documentation

- Health check: `GET /health`
- API info: `GET /api/v1`
- Swagger docs: `http://localhost:3000/docs`
