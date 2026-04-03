/**
 * Database Schemas and Indexes
 * Defines validation rules and indexes for all collections
 */

export const COLLECTIONS = {
  USERS: 'users',
  QUESTIONS: 'questions',
  RESULTS: 'results',
  CUSTOM_QUIZZES: 'customQuizzes',
  AUDIT_LOGS: 'auditLogs',
};

/**
 * User Collection Schema
 */
export const userSchema = {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['email', 'password', 'userName', 'role', 'isVerified', 'createdAt'],
      properties: {
        email: {
          bsonType: 'string',
          pattern: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$',
          description: 'must be a valid email address',
        },
        password: {
          bsonType: 'string',
          minLength: 60,
          maxLength: 60,
          description: 'must be a bcrypt hashed password',
        },
        userName: {
          bsonType: 'string',
          minLength: 3,
          maxLength: 30,
          description: 'must be between 3 and 30 characters',
        },
        role: {
          enum: ['superadmin', 'admin', 'moderator', 'student'],
          description: 'must be a valid role',
        },
        isVerified: {
          bsonType: 'bool',
          description: 'email verification status',
        },
        verificationToken: {
          bsonType: ['string', 'null'],
        },
        verificationTokenExpiry: {
          bsonType: ['date', 'null'],
        },
        resetPasswordToken: {
          bsonType: ['string', 'null'],
        },
        resetPasswordExpiry: {
          bsonType: ['date', 'null'],
        },
        createdAt: {
          bsonType: 'date',
        },
        updatedAt: {
          bsonType: 'date',
        },
      },
    },
  },
  validationLevel: 'strict',
  validationAction: 'error',
};

export const userIndexes = [
  { key: { email: 1 }, unique: true, name: 'email_unique' },
  { key: { userName: 1 }, name: 'userName_index' },
  { key: { role: 1 }, name: 'role_index' },
  { key: { isVerified: 1 }, name: 'isVerified_index' },
  { key: { verificationToken: 1 }, sparse: true, name: 'verificationToken_index' },
  { key: { resetPasswordToken: 1 }, sparse: true, name: 'resetPasswordToken_index' },
  { key: { createdAt: -1 }, name: 'createdAt_desc_index' },
  { 
    key: { email: 'text', userName: 'text' }, 
    name: 'user_text_search',
    weights: { email: 2, userName: 1 },
  },
];

/**
 * Question Collection Schema
 */
export const questionSchema = {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['category', 'subject', 'difficulty', 'question', 'options', 'correctAnswer', 'createdAt'],
      properties: {
        category: {
          bsonType: 'string',
          description: 'question category',
        },
        subject: {
          enum: ['Mathematics', 'English', 'Science', 'Computer', 'General Knowledge', 'Islamic Studies', 'Pakistan Studies'],
          description: 'must be a valid subject',
        },
        topic: {
          bsonType: 'string',
        },
        difficulty: {
          enum: ['easy', 'medium', 'hard'],
          description: 'must be easy, medium, or hard',
        },
        question: {
          bsonType: 'string',
          minLength: 10,
          maxLength: 1000,
          description: 'question text',
        },
        options: {
          bsonType: 'array',
          minItems: 4,
          maxItems: 4,
          items: {
            bsonType: 'string',
            minLength: 1,
            maxLength: 500,
          },
          description: 'must have exactly 4 options',
        },
        correctAnswer: {
          bsonType: 'string',
          description: 'correct answer text',
        },
        explanation: {
          bsonType: 'string',
          maxLength: 1000,
        },
        tags: {
          bsonType: 'array',
          items: {
            bsonType: 'string',
          },
        },
        createdAt: {
          bsonType: 'date',
        },
        updatedAt: {
          bsonType: 'date',
        },
        createdBy: {
          bsonType: 'objectId',
        },
      },
    },
  },
  validationLevel: 'strict',
  validationAction: 'error',
};

export const questionIndexes = [
  { key: { category: 1 }, name: 'category_index' },
  { key: { subject: 1 }, name: 'subject_index' },
  { key: { difficulty: 1 }, name: 'difficulty_index' },
  { key: { category: 1, subject: 1, difficulty: 1 }, name: 'category_subject_difficulty_compound' },
  { key: { question: 1 }, unique: true, name: 'question_unique' },
  { key: { createdAt: -1 }, name: 'createdAt_desc_index' },
  { key: { tags: 1 }, name: 'tags_index' },
  { 
    key: { question: 'text', explanation: 'text' }, 
    name: 'question_text_search',
    weights: { question: 3, explanation: 1 },
  },
];

/**
 * Result Collection Schema
 */
export const resultSchema = {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['userId', 'name', 'category', 'subject', 'score', 'totalQuestions', 'difficulty', 'timeTaken', 'createdAt'],
      properties: {
        userId: {
          bsonType: 'string',
          description: 'user ID',
        },
        name: {
          bsonType: 'string',
          description: 'user name',
        },
        category: {
          bsonType: 'string',
        },
        subject: {
          bsonType: 'string',
        },
        score: {
          bsonType: 'int',
          minimum: 0,
          description: 'score must be non-negative',
        },
        totalQuestions: {
          bsonType: 'int',
          minimum: 1,
          description: 'total questions must be positive',
        },
        difficulty: {
          enum: ['easy', 'medium', 'hard'],
        },
        timeTaken: {
          bsonType: 'int',
          minimum: 0,
          description: 'time in seconds',
        },
        examMode: {
          bsonType: 'bool',
        },
        customQuizId: {
          bsonType: ['string', 'null'],
        },
        answers: {
          bsonType: 'array',
          items: {
            bsonType: 'object',
            properties: {
              questionId: { bsonType: 'objectId' },
              userAnswer: { bsonType: 'string' },
              correctAnswer: { bsonType: 'string' },
              isCorrect: { bsonType: 'bool' },
              timeSpent: { bsonType: 'int' },
            },
          },
        },
        createdAt: {
          bsonType: 'date',
        },
      },
    },
  },
  validationLevel: 'strict',
  validationAction: 'error',
};

