/**
 * Email Queue
 * Bull-based queue for reliable email delivery with retry logic
 */

import Bull, { Job, Queue } from 'bull';
import { config } from '@config/index';
import { emailService } from '@services/email.service';
import { logger } from '@utils/logger';
import {
  PaymentFailedTemplateData,
  SubscriptionChangedTemplateData,
  InvoiceTemplateData,
  UsageLimitWarningTemplateData,
  AccountDeactivatedTemplateData,
} from '@utils/email/templates';

/**
 * Email job types
 */
export type EmailJobType =
  | 'passwordReset'
  | 'verification'
  | 'welcome'
  | 'paymentFailed'
  | 'subscriptionChanged'
  | 'invoice'
  | 'usageLimitWarning'
  | 'accountDeactivated';

/**
 * Email job data interface
 */
export interface EmailJobData {
  type: EmailJobType;
  to: string;
  data: Record<string, unknown>;
}

/**
 * Email queue instance
 */
let emailQueue: Queue<EmailJobData> | null = null;

/**
 * Get or create the email queue
 */
export function getEmailQueue(): Queue<EmailJobData> {
  if (emailQueue) {
    return emailQueue;
  }

  // Create queue with Redis connection
  emailQueue = new Bull<EmailJobData>('email', {
    redis: {
      host: config.redis.host,
      port: config.redis.port,
      password: config.redis.password || undefined,
      db: config.redis.db,
    },
    defaultJobOptions: {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 2000, // Start with 2 second delay
      },
      removeOnComplete: 100, // Keep last 100 completed jobs
      removeOnFail: 500, // Keep last 500 failed jobs for debugging
    },
  });

  // Process email jobs
  emailQueue.process(async (job: Job<EmailJobData>) => {
    const { type, to, data } = job.data;

    logger.info('Processing email job', {
      jobId: job.id,
      type,
      to,
      attempt: job.attemptsMade + 1,
    });

    let result;

    switch (type) {
      case 'passwordReset':
        result = await emailService.sendPasswordResetEmail(to, data.token as string);
        break;

      case 'verification':
        result = await emailService.sendVerificationEmail(to, data.token as string);
        break;

      case 'welcome':
        result = await emailService.sendWelcomeEmail(to, data.name as string);
        break;

      case 'paymentFailed':
        result = await emailService.sendPaymentFailedEmail(
          to,
          data as unknown as PaymentFailedTemplateData
        );
        break;

      case 'subscriptionChanged':
        result = await emailService.sendSubscriptionChangedEmail(
          to,
          data as unknown as SubscriptionChangedTemplateData
        );
        break;

      case 'invoice':
        result = await emailService.sendInvoiceEmail(to, data as unknown as InvoiceTemplateData);
        break;

      case 'usageLimitWarning':
        result = await emailService.sendUsageLimitWarningEmail(
          to,
          data as unknown as UsageLimitWarningTemplateData
        );
        break;

      case 'accountDeactivated':
        result = await emailService.sendAccountDeactivatedEmail(
          to,
          data as unknown as AccountDeactivatedTemplateData
        );
        break;

      default:
        throw new Error(`Unknown email type: ${type}`);
    }

    if (!result.success) {
      throw new Error(result.error || 'Email send failed');
    }

    return result;
  });

  // Event handlers
  emailQueue.on('completed', (job, result) => {
    logger.info('Email job completed', {
      jobId: job.id,
      type: job.data.type,
      to: job.data.to,
      messageId: result?.messageId,
    });
  });

  emailQueue.on('failed', (job, error) => {
    logger.error('Email job failed', {
      jobId: job.id,
      type: job.data.type,
      to: job.data.to,
      error: error.message,
      attempts: job.attemptsMade,
      maxAttempts: job.opts.attempts,
    });
  });

  emailQueue.on('stalled', (job) => {
    logger.warn('Email job stalled', {
      jobId: job.id,
      type: job.data.type,
      to: job.data.to,
    });
  });

  emailQueue.on('error', (error) => {
    logger.error('Email queue error', { error: error.message });
  });

  logger.info('Email queue initialized');
  return emailQueue;
}

/**
 * Queue helper functions for adding jobs
 */
export const queueEmail = {
  /**
   * Queue a password reset email
   */
  passwordReset: (email: string, token: string) =>
    getEmailQueue().add(
      { type: 'passwordReset', to: email, data: { token } },
      { priority: 1 } // High priority
    ),

  /**
   * Queue a verification email
   */
  verification: (email: string, token: string) =>
    getEmailQueue().add(
      { type: 'verification', to: email, data: { token } },
      { priority: 1 } // High priority
    ),

  /**
   * Queue a welcome email
   */
  welcome: (email: string, name: string) =>
    getEmailQueue().add(
      { type: 'welcome', to: email, data: { name } },
      { priority: 3 } // Lower priority
    ),

  /**
   * Queue a payment failed email
   */
  paymentFailed: (email: string, data: PaymentFailedTemplateData) =>
    getEmailQueue().add(
      { type: 'paymentFailed', to: email, data: { ...data } },
      { priority: 1 } // High priority
    ),

  /**
   * Queue a subscription changed email
   */
  subscriptionChanged: (email: string, data: SubscriptionChangedTemplateData) =>
    getEmailQueue().add(
      { type: 'subscriptionChanged', to: email, data: { ...data } },
      { priority: 2 } // Medium priority
    ),

  /**
   * Queue an invoice email
   */
  invoice: (email: string, data: InvoiceTemplateData) =>
    getEmailQueue().add(
      { type: 'invoice', to: email, data: { ...data } },
      { priority: 2 } // Medium priority
    ),

  /**
   * Queue a usage limit warning email
   */
  usageLimitWarning: (email: string, data: UsageLimitWarningTemplateData) =>
    getEmailQueue().add(
      { type: 'usageLimitWarning', to: email, data: { ...data } },
      { priority: 2 } // Medium priority
    ),

  /**
   * Queue an account deactivated email
   */
  accountDeactivated: (email: string, data: AccountDeactivatedTemplateData) =>
    getEmailQueue().add(
      { type: 'accountDeactivated', to: email, data: { ...data } },
      { priority: 1 } // High priority
    ),
};

/**
 * Close the email queue connection
 */
export async function closeEmailQueue(): Promise<void> {
  if (emailQueue) {
    await emailQueue.close();
    emailQueue = null;
    logger.info('Email queue closed');
  }
}

/**
 * Get queue statistics
 */
export async function getEmailQueueStats(): Promise<{
  waiting: number;
  active: number;
  completed: number;
  failed: number;
  delayed: number;
}> {
  const queue = getEmailQueue();
  const [waiting, active, completed, failed, delayed] = await Promise.all([
    queue.getWaitingCount(),
    queue.getActiveCount(),
    queue.getCompletedCount(),
    queue.getFailedCount(),
    queue.getDelayedCount(),
  ]);

  return { waiting, active, completed, failed, delayed };
}

export { emailQueue };
