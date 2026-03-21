import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/app/lib/mongodb';
import { verifyAuth } from '@/app/lib/authMiddleware';
import { ObjectId } from 'mongodb';
import { validateSubject } from '@/app/lib/models/Question';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  const user = await verifyAuth(request);
  if (!user) {
    return NextResponse.json(
      { success: false, error: 'Authentication required' },
      { status: 401 }
    );
  }

  try {
    const { db } = await connectToDatabase();
    const collection = db.collection('customQuizzes');
    
    const quizzes = await collection
      .find({ userId: user.userId })
      .sort({ createdAt: -1 })
      .toArray();
    
    return NextResponse.json({ 
      success: true, 
      count: quizzes.length,
      quizzes 
    });
  } catch (error) {
    console.error('Error fetching custom quizzes:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  const user = await verifyAuth(request);
  if (!user) {
    return NextResponse.json(
      { success: false, error: 'Authentication required' },
      { status: 401 }
    );
  }

  try {
    const body = await request.json();
    
    if (!body.title || !body.questions || !Array.isArray(body.questions)) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    if (body.questions.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Quiz must have at least one question' },
        { status: 400 }
      );
    }
    
    // Validate subject if provided
    if (body.subject && body.subject !== 'Custom') {
      const subjectValidation = validateSubject(body.subject);
      if (!subjectValidation.valid) {
        return NextResponse.json(
          { success: false, error: subjectValidation.error },
          { status: 400 }
        );
      }
    }
    
    // Validate each question
    for (const q of body.questions) {
      if (!q.question || !q.options || !q.correctAnswer) {
        return NextResponse.json(
          { success: false, error: 'Invalid question format' },
          { status: 400 }
        );
      }
      
      if (!Array.isArray(q.options) || q.options.length !== 4) {
        return NextResponse.json(
          { success: false, error: 'Each question must have exactly 4 options' },
          { status: 400 }
        );
      }
      
      if (!q.options.includes(q.correctAnswer)) {
        return NextResponse.json(
          { success: false, error: 'Correct answer must be one of the options' },
          { status: 400 }
        );
      }
    }
    
    const { db } = await connectToDatabase();
    const collection = db.collection('customQuizzes');
    
    const quiz = {
      userId: user.userId,
      userName: user.userName,
      title: body.title,
      description: body.description || '',
      subject: body.subject || 'Custom',
      difficulty: body.difficulty || 'medium',
      questions: body.questions,
      isPublic: body.isPublic || false,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const result = await collection.insertOne(quiz);
    
    return NextResponse.json({ 
      success: true, 
      quizId: result.insertedId.toString(),
      message: 'Custom quiz created successfully'
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating custom quiz:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(request) {
  const user = await verifyAuth(request);
  if (!user) {
    return NextResponse.json(
      { success: false, error: 'Authentication required' },
      { status: 401 }
    );
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Quiz ID is required' },
        { status: 400 }
      );
    }
    
    const { db } = await connectToDatabase();
    const collection = db.collection('customQuizzes');
    
    const result = await collection.deleteOne({ 
      _id: new ObjectId(id),
      userId: user.userId // Ensure user can only delete their own quizzes
    });
    
    if (result.deletedCount === 0) {
      return NextResponse.json(
        { success: false, error: 'Quiz not found or unauthorized' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ 
      success: true,
      message: 'Quiz deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting custom quiz:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
