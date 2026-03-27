import { NextResponse } from 'next/server';
import { verifyAdmin } from '@/app/lib/authMiddleware';
import { connectToDatabase } from '@/app/lib/mongodb';

export async function GET(request) {
  try {
    const authResult = await verifyAdmin(request);
    if (!authResult.authorized) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { db } = await connectToDatabase();
    const users = await db.collection('users')
      .find({})
      .sort({ createdAt: -1 })
      .toArray();

    const formattedUsers = users.map(user => ({
      _id: user._id.toString(),
      userName: user.userName,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt
    }));

    return NextResponse.json({
      success: true,
      users: formattedUsers
    });
  } catch (error) {
    console.error('Fetch users error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}
