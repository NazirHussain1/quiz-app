import { NextResponse } from 'next/server';
import { verifyAdmin } from '@/app/lib/authMiddleware';
import { connectToDatabase } from '@/app/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function POST(request) {
  try {
    const authResult = await verifyAdmin(request);
    if (!authResult.authorized) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID is required' },
        { status: 400 }
      );
    }

    const { db } = await connectToDatabase();
    
    const result = await db.collection('users').updateOne(
      { _id: new ObjectId(userId) },
      { 
        $set: { 
          role: 'admin',
          updatedAt: new Date()
        } 
      }
    );

    if (result.modifiedCount === 0) {
      return NextResponse.json(
        { success: false, error: 'User not found or already admin' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'User promoted to admin successfully'
    });
  } catch (error) {
    console.error('Make admin error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to make admin' },
      { status: 500 }
    );
  }
}
