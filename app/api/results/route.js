import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/app/lib/mongodb';
import {
  validateUsername,
  validateScore,
  validateCategory,
  validateSubject,
  validateDifficulty,
  sanitizeString
} from '@/app/lib/validation';
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

    const body = await request.json();
    
    // Validate name
    const nameValidation = validateUsername(body.name);
    if (!nameValidation.valid) {
      return NextResponse.json(
        { success: false, error: nameValidation.error },
        { status: 400 }
      );
    }
    
    // Validate score
    if (typeof body.score !== 'number' || typeof body.totalQuestions !== 'number') {
      return NextResponse.json(
        { success: false, error: 'Score and totalQuestions must be numbers' },
        { status: 400 }
      );
    }
    
    const scoreValidation = validateScore(body.score, body.totalQuestions);
    if (!scoreValidation.valid) {
      return NextResponse.json(
        { success: false, error: scoreValidation.error },
        { status: 400 }
      );
    }
    
    // Validate category (optional)
    let category = 'General';
    if (body.category) {
      const categoryValidation = validateCategory(body.category);
      if (categoryValidation.valid) {
        category = categoryValidation.value;
      }
    }
    
    // Validate subject (optional, but strict if provided)
    let subject = 'General';
    if (body.subject && body.subject !== 'General' && body.subject !== 'Custom') {
      const subjectValidation = validateSubject(body.subject);
      if (subjectValidation.valid) {
        subject = subjectValidation.value;
      } else {
        // Allow "Custom" for custom quizzes
        subject = sanitizeString(body.subject);
      }
    } else if (body.subject) {
      subject = sanitizeString(body.subject);
    }
    
    // Validate difficulty (optional)
    let difficulty = 'medium';
    if (body.difficulty) {
      const difficultyValidation = validateDifficulty(body.difficulty);
      if (difficultyValidation.valid) {
        difficulty = difficultyValidation.value;
      }
    }
    
    // Validate timeTaken (optional)
    let timeTaken = null;
    if (body.timeTaken !== undefined && body.timeTaken !== null) {
      if (typeof body.timeTaken === 'number' && body.timeTaken >= 0) {
        timeTaken = Math.min(body.timeTaken, 86400); // Max 24 hours
      }
    }
    
    // Validate examMode (optional)
    const examMode = body.examMode === true;
    
    const { db } = await connectToDatabase();
    const collection = db.collection('results');
    
    const result = await collection.insertOne({
      name: nameValidation.value,
      category,
      subject,
      score: scoreValidation.value,
      totalQuestions: body.totalQuestions,
      difficulty,
      timeTaken,
      examMode,
      createdAt: new Date()
    });
    
    return NextResponse.json({ 
      success: true, 
      resultId: result.insertedId.toString()
    }, { status: 201 });
  } catch (error) {
    console.error('Error storing result:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to store result' },
      { status: 500 }
    );
  }
}

export async function GET(request) {
  try {
    // Rate limiting
    const rateLimit = rateLimitApi(request);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { success: false, error: "Too many requests. Please try again later." },
        { status: 429 }
      );
    }

    const { searchParams } = new URL(request.url);
    
    // Validate and sanitize pagination parameters
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '50')));
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    
    // Sanitize filter parameters
    const category = sanitizeString(searchParams.get('category') || '');
    const subject = sanitizeString(searchParams.get('subject') || '');
    const difficulty = sanitizeString(searchParams.get('difficulty') || '');
    
    const { db } = await connectToDatabase();
    const collection = db.collection('results');
    
    // Build safe filter object
    const filter = {};
    
    if (category) {
      filter.category = category;
    }
    
    if (subject) {
      filter.subject = subject;
    }
    
    if (difficulty) {
      const difficultyValidation = validateDifficulty(difficulty);
      if (difficultyValidation.valid) {
        filter.difficulty = difficultyValidation.value;
      }
    }
    
    // Get total count for pagination
    const totalCount = await collection.countDocuments(filter);
    const totalPages = Math.ceil(totalCount / limit);
    const skip = (page - 1) * limit;
    
    const results = await collection
      .find(filter)
      .sort({ score: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .toArray();
    
    return NextResponse.json({ 
      success: true, 
      count: results.length,
      totalCount,
      totalPages,
      currentPage: page,
      results 
    }, {
      headers: {
        'Cache-Control': 'no-store, max-age=0',
      }
    });
  } catch (error) {
    console.error('Error fetching results:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch results' },
      { status: 500 }
    );
  }
}
