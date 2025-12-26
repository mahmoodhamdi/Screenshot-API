/**
 * Collection Generator Utility
 * Generates Postman, Insomnia, and Bruno collections from OpenAPI spec
 */

const API_BASE_URL = process.env.API_URL || 'https://api.screenshot-api.com';

interface PostmanCollection {
  info: {
    name: string;
    description: string;
    schema: string;
    version: string;
  };
  auth: {
    type: string;
    apikey: Array<{ key: string; value: string; type: string }>;
  };
  variable: Array<{ key: string; value: string; type: string }>;
  item: PostmanFolder[];
}

interface PostmanFolder {
  name: string;
  description?: string;
  item: PostmanRequest[];
}

interface PostmanRequest {
  name: string;
  request: {
    method: string;
    header: Array<{ key: string; value: string; type: string }>;
    auth?: {
      type: string;
      apikey?: Array<{ key: string; value: string; type: string }>;
      bearer?: Array<{ key: string; value: string; type: string }>;
    };
    url: {
      raw: string;
      host: string[];
      path: string[];
      query?: Array<{ key: string; value: string; disabled?: boolean }>;
    };
    body?: {
      mode: string;
      raw: string;
      options: { raw: { language: string } };
    };
    description?: string;
  };
  response: Array<{
    name: string;
    status: string;
    code: number;
    body: string;
  }>;
}

/**
 * Generate Postman Collection v2.1
 */
export function generatePostmanCollection(): PostmanCollection {
  return {
    info: {
      name: 'Screenshot API',
      description:
        'Professional screenshot capture API powered by Puppeteer. Capture high-quality screenshots of any website with customizable options.',
      schema: 'https://schema.getpostman.com/json/collection/v2.1.0/collection.json',
      version: '1.0.0',
    },
    auth: {
      type: 'apikey',
      apikey: [
        { key: 'key', value: 'X-API-Key', type: 'string' },
        { key: 'value', value: '{{api_key}}', type: 'string' },
        { key: 'in', value: 'header', type: 'string' },
      ],
    },
    variable: [
      { key: 'base_url', value: API_BASE_URL, type: 'string' },
      { key: 'api_key', value: 'your_api_key_here', type: 'string' },
      { key: 'jwt_token', value: 'your_jwt_token_here', type: 'string' },
    ],
    item: [
      generateAuthFolder(),
      generateScreenshotsFolder(),
      generateSubscriptionsFolder(),
      generateAnalyticsFolder(),
    ],
  };
}

