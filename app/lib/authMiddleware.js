import { NextResponse } from 'next/server';
import { verifyToken, extractToken } from '@/app/lib/jwt';
import { hasRole, hasPermission, ROLES } from '@/app/lib/rbac';

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

export function requireAuth(handler) {
  return async (request, context) => {
    const user = await verifyAuth(request);
    
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    request.user = user;
    return handler(request, context);
  };
}

export function requireAdmin(handler) {
  return async (request, context) => {
    const user = await verifyAuth(request);
    
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    // Check if user has admin or superadmin role
    if (!hasRole(user.role, [ROLES.ADMIN, ROLES.SUPERADMIN])) {
      return NextResponse.json(
        { success: false, error: 'Admin access required' },
        { status: 403 }
      );
    }
    
    request.user = user;
    return handler(request, context);
  };
}

export async function verifyAdmin(request) {
  try {
    const user = await verifyAuth(request);
    
    if (!user) {
      return { authorized: false, user: null };
    }
    
    // Check if user has admin or superadmin role
    if (!hasRole(user.role, [ROLES.ADMIN, ROLES.SUPERADMIN])) {
      return { authorized: false, user: null };
    }
    
    return { authorized: true, user };
  } catch (error) {
    return { authorized: false, user: null };
  }
}

// New RBAC-specific middleware
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

export function requirePermission(permission) {
  return (handler) => {
    return async (request, context) => {
      const user = await verifyAuth(request);
      
      if (!user) {
        return NextResponse.json(
          { success: false, error: 'Authentication required' },
          { status: 401 }
        );
      }
      
      if (!hasPermission(user.role, permission)) {
        return NextResponse.json(
          { 
            success: false, 
            error: 'Access denied. Insufficient permissions.',
            requiredPermission: permission,
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
