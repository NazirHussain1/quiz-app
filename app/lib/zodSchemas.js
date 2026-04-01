import { z } from 'zod';

// Email validation schema
export const emailSchema = z.string()
  .email('Invalid email address')
  .min(5, 'Email must be at least 5 characters')
  .max(255, 'Email must not exceed 255 characters')
  .toLowerCase()
  .trim();

// Password validation schema
export const passwordSchema = z.string()
  .min(6, 'Password must be at least 6 characters')
  .max(128, 'Password must not exceed 128 characters')
  .regex(/^[a-zA-Z0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]*$/, 'Password contains invalid characters');

// Username validation schema
export const usernameSchema = z.string()
  .min(3, 'Username must be at least 3 characters')
  .max(30, 'Username must not exceed 30 characters')
  .regex(/^[a-zA-Z0-9_-]+$/, 'Username can only contain letters, numbers, hyphens, and underscores')
  .trim();

// MongoDB ObjectId validation
export const objectIdSchema = z.string()
  .regex(/^[0-9a-fA-F]{24}$/, 'Invalid ID format');

// Subject validation
export const subjectSchema = z.enum([
  'Mathematics',
  'English',
  'Science',
  'Computer',
  'General Knowledge',
  'Islamic Studies',
  'Pakistan Studies'
], {
  errorMap: () => ({ message: 'Invalid subject' })
});

// Difficulty validation
export const difficultySchema = z.enum(['easy', 'medium', 'hard'], {
  errorMap: () => ({ message: 'Invalid difficulty level' })
});

// Role validation
export const roleSchema = z.enum(['student', 'moderator', 'admin', 'superadmin'], {
  errorMap: () => ({ message: 'Invalid role' })
});

// Question text validation
export const questionTextSchema = z.string()
  .min(10, 'Question must be at least 10 characters')
  .max(1000, 'Question must not exceed 1000 characters')
  .trim();

// Options validation (array of 4 strings)
export const optionsSchema = z.array(z.string().min(1).max(500))
  .length(4, 'Must provide exactly 4 options');

// Correct answer index validation
export const correctAnswerSchema = z.number()
  .int()
  .min(0)
  .max(3, 'Correct answer must be between 0 and 3');

// Topic validation
export const topicSchema = z.string()
  .max(100, 'Topic must not exceed 100 characters')
  .trim()
  .optional();

// Auth schemas
export const loginSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
});

export const signupSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  userName: usernameSchema,
});

export const forgotPasswordSchema = z.object({
  email: emailSchema,
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Token is required'),
  password: passwordSchema,
});

export const verifyEmailSchema = z.object({
  token: z.string().min(1, 'Token is required'),
});

// Question schemas
export const createQuestionSchema = z.object({
  subject: subjectSchema,
  difficulty: difficultySchema,
  question: questionTextSchema,
  options: optionsSchema,
  correctAnswer: correctAnswerSchema,
  topic: topicSchema,
});

export const updateQuestionSchema = z.object({
  _id: objectIdSchema,
  subject: subjectSchema.optional(),
  difficulty: difficultySchema.optional(),
  question: questionTextSchema.optional(),
  options: optionsSchema.optional(),
  correctAnswer: correctAnswerSchema.optional(),
  topic: topicSchema,
});

// User management schemas
export const updateRoleSchema = z.object({
  userId: objectIdSchema,
  newRole: roleSchema,
});

export const deleteUserSchema = z.object({
  userId: objectIdSchema,
});

// Quiz result schema
export const quizResultSchema = z.object({
  name: usernameSchema,
  category: z.string().max(100).optional(),
  subject: subjectSchema,
  score: z.number().int().min(0),
  totalQuestions: z.number().int().min(1).max(100),
  difficulty: difficultySchema,
  timeTaken: z.number().int().min(0).optional(),
  examMode: z.boolean().optional(),
});

// Custom quiz schema
export const customQuizSchema = z.object({
  title: z.string().min(3).max(200).trim(),
  description: z.string().max(1000).trim().optional(),
  subject: subjectSchema,
  difficulty: difficultySchema,
  questions: z.array(z.object({
    question: questionTextSchema,
    options: optionsSchema,
    correctAnswer: correctAnswerSchema,
  })).min(1).max(50),
  isPublic: z.boolean().optional(),
});

/**
 * Validate data against a Zod schema
 * @param {z.ZodSchema} schema - Zod schema
 * @param {any} data - Data to validate
 * @returns {Object} { success: boolean, data?: any, errors?: array }
 */
export function validateWithZod(schema, data) {
  try {
    const validated = schema.parse(data);
    return {
      success: true,
      data: validated,
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        errors: error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message,
        })),
      };
    }
    return {
      success: false,
      errors: [{ field: 'unknown', message: 'Validation failed' }],
    };
  }
}

/**
 * Middleware to validate request body with Zod
 * @param {z.ZodSchema} schema - Zod schema
 * @returns {Function} Validation middleware
 */
export function validateRequest(schema) {
  return async (request) => {
    try {
      const body = await request.json();
      const result = validateWithZod(schema, body);
      
      if (!result.success) {
        return {
          valid: false,
          errors: result.errors,
        };
      }
      
      return {
        valid: true,
        data: result.data,
      };
    } catch (error) {
      return {
        valid: false,
        errors: [{ field: 'body', message: 'Invalid JSON' }],
      };
    }
  };
}
