/**
 * Swagger/OpenAPI Configuration
 * Configures API documentation with swagger-jsdoc
 */

import swaggerJsdoc from 'swagger-jsdoc';
import { version } from '../../package.json';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.3',
    info: {
      title: 'Screenshot API',
      version,
      description: `
# Screenshot API

Professional screenshot capture API powered by Puppeteer. Capture high-quality screenshots of any website with customizable options.

## Features

- **High-Quality Screenshots**: Capture websites at any resolution up to 8K
- **Multiple Formats**: PNG, JPEG, WebP, and PDF output formats
- **Customizable Options**: Viewport, full-page capture, delays, CSS selectors
- **Authentication**: JWT tokens and API keys for secure access
- **Rate Limiting**: Plan-based rate limiting for fair usage
- **Webhooks**: Async notifications for screenshot completion
- **Analytics**: Detailed usage statistics and insights

## Authentication

This API supports two authentication methods:

### JWT Bearer Token
Obtain a token by logging in and include it in the Authorization header:
\`\`\`
Authorization: Bearer <your_jwt_token>
\`\`\`

### API Key
Create an API key from your dashboard and include it in the header:
\`\`\`
X-API-Key: <your_api_key>
\`\`\`

## Rate Limits

Rate limits vary by subscription plan:
- **Free**: 10 requests/minute, 100 screenshots/month
- **Starter**: 30 requests/minute, 2,000 screenshots/month
- **Professional**: 100 requests/minute, 10,000 screenshots/month
- **Enterprise**: 500 requests/minute, 50,000 screenshots/month
      `,
      contact: {
        name: 'API Support',
        email: 'support@screenshot-api.com',
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT',
      },
    },
    servers: [
      {
        url: 'http://localhost:3000/api/v1',
        description: 'Development server',
      },
      {
        url: 'https://api.screenshot-api.com/api/v1',
        description: 'Production server',
      },
    ],
    tags: [
      {
        name: 'Authentication',
        description: 'User registration, login, and API key management',
      },
      {
        name: 'Screenshots',
        description: 'Screenshot capture and management operations',
      },
      {
        name: 'Subscriptions',
        description: 'Subscription and payment management',
      },
      {
        name: 'Analytics',
        description: 'Usage statistics and analytics',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'JWT access token obtained from login',
        },
        apiKeyAuth: {
          type: 'apiKey',
          in: 'header',
          name: 'X-API-Key',
          description: 'API key created from the dashboard',
        },
      },
      schemas: {
        // Common Schemas
        Error: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false,
            },
            error: {
              type: 'object',
              properties: {
                code: {
                  type: 'string',
                  example: 'VALIDATION_FAILED',
                },
                message: {
                  type: 'string',
                  example: 'Validation failed',
                },
                details: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      field: { type: 'string' },
                      message: { type: 'string' },
                    },
                  },
                },
              },
            },
          },
        },

        // User Schemas
        User: {
          type: 'object',
          properties: {
            id: { type: 'string', example: '507f1f77bcf86cd799439011' },
            email: { type: 'string', format: 'email', example: 'user@example.com' },
            name: { type: 'string', example: 'John Doe' },
            company: { type: 'string', example: 'Acme Inc' },
            isVerified: { type: 'boolean', example: true },
            role: { type: 'string', enum: ['user', 'admin'], example: 'user' },
            subscription: {
              type: 'object',
              properties: {
                plan: { type: 'string', enum: ['free', 'starter', 'professional', 'enterprise'] },
                status: { type: 'string', enum: ['active', 'cancelled', 'expired', 'past_due'] },
                currentPeriodEnd: { type: 'string', format: 'date-time' },
              },
            },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },

        // Auth Schemas
        RegisterRequest: {
          type: 'object',
          required: ['email', 'password', 'name'],
          properties: {
            email: { type: 'string', format: 'email', example: 'user@example.com' },
            password: {
              type: 'string',
              minLength: 8,
              example: 'SecurePassword123!',
              description: 'Min 8 chars, requires uppercase, lowercase, number, special char',
            },
            name: { type: 'string', minLength: 2, example: 'John Doe' },
            company: { type: 'string', example: 'Acme Inc' },
          },
        },

        LoginRequest: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: { type: 'string', format: 'email', example: 'user@example.com' },
            password: { type: 'string', example: 'SecurePassword123!' },
          },
        },

        AuthTokens: {
          type: 'object',
          properties: {
            accessToken: { type: 'string' },
            refreshToken: { type: 'string' },
          },
        },

        ApiKey: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            name: { type: 'string', example: 'Production API Key' },
            maskedKey: { type: 'string', example: 'ss_****************************ab12' },
            permissions: {
              type: 'array',
              items: { type: 'string' },
              example: ['read', 'screenshot:create'],
            },
            ipWhitelist: {
              type: 'array',
              items: { type: 'string' },
              example: ['192.168.1.1', '10.0.0.0/8'],
            },
            domainWhitelist: {
              type: 'array',
              items: { type: 'string' },
              example: ['example.com', '*.myapp.com'],
            },
            expiresAt: { type: 'string', format: 'date-time' },
            usageCount: { type: 'integer', example: 1250 },
            lastUsedAt: { type: 'string', format: 'date-time' },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },

        CreateApiKeyRequest: {
          type: 'object',
          required: ['name'],
          properties: {
            name: { type: 'string', example: 'Production API Key' },
            permissions: {
              type: 'array',
              items: { type: 'string' },
              example: ['read', 'screenshot:create'],
            },
            ipWhitelist: {
              type: 'array',
              items: { type: 'string' },
            },
            domainWhitelist: {
              type: 'array',
              items: { type: 'string' },
            },
            expiresAt: { type: 'string', format: 'date-time' },
            rateLimit: { type: 'integer', minimum: 1, maximum: 1000 },
          },
        },

        // Screenshot Schemas
        ScreenshotRequest: {
          type: 'object',
          required: ['url'],
          properties: {
            url: {
              type: 'string',
              format: 'uri',
              example: 'https://example.com',
              description: 'URL to capture',
            },
            width: {
              type: 'integer',
              minimum: 320,
              maximum: 7680,
              default: 1280,
              description: 'Viewport width in pixels',
            },
            height: {
              type: 'integer',
              minimum: 240,
              maximum: 4320,
              default: 720,
              description: 'Viewport height in pixels',
            },
            fullPage: {
              type: 'boolean',
              default: false,
              description: 'Capture full page scroll height',
            },
            format: {
              type: 'string',
              enum: ['png', 'jpeg', 'webp', 'pdf'],
              default: 'png',
              description: 'Output format',
            },
            quality: {
              type: 'integer',
              minimum: 1,
              maximum: 100,
              default: 80,
              description: 'Image quality (JPEG/WebP only)',
            },
            delay: {
              type: 'integer',
              minimum: 0,
              maximum: 30000,
              default: 0,
              description: 'Wait time before capture (ms)',
            },
            selector: {
              type: 'string',
              description: 'CSS selector to capture specific element',
            },
            headers: {
              type: 'object',
              additionalProperties: { type: 'string' },
              description: 'Custom HTTP headers',
            },
            cookies: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  name: { type: 'string' },
                  value: { type: 'string' },
                  domain: { type: 'string' },
                },
              },
              description: 'Custom cookies to set',
            },
            userAgent: {
              type: 'string',
              description: 'Custom user agent string',
            },
            darkMode: {
              type: 'boolean',
              default: false,
              description: 'Enable dark mode preference',
            },
            blockAds: {
              type: 'boolean',
              default: false,
              description: 'Block advertisements',
            },
            waitForSelector: {
              type: 'string',
              description: 'Wait for element before capture',
            },
            waitForNavigation: {
              type: 'string',
              enum: ['load', 'domcontentloaded', 'networkidle0', 'networkidle2'],
              default: 'networkidle2',
              description: 'Navigation wait strategy',
            },
            webhook: {
              type: 'string',
              format: 'uri',
              description: 'Webhook URL for async notification',
            },
          },
        },

        Screenshot: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            url: { type: 'string', format: 'uri' },
            options: {
              type: 'object',
              properties: {
                width: { type: 'integer' },
                height: { type: 'integer' },
                fullPage: { type: 'boolean' },
                format: { type: 'string' },
                quality: { type: 'integer' },
              },
            },
            result: {
              type: 'object',
              properties: {
                status: { type: 'string', enum: ['pending', 'processing', 'completed', 'failed'] },
                url: { type: 'string', format: 'uri' },
                size: { type: 'integer' },
                duration: { type: 'integer' },
                error: { type: 'string' },
              },
            },
            metadata: {
              type: 'object',
              properties: {
                pageTitle: { type: 'string' },
                pageDescription: { type: 'string' },
                faviconUrl: { type: 'string' },
              },
            },
            createdAt: { type: 'string', format: 'date-time' },
            expiresAt: { type: 'string', format: 'date-time' },
          },
        },

        // Subscription Schemas
        SubscriptionPlan: {
          type: 'object',
          properties: {
            id: { type: 'string', example: 'professional' },
            name: { type: 'string', example: 'Professional' },
            price: { type: 'number', example: 49 },
            currency: { type: 'string', example: 'USD' },
            interval: { type: 'string', enum: ['month', 'year'] },
            features: {
              type: 'object',
              properties: {
                screenshotsPerMonth: { type: 'integer' },
                maxWidth: { type: 'integer' },
                maxHeight: { type: 'integer' },
                formats: { type: 'array', items: { type: 'string' } },
                rateLimit: { type: 'integer' },
                fullPage: { type: 'boolean' },
                customHeaders: { type: 'boolean' },
                webhooks: { type: 'boolean' },
              },
            },
          },
        },

        Subscription: {
          type: 'object',
          properties: {
            plan: { type: 'string', enum: ['free', 'starter', 'professional', 'enterprise'] },
            status: { type: 'string', enum: ['active', 'cancelled', 'expired', 'past_due'] },
            stripeSubscriptionId: { type: 'string' },
            currentPeriodStart: { type: 'string', format: 'date-time' },
            currentPeriodEnd: { type: 'string', format: 'date-time' },
            cancelAtPeriodEnd: { type: 'boolean' },
          },
        },

        // Analytics Schemas
        OverviewStats: {
          type: 'object',
          properties: {
            totalScreenshots: { type: 'integer' },
            successfulScreenshots: { type: 'integer' },
            failedScreenshots: { type: 'integer' },
            successRate: { type: 'number', example: 98.5 },
            averageResponseTime: { type: 'number', example: 2340 },
            totalBandwidth: { type: 'integer' },
            activeApiKeys: { type: 'integer' },
            periodStart: { type: 'string', format: 'date-time' },
            periodEnd: { type: 'string', format: 'date-time' },
          },
        },

        UsageStats: {
          type: 'object',
          properties: {
            used: { type: 'integer', example: 150 },
            limit: { type: 'integer', example: 2000 },
            remaining: { type: 'integer', example: 1850 },
            percentage: { type: 'number', example: 7.5 },
            resetDate: { type: 'string', format: 'date-time' },
          },
        },

        // Screenshot Response Wrapper
        ScreenshotResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            data: { $ref: '#/components/schemas/Screenshot' },
          },
        },

        // Screenshot List Response
        ScreenshotListResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            data: {
              type: 'array',
              items: { $ref: '#/components/schemas/Screenshot' },
            },
            pagination: {
              type: 'object',
              properties: {
                page: { type: 'integer', example: 1 },
                limit: { type: 'integer', example: 20 },
                total: { type: 'integer', example: 150 },
                totalPages: { type: 'integer', example: 8 },
                hasNext: { type: 'boolean', example: true },
                hasPrev: { type: 'boolean', example: false },
              },
            },
          },
        },

        // Checkout Request Schema
        CreateCheckoutRequest: {
          type: 'object',
          required: ['plan', 'successUrl', 'cancelUrl'],
          properties: {
            plan: {
              type: 'string',
              enum: ['starter', 'professional', 'enterprise'],
              description: 'Subscription plan to purchase',
              example: 'professional',
            },
            successUrl: {
              type: 'string',
              format: 'uri',
              description: 'URL to redirect after successful payment',
              example: 'https://myapp.com/payment/success',
            },
            cancelUrl: {
              type: 'string',
              format: 'uri',
              description: 'URL to redirect if payment is cancelled',
              example: 'https://myapp.com/payment/cancel',
            },
          },
        },

        // Checkout Response Schema
        CheckoutResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            data: {
              type: 'object',
              properties: {
                sessionId: {
                  type: 'string',
                  description: 'Stripe checkout session ID',
                  example: 'cs_test_a1b2c3d4e5f6g7h8i9j0',
                },
                url: {
                  type: 'string',
                  format: 'uri',
                  description: 'Stripe checkout URL to redirect user',
                  example: 'https://checkout.stripe.com/pay/cs_test_...',
                },
              },
            },
          },
        },

        // Portal Response Schema
        PortalResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            data: {
              type: 'object',
              properties: {
                url: {
                  type: 'string',
                  format: 'uri',
                  description: 'Stripe billing portal URL',
                  example: 'https://billing.stripe.com/session/...',
                },
              },
            },
          },
        },

        // Analytics Overview Response
        AnalyticsOverview: {
          type: 'object',
          properties: {
            totalScreenshots: {
              type: 'integer',
              description: 'Total screenshots captured all-time',
              example: 1250,
            },
            successfulScreenshots: {
              type: 'integer',
              description: 'Number of successful screenshots',
              example: 1200,
            },
            failedScreenshots: {
              type: 'integer',
              description: 'Number of failed screenshots',
              example: 50,
            },
            successRate: {
              type: 'integer',
              description: 'Success rate as percentage (0-100)',
              example: 96,
            },
            averageResponseTime: {
              type: 'integer',
              description: 'Average response time in milliseconds',
              example: 2500,
            },
            totalBandwidth: {
              type: 'integer',
              description: 'Total bandwidth consumed in bytes',
              example: 524288000,
            },
            screenshotsToday: {
              type: 'integer',
              description: 'Screenshots captured today',
              example: 25,
            },
            screenshotsThisWeek: {
              type: 'integer',
              description: 'Screenshots captured this week',
              example: 150,
            },
            screenshotsThisMonth: {
              type: 'integer',
              description: 'Screenshots captured this month',
              example: 500,
            },
            currentPlan: {
              type: 'string',
              enum: ['free', 'starter', 'professional', 'enterprise'],
              description: "User's current subscription plan",
              example: 'professional',
            },
            usagePercentage: {
              type: 'integer',
              description: 'Percentage of monthly quota used (0-100)',
              example: 45,
            },
            planLimit: {
              type: 'integer',
              description: 'Monthly screenshot limit for current plan',
              example: 1000,
            },
          },
        },

        // Screenshot Stats Response
        ScreenshotStats: {
          type: 'object',
          properties: {
            byStatus: {
              type: 'object',
              description: 'Screenshot counts by status',
              properties: {
                pending: { type: 'integer', example: 5 },
                processing: { type: 'integer', example: 2 },
                completed: { type: 'integer', example: 1200 },
                failed: { type: 'integer', example: 50 },
              },
            },
            byFormat: {
              type: 'object',
              description: 'Screenshot counts by format',
              additionalProperties: { type: 'integer' },
              example: { png: 800, jpeg: 300, webp: 100, pdf: 50 },
            },
            byResolution: {
              type: 'array',
              description: 'Top 5 resolutions used',
              items: {
                type: 'object',
                properties: {
                  width: { type: 'integer', example: 1920 },
                  height: { type: 'integer', example: 1080 },
                  count: { type: 'integer', example: 450 },
                },
              },
            },
            averageDuration: {
              type: 'integer',
              description: 'Average capture duration in milliseconds',
              example: 2500,
            },
            averageSize: {
              type: 'integer',
              description: 'Average file size in bytes',
              example: 524288,
            },
            fullPageCount: {
              type: 'integer',
              description: 'Number of full-page screenshots',
              example: 300,
            },
            regularCount: {
              type: 'integer',
              description: 'Number of regular screenshots',
              example: 950,
            },
          },
        },

        // Usage Over Time Response
        UsageOverTime: {
          type: 'object',
          properties: {
            period: {
              type: 'string',
              enum: ['day', 'week', 'month'],
              description: 'Time period used for grouping',
              example: 'day',
            },
            data: {
              type: 'array',
              description: 'Usage data points',
              items: {
                type: 'object',
                properties: {
                  date: {
                    type: 'string',
                    description: 'Date/period identifier',
                    example: '2024-12-25',
                  },
                  screenshots: {
                    type: 'integer',
                    description: 'Total screenshots in this period',
                    example: 45,
                  },
                  successful: {
                    type: 'integer',
                    description: 'Successful screenshots',
                    example: 43,
                  },
                  failed: {
                    type: 'integer',
                    description: 'Failed screenshots',
                    example: 2,
                  },
                  bandwidth: {
                    type: 'integer',
                    description: 'Bandwidth consumed in bytes',
                    example: 23592960,
                  },
                  avgResponseTime: {
                    type: 'integer',
                    description: 'Average response time in milliseconds',
                    example: 2350,
                  },
                },
              },
            },
          },
        },

        // Error Breakdown Response
        ErrorBreakdown: {
          type: 'object',
          properties: {
            totalErrors: {
              type: 'integer',
              description: 'Total number of failed screenshots',
              example: 50,
            },
            byType: {
              type: 'object',
              description: 'Error counts by category',
              additionalProperties: { type: 'integer' },
              example: {
                timeout: 20,
                network: 15,
                navigation: 8,
                invalid_url: 5,
                blocked: 2,
              },
            },
            topErrors: {
              type: 'array',
              description: 'Top 10 most frequent error messages',
              items: {
                type: 'object',
                properties: {
                  error: {
                    type: 'string',
                    description: 'Error message',
                    example: 'Navigation timeout of 30000 ms exceeded',
                  },
                  count: {
                    type: 'integer',
                    description: 'Number of occurrences',
                    example: 15,
                  },
                  lastOccurred: {
                    type: 'string',
                    format: 'date-time',
                    description: 'When this error last occurred',
                    example: '2024-12-25T10:30:00Z',
                  },
                },
              },
            },
            errorRate: {
              type: 'integer',
              description: 'Error rate as percentage (0-100)',
              example: 4,
            },
          },
        },

        // Popular URL Response
        PopularUrl: {
          type: 'object',
          properties: {
            url: {
              type: 'string',
              format: 'uri',
              description: 'Full URL that was captured',
              example: 'https://example.com/page',
            },
            domain: {
              type: 'string',
              description: 'Extracted domain from URL',
              example: 'example.com',
            },
            count: {
              type: 'integer',
              description: 'Number of times this URL was captured',
              example: 45,
            },
            lastCaptured: {
              type: 'string',
              format: 'date-time',
              description: 'When this URL was last captured',
              example: '2024-12-25T14:30:00Z',
            },
          },
        },

        // API Key Stats Response
        ApiKeyStats: {
          type: 'object',
          properties: {
            totalRequests: {
              type: 'integer',
              description: 'Total requests made with this API key',
              example: 500,
            },
            successfulRequests: {
              type: 'integer',
              description: 'Number of successful requests',
              example: 480,
            },
            failedRequests: {
              type: 'integer',
              description: 'Number of failed requests',
              example: 20,
            },
            lastUsed: {
              type: 'string',
              format: 'date-time',
              nullable: true,
              description: 'When this API key was last used',
              example: '2024-12-25T15:45:00Z',
            },
            usageByDay: {
              type: 'array',
              description: 'Daily usage for the last 30 days',
              items: {
                type: 'object',
                properties: {
                  date: {
                    type: 'string',
                    description: 'Date (YYYY-MM-DD format)',
                    example: '2024-12-25',
                  },
                  count: {
                    type: 'integer',
                    description: 'Number of requests on this date',
                    example: 25,
                  },
                },
              },
            },
          },
        },
      },
      responses: {
        UnauthorizedError: {
          description: 'Authentication required or invalid credentials',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' },
              example: {
                success: false,
                error: {
                  code: 'UNAUTHORIZED',
                  message: 'Authentication required',
                },
              },
            },
          },
        },
        ForbiddenError: {
          description: 'Access denied - insufficient permissions',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' },
              example: {
                success: false,
                error: {
                  code: 'FORBIDDEN',
                  message: 'You do not have permission to access this resource',
                },
              },
            },
          },
        },
        NotFoundError: {
          description: 'Resource not found',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' },
              example: {
                success: false,
                error: {
                  code: 'NOT_FOUND',
                  message: 'Resource not found',
                },
              },
            },
          },
        },
        ValidationError: {
          description: 'Validation failed',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' },
              example: {
                success: false,
                error: {
                  code: 'VALIDATION_FAILED',
                  message: 'Validation failed',
                  details: [{ field: 'url', message: 'Invalid URL format' }],
                },
              },
            },
          },
        },
        RateLimitError: {
          description: 'Rate limit exceeded',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' },
              example: {
                success: false,
                error: {
                  code: 'RATE_LIMIT_EXCEEDED',
                  message: 'Too many requests. Please try again later.',
                },
              },
            },
          },
        },
        QuotaExceededError: {
          description: 'Monthly quota exceeded',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' },
              example: {
                success: false,
                error: {
                  code: 'QUOTA_EXCEEDED',
                  message: 'Monthly screenshot quota exceeded. Upgrade your plan for more.',
                },
              },
            },
          },
        },

        // Response aliases used in route documentation
        Unauthorized: {
          description: 'Authentication required or invalid credentials',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' },
              example: {
                success: false,
                error: {
                  code: 'UNAUTHORIZED',
                  message: 'Authentication required',
                },
              },
            },
          },
        },

        BadRequest: {
          description: 'Invalid request parameters or body',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' },
              example: {
                success: false,
                error: {
                  code: 'BAD_REQUEST',
                  message: 'Invalid request',
                  details: [{ field: 'url', message: 'URL is required' }],
                },
              },
            },
          },
        },

        NotFound: {
          description: 'Resource not found',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' },
              example: {
                success: false,
                error: {
                  code: 'NOT_FOUND',
                  message: 'Resource not found',
                },
              },
            },
          },
        },

        RateLimitExceeded: {
          description: 'Rate limit exceeded',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' },
              example: {
                success: false,
                error: {
                  code: 'RATE_LIMIT_EXCEEDED',
                  message: 'Too many requests. Please try again later.',
                },
              },
            },
          },
        },

        QuotaExceeded: {
          description: 'Monthly quota exceeded',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' },
              example: {
                success: false,
                error: {
                  code: 'QUOTA_EXCEEDED',
                  message: 'Monthly screenshot quota exceeded. Upgrade your plan for more.',
                },
              },
            },
          },
        },

        PaymentRequired: {
          description: 'Payment required for this feature',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' },
              example: {
                success: false,
                error: {
                  code: 'PAYMENT_REQUIRED',
                  message: 'This feature requires a paid subscription',
                },
              },
            },
          },
        },
      },
    },
    security: [{ bearerAuth: [] }, { apiKeyAuth: [] }],
  },
  apis: ['./src/routes/*.ts', './src/controllers/*.ts'],
};

export const swaggerSpec = swaggerJsdoc(options);

export default swaggerSpec;
