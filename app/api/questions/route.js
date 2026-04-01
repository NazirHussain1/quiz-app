import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/app/lib/mongodb';
import {
  validateSubject,
  validateDifficulty,
  validateCategory,
  validateQuestion,
  validateOptions,
  validateCorrectAnswer,
  sanitizeString
} from '@/app/lib/validation';
import { rateLimitApi } from '@/app/lib/rateLimit';
import { 
  getCacheOrFetch, 
  buildCacheKey, 
  CACHE_KEYS, 
  CACHE_TTL,
  invalidateCache 
} from '@/app/lib/cache';

export const dynamic = 'force-dynamic';

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
    
    // Sanitize and validate parameters
    const category = sanitizeString(searchParams.get('category') || '');
    const subject = sanitizeString(searchParams.get('subject') || '');
    const difficulty = sanitizeString(searchParams.get('difficulty') || '');
    const search = sanitizeString(searchParams.get('search') || '');
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '10')));
    
    // Build cache key based on query parameters
    const cacheKey = buildCacheKey(CACHE_KEYS.QUESTIONS, {
      category,
      subject,
      difficulty,
      search,
      limit,
    });

    // Use cache-aside pattern
    const questions = await getCacheOrFetch(
      cacheKey,
      async () => {
        const { db } = await connectToDatabase();
        const collection = db.collection('questions');
        
        const matchStage = {};
        
        if (category) {
          matchStage.category = category;
        }
        
        if (subject) {
          const subjectValidation = validateSubject(subject);
          if (subjectValidation.valid) {
            matchStage.subject = subjectValidation.value;
          }
        }
        
        if (difficulty) {
          const difficultyValidation = validateDifficulty(difficulty);
          if (difficultyValidation.valid) {
            matchStage.difficulty = difficultyValidation.value;
          }
        }
        
        // Safe text search
        if (search) {
          matchStage.question = { $regex: search, $options: 'i' };
        }
        
        const pipeline = [];
        
        if (Object.keys(matchStage).length > 0) {
          pipeline.push({ $match: matchStage });
        }
        
        pipeline.push({ $sample: { size: limit } });
        
        return await collection.aggregate(pipeline).toArray();
      },
      CACHE_TTL.QUESTIONS
    );
    
    return NextResponse.json({ 
      success: true, 
      count: questions.length,
      questions 
    }, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
      }
    });
  } catch (error) {
    console.error('Error fetching questions:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch questions' },
      { status: 500 }
    );
  }
}

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
    
    // Validate category
    const categoryValidation = validateCategory(body.category);
    if (!categoryValidation.valid) {
      return NextResponse.json(
        { success: false, error: categoryValidation.error },
        { status: 400 }
      );
    }
    
    // Validate subject
    const subjectValidation = validateSubject(body.subject);
    if (!subjectValidation.valid) {
      return NextResponse.json(
        { success: false, error: subjectValidation.error },
        { status: 400 }
      );
    }
    
    // Validate difficulty
    const difficultyValidation = validateDifficulty(body.difficulty || 'medium');
    if (!difficultyValidation.valid) {
      return NextResponse.json(
        { success: false, error: difficultyValidation.error },
        { status: 400 }
      );
    }
    
    // Validate question
    const questionValidation = validateQuestion(body.question);
    if (!questionValidation.valid) {
      return NextResponse.json(
        { success: false, error: questionValidation.error },
        { status: 400 }
      );
    }
    
    // Validate options
    const optionsValidation = validateOptions(body.options);
    if (!optionsValidation.valid) {
      return NextResponse.json(
        { success: false, error: optionsValidation.error },
        { status: 400 }
      );
    }
    
    // Validate correct answer
    const correctAnswerValidation = validateCorrectAnswer(
      body.correctAnswer,
      optionsValidation.value
    );
    if (!correctAnswerValidation.valid) {
      return NextResponse.json(
        { success: false, error: correctAnswerValidation.error },
        { status: 400 }
      );
    }
    
    const { db } = await connectToDatabase();
    const collection = db.collection('questions');
    
    const result = await collection.insertOne({
      category: categoryValidation.value,
      subject: subjectValidation.value,
      topic: body.topic ? sanitizeString(body.topic) : '',
      difficulty: difficultyValidation.value,
      question: questionValidation.value,
      options: optionsValidation.value,
      correctAnswer: correctAnswerValidation.value,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    // Invalidate questions cache
    await invalidateCache(CACHE_KEYS.QUESTIONS);
    console.log('🗑️  Questions cache invalidated');
    
    return NextResponse.json({ 
      success: true, 
      questionId: result.insertedId.toString()
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating question:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create question' },
      { status: 500 }
    );
  }
}