function generateAuthFolder(): PostmanFolder {
  return {
    name: 'Authentication',
    description: 'User registration, login, and API key management',
    item: [
      {
        name: 'Register User',
        request: {
          method: 'POST',
          header: [{ key: 'Content-Type', value: 'application/json', type: 'text' }],
          url: {
            raw: '{{base_url}}/api/v1/auth/register',
            host: ['{{base_url}}'],
            path: ['api', 'v1', 'auth', 'register'],
          },
          body: {
            mode: 'raw',
            raw: JSON.stringify(
              {
                name: 'John Doe',
                email: 'john@example.com',
                password: 'securePassword123',
              },
              null,
              2
            ),
            options: { raw: { language: 'json' } },
          },
          description: 'Create a new user account',
        },
        response: [
          {
            name: 'Success',
            status: 'Created',
            code: 201,
            body: JSON.stringify(
              {
                success: true,
                data: {
                  user: { id: '...', name: 'John Doe', email: 'john@example.com' },
                  tokens: { accessToken: '...', refreshToken: '...' },
                },
              },
              null,
              2
            ),
          },
        ],
      },
      {
        name: 'Login User',
        request: {
          method: 'POST',
          header: [{ key: 'Content-Type', value: 'application/json', type: 'text' }],
          url: {
            raw: '{{base_url}}/api/v1/auth/login',
            host: ['{{base_url}}'],
            path: ['api', 'v1', 'auth', 'login'],
          },
          body: {
            mode: 'raw',
            raw: JSON.stringify(
              {
                email: 'john@example.com',
                password: 'securePassword123',
              },
              null,
              2
            ),
            options: { raw: { language: 'json' } },
          },
          description: 'Login with email and password',
        },
        response: [],
      },
      {
        name: 'Get Current User',
        request: {
          method: 'GET',
          header: [],
          auth: {
            type: 'bearer',
            bearer: [{ key: 'token', value: '{{jwt_token}}', type: 'string' }],
          },
          url: {
            raw: '{{base_url}}/api/v1/auth/me',
            host: ['{{base_url}}'],
            path: ['api', 'v1', 'auth', 'me'],
          },
          description: 'Get the currently authenticated user',
        },
        response: [],
      },
      {
        name: 'Create API Key',
        request: {
          method: 'POST',
          header: [{ key: 'Content-Type', value: 'application/json', type: 'text' }],
          auth: {
            type: 'bearer',
            bearer: [{ key: 'token', value: '{{jwt_token}}', type: 'string' }],
          },
          url: {
            raw: '{{base_url}}/api/v1/auth/api-keys',
            host: ['{{base_url}}'],
            path: ['api', 'v1', 'auth', 'api-keys'],
          },
          body: {
            mode: 'raw',
            raw: JSON.stringify(
              {
                name: 'Production API Key',
                permissions: ['screenshots:create', 'screenshots:read'],
              },
              null,
              2
            ),
            options: { raw: { language: 'json' } },
          },
          description: 'Create a new API key for programmatic access',
        },
        response: [],
      },
      {
        name: 'List API Keys',
        request: {
          method: 'GET',
          header: [],
          auth: {
            type: 'bearer',
            bearer: [{ key: 'token', value: '{{jwt_token}}', type: 'string' }],
          },
          url: {
            raw: '{{base_url}}/api/v1/auth/api-keys',
            host: ['{{base_url}}'],
            path: ['api', 'v1', 'auth', 'api-keys'],
          },
          description: 'List all API keys for the current user',
        },
        response: [],
      },
      {
        name: 'Delete API Key',
        request: {
          method: 'DELETE',
          header: [],
          auth: {
            type: 'bearer',
            bearer: [{ key: 'token', value: '{{jwt_token}}', type: 'string' }],
          },
          url: {
            raw: '{{base_url}}/api/v1/auth/api-keys/:id',
            host: ['{{base_url}}'],
            path: ['api', 'v1', 'auth', 'api-keys', ':id'],
          },
          description: 'Delete an API key by ID',
        },
        response: [],
      },
    ],
  };
}

