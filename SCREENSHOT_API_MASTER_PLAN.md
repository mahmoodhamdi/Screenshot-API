# 📸 Screenshot API - Master Development Plan

## 🎯 Project Overview

**Project Name:** Screenshot API  
**Repository:** `mahmoodhamdi/Screenshot-API`  
**Tech Stack:** Node.js + TypeScript + Express + Puppeteer  
**Business Model:** Hybrid (Pay-per-use + Subscription)  

---

## 💰 Pricing Strategy

### Free Tier

- 100 screenshots/month
- Max resolution: 1280x720
- Basic formats: PNG, JPEG
- Rate limit: 10 requests/minute
- No API support

### Starter Plan - $19/month

- 2,000 screenshots/month
- Max resolution: 1920x1080
- All formats: PNG, JPEG, WebP
- Rate limit: 30 requests/minute
- Email support
- Basic analytics

### Professional Plan - $49/month

- 10,000 screenshots/month
- Max resolution: 4K (3840x2160)
- All formats + PDF generation
- Rate limit: 100 requests/minute
- Priority support
- Advanced analytics
- Custom headers & cookies
- Webhook notifications

### Enterprise Plan - $149/month

- 50,000 screenshots/month
- Unlimited resolution
- All features
- Rate limit: 500 requests/minute
- Dedicated support
- Custom SLA
- White-label option
- Priority queue

### Pay-As-You-Go

- $0.005 per screenshot (after free tier)
- $0.01 per PDF
- $0.02 per full-page screenshot
- Volume discounts available

---

## 📁 Project Structure

```
screenshot-api/
├── src/
│   ├── config/
│   │   ├── index.ts
│   │   ├── database.ts
│   │   ├── redis.ts
│   │   └── puppeteer.ts
│   ├── controllers/
│   │   ├── screenshot.controller.ts
│   │   ├── auth.controller.ts
│   │   ├── user.controller.ts
│   │   └── subscription.controller.ts
│   ├── services/
│   │   ├── screenshot.service.ts
│   │   ├── auth.service.ts
│   │   ├── subscription.service.ts
│   │   ├── storage.service.ts
│   │   └── analytics.service.ts
│   ├── models/
│   │   ├── user.model.ts
│   │   ├── apiKey.model.ts
│   │   ├── screenshot.model.ts
│   │   └── usage.model.ts
│   ├── middlewares/
│   │   ├── auth.middleware.ts
│   │   ├── rateLimit.middleware.ts
│   │   ├── validation.middleware.ts
│   │   └── error.middleware.ts
│   ├── routes/
│   │   ├── index.ts
│   │   ├── screenshot.routes.ts
│   │   ├── auth.routes.ts
│   │   └── subscription.routes.ts
│   ├── utils/
│   │   ├── logger.ts
│   │   ├── helpers.ts
│   │   ├── validators.ts
│   │   └── constants.ts
│   ├── types/
│   │   └── index.ts
│   ├── app.ts
│   └── server.ts
├── tests/
│   ├── unit/
│   ├── integration/
│   └── e2e/
├── docs/
│   └── API.md
├── .env.example
├── .gitignore
├── jest.config.js
├── tsconfig.json
├── package.json
├── Dockerfile
├── docker-compose.yml
└── README.md
```

---

## 📋 Development Phases Summary

| Phase | Description | Duration | Priority |
|-------|-------------|----------|----------|
| 1 | Project Setup & Configuration | 1-2 hours | Critical |
| 2 | Database Models & Core Infrastructure | 2-3 hours | Critical |
| 3 | Authentication & Authorization | 2-3 hours | Critical |
| 4 | Screenshot Service (Core Feature) | 3-4 hours | Critical |
| 5 | Subscription & Payment (Stripe) | 2-3 hours | High |
| 6 | Analytics & Usage Tracking | 1-2 hours | Medium |
| 7 | Testing (Unit, Integration, E2E) | 3-4 hours | Critical |
| 8 | Documentation & API Docs | 1-2 hours | High |
| 9 | Docker & Deployment Setup | 1-2 hours | High |
| 10 | Final Review & Launch | 1 hour | Critical |

**Total Estimated Time:** 18-26 hours

---

## 🔧 Phase 1: Project Setup & Configuration

### 1.1 Initialize Project

