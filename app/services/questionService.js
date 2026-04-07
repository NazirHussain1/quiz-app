/**
 * Question Service
 * Handles question management business logic
 */

import { validate, sanitizeString } from '@/app/lib/validation';
import { 
  questionSchema,
  updateQuestionSchema,
  questionQuerySchema
} from '@/app/lib/validation/schemas';
import { 
  getCacheOrFetch, 
  buildCacheKey, 
  CACHE_KEYS, 
  CACHE_TTL,
  invalidateCache 
} from '@/app/lib/cache';
import { logDB, logWarning } from '@/app/lib/logger';
import { AppError } from '@/app/lib/errorHandler';
import { sampleQuestions } from '@/app/lib/seed/sampleQuestions';
import { getCollection, validateAndConvertId, paginateQuery } from './shared/database';

/**
 * Build question filter from params
 */
function buildQuestionFilter(params) {
  const { category, subject, difficulty, search } = params;
  const matchStage = {};
  
  if (category) {
    matchStage.category = category;
  }
  
  if (subject) {
    matchStage.subject = subject;
  }
  
  if (difficulty) {
    matchStage.difficulty = difficulty;
  }
  
  if (search) {
    matchStage.question = { $regex: search, $options: 'i' };
  }
  
  return matchStage;
}

function shouldUseSampleFallback(error) {
  const message = error?.message || '';

  return /(MONGODB_URI|Failed to connect to MongoDB|server selection timed out|getaddrinfo|querySrv|ECONNREFUSED|ENOTFOUND|ETIMEDOUT|topology is closed|MongoNetworkError|MongoServerSelectionError)/i.test(message);
}

