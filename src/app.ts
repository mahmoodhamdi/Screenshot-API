/**
 * Express Application Setup
 * Main application configuration with all middleware and routes
 */

import express, { Application, Request, Response, NextFunction } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import morgan from 'morgan';
import { v4 as uuidv4 } from 'uuid';
import swaggerUi from 'swagger-ui-express';

import config from '@config/index';
import swaggerSpec from '@config/swagger';
import routes from '@routes/index';
import { errorHandler, notFoundHandler } from '@middlewares/error.middleware';
import logger from '@utils/logger';

// ============================================
// Create Express App
// ============================================

const app: Application = express();

// ============================================
// Security Middleware
// ============================================

// Helmet for security headers
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", 'data:', 'blob:', 'https://validator.swagger.io'],
      },
    },
    crossOriginEmbedderPolicy: false,
  })
);

// CORS configuration
app.use(
  cors({
    origin: config.cors.origin,
    credentials: config.cors.credentials,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-API-Key', 'X-Request-ID'],
    exposedHeaders: ['X-Request-ID', 'X-RateLimit-Limit', 'X-RateLimit-Remaining', 'X-RateLimit-Reset'],
    maxAge: 86400, // 24 hours
  })
);

// ============================================
// Request Processing Middleware
// ============================================

// Request ID for tracing
app.use((req: Request, res: Response, next: NextFunction) => {
  const requestId = (req.headers['x-request-id'] as string) || uuidv4();
  req.requestId = requestId;
  res.setHeader('X-Request-ID', requestId);
  next();
});

// Compression
app.use(compression());

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Trust proxy for accurate IP detection behind load balancers
app.set('trust proxy', config.server.trustProxy);

// ============================================
// Logging Middleware
// ============================================

// Morgan HTTP request logging
if (config.server.env !== 'test') {
  app.use(
    morgan(
      config.server.env === 'development' ? 'dev' : 'combined',
      {
        stream: {
          write: (message: string) => {
            logger.http(message.trim());
          },
        },
        skip: (req: Request) => {
          // Skip health check logging to reduce noise
          return req.path === '/health' || req.path === '/api/v1/health';
        },
      }
    )
  );
}

// ============================================
// API Documentation
// ============================================

// Swagger UI - API documentation
app.use(
  '/docs',
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, {
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'Screenshot API Documentation',
    swaggerOptions: {
      persistAuthorization: true,
      displayRequestDuration: true,
      filter: true,
      showExtensions: true,
    },
  })
);

// OpenAPI specification JSON
app.get('/docs/openapi.json', (_req: Request, res: Response) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

// ============================================
// API Routes
// ============================================

// API version prefix
app.use(`/api/${config.api.version}`, routes);

// Root health check
app.get('/health', (_req: Request, res: Response) => {
  res.json({
    success: true,
    status: 'healthy',
    service: 'screenshot-api',
    version: config.api.version,
    timestamp: new Date().toISOString(),
  });
});

// Root endpoint
app.get('/', (_req: Request, res: Response) => {
  res.json({
    success: true,
    message: 'Screenshot API',
    version: config.api.version,
    documentation: '/docs',
    health: '/health',
    api: `/api/${config.api.version}`,
  });
});

// ============================================
// Error Handling
// ============================================

// 404 handler for unmatched routes
app.use(notFoundHandler);

// Global error handler
app.use(errorHandler);

// ============================================
// Extend Express Types
// ============================================

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      requestId?: string;
    }
  }
}

export default app;
