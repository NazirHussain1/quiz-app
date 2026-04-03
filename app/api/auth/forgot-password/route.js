import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/app/lib/database/connection';
import { generateToken } from '@/app/lib/jwt';
import { sendPasswordResetEmail } from '@/app/lib/email';
import { rateLimitApi } from '@/app/lib/rateLimit';

export const dynamic = 'force-dynamic';

export async function POST(request) {
  try {
    // Rate limiting - stricter for password reset
    const rateLimit = rateLimitApi(request);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { success: false, error: "Too many requests. Please try again later." },
        { status: 429 }
      );
    }

    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { success: false, error: 'Email is required' },
        { status: 400 }
      );
    }

    const { db } = await connectToDatabase();
    const usersCollection = db.collection('users');

    // Find user
    const user = await usersCollection.findOne({ email: email.toLowerCase() });

    // Always return success to prevent email enumeration
    if (!user) {
      return NextResponse.json({
        success: true,
        message: 'If an account exists with this email, you will receive a password reset link.',
      });
    }

    // Generate reset token (expires in 1 hour)
    const resetToken = generateToken(
      { userId: user._id.toString(), email: user.email, type: 'password-reset' },
      '1h'
    );

    // Update user with reset token
    await usersCollection.updateOne(
      { _id: user._id },
      {
        $set: {
          resetPasswordToken: resetToken,
          resetPasswordExpiry: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
          updatedAt: new Date(),
        },
      }
    );

    // Send password reset email
    const emailResult = await sendPasswordResetEmail(
      user.email,
      user.userName,
      resetToken
    );

    if (!emailResult.success) {
      console.error('Failed to send password reset email:', emailResult.error);
      // Don't expose email sending failure to user
    }

    return NextResponse.json({
      success: true,
      message: 'If an account exists with this email, you will receive a password reset link.',
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process password reset request' },
      { status: 500 }
    );
  }
}
