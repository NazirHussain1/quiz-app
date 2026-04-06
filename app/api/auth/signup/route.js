import { NextResponse } from 'next/server';
import { rateLimitLogin } from '@/app/lib/rateLimit';
import { logSecurity } from '@/app/lib/logger';
import { withErrorHandling, AppError } from '@/app/lib/errorHandler';
import { registerUser } from '@/app/services/authService';

export const POST = withErrorHandling(async (request) => {
  // Rate limiting
  const rateLimit = rateLimitLogin(request);
  if (!rateLimit.allowed) {
    logSecurity('Rate limit exceeded', 'medium', {
      event: 'signup_rate_limit',
      ip: request.headers.get('x-forwarded-for') || 'unknown',
    });
    throw new AppError('Too many signup attempts. Please try again later.', 429);
  }

  const body = await request.json();
  const { email, password, userName } = body;

  const result = await registerUser(email, password, userName);

  return NextResponse.json(result, { status: 201 });
});