function generateScreenshotsFolder(): PostmanFolder {
  return {
    name: 'Screenshots',
    description: 'Capture and manage website screenshots',
    item: [
      {
        name: 'Capture Screenshot',
        request: {
          method: 'POST',
          header: [{ key: 'Content-Type', value: 'application/json', type: 'text' }],
          url: {
            raw: '{{base_url}}/api/v1/screenshots',
            host: ['{{base_url}}'],
            path: ['api', 'v1', 'screenshots'],
          },
          body: {
            mode: 'raw',
            raw: JSON.stringify(
              {
                url: 'https://example.com',
                width: 1920,
                height: 1080,
                format: 'png',
                fullPage: false,
                quality: 90,
                delay: 0,
                darkMode: false,
                blockAds: true,
              },
              null,
              2
            ),
            options: { raw: { language: 'json' } },
          },
          description: 'Capture a screenshot of a website',
        },
        response: [
          {
            name: 'Success',
            status: 'OK',
            code: 200,
            body: JSON.stringify(
              {
                success: true,
                data: {
                  id: '507f1f77bcf86cd799439011',
                  result: {
                    status: 'completed',
                    url: 'https://storage.example.com/screenshots/abc123.png',
                    size: 245678,
                    duration: 2340,
                  },
                },
              },
              null,
              2
            ),
          },
        ],
      },
      {
        name: 'Capture Full Page Screenshot',
        request: {
          method: 'POST',
          header: [{ key: 'Content-Type', value: 'application/json', type: 'text' }],
          url: {
            raw: '{{base_url}}/api/v1/screenshots',
            host: ['{{base_url}}'],
            path: ['api', 'v1', 'screenshots'],
          },
          body: {
            mode: 'raw',
            raw: JSON.stringify(
              {
                url: 'https://example.com',
                width: 1920,
                fullPage: true,
                format: 'png',
              },
              null,
              2
            ),
            options: { raw: { language: 'json' } },
          },
          description: 'Capture a full-page screenshot (scrolls entire page)',
        },
        response: [],
      },
      {
        name: 'Capture Element Screenshot',
        request: {
          method: 'POST',
          header: [{ key: 'Content-Type', value: 'application/json', type: 'text' }],
          url: {
            raw: '{{base_url}}/api/v1/screenshots',
            host: ['{{base_url}}'],
            path: ['api', 'v1', 'screenshots'],
          },
          body: {
            mode: 'raw',
            raw: JSON.stringify(
              {
                url: 'https://example.com',
                selector: '#main-content',
                format: 'png',
              },
              null,
              2
            ),
            options: { raw: { language: 'json' } },
          },
          description: 'Capture a specific element using CSS selector',
        },
        response: [],
      },
      {
        name: 'List Screenshots',
        request: {
          method: 'GET',
          header: [],
          url: {
            raw: '{{base_url}}/api/v1/screenshots?page=1&limit=10',
            host: ['{{base_url}}'],
            path: ['api', 'v1', 'screenshots'],
            query: [
              { key: 'page', value: '1' },
              { key: 'limit', value: '10' },
              { key: 'sortBy', value: 'createdAt', disabled: true },
              { key: 'sortOrder', value: 'desc', disabled: true },
            ],
          },
          description: 'List all screenshots with pagination',
        },
        response: [],
      },
      {
        name: 'Get Screenshot by ID',
        request: {
          method: 'GET',
          header: [],
          url: {
            raw: '{{base_url}}/api/v1/screenshots/:id',
            host: ['{{base_url}}'],
            path: ['api', 'v1', 'screenshots', ':id'],
          },
          description: 'Get a specific screenshot by ID',
        },
        response: [],
      },
      {
        name: 'Delete Screenshot',
        request: {
          method: 'DELETE',
          header: [],
          url: {
            raw: '{{base_url}}/api/v1/screenshots/:id',
            host: ['{{base_url}}'],
            path: ['api', 'v1', 'screenshots', ':id'],
          },
          description: 'Delete a screenshot by ID',
        },
        response: [],
      },
    ],
  };
}

function generateSubscriptionsFolder(): PostmanFolder {
  return {
    name: 'Subscriptions',
    description: 'Manage subscription plans and payments',
    item: [
      {
        name: 'Get Subscription Plans',
        request: {
          method: 'GET',
          header: [],
          url: {
            raw: '{{base_url}}/api/v1/subscriptions/plans',
            host: ['{{base_url}}'],
            path: ['api', 'v1', 'subscriptions', 'plans'],
          },
          description: 'Get all available subscription plans',
        },
        response: [],
      },
      {
        name: 'Create Checkout Session',
        request: {
          method: 'POST',
          header: [{ key: 'Content-Type', value: 'application/json', type: 'text' }],
          auth: {
            type: 'bearer',
            bearer: [{ key: 'token', value: '{{jwt_token}}', type: 'string' }],
          },
          url: {
            raw: '{{base_url}}/api/v1/subscriptions/checkout',
            host: ['{{base_url}}'],
            path: ['api', 'v1', 'subscriptions', 'checkout'],
          },
          body: {
            mode: 'raw',
            raw: JSON.stringify(
              {
                planId: 'professional',
                successUrl: 'https://myapp.com/success',
                cancelUrl: 'https://myapp.com/cancel',
              },
              null,
              2
            ),
            options: { raw: { language: 'json' } },
          },
          description: 'Create a Stripe checkout session for subscription',
        },
        response: [],
      },
      {
        name: 'Get Customer Portal',
        request: {
          method: 'POST',
          header: [],
          auth: {
            type: 'bearer',
            bearer: [{ key: 'token', value: '{{jwt_token}}', type: 'string' }],
          },
          url: {
            raw: '{{base_url}}/api/v1/subscriptions/portal',
            host: ['{{base_url}}'],
            path: ['api', 'v1', 'subscriptions', 'portal'],
          },
          description: 'Get Stripe customer portal URL for managing subscription',
        },
        response: [],
      },
      {
        name: 'Get Usage Stats',
        request: {
          method: 'GET',
          header: [],
          url: {
            raw: '{{base_url}}/api/v1/subscriptions/usage',
            host: ['{{base_url}}'],
            path: ['api', 'v1', 'subscriptions', 'usage'],
          },
          description: 'Get current usage statistics for your subscription',
        },
        response: [],
      },
    ],
  };
}

