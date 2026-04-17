import 'dotenv/config';
import app from './app';
import connectDB from './config/db';
import { validateEnv } from './config/env';
import { logger } from './utils/logger';

const startServer = async () => {
  try {
    validateEnv();
    await connectDB();
    const PORT = process.env.PORT || 5000;
    const server = app.listen(PORT, () => {
      logger.info('Server started', {
        environment: process.env.NODE_ENV || 'development',
        port: PORT,
      });
    });
    process.on('unhandledRejection', (err: Error) => {
      logger.error('Unhandled rejection', { error: err.message });
      server.close(() => process.exit(1));
    });
    process.on('SIGTERM', () => {
      logger.warn('SIGTERM received. Shutting down gracefully');
      server.close(() => process.exit(0));
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    logger.error('Server startup failed', { error: msg });
    process.exit(1);
  }
};

void startServer();
