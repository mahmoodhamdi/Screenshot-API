# Webhooks

This document describes how to use webhooks for asynchronous screenshot notifications.

## Overview

Webhooks allow you to receive real-time notifications when a screenshot capture completes or fails. Instead of polling the API, your server receives an HTTP POST request with the result.

**Requirements:**
- Professional or Enterprise plan
- HTTPS endpoint (required in production)
- Endpoint must respond within 30 seconds

## Enabling Webhooks

### 1. Get Your Webhook Secret

First, retrieve your webhook secret for signature verification:

```bash
curl -X GET https://api.screenshot-api.com/api/v1/webhooks/secret \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

Response:
```json
{
  "success": true,
  "data": {
    "secret": "whsec_abc123..."
  }
}
```

### 2. Include Webhook URL in Screenshot Requests

Add the `webhook` parameter to your screenshot request:

```bash
curl -X POST https://api.screenshot-api.com/api/v1/screenshots \
  -H "X-API-Key: YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://example.com",
    "webhook": "https://your-server.com/webhooks/screenshot"
  }'
```

## Webhook Payload

When a screenshot completes or fails, your endpoint receives a POST request:

### Screenshot Completed

```json
{
  "event": "screenshot.completed",
  "screenshotId": "507f1f77bcf86cd799439011",
  "url": "https://example.com",
  "status": "completed",
  "result": {
    "url": "https://storage.screenshot-api.com/screenshots/abc123.png",
    "size": 524288,
    "duration": 2340,
    "format": "png",
    "width": 1920,
    "height": 1080
  },
  "metadata": {
    "pageTitle": "Example Domain",
    "pageDescription": "Example page description",
    "faviconUrl": "https://example.com/favicon.ico"
  },
  "timestamp": "2024-01-15T12:00:00.000Z"
}
```

### Screenshot Failed

```json
{
  "event": "screenshot.failed",
  "screenshotId": "507f1f77bcf86cd799439011",
  "url": "https://example.com",
  "status": "failed",
  "error": {
    "code": "NAVIGATION_TIMEOUT",
    "message": "Navigation timeout of 30000 ms exceeded"
  },
  "timestamp": "2024-01-15T12:00:00.000Z"
}
```

## Webhook Signature Verification

All webhooks are signed with HMAC-SHA256 for security. **Always verify signatures** to ensure requests are from the Screenshot API.

### Request Headers

```
X-Webhook-Timestamp: 1705320000
X-Webhook-Signature: v1=abc123def456...
```

### Verification Steps

1. Get the timestamp and signature from headers
2. Construct the signed payload: `${timestamp}.${body}`
3. Compute HMAC-SHA256 using your webhook secret
4. Compare signatures using timing-safe comparison

### Node.js Example

```javascript
const crypto = require('crypto');

function verifyWebhookSignature(payload, headers, secret) {
  const timestamp = headers['x-webhook-timestamp'];
  const signature = headers['x-webhook-signature'];

  // Check timestamp to prevent replay attacks (5 minute tolerance)
  const now = Math.floor(Date.now() / 1000);
  if (Math.abs(now - parseInt(timestamp)) > 300) {
    throw new Error('Timestamp too old');
  }

  // Extract signature value
  const signatureValue = signature.replace('v1=', '');

  // Compute expected signature
  const signedPayload = `${timestamp}.${JSON.stringify(payload)}`;
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(signedPayload)
    .digest('hex');

  // Timing-safe comparison
  if (!crypto.timingSafeEqual(
    Buffer.from(signatureValue),
    Buffer.from(expectedSignature)
  )) {
    throw new Error('Invalid signature');
  }

  return true;
}

// Express.js handler
app.post('/webhooks/screenshot', express.json(), (req, res) => {
  try {
    verifyWebhookSignature(req.body, req.headers, process.env.WEBHOOK_SECRET);

    const { event, screenshotId, status } = req.body;

    if (event === 'screenshot.completed') {
      console.log(`Screenshot ${screenshotId} completed!`);
      // Process the completed screenshot
    } else if (event === 'screenshot.failed') {
      console.log(`Screenshot ${screenshotId} failed`);
      // Handle the failure
    }

    res.status(200).json({ received: true });
  } catch (error) {
    console.error('Webhook verification failed:', error);
    res.status(401).json({ error: 'Invalid signature' });
  }
});
```

### Python Example

```python
import hmac
import hashlib
import time
import json

