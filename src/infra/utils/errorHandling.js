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
  let error = err;

  // Handle mongoose validation errors
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map(e => e.message).join(', ');
    error = new ValidationError(message);
  }

  // Handle mongoose duplicate key errors
  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern)[0];
    error = new ConflictError(`${field} already exists`);
  }

  // Default to 500 if not an operational error
  if (!error.isOperational) {
    error = new InternalServerError();
  }

  const statusCode = error.statusCode || 500;

  // Log error
  logger.error(error.message, {
    statusCode,
    stack: error.stack,
    path: req.path,
    method: req.method,
    correlationId: req.correlationId
  });

  // Send response
  res.status(statusCode).json({
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
