/**
 * Documentation Routes Integration Tests
 * Tests for API documentation and collection export endpoints
 */

// Set environment variables before any imports
process.env.JWT_SECRET = 'test-jwt-secret-key-minimum-32-characters-long';
process.env.JWT_REFRESH_SECRET = 'test-jwt-refresh-secret-key-minimum-32-chars';
process.env.NODE_ENV = 'test';

import request from 'supertest';
import app from '@/app';

describe('Documentation Routes', () => {
  describe('GET /developer', () => {
    it('should return developer portal HTML page', async () => {
      const response = await request(app).get('/developer');

      expect(response.status).toBe(200);
      expect(response.type).toBe('text/html');
      expect(response.text).toContain('Developer Portal');
      expect(response.text).toContain('Screenshot API');
    });

    it('should include code examples section', async () => {
      const response = await request(app).get('/developer');

      expect(response.text).toContain('Code Examples');
      expect(response.text).toContain('Node.js');
      expect(response.text).toContain('Python');
      expect(response.text).toContain('cURL');
    });

    it('should include SDK section', async () => {
      const response = await request(app).get('/developer');

      expect(response.text).toContain('SDKs');
      expect(response.text).toContain('npm install');
      expect(response.text).toContain('pip install');
    });

    it('should include export links', async () => {
      const response = await request(app).get('/developer');

      expect(response.text).toContain('/docs/postman.json');
      expect(response.text).toContain('/docs/insomnia.json');
      expect(response.text).toContain('/docs/bruno.json');
    });

    it('should include navigation links', async () => {
      const response = await request(app).get('/developer');

      expect(response.text).toContain('/docs');
      expect(response.text).toContain('/redoc');
      expect(response.text).toContain('/api-docs');
    });
  });

  describe('GET /docs/postman.json', () => {
    it('should return Postman collection', async () => {
      const response = await request(app).get('/docs/postman.json');

      expect(response.status).toBe(200);
      expect(response.type).toBe('application/json');
      expect(response.headers['content-disposition']).toContain('postman');
    });

    it('should return valid Postman collection structure', async () => {
      const response = await request(app).get('/docs/postman.json');

      expect(response.body.info).toBeDefined();
      expect(response.body.info.name).toBe('Screenshot API');
      expect(response.body.info.schema).toContain('v2.1.0');
      expect(response.body.item).toBeInstanceOf(Array);
    });

    it('should include all API folders', async () => {
      const response = await request(app).get('/docs/postman.json');

      const folderNames = response.body.item.map((folder: { name: string }) => folder.name);
      expect(folderNames).toContain('Authentication');
      expect(folderNames).toContain('Screenshots');
      expect(folderNames).toContain('Subscriptions');
      expect(folderNames).toContain('Analytics');
    });
  });

  describe('GET /docs/insomnia.json', () => {
    it('should return Insomnia export', async () => {
      const response = await request(app).get('/docs/insomnia.json');

      expect(response.status).toBe(200);
      expect(response.type).toBe('application/json');
      expect(response.headers['content-disposition']).toContain('insomnia');
    });

    it('should return valid Insomnia export structure', async () => {
      const response = await request(app).get('/docs/insomnia.json');

      expect(response.body._type).toBe('export');
      expect(response.body.__export_format).toBe(4);
      expect(response.body.resources).toBeInstanceOf(Array);
    });

    it('should include workspace and requests', async () => {
      const response = await request(app).get('/docs/insomnia.json');

      const workspace = response.body.resources.find(
        (r: { _type: string }) => r._type === 'workspace'
      );
      const requests = response.body.resources.filter(
        (r: { _type: string }) => r._type === 'request'
      );

      expect(workspace).toBeDefined();
      expect(requests.length).toBeGreaterThan(0);
    });
  });

  describe('GET /docs/bruno.json', () => {
    it('should return Bruno collection', async () => {
      const response = await request(app).get('/docs/bruno.json');

      expect(response.status).toBe(200);
      expect(response.type).toBe('application/json');
      expect(response.headers['content-disposition']).toContain('bruno');
    });

    it('should return valid Bruno collection structure', async () => {
      const response = await request(app).get('/docs/bruno.json');

      expect(response.body.name).toBe('Screenshot API');
      expect(response.body.type).toBe('collection');
      expect(response.body.items).toBeInstanceOf(Array);
      expect(response.body.environments).toBeInstanceOf(Array);
    });
  });

  describe('GET /api-docs', () => {
    it('should return documentation landing page', async () => {
      const response = await request(app).get('/api-docs');

      expect(response.status).toBe(200);
      expect(response.type).toBe('text/html');
      expect(response.text).toContain('Screenshot API');
    });

    it('should include links to all documentation formats', async () => {
      const response = await request(app).get('/api-docs');

      expect(response.text).toContain('/docs');
      expect(response.text).toContain('/redoc');
      expect(response.text).toContain('/docs/openapi.json');
      expect(response.text).toContain('/docs/openapi.yaml');
    });
  });

  describe('GET /docs/openapi.json', () => {
    it('should return OpenAPI JSON specification', async () => {
      const response = await request(app).get('/docs/openapi.json');

      expect(response.status).toBe(200);
      expect(response.type).toBe('application/json');
    });

    it('should return valid OpenAPI 3.0 spec', async () => {
      const response = await request(app).get('/docs/openapi.json');

      expect(response.body.openapi).toMatch(/^3\./);
      expect(response.body.info).toBeDefined();
      expect(response.body.paths).toBeDefined();
    });
  });

  describe('GET /docs/openapi.yaml', () => {
    it('should return OpenAPI YAML specification', async () => {
      const response = await request(app).get('/docs/openapi.yaml');

      expect(response.status).toBe(200);
      expect(response.type).toBe('application/x-yaml');
    });

    it('should return valid YAML content', async () => {
      const response = await request(app).get('/docs/openapi.yaml');

      expect(response.text).toContain('openapi:');
      expect(response.text).toContain('info:');
      expect(response.text).toContain('paths:');
    });
  });

  describe('GET /docs (Swagger UI)', () => {
    it('should return Swagger UI page', async () => {
      const response = await request(app).get('/docs/');

      expect(response.status).toBe(200);
      expect(response.type).toBe('text/html');
    });
  });

  describe('GET /redoc', () => {
    it('should return ReDoc page', async () => {
      const response = await request(app).get('/redoc');

      expect(response.status).toBe(200);
      expect(response.type).toBe('text/html');
    });
  });
});
