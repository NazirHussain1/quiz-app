import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/app/lib/mongodb';
import { requireAuth } from '@/app/lib/authMiddleware';
import { ObjectId } from 'mongodb';
import {
  validateSubject,
  validateDifficulty,
  validateQuestion,
  validateOptions,
  validateCorrectAnswer,
  validateObjectId,
  sanitizeString
} from '@/app/lib/validation';
import { rateLimitApi } from '@/app/lib/rateLimit';

export const dynamic = 'force-dynamic';

export const GET = requireAuth(async (request) => {
  try {
    // Rate limiting
    const rateLimit = rateLimitApi(request);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { success: false, error: "Too many requests. Please try again later." },
        { status: 429 }
      );
    }

    const user = request.user;

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
      { success: false, error: 'Failed to fetch custom quizzes' },
      { status: 500 }
    );
  }
});

export const POST = requireAuth(async (request) => {
  try {
    // Rate limiting
    const rateLimit = rateLimitApi(request);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { success: false, error: "Too many requests. Please try again later." },
        { status: 429 }
      );
    }

    const user = request.user;
    const body = await request.json();
    
    // Validate title
    if (!body.title || typeof body.title !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Title is required' },
        { status: 400 }
      );
    }
    
    const title = sanitizeString(body.title);
    if (!title || title.length < 3) {
      return NextResponse.json(
        { success: false, error: 'Title must be at least 3 characters' },
        { status: 400 }
      );
    }
    
    if (title.length > 200) {
      return NextResponse.json(
        { success: false, error: 'Title must not exceed 200 characters' },
        { status: 400 }
      );
    }
    
    // Validate questions array
    if (!body.questions || !Array.isArray(body.questions)) {
      return NextResponse.json(
        { success: false, error: 'Questions must be an array' },
        { status: 400 }
      );
    }
    
    if (body.questions.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Quiz must have at least one question' },
        { status: 400 }
      );
    }
    
    if (body.questions.length > 100) {
      return NextResponse.json(
        { success: false, error: 'Quiz cannot have more than 100 questions' },
        { status: 400 }
      );
    }
    
    // Validate subject if provided
    let subject = 'Custom';
    if (body.subject && body.subject !== 'Custom') {
      const subjectValidation = validateSubject(body.subject);
      if (subjectValidation.valid) {
        subject = subjectValidation.value;
      } else {
        subject = sanitizeString(body.subject);
      }
    }
    
    // Validate difficulty
    let difficulty = 'medium';
    if (body.difficulty) {
      const difficultyValidation = validateDifficulty(body.difficulty);
      if (difficultyValidation.valid) {
        difficulty = difficultyValidation.value;
      }
    }
    
    // Validate each question
    const validatedQuestions = [];
    for (let i = 0; i < body.questions.length; i++) {
      const q = body.questions[i];
      
      // Validate question text
      const questionValidation = validateQuestion(q.question);
      if (!questionValidation.valid) {
        return NextResponse.json(
          { success: false, error: `Question ${i + 1}: ${questionValidation.error}` },
          { status: 400 }
        );
      }
      
      // Validate options
      const optionsValidation = validateOptions(q.options);
      if (!optionsValidation.valid) {
        return NextResponse.json(
          { success: false, error: `Question ${i + 1}: ${optionsValidation.error}` },
          { status: 400 }
        );
      }
      
      // Validate correct answer
      const correctAnswerValidation = validateCorrectAnswer(
        q.correctAnswer,
        optionsValidation.value
      );
      if (!correctAnswerValidation.valid) {
        return NextResponse.json(
          { success: false, error: `Question ${i + 1}: ${correctAnswerValidation.error}` },
          { status: 400 }
        );
      }
      
      validatedQuestions.push({
        question: questionValidation.value,
        options: optionsValidation.value,
        correctAnswer: correctAnswerValidation.value
      });
    }
    
    const { db } = await connectToDatabase();
    const collection = db.collection('customQuizzes');
    
    const quiz = {
      userId: user.userId,
      userName: user.userName,
      title,
      description: body.description ? sanitizeString(body.description) : '',
      subject,
      difficulty,
      questions: validatedQuestions,
      isPublic: body.isPublic === true,
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
      { success: false, error: 'Failed to create custom quiz' },
      { status: 500 }
    );
  }
});

export const DELETE = requireAuth(async (request) => {
  try {
    // Rate limiting
    const rateLimit = rateLimitApi(request);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { success: false, error: "Too many requests. Please try again later." },
        { status: 429 }
      );
    }

    const user = request.user;
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
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
    
    const result = await collection.deleteOne({ 
      _id: new ObjectId(idValidation.value),
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
      { success: false, error: 'Failed to delete quiz' },
      { status: 500 }
    );
  }
});
