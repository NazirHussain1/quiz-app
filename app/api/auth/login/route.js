import { NextResponse } from 'next/server';
import { withErrorHandler } from '@/app/lib/middleware/errorHandler';
import { rateLimitLogin } from '@/app/lib/rateLimit';
import { logSecurity } from '@/app/lib/logger';
import { RateLimitError } from '@/app/lib/errors';
import { loginUser } from '@/app/services/authService';

export const POST = withErrorHandler(async (request) => {
  // Rate limiting
  const rateLimit = rateLimitLogin(request);
  if (!rateLimit.allowed) {
    logSecurity('Rate limit exceeded', 'medium', {
      event: 'login_rate_limit',
      ip: request.headers.get('x-forwarded-for') || 'unknown',
    });
    throw new RateLimitError();
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
    user: result.user,
    message: 'Login successful'
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
