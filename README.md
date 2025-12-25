# Screenshot API

Professional screenshot capture API powered by Puppeteer. Capture high-quality screenshots of any website with customizable options.

## Features

- **High-Quality Screenshots**: Capture websites at any resolution up to 8K
- **Multiple Formats**: PNG, JPEG, WebP, and PDF output
- **Full-Page Capture**: Capture entire scrollable pages
- **Custom Viewport**: Any width/height configuration
- **Dark Mode**: Automatic dark mode detection and forcing
- **Ad Blocking**: Optional advertisement blocking
- **Custom Headers/Cookies**: Set authentication and session data
- **Element Selection**: Capture specific page elements via CSS selectors
- **Webhooks**: Async notifications for screenshot completion
- **Rate Limiting**: Plan-based rate limiting for fair usage
- **Analytics**: Detailed usage statistics and insights
- **Subscription Plans**: Free tier with paid upgrades via Stripe

## Landing Page

Visit the root URL (`/`) to see the professional marketing landing page featuring:

- **Hero Section**: Compelling headline with CTA buttons
- **Features Grid**: 6 feature cards with detailed sections
- **Interactive Code Demo**: Live code examples in multiple languages
- **Pricing Plans**: 4 tiers with monthly/yearly toggle
- **Testimonials**: Stats, reviews, and company logos carousel
- **Newsletter**: Email subscription form

The landing page is fully responsive, accessible (WCAG 2.1), and optimized for performance.

## Tech Stack

- **Runtime**: Node.js 20+
- **Language**: TypeScript (strict mode)
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose
- **Cache**: Redis with ioredis
- **Browser**: Puppeteer (Chromium)
- **Payments**: Stripe
- **Authentication**: JWT + API Keys
- **Validation**: Zod
- **Testing**: Jest + Supertest

## Quick Start

### Prerequisites

- Node.js 20+
- MongoDB 7+
- Redis 7+ (optional)
- Chrome/Chromium (for Puppeteer)

### Installation

1. **Clone the repository**

```bash
git clone https://github.com/mahmoodhamdi/Screenshot-API.git
cd Screenshot-API
```

2. **Install dependencies**

```bash
npm install
```

3. **Configure environment**

```bash
cp .env.example .env
# Edit .env with your configuration
```

4. **Start development server**

```bash
npm run dev
```

The API will be available at `http://localhost:3000`.

### Running with Docker

```bash
# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f api
```

## Configuration

Create a `.env` file based on `.env.example`:

```env
# Server
NODE_ENV=development
PORT=3000
API_VERSION=v1

# Database
MONGODB_URI=mongodb://localhost:27017/screenshot-api

# Redis (optional)
REDIS_HOST=localhost
REDIS_PORT=6379

# JWT
JWT_SECRET=your-secret-key-min-32-chars
JWT_REFRESH_SECRET=your-refresh-secret-min-32-chars

# Stripe (for subscriptions)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

See [.env.example](.env.example) for all available options.

## Documentation

| Document | Description |
|----------|-------------|
| [Setup Guide](docs/SETUP.md) | Installation and configuration |
| [Deployment Guide](docs/DEPLOYMENT.md) | Production deployment |
| [API Documentation](docs/API.md) | Complete API reference |
| [Swagger UI](/docs) | Interactive API explorer |
| [ReDoc](/redoc) | Alternative API documentation |

## API Documentation

### Interactive Documentation

Once running, visit these documentation endpoints:

- `http://localhost:3000/api-docs` - Documentation portal
- `http://localhost:3000/docs` - Swagger UI (interactive, dark theme)
- `http://localhost:3000/redoc` - ReDoc (readable, dark theme)
- `http://localhost:3000/docs/openapi.json` - OpenAPI 3.0 JSON spec
- `http://localhost:3000/docs/openapi.yaml` - OpenAPI 3.0 YAML spec

### Quick Examples

**Create a screenshot:**

```bash
curl -X POST http://localhost:3000/api/v1/screenshots \
  -H "X-API-Key: ss_your_api_key" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://example.com",
    "width": 1920,
    "height": 1080,
    "format": "png"
  }'
```

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "507f1f77bcf86cd799439011",
    "result": {
      "status": "completed",
      "url": "https://storage.example.com/screenshots/abc123.png",
      "size": 245678,
      "duration": 2340
    }
  }
}
```

### Endpoints Overview

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/auth/register` | Register new user |
| POST | `/api/v1/auth/login` | Login user |
| GET | `/api/v1/auth/me` | Get current user |
| POST | `/api/v1/auth/api-keys` | Create API key |
| POST | `/api/v1/screenshots` | Create screenshot |
| GET | `/api/v1/screenshots` | List screenshots |
| GET | `/api/v1/screenshots/:id` | Get screenshot |
| DELETE | `/api/v1/screenshots/:id` | Delete screenshot |
| GET | `/api/v1/subscriptions/plans` | Get plans |
| POST | `/api/v1/subscriptions/checkout` | Create checkout |
| GET | `/api/v1/analytics/overview` | Get analytics |

For complete API documentation, see [docs/API.md](docs/API.md).

## Authentication

### JWT Bearer Token

