import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/app/lib/mongodb';
import { generateToken } from '@/app/lib/jwt';
import { sendVerificationEmail } from '@/app/lib/email';
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

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    // Check if already verified
    if (user.isVerified) {
      return NextResponse.json(
        { success: false, error: 'Email already verified' },
        { status: 400 }
      );
    }

    // Generate verification token (expires in 1 hour)
    const verificationToken = generateToken(
      { userId: user._id.toString(), email: user.email, type: 'verification' },
      '1h'
    );

    // Update user with verification token
    await usersCollection.updateOne(
      { _id: user._id },
      {
        $set: {
          verificationToken,
          verificationTokenExpiry: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
          updatedAt: new Date(),
        },
      }
    );

    // Send verification email
    const emailResult = await sendVerificationEmail(
      user.email,
      user.userName,
      verificationToken
    );

    if (!emailResult.success) {
      return NextResponse.json(
        { success: false, error: 'Failed to send verification email' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Verification email sent successfully',
    });
  } catch (error) {
    console.error('Send verification error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to send verification email' },
      { status: 500 }
    );
  }
}
