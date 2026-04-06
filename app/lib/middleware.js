/**
 * Middleware - Backward Compatibility Layer
 * 
 * This file maintains backward compatibility by re-exporting
 * from the refactored middleware modules.
 * 
 * @deprecated Import from './middleware/index' for new code
 */

export {
  verifyAuth,
  requireAuth,
  requireAdmin,
  verifyAdmin,
  requireRole,
  requirePermission,
  requireMinimumRole,
  requireSuperAdmin,
  requireModerator,
  getClientIP,
  withMiddleware,
  combineMiddlewares
} from './middleware/index';
