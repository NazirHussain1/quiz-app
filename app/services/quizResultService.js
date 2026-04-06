/**
 * Quiz Result Service
 * Handles quiz results and leaderboard business logic
 */

import { connectToDatabase } from '@/app/lib/database/connection';
import {
  validateUsername,
  validateScore,
  validateCategory,
  validateSubject,
  validateDifficulty,
  sanitizeString
} from '@/app/lib/validation';
import { 
  getCacheOrFetch, 
  buildCacheKey, 
  CACHE_KEYS, 
  CACHE_TTL,
  invalidateCache 
} from '@/app/lib/cache';
import { AppError } from '@/app/lib/errorHandler';

/**
 * Ensure database indexes exist for optimal query performance
 */
async function ensureIndexes(collection) {
  try {
    const existingIndexes = await collection.indexes();
    const indexNames = existingIndexes.map(idx => idx.name);
    
    if (!indexNames.includes('leaderboard_score_date')) {
      await collection.createIndex(
        { score: -1, createdAt: 1 },
        { name: 'leaderboard_score_date', background: true }
      );
    }
    
    if (!indexNames.includes('subject_1')) {
      await collection.createIndex(
        { subject: 1 },
        { name: 'subject_1', background: true }
      );
    }
    
    if (!indexNames.includes('difficulty_1')) {
      await collection.createIndex(
        { difficulty: 1 },
        { name: 'difficulty_1', background: true }
      );
    }
    
    if (!indexNames.includes('category_1')) {
      await collection.createIndex(
        { category: 1 },
        { name: 'category_1', background: true }
      );
    }
    
    if (!indexNames.includes('filtered_leaderboard')) {
      await collection.createIndex(
        { subject: 1, difficulty: 1, score: -1, createdAt: 1 },
        { name: 'filtered_leaderboard', background: true }
      );
    }
  } catch (error) {
    console.error('Error ensuring indexes:', error);
  }
}

/**
 * Save quiz result
 */
export async function saveQuizResult(resultData) {
  // Validate name
  const nameValidation = validateUsername(resultData.name);
  if (!nameValidation.valid) {
    throw new AppError(nameValidation.error, 400);
  }
  
  // Validate score
  if (typeof resultData.score !== 'number' || typeof resultData.totalQuestions !== 'number') {
    throw new AppError('Score and totalQuestions must be numbers', 400);
  }
  
  const scoreValidation = validateScore(resultData.score, resultData.totalQuestions);
  if (!scoreValidation.valid) {
    throw new AppError(scoreValidation.error, 400);
  }
  
  // Validate category (optional)
  let category = 'General';
  if (resultData.category) {
    const categoryValidation = validateCategory(resultData.category);
    if (categoryValidation.valid) {
      category = categoryValidation.value;
    }
  }
  
  // Validate subject (optional)
  let subject = 'General';
  if (resultData.subject && resultData.subject !== 'General' && resultData.subject !== 'Custom') {
    const subjectValidation = validateSubject(resultData.subject);
    if (subjectValidation.valid) {
      subject = subjectValidation.value;
    } else {
      subject = sanitizeString(resultData.subject);
    }
  } else if (resultData.subject) {
    subject = sanitizeString(resultData.subject);
  }
  
  // Validate difficulty (optional)
  let difficulty = 'medium';
  if (resultData.difficulty) {
    const difficultyValidation = validateDifficulty(resultData.difficulty);
    if (difficultyValidation.valid) {
      difficulty = difficultyValidation.value;
    }
  }
  
  // Validate timeTaken (optional)
  let timeTaken = null;
  if (resultData.timeTaken !== undefined && resultData.timeTaken !== null) {
    if (typeof resultData.timeTaken === 'number' && resultData.timeTaken >= 0) {
      timeTaken = Math.min(resultData.timeTaken, 86400); // Max 24 hours
    }
  }
  
  // Validate examMode (optional)
  const examMode = resultData.examMode === true;
  
  const { db } = await connectToDatabase();
  const collection = db.collection('results');
  
  await ensureIndexes(collection);
  
  const result = await collection.insertOne({
    name: nameValidation.value,
    category,
    subject,
    score: scoreValidation.value,
    totalQuestions: resultData.totalQuestions,
    difficulty,
    timeTaken,
    examMode,
    createdAt: new Date()
  });
  
  // Invalidate caches
  await invalidateCache(CACHE_KEYS.LEADERBOARD);
  await invalidateCache(CACHE_KEYS.ANALYTICS);
  await invalidateCache(CACHE_KEYS.ADMIN_ANALYTICS);
  
  return {
    success: true,
    resultId: result.insertedId.toString()
  };
}

/**
 * Get leaderboard with filters
 */
export async function getLeaderboard({ limit = 50, page = 1, category, subject, difficulty }) {
  // Validate and sanitize pagination
  const safeLimit = Math.min(100, Math.max(1, parseInt(limit)));
  const safePage = Math.max(1, parseInt(page));
  
  // Sanitize filters
  const sanitizedCategory = sanitizeString(category || '');
  const sanitizedSubject = sanitizeString(subject || '');
  const sanitizedDifficulty = sanitizeString(difficulty || '');
  
  // Build cache key
  const cacheKey = buildCacheKey(CACHE_KEYS.LEADERBOARD, {
    limit: safeLimit,
    page: safePage,
    category: sanitizedCategory,
    subject: sanitizedSubject,
    difficulty: sanitizedDifficulty,
  });

  const leaderboardData = await getCacheOrFetch(
    cacheKey,
    async () => {
      const { db } = await connectToDatabase();
      const collection = db.collection('results');
      
      await ensureIndexes(collection);
      
      const filter = {};
      
      if (sanitizedCategory && sanitizedCategory !== 'all') {
        filter.category = sanitizedCategory;
      }
      
      if (sanitizedSubject && sanitizedSubject !== 'all') {
        filter.subject = sanitizedSubject;
      }
      
      if (sanitizedDifficulty && sanitizedDifficulty !== 'all') {
        const difficultyValidation = validateDifficulty(sanitizedDifficulty);
        if (difficultyValidation.valid) {
          filter.difficulty = difficultyValidation.value;
        }
      }
      
      const totalCount = await collection.countDocuments(filter);
      const totalPages = Math.ceil(totalCount / safeLimit);
      const skip = (safePage - 1) * safeLimit;
      
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
        .sort({ score: -1, createdAt: 1 })
        .skip(skip)
        .limit(safeLimit)
        .toArray();
      
      return {
        success: true,
        count: results.length,
        totalCount,
        totalPages,
        currentPage: safePage,
        results
      };
    },
    CACHE_TTL.LEADERBOARD
  );
  
  return leaderboardData;
}
