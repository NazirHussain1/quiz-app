import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/app/lib/database/connection';
import { verifyToken } from '@/app/lib/jwt';
import { hashPassword } from '@/app/lib/auth';
import { rateLimitApi } from '@/app/lib/rateLimit';

export const dynamic = 'force-dynamic';

export async function POST(request) {
  try {
    // Rate limiting
    const rateLimit = rateLimitApi(request);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { success: false, error: "Too many requests. Please try again later." },
        { status: 429 }
      );
    }

    const { token, password } = await request.json();

    if (!token || !password) {
      return NextResponse.json(
        { success: false, error: 'Token and password are required' },
        { status: 400 }
      );
    }

    // Validate password strength
    if (password.length < 6) {
      return NextResponse.json(
        { success: false, error: 'Password must be at least 6 characters long' },
        { status: 400 }
      );
    }

    // Verify JWT token
    const decoded = verifyToken(token);
    
    if (!decoded || decoded.type !== 'password-reset') {
      return NextResponse.json(
        { success: false, error: 'Invalid or expired reset token' },
        { status: 400 }
      );
    }

    const { db } = await connectToDatabase();
    const usersCollection = db.collection('users');

    // Find user with matching token
    const user = await usersCollection.findOne({
      email: decoded.email,
      resetPasswordToken: token,
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Invalid reset token' },
        { status: 400 }
      );
    }

    // Check if token expired
    if (user.resetPasswordExpiry && new Date() > new Date(user.resetPasswordExpiry)) {
      return NextResponse.json(
        { success: false, error: 'Reset token has expired. Please request a new one.' },
        { status: 400 }
      );
    }

    // Hash new password
    const hashedPassword = await hashPassword(password);

    // Update user password and clear reset token
    await usersCollection.updateOne(
      { _id: user._id },
      {
        $set: {
          password: hashedPassword,
          resetPasswordToken: null,
          resetPasswordExpiry: null,
          updatedAt: new Date(),
        },
      }
    );

    return NextResponse.json({
      success: true,
      message: 'Password reset successfully! You can now login with your new password.',
    });
  } catch (error) {
    console.error('Reset password error:', error);
    
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return NextResponse.json(
        { success: false, error: 'Invalid or expired reset token' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to reset password' },
      { status: 500 }
    );
  }
}
