/**
 * Shared Token Utilities
 * Reusable token generation and management
 */

import { generateToken } from '@/app/lib/jwt';

const TOKEN_EXPIRY = 60 * 60 * 1000; // 1 hour in milliseconds

/**
 * Generate verification token with expiry
 */
export function generateVerificationToken(userId, email) {
  const token = generateToken(
    { userId, email, type: 'verification' },
    '1h'
  );
  
  return {
    token,
    expiry: new Date(Date.now() + TOKEN_EXPIRY)
  };
}

/**
 * Generate password reset token with expiry
 */
export function generatePasswordResetToken(userId, email) {
  const token = generateToken(
    { userId, email, type: 'password-reset' },
    '1h'
  );
  
  return {
    token,
    expiry: new Date(Date.now() + TOKEN_EXPIRY)
  };
}

/**
 * Clear token fields for database update
 */
export function clearTokenFields(tokenType) {
  if (tokenType === 'verification') {
    return {
      verificationToken: '',
      verificationTokenExpiry: ''
    };
  }
  
  if (tokenType === 'reset') {
    return {
      resetPasswordToken: '',
      resetPasswordExpiry: ''
    };
  }
  
  return {};
}
