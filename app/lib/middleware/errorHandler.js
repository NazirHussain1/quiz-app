/**
 * Error Handler Middleware
 * Centralized error handling for API routes
 */

import { error as errorResponse } from '../responses';
import { logError, logSecurity } from '../logger';
import { 
  AppError, 
  ValidationError, 
  AuthenticationError, 
  AuthorizationError,
  RateLimitError 
} from '../errors';
import { ZodError } from 'zod';

function getFirstZodIssue(error) {
  return error?.issues?.[0] || error?.errors?.[0] || null;
}

/**
 * Get client IP address
 */
function getClientIP(request) {
  const forwarded = request?.headers?.get('x-forwarded-for');
  const real = request?.headers?.get('x-real-ip');
  const vercel = request?.headers?.get('x-vercel-forwarded-for');
  const cloudflare = request?.headers?.get('cf-connecting-ip');

  if (vercel) return vercel.split(',')[0].trim();
  if (cloudflare) return cloudflare;
  if (forwarded) return forwarded.split(',')[0].trim();
  if (real) return real;
  
  return 'unknown';
}

/**
 * Handle error and return appropriate response
 */
export function handleError(err, request = null) {
  let error = err;
  
  // Convert Zod errors to ValidationError
  if (err instanceof ZodError) {
    const firstError = getFirstZodIssue(err);
    const field = firstError?.path?.join('.') || null;
    const message = firstError?.message || 'Validation failed';
    error = new ValidationError(
      field ? `${field}: ${message}` : message,
      field || null
    );
  }
  
  // Convert unknown errors to AppError
  if (!(error instanceof AppError)) {
    error = new AppError(
      error.message || 'An unexpected error occurred',
      500,
      'INTERNAL_ERROR'
    );
  }
  
  // Log error
  logError(error, {
    url: request?.url,
    method: request?.method,
    userAgent: request?.headers?.get('user-agent'),
    ip: getClientIP(request)
  });
  
  // Log security events
  if (error instanceof AuthenticationError || 
      error instanceof AuthorizationError ||
      error instanceof RateLimitError) {
    logSecurity(error.code, 'medium', {
      message: error.message,
      url: request?.url,
      ip: getClientIP(request)
    });
  }
  
  return errorResponse(error, request);
}

/**
 * Wrap async route handler with error handling
 */
export function withErrorHandler(handler) {
  return async (request, context) => {
    try {
      return await handler(request, context);
    } catch (error) {
      return handleError(error, request);
    }
  };
}

/**
 * Legacy alias for backward compatibility
 */
export const withErrorHandling = withErrorHandler;
