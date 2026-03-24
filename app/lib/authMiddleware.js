import { NextResponse } from 'next/server';
import { verifyToken, extractToken } from '@/app/lib/jwt';

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
      role: decoded.role || 'student'
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
    
    if (user.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Admin access required' },
        { status: 403 }
      );
    }
    
    request.user = user;
    return handler(request, context);
  };
}
