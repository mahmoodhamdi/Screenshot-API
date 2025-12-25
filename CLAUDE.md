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
GET    /api/v1/auth/me              # Get current user (requires JWT)
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
- Test setup in `tests/setup.ts` auto-clears all collections after each test
- Global setup/teardown in `tests/globalSetup.ts` and `tests/globalTeardown.ts`
- Coverage thresholds: 60% lines/functions/statements, 40% branches
- Test timeout: 30 seconds (important for Puppeteer-based tests)

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

### Documentation Endpoints

| Endpoint | Description |
|----------|-------------|
| `/developer` | Developer Portal with code examples & SDKs |
| `/api-docs` | Documentation landing page |
| `/docs` | Swagger UI (interactive) |
| `/redoc` | ReDoc (readable) |
| `/docs/openapi.json` | OpenAPI 3.0 JSON spec |
| `/docs/openapi.yaml` | OpenAPI 3.0 YAML spec |
| `/docs/postman.json` | Postman Collection v2.1 |
| `/docs/insomnia.json` | Insomnia Export v4 |
| `/docs/bruno.json` | Bruno Collection |

### Developer Portal Features

The `/developer` endpoint provides:
- Quick Start Guide with step-by-step instructions
- Code examples in 10 languages: Node.js, Python, PHP, cURL, Ruby, Go, Java, C#, Fetch API, HTTPie
- SDK installation commands
- Downloadable API collections for Postman, Insomnia, and Bruno
- Syntax highlighted code with copy-to-clipboard functionality

## Landing Page

The root route (`/`) serves a professional SaaS landing page built with TypeScript template generators.

### Landing Page Structure

```
src/views/landing/
├── index.ts              # Main page generator with styles
├── sections/
│   ├── hero.ts           # Hero section with CTA
│   ├── features.ts       # Feature cards and detailed features
│   ├── code-demo.ts      # Interactive code examples
│   ├── pricing.ts        # Pricing plans with toggle
│   ├── testimonials.ts   # Stats, reviews, company logos
│   ├── cta.ts            # Call-to-action section
│   └── footer.ts         # Footer with newsletter
└── components/
    ├── navbar.ts         # Responsive navigation
    ├── button.ts         # Button component
    ├── card.ts           # Card component
    └── icons.ts          # SVG icon library
```

### Key Features

- **Dark Theme**: Professional indigo/purple gradient design
- **Responsive**: Mobile-first with breakpoints at 375px, 640px, 768px, 1024px
- **Touch Optimized**: 44px minimum touch targets, swipe gestures
- **Accessible**: Skip links, ARIA labels, keyboard navigation, focus states
- **SEO Ready**: Meta tags, Open Graph, Twitter Cards, JSON-LD structured data
- **Animations**: Scroll reveals, hover effects, respects prefers-reduced-motion
- **Performance**: Preconnect hints, lazy loading, optimized CSS

### Design System

Colors:
- Primary background: `#0a0a0f`
- Accent primary: `#6366f1` (Indigo)
- Accent secondary: `#8b5cf6` (Purple)
- Success: `#10b981`

Typography:
- Sans: Inter
- Mono: JetBrains Mono

## Key Implementation Details

- **Input Validation**: Zod schemas validate all request payloads
- **Logging**: Winston logger with structured JSON output
- **Browser Pool**: Puppeteer instances are pooled and reused (`PUPPETEER_MAX_CONCURRENT` controls pool size)
- **Storage Fallback**: If AWS S3 is not configured, screenshots are stored locally in `./uploads`
- **Code Generator**: `src/utils/docs/code-generator.ts` generates code snippets for all supported languages
- **Collection Generator**: `src/utils/docs/collection-generator.ts` generates Postman/Insomnia/Bruno collections
- **Landing Page**: `src/views/landing/index.ts` generates the marketing landing page
