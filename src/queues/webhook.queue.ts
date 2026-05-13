/**
 * Webhook Queue
 * Bull-based queue for reliable webhook delivery with retry logic
 */

import Bull, { Job, Queue } from 'bull';
import { config } from '@config/index';
import { WebhookAttempt, IWebhookAttempt } from '@models/webhookAttempt.model';
import { createWebhookSignature, createWebhookHeaders } from '@utils/webhookSignature';
import { logger } from '@utils/logger';
import User from '@models/user.model';
import { Types } from 'mongoose';

/**
 * Webhook job data interface
 */
export interface WebhookJobData {
  attemptId: string;
}

/**
 * Webhook queue instance
 */
let webhookQueue: Queue<WebhookJobData> | null = null;

/**
 * Calculate delay with exponential backoff + jitter
 * @param attempt - Current attempt number (1-based)
 * @returns Delay in milliseconds
 */
export function calculateDelay(attempt: number): number {
  const baseDelay = 1000; // 1 second
  const maxDelay = 3600000; // 1 hour
  const exponentialDelay = baseDelay * Math.pow(2, attempt - 1);
  const jitter = Math.random() * 0.3 * exponentialDelay; // 0-30% jitter
  return Math.min(Math.round(exponentialDelay + jitter), maxDelay);
}

/**
 * Get or create the webhook queue
 */
