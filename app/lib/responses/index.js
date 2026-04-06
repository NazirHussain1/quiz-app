/**
 * API Response Utilities
 * Consistent response format across all endpoints
 */

import { NextResponse } from 'next/server';

/**
 * Standard API Response Format:
 * {
 *   success: boolean,
 *   data?: any,           // For successful responses
 *   message?: string,     // Optional message
 *   error?: {             // For error responses
 *     code: string,
 *     message: string,
 *     field?: string,     // For validation errors
 *     details?: any       // Additional error details (dev only)
 *   },
 *   meta?: {              // For paginated responses
 *     page: number,
 *     limit: number,
 *     total: number,
 *     totalPages: number
 *   }
 * }
 */

/**
 * Success response
 */
export function success(data, options = {}) {
  const { message, meta, status = 200 } = options;
  
  const response = {
    success: true,
    data
  };
  
  if (message) {
    response.message = message;
  }
  
  if (meta) {
    response.meta = meta;
  }
  
  return NextResponse.json(response, { status });
}

/**
 * Created response (201)
 */
export function created(data, message = 'Resource created successfully') {
  return success(data, { message, status: 201 });
}

/**
 * No content response (204)
 */
export function noContent() {
  return new NextResponse(null, { status: 204 });
}

/**
 * Error response
 */
export function error(errorObj, request = null) {
  const isDevelopment = process.env.NODE_ENV !== 'production';
  
  const response = {
    success: false,
    error: {
      code: errorObj.code || 'INTERNAL_ERROR',
      message: errorObj.message || 'An error occurred'
    }
  };
  
  // Add field for validation errors
  if (errorObj.field) {
    response.error.field = errorObj.field;
  }
  
  // Add resource for not found errors
  if (errorObj.resource) {
    response.error.resource = errorObj.resource;
  }
  
  // Add stack trace in development
  if (isDevelopment && errorObj.stack) {
    response.error.details = {
      name: errorObj.name,
      stack: errorObj.stack
    };
  }
  
  const statusCode = errorObj.statusCode || 500;
  
  return NextResponse.json(response, { status: statusCode });
}

/**
 * Validation error response
 */
export function validationError(message, field = null) {
  return error({
    code: 'VALIDATION_ERROR',
    message,
    field,
    statusCode: 400
  });
}

/**
 * Unauthorized response
 */
export function unauthorized(message = 'Authentication required') {
  return error({
    code: 'AUTHENTICATION_ERROR',
    message,
    statusCode: 401
  });
}

/**
 * Forbidden response
 */
export function forbidden(message = 'Access denied') {
  return error({
    code: 'AUTHORIZATION_ERROR',
    message,
    statusCode: 403
  });
}

/**
 * Not found response
 */
export function notFound(resource = 'Resource') {
  return error({
    code: 'NOT_FOUND',
    message: `${resource} not found`,
    resource,
    statusCode: 404
  });
}

/**
 * Conflict response
 */
export function conflict(message = 'Resource already exists') {
  return error({
    code: 'CONFLICT',
    message,
    statusCode: 409
  });
}

/**
 * Rate limit response
 */
export function rateLimit(message = 'Too many requests. Please try again later.') {
  return error({
    code: 'RATE_LIMIT_EXCEEDED',
    message,
    statusCode: 429
  });
}

/**
 * Internal server error response
 */
export function serverError(message = 'Internal server error', additionalData = null) {
  const errorObj = {
    code: 'INTERNAL_ERROR',
    message,
    statusCode: 503
  };
  
  const response = error(errorObj);
  
  // Add additional data if provided (for health checks, etc.)
  if (additionalData) {
    const body = JSON.parse(response.body);
    Object.assign(body, additionalData);
    return NextResponse.json(body, { status: 503 });
  }
  
  return response;
}

/**
 * Paginated response
 */
export function paginated(data, pagination) {
  const { page, limit, total, totalPages } = pagination;
  
  return success(data, {
    meta: {
      page,
      limit,
      total,
      totalPages
    }
  });
}
