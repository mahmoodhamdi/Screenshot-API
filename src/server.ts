/**
 * Server Entry Point
 * This file will be fully implemented in Phase 8.
 * For now, it starts a basic HTTP server to verify the build works.
 */

import app from './app';

const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Server is running on port ${PORT}`);
  // eslint-disable-next-line no-console
  console.log(`Health check: http://localhost:${PORT}/health`);
});

// Graceful shutdown handling
const gracefulShutdown = (signal: string): void => {
  // eslint-disable-next-line no-console
  console.log(`${signal} received. Starting graceful shutdown...`);
  server.close(() => {
    // eslint-disable-next-line no-console
    console.log('Server closed.');
    process.exit(0);
  });

  // Force shutdown after 30 seconds
  setTimeout(() => {
    // eslint-disable-next-line no-console
    console.error('Forced shutdown after timeout.');
    process.exit(1);
  }, 30000);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

export default server;
