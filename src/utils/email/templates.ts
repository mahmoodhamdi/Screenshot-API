/**
 * Email Templates
 * HTML email templates for various notifications
 */

import { config } from '@config/index';

/**
 * Base styles for all email templates
 */
const baseStyles = `
  body {
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    line-height: 1.6;
    color: #1a1a2e;
    margin: 0;
    padding: 0;
    background-color: #f3f4f6;
  }
  .container {
    max-width: 600px;
    margin: 0 auto;
    padding: 40px 20px;
  }
  .header {
    text-align: center;
    margin-bottom: 32px;
  }
  .logo {
    font-size: 24px;
    font-weight: 700;
    color: #6366f1;
    text-decoration: none;
  }
  .content {
    background: #ffffff;
    border-radius: 12px;
    padding: 40px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  }
  h1 {
    font-size: 24px;
    font-weight: 700;
    color: #1a1a2e;
    margin: 0 0 20px;
  }
  p {
    color: #4b5563;
    margin: 0 0 16px;
  }
  .button {
    display: inline-block;
    background: linear-gradient(135deg, #6366f1, #8b5cf6);
    color: #ffffff !important;
    padding: 14px 28px;
    border-radius: 8px;
    text-decoration: none;
    font-weight: 600;
    margin: 20px 0;
  }
  .button:hover {
    background: linear-gradient(135deg, #4f46e5, #7c3aed);
  }
  .footer {
    text-align: center;
    margin-top: 32px;
    color: #9ca3af;
    font-size: 13px;
  }
  .footer a {
    color: #6366f1;
    text-decoration: none;
  }
  .warning {
    background: #fef3c7;
    border-left: 4px solid #f59e0b;
    padding: 12px 16px;
    margin: 20px 0;
    border-radius: 0 8px 8px 0;
    color: #92400e;
  }
  .success {
    background: #d1fae5;
    border-left: 4px solid #10b981;
    padding: 12px 16px;
    margin: 20px 0;
    border-radius: 0 8px 8px 0;
    color: #065f46;
  }
  .info {
    background: #dbeafe;
    border-left: 4px solid #3b82f6;
    padding: 12px 16px;
    margin: 20px 0;
    border-radius: 0 8px 8px 0;
    color: #1e40af;
  }
  table {
    width: 100%;
    border-collapse: collapse;
    margin: 20px 0;
  }
  td {
    padding: 12px 0;
    border-bottom: 1px solid #e5e7eb;
  }
  .small {
    font-size: 12px;
    color: #9ca3af;
  }
  .center {
    text-align: center;
  }
  ul, ol {
    color: #4b5563;
    padding-left: 20px;
  }
  li {
    margin-bottom: 8px;
  }
`;

/**
 * Base layout wrapper for all emails
 */
const layout = (content: string): string => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>Screenshot API</title>
  <style>${baseStyles}</style>
</head>
<body>
  <div class="container">
    <div class="header">
      <a href="${config.apiUrl}" class="logo">Screenshot API</a>
    </div>
    <div class="content">
      ${content}
    </div>
    <div class="footer">
      <p>&copy; ${new Date().getFullYear()} Screenshot API. All rights reserved.</p>
      <p>If you didn't request this email, please ignore it or <a href="${config.apiUrl}/support">contact support</a>.</p>
    </div>
  </div>
