import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/app/lib/database/connection';
import { verifyAuth } from '@/app/lib/middleware';
import { ObjectId } from 'mongodb';
import { validateObjectId } from '@/app/lib/validation';
import { rateLimitApi } from '@/app/lib/rateLimit';

export const dynamic = 'force-dynamic';

export async function GET(request, { params }) {
  try {
    // Rate limiting
    const rateLimit = rateLimitApi(request);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { success: false, error: "Too many requests. Please try again later." },
        { status: 429 }
      );
    }

    const { id } = params;
    
    // Validate quiz ID
    const idValidation = validateObjectId(id);
    if (!idValidation.valid) {
      return NextResponse.json(
        { success: false, error: idValidation.error },
        { status: 400 }
      );
    }
    
    const { db } = await connectToDatabase();
    const collection = db.collection('customQuizzes');
    
    const quiz = await collection.findOne({ _id: new ObjectId(idValidation.value) });
    
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
      { success: false, error: 'Failed to fetch quiz' },
      { status: 500 }
    );
  }
}
