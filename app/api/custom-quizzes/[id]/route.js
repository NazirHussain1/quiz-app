import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/app/lib/mongodb';
import { verifyAuth } from '@/app/lib/authMiddleware';
import { ObjectId } from 'mongodb';

export const dynamic = 'force-dynamic';

export async function GET(request, { params }) {
  try {
    const { id } = params;
    
    const { db } = await connectToDatabase();
    const collection = db.collection('customQuizzes');
    
    const quiz = await collection.findOne({ _id: new ObjectId(id) });
    
    if (!quiz) {
      return NextResponse.json(
        { success: false, error: 'Quiz not found' },
        { status: 404 }
      );
    }
    
    // Check if quiz is public or user owns it
    const user = await verifyAuth(request);
    if (!quiz.isPublic && (!user || user.userId !== quiz.userId)) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 403 }
      );
    }
    
    return NextResponse.json({ 
      success: true, 
      quiz 
    });
  } catch (error) {
    console.error('Error fetching custom quiz:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