</body>
</html>
`;

/**
 * Email template interfaces
 */
export interface PasswordResetTemplateData {
  resetUrl: string;
  expiresIn: string;
}

export interface EmailVerificationTemplateData {
  verifyUrl: string;
}

export interface WelcomeTemplateData {
  name: string;
}

export interface PaymentFailedTemplateData {
  planName: string;
  amount: string;
  retryDate?: string;
}

export interface SubscriptionChangedTemplateData {
  oldPlan: string;
  newPlan: string;
  effectiveDate: string;
}

export interface InvoiceTemplateData {
  invoiceNumber: string;
  amount: string;
  date: string;
  downloadUrl: string;
}

export interface UsageLimitWarningTemplateData {
  currentUsage: number;
  limit: number;
  percentUsed: number;
  planName: string;
}

export interface AccountDeactivatedTemplateData {
  reason: string;
  reactivateUrl: string;
}

/**
 * Email templates
 */
export const emailTemplates = {
  /**
   * Password reset email
   */
  passwordReset: (data: PasswordResetTemplateData): string =>
    layout(`
    <h1>Reset Your Password</h1>
    <p>We received a request to reset your password for your Screenshot API account.</p>
    <p>Click the button below to create a new password:</p>
    <div class="center">
      <a href="${data.resetUrl}" class="button">Reset Password</a>
    </div>
    <p class="warning">
      <strong>This link will expire in ${data.expiresIn}.</strong><br>
      If you didn't request this password reset, you can safely ignore this email.
    </p>
    <p class="small">
      If the button doesn't work, copy and paste this URL into your browser:<br>
      <a href="${data.resetUrl}" style="color: #6366f1; word-break: break-all;">${data.resetUrl}</a>
    </p>
  `),

  /**
   * Email verification
   */
  emailVerification: (data: EmailVerificationTemplateData): string =>
    layout(`
    <h1>Verify Your Email</h1>
    <p>Thanks for signing up for Screenshot API!</p>
    <p>Please verify your email address by clicking the button below:</p>
    <div class="center">
      <a href="${data.verifyUrl}" class="button">Verify Email</a>
    </div>
    <p class="info">
      Verifying your email helps us keep your account secure and ensures you receive important notifications.
    </p>
    <p class="small">
      If the button doesn't work, copy and paste this URL into your browser:<br>
      <a href="${data.verifyUrl}" style="color: #6366f1; word-break: break-all;">${data.verifyUrl}</a>
    </p>
  `),

  /**
   * Welcome email
   */
  welcome: (data: WelcomeTemplateData): string =>
    layout(`
    <h1>Welcome to Screenshot API!</h1>
    <p>Hi ${data.name},</p>
    <p>We're excited to have you on board! Screenshot API makes it easy to capture high-quality screenshots of any website programmatically.</p>
    <p><strong>Here's how to get started:</strong></p>
    <ol>
      <li><strong>Create an API key</strong> in your dashboard</li>
      <li><strong>Make your first screenshot</strong> using our simple API</li>
      <li><strong>Explore the documentation</strong> for advanced features like full-page capture, custom viewports, and more</li>
    </ol>
    <div class="center">
      <a href="${config.apiUrl}/dashboard" class="button">Go to Dashboard</a>
    </div>
    <p>Need help? Check out our <a href="${config.apiUrl}/developer" style="color: #6366f1;">Developer Portal</a> for code examples in 10+ languages, or reply to this email.</p>
    <p class="success">
      <strong>Pro tip:</strong> Start with our free tier to explore the API, then upgrade as your needs grow.
    </p>
  `),

  /**
   * Payment failed notification
   */
  paymentFailed: (data: PaymentFailedTemplateData): string =>
    layout(`
    <h1>Payment Failed</h1>
    <p>We were unable to process your payment for the <strong>${data.planName}</strong> plan.</p>
    <table>
      <tr>
        <td>Plan</td>
        <td style="text-align: right; font-weight: 600;">${data.planName}</td>
      </tr>
      <tr>
        <td>Amount</td>
        <td style="text-align: right; font-weight: 600;">${data.amount}</td>
      </tr>
      ${
        data.retryDate
          ? `
      <tr>
        <td>Next Retry</td>
        <td style="text-align: right;">${data.retryDate}</td>
      </tr>
      `
          : ''
      }
    </table>
    <p class="warning">
      ${
        data.retryDate
          ? `We'll automatically retry on ${data.retryDate}. Please update your payment method before then to avoid service interruption.`
          : 'Please update your payment method to continue your subscription and avoid service interruption.'
      }
    </p>
    <div class="center">
      <a href="${config.apiUrl}/dashboard/billing" class="button">Update Payment Method</a>
    </div>
    <p>If you have questions about your subscription or believe this is an error, please <a href="${config.apiUrl}/support" style="color: #6366f1;">contact support</a>.</p>
  `),

  /**
   * Subscription changed notification
   */
  subscriptionChanged: (data: SubscriptionChangedTemplateData): string =>
    layout(`
    <h1>Subscription Updated</h1>
    <p class="success">
      <strong>Your subscription has been successfully updated!</strong>
    </p>
    <table>
      <tr>
        <td>Previous Plan</td>
        <td style="text-align: right;">${data.oldPlan}</td>
      </tr>
      <tr>
        <td>New Plan</td>
        <td style="text-align: right; font-weight: 600; color: #6366f1;">${data.newPlan}</td>
      </tr>
      <tr>
        <td>Effective Date</td>
        <td style="text-align: right;">${data.effectiveDate}</td>
      </tr>
    </table>
    <p>Your new plan features are now active. You can view your updated limits and features in your dashboard.</p>
    <div class="center">
      <a href="${config.apiUrl}/dashboard/billing" class="button">View Subscription</a>
    </div>
  `),

  /**
   * Invoice notification
   */
  invoice: (data: InvoiceTemplateData): string =>
    layout(`
    <h1>Invoice ${data.invoiceNumber}</h1>
    <p>Your invoice is ready for download.</p>
    <table>
      <tr>
        <td>Invoice Number</td>
        <td style="text-align: right;">${data.invoiceNumber}</td>
      </tr>
      <tr>
        <td>Amount</td>
        <td style="text-align: right; font-weight: 600;">${data.amount}</td>
      </tr>
      <tr>
        <td>Date</td>
        <td style="text-align: right;">${data.date}</td>
      </tr>
    </table>
    <div class="center">
      <a href="${data.downloadUrl}" class="button">Download Invoice</a>
    </div>
    <p class="small">
      You can also view all your invoices in your <a href="${config.apiUrl}/dashboard/billing" style="color: #6366f1;">billing dashboard</a>.
    </p>
  `),

  /**
   * Usage limit warning
   */
  usageLimitWarning: (data: UsageLimitWarningTemplateData): string =>
    layout(`
    <h1>Usage Limit Warning</h1>
    <p>You're approaching your monthly screenshot limit on your <strong>${data.planName}</strong> plan.</p>
    <table>
      <tr>
        <td>Current Usage</td>
        <td style="text-align: right; font-weight: 600;">${data.currentUsage.toLocaleString()} screenshots</td>
      </tr>
      <tr>
        <td>Monthly Limit</td>
        <td style="text-align: right;">${data.limit.toLocaleString()} screenshots</td>
      </tr>
      <tr>
        <td>Usage</td>
        <td style="text-align: right; font-weight: 600; color: ${data.percentUsed >= 90 ? '#dc2626' : '#f59e0b'};">${data.percentUsed}%</td>
      </tr>
    </table>
    <p class="warning">
      Once you reach your limit, additional screenshot requests will be rejected until your usage resets next month.
    </p>
    <p>Consider upgrading your plan to increase your limits and unlock additional features.</p>
    <div class="center">
      <a href="${config.apiUrl}/dashboard/billing" class="button">Upgrade Plan</a>
    </div>
  `),

  /**
   * Account deactivated notification
   */
  accountDeactivated: (data: AccountDeactivatedTemplateData): string =>
    layout(`
    <h1>Account Deactivated</h1>
    <p>Your Screenshot API account has been deactivated.</p>
    <p class="warning">
      <strong>Reason:</strong> ${data.reason}
    </p>
    <p>If you believe this was done in error or would like to reactivate your account, please click the button below:</p>
    <div class="center">
      <a href="${data.reactivateUrl}" class="button">Reactivate Account</a>
    </div>
    <p>If you have questions, please <a href="${config.apiUrl}/support" style="color: #6366f1;">contact our support team</a>.</p>
  `),
};

export default emailTemplates;
