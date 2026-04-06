/**
 * Custom Quiz Service
 * Handles custom quiz business logic
 */

import { validate } from '@/app/lib/validation';
import { customQuizSchema, updateCustomQuizSchema } from '@/app/lib/validation/schemas';
import { AppError } from '@/app/lib/errorHandler';
import { getCollection, findById, validateAndConvertId } from './shared/database';
import { ObjectId } from 'mongodb';

/**
 * Get user's custom quizzes
 */
export async function getUserQuizzes(userId) {
  const collection = await getCollection('customQuizzes');
  
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
  const quiz = await findById('customQuizzes', quizId);
  
  return {
    success: true,
    quiz
  };
}

/**
 * Create custom quiz
 */
export async function createCustomQuiz(userId, userName, quizData) {
  const validated = validate(customQuizSchema, quizData);
  
  const collection = await getCollection('customQuizzes');
  
  const quiz = {
    userId,
    userName,
    ...validated,
    subject: validated.subject || 'Custom',
    difficulty: validated.difficulty || 'medium',
    description: validated.description || '',
    isPublic: validated.isPublic || false,
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
  const objectId = validateAndConvertId(quizId);
  const collection = await getCollection('customQuizzes');
  
  const result = await collection.deleteOne({ 
    _id: objectId,
    userId
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
  const validated = validate(updateCustomQuizSchema, updateData);
  
  const objectId = validateAndConvertId(quizId);
  const collection = await getCollection('customQuizzes');

  const quiz = await collection.findOne({
    _id: objectId,
    userId
  });

  if (!quiz) {
    throw new AppError('Quiz not found or unauthorized', 404);
  }

  const updates = { 
    ...validated,
    updatedAt: new Date() 
  };

  const result = await collection.updateOne(
    { _id: objectId, userId },
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
