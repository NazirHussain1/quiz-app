/**
 * Question Service
 * Handles question management business logic
 */

import { validate, sanitizeString } from '@/app/lib/validation';
import { 
  questionSchema,
  updateQuestionSchema,
  questionQuerySchema,
  subjectSchema,
  difficultySchema
} from '@/app/lib/validation/schemas';
import { 
  getCacheOrFetch, 
  buildCacheKey, 
  CACHE_KEYS, 
  CACHE_TTL,
  invalidateCache 
} from '@/app/lib/cache';
import { logDB } from '@/app/lib/logger';
import { AppError } from '@/app/lib/errorHandler';
import { getCollection, validateAndConvertId, paginateQuery } from './shared/database';
import { ObjectId } from 'mongodb';

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
    try {
      matchStage.subject = validate(subjectSchema, subject);
    } catch {
      // Skip invalid subject
    }
  }
  
  if (difficulty) {
    try {
      matchStage.difficulty = validate(difficultySchema, difficulty);
    } catch {
      // Skip invalid difficulty
    }
  }
  
  if (search) {
    matchStage.question = { $regex: search, $options: 'i' };
  }
  
  return matchStage;
}

/**
 * Get questions with filters
 */
export async function getQuestions(params) {
  const validated = validate(questionQuerySchema, params);
  
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

  const questions = await getCacheOrFetch(
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
  
  const duration = Date.now() - startTime;
  
  logDB('fetch', 'questions', true, duration, {
    count: questions.length,
    filters: { category: sanitizedCategory, subject: sanitizedSubject, difficulty: sanitizedDifficulty, search: sanitizedSearch, limit: validated.limit },
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
  
  await invalidateCache(CACHE_KEYS.QUESTIONS);
  
  return {
    success: true,
    questionId: result.insertedId.toString()
  };
}

/**
 * Get question categories
 */
export async function getCategories() {
  const collection = await getCollection('questions');
  const categories = await collection.distinct('category');
  
  return {
    success: true,
    categories
  };
}

/**
 * Get question subjects
 */
export async function getSubjects() {
  const collection = await getCollection('questions');
  const subjects = await collection.distinct('subject');
  
  return {
    success: true,
    subjects
  };
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
    try {
      filter.subject = validate(subjectSchema, sanitizedSubject);
    } catch {
      // Skip invalid subject
    }
  }
  
  if (sanitizedDifficulty && sanitizedDifficulty !== 'all') {
    try {
      filter.difficulty = validate(difficultySchema, sanitizedDifficulty);
    } catch {
      // Skip invalid difficulty
    }
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
  
  await invalidateCache(CACHE_KEYS.QUESTIONS);
  
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
  
  await invalidateCache(CACHE_KEYS.QUESTIONS);
  
  return {
    success: true,
    message: 'Question deleted successfully'
  };
}
