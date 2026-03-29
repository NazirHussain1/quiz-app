import { NextResponse } from 'next/server';
import { createUser } from '@/app/lib/auth';
import { generateToken } from '@/app/lib/jwt';
import { validateEmail, validatePassword, validateUsername } from '@/app/lib/validation';
import { rateLimitLogin } from '@/app/lib/rateLimit';
import { sendVerificationEmail } from '@/app/lib/email';
import { connectToDatabase } from '@/app/lib/mongodb';

export async function POST(request) {
  try {
    // Rate limiting
    const rateLimit = rateLimitLogin(request);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { success: false, error: "Too many signup attempts. Please try again later." },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { email, password, userName } = body;

    // Validate email
    const emailValidation = validateEmail(email);
    if (!emailValidation.valid) {
      return NextResponse.json(
        { success: false, error: emailValidation.error },
        { status: 400 }
      );
    }

    // Validate password
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.valid) {
      return NextResponse.json(
        { success: false, error: passwordValidation.error },
        { status: 400 }
      );
    }

    // Validate username
    const usernameValidation = validateUsername(userName);
    if (!usernameValidation.valid) {
      return NextResponse.json(
        { success: false, error: usernameValidation.error },
        { status: 400 }
      );
    }

    // Create user with sanitized inputs
    const user = await createUser(
      emailValidation.value,
      passwordValidation.value,
      usernameValidation.value
    );

    // Generate JWT token with expiry
    const token = generateToken(user);

    return NextResponse.json({
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        userName: user.userName,
        role: user.role
      }
    }, { status: 201 });
  } catch (error) {
    console.error('Signup error:', error);
    
    // Handle specific errors
    if (error.message === 'User already exists') {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 409 }
      );
    }
    
    // Don't expose internal errors
    return NextResponse.json(
      { success: false, error: 'Signup failed. Please try again.' },
      { status: 500 }
    );
  }
}
