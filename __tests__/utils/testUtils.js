/**
 * Test Utilities
 * Common utilities and helpers for testing
 */

import { ObjectId } from 'mongodb';

/**
 * Create a mock user object
 */
export function createMockUser(overrides = {}) {
  return {
    _id: new ObjectId(),
    id: new ObjectId().toString(),
    email: 'test@example.com',
    userName: 'TestUser',
    password: '$2a$10$hashedpassword',
    role: 'student',
    isVerified: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

/**
 * Create a mock question object
 */
export function createMockQuestion(overrides = {}) {
  return {
    _id: new ObjectId(),
    id: new ObjectId().toString(),
    category: 'Mathematics',
    subject: 'Algebra',
    difficulty: 'easy',
    question: 'What is 2 + 2?',
    options: ['3', '4', '5', '6'],
    correctAnswer: '4',
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

/**
 * Create a mock quiz result object
 */
export function createMockResult(overrides = {}) {
  return {
    _id: new ObjectId(),
    id: new ObjectId().toString(),
    userId: new ObjectId().toString(),
    name: 'TestUser',
    category: 'Mathematics',
    subject: 'Algebra',
    score: 8,
    totalQuestions: 10,
    difficulty: 'easy',
    timeTaken: 120,
    examMode: false,
    createdAt: new Date(),
    ...overrides,
  };
}

/**
 * Create a mock request object
 */
export function createMockRequest(options = {}) {
  const {
    method = 'GET',
    url = 'http://localhost:3000/api/test',
    headers = {},
    body = null,
    cookies = {},
  } = options;

  const headersMap = new Map(Object.entries(headers));

  return {
    method,
    url,
    headers: {
      get: (key) => headersMap.get(key.toLowerCase()),
      has: (key) => headersMap.has(key.toLowerCase()),
      entries: () => headersMap.entries(),
    },
    json: async () => body,
    cookies: {
      get: (key) => cookies[key],
      set: jest.fn(),
      delete: jest.fn(),
    },
  };
}

/**
 * Create a mock MongoDB collection
 */
export function createMockCollection() {
  return {
    find: jest.fn().mockReturnThis(),
    findOne: jest.fn(),
    insertOne: jest.fn(),
    insertMany: jest.fn(),
    updateOne: jest.fn(),
    updateMany: jest.fn(),
    deleteOne: jest.fn(),
    deleteMany: jest.fn(),
    aggregate: jest.fn().mockReturnThis(),
    toArray: jest.fn(),
    countDocuments: jest.fn(),
    createIndex: jest.fn(),
  };
}

/**
 * Create a mock MongoDB database
 */
export function createMockDb() {
  const collections = new Map();

  return {
    collection: jest.fn((name) => {
      if (!collections.has(name)) {
        collections.set(name, createMockCollection());
      }
      return collections.get(name);
    }),
    admin: jest.fn(() => ({
      ping: jest.fn().mockResolvedValue({}),
    })),
  };
}

/**
 * Wait for async operations
 */
export function waitFor(ms = 0) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Mock successful MongoDB connection
 */
export function mockMongoConnection() {
  const mockDb = createMockDb();
  
  jest.mock('@/app/lib/mongodb', () => ({
    connectToDatabase: jest.fn().mockResolvedValue({
      db: mockDb,
      client: {
        close: jest.fn(),
      },
    }),
  }));

  return mockDb;
}

/**
 * Clear all mocks
 */
export function clearAllMocks() {
  jest.clearAllMocks();
}

/**
 * Reset all mocks
 */
export function resetAllMocks() {
  jest.resetAllMocks();
}
