/**
 * Email Service
 * Handles email sending with nodemailer
 */

import nodemailer, { Transporter } from 'nodemailer';
import { config } from '@config/index';
import { logger } from '@utils/logger';
import {
  emailTemplates,
  PasswordResetTemplateData,
  EmailVerificationTemplateData,
  WelcomeTemplateData,
  PaymentFailedTemplateData,
  SubscriptionChangedTemplateData,
  InvoiceTemplateData,
  UsageLimitWarningTemplateData,
  AccountDeactivatedTemplateData,
} from '@utils/email/templates';

/**
 * Email options interface
 */
export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

/**
 * Email send result
 */
export interface EmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

/**
 * Email Service class
 */
export class EmailService {
  private transporter: Transporter | null = null;
  private initialized: boolean = false;
  private initializationError: Error | null = null;

  /**
   * Check if email service is configured
   */
  isConfigured(): boolean {
    return !!(config.email.host && config.email.user && config.email.pass);
  }

  /**
   * Initialize the email transporter
   */
  async initialize(): Promise<void> {
    if (this.initialized) return;

    // If no email config, skip initialization
    if (!this.isConfigured()) {
      logger.warn('Email service not configured - emails will be logged but not sent');
      return;
    }

    try {
      this.transporter = nodemailer.createTransport({
        host: config.email.host,
        port: config.email.port || 587,
        secure: (config.email.port || 587) === 465,
        auth: {
          user: config.email.user,
          pass: config.email.pass,
        },
      });

      // Verify connection configuration
      await this.transporter.verify();
      this.initialized = true;
      logger.info('Email service initialized successfully');
    } catch (error) {
      this.initializationError = error as Error;
      logger.error('Failed to initialize email service', {
        error: (error as Error).message,
      });
      // Don't throw - allow the service to run without email
    }
  }

  /**
   * Convert HTML to plain text
   */
  private htmlToText(html: string): string {
    return html
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .trim();
  }

  /**
   * Send an email
   */
  async send(options: EmailOptions): Promise<EmailResult> {
    // Log email details in development/test
    if (config.env !== 'production') {
      logger.info('Email would be sent', {
        to: options.to,
        subject: options.subject,
        hasHtml: !!options.html,
      });
    }

    // If not configured, log and return success (for development)
    if (!this.isConfigured()) {
      logger.debug('Email service not configured, skipping send', {
        to: options.to,
        subject: options.subject,
      });
      return {
        success: true,
        messageId: `dev-${Date.now()}`,
      };
    }

    // Initialize if not already done
    if (!this.initialized && !this.initializationError) {
      await this.initialize();
    }

    // If initialization failed, return error
    if (this.initializationError || !this.transporter) {
      return {
        success: false,
        error: this.initializationError?.message || 'Email service not initialized',
      };
    }

    try {
      const result = await this.transporter.sendMail({
        from: config.email.from
          ? `"Screenshot API" <${config.email.from}>`
          : '"Screenshot API" <noreply@screenshot-api.com>',
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text || this.htmlToText(options.html),
      });

      logger.info('Email sent successfully', {
        to: options.to,
        subject: options.subject,
        messageId: result.messageId,
      });

      return {
        success: true,
        messageId: result.messageId,
      };
    } catch (error) {
      const err = error as Error;
      logger.error('Failed to send email', {
        to: options.to,
        subject: options.subject,
        error: err.message,
      });

      return {
        success: false,
        error: err.message,
      };
    }
  }

  /**
   * Send password reset email
   */
  async sendPasswordResetEmail(email: string, token: string): Promise<EmailResult> {
    const resetUrl = `${config.apiUrl}/reset-password?token=${token}`;
    const data: PasswordResetTemplateData = {
      resetUrl,
      expiresIn: '1 hour',
    };

    return this.send({
      to: email,
      subject: 'Reset Your Password - Screenshot API',
      html: emailTemplates.passwordReset(data),
    });
  }

  /**
   * Send email verification email
   */
  async sendVerificationEmail(email: string, token: string): Promise<EmailResult> {
    const verifyUrl = `${config.apiUrl}/verify-email?token=${token}`;
    const data: EmailVerificationTemplateData = {
      verifyUrl,
    };

    return this.send({
      to: email,
      subject: 'Verify Your Email - Screenshot API',
      html: emailTemplates.emailVerification(data),
    });
  }

  /**
   * Send welcome email
   */
  async sendWelcomeEmail(email: string, name: string): Promise<EmailResult> {
    const data: WelcomeTemplateData = {
      name,
    };

    return this.send({
      to: email,
      subject: 'Welcome to Screenshot API!',
      html: emailTemplates.welcome(data),
    });
  }

  /**
   * Send payment failed email
   */
  async sendPaymentFailedEmail(
    email: string,
    details: PaymentFailedTemplateData
  ): Promise<EmailResult> {
    return this.send({
      to: email,
      subject: 'Payment Failed - Screenshot API',
      html: emailTemplates.paymentFailed(details),
    });
  }

  /**
   * Send subscription changed email
   */
  async sendSubscriptionChangedEmail(
    email: string,
    details: SubscriptionChangedTemplateData
  ): Promise<EmailResult> {
    return this.send({
      to: email,
      subject: 'Subscription Updated - Screenshot API',
      html: emailTemplates.subscriptionChanged(details),
    });
  }

  /**
   * Send invoice email
   */
  async sendInvoiceEmail(email: string, details: InvoiceTemplateData): Promise<EmailResult> {
    return this.send({
      to: email,
      subject: `Invoice ${details.invoiceNumber} - Screenshot API`,
      html: emailTemplates.invoice(details),
    });
  }

  /**
   * Send usage limit warning email
   */
  async sendUsageLimitWarningEmail(
    email: string,
    details: UsageLimitWarningTemplateData
  ): Promise<EmailResult> {
    return this.send({
      to: email,
      subject: 'Usage Limit Warning - Screenshot API',
      html: emailTemplates.usageLimitWarning(details),
    });
  }

  /**
   * Send account deactivated email
   */
  async sendAccountDeactivatedEmail(
    email: string,
    details: AccountDeactivatedTemplateData
  ): Promise<EmailResult> {
    return this.send({
      to: email,
      subject: 'Account Deactivated - Screenshot API',
      html: emailTemplates.accountDeactivated(details),
    });
  }

  /**
   * Close the transporter connection
   */
  close(): void {
    if (this.transporter) {
      this.transporter.close();
      this.transporter = null;
      this.initialized = false;
      logger.info('Email service closed');
    }
  }
}

// Singleton instance
export const emailService = new EmailService();

export default emailService;
