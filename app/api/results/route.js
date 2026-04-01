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
import { 
  getCacheOrFetch, 
  buildCacheKey, 
  CACHE_KEYS, 
  CACHE_TTL,
  invalidateCache 
} from '@/app/lib/cache';

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
    
    // Ensure indexes exist for optimal query performance
    await ensureIndexes(collection);
    
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
    
    // Invalidate leaderboard and analytics cache
    await invalidateCache(CACHE_KEYS.LEADERBOARD);
    await invalidateCache(CACHE_KEYS.ANALYTICS);
    await invalidateCache(CACHE_KEYS.ADMIN_ANALYTICS);
    console.log('🗑️  Leaderboard and analytics cache invalidated');
    
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
    
    // Build cache key
    const cacheKey = buildCacheKey(CACHE_KEYS.LEADERBOARD, {
      limit,
      page,
      category,
      subject,
      difficulty,
    });

    // Use cache-aside pattern for leaderboard
    const leaderboardData = await getCacheOrFetch(
      cacheKey,
      async () => {
        const { db } = await connectToDatabase();
        const collection = db.collection('results');
        
        // Ensure indexes exist for optimal query performance
        await ensureIndexes(collection);
        
        // Build safe filter object
        const filter = {};
        
        // Apply filters only if provided
        if (category && category !== 'all') {
          filter.category = category;
        }
        
        if (subject && subject !== 'all') {
          filter.subject = subject;
        }
        
        if (difficulty && difficulty !== 'all') {
          const difficultyValidation = validateDifficulty(difficulty);
          if (difficultyValidation.valid) {
            filter.difficulty = difficultyValidation.value;
          }
        }
        
        // Get total count for pagination (with filters applied)
        const totalCount = await collection.countDocuments(filter);
        const totalPages = Math.ceil(totalCount / limit);
        const skip = (page - 1) * limit;
        
        // Optimized query with projection (return only required fields)
        const results = await collection
          .find(filter, {
            projection: {
              name: 1,
              score: 1,
              totalQuestions: 1,
              subject: 1,
              category: 1,
              difficulty: 1,
              examMode: 1,
              timeTaken: 1,
              createdAt: 1
            }
          })
          .sort({ score: -1, createdAt: 1 }) // Sort by score DESC, then by date ASC (earlier dates first for same score)
          .skip(skip)
          .limit(limit)
          .toArray();
        
        return {
          success: true,
          count: results.length,
          totalCount,
          totalPages,
          currentPage: page,
          results
        };
      },
      CACHE_TTL.LEADERBOARD
    );
    
    return NextResponse.json(leaderboardData, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
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

/**
 * Ensure database indexes exist for optimal query performance
 * This function is idempotent - safe to call multiple times
 */
async function ensureIndexes(collection) {
  try {
    // Check if indexes already exist
    const existingIndexes = await collection.indexes();
    const indexNames = existingIndexes.map(idx => idx.name);
    
    // Create compound index for leaderboard queries (score DESC, createdAt ASC)
    if (!indexNames.includes('leaderboard_score_date')) {
      await collection.createIndex(
        { score: -1, createdAt: 1 },
        { name: 'leaderboard_score_date', background: true }
      );
      console.log('Created index: leaderboard_score_date');
    }
    
    // Create index for subject filtering
    if (!indexNames.includes('subject_1')) {
      await collection.createIndex(
        { subject: 1 },
        { name: 'subject_1', background: true }
      );
      console.log('Created index: subject_1');
    }
    
    // Create index for difficulty filtering
    if (!indexNames.includes('difficulty_1')) {
      await collection.createIndex(
        { difficulty: 1 },
        { name: 'difficulty_1', background: true }
      );
      console.log('Created index: difficulty_1');
    }
    
    // Create index for category filtering
    if (!indexNames.includes('category_1')) {
      await collection.createIndex(
        { category: 1 },
        { name: 'category_1', background: true }
      );
      console.log('Created index: category_1');
    }
    
    // Create compound index for filtered leaderboard queries
    if (!indexNames.includes('filtered_leaderboard')) {
      await collection.createIndex(
        { subject: 1, difficulty: 1, score: -1, createdAt: 1 },
        { name: 'filtered_leaderboard', background: true }
      );
      console.log('Created index: filtered_leaderboard');
    }
    
  } catch (error) {
    // Log error but don't fail the request
    console.error('Error ensuring indexes:', error);
  }
}
