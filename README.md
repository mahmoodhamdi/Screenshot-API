# Screenshot API

[![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)](https://github.com/mahmoodhamdi/Screenshot-API/releases/tag/v1.0.0)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![Node](https://img.shields.io/badge/node-20%2B-brightgreen.svg)](https://nodejs.org)
[![TypeScript](https://img.shields.io/badge/typescript-5.0-blue.svg)](https://www.typescriptlang.org)
[![Tests](https://img.shields.io/badge/tests-995%2B%20passed-success.svg)](tests/)

Professional screenshot capture API powered by Puppeteer. Capture high-quality screenshots of any website with customizable options, subscription management, and comprehensive analytics.

## What's New in v1.0.0

- **Security Hardened**: CSRF protection, nonce-based CSP, account lockout, IP reputation tracking
- **Redis Circuit Breaker**: Graceful fallback when Redis is unavailable
- **Webhook Signatures**: HMAC-SHA256 signed webhook payloads
- **Email Notifications**: Welcome emails, password reset, payment notifications
- **Performance Optimized**: Database indexes, response caching, browser pool optimization
- **Production Ready**: Environment validation, health probes, CI/CD pipelines, operations runbook

## Features

### Screenshot Capture
- **High-Quality Screenshots**: Capture websites at any resolution up to 8K
- **Multiple Formats**: PNG, JPEG, WebP, and PDF output
- **Full-Page Capture**: Capture entire scrollable pages
- **Custom Viewport**: Any width/height configuration
- **Dark Mode**: Automatic dark mode detection and forcing
- **Ad Blocking**: Optional advertisement and tracker blocking
- **Custom Headers/Cookies**: Set authentication and session data
- **Element Selection**: Capture specific page elements via CSS selectors
- **Block Resources**: Optionally block images, fonts, media for faster captures

### Authentication & Security
- **JWT Authentication**: Access and refresh token flow
- **API Keys**: Scoped permissions with IP/domain whitelisting
- **CSRF Protection**: Double Submit Cookie pattern
- **Rate Limiting**: Redis-based distributed rate limiting with in-memory fallback
- **Account Lockout**: Automatic lockout after failed login attempts
- **IP Reputation**: Track and block suspicious IPs
- **Input Validation**: SSRF, XSS, and injection protection

### Subscriptions & Billing
- **Stripe Integration**: Secure payment processing
- **4 Subscription Plans**: Free, Starter, Professional, Enterprise
- **Usage Tracking**: Real-time quota monitoring
- **Customer Portal**: Self-service subscription management

### Webhooks
- **Async Notifications**: Screenshot completion, subscription changes
- **HMAC-SHA256 Signatures**: Verify webhook authenticity
- **Automatic Retries**: Exponential backoff with jitter
- **Delivery Tracking**: Monitor webhook attempts and failures

### Analytics
- **Usage Statistics**: Screenshots, bandwidth, response times
- **Error Tracking**: Breakdown by error type
- **Popular URLs**: Most captured domains
- **Per-API Key Analytics**: Track usage by key

### Developer Experience
- **OpenAPI 3.0 Spec**: Complete API documentation
- **Interactive Docs**: Swagger UI and ReDoc
- **Code Examples**: 10 languages (Node.js, Python, PHP, Go, Ruby, Java, C#, cURL, HTTPie, Fetch)
- **API Collections**: Postman, Insomnia, Bruno exports
- **Developer Portal**: `/developer` endpoint with guides and SDKs

## Tech Stack

| Category | Technology |
|----------|------------|
| Runtime | Node.js 20+ |
| Language | TypeScript 5.0 (strict mode) |
| Framework | Express.js |
| Database | MongoDB 7+ with Mongoose |
| Cache | Redis 7+ with ioredis |
| Browser | Puppeteer (Chromium) |
| Payments | Stripe |
| Queue | Bull (Redis-backed) |
| Email | Nodemailer |
| Validation | Zod |
| Testing | Jest + Supertest |
| Logging | Winston |

## Quick Start

### Prerequisites

- Node.js 20+
- MongoDB 7+
- Redis 7+ (optional, has in-memory fallback)
- Chrome/Chromium (for Puppeteer)

### Installation

```bash
# Clone the repository
git clone https://github.com/mahmoodhamdi/Screenshot-API.git
cd Screenshot-API

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env with your configuration

# Start development server
npm run dev
```

The API will be available at `http://localhost:3000`.

### Running with Docker

```bash
# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f api

# Stop services
docker-compose down
```

## Configuration

Create a `.env` file based on `.env.example`:

```env
# Server
NODE_ENV=development
PORT=3000

# Database
MONGODB_URI=mongodb://localhost:27017/screenshot-api

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# JWT (minimum 32 characters)
JWT_SECRET=your-super-secret-jwt-key-min-32-chars
JWT_REFRESH_SECRET=your-refresh-secret-key-min-32-chars

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Email (optional)
EMAIL_HOST=smtp.example.com
EMAIL_USER=noreply@example.com
EMAIL_PASSWORD=your-email-password

# Storage (optional, defaults to local)
STORAGE_TYPE=s3
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_S3_BUCKET=your-bucket-name
```

See [.env.example](.env.example) for all available options.

## API Documentation

### Documentation Endpoints

| Endpoint | Description |
|----------|-------------|
| `/developer` | Developer Portal with guides and SDKs |
| `/api-docs` | Documentation landing page |
| `/docs` | Swagger UI (interactive) |
| `/redoc` | ReDoc (readable) |
| `/docs/openapi.json` | OpenAPI 3.0 JSON spec |
| `/docs/postman.json` | Postman Collection |
| `/docs/insomnia.json` | Insomnia Export |

### Quick Example

**Create a screenshot:**

```bash
curl -X POST http://localhost:3000/api/v1/screenshots \
  -H "X-API-Key: your_api_key" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://example.com",
    "width": 1920,
    "height": 1080,
    "format": "png",
    "fullPage": false,
    "darkMode": true
  }'
```

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "507f1f77bcf86cd799439011",
    "url": "https://example.com",
    "result": {
      "status": "completed",
      "url": "https://storage.example.com/screenshots/abc123.png",
      "size": 245678,
      "duration": 2340
    }
  }
}
```

### API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| **Auth** | | |
| POST | `/api/v1/auth/register` | Register new user |
| POST | `/api/v1/auth/login` | Login user |
| POST | `/api/v1/auth/logout` | Logout user |
| GET | `/api/v1/auth/me` | Get current user |
| POST | `/api/v1/auth/refresh` | Refresh access token |
| POST | `/api/v1/auth/forgot-password` | Request password reset |
| POST | `/api/v1/auth/reset-password` | Reset password with token |
| POST | `/api/v1/auth/api-keys` | Create API key |
| GET | `/api/v1/auth/api-keys` | List API keys |
| DELETE | `/api/v1/auth/api-keys/:id` | Revoke API key |
| **Screenshots** | | |
| POST | `/api/v1/screenshots` | Create screenshot |
| GET | `/api/v1/screenshots` | List screenshots |
| GET | `/api/v1/screenshots/:id` | Get screenshot |
| DELETE | `/api/v1/screenshots/:id` | Delete screenshot |
| POST | `/api/v1/screenshots/:id/retry` | Retry failed screenshot |
| POST | `/api/v1/screenshots/:id/refresh-url` | Refresh signed URL |
| **Subscriptions** | | |
| GET | `/api/v1/subscriptions/plans` | Get available plans |
| GET | `/api/v1/subscriptions` | Get current subscription |
| POST | `/api/v1/subscriptions/checkout` | Create checkout session |
| POST | `/api/v1/subscriptions/portal` | Create customer portal |
| GET | `/api/v1/subscriptions/usage` | Get usage statistics |
| **Analytics** | | |
| GET | `/api/v1/analytics/overview` | Get overview stats |
| GET | `/api/v1/analytics/screenshots` | Screenshot statistics |
| GET | `/api/v1/analytics/usage` | Usage over time |
| GET | `/api/v1/analytics/errors` | Error breakdown |
| GET | `/api/v1/analytics/urls` | Popular URLs |
| **Health** | | |
| GET | `/health` | Comprehensive health check |
| GET | `/health/live` | Kubernetes liveness probe |
| GET | `/health/ready` | Kubernetes readiness probe |

## Authentication

### JWT Bearer Token

```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

Obtain tokens via `/auth/register` or `/auth/login`.

### API Key

```http
X-API-Key: ss_your_api_key_here
```

Create API keys from the dashboard or via `/auth/api-keys`.

## Subscription Plans

| Plan | Price | Screenshots/Month | Rate Limit | Max Resolution |
|------|-------|-------------------|------------|----------------|
| Free | $0 | 100 | 10/min | 1280x720 |
| Starter | $19/mo | 2,000 | 30/min | 1920x1080 |
| Professional | $49/mo | 10,000 | 100/min | 4K |
| Enterprise | $149/mo | 50,000 | 500/min | 8K |

### Feature Comparison

| Feature | Free | Starter | Professional | Enterprise |
|---------|:----:|:-------:|:------------:|:----------:|
| PNG/JPEG | ✓ | ✓ | ✓ | ✓ |
| WebP | - | ✓ | ✓ | ✓ |
| PDF | - | - | ✓ | ✓ |
| Full Page | - | ✓ | ✓ | ✓ |
| Dark Mode | ✓ | ✓ | ✓ | ✓ |
| Ad Blocking | - | ✓ | ✓ | ✓ |
| Custom Headers | - | - | ✓ | ✓ |
| Webhooks | - | - | ✓ | ✓ |
| Priority Support | - | - | ✓ | ✓ |

## Security Features

| Feature | Description |
|---------|-------------|
| **CSRF Protection** | Double Submit Cookie pattern for state-changing requests |
| **CSP Headers** | Nonce-based Content Security Policy |
| **Rate Limiting** | Redis-based with circuit breaker and in-memory fallback |
| **Account Lockout** | 5 failed attempts = 15 minute lockout |
| **IP Reputation** | Tracks suspicious IPs across lockouts |
| **Input Validation** | Zod schemas for all inputs |
| **SSRF Protection** | Blocks internal IPs, localhost, private ranges |
| **Header Sanitization** | Blocks dangerous headers in screenshot requests |
| **Webhook Signatures** | HMAC-SHA256 signed payloads |
| **Password Strength** | zxcvbn-based entropy checking |

## Development

### Available Scripts

```bash
npm run dev          # Development server with hot reload
npm run build        # Build for production
npm start            # Start production server
npm test             # Run all tests with coverage
npm run test:unit    # Run unit tests only
npm run test:integration  # Run integration tests
npm run test:e2e     # Run end-to-end tests
npm run lint         # Check for linting issues
npm run lint:fix     # Auto-fix linting issues
npm run format       # Format code with Prettier
npm run typecheck    # Type check without emitting
```

### Project Structure

```
screenshot-api/
├── src/
│   ├── config/          # Configuration (database, redis, puppeteer)
│   ├── controllers/     # Request handlers
│   ├── middlewares/     # Express middlewares (auth, rate limit, csrf)
│   ├── models/          # Mongoose models
│   ├── queues/          # Bull queues (email, webhook)
│   ├── routes/          # API routes
│   ├── services/        # Business logic
│   ├── types/           # TypeScript types
│   ├── utils/           # Utilities (validation, security, logging)
│   ├── views/           # Page templates (landing, auth, dashboard)
│   ├── app.ts           # Express app
│   └── server.ts        # Server entry point
├── tests/
│   ├── unit/            # Unit tests (995+ tests)
│   ├── integration/     # Integration tests
│   └── e2e/             # End-to-end tests
├── docs/                # Documentation
│   ├── RATE_LIMITS.md   # Rate limiting documentation
│   ├── WEBHOOKS.md      # Webhook integration guide
│   ├── CHANGELOG.md     # API changelog
│   └── RUNBOOK.md       # Operations runbook
├── .github/workflows/   # CI/CD pipelines
├── docker-compose.yml   # Docker services
├── Dockerfile           # Production Docker build
└── README.md
```

### Testing

```bash
# Run all tests with coverage
npm test

# Run specific test file
npm test -- auth.service.test.ts

# Run tests matching pattern
npm test -- --testNamePattern="should register"

# Watch mode
npm run test:watch
```

**Test Coverage:**
- 995+ unit tests
- Integration tests for all endpoints
- E2E tests for complete user flows

## Deployment

### Docker Deployment

```bash
# Build production image
docker build -t screenshot-api .

# Run with Docker Compose
docker-compose -f docker-compose.prod.yml up -d
```

### Kubernetes

Health check endpoints for K8s probes:

```yaml
livenessProbe:
  httpGet:
    path: /health/live
    port: 3000
readinessProbe:
  httpGet:
    path: /health/ready
    port: 3000
startupProbe:
  httpGet:
    path: /health/startup
    port: 3000
```

### Environment Validation

The API validates all required environment variables on startup:

```bash
# Production mode enforces strict validation
NODE_ENV=production npm start
```

See [docs/RUNBOOK.md](docs/RUNBOOK.md) for operational procedures.

## Monitoring

### Structured Logging

```json
{
  "level": "info",
  "message": "Screenshot created",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "requestId": "req_abc123",
  "userId": "user_xyz",
  "duration": 2340
}
```

### Health Check Response

```json
{
  "status": "healthy",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "uptime": 86400,
  "version": "1.0.0",
  "services": {
    "mongodb": { "status": "up", "latency": 5 },
    "redis": { "status": "up", "latency": 2 }
  }
}
```

## Documentation

| Document | Description |
|----------|-------------|
| [Rate Limits](docs/RATE_LIMITS.md) | Rate limiting per plan |
| [Webhooks](docs/WEBHOOKS.md) | Webhook integration guide |
| [Changelog](docs/CHANGELOG.md) | API version history |
| [Runbook](docs/RUNBOOK.md) | Operations procedures |

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

- **Documentation**: [docs/](docs/)
- **Issues**: [GitHub Issues](https://github.com/mahmoodhamdi/Screenshot-API/issues)
- **Email**: hmdy7486@gmail.com

## Author

**Mahmood Hamdi**

- GitHub: [@mahmoodhamdi](https://github.com/mahmoodhamdi)
- Email: hmdy7486@gmail.com
