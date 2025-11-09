// src/infra/utils/errorHandling.js
import { logger } from './logger.js';

export class AppError extends Error {
  constructor(message, statusCode = 500, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.timestamp = new Date().toISOString();
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  constructor(message) {
    super(message, 400);
  }
}

export class NotFoundError extends AppError {
  constructor(message) {
    super(message, 404);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'Unauthorized') {
    super(message, 401);
  }
}

export class ForbiddenError extends AppError {
  constructor(message = 'Forbidden') {
    super(message, 403);
  }
}

export class ConflictError extends AppError {
  constructor(message) {
    super(message, 409);
  }
}

export class InternalServerError extends AppError {
  constructor(message = 'Internal server error') {
    super(message, 500);
  }
}

export function errorHandler(err, req, res, _next) {
  const isKnownAppError = err instanceof AppError || err.isOperational === true;
  let error = err;

  // Handle mongoose validation errors
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map(e => e.message).join(', ');
    error = new ValidationError(message);
  }

  // Handle mongoose duplicate key errors
  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern || {})[0] || 'Field';
    error = new ConflictError(`${field} already exists`);
  }

  const statusCode = error.statusCode || (isKnownAppError ? 400 : 500);

  if (!isKnownAppError && !(error instanceof AppError)) {
    // Log unexpected errors completely (para debugging real)
    logger.error('Unexpected error', {
      name: err.name,
      message: err.message,
      stack: err.stack,
      path: req.path,
      method: req.method,
      correlationId: req.correlationId
    });

    // Return generic message to client
    return res.status(500).json({
      error: {
        message: 'Internal server error',
        statusCode: 500,
        timestamp: new Date().toISOString(),
        correlationId: req.correlationId
      }
    });
  }

  // Log known errors (operacionais ou esperadas)
  logger.error(error.message, {
    statusCode,
    stack: error.stack,
    path: req.path,
    method: req.method,
    correlationId: req.correlationId
  });

  return res.status(statusCode).json({
    error: {
      message: error.message,
      statusCode,
      timestamp: error.timestamp || new Date().toISOString(),
      correlationId: req.correlationId
    }
  });
}

export function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}
