/**
 * Alert Manager Tests
 */

import { AlertManager, AlertLevel, Alert } from '../../../src/utils/alerts';

describe('AlertManager', () => {
  let alertManager: AlertManager;

  beforeEach(() => {
    alertManager = new AlertManager({
      maxAlerts: 100,
      webhookEnabled: false,
      cooldownMs: 100, // Short cooldown for testing
    });
  });

  afterEach(() => {
    alertManager.clear();
  });

  describe('send', () => {
    it('should create and store an alert', async () => {
      const alert = await alertManager.send('warning', 'test-service', 'Test alert message');

      expect(alert).not.toBeNull();
      expect(alert?.level).toBe('warning');
      expect(alert?.service).toBe('test-service');
      expect(alert?.message).toBe('Test alert message');
      expect(alert?.id).toBeDefined();
      expect(alert?.timestamp).toBeInstanceOf(Date);
    });

    it('should include details in alert', async () => {
      const details = { key: 'value', count: 42 };
      const alert = await alertManager.send('error', 'test-service', 'Test message', details);

      expect(alert?.details).toEqual(details);
    });

    it('should suppress duplicate alerts within cooldown', async () => {
      await alertManager.send('warning', 'test-service', 'Same message');
      const secondAlert = await alertManager.send('warning', 'test-service', 'Same message');

      expect(secondAlert).toBeNull();
    });

    it('should allow same alert after cooldown expires', async () => {
      await alertManager.send('warning', 'test-service', 'Same message');

      // Wait for cooldown
      await new Promise((resolve) => setTimeout(resolve, 150));

      const secondAlert = await alertManager.send('warning', 'test-service', 'Same message');
      expect(secondAlert).not.toBeNull();
    });

    it('should allow different alerts', async () => {
      const alert1 = await alertManager.send('warning', 'service-1', 'Message 1');
      const alert2 = await alertManager.send('error', 'service-1', 'Message 2');
      const alert3 = await alertManager.send('warning', 'service-2', 'Message 1');

      expect(alert1).not.toBeNull();
      expect(alert2).not.toBeNull();
      expect(alert3).not.toBeNull();
    });

    it('should trim old alerts when exceeding max', async () => {
      const smallManager = new AlertManager({ maxAlerts: 3, webhookEnabled: false, cooldownMs: 0 });

      for (let i = 0; i < 5; i++) {
        await smallManager.send('info', 'test', `Alert ${i}`);
      }

      const allAlerts = smallManager.getAllAlerts();
      expect(allAlerts.length).toBe(3);
      expect(allAlerts[0].message).toBe('Alert 2'); // First two were trimmed
    });
  });

  describe('acknowledge', () => {
    it('should acknowledge an alert', async () => {
      const alert = await alertManager.send('warning', 'test', 'Test message');

      const result = alertManager.acknowledge(alert!.id, 'test-user');

      expect(result).toBe(true);

      const acknowledged = alertManager.getAllAlerts().find((a) => a.id === alert!.id);
      expect(acknowledged?.acknowledged).toBe(true);
      expect(acknowledged?.acknowledgedBy).toBe('test-user');
      expect(acknowledged?.acknowledgedAt).toBeInstanceOf(Date);
    });

    it('should return false for non-existent alert', () => {
      const result = alertManager.acknowledge('non-existent-id');
      expect(result).toBe(false);
    });
  });

  describe('getRecentAlerts', () => {
    it('should return alerts from last N minutes', async () => {
      await alertManager.send('info', 'test', 'Recent alert');

      const recent = alertManager.getRecentAlerts(60);
      expect(recent.length).toBe(1);
    });

    it('should exclude old alerts', async () => {
      // Create an old alert by manipulating timestamp
      const oldAlert: Alert = {
        id: 'old-alert',
        level: 'info',
        service: 'test',
        message: 'Old alert',
        timestamp: new Date(Date.now() - 120 * 60 * 1000), // 2 hours ago
        acknowledged: false,
      };

      // Access private alerts array (for testing)
      (alertManager as any).alerts.push(oldAlert);

      await alertManager.send('info', 'test', 'New alert');

      const recent = alertManager.getRecentAlerts(60);
      expect(recent.length).toBe(1);
      expect(recent[0].message).toBe('New alert');
    });
  });

  describe('getAlertsByLevel', () => {
    it('should filter by level', async () => {
      await alertManager.send('info', 'test', 'Info alert');
      await alertManager.send('warning', 'test', 'Warning alert');
      await alertManager.send('error', 'test', 'Error alert');

      const warnings = alertManager.getAlertsByLevel('warning');
      expect(warnings.length).toBe(1);
      expect(warnings[0].level).toBe('warning');
    });
  });

  describe('getAlertsByService', () => {
    it('should filter by service', async () => {
      await alertManager.send('info', 'service-a', 'Alert A');
      await alertManager.send('info', 'service-b', 'Alert B');
      await alertManager.send('warning', 'service-a', 'Alert A2');

      const serviceA = alertManager.getAlertsByService('service-a');
      expect(serviceA.length).toBe(2);
      expect(serviceA.every((a) => a.service === 'service-a')).toBe(true);
    });
  });

  describe('getUnacknowledgedAlerts', () => {
    it('should return only unacknowledged alerts', async () => {
      const alert1 = await alertManager.send('info', 'test', 'Alert 1');
      await alertManager.send('info', 'test', 'Alert 2');

      alertManager.acknowledge(alert1!.id);

      const unacked = alertManager.getUnacknowledgedAlerts();
      expect(unacked.length).toBe(1);
      expect(unacked[0].message).toBe('Alert 2');
    });
  });

  describe('getAllAlerts', () => {
    it('should return all alerts', async () => {
      await alertManager.send('info', 'test', 'Alert 1');
      await alertManager.send('warning', 'test', 'Alert 2');

      const all = alertManager.getAllAlerts();
      expect(all.length).toBe(2);
    });

    it('should return a copy of the array', async () => {
      await alertManager.send('info', 'test', 'Alert 1');

      const all = alertManager.getAllAlerts();
      all.push({
        id: 'fake',
        level: 'info',
        service: 'test',
        message: 'Fake',
        timestamp: new Date(),
      });

      expect(alertManager.getAllAlerts().length).toBe(1);
    });
  });

  describe('clear', () => {
    it('should clear all alerts', async () => {
      await alertManager.send('info', 'test', 'Alert 1');
      await alertManager.send('info', 'test', 'Alert 2');

      alertManager.clear();

      expect(alertManager.getAllAlerts().length).toBe(0);
    });
  });

  describe('getStats', () => {
    it('should return correct statistics', async () => {
      await alertManager.send('info', 'test', 'Info alert');
      await alertManager.send('warning', 'test', 'Warning alert');
      await alertManager.send('error', 'test', 'Error alert');
      await alertManager.send('critical', 'test', 'Critical alert');

      const alert = (await alertManager.send('info', 'test', 'Ackable')) as Alert;
      alertManager.acknowledge(alert.id);

      const stats = alertManager.getStats();
      expect(stats.total).toBe(5);
      expect(stats.byLevel.info).toBe(2);
      expect(stats.byLevel.warning).toBe(1);
      expect(stats.byLevel.error).toBe(1);
      expect(stats.byLevel.critical).toBe(1);
      expect(stats.unacknowledged).toBe(4);
      expect(stats.lastHour).toBe(5);
    });
  });

  describe('Alert levels', () => {
    const levels: AlertLevel[] = ['info', 'warning', 'error', 'critical'];

    levels.forEach((level) => {
      it(`should handle ${level} level`, async () => {
        const alert = await alertManager.send(level, 'test', `${level} message`);
        expect(alert?.level).toBe(level);
      });
    });
  });
});
