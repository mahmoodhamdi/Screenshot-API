import {
  generateScreenshotExamples,
  generateRegisterExamples,
  generateApiKeyExamples,
  generateListScreenshotsExamples,
  generateAnalyticsExamples,
  getAllExamples,
  getExamplesByLanguage,
  getSupportedLanguages,
} from '@utils/docs/code-generator';

describe('Code Generator Utility', () => {
  describe('generateScreenshotExamples', () => {
    it('should return screenshot endpoint examples', () => {
      const result = generateScreenshotExamples();

      expect(result.endpoint).toBe('/api/v1/screenshots');
      expect(result.method).toBe('POST');
      expect(result.description).toBeTruthy();
      expect(result.examples.length).toBeGreaterThan(0);
    });

    it('should include examples for multiple languages', () => {
      const result = generateScreenshotExamples();
      const languages = result.examples.map((ex) => ex.language);

      expect(languages).toContain('javascript');
      expect(languages).toContain('python');
      expect(languages).toContain('php');
      expect(languages).toContain('curl');
      expect(languages).toContain('ruby');
      expect(languages).toContain('go');
      expect(languages).toContain('java');
      expect(languages).toContain('csharp');
    });

    it('should have valid code examples with API URL', () => {
      const result = generateScreenshotExamples();

      result.examples.forEach((example) => {
        expect(example.code).toBeTruthy();
        expect(example.code.length).toBeGreaterThan(50);
        expect(example.label).toBeTruthy();
        expect(example.icon).toBeTruthy();
        expect(example.iconColor).toMatch(/^#[0-9a-fA-F]{6}$/);
      });
    });

    it('should include install commands where applicable', () => {
      const result = generateScreenshotExamples();
      const jsExample = result.examples.find((ex) => ex.label === 'Node.js');
      const pythonExample = result.examples.find((ex) => ex.language === 'python');

      expect(jsExample?.installCommand).toBe('npm install axios');
      expect(pythonExample?.installCommand).toBe('pip install requests');
    });
  });

  describe('generateRegisterExamples', () => {
    it('should return register endpoint examples', () => {
      const result = generateRegisterExamples();

      expect(result.endpoint).toBe('/api/v1/auth/register');
      expect(result.method).toBe('POST');
      expect(result.examples.length).toBeGreaterThan(0);
    });

    it('should include registration data in code', () => {
      const result = generateRegisterExamples();

      result.examples.forEach((example) => {
        expect(example.code).toContain('email');
        expect(example.code).toContain('password');
      });
    });
  });

  describe('generateApiKeyExamples', () => {
    it('should return API key endpoint examples', () => {
      const result = generateApiKeyExamples();

      expect(result.endpoint).toBe('/api/v1/auth/api-keys');
      expect(result.method).toBe('POST');
      expect(result.examples.length).toBeGreaterThan(0);
    });

    it('should include authorization header in code', () => {
      const result = generateApiKeyExamples();

      result.examples.forEach((example) => {
        expect(example.code.toLowerCase()).toContain('authorization');
        expect(example.code.toLowerCase()).toContain('bearer');
      });
    });
  });

  describe('generateListScreenshotsExamples', () => {
    it('should return list screenshots endpoint examples', () => {
      const result = generateListScreenshotsExamples();

      expect(result.endpoint).toBe('/api/v1/screenshots');
      expect(result.method).toBe('GET');
      expect(result.examples.length).toBeGreaterThan(0);
    });

    it('should include X-API-Key header in code', () => {
      const result = generateListScreenshotsExamples();

      result.examples.forEach((example) => {
        expect(example.code).toContain('X-API-Key');
      });
    });
  });

  describe('generateAnalyticsExamples', () => {
    it('should return analytics endpoint examples', () => {
      const result = generateAnalyticsExamples();

      expect(result.endpoint).toBe('/api/v1/analytics/overview');
      expect(result.method).toBe('GET');
      expect(result.examples.length).toBeGreaterThan(0);
    });
  });

  describe('getAllExamples', () => {
    it('should return all endpoint examples', () => {
      const result = getAllExamples();

      expect(result.length).toBe(5);
      expect(result.map((r) => r.endpoint)).toContain('/api/v1/screenshots');
      expect(result.map((r) => r.endpoint)).toContain('/api/v1/auth/register');
      expect(result.map((r) => r.endpoint)).toContain('/api/v1/auth/api-keys');
      expect(result.map((r) => r.endpoint)).toContain('/api/v1/analytics/overview');
    });
  });

  describe('getExamplesByLanguage', () => {
    it('should filter examples by language', () => {
      const result = getExamplesByLanguage('python');

      result.forEach((endpoint) => {
        endpoint.examples.forEach((example) => {
          expect(example.language).toBe('python');
        });
      });
    });

    it('should return empty examples for unsupported language', () => {
      const result = getExamplesByLanguage('unsupported');

      result.forEach((endpoint) => {
        expect(endpoint.examples.length).toBe(0);
      });
    });
  });

  describe('getSupportedLanguages', () => {
    it('should return list of supported languages', () => {
      const result = getSupportedLanguages();

      expect(result.length).toBeGreaterThan(5);
      expect(result.map((l) => l.language)).toContain('javascript');
      expect(result.map((l) => l.language)).toContain('python');
      expect(result.map((l) => l.language)).toContain('php');
      expect(result.map((l) => l.language)).toContain('curl');
    });

    it('should have valid language metadata', () => {
      const result = getSupportedLanguages();

      result.forEach((lang) => {
        expect(lang.language).toBeTruthy();
        expect(lang.label).toBeTruthy();
        expect(lang.icon).toBeTruthy();
        expect(lang.iconColor).toMatch(/^#[0-9a-fA-F]{6}$/);
      });
    });
  });
});
