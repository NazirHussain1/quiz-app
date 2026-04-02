import { NextResponse } from 'next/server';
import { findUserByEmail, verifyPassword } from '@/app/lib/auth';
import { validateEmail } from '@/app/lib/validation';
import { rateLimitLogin } from '@/app/lib/rateLimit';
import { SignJWT } from 'jose';
import { logAuth, logSecurity } from '@/app/lib/logger';
import { withErrorHandling, ValidationError, AuthenticationError } from '@/app/lib/errorHandler';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key-change-in-production'
);

export const POST = withErrorHandling(async (request) => {
  // Rate limiting for login attempts
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
  
  // Validate email
  const emailValidation = validateEmail(email);
  if (!emailValidation.valid) {
    throw new ValidationError(emailValidation.error);
  }

  // Validate password exists
  if (!password || typeof password !== 'string') {
    throw new ValidationError('Password is required');
  }
  
  // Find user with sanitized email
  const user = await findUserByEmail(emailValidation.value);
  
  if (!user) {
    logAuth('login_failed', null, emailValidation.value, false, {
      reason: 'user_not_found',
    });
    throw new AuthenticationError('Invalid credentials');
  }
  
  // Verify password
  const isValid = await verifyPassword(password, user.password);
  
  if (!isValid) {
    logAuth('login_failed', user.id, user.email, false, {
      reason: 'invalid_password',
    });
    throw new AuthenticationError('Invalid credentials');
  }

  // Check if email is verified
  if (!user.isVerified) {
    logAuth('login_failed', user.id, user.email, false, {
      reason: 'email_not_verified',
    });
    return NextResponse.json(
      { 
        success: false, 
        error: 'Please verify your email before logging in. Check your inbox for the verification link.',
        needsVerification: true,
        email: user.email
      },
      { status: 403 }
    );
  }
  
  // Generate JWT with expiry
  const token = await new SignJWT({
    userId: user.id,
    email: user.email,
    userName: user.userName,
    role: user.role
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('1d') // 1 day expiry
    .sign(JWT_SECRET);
  
  // Log successful login
  logAuth('login_success', user.id, user.email, true, {
    role: user.role,
  });

  const response = NextResponse.json({
    success: true,
    user: {
      id: user.id,
      email: user.email,
      userName: user.userName,
      role: user.role
    }
  });
  
  // Set secure cookie
  response.cookies.set('auth-token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 // 1 day
  });
  
  return response;
});