function generateAnalyticsFolder(): PostmanFolder {
  return {
    name: 'Analytics',
    description: 'Usage analytics and statistics',
    item: [
      {
        name: 'Get Overview',
        request: {
          method: 'GET',
          header: [],
          url: {
            raw: '{{base_url}}/api/v1/analytics/overview?period=30d',
            host: ['{{base_url}}'],
            path: ['api', 'v1', 'analytics', 'overview'],
            query: [{ key: 'period', value: '30d' }],
          },
          description: 'Get analytics overview (7d, 30d, 90d)',
        },
        response: [],
      },
      {
        name: 'Get Screenshot Analytics',
        request: {
          method: 'GET',
          header: [],
          url: {
            raw: '{{base_url}}/api/v1/analytics/screenshots?period=30d',
            host: ['{{base_url}}'],
            path: ['api', 'v1', 'analytics', 'screenshots'],
            query: [{ key: 'period', value: '30d' }],
          },
          description: 'Get detailed screenshot analytics',
        },
        response: [],
      },
      {
        name: 'Get Usage Analytics',
        request: {
          method: 'GET',
          header: [],
          url: {
            raw: '{{base_url}}/api/v1/analytics/usage?period=30d',
            host: ['{{base_url}}'],
            path: ['api', 'v1', 'analytics', 'usage'],
            query: [{ key: 'period', value: '30d' }],
          },
          description: 'Get API usage analytics',
        },
        response: [],
      },
    ],
  };
}

/**
 * Generate Insomnia Export v4
 */
export function generateInsomniaCollection(): object {
  const resources: object[] = [];
  const workspaceId = 'wrk_screenshot_api';

  // Workspace
  resources.push({
    _id: workspaceId,
    _type: 'workspace',
    name: 'Screenshot API',
    description: 'Professional screenshot capture API',
  });

  // Environment
  resources.push({
    _id: 'env_base',
    _type: 'environment',
    parentId: workspaceId,
    name: 'Base Environment',
    data: {
      base_url: API_BASE_URL,
      api_key: 'your_api_key_here',
      jwt_token: 'your_jwt_token_here',
    },
  });

  // Folders
  const folders = [
    { id: 'fld_auth', name: 'Authentication' },
    { id: 'fld_screenshots', name: 'Screenshots' },
    { id: 'fld_subscriptions', name: 'Subscriptions' },
    { id: 'fld_analytics', name: 'Analytics' },
  ];

  folders.forEach((folder) => {
    resources.push({
      _id: folder.id,
      _type: 'request_group',
      parentId: workspaceId,
      name: folder.name,
    });
  });

  // Auth Requests
  resources.push({
    _id: 'req_register',
    _type: 'request',
    parentId: 'fld_auth',
    name: 'Register User',
    method: 'POST',
    url: '{{ _.base_url }}/api/v1/auth/register',
    body: {
      mimeType: 'application/json',
      text: JSON.stringify({
        name: 'John Doe',
        email: 'john@example.com',
        password: 'securePassword123',
      }),
    },
    headers: [{ name: 'Content-Type', value: 'application/json' }],
  });

  resources.push({
    _id: 'req_login',
    _type: 'request',
    parentId: 'fld_auth',
    name: 'Login User',
    method: 'POST',
    url: '{{ _.base_url }}/api/v1/auth/login',
    body: {
      mimeType: 'application/json',
      text: JSON.stringify({ email: 'john@example.com', password: 'securePassword123' }),
    },
    headers: [{ name: 'Content-Type', value: 'application/json' }],
  });

  // Screenshot Requests
  resources.push({
    _id: 'req_capture',
    _type: 'request',
    parentId: 'fld_screenshots',
    name: 'Capture Screenshot',
    method: 'POST',
    url: '{{ _.base_url }}/api/v1/screenshots',
    body: {
      mimeType: 'application/json',
      text: JSON.stringify({
        url: 'https://example.com',
        width: 1920,
        height: 1080,
        format: 'png',
      }),
    },
    headers: [
      { name: 'Content-Type', value: 'application/json' },
      { name: 'X-API-Key', value: '{{ _.api_key }}' },
    ],
  });

  resources.push({
    _id: 'req_list_screenshots',
    _type: 'request',
    parentId: 'fld_screenshots',
    name: 'List Screenshots',
    method: 'GET',
    url: '{{ _.base_url }}/api/v1/screenshots',
    headers: [{ name: 'X-API-Key', value: '{{ _.api_key }}' }],
  });

  // Analytics Requests
  resources.push({
    _id: 'req_analytics',
    _type: 'request',
    parentId: 'fld_analytics',
    name: 'Get Overview',
    method: 'GET',
    url: '{{ _.base_url }}/api/v1/analytics/overview?period=30d',
    headers: [{ name: 'X-API-Key', value: '{{ _.api_key }}' }],
  });

  return {
    _type: 'export',
    __export_format: 4,
    __export_date: new Date().toISOString(),
    __export_source: 'screenshot-api',
    resources,
  };
}

