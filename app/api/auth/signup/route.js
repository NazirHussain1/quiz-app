import { NextResponse } from 'next/server';
import { createUser } from '@/app/lib/auth';

export async function POST(request) {
  try {
    const { email, password, userName } = await request.json();
    
    if (!email || !password || !userName) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    if (password.length < 6) {
      return NextResponse.json(
        { success: false, error: 'Password must be at least 6 characters' },
        { status: 400 }
      );
    }
    
    const user = await createUser(email, password, userName);
    
    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        userName: user.userName
      }
    }, { status: 201 });
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
