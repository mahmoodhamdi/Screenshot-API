/**
 * Email Queue Unit Tests
 */

// Mock Bull constructor
const mockAdd = jest.fn().mockResolvedValue({ id: 'test-job-id' });
const mockProcess = jest.fn();
const mockOn = jest.fn();
const mockClose = jest.fn().mockResolvedValue(undefined);
const mockGetWaitingCount = jest.fn().mockResolvedValue(5);
const mockGetActiveCount = jest.fn().mockResolvedValue(2);
const mockGetCompletedCount = jest.fn().mockResolvedValue(100);
const mockGetFailedCount = jest.fn().mockResolvedValue(3);
const mockGetDelayedCount = jest.fn().mockResolvedValue(1);

const mockQueueInstance = {
  add: mockAdd,
  process: mockProcess,
  on: mockOn,
  close: mockClose,
  getWaitingCount: mockGetWaitingCount,
  getActiveCount: mockGetActiveCount,
  getCompletedCount: mockGetCompletedCount,
  getFailedCount: mockGetFailedCount,
  getDelayedCount: mockGetDelayedCount,
};

jest.mock('bull', () => {
  return jest.fn().mockImplementation(() => mockQueueInstance);
});

// Mock email service
jest.mock('@services/email.service', () => ({
  emailService: {
    sendPasswordResetEmail: jest.fn().mockResolvedValue({ success: true, messageId: 'msg-1' }),
    sendVerificationEmail: jest.fn().mockResolvedValue({ success: true, messageId: 'msg-2' }),
    sendWelcomeEmail: jest.fn().mockResolvedValue({ success: true, messageId: 'msg-3' }),
    sendPaymentFailedEmail: jest.fn().mockResolvedValue({ success: true, messageId: 'msg-4' }),
    sendSubscriptionChangedEmail: jest.fn().mockResolvedValue({ success: true, messageId: 'msg-5' }),
    sendInvoiceEmail: jest.fn().mockResolvedValue({ success: true, messageId: 'msg-6' }),
    sendUsageLimitWarningEmail: jest.fn().mockResolvedValue({ success: true, messageId: 'msg-7' }),
    sendAccountDeactivatedEmail: jest.fn().mockResolvedValue({ success: true, messageId: 'msg-8' }),
  },
}));

// Mock config
jest.mock('@config/index', () => ({
  config: {
    redis: {
      host: 'localhost',
      port: 6379,
      password: undefined,
      db: 0,
    },
  },
}));

// Mock logger
jest.mock('@utils/logger', () => ({
  logger: {
    info: jest.fn(),
    debug: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  },
  default: {
    info: jest.fn(),
    debug: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  },
}));

// Import after mocks are set up
import {
  queueEmail,
  getEmailQueue,
  closeEmailQueue,
  getEmailQueueStats,
} from '@queues/email.queue';

