import { NextResponse } from 'next/server';
import { rateLimitLogin } from '@/app/lib/rateLimit';
import { logSecurity } from '@/app/lib/logger';
import { withErrorHandling, AuthenticationError } from '@/app/lib/errorHandler';
import { loginUser } from '@/app/services/authService';

export const POST = withErrorHandling(async (request) => {
  // Rate limiting
  const rateLimit = rateLimitLogin(request);
  if (!rateLimit.allowed) {
    logSecurity('Rate limit exceeded', 'medium', {
      event: 'login_rate_limit',
      ip: request.headers.get('x-forwarded-for') || 'unknown',
    });
    throw new AuthenticationError('Too many login attempts. Please try again later.');
  }

  const body = await request.json();
  const { email, password } = body;
  
  const result = await loginUser(email, password);
  
  // Handle email verification required
  if (!result.success && result.needsVerification) {
    return NextResponse.json(
      { 
        success: false, 
        error: result.message,
        needsVerification: true,
        email: result.email
      },
      { status: 403 }
    );
  }

  const response = NextResponse.json({
    success: true,
    user: result.user
  });
  
  // Set secure cookie
  response.cookies.set('auth-token', result.token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24
  });
  
  return response;
});
