/**
 * Webhook Signature Utility
 * HMAC-SHA256 signature creation and verification for webhook security
 */

import crypto from 'crypto';

/**
 * Signed webhook payload
 */
export interface SignedWebhookPayload {
  payload: object;
  timestamp: number;
  signature: string;
}

/**
 * Create a webhook signature using HMAC-SHA256
 *
 * @param payload - The webhook payload object
 * @param secret - The secret key for signing
 * @param timestamp - Optional timestamp (defaults to current time)
 * @returns Signed payload with timestamp and signature
 */
export function createWebhookSignature(
  payload: object,
  secret: string,
  timestamp: number = Date.now()
): SignedWebhookPayload {
  const payloadString = JSON.stringify(payload);
  const signaturePayload = `${timestamp}.${payloadString}`;

  const signature = crypto.createHmac('sha256', secret).update(signaturePayload).digest('hex');

  return {
    payload,
    timestamp,
    signature: `sha256=${signature}`,
  };
}

/**
 * Verify a webhook signature
 *
 * @param payload - The raw payload string (JSON)
 * @param timestamp - The timestamp from the webhook header
 * @param signature - The signature from the webhook header
 * @param secret - The secret key for verification
 * @param toleranceMs - Maximum age of the webhook in milliseconds (default: 5 minutes)
 * @returns True if the signature is valid and the timestamp is within tolerance
 */
export function verifyWebhookSignature(
  payload: string,
  timestamp: number,
  signature: string,
  secret: string,
  toleranceMs: number = 300000 // 5 minutes
): boolean {
  // Check timestamp freshness to prevent replay attacks
  const now = Date.now();
  if (Math.abs(now - timestamp) > toleranceMs) {
    return false;
  }

  // Create the expected signature
  const signaturePayload = `${timestamp}.${payload}`;
  const expectedSignature = crypto.createHmac('sha256', secret).update(signaturePayload).digest('hex');

  // Extract the hash from the signature header (remove 'sha256=' prefix)
  const providedHash = signature.replace(/^sha256=/, '');

  // Use timing-safe comparison to prevent timing attacks
  try {
    return crypto.timingSafeEqual(Buffer.from(providedHash), Buffer.from(expectedSignature));
  } catch {
    // If buffers have different lengths, timingSafeEqual throws
    return false;
  }
}

/**
 * Generate a new webhook secret
 *
 * @returns A 64-character hex string suitable for use as a webhook secret
 */
export function generateWebhookSecret(): string {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Webhook headers for outgoing webhooks
 */
export interface WebhookHeaders {
  'Content-Type': string;
  'X-Webhook-Timestamp': string;
  'X-Webhook-Signature': string;
  'X-Webhook-ID': string;
  'User-Agent': string;
}

/**
 * Create headers for a webhook request
 *
 * @param webhookId - The webhook attempt ID
 * @param signature - The signature string
 * @param timestamp - The timestamp
 * @returns Headers object for the webhook request
 */
export function createWebhookHeaders(
  webhookId: string,
  signature: string,
  timestamp: number
): WebhookHeaders {
  return {
    'Content-Type': 'application/json',
    'X-Webhook-Timestamp': timestamp.toString(),
    'X-Webhook-Signature': signature,
    'X-Webhook-ID': webhookId,
    'User-Agent': 'ScreenshotAPI-Webhook/1.0',
  };
}

export default {
  createWebhookSignature,
  verifyWebhookSignature,
  generateWebhookSecret,
  createWebhookHeaders,
};
