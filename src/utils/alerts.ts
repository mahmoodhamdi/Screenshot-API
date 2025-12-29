/**
 * Alert Manager
 * Handles system alerts for monitoring and incident response
 */

import logger from './logger';

// ============================================
// Types and Interfaces
// ============================================

export type AlertLevel = 'info' | 'warning' | 'error' | 'critical';

export interface Alert {
  id: string;
  level: AlertLevel;
  service: string;
  message: string;
  timestamp: Date;
  details?: Record<string, unknown>;
  acknowledged?: boolean;
  acknowledgedAt?: Date;
  acknowledgedBy?: string;
}

export interface AlertManagerConfig {
  /** Maximum number of alerts to keep in memory */
  maxAlerts: number;
  /** Alert webhook URL for external notifications */
  webhookUrl?: string;
  /** Enable webhook notifications */
  webhookEnabled: boolean;
  /** Cooldown period in ms between duplicate alerts */
  cooldownMs: number;
}

// ============================================
// Alert Manager Class
// ============================================

export class AlertManager {
  private alerts: Alert[] = [];
  private lastAlertTime: Map<string, number> = new Map();
  private config: AlertManagerConfig;

  constructor(config: Partial<AlertManagerConfig> = {}) {
    this.config = {
      maxAlerts: config.maxAlerts ?? 1000,
      webhookUrl: config.webhookUrl ?? process.env.ALERT_WEBHOOK_URL,
      webhookEnabled: config.webhookEnabled ?? !!process.env.ALERT_WEBHOOK_URL,
      cooldownMs: config.cooldownMs ?? 60000, // 1 minute default cooldown
    };
  }

