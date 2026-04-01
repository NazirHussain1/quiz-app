import { NextResponse } from 'next/server';
import { verifyToken } from './jwt';
import { hasPermission, hasRole, hasMinimumRole, ROLES } from './rbac';

/**
 * Middleware to check if user has required role(s)
 * @param {string[]} allowedRoles - Array of allowed roles
 * @returns {Function} Middleware function
 */
export function checkRole(allowedRoles) {
  return async function middleware(request) {
    try {
      // Get token from cookie
      const token = request.cookies.get('auth-token')?.value;

      if (!token) {
        return NextResponse.json(
          { success: false, error: 'Authentication required' },
          { status: 401 }
        );
      }

      // Verify token
      const decoded = verifyToken(token);

      if (!decoded) {
        return NextResponse.json(
          { success: false, error: 'Invalid or expired token' },
          { status: 401 }
        );
      }

      // Check if user has required role
      if (!hasRole(decoded.role, allowedRoles)) {
        return NextResponse.json(
          { 
            success: false, 
            error: 'Access denied. Insufficient permissions.',
            requiredRoles: allowedRoles,
            userRole: decoded.role
          },
          { status: 403 }
        );
      }

      // Attach user to request for use in route handler
      request.user = decoded;

      // Continue to route handler
      return null;
    } catch (error) {
      console.error('Role check error:', error);
      return NextResponse.json(
        { success: false, error: 'Authorization failed' },
        { status: 401 }
      );
    }
  };
}

/**
 * Middleware to check if user has required permission(s)
 * @param {string|string[]} requiredPermissions - Permission(s) required
 * @param {boolean} requireAll - If true, user must have all permissions. If false, any permission is enough.
 * @returns {Function} Middleware function
 */
export function checkPermission(requiredPermissions, requireAll = false) {
  return async function middleware(request) {
    try {
      // Get token from cookie
      const token = request.cookies.get('auth-token')?.value;

      if (!token) {
        return NextResponse.json(
          { success: false, error: 'Authentication required' },
          { status: 401 }
        );
      }

      // Verify token
      const decoded = verifyToken(token);

      if (!decoded) {
        return NextResponse.json(
          { success: false, error: 'Invalid or expired token' },
          { status: 401 }
        );
      }

      // Normalize permissions to array
      const permissions = Array.isArray(requiredPermissions) 
        ? requiredPermissions 
        : [requiredPermissions];

      // Check permissions
      let hasAccess = false;

      if (requireAll) {
        // User must have ALL permissions
        hasAccess = permissions.every(permission => 
          hasPermission(decoded.role, permission)
        );
      } else {
        // User must have ANY permission
        hasAccess = permissions.some(permission => 
          hasPermission(decoded.role, permission)
        );
      }

      if (!hasAccess) {
        return NextResponse.json(
          { 
            success: false, 
            error: 'Access denied. Insufficient permissions.',
            requiredPermissions: permissions,
            userRole: decoded.role
          },
          { status: 403 }
        );
      }

      // Attach user to request
      request.user = decoded;

      // Continue to route handler
      return null;
    } catch (error) {
      console.error('Permission check error:', error);
      return NextResponse.json(
        { success: false, error: 'Authorization failed' },
        { status: 401 }
      );
    }
  };
}

/**
 * Middleware to check if user has minimum role level
 * @param {string} minimumRole - Minimum required role
 * @returns {Function} Middleware function
 */
export function checkMinimumRole(minimumRole) {
  return async function middleware(request) {
    try {
      // Get token from cookie
      const token = request.cookies.get('auth-token')?.value;

      if (!token) {
        return NextResponse.json(
          { success: false, error: 'Authentication required' },
          { status: 401 }
        );
      }

      // Verify token
      const decoded = verifyToken(token);

      if (!decoded) {
        return NextResponse.json(
          { success: false, error: 'Invalid or expired token' },
          { status: 401 }
        );
      }

      // Check minimum role
      if (!hasMinimumRole(decoded.role, minimumRole)) {
        return NextResponse.json(
          { 
            success: false, 
            error: 'Access denied. Insufficient role level.',
            minimumRole,
            userRole: decoded.role
          },
          { status: 403 }
        );
      }

      // Attach user to request
      request.user = decoded;

      // Continue to route handler
      return null;
    } catch (error) {
      console.error('Minimum role check error:', error);
      return NextResponse.json(
        { success: false, error: 'Authorization failed' },
        { status: 401 }
      );
    }
  };
}

/**
 * Wrapper to apply middleware to route handler
 * @param {Function} middleware - Middleware function
 * @param {Function} handler - Route handler function
 * @returns {Function} Wrapped handler
 */
export function withMiddleware(middleware, handler) {
  return async function wrappedHandler(request, context) {
    // Run middleware
    const middlewareResult = await middleware(request);

    // If middleware returns a response, return it (access denied)
    if (middlewareResult) {
      return middlewareResult;
    }

    // Otherwise, continue to handler
    return handler(request, context);
  };
}

/**
 * Combine multiple middlewares
 * @param {Function[]} middlewares - Array of middleware functions
 * @returns {Function} Combined middleware
 */
export function combineMiddlewares(...middlewares) {
  return async function combinedMiddleware(request) {
    for (const middleware of middlewares) {
      const result = await middleware(request);
      if (result) {
        return result; // Stop if any middleware returns a response
      }
    }
    return null; // All middlewares passed
  };
}

/**
 * Shorthand: Require authentication only
 */
export const requireAuth = checkRole([ROLES.STUDENT, ROLES.MODERATOR, ROLES.ADMIN, ROLES.SUPERADMIN]);

/**
 * Shorthand: Require admin or superadmin
 */
export const requireAdmin = checkRole([ROLES.ADMIN, ROLES.SUPERADMIN]);

/**
 * Shorthand: Require superadmin only
 */
export const requireSuperAdmin = checkRole([ROLES.SUPERADMIN]);

/**
 * Shorthand: Require moderator or higher
 */
export const requireModerator = checkMinimumRole(ROLES.MODERATOR);
