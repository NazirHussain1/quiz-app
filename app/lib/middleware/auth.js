/**
 * Authentication Middleware
 */

import { NextResponse } from 'next/server';
import { verifyToken, extractToken } from '../jwt';
import { ROLES } from '../rbac';
import { logSecurity } from '../logger';
import { getClientIP } from './utils';

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