export function getWebhookQueue(): Queue<WebhookJobData> {
  if (webhookQueue) {
    return webhookQueue;
  }

  // Create queue with Redis connection
  webhookQueue = new Bull<WebhookJobData>('webhooks', {
    redis: {
      host: config.redis.host,
      port: config.redis.port,
      password: config.redis.password || undefined,
      db: config.redis.db,
    },
    defaultJobOptions: {
      attempts: 1, // We handle retries via the attempt model
      removeOnComplete: 100, // Keep last 100 completed jobs
      removeOnFail: 500, // Keep last 500 failed jobs for debugging
    },
  });

  // Process webhook jobs
  webhookQueue.process(async (job: Job<WebhookJobData>) => {
    const { attemptId } = job.data;

    const attempt = await WebhookAttempt.findById(attemptId);
    if (!attempt || attempt.status !== 'pending') {
      logger.debug('Skipping webhook job - not found or not pending', {
        attemptId,
        status: attempt?.status,
      });
      return { skipped: true };
    }

    // Update attempt count
    attempt.attempts += 1;
    attempt.lastAttemptAt = new Date();

    logger.info('Processing webhook job', {
      jobId: job.id,
      attemptId,
      url: attempt.url,
      attempt: attempt.attempts,
    });

    try {
      // Get user's webhook secret
      const user = await User.findById(attempt.userId).select('+webhookSecret');
      const webhookSecret = user?.webhookSecret || config.webhookSecret || 'default-webhook-secret';

      // Create signed payload
      const signed = createWebhookSignature(attempt.payload, webhookSecret);

      // Create headers
      const headers = createWebhookHeaders(
        attempt._id.toString(),
        signed.signature,
        signed.timestamp
      );

      // Send webhook request with timeout
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 30000); // 30 second timeout

      try {
        const response = await fetch(attempt.url, {
          method: 'POST',
          headers: {
            'Content-Type': headers['Content-Type'],
            'X-Webhook-Timestamp': headers['X-Webhook-Timestamp'],
            'X-Webhook-Signature': headers['X-Webhook-Signature'],
            'X-Webhook-ID': headers['X-Webhook-ID'],
            'User-Agent': headers['User-Agent'],
          },
          body: JSON.stringify(signed.payload),
          signal: controller.signal,
        });

        clearTimeout(timeout);

        attempt.responseStatus = response.status;

        // Read response body (limited to 2000 chars as per model)
        const body = await response.text();
        attempt.responseBody = body.substring(0, 2000);

        if (response.ok) {
          attempt.status = 'success';
          await attempt.save();

          logger.info('Webhook delivered successfully', {
            attemptId,
            url: attempt.url,
            statusCode: response.status,
            attempts: attempt.attempts,
          });

          return { success: true, statusCode: response.status };
        } else {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
      } finally {
        clearTimeout(timeout);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      attempt.errorMessage = errorMessage.substring(0, 1000);

      if (attempt.attempts >= attempt.maxAttempts) {
        // Max attempts reached - mark as failed
        attempt.status = 'failed';
        await attempt.save();

        logger.error('Webhook permanently failed', {
          attemptId,
          url: attempt.url,
          attempts: attempt.attempts,
          maxAttempts: attempt.maxAttempts,
          error: errorMessage,
        });

        return { success: false, error: errorMessage, permanentFailure: true };
      } else {
        // Schedule retry
        const delay = calculateDelay(attempt.attempts);
        attempt.nextAttemptAt = new Date(Date.now() + delay);
        await attempt.save();

        // Add retry job
        await getWebhookQueue().add({ attemptId }, { delay });

        logger.warn('Webhook failed, scheduling retry', {
          attemptId,
          url: attempt.url,
          attempt: attempt.attempts,
          maxAttempts: attempt.maxAttempts,
          nextAttemptIn: `${Math.round(delay / 1000)}s`,
          error: errorMessage,
        });

        return { success: false, error: errorMessage, retryScheduled: true };
      }
    }
  });

  // Event handlers
  webhookQueue.on('completed', (job, result) => {
    if (!result?.skipped) {
      logger.debug('Webhook job completed', {
        jobId: job.id,
        attemptId: job.data.attemptId,
        success: result?.success,
      });
    }
  });

  webhookQueue.on('failed', (job, error) => {
    logger.error('Webhook job failed unexpectedly', {
      jobId: job.id,
      attemptId: job.data.attemptId,
      error: error.message,
    });
  });

  webhookQueue.on('stalled', (job) => {
    logger.warn('Webhook job stalled', {
      jobId: job.id,
      attemptId: job.data.attemptId,
    });
  });

  webhookQueue.on('error', (error) => {
    logger.error('Webhook queue error', { error: error.message });
  });

  logger.info('Webhook queue initialized');
  return webhookQueue;
}

/**
 * Queue a new webhook for delivery
 */
export async function queueWebhook(data: {
  screenshotId: string | Types.ObjectId;
  userId: string | Types.ObjectId;
  url: string;
  payload: Record<string, unknown>;
}): Promise<string> {
  // Create the webhook attempt record
  const attempt = await WebhookAttempt.create({
    screenshotId: data.screenshotId,
    userId: data.userId,
    url: data.url,
    payload: data.payload,
    nextAttemptAt: new Date(),
  });

  // Add job to queue
  await getWebhookQueue().add({ attemptId: attempt._id.toString() });

  logger.info('Webhook queued', {
    attemptId: attempt._id.toString(),
    url: data.url,
    screenshotId: data.screenshotId.toString(),
  });

  return attempt._id.toString();
}

/**
 * Get webhook attempt status
 */
export async function getWebhookStatus(attemptId: string): Promise<IWebhookAttempt | null> {
  return WebhookAttempt.findById(attemptId);
}

/**
 * Retry a failed webhook manually
 */
export async function retryWebhook(
  attemptId: string,
  userId?: string | Types.ObjectId
): Promise<boolean> {
  const query: { _id: string; userId?: Types.ObjectId } = { _id: attemptId };
  if (userId) {
    query.userId = new Types.ObjectId(userId.toString());
  }

  const attempt = await WebhookAttempt.findOne(query);
  if (!attempt || attempt.status !== 'failed') {
    return false;
  }

  // Reset the attempt for retry
  attempt.status = 'pending';
  attempt.attempts = 0;
  attempt.errorMessage = undefined;
  attempt.responseStatus = undefined;
  attempt.responseBody = undefined;
  attempt.nextAttemptAt = new Date();
  await attempt.save();

  // Add job to queue
  await getWebhookQueue().add({ attemptId });

  logger.info('Webhook retry queued', {
    attemptId,
    url: attempt.url,
  });

  return true;
}

/**
 * Get webhook history for a user
 */
export async function getUserWebhooks(
  userId: string | Types.ObjectId,
  limit: number = 100
): Promise<IWebhookAttempt[]> {
  return WebhookAttempt.findByUser(new Types.ObjectId(userId.toString()), limit);
}

/**
 * Get webhooks for a specific screenshot
 */
export async function getScreenshotWebhooks(
  screenshotId: string | Types.ObjectId
): Promise<IWebhookAttempt[]> {
  return WebhookAttempt.findByScreenshot(new Types.ObjectId(screenshotId.toString()));
}

/**
 * Close the webhook queue connection
 */
export async function closeWebhookQueue(): Promise<void> {
  if (webhookQueue) {
    await webhookQueue.close();
    webhookQueue = null;
    logger.info('Webhook queue closed');
  }
}

/**
 * Get queue statistics
 */
export async function getWebhookQueueStats(): Promise<{
  waiting: number;
  active: number;
  completed: number;
  failed: number;
  delayed: number;
}> {
  const queue = getWebhookQueue();
  const [waiting, active, completed, failed, delayed] = await Promise.all([
    queue.getWaitingCount(),
    queue.getActiveCount(),
    queue.getCompletedCount(),
    queue.getFailedCount(),
    queue.getDelayedCount(),
  ]);

  return { waiting, active, completed, failed, delayed };
}

export { webhookQueue };
