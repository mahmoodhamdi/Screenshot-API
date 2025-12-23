/**
 * Express Application Setup
 * This file will be fully implemented in Phase 8.
 * For now, it exports a minimal Express app to verify the build works.
 */

import express, { Application, Request, Response } from 'express';

const app: Application = express();

// Basic middleware
app.use(express.json());

// Health check endpoint
app.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: 'Screenshot API is running',
    timestamp: new Date().toISOString(),
  });
});

export default app;
