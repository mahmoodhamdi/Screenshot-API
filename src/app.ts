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
import redoc from 'redoc-express';
import YAML from 'yaml';

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
    exposedHeaders: [
      'X-Request-ID',
      'X-RateLimit-Limit',
      'X-RateLimit-Remaining',
      'X-RateLimit-Reset',
    ],
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
    morgan(config.server.env === 'development' ? 'dev' : 'combined', {
      stream: {
        write: (message: string) => {
          logger.http(message.trim());
        },
      },
      skip: (req: Request) => {
        // Skip health check logging to reduce noise
        return req.path === '/health' || req.path === '/api/v1/health';
      },
    })
  );
}

// ============================================
// API Documentation
// ============================================

// Dark mode CSS for Swagger UI
const swaggerDarkCSS = `
  /* Dark Mode Theme for Swagger UI */
  body { background-color: #1a1a2e !important; }
  .swagger-ui { background-color: #1a1a2e !important; }
  .swagger-ui .topbar { display: none !important; }
  .swagger-ui .scheme-container { background: #16213e !important; box-shadow: none !important; }
  .swagger-ui .opblock-tag { color: #e2e8f0 !important; border-bottom-color: #2d3748 !important; }
  .swagger-ui .opblock-tag:hover { background: rgba(255,255,255,0.05) !important; }
  .swagger-ui .opblock { background: #16213e !important; border-color: #2d3748 !important; }
  .swagger-ui .opblock .opblock-summary { border-color: #2d3748 !important; }
  .swagger-ui .opblock .opblock-summary-method { font-weight: 700 !important; }
  .swagger-ui .opblock.opblock-get { border-color: #4299e1 !important; background: rgba(66,153,225,0.1) !important; }
  .swagger-ui .opblock.opblock-get .opblock-summary-method { background: #4299e1 !important; }
  .swagger-ui .opblock.opblock-post { border-color: #48bb78 !important; background: rgba(72,187,120,0.1) !important; }
  .swagger-ui .opblock.opblock-post .opblock-summary-method { background: #48bb78 !important; }
  .swagger-ui .opblock.opblock-put { border-color: #ed8936 !important; background: rgba(237,137,54,0.1) !important; }
  .swagger-ui .opblock.opblock-put .opblock-summary-method { background: #ed8936 !important; }
  .swagger-ui .opblock.opblock-delete { border-color: #f56565 !important; background: rgba(245,101,101,0.1) !important; }
  .swagger-ui .opblock.opblock-delete .opblock-summary-method { background: #f56565 !important; }
  .swagger-ui .opblock.opblock-patch { border-color: #9f7aea !important; background: rgba(159,122,234,0.1) !important; }
  .swagger-ui .opblock.opblock-patch .opblock-summary-method { background: #9f7aea !important; }
  .swagger-ui .opblock .opblock-summary-path, .swagger-ui .opblock .opblock-summary-description { color: #e2e8f0 !important; }
  .swagger-ui .opblock-description-wrapper p, .swagger-ui .opblock-external-docs-wrapper p { color: #a0aec0 !important; }
  .swagger-ui .opblock-body pre { background: #0d1117 !important; color: #c9d1d9 !important; }
  .swagger-ui .opblock-section-header { background: #1e293b !important; }
  .swagger-ui .opblock-section-header h4 { color: #e2e8f0 !important; }
  .swagger-ui .parameter__name { color: #e2e8f0 !important; }
  .swagger-ui .parameter__type { color: #9f7aea !important; }
  .swagger-ui .parameter__in { color: #718096 !important; }
  .swagger-ui table thead tr th { color: #e2e8f0 !important; border-color: #2d3748 !important; }
  .swagger-ui table tbody tr td { color: #a0aec0 !important; border-color: #2d3748 !important; }
  .swagger-ui .model-box { background: #16213e !important; }
  .swagger-ui .model { color: #e2e8f0 !important; }
  .swagger-ui .model-title { color: #e2e8f0 !important; }
  .swagger-ui section.models { border-color: #2d3748 !important; }
  .swagger-ui section.models h4 { color: #e2e8f0 !important; }
  .swagger-ui section.models .model-container { background: #16213e !important; border-color: #2d3748 !important; }
  .swagger-ui .responses-inner h4, .swagger-ui .responses-inner h5 { color: #e2e8f0 !important; }
  .swagger-ui .response-col_status { color: #e2e8f0 !important; }
  .swagger-ui .response-col_description { color: #a0aec0 !important; }
  .swagger-ui .btn { background: #4299e1 !important; color: #fff !important; border-color: #4299e1 !important; }
  .swagger-ui .btn:hover { background: #3182ce !important; }
  .swagger-ui .btn.cancel { background: #f56565 !important; border-color: #f56565 !important; }
  .swagger-ui select { background: #16213e !important; color: #e2e8f0 !important; border-color: #2d3748 !important; }
  .swagger-ui input[type=text], .swagger-ui textarea { background: #16213e !important; color: #e2e8f0 !important; border-color: #2d3748 !important; }
  .swagger-ui .info .title { color: #e2e8f0 !important; }
  .swagger-ui .info .description, .swagger-ui .info p, .swagger-ui .info li { color: #a0aec0 !important; }
  .swagger-ui .info a { color: #63b3ed !important; }
  .swagger-ui .info code { background: #0d1117 !important; color: #c9d1d9 !important; }
  .swagger-ui .markdown code { background: #0d1117 !important; color: #c9d1d9 !important; }
  .swagger-ui .markdown pre { background: #0d1117 !important; }
  .swagger-ui .auth-wrapper { background: #16213e !important; }
  .swagger-ui .auth-container { border-color: #2d3748 !important; }
  .swagger-ui .auth-container h4 { color: #e2e8f0 !important; }
  .swagger-ui .dialog-ux .modal-ux { background: #1a1a2e !important; border-color: #2d3748 !important; }
  .swagger-ui .dialog-ux .modal-ux-header h3 { color: #e2e8f0 !important; }
  .swagger-ui .dialog-ux .modal-ux-content p { color: #a0aec0 !important; }
  .swagger-ui .dialog-ux .modal-ux-header { border-color: #2d3748 !important; }
  .swagger-ui .loading-container .loading::after { border-color: #4299e1 transparent #4299e1 transparent !important; }
  .swagger-ui .response-control-media-type__accept-message { color: #48bb78 !important; }
  .swagger-ui .tab li { color: #a0aec0 !important; }
  .swagger-ui .tab li.active { color: #e2e8f0 !important; }
  .swagger-ui .copy-to-clipboard { background: #16213e !important; }
  .swagger-ui .copy-to-clipboard button { background: #4299e1 !important; }
  .swagger-ui .microlight { background: #0d1117 !important; color: #c9d1d9 !important; }
  .swagger-ui .expand-operation svg { fill: #a0aec0 !important; }
  .swagger-ui .authorization__btn svg { fill: #a0aec0 !important; }
`;

