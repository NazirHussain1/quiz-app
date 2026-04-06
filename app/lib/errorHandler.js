/**
 * Error Handler - Legacy Exports
 * 
 * @deprecated Import from '@/app/lib/errors' and '@/app/lib/responses' instead
 * This file is kept for backward compatibility
 */

// Export error classes
export {
  AppError,
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  ConflictError,
  RateLimitError,
  DatabaseError
} from './errors';

// Export error handling middleware
export {
  handleError,
  withErrorHandler,
  withErrorHandling
} from './middleware/errorHandler';

// Export response helpers
export {
  success as successResponse,
  error as errorResponse,
  created,
  noContent,
  validationError,
  unauthorized,
  forbidden,
  notFound,
  conflict,
  rateLimit,
  serverError,
  paginated
} from './responses';
