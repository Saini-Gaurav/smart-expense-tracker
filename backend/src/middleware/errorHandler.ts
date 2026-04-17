import type { ErrorRequestHandler } from 'express';
import { Error as MongooseError } from 'mongoose';

const isRecord = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null;

export const errorHandler: ErrorRequestHandler = (err, req, res, _next) => {
  let statusCode = (err as { statusCode?: number }).statusCode || 500;
  let message = err.message || 'Internal Server Error';

  if (err instanceof MongooseError.ValidationError) {
    statusCode = 400;
    message = Object.values(err.errors)
      .map((value) => (value as Error).message)
      .join(', ');
  }

  const code = isRecord(err) && 'code' in err ? err.code : undefined;
  if (code === 11000) {
    statusCode = 400;
    message = 'Duplicate field value entered.';
  }

  if (err instanceof MongooseError.CastError) {
    statusCode = 404;
    message = 'Resource not found.';
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack }),
  });
};

export default errorHandler;
