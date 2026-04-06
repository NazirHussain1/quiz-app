/**
 * Zod Validation Schemas
 * Centralized validation for the entire application
 */

import { z } from 'zod';

// ============================================================================
// Base Schemas
// ============================================================================

export const emailSchema = z.string()
  .email('Invalid email address')
  .min(5, 'Email must be at least 5 characters')
  .max(255, 'Email must not exceed 255 characters')
  .toLowerCase()
  .trim()
  .transform(val => val.replace(/[<>${}]/g, ''));

export const passwordSchema = z.string()
  .min(6, 'Password must be at least 6 characters')
  .max(128, 'Password must not exceed 128 characters');

export const usernameSchema = z.string()
  .min(3, 'Username must be at least 3 characters')
  .max(50, 'Username must not exceed 50 characters')
  .trim()
  .transform(val => val.replace(/[<>${}]/g, ''));

export const objectIdSchema = z.string()
  .regex(/^[0-9a-fA-F]{24}$/, 'Invalid ID format');

export const subjectSchema = z.enum([
  'Mathematics',
  'English',
  'Science',
  'Computer',
  'General Knowledge',
  'Islamic Studies',
  'Pakistan Studies',
  'General',
  'Custom'
], {
  errorMap: () => ({ message: 'Invalid subject' })
});

export const difficultySchema = z.enum(['easy', 'medium', 'hard'], {
  errorMap: () => ({ message: 'Invalid difficulty level' })
});

export const roleSchema = z.enum(['student', 'moderator', 'admin', 'superadmin'], {
  errorMap: () => ({ message: 'Invalid role' })
});

export const categorySchema = z.string()
  .min(1, 'Category is required')
  .max(100, 'Category must not exceed 100 characters')
  .trim()
  .transform(val => val.replace(/[<>${}]/g, ''));

// ============================================================================
// Question Schemas
// ============================================================================

export const questionTextSchema = z.string()
  .min(10, 'Question must be at least 10 characters')
  .max(500, 'Question must not exceed 500 characters')
  .trim()
  .transform(val => val.replace(/[<>${}]/g, ''));

export const optionsSchema = z.array(
  z.string()
    .min(1, 'Option cannot be empty')
    .max(200, 'Option must not exceed 200 characters')
    .trim()
    .transform(val => val.replace(/[<>${}]/g, ''))
).length(4, 'Must provide exactly 4 options');

export const correctAnswerSchema = z.string()
  .min(1, 'Correct answer is required')
  .max(200, 'Correct answer must not exceed 200 characters')
  .trim();

export const topicSchema = z.string()
  .max(100, 'Topic must not exceed 100 characters')
  .trim()
  .transform(val => val.replace(/[<>${}]/g, ''))
  .optional();

export const questionSchema = z.object({
  category: categorySchema,
  subject: subjectSchema,
  difficulty: difficultySchema.default('medium'),
  question: questionTextSchema,
  options: optionsSchema,
  correctAnswer: correctAnswerSchema,
  topic: topicSchema
}).refine(
  (data) => data.options.includes(data.correctAnswer),
  {
    message: 'Correct answer must match one of the options',
    path: ['correctAnswer']
  }
);

export const updateQuestionSchema = z.object({
  _id: objectIdSchema,
  category: categorySchema.optional(),
  subject: subjectSchema.optional(),
  difficulty: difficultySchema.optional(),
  question: questionTextSchema.optional(),
  options: optionsSchema.optional(),
  correctAnswer: correctAnswerSchema.optional(),
  topic: topicSchema
}).refine(
  (data) => {
    if (data.options && data.correctAnswer) {
      return data.options.includes(data.correctAnswer);
    }
    return true;
  },
  {
    message: 'Correct answer must match one of the options',
    path: ['correctAnswer']
  }
);

// ============================================================================
// Auth Schemas
// ============================================================================

export const loginSchema = z.object({
  email: emailSchema,
  password: passwordSchema
});

export const signupSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  userName: usernameSchema
});

export const forgotPasswordSchema = z.object({
  email: emailSchema
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Token is required'),
  password: passwordSchema
});

export const verifyEmailSchema = z.object({
  token: z.string().min(1, 'Token is required')
});

export const resendVerificationSchema = z.object({
  email: emailSchema
});

// ============================================================================
// User Management Schemas
// ============================================================================

export const updateRoleSchema = z.object({
  userId: objectIdSchema,
  newRole: roleSchema
});

export const makeAdminSchema = z.object({
  userId: objectIdSchema
});

export const deleteUserSchema = z.object({
  userId: objectIdSchema
});

// ============================================================================
// Quiz Result Schemas
// ============================================================================

export const scoreSchema = z.object({
  score: z.number().int().min(0),
  totalQuestions: z.number().int().min(1).max(100)
}).refine(
  (data) => data.score <= data.totalQuestions,
  {
    message: 'Score cannot exceed total questions',
    path: ['score']
  }
);

export const quizResultSchema = z.object({
  name: usernameSchema,
  category: categorySchema.optional(),
  subject: subjectSchema.optional(),
  score: z.number().int().min(0),
  totalQuestions: z.number().int().min(1).max(100),
  difficulty: difficultySchema.optional(),
  timeTaken: z.number().int().min(0).max(86400).optional(),
  examMode: z.boolean().optional()
}).refine(
  (data) => data.score <= data.totalQuestions,
  {
    message: 'Score cannot exceed total questions',
    path: ['score']
  }
);

// ============================================================================
// Custom Quiz Schemas
// ============================================================================

export const customQuizQuestionSchema = z.object({
  question: questionTextSchema,
  options: optionsSchema,
  correctAnswer: correctAnswerSchema
}).refine(
  (data) => data.options.includes(data.correctAnswer),
  {
    message: 'Correct answer must match one of the options',
    path: ['correctAnswer']
  }
);

export const customQuizSchema = z.object({
  title: z.string()
    .min(3, 'Title must be at least 3 characters')
    .max(200, 'Title must not exceed 200 characters')
    .trim()
    .transform(val => val.replace(/[<>${}]/g, '')),
  description: z.string()
    .max(1000, 'Description must not exceed 1000 characters')
    .trim()
    .transform(val => val.replace(/[<>${}]/g, ''))
    .optional(),
  subject: subjectSchema.optional(),
  difficulty: difficultySchema.optional(),
  questions: z.array(customQuizQuestionSchema)
    .min(1, 'Quiz must have at least one question')
    .max(100, 'Quiz cannot have more than 100 questions'),
  isPublic: z.boolean().optional()
});

export const updateCustomQuizSchema = z.object({
  title: z.string()
    .min(3, 'Title must be at least 3 characters')
    .max(200, 'Title must not exceed 200 characters')
    .trim()
    .transform(val => val.replace(/[<>${}]/g, ''))
    .optional(),
  description: z.string()
    .max(1000, 'Description must not exceed 1000 characters')
    .trim()
    .transform(val => val.replace(/[<>${}]/g, ''))
    .optional(),
  isPublic: z.boolean().optional()
});

// ============================================================================
// Query Parameter Schemas
// ============================================================================

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20)
});

export const questionQuerySchema = z.object({
  category: z.string().optional(),
  subject: z.string().optional(),
  difficulty: difficultySchema.optional(),
  search: z.string().max(200).optional(),
  limit: z.coerce.number().int().min(1).max(100).default(10)
});

export const leaderboardQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(50),
  category: z.string().optional(),
  subject: z.string().optional(),
  difficulty: difficultySchema.optional()
});