export const resultIndexes = [
  { key: { userId: 1 }, name: 'userId_index' },
  { key: { category: 1 }, name: 'category_index' },
  { key: { subject: 1 }, name: 'subject_index' },
  { key: { difficulty: 1 }, name: 'difficulty_index' },
  { key: { userId: 1, createdAt: -1 }, name: 'userId_createdAt_compound' },
  { key: { userId: 1, subject: 1 }, name: 'userId_subject_compound' },
  { key: { score: -1 }, name: 'score_desc_index' },
  { key: { createdAt: -1 }, name: 'createdAt_desc_index' },
  { key: { customQuizId: 1 }, sparse: true, name: 'customQuizId_index' },
  // TTL index: auto-delete results older than 1 year
  { key: { createdAt: 1 }, expireAfterSeconds: 31536000, name: 'result_ttl' },
];

/**
 * Custom Quiz Collection Schema
 */
export const customQuizSchema = {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['userId', 'userName', 'title', 'subject', 'difficulty', 'questions', 'isPublic', 'createdAt'],
      properties: {
        userId: {
          bsonType: 'string',
        },
        userName: {
          bsonType: 'string',
        },
        title: {
          bsonType: 'string',
          minLength: 3,
          maxLength: 100,
        },
        description: {
          bsonType: 'string',
          maxLength: 500,
        },
        subject: {
          bsonType: 'string',
        },
        difficulty: {
          enum: ['easy', 'medium', 'hard'],
        },
        questions: {
          bsonType: 'array',
          minItems: 1,
          maxItems: 50,
          items: {
            bsonType: 'object',
            required: ['question', 'options', 'correctAnswer'],
            properties: {
              question: { bsonType: 'string' },
              options: { 
                bsonType: 'array',
                minItems: 4,
                maxItems: 4,
              },
              correctAnswer: { bsonType: 'string' },
            },
          },
        },
        isPublic: {
          bsonType: 'bool',
        },
        tags: {
          bsonType: 'array',
          items: { bsonType: 'string' },
        },
        createdAt: {
          bsonType: 'date',
        },
        updatedAt: {
          bsonType: 'date',
        },
      },
    },
  },
  validationLevel: 'strict',
  validationAction: 'error',
};

export const customQuizIndexes = [
  { key: { userId: 1 }, name: 'userId_index' },
  { key: { subject: 1 }, name: 'subject_index' },
  { key: { difficulty: 1 }, name: 'difficulty_index' },
  { key: { isPublic: 1 }, name: 'isPublic_index' },
  { key: { userId: 1, createdAt: -1 }, name: 'userId_createdAt_compound' },
  { key: { tags: 1 }, name: 'tags_index' },
  { key: { createdAt: -1 }, name: 'createdAt_desc_index' },
  { 
    key: { title: 'text', description: 'text' }, 
    name: 'customQuiz_text_search',
  },
];

/**
 * Audit Log Collection Schema
 */
export const auditLogSchema = {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['userId', 'action', 'resource', 'timestamp'],
      properties: {
        userId: {
          bsonType: 'string',
        },
        userName: {
          bsonType: 'string',
        },
        action: {
          enum: ['create', 'read', 'update', 'delete', 'login', 'logout', 'role_change'],
        },
        resource: {
          bsonType: 'string',
        },
        resourceId: {
          bsonType: ['string', 'null'],
        },
        changes: {
          bsonType: 'object',
        },
        ipAddress: {
          bsonType: 'string',
        },
        userAgent: {
          bsonType: 'string',
        },
        timestamp: {
          bsonType: 'date',
        },
      },
    },
  },
  validationLevel: 'strict',
  validationAction: 'error',
};

export const auditLogIndexes = [
  { key: { userId: 1 }, name: 'userId_index' },
  { key: { action: 1 }, name: 'action_index' },
  { key: { resource: 1 }, name: 'resource_index' },
  { key: { timestamp: -1 }, name: 'timestamp_desc_index' },
  { key: { userId: 1, timestamp: -1 }, name: 'userId_timestamp_compound' },
  // TTL index: auto-delete logs older than 90 days
  { key: { timestamp: 1 }, expireAfterSeconds: 7776000, name: 'auditLog_ttl' },
];

/**
 * Get all schemas
 */
export function getAllSchemas() {
  return {
    [COLLECTIONS.USERS]: userSchema,
    [COLLECTIONS.QUESTIONS]: questionSchema,
    [COLLECTIONS.RESULTS]: resultSchema,
    [COLLECTIONS.CUSTOM_QUIZZES]: customQuizSchema,
    [COLLECTIONS.AUDIT_LOGS]: auditLogSchema,
  };
}

/**
 * Get all indexes
 */
export function getAllIndexes() {
  return {
    [COLLECTIONS.USERS]: userIndexes,
    [COLLECTIONS.QUESTIONS]: questionIndexes,
    [COLLECTIONS.RESULTS]: resultIndexes,
    [COLLECTIONS.CUSTOM_QUIZZES]: customQuizIndexes,
    [COLLECTIONS.AUDIT_LOGS]: auditLogIndexes,
  };
}
