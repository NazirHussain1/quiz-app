/**
 * Centralized Middleware Exports
 * 
 * This module provides a unified interface for all middleware functions.
 * Import from this file to maintain backward compatibility.
 */

// Auth middleware
export {
  verifyAuth,
  requireAuth
} from './auth';

// RBAC middleware
export {
  requireAdmin,
  verifyAdmin,
  requireRole,
  requirePermission,
  requireMinimumRole,
  requireSuperAdmin,
  requireModerator
} from './rbac';

// Error handling
export {
  handleError,
  withErrorHandler,
  withErrorHandling
} from './errorHandler';

// Utilities
export {
  getClientIP,
  withMiddleware,
  combineMiddlewares
} from './utils';
