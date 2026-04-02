import { NextResponse } from 'next/server';
import { createUser } from '@/app/lib/auth';
import { generateToken } from '@/app/lib/jwt';
import { validateEmail, validatePassword, validateUsername } from '@/app/lib/validation';
import { rateLimitLogin } from '@/app/lib/rateLimit';
import { sendVerificationEmail } from '@/app/lib/email';
import { connectToDatabase } from '@/app/lib/mongodb';
import { logAuth, logEmail, logSecurity } from '@/app/lib/logger';
import { withErrorHandling, ValidationError, AppError } from '@/app/lib/errorHandler';

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

  // Validate email
  const emailValidation = validateEmail(email);
  if (!emailValidation.valid) {
    throw new ValidationError(emailValidation.error);
  }

  // Validate password
  const passwordValidation = validatePassword(password);
  if (!passwordValidation.valid) {
    throw new ValidationError(passwordValidation.error);
  }

  // Validate username
  const usernameValidation = validateUsername(userName);
  if (!usernameValidation.valid) {
    throw new ValidationError(usernameValidation.error);
  }

  // Create user with sanitized inputs
  let user;
  try {
    user = await createUser(
      emailValidation.value,
      passwordValidation.value,
      usernameValidation.value
    );
  } catch (error) {
    if (error.message === 'User already exists') {
      logAuth('signup_failed', null, emailValidation.value, false, {
        reason: 'user_exists',
      });
      throw new AppError(error.message, 409);
    }
    throw error;
  }

  // Generate verification token (expires in 1 hour)
  const verificationToken = generateToken(
    { userId: user.id, email: user.email, type: 'verification' },
    '1h'
  );

  // Update user with verification token
  const { db } = await connectToDatabase();
  await db.collection('users').updateOne(
    { email: user.email },
    {
      $set: {
        isVerified: false,
        verificationToken,
        verificationTokenExpiry: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
      },
    }
  );

  // Send verification email
  try {
    await sendVerificationEmail(user.email, user.userName, verificationToken);
    logEmail('verification', user.email, true, {
      userId: user.id,
    });
  } catch (emailError) {
    logEmail('verification', user.email, false, {
      userId: user.id,
      error: emailError.message,
    });
    // Don't fail signup if email fails
  }

  // Log successful signup
  logAuth('signup_success', user.id, user.email, true, {
    userName: user.userName,
    role: user.role,
  });

  return NextResponse.json({
    success: true,
    message: 'Account created successfully! Please check your email to verify your account.',
    user: {
      id: user.id,
      email: user.email,
      userName: user.userName,
      role: user.role,
      isVerified: false
    }
  }, { status: 201 });
});