```bash
mkdir screenshot-api && cd screenshot-api
npm init -y
```

### 1.2 Install Dependencies

```bash
# Production dependencies
npm install express puppeteer mongoose redis ioredis bull bcryptjs jsonwebtoken uuid helmet cors morgan winston express-rate-limit express-validator dotenv aws-sdk stripe nodemailer zod compression express-async-errors

# Dev dependencies
npm install -D typescript ts-node-dev @types/express @types/node @types/bcryptjs @types/jsonwebtoken @types/uuid @types/cors @types/morgan @types/compression @types/jest @types/supertest jest ts-jest supertest eslint @typescript-eslint/eslint-plugin @typescript-eslint/parser prettier mongodb-memory-server
```

### 1.3 TypeScript Configuration (tsconfig.json)

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "commonjs",
    "lib": ["ES2022"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "declaration": true,
    "sourceMap": true,
    "moduleResolution": "node",
    "baseUrl": "./src",
    "paths": {
      "@/*": ["./*"],
      "@config/*": ["config/*"],
      "@controllers/*": ["controllers/*"],
      "@services/*": ["services/*"],
      "@models/*": ["models/*"],
      "@middlewares/*": ["middlewares/*"],
      "@routes/*": ["routes/*"],
      "@utils/*": ["utils/*"]
    }
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "tests"]
}
```

### 1.4 Package.json Scripts

```json
{
  "scripts": {
    "dev": "ts-node-dev --respawn src/server.ts",
    "build": "tsc",
    "start": "node dist/server.js",
    "test": "jest --coverage --detectOpenHandles",
    "test:unit": "jest --testPathPattern=tests/unit",
    "test:integration": "jest --testPathPattern=tests/integration",
    "test:e2e": "jest --testPathPattern=tests/e2e",
    "test:watch": "jest --watch",
    "lint": "eslint src/**/*.ts",
    "lint:fix": "eslint src/**/*.ts --fix"
  }
}
```

### 1.5 Environment Variables (.env.example)

```env
# Server
NODE_ENV=development
PORT=3000
API_VERSION=v1

# Database
MONGODB_URI=mongodb://localhost:27017/screenshot-api

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# JWT
JWT_SECRET=your-super-secret-jwt-key-min-32-chars
JWT_EXPIRES_IN=7d

# API Keys
API_KEY_PREFIX=ss_

# Puppeteer
PUPPETEER_HEADLESS=true
PUPPETEER_TIMEOUT=30000

# AWS S3 (for storage)
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_REGION=us-east-1
AWS_S3_BUCKET=screenshot-api-storage

# Stripe
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=

