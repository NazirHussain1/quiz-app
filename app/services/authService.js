/**
 * Authentication Service
 * Handles authentication business logic
 */

import { findUserByEmail, verifyPassword, createUser } from '@/app/lib/auth';
import { validate } from '@/app/lib/validation';
import { 
  loginSchema, 
  signupSchema, 
  verifyEmailSchema,
  resendVerificationSchema,
  forgotPasswordSchema,
  resetPasswordSchema
} from '@/app/lib/validation/schemas';
import { sendVerificationEmail, sendPasswordResetEmail } from '@/app/lib/email';
import { logAuth, logEmail } from '@/app/lib/logger';
import { generateToken } from '@/app/lib/jwt';
import { AuthenticationError, AppError } from '@/app/lib/errorHandler';
import { getCollection } from './shared/database';
import { generateVerificationToken, generatePasswordResetToken, clearTokenFields } from './shared/tokens';

function getEmailErrorMessage(emailResult, fallbackMessage) {
  return emailResult?.error || fallbackMessage;
}

/**
 * Login user
 */
export async function loginUser(email, password) {
  const { email: validEmail, password: validPassword } = validate(loginSchema, { email, password });
  
  const user = await findUserByEmail(validEmail);
  
  if (!user) {
    logAuth('login_failed', null, validEmail, false, { reason: 'user_not_found' });
    throw new AuthenticationError('Invalid credentials');
  }
  
  const isValid = await verifyPassword(validPassword, user.password);
  
  if (!isValid) {
    logAuth('login_failed', user.id, user.email, false, { reason: 'invalid_password' });
    throw new AuthenticationError('Invalid credentials');
  }

  if (!user.isVerified) {
    logAuth('login_failed', user.id, user.email, false, { reason: 'email_not_verified' });
    return {
      success: false,
      needsVerification: true,
      email: user.email,
      message: 'Please verify your email before logging in. Check your inbox for the verification link.'
    };
  }
  
  const token = await generateToken(user);
  
  logAuth('login_success', user.id, user.email, true, { role: user.role });

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
  const validated = validate(signupSchema, { email, password, userName });

  let user;
  try {
    user = await createUser(validated.email, validated.password, validated.userName);
  } catch (error) {
    if (error.message === 'User already exists') {
      logAuth('signup_failed', null, validated.email, false, { reason: 'user_exists' });
      throw new AppError(error.message, 409);
    }
    throw error;
  }

  const { token, expiry } = generateVerificationToken(user.id, user.email);

  const usersCollection = await getCollection('users');
  await usersCollection.updateOne(
    { email: user.email },
    {
      $set: {
        isVerified: false,
        verificationToken: token,
        verificationTokenExpiry: expiry
      }
    }
  );

  let verificationEmailSent = false;
  let message = 'Account created successfully! Please check your email to verify your account.';

  try {
    const emailResult = await sendVerificationEmail(user.email, user.userName, token);
    verificationEmailSent = Boolean(emailResult?.success);

    if (verificationEmailSent) {
      logEmail('verification', user.email, true, {
        userId: user.id,
        messageId: emailResult.messageId
      });
    } else {
      message = 'Account created successfully, but we could not send the verification email. Please try resending it from the login page.';
      logEmail('verification', user.email, false, {
        userId: user.id,
        error: getEmailErrorMessage(emailResult, 'Failed to send verification email')
      });
    }
  } catch (emailError) {
    logEmail('verification', user.email, false, { userId: user.id, error: emailError.message });
    message = 'Account created successfully, but we could not send the verification email. Please try resending it from the login page.';
  }

  logAuth('signup_success', user.id, user.email, true, { userName: user.userName, role: user.role });

  return {
    success: true,
    message,
    verificationEmailSent,
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
  const { token: validToken } = validate(verifyEmailSchema, { token });

  const usersCollection = await getCollection('users');

  const user = await usersCollection.findOne({
    verificationToken: validToken,
    verificationTokenExpiry: { $gt: new Date() }
  });

  if (!user) {
    throw new AuthenticationError('Invalid or expired verification token');
  }

  await usersCollection.updateOne(
    { _id: user._id },
    {
      $set: { isVerified: true, updatedAt: new Date() },
      $unset: clearTokenFields('verification')
    }
  );

  logAuth('email_verified', user._id.toString(), user.email, true);

  return {
    success: true,
    message: 'Email verified successfully! You can now log in.'
  };
}

/**
 * Resend verification email
 */
export async function resendVerificationEmail(email) {
  const { email: validEmail } = validate(resendVerificationSchema, { email });

  const usersCollection = await getCollection('users');
  const user = await usersCollection.findOne({ email: validEmail });

  if (!user) {
    return {
      success: true,
      message: 'If an account exists with this email, a verification link has been sent.'
    };
  }

  if (user.isVerified) {
    throw new AppError('Email is already verified', 400);
  }

  const { token, expiry } = generateVerificationToken(user._id.toString(), user.email);

  await usersCollection.updateOne(
    { _id: user._id },
    {
      $set: {
        verificationToken: token,
        verificationTokenExpiry: expiry,
        updatedAt: new Date()
      }
    }
  );

  try {
    const emailResult = await sendVerificationEmail(user.email, user.userName, token);

    if (!emailResult?.success) {
      const errorMessage = getEmailErrorMessage(emailResult, 'Failed to send verification email');
      logEmail('verification_resend', user.email, false, { error: errorMessage });

      return {
        success: false,
        message: 'We could not send the verification email right now. Please try again.',
        error: errorMessage
      };
    }

    logEmail('verification_resend', user.email, true, { messageId: emailResult.messageId });
  } catch (emailError) {
    logEmail('verification_resend', user.email, false, { error: emailError.message });

    return {
      success: false,
      message: 'We could not send the verification email right now. Please try again.',
      error: emailError.message
    };
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
  const { email: validEmail } = validate(forgotPasswordSchema, { email });

  const usersCollection = await getCollection('users');
  const user = await usersCollection.findOne({ email: validEmail });

  if (!user) {
    return {
      success: true,
      message: 'If an account exists with this email, you will receive a password reset link.'
    };
  }

  const { token, expiry } = generatePasswordResetToken(user._id.toString(), user.email);

  await usersCollection.updateOne(
    { _id: user._id },
    {
      $set: {
        resetPasswordToken: token,
        resetPasswordExpiry: expiry,
        updatedAt: new Date()
      }
    }
  );

  try {
    const emailResult = await sendPasswordResetEmail(user.email, user.userName, token);

    if (!emailResult?.success) {
      logEmail('password_reset', user.email, false, {
        userId: user._id.toString(),
        error: getEmailErrorMessage(emailResult, 'Failed to send password reset email')
      });
    } else {
      logEmail('password_reset', user.email, true, {
        userId: user._id.toString(),
        messageId: emailResult.messageId
      });
    }
  } catch (emailError) {
    logEmail('password_reset', user.email, false, {
      userId: user._id.toString(),
      error: emailError.message
    });
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
  const validated = validate(resetPasswordSchema, { token, password: newPassword });

  const usersCollection = await getCollection('users');

  const user = await usersCollection.findOne({
    resetPasswordToken: validated.token,
    resetPasswordExpiry: { $gt: new Date() }
  });

  if (!user) {
    throw new AuthenticationError('Invalid or expired reset token');
  }

  const bcrypt = require('bcryptjs');
  const hashedPassword = await bcrypt.hash(validated.password, 10);

  await usersCollection.updateOne(
    { _id: user._id },
    {
      $set: { password: hashedPassword, updatedAt: new Date() },
      $unset: clearTokenFields('reset')
    }
  );

  logAuth('password_reset', user._id.toString(), user.email, true);

  return {
    success: true,
    message: 'Password reset successfully! You can now log in with your new password.'
  };
}
