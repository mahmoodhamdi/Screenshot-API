/**
 * Webhook Signature Utility Tests
 */

import {
  createWebhookSignature,
  verifyWebhookSignature,
  generateWebhookSecret,
  createWebhookHeaders,
} from '@utils/webhookSignature';

describe('Webhook Signature Utility', () => {
  const testSecret = 'test-secret-key-for-webhook-signing';
  const testPayload = {
    event: 'screenshot.completed',
    data: {
      id: '12345',
      url: 'https://example.com',
      status: 'completed',
    },
  };

  describe('createWebhookSignature', () => {
    it('should create a valid signature', () => {
      const result = createWebhookSignature(testPayload, testSecret);

      expect(result).toHaveProperty('payload');
      expect(result).toHaveProperty('timestamp');
      expect(result).toHaveProperty('signature');
      expect(result.payload).toEqual(testPayload);
      expect(typeof result.timestamp).toBe('number');
      expect(result.signature).toMatch(/^sha256=[a-f0-9]{64}$/);
    });

    it('should include the correct timestamp', () => {
      const customTimestamp = 1609459200000;
      const result = createWebhookSignature(testPayload, testSecret, customTimestamp);

      expect(result.timestamp).toBe(customTimestamp);
    });

    it('should create different signatures for different payloads', () => {
      const payload1 = { event: 'test1' };
      const payload2 = { event: 'test2' };
      const timestamp = Date.now();

      const result1 = createWebhookSignature(payload1, testSecret, timestamp);
      const result2 = createWebhookSignature(payload2, testSecret, timestamp);

      expect(result1.signature).not.toBe(result2.signature);
    });

    it('should create different signatures for different secrets', () => {
      const timestamp = Date.now();

      const result1 = createWebhookSignature(testPayload, 'secret1', timestamp);
      const result2 = createWebhookSignature(testPayload, 'secret2', timestamp);

      expect(result1.signature).not.toBe(result2.signature);
    });

    it('should create different signatures for different timestamps', () => {
      const result1 = createWebhookSignature(testPayload, testSecret, 1000);
      const result2 = createWebhookSignature(testPayload, testSecret, 2000);

      expect(result1.signature).not.toBe(result2.signature);
    });

    it('should use SHA256 algorithm', () => {
      const result = createWebhookSignature(testPayload, testSecret);

      expect(result.signature).toMatch(/^sha256=/);
    });
  });

  describe('verifyWebhookSignature', () => {
    it('should verify a valid signature', () => {
      const signed = createWebhookSignature(testPayload, testSecret);
      const payloadString = JSON.stringify(signed.payload);

      const isValid = verifyWebhookSignature(
        payloadString,
        signed.timestamp,
        signed.signature,
        testSecret
      );

      expect(isValid).toBe(true);
    });

    it('should reject an invalid signature', () => {
      const signed = createWebhookSignature(testPayload, testSecret);
      const payloadString = JSON.stringify(signed.payload);

      const isValid = verifyWebhookSignature(
        payloadString,
        signed.timestamp,
        'sha256=invalidsignature0123456789abcdef0123456789abcdef01234567',
        testSecret
      );

      expect(isValid).toBe(false);
    });

    it('should reject when payload has been modified', () => {
      const signed = createWebhookSignature(testPayload, testSecret);
      const modifiedPayload = JSON.stringify({ ...testPayload, extra: 'data' });

      const isValid = verifyWebhookSignature(
        modifiedPayload,
        signed.timestamp,
        signed.signature,
        testSecret
      );

      expect(isValid).toBe(false);
    });

    it('should reject when using wrong secret', () => {
      const signed = createWebhookSignature(testPayload, testSecret);
      const payloadString = JSON.stringify(signed.payload);

      const isValid = verifyWebhookSignature(
        payloadString,
        signed.timestamp,
        signed.signature,
        'wrong-secret'
      );

      expect(isValid).toBe(false);
    });

    it('should reject expired timestamps', () => {
      const oldTimestamp = Date.now() - 10 * 60 * 1000; // 10 minutes ago
      const signed = createWebhookSignature(testPayload, testSecret, oldTimestamp);
      const payloadString = JSON.stringify(signed.payload);

      const isValid = verifyWebhookSignature(
        payloadString,
        signed.timestamp,
        signed.signature,
        testSecret,
        300000 // 5 minute tolerance
      );

      expect(isValid).toBe(false);
    });

    it('should accept timestamps within tolerance', () => {
      const recentTimestamp = Date.now() - 2 * 60 * 1000; // 2 minutes ago
      const signed = createWebhookSignature(testPayload, testSecret, recentTimestamp);
      const payloadString = JSON.stringify(signed.payload);

      const isValid = verifyWebhookSignature(
        payloadString,
        signed.timestamp,
        signed.signature,
        testSecret,
        300000 // 5 minute tolerance
      );

      expect(isValid).toBe(true);
    });

    it('should reject future timestamps beyond tolerance', () => {
      const futureTimestamp = Date.now() + 10 * 60 * 1000; // 10 minutes in future
      const signed = createWebhookSignature(testPayload, testSecret, futureTimestamp);
      const payloadString = JSON.stringify(signed.payload);

      const isValid = verifyWebhookSignature(
        payloadString,
        signed.timestamp,
        signed.signature,
        testSecret,
        300000 // 5 minute tolerance
      );

      expect(isValid).toBe(false);
    });

    it('should handle signatures with sha256= prefix', () => {
      const signed = createWebhookSignature(testPayload, testSecret);
      const payloadString = JSON.stringify(signed.payload);

      // Signature should already have sha256= prefix
      expect(signed.signature.startsWith('sha256=')).toBe(true);

      const isValid = verifyWebhookSignature(
        payloadString,
        signed.timestamp,
        signed.signature,
        testSecret
      );

      expect(isValid).toBe(true);
    });

    it('should handle signatures with mismatched lengths', () => {
      const signed = createWebhookSignature(testPayload, testSecret);
      const payloadString = JSON.stringify(signed.payload);

      const isValid = verifyWebhookSignature(
        payloadString,
        signed.timestamp,
        'sha256=short',
        testSecret
      );

      expect(isValid).toBe(false);
    });

    it('should use timing-safe comparison', () => {
      // This is hard to test directly, but we can verify it doesn't throw
      const signed = createWebhookSignature(testPayload, testSecret);
      const payloadString = JSON.stringify(signed.payload);

      expect(() => {
        verifyWebhookSignature(
          payloadString,
          signed.timestamp,
          signed.signature,
          testSecret
        );
      }).not.toThrow();
    });
  });

  describe('generateWebhookSecret', () => {
    it('should generate a 64-character hex string', () => {
      const secret = generateWebhookSecret();

      expect(secret).toMatch(/^[a-f0-9]{64}$/);
    });

    it('should generate unique secrets each time', () => {
      const secrets = new Set<string>();

      for (let i = 0; i < 100; i++) {
        secrets.add(generateWebhookSecret());
      }

      expect(secrets.size).toBe(100);
    });

    it('should generate cryptographically random secrets', () => {
      const secret1 = generateWebhookSecret();
      const secret2 = generateWebhookSecret();

      expect(secret1).not.toBe(secret2);
    });
  });

  describe('createWebhookHeaders', () => {
    it('should create correct headers', () => {
      const webhookId = 'webhook-123';
      const signature = 'sha256=abc123';
      const timestamp = 1609459200000;

      const headers = createWebhookHeaders(webhookId, signature, timestamp);

      expect(headers['Content-Type']).toBe('application/json');
      expect(headers['X-Webhook-Timestamp']).toBe('1609459200000');
      expect(headers['X-Webhook-Signature']).toBe('sha256=abc123');
      expect(headers['X-Webhook-ID']).toBe('webhook-123');
      expect(headers['User-Agent']).toBe('ScreenshotAPI-Webhook/1.0');
    });

    it('should convert timestamp to string', () => {
      const headers = createWebhookHeaders('id', 'sig', 12345);

      expect(headers['X-Webhook-Timestamp']).toBe('12345');
      expect(typeof headers['X-Webhook-Timestamp']).toBe('string');
    });
  });

  describe('end-to-end signature flow', () => {
    it('should complete a full sign and verify cycle', () => {
      // Generate a secret
      const secret = generateWebhookSecret();

      // Create payload
      const payload = {
        event: 'screenshot.completed',
        data: {
          id: 'screenshot-abc123',
          url: 'https://example.com',
          status: 'completed',
          imageUrl: 'https://storage.example.com/image.png',
        },
      };

      // Sign the payload
      const signed = createWebhookSignature(payload, secret);

      // Create headers
      const headers = createWebhookHeaders('attempt-123', signed.signature, signed.timestamp);

      // Simulate receiving the webhook
      const receivedPayload = JSON.stringify(signed.payload);
      const receivedTimestamp = parseInt(headers['X-Webhook-Timestamp']);
      const receivedSignature = headers['X-Webhook-Signature'];

      // Verify the signature
      const isValid = verifyWebhookSignature(
        receivedPayload,
        receivedTimestamp,
        receivedSignature,
        secret
      );

      expect(isValid).toBe(true);
    });
  });
});
