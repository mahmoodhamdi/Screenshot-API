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

## Views Architecture

The `src/views/` directory contains TypeScript template generators for server-rendered HTML pages.

### Landing Page (`src/views/landing/`)

The root route (`/`) serves a professional SaaS landing page:

```
src/views/landing/
├── index.ts              # Main page generator with styles
├── sections/             # Page sections (hero, features, pricing, etc.)
└── components/           # Reusable components (navbar, button, card, icons)
```

### Auth Pages (`src/views/auth/`)

Authentication pages with a split-screen design (branding left, form right):

```
src/views/auth/
├── index.ts              # Main generator with generateAuthPage(page, config)
├── pages/
│   ├── login.ts          # Login with email/password, remember me
│   ├── register.ts       # Registration with password strength indicator
│   ├── forgot-password.ts # Request password reset (2 states)
│   ├── reset-password.ts  # Reset password with token (4 states)
│   └── verify-email.ts    # Email verification (5 states)
└── components/
    ├── auth-layout.ts    # Split-screen layout
    ├── form-input.ts     # Input with icon, validation, password toggle
    ├── form-button.ts    # Primary/secondary buttons with loading state
    └── auth-card.ts      # Glassmorphism card wrapper
```

**Auth Routes:**

| Route | Description |
|-------|-------------|
| `/login` | Sign in form with email/password |
| `/register` | Create account with password strength |
| `/forgot-password` | Request password reset email |
| `/reset-password?token=xxx` | Set new password with token |
| `/verify-email?token=xxx` | Verify email address |

**Features:**
- Client-side form validation with inline errors
- Password strength indicator (weak/medium/strong)
- Multi-state pages with smooth transitions
- Screen reader announcements for accessibility
- Retry mechanism for API calls (exponential backoff)
- Rate limit handling with user feedback

Each page exports: `generateXxxForm()`, `getXxxStyles()`, `getXxxScripts()`

### Dashboard (`src/views/dashboard/`)

User dashboard with full management capabilities:

```
src/views/dashboard/
├── index.ts                  # Main generator with generateDashboardPage(page, config)
├── layouts/
│   └── dashboard-layout.ts   # Sidebar + header + content layout
├── pages/
│   ├── overview.ts           # Stats, recent activity, quick capture
│   ├── screenshots.ts        # Screenshots table with filters & modals
│   ├── screenshot-detail.ts  # Single screenshot view with actions
│   ├── api-keys.ts           # API key management (create, revoke)
│   ├── usage.ts              # Analytics with charts (bar, donut, line)
│   ├── settings.ts           # Profile, security, notifications
│   └── billing.ts            # Subscription plans, invoices
└── components/
    ├── sidebar.ts            # Navigation with plan badge
    ├── header.ts             # Page title, search, user dropdown
    ├── stat-card.ts          # Stat display with change indicator
    ├── data-table.ts         # Sortable table with skeleton loading
    ├── chart.ts              # CSS-based charts (bar, donut, line)
    ├── pagination.ts         # Page navigation
    └── empty-state.ts        # No data placeholder with action
```

**Dashboard Routes:**

| Route | Description |
|-------|-------------|
| `/dashboard` | Overview with stats and quick actions |
| `/dashboard/screenshots` | Screenshots list with table & filters |
| `/dashboard/screenshots/:id` | Screenshot detail with preview |
| `/dashboard/api-keys` | API key management |
| `/dashboard/usage` | Usage analytics with charts |
| `/dashboard/settings` | Account settings |
| `/dashboard/billing` | Subscription & billing |

**Key Features:**
- Collapsible sidebar (280px desktop, overlay on mobile)
- Real-time stats with API integration
- CSS-based charts (no external libraries)
- Skeleton loaders for async data
- Toast notifications for actions
- Modal dialogs for forms
- Error states with retry buttons

**Keyboard Shortcuts:**
- `Ctrl/Cmd + K`: Focus search
- `Ctrl/Cmd + N`: New screenshot (on screenshots page)
- `Escape`: Close modals/sidebar

Each page exports: `generateXxxPage()`, `getXxxStyles()`, `getXxxScripts()`

### Design System

Colors:
- Primary background: `#0a0a0f`
- Accent primary: `#6366f1` (Indigo)
- Accent secondary: `#8b5cf6` (Purple)
- Success: `#10b981`

Typography: Inter (sans), JetBrains Mono (mono)

Features: Dark theme, responsive (375px, 640px, 768px, 1024px breakpoints), accessible, SEO-ready

## Key Implementation Details

- **Input Validation**: Zod schemas validate all request payloads
- **Logging**: Winston logger with structured JSON output
- **Browser Pool**: Puppeteer instances are pooled and reused (`PUPPETEER_MAX_CONCURRENT` controls pool size)
- **Storage Fallback**: If AWS S3 is not configured, screenshots are stored locally in `./uploads`
- **Code Generator**: `src/utils/docs/code-generator.ts` generates code snippets for all supported languages
- **Collection Generator**: `src/utils/docs/collection-generator.ts` generates Postman/Insomnia/Bruno collections
