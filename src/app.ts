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
import {
  generatePostmanCollection,
  generateInsomniaCollection,
  generateBrunoCollection,
} from '@utils/docs/collection-generator';
import { getAllExamples } from '@utils/docs/code-generator';
import { generateLandingPage } from './views/landing';
import { generateAuthPage, AuthPageType } from './views/auth';

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
        styleSrc: [
          "'self'",
          "'unsafe-inline'",
          'https://cdnjs.cloudflare.com',
          'https://fonts.googleapis.com',
          'https://unpkg.com',
        ],
        scriptSrc: [
          "'self'",
          "'unsafe-inline'",
          "'unsafe-eval'",
          'https://cdnjs.cloudflare.com',
          'https://unpkg.com',
        ],
        scriptSrcAttr: ["'unsafe-inline'"],
        fontSrc: ["'self'", 'https://fonts.gstatic.com', 'https://cdnjs.cloudflare.com', 'data:'],
        imgSrc: [
          "'self'",
          'data:',
          'blob:',
          'https://validator.swagger.io',
          'https://cdnjs.cloudflare.com',
        ],
        connectSrc: ["'self'", 'https://fonts.googleapis.com', 'https://fonts.gstatic.com'],
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

// OpenAPI specification JSON (must be before Swagger UI)
app.get('/docs/openapi.json', (_req: Request, res: Response) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

// OpenAPI specification YAML (must be before Swagger UI)
app.get('/docs/openapi.yaml', (_req: Request, res: Response) => {
  res.setHeader('Content-Type', 'application/x-yaml');
  res.send(YAML.stringify(swaggerSpec));
});

// Collection exports (must be before Swagger UI)
app.get('/docs/postman.json', (_req: Request, res: Response) => {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader(
    'Content-Disposition',
    'attachment; filename="screenshot-api.postman_collection.json"'
  );
  res.json(generatePostmanCollection());
});

app.get('/docs/insomnia.json', (_req: Request, res: Response) => {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Content-Disposition', 'attachment; filename="screenshot-api.insomnia.json"');
  res.json(generateInsomniaCollection());
});

app.get('/docs/bruno.json', (_req: Request, res: Response) => {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Content-Disposition', 'attachment; filename="screenshot-api.bruno.json"');
  res.json(generateBrunoCollection());
});

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
// Developer Portal
// ============================================

app.get('/developer', (_req: Request, res: Response) => {
  const examples = getAllExamples();

  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Screenshot API - Developer Portal</title>
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/themes/prism-tomorrow.min.css">
      <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        :root {
          --bg-primary: #0d1117;
          --bg-secondary: #161b22;
          --bg-tertiary: #21262d;
          --bg-card: #1c2128;
          --text-primary: #f0f6fc;
          --text-secondary: #8b949e;
          --text-muted: #6e7681;
          --accent-blue: #58a6ff;
          --accent-green: #3fb950;
          --accent-purple: #a371f7;
          --accent-orange: #d29922;
          --accent-red: #f85149;
          --accent-cyan: #39c5cf;
          --border-color: #30363d;
          --border-hover: #484f58;
        }
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Noto Sans', Helvetica, Arial, sans-serif;
          background: var(--bg-primary);
          color: var(--text-primary);
          line-height: 1.6;
          min-height: 100vh;
        }
        a { color: var(--accent-blue); text-decoration: none; }
        a:hover { text-decoration: underline; }
        code { font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace; }

        /* Navigation */
        .nav {
          background: var(--bg-secondary);
          border-bottom: 1px solid var(--border-color);
          padding: 16px 0;
          position: sticky;
          top: 0;
          z-index: 100;
        }
        .nav-container {
          max-width: 1400px;
          margin: 0 auto;
          padding: 0 24px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .nav-brand {
          font-size: 1.25rem;
          font-weight: 600;
          color: var(--text-primary);
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .nav-brand i { color: var(--accent-blue); }
        .nav-links {
          display: flex;
          gap: 24px;
          list-style: none;
        }
        .nav-links a {
          color: var(--text-secondary);
          font-size: 0.9rem;
          padding: 8px 0;
          transition: color 0.2s;
        }
        .nav-links a:hover, .nav-links a.active { color: var(--text-primary); text-decoration: none; }

        /* Container */
        .container {
          max-width: 1400px;
          margin: 0 auto;
          padding: 0 24px;
        }

        /* Hero */
        .hero {
          text-align: center;
          padding: 80px 24px;
          background: linear-gradient(180deg, var(--bg-secondary) 0%, var(--bg-primary) 100%);
        }
        .hero h1 {
          font-size: 3rem;
          font-weight: 800;
          margin-bottom: 16px;
          background: linear-gradient(90deg, var(--accent-blue), var(--accent-purple));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .hero p {
          font-size: 1.25rem;
          color: var(--text-secondary);
          max-width: 600px;
          margin: 0 auto 32px;
        }
        .hero-buttons {
          display: flex;
          gap: 16px;
          justify-content: center;
          flex-wrap: wrap;
        }
        .btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 12px 24px;
          border-radius: 8px;
          font-weight: 600;
          font-size: 0.95rem;
          transition: all 0.2s;
          border: none;
          cursor: pointer;
        }
        .btn-primary {
          background: var(--accent-blue);
          color: #fff;
        }
        .btn-primary:hover { background: #4c9aed; text-decoration: none; }
        .btn-secondary {
          background: var(--bg-tertiary);
          color: var(--text-primary);
          border: 1px solid var(--border-color);
        }
        .btn-secondary:hover { border-color: var(--border-hover); text-decoration: none; }

        /* Section */
        .section {
          padding: 60px 0;
        }
        .section-header {
          text-align: center;
          margin-bottom: 48px;
        }
        .section-header h2 {
          font-size: 2rem;
          margin-bottom: 12px;
        }
        .section-header p {
          color: var(--text-secondary);
          max-width: 600px;
          margin: 0 auto;
        }

        /* Quick Start Steps */
        .steps {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 24px;
          margin-bottom: 48px;
        }
        .step {
          background: var(--bg-secondary);
          border: 1px solid var(--border-color);
          border-radius: 12px;
          padding: 24px;
        }
        .step-number {
          width: 32px;
          height: 32px;
          background: var(--accent-blue);
          color: #fff;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 0.9rem;
          margin-bottom: 16px;
        }
        .step h3 { font-size: 1.1rem; margin-bottom: 8px; }
        .step p { color: var(--text-secondary); font-size: 0.9rem; }
        .step code {
          display: block;
          background: var(--bg-primary);
          padding: 12px;
          border-radius: 6px;
          margin-top: 12px;
          font-size: 0.85rem;
          color: var(--accent-green);
          overflow-x: auto;
        }

        /* Code Examples */
        .code-section {
          background: var(--bg-secondary);
          border-radius: 12px;
          border: 1px solid var(--border-color);
          overflow: hidden;
          margin-bottom: 32px;
        }
        .code-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px 20px;
          border-bottom: 1px solid var(--border-color);
          background: var(--bg-tertiary);
        }
        .code-title {
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .code-title .method {
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 0.75rem;
          font-weight: 700;
        }
        .code-title .method.post { background: rgba(63, 185, 80, 0.2); color: var(--accent-green); }
        .code-title .method.get { background: rgba(88, 166, 255, 0.2); color: var(--accent-blue); }
        .code-title .method.delete { background: rgba(248, 81, 73, 0.2); color: var(--accent-red); }

        /* Language Tabs */
        .lang-tabs {
          display: flex;
          gap: 0;
          background: var(--bg-tertiary);
          padding: 0 16px;
          overflow-x: auto;
          border-bottom: 1px solid var(--border-color);
        }
        .lang-tab {
          padding: 12px 16px;
          color: var(--text-secondary);
          font-size: 0.85rem;
          cursor: pointer;
          border-bottom: 2px solid transparent;
          white-space: nowrap;
          display: flex;
          align-items: center;
          gap: 6px;
          transition: all 0.2s;
        }
        .lang-tab:hover { color: var(--text-primary); }
        .lang-tab.active {
          color: var(--text-primary);
          border-bottom-color: var(--accent-blue);
        }
        .lang-tab i { font-size: 1rem; }

        /* Code Block */
        .code-blocks { position: relative; }
        .code-block {
          display: none;
          position: relative;
        }
        .code-block.active { display: block; }
        .code-block pre {
          margin: 0;
          padding: 20px;
          overflow-x: auto;
          font-size: 0.85rem;
          line-height: 1.5;
          background: var(--bg-primary) !important;
        }
        .copy-btn {
          position: absolute;
          top: 12px;
          right: 12px;
          background: var(--bg-tertiary);
          border: 1px solid var(--border-color);
          color: var(--text-secondary);
          padding: 6px 12px;
          border-radius: 6px;
          font-size: 0.8rem;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 6px;
          transition: all 0.2s;
          z-index: 10;
        }
        .copy-btn:hover {
          background: var(--bg-secondary);
          color: var(--text-primary);
        }
        .copy-btn.copied {
          background: var(--accent-green);
          color: #fff;
          border-color: var(--accent-green);
        }

        /* Install Command */
        .install-cmd {
          background: var(--bg-tertiary);
          padding: 12px 16px;
          border-top: 1px solid var(--border-color);
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 0.85rem;
        }
        .install-cmd code {
          color: var(--accent-orange);
        }

        /* SDK Cards */
        .sdk-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 24px;
        }
        .sdk-card {
          background: var(--bg-secondary);
          border: 1px solid var(--border-color);
          border-radius: 12px;
          padding: 24px;
          transition: all 0.2s;
        }
        .sdk-card:hover {
          border-color: var(--border-hover);
          transform: translateY(-2px);
        }
        .sdk-header {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 16px;
        }
        .sdk-icon {
          width: 48px;
          height: 48px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.5rem;
        }
        .sdk-icon.js { background: rgba(247, 223, 30, 0.2); color: #f7df1e; }
        .sdk-icon.python { background: rgba(55, 118, 171, 0.2); color: #3776ab; }
        .sdk-icon.php { background: rgba(119, 123, 180, 0.2); color: #777bb4; }
        .sdk-icon.ruby { background: rgba(204, 52, 45, 0.2); color: #cc342d; }
        .sdk-icon.go { background: rgba(0, 173, 216, 0.2); color: #00add8; }
        .sdk-icon.java { background: rgba(237, 139, 0, 0.2); color: #ed8b00; }
        .sdk-icon.csharp { background: rgba(81, 43, 212, 0.2); color: #512bd4; }
        .sdk-icon.curl { background: rgba(7, 53, 81, 0.2); color: var(--accent-cyan); }
        .sdk-name { font-size: 1.1rem; font-weight: 600; }
        .sdk-desc { color: var(--text-secondary); font-size: 0.9rem; margin-bottom: 16px; }
        .sdk-install {
          background: var(--bg-primary);
          padding: 12px;
          border-radius: 6px;
          font-family: monospace;
          font-size: 0.85rem;
          color: var(--accent-green);
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .sdk-install button {
          background: none;
          border: none;
          color: var(--text-secondary);
          cursor: pointer;
          padding: 4px;
        }
        .sdk-install button:hover { color: var(--text-primary); }

        /* Export Cards */
        .export-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 20px;
        }
        .export-card {
          background: var(--bg-secondary);
          border: 1px solid var(--border-color);
          border-radius: 12px;
          padding: 24px;
          display: flex;
          align-items: center;
          gap: 16px;
          transition: all 0.2s;
          text-decoration: none;
          color: inherit;
        }
        .export-card:hover {
          border-color: var(--accent-blue);
          transform: translateY(-2px);
          text-decoration: none;
        }
        .export-icon {
          width: 48px;
          height: 48px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.25rem;
          background: var(--bg-tertiary);
        }
        .export-info h4 { font-size: 1rem; margin-bottom: 4px; }
        .export-info p { color: var(--text-secondary); font-size: 0.85rem; }

        /* Docs Links */
        .docs-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 24px;
        }
        .docs-card {
          background: var(--bg-secondary);
          border: 1px solid var(--border-color);
          border-radius: 12px;
          padding: 24px;
          transition: all 0.2s;
          text-decoration: none;
          color: inherit;
        }
        .docs-card:hover {
          border-color: var(--accent-blue);
          text-decoration: none;
        }
        .docs-card h3 {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 8px;
        }
        .docs-card p { color: var(--text-secondary); font-size: 0.9rem; }
        .docs-card .badge {
          font-size: 0.75rem;
          padding: 4px 8px;
          border-radius: 12px;
          background: rgba(88, 166, 255, 0.2);
          color: var(--accent-blue);
        }

        /* Footer */
        footer {
          background: var(--bg-secondary);
          border-top: 1px solid var(--border-color);
          padding: 40px 24px;
          margin-top: 60px;
          text-align: center;
          color: var(--text-secondary);
        }
        footer a { color: var(--accent-blue); }

        /* Responsive */
        @media (max-width: 768px) {
          .hero h1 { font-size: 2rem; }
          .hero p { font-size: 1rem; }
          .nav-links { display: none; }
          .section { padding: 40px 0; }
        }
      </style>
    </head>
    <body>
      <!-- Navigation -->
      <nav class="nav">
        <div class="nav-container">
          <a href="/" class="nav-brand">
            <i class="fas fa-camera"></i>
            Screenshot API
          </a>
          <ul class="nav-links">
            <li><a href="/developer" class="active">Developer Portal</a></li>
            <li><a href="/docs">Swagger UI</a></li>
            <li><a href="/redoc">ReDoc</a></li>
            <li><a href="/api-docs">Documentation</a></li>
          </ul>
        </div>
      </nav>

      <!-- Hero -->
      <section class="hero">
        <h1>Developer Portal</h1>
        <p>Everything you need to integrate the Screenshot API into your application. Code examples, SDKs, and comprehensive documentation.</p>
        <div class="hero-buttons">
          <a href="#quick-start" class="btn btn-primary">
            <i class="fas fa-rocket"></i> Quick Start
          </a>
          <a href="#code-examples" class="btn btn-secondary">
            <i class="fas fa-code"></i> View Examples
          </a>
        </div>
      </section>

      <!-- Quick Start -->
      <section id="quick-start" class="section">
        <div class="container">
          <div class="section-header">
            <h2>Quick Start</h2>
            <p>Get started with the Screenshot API in just a few minutes</p>
          </div>
          <div class="steps">
            <div class="step">
              <div class="step-number">1</div>
              <h3>Create an Account</h3>
              <p>Register for a free account to get started</p>
              <code>POST /api/v1/auth/register</code>
            </div>
            <div class="step">
              <div class="step-number">2</div>
              <h3>Get Your API Key</h3>
              <p>Create an API key from your dashboard</p>
              <code>POST /api/v1/auth/api-keys</code>
            </div>
            <div class="step">
              <div class="step-number">3</div>
              <h3>Capture Screenshots</h3>
              <p>Start capturing website screenshots</p>
              <code>POST /api/v1/screenshots</code>
            </div>
            <div class="step">
              <div class="step-number">4</div>
              <h3>View Analytics</h3>
              <p>Monitor your usage and performance</p>
              <code>GET /api/v1/analytics/overview</code>
            </div>
          </div>
        </div>
      </section>

      <!-- Code Examples -->
      <section id="code-examples" class="section" style="background: var(--bg-secondary);">
        <div class="container">
          <div class="section-header">
            <h2>Code Examples</h2>
            <p>Ready-to-use code snippets in your favorite programming language</p>
          </div>

          ${examples
            .map(
              (endpoint, idx) => `
            <div class="code-section" id="example-${idx}">
              <div class="code-header">
                <div class="code-title">
                  <span class="method ${endpoint.method.toLowerCase()}">${endpoint.method}</span>
                  <span>${endpoint.endpoint}</span>
                </div>
                <span style="color: var(--text-secondary); font-size: 0.9rem;">${endpoint.description}</span>
              </div>
              <div class="lang-tabs">
                ${endpoint.examples
                  .map(
                    (ex, i) => `
                  <div class="lang-tab ${i === 0 ? 'active' : ''}" onclick="switchTab(${idx}, ${i})" data-example="${idx}" data-tab="${i}">
                    <i class="${ex.icon}" style="color: ${ex.iconColor}"></i>
                    ${ex.label}
                  </div>
                `
                  )
                  .join('')}
              </div>
              <div class="code-blocks">
                ${endpoint.examples
                  .map(
                    (ex, i) => `
                  <div class="code-block ${i === 0 ? 'active' : ''}" data-example="${idx}" data-block="${i}">
                    <button class="copy-btn" onclick="copyCode(this)">
                      <i class="fas fa-copy"></i> Copy
                    </button>
                    <pre><code class="language-${ex.language === 'csharp' ? 'csharp' : ex.language}">${escapeHtml(ex.code)}</code></pre>
                  </div>
                `
                  )
                  .join('')}
              </div>
              ${
                endpoint.examples[0].installCommand
                  ? `
                <div class="install-cmd" id="install-${idx}">
                  <i class="fas fa-download" style="color: var(--text-secondary);"></i>
                  <span style="color: var(--text-secondary);">Install:</span>
                  <code>${endpoint.examples[0].installCommand}</code>
                </div>
              `
                  : ''
              }
            </div>
          `
            )
            .join('')}

        </div>
      </section>

      <!-- SDKs -->
      <section id="sdks" class="section">
        <div class="container">
          <div class="section-header">
            <h2>SDKs & Libraries</h2>
            <p>Use our official libraries or community SDKs for faster integration</p>
          </div>
          <div class="sdk-grid">
            <div class="sdk-card">
              <div class="sdk-header">
                <div class="sdk-icon js"><i class="fab fa-node-js"></i></div>
                <span class="sdk-name">Node.js / JavaScript</span>
              </div>
              <p class="sdk-desc">Official JavaScript SDK with TypeScript support. Works in Node.js and browsers.</p>
              <div class="sdk-install">
                <code>npm install axios</code>
                <button onclick="copyToClipboard('npm install axios', this)"><i class="fas fa-copy"></i></button>
              </div>
            </div>
            <div class="sdk-card">
              <div class="sdk-header">
                <div class="sdk-icon python"><i class="fab fa-python"></i></div>
                <span class="sdk-name">Python</span>
              </div>
              <p class="sdk-desc">Simple and intuitive Python client. Supports async operations with httpx.</p>
              <div class="sdk-install">
                <code>pip install requests</code>
                <button onclick="copyToClipboard('pip install requests', this)"><i class="fas fa-copy"></i></button>
              </div>
            </div>
            <div class="sdk-card">
              <div class="sdk-header">
                <div class="sdk-icon php"><i class="fab fa-php"></i></div>
                <span class="sdk-name">PHP</span>
              </div>
              <p class="sdk-desc">PHP library compatible with PHP 7.4+. Uses Guzzle HTTP client.</p>
              <div class="sdk-install">
                <code>composer require guzzlehttp/guzzle</code>
                <button onclick="copyToClipboard('composer require guzzlehttp/guzzle', this)"><i class="fas fa-copy"></i></button>
              </div>
            </div>
            <div class="sdk-card">
              <div class="sdk-header">
                <div class="sdk-icon ruby"><i class="fas fa-gem"></i></div>
                <span class="sdk-name">Ruby</span>
              </div>
              <p class="sdk-desc">Ruby gem for Rails and standalone applications. Simple API.</p>
              <div class="sdk-install">
                <code>gem install httparty</code>
                <button onclick="copyToClipboard('gem install httparty', this)"><i class="fas fa-copy"></i></button>
              </div>
            </div>
            <div class="sdk-card">
              <div class="sdk-header">
                <div class="sdk-icon go"><i class="fas fa-code"></i></div>
                <span class="sdk-name">Go</span>
              </div>
              <p class="sdk-desc">Native Go client with zero dependencies. Uses standard library.</p>
              <div class="sdk-install">
                <code>import "net/http"</code>
                <button onclick="copyToClipboard('import &quot;net/http&quot;', this)"><i class="fas fa-copy"></i></button>
              </div>
            </div>
            <div class="sdk-card">
              <div class="sdk-header">
                <div class="sdk-icon curl"><i class="fas fa-terminal"></i></div>
                <span class="sdk-name">cURL / HTTPie</span>
              </div>
              <p class="sdk-desc">Use command-line tools for quick testing and scripting.</p>
              <div class="sdk-install">
                <code>curl, http (HTTPie)</code>
                <button onclick="copyToClipboard('pip install httpie', this)"><i class="fas fa-copy"></i></button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Export Collections -->
      <section id="exports" class="section" style="background: var(--bg-secondary);">
        <div class="container">
          <div class="section-header">
            <h2>Import to Your Favorite Tool</h2>
            <p>Download ready-to-use collections for Postman, Insomnia, and more</p>
          </div>
          <div class="export-grid">
            <a href="/docs/postman.json" class="export-card" download>
              <div class="export-icon" style="color: #ff6c37;">
                <i class="fas fa-paper-plane"></i>
              </div>
              <div class="export-info">
                <h4>Postman Collection</h4>
                <p>Import directly into Postman v2.1</p>
              </div>
            </a>
            <a href="/docs/insomnia.json" class="export-card" download>
              <div class="export-icon" style="color: #7400e1;">
                <i class="fas fa-moon"></i>
              </div>
              <div class="export-info">
                <h4>Insomnia Export</h4>
                <p>Compatible with Insomnia v4</p>
              </div>
            </a>
            <a href="/docs/bruno.json" class="export-card" download>
              <div class="export-icon" style="color: #f4aa41;">
                <i class="fas fa-bolt"></i>
              </div>
              <div class="export-info">
                <h4>Bruno Collection</h4>
                <p>Open-source API client</p>
              </div>
            </a>
            <a href="/docs/openapi.json" class="export-card" download>
              <div class="export-icon" style="color: #6ba539;">
                <i class="fas fa-file-code"></i>
              </div>
              <div class="export-info">
                <h4>OpenAPI JSON</h4>
                <p>OpenAPI 3.0 specification</p>
              </div>
            </a>
            <a href="/docs/openapi.yaml" class="export-card" download>
              <div class="export-icon" style="color: #cb171e;">
                <i class="fas fa-file-alt"></i>
              </div>
              <div class="export-info">
                <h4>OpenAPI YAML</h4>
                <p>Human-readable format</p>
              </div>
            </a>
          </div>
        </div>
      </section>

      <!-- Documentation Links -->
      <section id="docs" class="section">
        <div class="container">
          <div class="section-header">
            <h2>Documentation</h2>
            <p>Explore our comprehensive API documentation</p>
          </div>
          <div class="docs-grid">
            <a href="/docs" class="docs-card">
              <h3>
                <i class="fas fa-book" style="color: var(--accent-green);"></i>
                Swagger UI
                <span class="badge">Interactive</span>
              </h3>
              <p>Interactive API documentation with try-it-out functionality. Test endpoints directly in your browser.</p>
            </a>
            <a href="/redoc" class="docs-card">
              <h3>
                <i class="fas fa-file-alt" style="color: var(--accent-orange);"></i>
                ReDoc
                <span class="badge">Readable</span>
              </h3>
              <p>Clean, responsive, three-panel documentation. Great for reading and exploring the API structure.</p>
            </a>
            <a href="/api-docs" class="docs-card">
              <h3>
                <i class="fas fa-home" style="color: var(--accent-blue);"></i>
                Documentation Hub
              </h3>
              <p>Central hub for all documentation resources and API information.</p>
            </a>
          </div>
        </div>
      </section>

      <!-- Footer -->
      <footer>
        <p>Built with ❤️ by <a href="https://github.com/mahmoodhamdi">Mahmood Hamdi</a></p>
        <p style="margin-top: 8px; font-size: 0.85rem;">API Version: ${config.api.version} | <a href="mailto:hmdy7486@gmail.com">Contact</a></p>
      </footer>

      <script src="https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/prism.min.js"></script>
      <script src="https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/components/prism-javascript.min.js"></script>
      <script src="https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/components/prism-python.min.js"></script>
      <script src="https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/components/prism-php.min.js"></script>
      <script src="https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/components/prism-ruby.min.js"></script>
      <script src="https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/components/prism-go.min.js"></script>
      <script src="https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/components/prism-java.min.js"></script>
      <script src="https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/components/prism-csharp.min.js"></script>
      <script src="https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/components/prism-bash.min.js"></script>
      <script>
        // Switch language tabs
        function switchTab(exampleIdx, tabIdx) {
          // Update tabs
          document.querySelectorAll('.lang-tab[data-example="' + exampleIdx + '"]').forEach(tab => {
            tab.classList.remove('active');
          });
          document.querySelector('.lang-tab[data-example="' + exampleIdx + '"][data-tab="' + tabIdx + '"]').classList.add('active');

          // Update code blocks
          document.querySelectorAll('.code-block[data-example="' + exampleIdx + '"]').forEach(block => {
            block.classList.remove('active');
          });
          document.querySelector('.code-block[data-example="' + exampleIdx + '"][data-block="' + tabIdx + '"]').classList.add('active');

          // Re-highlight
          Prism.highlightAll();
        }

        // Copy code to clipboard
        function copyCode(btn) {
          const codeBlock = btn.parentElement.querySelector('code');
          const text = codeBlock.textContent;
          copyToClipboard(text, btn);
        }

        function copyToClipboard(text, btn) {
          navigator.clipboard.writeText(text).then(() => {
            const originalHTML = btn.innerHTML;
            btn.innerHTML = '<i class="fas fa-check"></i> Copied!';
            btn.classList.add('copied');
            setTimeout(() => {
              btn.innerHTML = originalHTML;
              btn.classList.remove('copied');
            }, 2000);
          });
        }

        // Highlight code on load
        document.addEventListener('DOMContentLoaded', () => {
          Prism.highlightAll();
        });
      </script>
    </body>
    </html>
  `);
});

// Helper function to escape HTML
function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

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

// Root endpoint - Landing page
app.get('/', (_req: Request, res: Response) => {
  const landingPage = generateLandingPage({
    title: 'Screenshot API - Capture Any Website Instantly',
    description:
      'Professional screenshot API for developers. Capture websites, generate thumbnails, and export to PDF with a simple API call.',
    baseUrl:
      config.server.env === 'production'
        ? 'https://api.screenshot.dev'
        : `http://localhost:${config.server.port}`,
  });
  res.setHeader('Content-Type', 'text/html');
  res.send(landingPage);
});

// ============================================
// Authentication Pages
// ============================================

// Auth page routes
const authPages: AuthPageType[] = [
  'login',
  'register',
  'forgot-password',
  'reset-password',
  'verify-email',
];

authPages.forEach((page) => {
  app.get(`/${page}`, (req: Request, res: Response) => {
    const baseUrl =
      config.server.env === 'production'
        ? 'https://api.screenshot.dev'
        : `http://localhost:${config.server.port}`;

    // Get token and email from query params for reset-password and verify-email pages
    const token = req.query.token as string | undefined;
    const email = req.query.email as string | undefined;

    const authPage = generateAuthPage(page, {
      baseUrl,
      token,
      email,
    });
    res.setHeader('Content-Type', 'text/html');
    res.send(authPage);
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