// Swagger UI - API documentation with dark mode
app.use(
  '/docs',
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, {
    customCss: swaggerDarkCSS,
    customSiteTitle: 'Screenshot API Documentation',
    customfavIcon: '/favicon.ico',
    swaggerOptions: {
      persistAuthorization: true,
      displayRequestDuration: true,
      filter: true,
      showExtensions: true,
      tryItOutEnabled: true,
      docExpansion: 'list',
      defaultModelsExpandDepth: 2,
      defaultModelExpandDepth: 2,
      syntaxHighlight: {
        activate: true,
        theme: 'monokai',
      },
    },
  })
);

// OpenAPI specification JSON
app.get('/docs/openapi.json', (_req: Request, res: Response) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

// OpenAPI specification YAML
app.get('/docs/openapi.yaml', (_req: Request, res: Response) => {
  res.setHeader('Content-Type', 'application/x-yaml');
  res.send(YAML.stringify(swaggerSpec));
});

// Redoc - Alternative API documentation (dark theme)
app.get(
  '/redoc',
  redoc({
    title: 'Screenshot API Documentation',
    specUrl: '/docs/openapi.json',
    redocOptions: {
      theme: {
        colors: {
          primary: { main: '#4299e1' },
        },
        typography: {
          fontSize: '15px',
          fontFamily: 'Inter, system-ui, sans-serif',
          headings: { fontFamily: 'Inter, system-ui, sans-serif' },
          code: { fontSize: '13px', fontFamily: 'JetBrains Mono, monospace' },
        },
        sidebar: {
          width: '280px',
          backgroundColor: '#1a1a2e',
          textColor: '#e2e8f0',
        },
        rightPanel: {
          backgroundColor: '#0d1117',
        },
      },
      hideDownloadButton: false,
      hideHostname: false,
      expandResponses: '200,201',
      jsonSampleExpandLevel: 2,
      sortPropsAlphabetically: true,
      hideLoading: true,
      nativeScrollbars: true,
    },
  })
);

// Documentation index page
app.get('/api-docs', (_req: Request, res: Response) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Screenshot API - Documentation</title>
      <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body {
          font-family: 'Inter', system-ui, -apple-system, sans-serif;
          background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
          min-height: 100vh;
          color: #e2e8f0;
          line-height: 1.6;
        }
        .container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 40px 20px;
        }
        header {
          text-align: center;
          padding: 60px 0;
        }
        h1 {
          font-size: 3rem;
          font-weight: 700;
          margin-bottom: 16px;
          background: linear-gradient(90deg, #4299e1, #9f7aea);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        .subtitle {
          font-size: 1.25rem;
          color: #a0aec0;
          max-width: 600px;
          margin: 0 auto 40px;
        }
        .docs-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 24px;
          margin-bottom: 60px;
        }
        .doc-card {
          background: rgba(22, 33, 62, 0.8);
          border: 1px solid #2d3748;
          border-radius: 16px;
          padding: 32px;
          transition: all 0.3s ease;
          text-decoration: none;
          color: inherit;
        }
        .doc-card:hover {
          transform: translateY(-4px);
          border-color: #4299e1;
          box-shadow: 0 20px 40px rgba(0,0,0,0.3);
        }
        .doc-card h2 {
          font-size: 1.5rem;
          margin-bottom: 12px;
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .doc-card p {
          color: #a0aec0;
          margin-bottom: 20px;
        }
        .doc-card .badge {
          display: inline-block;
          background: rgba(66, 153, 225, 0.2);
          color: #4299e1;
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 0.875rem;
          font-weight: 500;
        }
        .doc-card.swagger .badge { background: rgba(72, 187, 120, 0.2); color: #48bb78; }
        .doc-card.redoc .badge { background: rgba(237, 137, 54, 0.2); color: #ed8936; }
        .doc-card.json .badge { background: rgba(159, 122, 234, 0.2); color: #9f7aea; }
        .doc-card.yaml .badge { background: rgba(245, 101, 101, 0.2); color: #f56565; }
        .features {
          background: rgba(22, 33, 62, 0.5);
          border-radius: 16px;
          padding: 40px;
          margin-bottom: 40px;
        }
        .features h3 {
          font-size: 1.75rem;
          margin-bottom: 24px;
          text-align: center;
        }
        .feature-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 20px;
        }
        .feature {
          text-align: center;
          padding: 20px;
        }
        .feature-icon {
          font-size: 2.5rem;
          margin-bottom: 12px;
        }
        .feature h4 { margin-bottom: 8px; }
        .feature p { color: #a0aec0; font-size: 0.9rem; }
        footer {
          text-align: center;
          padding: 40px 0;
          color: #718096;
          font-size: 0.875rem;
        }
        footer a { color: #4299e1; text-decoration: none; }
        @media (max-width: 768px) {
          h1 { font-size: 2rem; }
          .subtitle { font-size: 1rem; }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <header>
          <h1>Screenshot API</h1>
          <p class="subtitle">Professional screenshot capture API powered by Puppeteer. Capture high-quality screenshots of any website with customizable options.</p>
        </header>

        <div class="docs-grid">
          <a href="/docs" class="doc-card swagger">
            <h2>📚 Swagger UI</h2>
            <p>Interactive API documentation with try-it-out functionality. Test endpoints directly in your browser.</p>
            <span class="badge">Interactive</span>
          </a>

          <a href="/redoc" class="doc-card redoc">
            <h2>📖 ReDoc</h2>
            <p>Clean, responsive, three-panel documentation. Great for reading and exploring the API structure.</p>
            <span class="badge">Readable</span>
          </a>

          <a href="/docs/openapi.json" class="doc-card json">
            <h2>📋 OpenAPI JSON</h2>
            <p>Download the OpenAPI 3.0 specification in JSON format. Import into Postman, Insomnia, or other tools.</p>
            <span class="badge">Exportable</span>
          </a>

          <a href="/docs/openapi.yaml" class="doc-card yaml">
            <h2>📄 OpenAPI YAML</h2>
            <p>Download the OpenAPI 3.0 specification in YAML format. Human-readable and easy to edit.</p>
            <span class="badge">Portable</span>
          </a>
        </div>

        <div class="features">
          <h3>API Features</h3>
          <div class="feature-grid">
            <div class="feature">
              <div class="feature-icon">📸</div>
              <h4>Screenshots</h4>
              <p>Capture any website up to 8K resolution</p>
            </div>
            <div class="feature">
              <div class="feature-icon">🔐</div>
              <h4>Authentication</h4>
              <p>JWT tokens & API keys</p>
            </div>
            <div class="feature">
              <div class="feature-icon">⚡</div>
              <h4>Fast</h4>
              <p>Optimized Puppeteer engine</p>
            </div>
            <div class="feature">
              <div class="feature-icon">📊</div>
              <h4>Analytics</h4>
              <p>Detailed usage statistics</p>
            </div>
            <div class="feature">
              <div class="feature-icon">🔔</div>
              <h4>Webhooks</h4>
              <p>Async notifications</p>
            </div>
            <div class="feature">
              <div class="feature-icon">💳</div>
              <h4>Subscriptions</h4>
              <p>Flexible pricing plans</p>
            </div>
          </div>
        </div>

        <footer>
          <p>Built with ❤️ by <a href="https://github.com/mahmoodhamdi">Mahmood Hamdi</a></p>
          <p style="margin-top: 8px;">API Version: ${config.api.version}</p>
        </footer>
      </div>
    </body>
    </html>
  `);
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
