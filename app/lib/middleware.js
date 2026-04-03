/**
 * Unified Authentication and RBAC Middleware
 * Consolidates authMiddleware.js and rbacMiddleware.js
 */

import { NextResponse } from 'next/server';
import { verifyToken, extractToken } from './jwt';
import { hasRole, hasPermission, hasMinimumRole, ROLES } from './rbac';
import { logSecurity } from './logger';

/**
 * Get client IP address from request
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
 * Verify authentication from request
 * @param {Request} request - Next.js request object
 * @returns {Promise<Object|null>} User object or null
 */
export async function verifyAuth(request) {
  try {
    const token = request.cookies.get('auth-token')?.value || extractToken(request);
    
    if (!token) {
      return null;
    }
    
    const decoded = await verifyToken(token);
    
    if (!decoded) {
      return null;
    }
    
    return {
      userId: decoded.userId,
      email: decoded.email,
      userName: decoded.userName || decoded.email.split('@')[0],
      role: decoded.role || ROLES.STUDENT
    };
  } catch (error) {
    return null;
  }
}

/**
 * Middleware: Require authentication
 * @param {Function} handler - Route handler
 * @returns {Function} Wrapped handler
 */
export function requireAuth(handler) {
  return async (request, context) => {
    const user = await verifyAuth(request);
    
    if (!user) {
      logSecurity('unauthorized_access', 'medium', {
        url: request.url,
        ip: getClientIP(request),
      });
      
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    request.user = user;
    return handler(request, context);
  };
}

/**
 * Middleware: Require admin role
 * @param {Function} handler - Route handler
 * @returns {Function} Wrapped handler
 */
export function requireAdmin(handler) {
  return async (request, context) => {
    const user = await verifyAuth(request);
    
    if (!user) {
      logSecurity('unauthorized_access', 'high', {
        url: request.url,
        ip: getClientIP(request),
      });
      
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    if (!hasRole(user.role, [ROLES.ADMIN, ROLES.SUPERADMIN])) {
      logSecurity('unauthorized_admin_access', 'high', {
        url: request.url,
        ip: getClientIP(request),
        userRole: user.role,
      });
      
      return NextResponse.json(
        { success: false, error: 'Admin access required' },
        { status: 403 }
      );
    }
    
    request.user = user;
    return handler(request, context);
  };
}

/**
 * Verify admin access (returns object instead of response)
 * @param {Request} request - Next.js request object
 * @returns {Promise<Object>} { authorized: boolean, user: Object|null }
 */
export async function verifyAdmin(request) {
  try {
    const user = await verifyAuth(request);
    
    if (!user) {
      return { authorized: false, user: null };
    }
    
    if (!hasRole(user.role, [ROLES.ADMIN, ROLES.SUPERADMIN])) {
      return { authorized: false, user: null };
    }
    
    return { authorized: true, user };
  } catch (error) {
    return { authorized: false, user: null };
  }
}

/**
 * Middleware: Require specific role(s)
 * @param {string[]} allowedRoles - Array of allowed roles
 * @returns {Function} Middleware function
 */
export function requireRole(allowedRoles) {
  return (handler) => {
    return async (request, context) => {
      const user = await verifyAuth(request);
      
      if (!user) {
        return NextResponse.json(
          { success: false, error: 'Authentication required' },
          { status: 401 }
        );
      }
      
      if (!hasRole(user.role, allowedRoles)) {
        logSecurity('insufficient_permissions', 'medium', {
          url: request.url,
          ip: getClientIP(request),
          userRole: user.role,
          requiredRoles: allowedRoles,
        });
        
        return NextResponse.json(
          { 
            success: false, 
            error: 'Access denied. Insufficient permissions.',
            requiredRoles: allowedRoles,
            userRole: user.role
          },
          { status: 403 }
        );
      }
      
      request.user = user;
      return handler(request, context);
    };
  };
}

/**
 * Middleware: Require specific permission(s)
 * @param {string|string[]} requiredPermissions - Permission(s) required
 * @param {boolean} requireAll - If true, user must have all permissions
 * @returns {Function} Middleware function
 */
export function requirePermission(requiredPermissions, requireAll = false) {
  return (handler) => {
    return async (request, context) => {
      const user = await verifyAuth(request);
      
      if (!user) {
        return NextResponse.json(
          { success: false, error: 'Authentication required' },
          { status: 401 }
        );
      }
      
      const permissions = Array.isArray(requiredPermissions) 
        ? requiredPermissions 
        : [requiredPermissions];

      let hasAccess = false;

      if (requireAll) {
        hasAccess = permissions.every(permission => 
          hasPermission(user.role, permission)
        );
      } else {
        hasAccess = permissions.some(permission => 
          hasPermission(user.role, permission)
        );
      }

      if (!hasAccess) {
        logSecurity('insufficient_permissions', 'medium', {
          url: request.url,
          ip: getClientIP(request),
          userRole: user.role,
          requiredPermissions: permissions,
        });
        
        return NextResponse.json(
          { 
            success: false, 
            error: 'Access denied. Insufficient permissions.',
            requiredPermissions: permissions,
            userRole: user.role
          },
          { status: 403 }
        );
      }
      
      request.user = user;
      return handler(request, context);
    };
  };
}

/**
 * Middleware: Require minimum role level
 * @param {string} minimumRole - Minimum required role
 * @returns {Function} Middleware function
 */
export function requireMinimumRole(minimumRole) {
  return (handler) => {
    return async (request, context) => {
      const user = await verifyAuth(request);
      
      if (!user) {
        return NextResponse.json(
          { success: false, error: 'Authentication required' },
          { status: 401 }
        );
      }
      
      if (!hasMinimumRole(user.role, minimumRole)) {
        return NextResponse.json(
          { 
            success: false, 
            error: 'Access denied. Insufficient role level.',
            minimumRole,
            userRole: user.role
          },
          { status: 403 }
        );
      }
      
      request.user = user;
      return handler(request, context);
    };
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
    const middlewareResult = await middleware(request);

    if (middlewareResult) {
      return middlewareResult;
    }

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
        return result;
      }
    }
    return null;
  };
}

/**
 * Shorthand: Require superadmin only
 */
export const requireSuperAdmin = requireRole([ROLES.SUPERADMIN]);

/**
 * Shorthand: Require moderator or higher
 */
export const requireModerator = requireMinimumRole(ROLES.MODERATOR);