# Rate Limiting
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX_REQUESTS=100
```

---

## 🗄️ Phase 2: Database Models & Core Infrastructure

### 2.1 User Model

```typescript
// src/models/user.model.ts
interface IUser {
  email: string;
  password: string;
  name: string;
  company?: string;
  isVerified: boolean;
  isActive: boolean;
  role: 'user' | 'admin';
  subscription: {
    plan: 'free' | 'starter' | 'professional' | 'enterprise';
    status: 'active' | 'cancelled' | 'expired';
    stripeCustomerId?: string;
    stripeSubscriptionId?: string;
    currentPeriodEnd?: Date;
  };
  usage: {
    screenshotsThisMonth: number;
    lastResetDate: Date;
  };
  createdAt: Date;
  updatedAt: Date;
}
```

### 2.2 API Key Model

```typescript
// src/models/apiKey.model.ts
interface IApiKey {
  key: string;
  name: string;
  user: ObjectId;
  permissions: string[];
  isActive: boolean;
  lastUsedAt?: Date;
  expiresAt?: Date;
  ipWhitelist: string[];
  domainWhitelist: string[];
  rateLimit?: number;
}
```

### 2.3 Screenshot Model

```typescript
// src/models/screenshot.model.ts
interface IScreenshot {
  user: ObjectId;
  apiKey: ObjectId;
  url: string;
  options: {
    width: number;
    height: number;
    fullPage: boolean;
    format: 'png' | 'jpeg' | 'webp' | 'pdf';
    quality: number;
    delay: number;
    selector?: string;
    headers?: Record<string, string>;
    cookies?: Array<{ name: string; value: string; domain?: string }>;
    userAgent?: string;
    darkMode?: boolean;
    blockAds?: boolean;
  };
  result: {
    status: 'pending' | 'processing' | 'completed' | 'failed';
    url?: string;
    size?: number;
    duration?: number;
    error?: string;
  };
  metadata: {
    pageTitle?: string;
    pageDescription?: string;
    faviconUrl?: string;
  };
  webhook?: {
    url: string;
    sentAt?: Date;
    status?: number;
  };
  expiresAt: Date;
}
```

### 2.4 Usage Model

```typescript
// src/models/usage.model.ts
interface IUsage {
  user: ObjectId;
  apiKey: ObjectId;
  date: Date;
  screenshots: {
    total: number;
    successful: number;
    failed: number;
  };
  bandwidth: number;
  responseTime: {
    avg: number;
    min: number;
    max: number;
  };
}
```

### 2.5 Plan Limits Configuration

```typescript
// src/config/index.ts
export const planLimits = {
  free: {
    screenshotsPerMonth: 100,
    maxWidth: 1280,
    maxHeight: 720,
    formats: ['png', 'jpeg'],
    rateLimit: 10,
    fullPage: false,
    customHeaders: false,
    webhooks: false,
  },
  starter: {
    screenshotsPerMonth: 2000,
    maxWidth: 1920,
    maxHeight: 1080,
    formats: ['png', 'jpeg', 'webp'],
    rateLimit: 30,
    fullPage: true,
    customHeaders: false,
    webhooks: false,
  },
  professional: {
    screenshotsPerMonth: 10000,
    maxWidth: 3840,
    maxHeight: 2160,
    formats: ['png', 'jpeg', 'webp', 'pdf'],
    rateLimit: 100,
    fullPage: true,
    customHeaders: true,
    webhooks: true,
  },
  enterprise: {
    screenshotsPerMonth: 50000,
    maxWidth: 7680,
    maxHeight: 4320,
    formats: ['png', 'jpeg', 'webp', 'pdf'],
    rateLimit: 500,
    fullPage: true,
    customHeaders: true,
    webhooks: true,
  },
};
```

---

## 🔐 Phase 3: Authentication & Authorization

### 3.1 Auth Service Features

- JWT token generation (access + refresh)
- User registration with email verification
- Login with password hashing (bcrypt)
- API Key generation and validation
- IP and domain whitelisting
- Permission-based access control

### 3.2 Auth Middleware

```typescript
// Middleware chain for API routes:
// 1. authenticateApiKey - Validates X-API-Key header
// 2. checkIpWhitelist - Validates client IP
// 3. checkDomainWhitelist - Validates request origin
// 4. apiRateLimiter - Enforces rate limits
// 5. usageQuotaLimiter - Checks monthly quota
```

### 3.3 API Endpoints

```
POST /api/v1/auth/register     - Register new user
POST /api/v1/auth/login        - Login user
POST /api/v1/auth/logout       - Logout user
POST /api/v1/auth/refresh      - Refresh access token
GET  /api/v1/auth/me           - Get current user
POST /api/v1/auth/api-keys     - Create new API key
GET  /api/v1/auth/api-keys     - List user's API keys
DELETE /api/v1/auth/api-keys/:id - Revoke API key
```

---

## 📸 Phase 4: Screenshot Service (Core Feature)

### 4.1 Screenshot Options

```typescript
interface ScreenshotOptions {
  url: string;                    // Required: URL to capture
  width?: number;                 // Viewport width (default: 1280)
  height?: number;                // Viewport height (default: 720)
  fullPage?: boolean;             // Capture full page (default: false)
  format?: 'png'|'jpeg'|'webp'|'pdf'; // Output format (default: 'png')
  quality?: number;               // Image quality 1-100 (default: 80)
  delay?: number;                 // Wait before capture in ms (default: 0)
  selector?: string;              // CSS selector to capture
  clipRect?: {x,y,width,height};  // Clip region
  headers?: Record<string,string>;// Custom HTTP headers
  cookies?: Cookie[];             // Custom cookies
  userAgent?: string;             // Custom user agent
  darkMode?: boolean;             // Enable dark mode (default: false)
  blockAds?: boolean;             // Block ads (default: false)
  blockTrackers?: boolean;        // Block trackers (default: false)
  webhook?: string;               // Webhook URL for async notification
}
```

### 4.2 Screenshot API Endpoints

```
POST /api/v1/screenshots        - Create new screenshot
GET  /api/v1/screenshots        - List user's screenshots
GET  /api/v1/screenshots/:id    - Get screenshot by ID
DELETE /api/v1/screenshots/:id  - Delete screenshot
```

### 4.3 Screenshot Response

```json
{
  "success": true,
  "data": {
    "id": "screenshot_id",
    "url": "https://storage.../screenshot.png",
    "status": "completed",
    "size": 245678,
    "duration": 2340,
    "metadata": {
      "pageTitle": "Example Page",
      "pageDescription": "...",
      "faviconUrl": "..."
    }
  }
}
```

---

## 💳 Phase 5: Subscription & Payment (Stripe)

### 5.1 Stripe Integration

- Checkout sessions for subscription
- Customer portal for self-service
- Webhook handling for events
- Prorated upgrades/downgrades
- Invoice and receipt generation

### 5.2 Subscription Endpoints

```
POST /api/v1/subscriptions/checkout    - Create checkout session
POST /api/v1/subscriptions/portal      - Create customer portal
POST /api/v1/subscriptions/webhook     - Handle Stripe webhooks
GET  /api/v1/subscriptions/usage       - Get usage stats
DELETE /api/v1/subscriptions           - Cancel subscription
```

---

## 📊 Phase 6: Analytics & Usage Tracking

### 6.1 Tracked Metrics

- Total screenshots per day/week/month
- Success/failure rates
- Average response times
- Bandwidth usage
- Popular URLs
- Geographic distribution
- Error frequency and types

### 6.2 Analytics Endpoints

```
GET /api/v1/analytics/overview         - Dashboard overview
GET /api/v1/analytics/screenshots      - Screenshot stats
GET /api/v1/analytics/usage            - Usage over time
GET /api/v1/analytics/errors           - Error breakdown
```

---

## 🧪 Phase 7: Testing

### 7.1 Test Coverage Requirements

- **Unit Tests:** 90%+ coverage
- **Integration Tests:** All API endpoints
- **E2E Tests:** Critical user flows

### 7.2 Test Categories

```
tests/
├── unit/
│   ├── services/
│   │   ├── screenshot.service.test.ts
│   │   ├── auth.service.test.ts
│   │   └── subscription.service.test.ts
│   └── utils/
│       └── helpers.test.ts
├── integration/
│   ├── screenshot.test.ts
│   ├── auth.test.ts
│   └── subscription.test.ts
└── e2e/
    └── api.test.ts
