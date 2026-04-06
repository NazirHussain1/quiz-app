/**
 * Custom Quiz Service
 * Handles custom quiz business logic
 */

import { connectToDatabase } from '@/app/lib/database/connection';
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
import { AppError } from '@/app/lib/errorHandler';

/**
 * Get user's custom quizzes
 */
export async function getUserQuizzes(userId) {
  const { db } = await connectToDatabase();
  const collection = db.collection('customQuizzes');
  
  const quizzes = await collection
    .find({ userId })
    .sort({ createdAt: -1 })
    .toArray();
  
  return {
    success: true,
    count: quizzes.length,
    quizzes
  };
}

/**
 * Get custom quiz by ID
 */
export async function getQuizById(quizId) {
  const idValidation = validateObjectId(quizId);
  if (!idValidation.valid) {
    throw new AppError(idValidation.error, 400);
  }

  const { db } = await connectToDatabase();
  const collection = db.collection('customQuizzes');
  
  const quiz = await collection.findOne({
    _id: new ObjectId(idValidation.value)
  });
  
  if (!quiz) {
    throw new AppError('Quiz not found', 404);
  }
  
  return {
    success: true,
    quiz
  };
}

/**
 * Create custom quiz
 */
export async function createCustomQuiz(userId, userName, quizData) {
  // Validate title
  if (!quizData.title || typeof quizData.title !== 'string') {
    throw new AppError('Title is required', 400);
  }
  
  const title = sanitizeString(quizData.title);
  if (!title || title.length < 3) {
    throw new AppError('Title must be at least 3 characters', 400);
  }
  
  if (title.length > 200) {
    throw new AppError('Title must not exceed 200 characters', 400);
  }
  
  // Validate questions array
  if (!quizData.questions || !Array.isArray(quizData.questions)) {
    throw new AppError('Questions must be an array', 400);
  }
  
  if (quizData.questions.length === 0) {
    throw new AppError('Quiz must have at least one question', 400);
  }
  
  if (quizData.questions.length > 100) {
    throw new AppError('Quiz cannot have more than 100 questions', 400);
  }
  
  // Validate subject if provided
  let subject = 'Custom';
  if (quizData.subject && quizData.subject !== 'Custom') {
    const subjectValidation = validateSubject(quizData.subject);
    if (subjectValidation.valid) {
      subject = subjectValidation.value;
    } else {
      subject = sanitizeString(quizData.subject);
    }
  }
  
  // Validate difficulty
  let difficulty = 'medium';
  if (quizData.difficulty) {
    const difficultyValidation = validateDifficulty(quizData.difficulty);
    if (difficultyValidation.valid) {
      difficulty = difficultyValidation.value;
    }
  }
  
  // Validate each question
  const validatedQuestions = [];
  for (let i = 0; i < quizData.questions.length; i++) {
    const q = quizData.questions[i];
    
    const questionValidation = validateQuestion(q.question);
    if (!questionValidation.valid) {
      throw new AppError(`Question ${i + 1}: ${questionValidation.error}`, 400);
    }
    
    const optionsValidation = validateOptions(q.options);
    if (!optionsValidation.valid) {
      throw new AppError(`Question ${i + 1}: ${optionsValidation.error}`, 400);
    }
    
    const correctAnswerValidation = validateCorrectAnswer(
      q.correctAnswer,
      optionsValidation.value
    );
    if (!correctAnswerValidation.valid) {
      throw new AppError(`Question ${i + 1}: ${correctAnswerValidation.error}`, 400);
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
    userId,
    userName,
    title,
    description: quizData.description ? sanitizeString(quizData.description) : '',
    subject,
    difficulty,
    questions: validatedQuestions,
    isPublic: quizData.isPublic === true,
    createdAt: new Date(),
    updatedAt: new Date()
  };
  
  const result = await collection.insertOne(quiz);
  
  return {
    success: true,
    quizId: result.insertedId.toString(),
    message: 'Custom quiz created successfully'
  };
}

/**
 * Delete custom quiz
 */
export async function deleteCustomQuiz(quizId, userId) {
  const idValidation = validateObjectId(quizId);
  if (!idValidation.valid) {
    throw new AppError(idValidation.error, 400);
  }
  
  const { db } = await connectToDatabase();
  const collection = db.collection('customQuizzes');
  
  const result = await collection.deleteOne({ 
    _id: new ObjectId(idValidation.value),
    userId // Ensure user can only delete their own quizzes
  });
  
  if (result.deletedCount === 0) {
    throw new AppError('Quiz not found or unauthorized', 404);
  }
  
  return {
    success: true,
    message: 'Quiz deleted successfully'
  };
}

/**
 * Update custom quiz
 */
export async function updateCustomQuiz(quizId, userId, updateData) {
  const idValidation = validateObjectId(quizId);
  if (!idValidation.valid) {
    throw new AppError(idValidation.error, 400);
  }

  const { db } = await connectToDatabase();
  const collection = db.collection('customQuizzes');

  // Check ownership
  const quiz = await collection.findOne({
    _id: new ObjectId(idValidation.value),
    userId
  });

  if (!quiz) {
    throw new AppError('Quiz not found or unauthorized', 404);
  }

  const updates = { updatedAt: new Date() };

  if (updateData.title) {
    const title = sanitizeString(updateData.title);
    if (title.length < 3 || title.length > 200) {
      throw new AppError('Title must be between 3 and 200 characters', 400);
    }
    updates.title = title;
  }

  if (updateData.description !== undefined) {
    updates.description = sanitizeString(updateData.description);
  }

  if (updateData.isPublic !== undefined) {
    updates.isPublic = updateData.isPublic === true;
  }

  const result = await collection.updateOne(
    { _id: new ObjectId(idValidation.value), userId },
    { $set: updates }
  );

  if (result.matchedCount === 0) {
    throw new AppError('Quiz not found or unauthorized', 404);
  }

  return {
    success: true,
    message: 'Quiz updated successfully'
  };
}
