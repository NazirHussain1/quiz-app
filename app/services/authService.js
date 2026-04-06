/**
 * Authentication Service
 * Handles authentication business logic
 */

import { findUserByEmail, verifyPassword, createUser } from '@/app/lib/auth';
import { validateEmail, validatePassword, validateUsername } from '@/app/lib/validation';
import { generateToken } from '@/app/lib/jwt';
import { sendVerificationEmail, sendPasswordResetEmail } from '@/app/lib/email';
import { connectToDatabase } from '@/app/lib/database/connection';
import { logAuth, logEmail } from '@/app/lib/logger';
import { SignJWT } from 'jose';
import { ValidationError, AuthenticationError, AppError } from '@/app/lib/errorHandler';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key-change-in-production'
);

/**
 * Login user
 */
export async function loginUser(email, password) {
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
    return {
      success: false,
      needsVerification: true,
      email: user.email,
      message: 'Please verify your email before logging in. Check your inbox for the verification link.'
    };
  }
  
  // Generate JWT with expiry
  const token = await new SignJWT({
    userId: user.id,
    email: user.email,
    userName: user.userName,
    role: user.role
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('1d')
    .sign(JWT_SECRET);
  
  // Log successful login
  logAuth('login_success', user.id, user.email, true, {
    role: user.role,
  });

  return {
    success: true,
    token,
    user: {
      id: user.id,
      email: user.email,
      userName: user.userName,
      role: user.role
    }
  };
}

/**
 * Register new user
 */
export async function registerUser(email, password, userName) {
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
        verificationTokenExpiry: new Date(Date.now() + 60 * 60 * 1000),
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
  }

  // Log successful signup
  logAuth('signup_success', user.id, user.email, true, {
    userName: user.userName,
    role: user.role,
  });

  return {
    success: true,
    message: 'Account created successfully! Please check your email to verify your account.',
    user: {
      id: user.id,
      email: user.email,
      userName: user.userName,
      role: user.role,
      isVerified: false
    }
  };
}

/**
 * Verify email with token
 */
export async function verifyEmail(token) {
  if (!token) {
    throw new ValidationError('Verification token is required');
  }

  const { db } = await connectToDatabase();
  const usersCollection = db.collection('users');

  const user = await usersCollection.findOne({
    verificationToken: token,
    verificationTokenExpiry: { $gt: new Date() }
  });

  if (!user) {
    throw new AuthenticationError('Invalid or expired verification token');
  }

  await usersCollection.updateOne(
    { _id: user._id },
    {
      $set: {
        isVerified: true,
        updatedAt: new Date()
      },
      $unset: {
        verificationToken: '',
        verificationTokenExpiry: ''
      }
    }
  );

  logAuth('email_verified', user._id.toString(), user.email, true);

  return {
    success: true,
    message: 'Email verified successfully! You can now log in.'
  };
}

/**
 * Send verification email
 */
export async function resendVerificationEmail(email) {
  const emailValidation = validateEmail(email);
  if (!emailValidation.valid) {
    throw new ValidationError(emailValidation.error);
  }

  const { db } = await connectToDatabase();
  const usersCollection = db.collection('users');

  const user = await usersCollection.findOne({ email: emailValidation.value });

  if (!user) {
    return {
      success: true,
      message: 'If an account exists with this email, a verification link has been sent.'
    };
  }

  if (user.isVerified) {
    throw new AppError('Email is already verified', 400);
  }

  const verificationToken = generateToken(
    { userId: user._id.toString(), email: user.email, type: 'verification' },
    '1h'
  );

  await usersCollection.updateOne(
    { _id: user._id },
    {
      $set: {
        verificationToken,
        verificationTokenExpiry: new Date(Date.now() + 60 * 60 * 1000),
        updatedAt: new Date()
      }
    }
  );

  try {
    await sendVerificationEmail(user.email, user.userName, verificationToken);
    logEmail('verification_resend', user.email, true);
  } catch (emailError) {
    logEmail('verification_resend', user.email, false, {
      error: emailError.message
    });
  }

  return {
    success: true,
    message: 'Verification email sent successfully!'
  };
}

/**
 * Request password reset
 */
export async function requestPasswordReset(email) {
  if (!email) {
    throw new ValidationError('Email is required');
  }

  const { db } = await connectToDatabase();
  const usersCollection = db.collection('users');

  const user = await usersCollection.findOne({ email: email.toLowerCase() });

  // Always return success to prevent email enumeration
  if (!user) {
    return {
      success: true,
      message: 'If an account exists with this email, you will receive a password reset link.'
    };
  }

  const resetToken = generateToken(
    { userId: user._id.toString(), email: user.email, type: 'password-reset' },
    '1h'
  );

  await usersCollection.updateOne(
    { _id: user._id },
    {
      $set: {
        resetPasswordToken: resetToken,
        resetPasswordExpiry: new Date(Date.now() + 60 * 60 * 1000),
        updatedAt: new Date(),
      },
    }
  );

  try {
    await sendPasswordResetEmail(user.email, user.userName, resetToken);
  } catch (emailError) {
    console.error('Failed to send password reset email:', emailError);
  }

  return {
    success: true,
    message: 'If an account exists with this email, you will receive a password reset link.'
  };
}

/**
 * Reset password with token
 */
export async function resetPassword(token, newPassword) {
  if (!token) {
    throw new ValidationError('Reset token is required');
  }

  const passwordValidation = validatePassword(newPassword);
  if (!passwordValidation.valid) {
    throw new ValidationError(passwordValidation.error);
  }

  const { db } = await connectToDatabase();
  const usersCollection = db.collection('users');

  const user = await usersCollection.findOne({
    resetPasswordToken: token,
    resetPasswordExpiry: { $gt: new Date() }
  });

  if (!user) {
    throw new AuthenticationError('Invalid or expired reset token');
  }

  const bcrypt = require('bcryptjs');
  const hashedPassword = await bcrypt.hash(passwordValidation.value, 10);

  await usersCollection.updateOne(
    { _id: user._id },
    {
      $set: {
        password: hashedPassword,
        updatedAt: new Date()
      },
      $unset: {
        resetPasswordToken: '',
        resetPasswordExpiry: ''
      }
    }
  );

  logAuth('password_reset', user._id.toString(), user.email, true);

  return {
    success: true,
    message: 'Password reset successfully! You can now log in with your new password.'
  };
}