```

### 7.3 Jest Configuration

```javascript
// jest.config.js
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/tests'],
  collectCoverageFrom: ['src/**/*.ts'],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
};
```

---

## 📚 Phase 8: Documentation

### 8.1 API Documentation (OpenAPI/Swagger)

Complete API documentation with:

- All endpoints
- Request/response schemas
- Authentication methods
- Code examples
- Error codes

### 8.2 README Structure

- Quick start guide
- Installation instructions
- Configuration options
- API reference
- Examples
- Deployment guide

---

## 🐳 Phase 9: Docker & Deployment

### 9.1 Dockerfile

```dockerfile
FROM node:20-alpine

# Install Chromium for Puppeteer
RUN apk add --no-cache chromium

ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY dist ./dist

EXPOSE 3000
CMD ["node", "dist/server.js"]
```

### 9.2 Docker Compose

```yaml
version: '3.8'
services:
  api:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
    depends_on:
      - mongodb
      - redis

  mongodb:
    image: mongo:7
    volumes:
      - mongodb_data:/data/db

  redis:
    image: redis:alpine
    volumes:
      - redis_data:/data

volumes:
  mongodb_data:
  redis_data:
```

---

## ✅ Phase 10: Final Checklist

### Pre-Launch Checklist

- [ ] All tests passing with 80%+ coverage
- [ ] Security audit completed
- [ ] Rate limiting tested under load
- [ ] Error handling comprehensive
- [ ] Logging configured properly
- [ ] Monitoring/alerting setup
- [ ] Backup strategy in place
- [ ] SSL/HTTPS configured
- [ ] API documentation complete
- [ ] Terms of service ready
- [ ] Privacy policy ready

---

# 🤖 Claude Code Execution Prompt

The following prompt should be used with Claude Code to execute this plan:
