/**
 * Quiz Result Service
 * Handles quiz results and leaderboard business logic
 */

import { validate, sanitizeString } from '@/app/lib/validation';
import { quizResultSchema, leaderboardQuerySchema, difficultySchema } from '@/app/lib/validation/schemas';
import { 
  getCacheOrFetch, 
  buildCacheKey, 
  CACHE_KEYS, 
  CACHE_TTL,
  invalidateCache 
} from '@/app/lib/cache';
import { getCollection } from './shared/database';

/**
 * Ensure database indexes exist
 */
async function ensureIndexes(collection) {
  try {
    const existingIndexes = await collection.indexes();
    const indexNames = existingIndexes.map(idx => idx.name);
    
    const indexes = [
      { key: { score: -1, createdAt: 1 }, name: 'leaderboard_score_date' },
      { key: { subject: 1 }, name: 'subject_1' },
      { key: { difficulty: 1 }, name: 'difficulty_1' },
      { key: { category: 1 }, name: 'category_1' },
      { key: { subject: 1, difficulty: 1, score: -1, createdAt: 1 }, name: 'filtered_leaderboard' }
    ];
    
    for (const index of indexes) {
      if (!indexNames.includes(index.name)) {
        await collection.createIndex(index.key, { name: index.name, background: true });
      }
    }
  } catch (error) {
    console.error('Error ensuring indexes:', error);
  }
}

/**
 * Save quiz result
 */
export async function saveQuizResult(resultData) {
  const validated = validate(quizResultSchema, resultData);
  
  const collection = await getCollection('results');
  await ensureIndexes(collection);
  
  const result = await collection.insertOne({
    ...validated,
    category: validated.category || 'General',
    subject: validated.subject || 'General',
    difficulty: validated.difficulty || 'medium',
    createdAt: new Date()
  });
  
  await Promise.all([
    invalidateCache(CACHE_KEYS.LEADERBOARD),
    invalidateCache(CACHE_KEYS.ANALYTICS),
    invalidateCache(CACHE_KEYS.ADMIN_ANALYTICS)
  ]);
  
  return {
    success: true,
    resultId: result.insertedId.toString()
  };
}

/**
 * Get leaderboard with filters
 */
export async function getLeaderboard(params) {
  const validated = validate(leaderboardQuerySchema, params);
  
  const sanitizedCategory = sanitizeString(validated.category || '');
  const sanitizedSubject = sanitizeString(validated.subject || '');
  const sanitizedDifficulty = sanitizeString(validated.difficulty || '');
  
  const cacheKey = buildCacheKey(CACHE_KEYS.LEADERBOARD, {
    limit: validated.limit,
    page: validated.page,
    category: sanitizedCategory,
    subject: sanitizedSubject,
    difficulty: sanitizedDifficulty,
  });

  const leaderboardData = await getCacheOrFetch(
    cacheKey,
    async () => {
      const collection = await getCollection('results');
      await ensureIndexes(collection);
      
      const filter = {};
      
      if (sanitizedCategory && sanitizedCategory !== 'all') {
        filter.category = sanitizedCategory;
      }
      
      if (sanitizedSubject && sanitizedSubject !== 'all') {
        filter.subject = sanitizedSubject;
      }
      
      if (sanitizedDifficulty && sanitizedDifficulty !== 'all') {
        try {
          filter.difficulty = validate(difficultySchema, sanitizedDifficulty);
        } catch {
          // Skip invalid difficulty
        }
      }
      
      const totalCount = await collection.countDocuments(filter);
      const totalPages = Math.ceil(totalCount / validated.limit);
      const skip = (validated.page - 1) * validated.limit;
      
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
        .limit(validated.limit)
        .toArray();
      
      return {
        success: true,
        count: results.length,
        totalCount,
        totalPages,
        currentPage: validated.page,
        results
      };
    },
    CACHE_TTL.LEADERBOARD
  );
  
  return leaderboardData;
}