def verify_webhook_signature(payload, headers, secret):
    timestamp = headers.get('X-Webhook-Timestamp')
    signature = headers.get('X-Webhook-Signature')

    # Check timestamp (5 minute tolerance)
    now = int(time.time())
    if abs(now - int(timestamp)) > 300:
        raise ValueError('Timestamp too old')

    # Extract signature value
    signature_value = signature.replace('v1=', '')

    # Compute expected signature
    signed_payload = f"{timestamp}.{json.dumps(payload)}"
    expected_signature = hmac.new(
        secret.encode(),
        signed_payload.encode(),
        hashlib.sha256
    ).hexdigest()

    # Timing-safe comparison
    if not hmac.compare_digest(signature_value, expected_signature):
        raise ValueError('Invalid signature')

    return True

# Flask handler
@app.route('/webhooks/screenshot', methods=['POST'])
def handle_webhook():
    try:
        verify_webhook_signature(
            request.json,
            request.headers,
            os.environ['WEBHOOK_SECRET']
        )

        event = request.json.get('event')
        screenshot_id = request.json.get('screenshotId')

        if event == 'screenshot.completed':
            print(f'Screenshot {screenshot_id} completed!')

        return {'received': True}, 200
    except ValueError as e:
        return {'error': str(e)}, 401
```

## Retry Policy

If your endpoint fails to respond or returns an error, we retry with exponential backoff:

| Attempt | Delay | Total Time |
|---------|-------|------------|
| 1 | Immediate | 0s |
| 2 | ~1s | 1s |
| 3 | ~2s | 3s |
| 4 | ~4s | 7s |
| 5 | ~8s | 15s |

- Delays include random jitter (0-50%) to prevent thundering herd
- After 5 failed attempts, the webhook moves to dead letter queue
- You can manually retry dead letter webhooks via the API

### Response Requirements

Your endpoint should:
- Return HTTP 2xx status to acknowledge receipt
- Respond within 30 seconds
- Accept `Content-Type: application/json`

Any non-2xx response triggers a retry.

## Managing Webhooks

### View Webhook History

```bash
curl -X GET "https://api.screenshot-api.com/api/v1/webhooks?limit=20" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Get Webhook Details

```bash
curl -X GET https://api.screenshot-api.com/api/v1/webhooks/WEBHOOK_ID \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Retry Failed Webhook

```bash
curl -X POST https://api.screenshot-api.com/api/v1/webhooks/WEBHOOK_ID/retry \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Regenerate Webhook Secret

If your secret is compromised, regenerate it:

```bash
curl -X POST https://api.screenshot-api.com/api/v1/webhooks/secret/regenerate \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Warning:** This invalidates your old secret immediately. Update your verification code before regenerating.

## Security Best Practices

1. **Always verify signatures** - Never process unverified webhooks
2. **Use HTTPS** - Required in production for security
3. **Check timestamps** - Prevent replay attacks
4. **Store secrets securely** - Use environment variables
5. **Respond quickly** - Process asynchronously if needed
6. **Handle idempotency** - Webhooks may be delivered more than once

## Troubleshooting

### Common Issues

| Issue | Solution |
|-------|----------|
| Signature mismatch | Ensure you're using the raw body, not parsed JSON |
| Timeout errors | Process webhooks asynchronously |
| Missing webhooks | Check endpoint is publicly accessible |
| HTTPS errors | Ensure valid SSL certificate |

### Testing Webhooks Locally

Use a tunnel service like ngrok for local development:

```bash
ngrok http 3000
# Use the https URL as your webhook endpoint
```

### Debug Mode

Add `?debug=true` to get detailed delivery information:

```json
{
  "url": "https://example.com",
  "webhook": "https://your-server.com/webhook?debug=true"
}
```

## Webhook Events Reference

| Event | Description |
|-------|-------------|
| `screenshot.completed` | Screenshot captured successfully |
| `screenshot.failed` | Screenshot capture failed |

## Rate Limits

Webhook endpoints are subject to rate limits:
- Maximum 5 webhooks per screenshot request
- Maximum 100 concurrent webhook deliveries per account
