import {
  generatePostmanCollection,
  generateInsomniaCollection,
  generateBrunoCollection,
} from '@utils/docs/collection-generator';

describe('Collection Generator Utility', () => {
  describe('generatePostmanCollection', () => {
    it('should return valid Postman collection v2.1', () => {
      const result = generatePostmanCollection();

      expect(result.info).toBeDefined();
      expect(result.info.name).toBe('Screenshot API');
      expect(result.info.schema).toContain('schema.getpostman.com');
      expect(result.info.schema).toContain('v2.1.0');
    });

    it('should include API key authentication', () => {
      const result = generatePostmanCollection();

      expect(result.auth).toBeDefined();
      expect(result.auth.type).toBe('apikey');
      expect(result.auth.apikey).toBeInstanceOf(Array);
    });

    it('should include environment variables', () => {
      const result = generatePostmanCollection();

      expect(result.variable).toBeInstanceOf(Array);
      const varKeys = result.variable.map((v) => v.key);
      expect(varKeys).toContain('base_url');
      expect(varKeys).toContain('api_key');
      expect(varKeys).toContain('jwt_token');
    });

    it('should include all API folders', () => {
      const result = generatePostmanCollection();

      expect(result.item).toBeInstanceOf(Array);
      expect(result.item.length).toBe(4);

      const folderNames = result.item.map((folder) => folder.name);
      expect(folderNames).toContain('Authentication');
      expect(folderNames).toContain('Screenshots');
      expect(folderNames).toContain('Subscriptions');
      expect(folderNames).toContain('Analytics');
    });

    it('should include authentication requests', () => {
      const result = generatePostmanCollection();
      const authFolder = result.item.find((f) => f.name === 'Authentication');

      expect(authFolder).toBeDefined();
      expect(authFolder!.item.length).toBeGreaterThan(0);

      const requestNames = authFolder!.item.map((r) => r.name);
      expect(requestNames).toContain('Register User');
      expect(requestNames).toContain('Login User');
      expect(requestNames).toContain('Create API Key');
    });

    it('should include screenshot requests', () => {
      const result = generatePostmanCollection();
      const screenshotFolder = result.item.find((f) => f.name === 'Screenshots');

      expect(screenshotFolder).toBeDefined();
      expect(screenshotFolder!.item.length).toBeGreaterThan(0);

      const requestNames = screenshotFolder!.item.map((r) => r.name);
      expect(requestNames).toContain('Capture Screenshot');
      expect(requestNames).toContain('List Screenshots');
    });

    it('should have valid request structure', () => {
      const result = generatePostmanCollection();
      const authFolder = result.item.find((f) => f.name === 'Authentication');
      const registerRequest = authFolder!.item.find((r) => r.name === 'Register User');

      expect(registerRequest).toBeDefined();
      expect(registerRequest!.request.method).toBe('POST');
      expect(registerRequest!.request.url).toBeDefined();
      expect(registerRequest!.request.body).toBeDefined();
      expect(registerRequest!.request.body!.mode).toBe('raw');
    });
  });

  describe('generateInsomniaCollection', () => {
    it('should return valid Insomnia export v4', () => {
      const result = generateInsomniaCollection() as {
        _type: string;
        __export_format: number;
        resources: Array<{ _id: string; _type: string; name?: string }>;
      };

      expect(result._type).toBe('export');
      expect(result.__export_format).toBe(4);
      expect(result.resources).toBeInstanceOf(Array);
    });

    it('should include workspace', () => {
      const result = generateInsomniaCollection() as {
        resources: Array<{ _id: string; _type: string; name?: string }>;
      };

      const workspace = result.resources.find((r) => r._type === 'workspace');
      expect(workspace).toBeDefined();
      expect(workspace!.name).toBe('Screenshot API');
    });

    it('should include environment with variables', () => {
      const result = generateInsomniaCollection() as {
        resources: Array<{ _id: string; _type: string; data?: Record<string, string> }>;
      };

      const environment = result.resources.find((r) => r._type === 'environment');
      expect(environment).toBeDefined();
      expect(environment!.data).toBeDefined();
      expect(environment!.data!.base_url).toBeDefined();
      expect(environment!.data!.api_key).toBeDefined();
    });

    it('should include request groups (folders)', () => {
      const result = generateInsomniaCollection() as {
        resources: Array<{ _id: string; _type: string; name?: string }>;
      };

      const folders = result.resources.filter((r) => r._type === 'request_group');
      expect(folders.length).toBeGreaterThan(0);

      const folderNames = folders.map((f) => f.name);
      expect(folderNames).toContain('Authentication');
      expect(folderNames).toContain('Screenshots');
    });

    it('should include requests', () => {
      const result = generateInsomniaCollection() as {
        resources: Array<{ _id: string; _type: string; name?: string; method?: string }>;
      };

      const requests = result.resources.filter((r) => r._type === 'request');
      expect(requests.length).toBeGreaterThan(0);

      const requestNames = requests.map((r) => r.name);
      expect(requestNames).toContain('Register User');
      expect(requestNames).toContain('Capture Screenshot');
    });
  });

  describe('generateBrunoCollection', () => {
    it('should return valid Bruno collection', () => {
      const result = generateBrunoCollection() as {
        name: string;
        version: string;
        type: string;
        items: Array<{ name: string; type: string }>;
      };

      expect(result.name).toBe('Screenshot API');
      expect(result.version).toBe('1.0.0');
      expect(result.type).toBe('collection');
      expect(result.items).toBeInstanceOf(Array);
    });

    it('should include folders', () => {
      const result = generateBrunoCollection() as {
        items: Array<{ name: string; type: string }>;
      };

      const folders = result.items.filter((item) => item.type === 'folder');
      expect(folders.length).toBeGreaterThan(0);

      const folderNames = folders.map((f) => f.name);
      expect(folderNames).toContain('Authentication');
      expect(folderNames).toContain('Screenshots');
    });

    it('should include environments', () => {
      const result = generateBrunoCollection() as {
        environments: Array<{ name: string; variables: Record<string, string> }>;
      };

      expect(result.environments).toBeInstanceOf(Array);
      expect(result.environments.length).toBe(2);

      const envNames = result.environments.map((e) => e.name);
      expect(envNames).toContain('Development');
      expect(envNames).toContain('Production');
    });

    it('should have valid request structure', () => {
      const result = generateBrunoCollection() as {
        items: Array<{
          name: string;
          type: string;
          items?: Array<{ name: string; type: string; request?: { method: string; url: string } }>;
        }>;
      };

      const authFolder = result.items.find((item) => item.name === 'Authentication');
      expect(authFolder).toBeDefined();
      expect(authFolder!.items).toBeDefined();

      const registerRequest = authFolder!.items!.find((item) => item.name === 'Register User');
      expect(registerRequest).toBeDefined();
      expect(registerRequest!.type).toBe('http');
      expect(registerRequest!.request).toBeDefined();
      expect(registerRequest!.request!.method).toBe('POST');
    });
  });
});