function shuffleQuestions(questions) {
  const shuffled = [...questions];

  for (let i = shuffled.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  return shuffled;
}

function getSampleQuestions(params) {
  const filtered = sampleQuestions.filter((question) => {
    if (params.category && question.category !== params.category) {
      return false;
    }

    if (params.subject && question.subject !== params.subject) {
      return false;
    }

    if (params.difficulty && question.difficulty !== params.difficulty) {
      return false;
    }

    if (params.search && !question.question.toLowerCase().includes(params.search.toLowerCase())) {
      return false;
    }

    return true;
  });

  return shuffleQuestions(filtered).slice(0, params.limit);
}

function getSampleCategories() {
  return [...new Set(sampleQuestions.map((question) => question.category).filter(Boolean))];
}

function getSampleSubjects(category = '') {
  return [
    ...new Set(
      sampleQuestions
        .filter((question) => !category || question.category === category)
        .map((question) => question.subject)
        .filter(Boolean)
    ),
  ];
}

async function getUniqueFieldValues(collection, fieldName, filter = {}) {
  const pipeline = [];
  const matchStage = {
    ...filter,
    [fieldName]: { $exists: true, $nin: ['', null] },
  };

  pipeline.push({ $match: matchStage });
  pipeline.push({ $group: { _id: `$${fieldName}` } });
  pipeline.push({ $sort: { _id: 1 } });

  const results = await collection.aggregate(pipeline).toArray();
  return results.map((item) => item._id).filter(Boolean);
}

/**
 * Get questions with filters
 */
export async function getQuestions(params) {
  const validated = validate(questionQuerySchema, {
    category: params?.category ?? undefined,
    subject: params?.subject ?? undefined,
    difficulty: params?.difficulty ?? undefined,
    search: params?.search ?? undefined,
    limit: params?.limit ?? undefined,
  });
  
  const sanitizedCategory = sanitizeString(validated.category || '');
  const sanitizedSubject = sanitizeString(validated.subject || '');
  const sanitizedDifficulty = sanitizeString(validated.difficulty || '');
  const sanitizedSearch = sanitizeString(validated.search || '');
  
  const cacheKey = buildCacheKey(CACHE_KEYS.QUESTIONS, {
    category: sanitizedCategory,
    subject: sanitizedSubject,
    difficulty: sanitizedDifficulty,
    search: sanitizedSearch,
    limit: validated.limit,
  });

  const startTime = Date.now();
  let source = 'mongodb';

  let questions;

  try {
    questions = await getCacheOrFetch(
      cacheKey,
      async () => {
        const collection = await getCollection('questions');
        
        const matchStage = buildQuestionFilter({
          category: sanitizedCategory,
          subject: sanitizedSubject,
          difficulty: sanitizedDifficulty,
          search: sanitizedSearch
        });
        
        const pipeline = [];
        
        if (Object.keys(matchStage).length > 0) {
          pipeline.push({ $match: matchStage });
        }
        
        pipeline.push({ $sample: { size: validated.limit } });
        
        return await collection.aggregate(pipeline).toArray();
      },
      CACHE_TTL.QUESTIONS
    );
  } catch (error) {
    if (!shouldUseSampleFallback(error)) {
      throw error;
    }

    source = 'sample';
    questions = getSampleQuestions({
      category: sanitizedCategory,
      subject: sanitizedSubject,
      difficulty: sanitizedDifficulty,
      search: sanitizedSearch,
      limit: validated.limit,
    });

    logWarning('Falling back to bundled sample questions', {
      error: error.message,
      filters: {
        category: sanitizedCategory,
        subject: sanitizedSubject,
        difficulty: sanitizedDifficulty,
        search: sanitizedSearch,
        limit: validated.limit,
      },
    });
  }
  
  const duration = Date.now() - startTime;
  
  logDB('fetch', 'questions', true, duration, {
    count: questions.length,
    filters: { category: sanitizedCategory, subject: sanitizedSubject, difficulty: sanitizedDifficulty, search: sanitizedSearch, limit: validated.limit },
    source,
  });
  
  return {
    success: true,
    count: questions.length,
    questions
  };
}

/**
 * Create new question
 */
export async function createQuestion(questionData) {
  const validated = validate(questionSchema, questionData);
  
  const collection = await getCollection('questions');
  
  const result = await collection.insertOne({
    ...validated,
    createdAt: new Date(),
    updatedAt: new Date()
  });
  
  await Promise.all([
    invalidateCache(CACHE_KEYS.QUESTIONS),
    invalidateCache(CACHE_KEYS.CATEGORIES),
    invalidateCache(CACHE_KEYS.SUBJECTS)
  ]);
  
  return {
    success: true,
    questionId: result.insertedId.toString()
  };
}

/**
 * Get question categories
 */
export async function getCategories() {
  const cacheKey = buildCacheKey(CACHE_KEYS.CATEGORIES);

  try {
    return await getCacheOrFetch(
      cacheKey,
      async () => {
        const collection = await getCollection('questions');
        const categories = await getUniqueFieldValues(collection, 'category');
        
        return {
          success: true,
          categories
        };
      },
      CACHE_TTL.CATEGORIES
    );
  } catch (error) {
    if (!shouldUseSampleFallback(error)) {
      throw error;
    }

    logWarning('Falling back to bundled sample categories', { error: error.message });

    return {
      success: true,
      categories: getSampleCategories(),
    };
  }
}

/**
 * Get question subjects
 */
export async function getSubjects(params = {}) {
  const sanitizedCategory = sanitizeString(params.category || '');
  const cacheKey = buildCacheKey(CACHE_KEYS.SUBJECTS, {
    category: sanitizedCategory,
  });

  try {
    return await getCacheOrFetch(
      cacheKey,
      async () => {
        const collection = await getCollection('questions');
        const filter = sanitizedCategory ? { category: sanitizedCategory } : {};
        const subjects = await getUniqueFieldValues(collection, 'subject', filter);
        
        return {
          success: true,
          subjects
        };
      },
      CACHE_TTL.SUBJECTS
    );
  } catch (error) {
    if (!shouldUseSampleFallback(error)) {
      throw error;
    }

    logWarning('Falling back to bundled sample subjects', {
      error: error.message,
      category: sanitizedCategory,
    });

    return {
      success: true,
      subjects: getSampleSubjects(sanitizedCategory),
    };
  }
}

/**
 * Get questions for admin (with pagination)
 */
export async function getQuestionsForAdmin(params) {
  const { category, subject, difficulty, search, page = 1, limit = 20 } = params;
  
  const sanitizedCategory = sanitizeString(category || '');
  const sanitizedSubject = sanitizeString(subject || '');
  const sanitizedDifficulty = sanitizeString(difficulty || '');
  const sanitizedSearch = sanitizeString(search || '');
  
  const collection = await getCollection('questions');
  
  const filter = {};
  
  if (sanitizedCategory && sanitizedCategory !== 'all') {
    filter.category = sanitizedCategory;
  }
  
  if (sanitizedSubject && sanitizedSubject !== 'all') {
    filter.subject = sanitizedSubject;
  }
  
  if (sanitizedDifficulty && sanitizedDifficulty !== 'all') {
    filter.difficulty = sanitizedDifficulty;
  }
  
  if (sanitizedSearch) {
    filter.question = { $regex: sanitizedSearch, $options: 'i' };
  }
  
  const result = await paginateQuery(collection, filter, { page, limit });
  
  return {
    success: true,
    ...result,
    questions: result.documents
  };
}

/**
 * Update question
 */
export async function updateQuestion(questionId, updateData) {
  const validated = validate(updateQuestionSchema, { _id: questionId, ...updateData });
  
  const objectId = validateAndConvertId(validated._id);
  const collection = await getCollection('questions');
  
  const { _id, ...updateFields } = validated;
  updateFields.updatedAt = new Date();
  
  if (updateFields.question) {
    const existingQuestion = await collection.findOne({ 
      question: updateFields.question,
      _id: { $ne: objectId }
    });
    
    if (existingQuestion) {
      throw new AppError('A question with this exact text already exists', 409);
    }
  }
  
  const result = await collection.updateOne(
    { _id: objectId },
    { $set: updateFields }
  );
  
  if (result.matchedCount === 0) {
    throw new AppError('Question not found', 404);
  }
  
  await Promise.all([
    invalidateCache(CACHE_KEYS.QUESTIONS),
    invalidateCache(CACHE_KEYS.CATEGORIES),
    invalidateCache(CACHE_KEYS.SUBJECTS)
  ]);
  
  return {
    success: true,
    message: 'Question updated successfully'
  };
}

/**
 * Delete question
 */
export async function deleteQuestion(questionId) {
  const objectId = validateAndConvertId(questionId);
  const collection = await getCollection('questions');
  
  const result = await collection.deleteOne({ _id: objectId });
  
  if (result.deletedCount === 0) {
    throw new AppError('Question not found', 404);
  }
  
  await Promise.all([
    invalidateCache(CACHE_KEYS.QUESTIONS),
    invalidateCache(CACHE_KEYS.CATEGORIES),
    invalidateCache(CACHE_KEYS.SUBJECTS)
  ]);
  
  return {
    success: true,
    message: 'Question deleted successfully'
  };
}
