import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/app/lib/mongodb';
import { verifyToken } from '@/app/lib/jwt';
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

    const { token } = await request.json();

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Verification token is required' },
        { status: 400 }
      );
    }

    // Verify JWT token
    const decoded = verifyToken(token);
    
    if (!decoded || decoded.type !== 'verification') {
      return NextResponse.json(
        { success: false, error: 'Invalid or expired verification token' },
        { status: 400 }
      );
    }

    const { db } = await connectToDatabase();
    const usersCollection = db.collection('users');

    // Find user with matching token
    const user = await usersCollection.findOne({
      email: decoded.email,
      verificationToken: token,
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Invalid verification token' },
        { status: 400 }
      );
    }

    // Check if token expired
    if (user.verificationTokenExpiry && new Date() > new Date(user.verificationTokenExpiry)) {
      return NextResponse.json(
        { success: false, error: 'Verification token has expired. Please request a new one.' },
        { status: 400 }
      );
    }

    // Check if already verified
    if (user.isVerified) {
      return NextResponse.json(
        { success: false, error: 'Email already verified' },
        { status: 400 }
      );
    }

    // Update user as verified
    await usersCollection.updateOne(
      { _id: user._id },
      {
        $set: {
          isVerified: true,
          verificationToken: null,
          verificationTokenExpiry: null,
          updatedAt: new Date(),
        },
      }
    );

    return NextResponse.json({
      success: true,
      message: 'Email verified successfully! You can now login.',
    });
  } catch (error) {
    console.error('Verify email error:', error);
    
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return NextResponse.json(
        { success: false, error: 'Invalid or expired verification token' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to verify email' },
      { status: 500 }
    );
  }
}
