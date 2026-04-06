import { NextResponse } from 'next/server';
import { logError, logSecurity } from './logger.js';

/**
 * Custom Error Classes
 */
export class AppError extends Error {
  constructor(message, statusCode = 500, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  constructor(message, errors = []) {
    super(message, 400);
    this.errors = errors;
  }
}

export class AuthenticationError extends AppError {
  constructor(message = 'Authentication failed') {
    super(message, 401);
  }
}

export class AuthorizationError extends AppError {
  constructor(message = 'Access denied') {
    super(message, 403);
  }
}

export class NotFoundError extends AppError {
  constructor(message = 'Resource not found') {
    super(message, 404);
  }
}

export class RateLimitError extends AppError {
  constructor(message = 'Too many requests') {
    super(message, 429);
  }
}

export class DatabaseError extends AppError {
  constructor(message = 'Database operation failed') {
    super(message, 500);
  }
}

/**
 * Global Error Handler
 * Handles all errors and returns appropriate responses
 */
export function handleError(error, req) {
  const isDevelopment = process.env.NODE_ENV !== 'production';

  // Log the error
  logError(error, {
    url: req?.url,
    method: req?.method,
    userAgent: req?.headers?.get('user-agent'),
  });

  // Security event logging for authentication/authorization errors
  if (error instanceof AuthenticationError || error instanceof AuthorizationError) {
    logSecurity(error.name, 'high', {
      message: error.message,
      url: req?.url,
      ip: getClientIP(req),
    });
  }

  // Determine status code
  const statusCode = error.statusCode || 500;

  // Prepare error response
  const errorResponse = {
    success: false,
    error: {
      message: error.message || 'Internal server error',
      statusCode,
    },
  };

  // Add validation errors if present
  if (error instanceof ValidationError && error.errors) {
    errorResponse.error.errors = error.errors;
  }

  // Add stack trace in development
  if (isDevelopment && error.stack) {
    errorResponse.error.stack = error.stack;
  }

  // Add error name in development
  if (isDevelopment) {
    errorResponse.error.name = error.name;
  }

  return NextResponse.json(errorResponse, { status: statusCode });
}

/**
 * Async error wrapper for API routes
 * Catches errors and passes them to error handler
 */
export function asyncHandler(handler) {
  return async (req, context) => {
    try {
      return await handler(req, context);
    } catch (error) {
      return handleError(error, req);
    }
  };
}

/**
 * Combined wrapper with logging and error handling
 * Usage: export const GET = withErrorHandling(async (req) => { ... });
 */
export function withErrorHandling(handler) {
  return async (req, context) => {
    const startTime = Date.now();

    try {
      const response = await handler(req, context);
      
      // Log successful request
      const duration = Date.now() - startTime;
      const statusCode = response?.status || 200;

      return response;
    } catch (error) {
      return handleError(error, req);
    }
  };
}

/**
 * Get client IP address from request
 */
function getClientIP(req) {
  const forwarded = req?.headers?.get('x-forwarded-for');
  const real = req?.headers?.get('x-real-ip');
  const vercel = req?.headers?.get('x-vercel-forwarded-for');
  const cloudflare = req?.headers?.get('cf-connecting-ip');

  if (vercel) return vercel.split(',')[0].trim();
  if (cloudflare) return cloudflare;
  if (forwarded) return forwarded.split(',')[0].trim();
  if (real) return real;
  
  return 'unknown';
}

/**
 * Error response helper
 */
export function errorResponse(message, statusCode = 500, additionalData = {}) {
  return NextResponse.json(
    {
      success: false,
      error: {
        message,
        statusCode,
        ...additionalData,
      },
    },
    { status: statusCode }
  );
}

/**
 * Success response helper
 */
export function successResponse(data, statusCode = 200, message = null) {
  const response = {
    success: true,
    data,
  };

  if (message) {
    response.message = message;
  }

  return NextResponse.json(response, { status: statusCode });
}
