/**
 * Shared Validation Utilities
 * Zod-based validation helpers for services
 */

import { validate } from '@/app/lib/validation';
import {
  questionSchema,
  customQuizQuestionSchema,
  subjectSchema,
  difficultySchema
} from '@/app/lib/validation/schemas';

/**
 * Validate and build question data
 */
export function validateQuestionData(questionData) {
  return validate(questionSchema, questionData);
}

/**
 * Validate array of questions
 */
export function validateQuestionsArray(questions) {
  if (!Array.isArray(questions)) {
    throw new Error('Questions must be an array');
  }
  
  if (questions.length === 0) {
    throw new Error('Must have at least one question');
  }
  
  if (questions.length > 100) {
    throw new Error('Cannot have more than 100 questions');
  }
  
  return questions.map((q, i) => {
    try {
      return validate(customQuizQuestionSchema, q);
    } catch (error) {
      throw new Error(`Question ${i + 1}: ${error.message}`);
    }
  });
}

/**
 * Validate and sanitize optional subject
 */
export function validateOptionalSubject(subject) {
  if (!subject || subject === 'Custom' || subject === 'General') {
    return subject || 'Custom';
  }
  
  try {
    return validate(subjectSchema, subject);
  } catch {
    return 'Custom';
  }
}

/**
 * Validate and sanitize optional difficulty
 */
export function validateOptionalDifficulty(difficulty) {
  if (!difficulty) return 'medium';
  
  try {
    return validate(difficultySchema, difficulty);
  } catch {
    return 'medium';
  }
}