```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

Obtain tokens by registering or logging in.

### API Key

```http
X-API-Key: ss_your_api_key_here
```

Create API keys from your dashboard for programmatic access.

## Subscription Plans

| Plan | Price | Screenshots/Month | Rate Limit |
|------|-------|-------------------|------------|
| Free | $0 | 100 | 10/min |
| Starter | $19/mo | 2,000 | 30/min |
| Professional | $49/mo | 10,000 | 100/min |
| Enterprise | $149/mo | 50,000 | 500/min |

### Plan Features

| Feature | Free | Starter | Professional | Enterprise |
|---------|------|---------|--------------|------------|
| Max Resolution | 1280x720 | 1920x1080 | 4K | 8K |
| Formats | PNG, JPEG | + WebP | + PDF | All |
| Full Page | No | Yes | Yes | Yes |
| Custom Headers | No | No | Yes | Yes |
| Webhooks | No | No | Yes | Yes |
| Support | Community | Email | Priority | Dedicated |

## Development

### Available Scripts

```bash
# Development server with hot reload
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run all tests
npm test

# Run unit tests only
npm run test:unit

# Run integration tests
npm run test:integration

# Run tests in watch mode
npm run test:watch

# Lint code
npm run lint

# Fix lint issues
npm run lint:fix

# Format code
npm run format

# Type check
npm run typecheck
```

### Project Structure

```
screenshot-api/
├── src/
│   ├── config/          # Configuration files
│   │   ├── index.ts     # Main config
│   │   ├── database.ts  # MongoDB connection
│   │   ├── redis.ts     # Redis connection
│   │   ├── puppeteer.ts # Browser pool
│   │   └── swagger.ts   # API documentation
│   ├── controllers/     # Request handlers
│   ├── middlewares/     # Express middlewares
│   ├── models/          # Mongoose models
│   ├── routes/          # API routes
│   ├── services/        # Business logic
│   ├── types/           # TypeScript types
│   ├── utils/           # Utility functions
│   ├── views/           # Page templates
│   │   └── landing/     # Landing page generator
│   ├── app.ts           # Express app
│   └── server.ts        # Server entry point
├── tests/
│   ├── unit/            # Unit tests
│   ├── integration/     # Integration tests
│   └── e2e/             # End-to-end tests
├── docs/                # Documentation
├── .env.example         # Environment template
├── docker-compose.yml   # Docker services
├── Dockerfile           # Docker build
└── README.md
```

### Testing

The project uses Jest for testing with separate configurations for:

- **Unit Tests**: Test individual functions and classes
- **Integration Tests**: Test API endpoints with database
- **E2E Tests**: Test complete user flows

```bash
# Run all tests with coverage
npm test

# Run specific test file
npm test -- auth.service.test.ts

# Run tests matching pattern
npm test -- --testNamePattern="should register"
```

## Deployment

### Docker Deployment

1. Build the Docker image:

```bash
docker build -t screenshot-api .
```

2. Run with Docker Compose:

```bash
docker-compose -f docker-compose.prod.yml up -d
```

### Environment Variables for Production

```env
NODE_ENV=production
PORT=3000

# Use strong secrets
JWT_SECRET=<generate-32-char-secret>
JWT_REFRESH_SECRET=<generate-32-char-secret>

# Production MongoDB
MONGODB_URI=mongodb://user:pass@host:27017/screenshot-api

# Production Redis
REDIS_HOST=redis.example.com
REDIS_PORT=6379
REDIS_PASSWORD=<redis-password>

# Stripe production keys
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# S3 for storage
AWS_ACCESS_KEY_ID=<access-key>
AWS_SECRET_ACCESS_KEY=<secret-key>
AWS_REGION=us-east-1
AWS_S3_BUCKET=screenshot-api-prod
```

### Health Checks

The API exposes health check endpoints:

```bash
# Simple health check
curl http://localhost:3000/health

# Detailed API info
curl http://localhost:3000/api/v1
```

## Security

- **Helmet**: Security headers
- **CORS**: Cross-origin protection
- **Rate Limiting**: Per-user and per-IP limits
- **Input Validation**: Zod schema validation
- **Password Hashing**: bcrypt with salt
- **JWT**: Secure token-based auth
- **API Keys**: Hashed storage with whitelisting

## Performance

- **Browser Pool**: Reusable browser instances
- **Redis Caching**: Rate limit and session caching
- **Compression**: gzip response compression
- **Connection Pooling**: MongoDB connection reuse

## Monitoring

The API provides structured logging via Winston:

```json
{
  "level": "info",
  "message": "Screenshot created",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "requestId": "uuid-here",
  "duration": 2340
}
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

- **Setup Guide**: [docs/SETUP.md](docs/SETUP.md)
- **Deployment Guide**: [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md)
- **API Documentation**: [docs/API.md](docs/API.md)
- **Issues**: [GitHub Issues](https://github.com/mahmoodhamdi/Screenshot-API/issues)
- **Email**: hmdy7486@gmail.com

## Author

**Mahmood Hamdi**

- GitHub: [@mahmoodhamdi](https://github.com/mahmoodhamdi)
- Email: hmdy7486@gmail.com
