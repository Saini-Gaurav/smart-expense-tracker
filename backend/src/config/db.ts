import mongoose from 'mongoose';
import { logger } from '../utils/logger';

const connectDB = async (): Promise<void> => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI as string, {
      serverSelectionTimeoutMS: 5000,
    });
    logger.info('MongoDB connected', { host: conn.connection.host });

    mongoose.connection.on('error', (error: Error) => {
      logger.error('MongoDB connection error', { error: error.message });
    });
    mongoose.connection.on('disconnected', () => {
      logger.warn('MongoDB disconnected');
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    logger.error('MongoDB connection failed', { error: msg });
    if (String(msg).includes('ENOTFOUND') || String(msg).includes('querySrv')) {
      logger.error(
        'Hint: Atlas hostnames look like cluster0.abcd12.mongodb.net (not cluster0.mongodb.net). Copy the full URI from Atlas → Connect → Drivers. For local MongoDB use mongodb://127.0.0.1:27017/expense_tracker'
      );
    }
    process.exit(1);
  }
};

export default connectDB;