/**
 * Generate Bruno Collection
 */
export function generateBrunoCollection(): object {
  return {
    name: 'Screenshot API',
    version: '1.0.0',
    type: 'collection',
    items: [
      {
        name: 'Authentication',
        type: 'folder',
        items: [
          {
            name: 'Register User',
            type: 'http',
            request: {
              method: 'POST',
              url: `${API_BASE_URL}/api/v1/auth/register`,
              headers: { 'Content-Type': 'application/json' },
              body: {
                mode: 'json',
                json: {
                  name: 'John Doe',
                  email: 'john@example.com',
                  password: 'securePassword123',
                },
              },
            },
          },
          {
            name: 'Login User',
            type: 'http',
            request: {
              method: 'POST',
              url: `${API_BASE_URL}/api/v1/auth/login`,
              headers: { 'Content-Type': 'application/json' },
              body: {
                mode: 'json',
                json: { email: 'john@example.com', password: 'securePassword123' },
              },
            },
          },
        ],
      },
      {
        name: 'Screenshots',
        type: 'folder',
        items: [
          {
            name: 'Capture Screenshot',
            type: 'http',
            request: {
              method: 'POST',
              url: `${API_BASE_URL}/api/v1/screenshots`,
              headers: {
                'Content-Type': 'application/json',
                'X-API-Key': '{{api_key}}',
              },
              body: {
                mode: 'json',
                json: { url: 'https://example.com', width: 1920, height: 1080, format: 'png' },
              },
            },
          },
          {
            name: 'List Screenshots',
            type: 'http',
            request: {
              method: 'GET',
              url: `${API_BASE_URL}/api/v1/screenshots`,
              headers: { 'X-API-Key': '{{api_key}}' },
            },
          },
        ],
      },
      {
        name: 'Analytics',
        type: 'folder',
        items: [
          {
            name: 'Get Overview',
            type: 'http',
            request: {
              method: 'GET',
              url: `${API_BASE_URL}/api/v1/analytics/overview?period=30d`,
              headers: { 'X-API-Key': '{{api_key}}' },
            },
          },
        ],
      },
    ],
    environments: [
      {
        name: 'Development',
        variables: {
          base_url: 'http://localhost:3000',
          api_key: 'your_api_key_here',
        },
      },
      {
        name: 'Production',
        variables: {
          base_url: API_BASE_URL,
          api_key: 'your_api_key_here',
        },
      },
    ],
  };
}