  /**
   * Generate a unique alert ID
   */
  private generateId(): string {
    return `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get alert signature for deduplication
   */
  private getAlertSignature(alert: Omit<Alert, 'id' | 'timestamp'>): string {
    return `${alert.level}:${alert.service}:${alert.message}`;
  }

  /**
   * Check if alert is within cooldown period
   */
  private isInCooldown(signature: string): boolean {
    const lastTime = this.lastAlertTime.get(signature);
    if (!lastTime) return false;
    return Date.now() - lastTime < this.config.cooldownMs;
  }

  /**
   * Send an alert
   */
  async send(
    level: AlertLevel,
    service: string,
    message: string,
    details?: Record<string, unknown>
  ): Promise<Alert | null> {
    const alertData = { level, service, message, details };
    const signature = this.getAlertSignature(alertData);

    // Check cooldown to prevent alert flooding
    if (this.isInCooldown(signature)) {
      logger.debug(`Alert suppressed (cooldown): ${message}`, { service, level });
      return null;
    }

    const alert: Alert = {
      id: this.generateId(),
      level,
      service,
      message,
      timestamp: new Date(),
      details,
      acknowledged: false,
    };

    // Store alert
    this.alerts.push(alert);
    this.lastAlertTime.set(signature, Date.now());

    // Trim old alerts if exceeding max
    if (this.alerts.length > this.config.maxAlerts) {
      this.alerts = this.alerts.slice(-this.config.maxAlerts);
    }

    // Log the alert
    const logLevel = level === 'critical' ? 'error' : level;
    logger.log(logLevel, `[ALERT] ${service}: ${message}`, {
      alertId: alert.id,
      ...details,
    });

    // Send to webhook if configured
    if (this.config.webhookEnabled && this.config.webhookUrl) {
      await this.sendWebhook(alert);
    }

    return alert;
  }

  /**
   * Send alert to webhook
   */
  private async sendWebhook(alert: Alert): Promise<void> {
    if (!this.config.webhookUrl) return;

    try {
      const response = await fetch(this.config.webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: `[${alert.level.toUpperCase()}] ${alert.service}: ${alert.message}`,
          attachments: [
            {
              color: this.getLevelColor(alert.level),
              fields: [
                { title: 'Service', value: alert.service, short: true },
                { title: 'Level', value: alert.level, short: true },
                { title: 'Timestamp', value: alert.timestamp.toISOString(), short: true },
                ...(alert.details
                  ? Object.entries(alert.details).map(([key, value]) => ({
                      title: key,
                      value: String(value),
                      short: true,
                    }))
                  : []),
              ],
            },
          ],
        }),
      });

      if (!response.ok) {
        logger.error('Failed to send alert webhook', {
          status: response.status,
          alertId: alert.id,
        });
      }
    } catch (error) {
      logger.error('Error sending alert webhook', {
        error: error instanceof Error ? error.message : 'Unknown error',
        alertId: alert.id,
      });
    }
  }

  /**
   * Get color for alert level (for Slack/webhook formatting)
   */
  private getLevelColor(level: AlertLevel): string {
    switch (level) {
      case 'info':
        return '#2196F3'; // Blue
      case 'warning':
        return '#FF9800'; // Orange
      case 'error':
        return '#F44336'; // Red
      case 'critical':
        return '#9C27B0'; // Purple
      default:
        return '#9E9E9E'; // Grey
    }
  }

  /**
   * Acknowledge an alert
   */
  acknowledge(alertId: string, acknowledgedBy?: string): boolean {
    const alert = this.alerts.find((a) => a.id === alertId);
    if (!alert) return false;

    alert.acknowledged = true;
    alert.acknowledgedAt = new Date();
    alert.acknowledgedBy = acknowledgedBy;

    logger.info(`Alert acknowledged: ${alertId}`, { acknowledgedBy });
    return true;
  }

  /**
   * Get recent alerts
   */
  getRecentAlerts(minutes: number = 60): Alert[] {
    const cutoff = Date.now() - minutes * 60 * 1000;
    return this.alerts.filter((a) => a.timestamp.getTime() > cutoff);
  }

  /**
   * Get alerts by level
   */
  getAlertsByLevel(level: AlertLevel): Alert[] {
    return this.alerts.filter((a) => a.level === level);
  }

  /**
   * Get alerts by service
   */
  getAlertsByService(service: string): Alert[] {
    return this.alerts.filter((a) => a.service === service);
  }

  /**
   * Get unacknowledged alerts
   */
  getUnacknowledgedAlerts(): Alert[] {
    return this.alerts.filter((a) => !a.acknowledged);
  }

  /**
   * Get all alerts
   */
  getAllAlerts(): Alert[] {
    return [...this.alerts];
  }

  /**
   * Clear all alerts
   */
  clear(): void {
    this.alerts = [];
    this.lastAlertTime.clear();
    logger.info('All alerts cleared');
  }

  /**
   * Get alert statistics
   */
  getStats(): {
    total: number;
    byLevel: Record<AlertLevel, number>;
    unacknowledged: number;
    lastHour: number;
  } {
    const oneHourAgo = Date.now() - 60 * 60 * 1000;

    return {
      total: this.alerts.length,
      byLevel: {
        info: this.alerts.filter((a) => a.level === 'info').length,
        warning: this.alerts.filter((a) => a.level === 'warning').length,
        error: this.alerts.filter((a) => a.level === 'error').length,
        critical: this.alerts.filter((a) => a.level === 'critical').length,
      },
      unacknowledged: this.alerts.filter((a) => !a.acknowledged).length,
      lastHour: this.alerts.filter((a) => a.timestamp.getTime() > oneHourAgo).length,
    };
  }
}

// ============================================
// Singleton Instance
// ============================================

export const alertManager = new AlertManager();

// ============================================
// Convenience Functions
// ============================================

/**
 * Alert when Redis circuit breaker opens
 */
export const alertRedisCircuitOpen = async (): Promise<void> => {
  await alertManager.send(
    'critical',
    'redis',
    'Redis circuit breaker opened - using fallback rate limiting',
    {
      fallbackMode: true,
      recoveryEstimate: '30 seconds',
    }
  );
};

/**
 * Alert when Redis circuit breaker closes (recovered)
 */
export const alertRedisCircuitClosed = async (): Promise<void> => {
  await alertManager.send('info', 'redis', 'Redis circuit breaker closed - service recovered', {
    fallbackMode: false,
  });
};

/**
 * Alert when Redis health check fails
 */
export const alertRedisHealthFailed = async (error: string): Promise<void> => {
  await alertManager.send('error', 'redis', 'Redis health check failed', {
    error,
  });
};

/**
 * Alert when Redis latency is high
 */
export const alertRedisHighLatency = async (latencyMs: number): Promise<void> => {
  await alertManager.send('warning', 'redis', `Redis latency is high: ${latencyMs}ms`, {
    latencyMs,
    threshold: 100,
  });
};

/**
 * Alert when rate limiting is degraded
 */
export const alertRateLimitingDegraded = async (): Promise<void> => {
  await alertManager.send(
    'warning',
    'rate-limiter',
    'Rate limiting operating in degraded mode (in-memory fallback)',
    {
      mode: 'fallback',
    }
  );
};

export default AlertManager;
