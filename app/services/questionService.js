/**
 * Question Service
 * Handles question management business logic
 */

import { connectToDatabase } from '@/app/lib/database/connection';
import {
  validateSubject,
  validateDifficulty,
  validateCategory,
  validateQuestion,
  validateOptions,
  validateCorrectAnswer,
  sanitizeString
} from '@/app/lib/validation';
import { 
  getCacheOrFetch, 
  buildCacheKey, 
  CACHE_KEYS, 
  CACHE_TTL,
  invalidateCache 
} from '@/app/lib/cache';
import { logDB } from '@/app/lib/logger';
import { AppError } from '@/app/lib/errorHandler';

/**
 * Get questions with filters
 */
export async function getQuestions({ category, subject, difficulty, search, limit = 10 }) {
  // Sanitize inputs
  const sanitizedCategory = sanitizeString(category || '');
  const sanitizedSubject = sanitizeString(subject || '');
  const sanitizedDifficulty = sanitizeString(difficulty || '');
  const sanitizedSearch = sanitizeString(search || '');
  const safeLimit = Math.min(100, Math.max(1, parseInt(limit)));
  
  // Build cache key
  const cacheKey = buildCacheKey(CACHE_KEYS.QUESTIONS, {
    category: sanitizedCategory,
    subject: sanitizedSubject,
    difficulty: sanitizedDifficulty,
    search: sanitizedSearch,
    limit: safeLimit,
  });

  const startTime = Date.now();

  const questions = await getCacheOrFetch(
    cacheKey,
    async () => {
      const { db } = await connectToDatabase();
      const collection = db.collection('questions');
      
      const matchStage = {};
      
      if (sanitizedCategory) {
        matchStage.category = sanitizedCategory;
      }
      
      if (sanitizedSubject) {
        const subjectValidation = validateSubject(sanitizedSubject);
        if (subjectValidation.valid) {
          matchStage.subject = subjectValidation.value;
        }
      }
      
      if (sanitizedDifficulty) {
        const difficultyValidation = validateDifficulty(sanitizedDifficulty);
        if (difficultyValidation.valid) {
          matchStage.difficulty = difficultyValidation.value;
        }
      }
      
      if (sanitizedSearch) {
        matchStage.question = { $regex: sanitizedSearch, $options: 'i' };
      }
      
      const pipeline = [];
      
      if (Object.keys(matchStage).length > 0) {
        pipeline.push({ $match: matchStage });
      }
      
      pipeline.push({ $sample: { size: safeLimit } });
      
      return await collection.aggregate(pipeline).toArray();
    },
    CACHE_TTL.QUESTIONS
  );
  
  const duration = Date.now() - startTime;
  
  logDB('fetch', 'questions', true, duration, {
    count: questions.length,
    filters: { category: sanitizedCategory, subject: sanitizedSubject, difficulty: sanitizedDifficulty, search: sanitizedSearch, limit: safeLimit },
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
  // Validate category
  const categoryValidation = validateCategory(questionData.category);
  if (!categoryValidation.valid) {
    throw new AppError(categoryValidation.error, 400);
  }
  
  // Validate subject
  const subjectValidation = validateSubject(questionData.subject);
  if (!subjectValidation.valid) {
    throw new AppError(subjectValidation.error, 400);
  }
  
  // Validate difficulty
  const difficultyValidation = validateDifficulty(questionData.difficulty || 'medium');
  if (!difficultyValidation.valid) {
    throw new AppError(difficultyValidation.error, 400);
  }
  
  // Validate question
  const questionValidation = validateQuestion(questionData.question);
  if (!questionValidation.valid) {
    throw new AppError(questionValidation.error, 400);
  }
  
  // Validate options
  const optionsValidation = validateOptions(questionData.options);
  if (!optionsValidation.valid) {
    throw new AppError(optionsValidation.error, 400);
  }
  
  // Validate correct answer
  const correctAnswerValidation = validateCorrectAnswer(
    questionData.correctAnswer,
    optionsValidation.value
  );
  if (!correctAnswerValidation.valid) {
    throw new AppError(correctAnswerValidation.error, 400);
  }
  
  const { db } = await connectToDatabase();
  const collection = db.collection('questions');
  
  const result = await collection.insertOne({
    category: categoryValidation.value,
    subject: subjectValidation.value,
    topic: questionData.topic ? sanitizeString(questionData.topic) : '',
    difficulty: difficultyValidation.value,
    question: questionValidation.value,
    options: optionsValidation.value,
    correctAnswer: correctAnswerValidation.value,
    createdAt: new Date(),
    updatedAt: new Date()
  });
  
  // Invalidate questions cache
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
  const { db } = await connectToDatabase();
  const collection = db.collection('questions');
  
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
  const { db } = await connectToDatabase();
  const collection = db.collection('questions');
  
  const subjects = await collection.distinct('subject');
  
  return {
    success: true,
    subjects
  };
}

/**
 * Get questions for admin (with pagination)
 */
export async function getQuestionsForAdmin({ category, subject, difficulty, search, page = 1, limit = 20 }) {
  const sanitizedCategory = sanitizeString(category || '');
  const sanitizedSubject = sanitizeString(subject || '');
  const sanitizedDifficulty = sanitizeString(difficulty || '');
  const sanitizedSearch = sanitizeString(search || '');
  const safePage = Math.max(1, parseInt(page));
  const safeLimit = Math.min(100, Math.max(1, parseInt(limit)));
  
  const { db } = await connectToDatabase();
  const collection = db.collection('questions');
  
  const filter = {};
  
  if (sanitizedCategory && sanitizedCategory !== 'all') {
    filter.category = sanitizedCategory;
  }
  
  if (sanitizedSubject && sanitizedSubject !== 'all') {
    const subjectValidation = validateSubject(sanitizedSubject);
    if (subjectValidation.valid) {
      filter.subject = subjectValidation.value;
    }
  }
  
  if (sanitizedDifficulty && sanitizedDifficulty !== 'all') {
    const difficultyValidation = validateDifficulty(sanitizedDifficulty);
    if (difficultyValidation.valid) {
      filter.difficulty = difficultyValidation.value;
    }
  }
  
  if (sanitizedSearch) {
    filter.question = { $regex: sanitizedSearch, $options: 'i' };
  }
  
  const totalCount = await collection.countDocuments(filter);
  const totalPages = Math.ceil(totalCount / safeLimit);
  const skip = (safePage - 1) * safeLimit;
  
  const questions = await collection
    .find(filter)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(safeLimit)
    .toArray();
  
  return {
    success: true,
    count: questions.length,
    totalCount,
    totalPages,
    currentPage: safePage,
    questions
  };
}

/**
 * Update question
 */
export async function updateQuestion(questionId, updateData) {
  const { validateObjectId } = await import('@/app/lib/validation');
  const { ObjectId } = await import('mongodb');
  
  const idValidation = validateObjectId(questionId);
  if (!idValidation.valid) {
    throw new AppError(idValidation.error, 400);
  }
  
  const updateFields = { updatedAt: new Date() };
  
  if (updateData.category) {
    const categoryValidation = validateCategory(updateData.category);
    if (!categoryValidation.valid) {
      throw new AppError(categoryValidation.error, 400);
    }
    updateFields.category = categoryValidation.value;
  }
  
  if (updateData.subject) {
    const subjectValidation = validateSubject(updateData.subject);
    if (!subjectValidation.valid) {
      throw new AppError(subjectValidation.error, 400);
    }
    updateFields.subject = subjectValidation.value;
  }
  
  if (updateData.difficulty) {
    const difficultyValidation = validateDifficulty(updateData.difficulty);
    if (!difficultyValidation.valid) {
      throw new AppError(difficultyValidation.error, 400);
    }
    updateFields.difficulty = difficultyValidation.value;
  }
  
  if (updateData.question) {
    const questionValidation = validateQuestion(updateData.question);
    if (!questionValidation.valid) {
      throw new AppError(questionValidation.error, 400);
    }
    updateFields.question = questionValidation.value;
  }
  
  if (updateData.options) {
    const optionsValidation = validateOptions(updateData.options);
    if (!optionsValidation.valid) {
      throw new AppError(optionsValidation.error, 400);
    }
    updateFields.options = optionsValidation.value;
    
    if (updateData.correctAnswer) {
      const correctAnswerValidation = validateCorrectAnswer(
        updateData.correctAnswer,
        optionsValidation.value
      );
      if (!correctAnswerValidation.valid) {
        throw new AppError(correctAnswerValidation.error, 400);
      }
      updateFields.correctAnswer = correctAnswerValidation.value;
    }
  }
  
  if (updateData.topic) {
    updateFields.topic = sanitizeString(updateData.topic);
  }
  
  const { db } = await connectToDatabase();
  const collection = db.collection('questions');
  
  if (updateFields.question) {
    const existingQuestion = await collection.findOne({ 
      question: updateFields.question,
      _id: { $ne: new ObjectId(idValidation.value) }
    });
    
    if (existingQuestion) {
      throw new AppError('A question with this exact text already exists', 409);
    }
  }
  
  const result = await collection.updateOne(
    { _id: new ObjectId(idValidation.value) },
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
  const { validateObjectId } = await import('@/app/lib/validation');
  const { ObjectId } = await import('mongodb');
  
  const idValidation = validateObjectId(questionId);
  if (!idValidation.valid) {
    throw new AppError(idValidation.error, 400);
  }
  
  const { db } = await connectToDatabase();
  const collection = db.collection('questions');
  
  const result = await collection.deleteOne({ 
    _id: new ObjectId(idValidation.value) 
  });
  
  if (result.deletedCount === 0) {
    throw new AppError('Question not found', 404);
  }
  
  await invalidateCache(CACHE_KEYS.QUESTIONS);
  
  return {
    success: true,
    message: 'Question deleted successfully'
  };
}
