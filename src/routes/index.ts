/**
 * Routes Index
 * Configures and exports all API routes
 */

import { Router, Request, Response } from 'express';
import authRoutes from './auth.routes';
import screenshotRoutes from './screenshot.routes';
import subscriptionRoutes from './subscription.routes';
import analyticsRoutes from './analytics.routes';

const router = Router();

// ============================================
// API Routes
// ============================================

// Auth routes
router.use('/auth', authRoutes);

// Screenshot routes
router.use('/screenshots', screenshotRoutes);

// Subscription routes
router.use('/subscriptions', subscriptionRoutes);

// Analytics routes
router.use('/analytics', analyticsRoutes);

// Health check
router.get('/health', (_req: Request, res: Response) => {
  res.json({
    success: true,
    status: 'healthy',
    timestamp: new Date().toISOString(),
  });
});

// API info
router.get('/', (_req: Request, res: Response) => {
  res.json({
    success: true,
    name: 'Screenshot API',
    version: 'v1',
    documentation: '/docs',
    endpoints: {
      screenshots: '/api/v1/screenshots',
      auth: '/api/v1/auth',
      users: '/api/v1/users',
      subscriptions: '/api/v1/subscriptions',
      analytics: '/api/v1/analytics',
    },
  });
});

export default router;
