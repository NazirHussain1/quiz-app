/**
 * Role-Based Access Control Middleware
 */

import { NextResponse } from 'next/server';
import { hasRole, hasPermission, hasMinimumRole, ROLES } from '../rbac';
import { logSecurity } from '../logger';
import { verifyAuth } from './auth';
import { getClientIP } from './utils';

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
 * Shorthand: Require superadmin only
 */
export const requireSuperAdmin = requireRole([ROLES.SUPERADMIN]);

/**
 * Shorthand: Require moderator or higher
 */
export const requireModerator = requireMinimumRole(ROLES.MODERATOR);
