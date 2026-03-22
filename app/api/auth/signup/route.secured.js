import { NextResponse } from 'next/server';
import { createUser } from '@/app/lib/auth';
import { validateEmail, validatePassword, validateUsername } from '@/app/lib/validation';
import { rateLimitLogin } from '@/app/lib/rateLimit';

export async function POST(request) {
  try {
    // Rate limiting - 5 attempts per 15 minutes
    const rateLimit = rateLimitLogin(request);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { success: false, error: "Too many signup attempts. Please try again later." },
        { status: 429 }
      );
    }

    // Parse and validate request body
    let body;
    try {
      body = await request.json();
    } catch (error) {
      return NextResponse.json(
        { success: false, error: "Invalid JSON in request body" },
        { status: 400 }
      );
    }

    const { email, password, userName } = body;

    // Validate email with sanitization
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

    // Validate username with sanitization
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

    // Return success without exposing sensitive data
    return NextResponse.json({
      success: true,
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
        { success: false, error: 'User already exists' },
        { status: 409 }
      );
    }
    
    // Generic error without exposing internals
    return NextResponse.json(
      { success: false, error: 'Signup failed. Please try again.' },
      { status: 500 }
    );
  }
}

// Reject other methods
export async function GET() {
  return NextResponse.json(
    { success: false, error: 'Method not allowed' },
    { status: 405 }
  );
}

export async function PUT() {
  return NextResponse.json(
    { success: false, error: 'Method not allowed' },
    { status: 405 }
  );
}

export async function DELETE() {
  return NextResponse.json(
    { success: false, error: 'Method not allowed' },
    { status: 405 }
  );
}