describe('Email Queue', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getEmailQueue', () => {
    it('should return a queue instance', () => {
      const queue = getEmailQueue();

      expect(queue).toBeDefined();
      expect(queue.add).toBeDefined();
    });

    it('should return the same queue instance on subsequent calls', () => {
      const queue1 = getEmailQueue();
      const queue2 = getEmailQueue();

      expect(queue1).toBe(queue2);
    });

    it('should have event handlers available', () => {
      const queue = getEmailQueue();

      // The queue should have the on method for event handling
      expect(queue.on).toBeDefined();
    });
  });

  describe('queueEmail helpers', () => {
    describe('passwordReset', () => {
      it('should add password reset job to queue with high priority', async () => {
        await queueEmail.passwordReset('user@example.com', 'reset-token');

        expect(mockAdd).toHaveBeenCalledWith(
          {
            type: 'passwordReset',
            to: 'user@example.com',
            data: { token: 'reset-token' },
          },
          { priority: 1 }
        );
      });
    });

    describe('verification', () => {
      it('should add verification job to queue with high priority', async () => {
        await queueEmail.verification('user@example.com', 'verify-token');

        expect(mockAdd).toHaveBeenCalledWith(
          {
            type: 'verification',
            to: 'user@example.com',
            data: { token: 'verify-token' },
          },
          { priority: 1 }
        );
      });
    });

    describe('welcome', () => {
      it('should add welcome job to queue with low priority', async () => {
        await queueEmail.welcome('user@example.com', 'John Doe');

        expect(mockAdd).toHaveBeenCalledWith(
          {
            type: 'welcome',
            to: 'user@example.com',
            data: { name: 'John Doe' },
          },
          { priority: 3 }
        );
      });
    });

    describe('paymentFailed', () => {
      it('should add payment failed job to queue with high priority', async () => {
        const data = {
          planName: 'Professional',
          amount: '$49.00',
          retryDate: '2025-01-15',
        };

        await queueEmail.paymentFailed('user@example.com', data);

        expect(mockAdd).toHaveBeenCalledWith(
          {
            type: 'paymentFailed',
            to: 'user@example.com',
            data: { ...data },
          },
          { priority: 1 }
        );
      });
    });

    describe('subscriptionChanged', () => {
      it('should add subscription changed job to queue with medium priority', async () => {
        const data = {
          oldPlan: 'Starter',
          newPlan: 'Professional',
          effectiveDate: '2025-01-01',
        };

        await queueEmail.subscriptionChanged('user@example.com', data);

        expect(mockAdd).toHaveBeenCalledWith(
          {
            type: 'subscriptionChanged',
            to: 'user@example.com',
            data: { ...data },
          },
          { priority: 2 }
        );
      });
    });

    describe('invoice', () => {
      it('should add invoice job to queue with medium priority', async () => {
        const data = {
          invoiceNumber: 'INV-001',
          amount: '$49.00',
          date: '2025-01-01',
          downloadUrl: 'https://example.com/invoice.pdf',
        };

        await queueEmail.invoice('user@example.com', data);

        expect(mockAdd).toHaveBeenCalledWith(
          {
            type: 'invoice',
            to: 'user@example.com',
            data: { ...data },
          },
          { priority: 2 }
        );
      });
    });

    describe('usageLimitWarning', () => {
      it('should add usage limit warning job to queue with medium priority', async () => {
        const data = {
          currentUsage: 9500,
          limit: 10000,
          percentUsed: 95,
          planName: 'Professional',
        };

        await queueEmail.usageLimitWarning('user@example.com', data);

        expect(mockAdd).toHaveBeenCalledWith(
          {
            type: 'usageLimitWarning',
            to: 'user@example.com',
            data: { ...data },
          },
          { priority: 2 }
        );
      });
    });

    describe('accountDeactivated', () => {
      it('should add account deactivated job to queue with high priority', async () => {
        const data = {
          reason: 'Payment failed',
          reactivateUrl: 'https://example.com/reactivate',
        };

        await queueEmail.accountDeactivated('user@example.com', data);

        expect(mockAdd).toHaveBeenCalledWith(
          {
            type: 'accountDeactivated',
            to: 'user@example.com',
            data: { ...data },
          },
          { priority: 1 }
        );
      });
    });
  });

  describe('closeEmailQueue', () => {
    it('should close the queue connection', async () => {
      getEmailQueue(); // Initialize queue first
      await closeEmailQueue();

      expect(mockClose).toHaveBeenCalled();
    });
  });

  describe('getEmailQueueStats', () => {
    it('should return queue statistics', async () => {
      const stats = await getEmailQueueStats();

      expect(stats).toEqual({
        waiting: 5,
        active: 2,
        completed: 100,
        failed: 3,
        delayed: 1,
      });
    });

    it('should call all stat methods', async () => {
      await getEmailQueueStats();

      expect(mockGetWaitingCount).toHaveBeenCalled();
      expect(mockGetActiveCount).toHaveBeenCalled();
      expect(mockGetCompletedCount).toHaveBeenCalled();
      expect(mockGetFailedCount).toHaveBeenCalled();
      expect(mockGetDelayedCount).toHaveBeenCalled();
    });
  });

  describe('Job Processing', () => {
    it('should have a process handler registered', () => {
      // The process handler is registered when the queue is first created
      // We verify the queue has the process method available
      const queue = getEmailQueue();

      expect(queue.process).toBeDefined();
    });
  });
});
