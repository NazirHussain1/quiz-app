/**
 * Test Utilities
 * Helper functions for testing
 */

// Mock MongoDB client
export const mockMongoClient = {
  connect: jest.fn().mockResolvedValue(true),
  close: jest.fn().mockResolvedValue(true),
  db: jest.fn(() => mockDb),
}

// Mock MongoDB database
export const mockDb = {
  collection: jest.fn(() => mockCollection),
  admin: jest.fn(() => ({
    ping: jest.fn().mockResolvedValue(true),
  })),
}

// Mock MongoDB collection
export const mockCollection = {
  findOne: jest.fn(),
  find: jest.fn(() => ({
    toArray: jest.fn().mockResolvedValue([]),
    limit: jest.fn().mockReturnThis(),
    sort: jest.fn().mockReturnThis(),
  })),
  insertOne: jest.fn(),
  insertMany: jest.fn(),
  updateOne: jest.fn(),
  updateMany: jest.fn(),
  deleteOne: jest.fn(),
  deleteMany: jest.fn(),
  aggregate: jest.fn(() => ({
    toArray: jest.fn().mockResolvedValue([]),
  })),
  countDocuments: jest.fn().mockResolvedValue(0),
}

// Reset all mocks
export const resetMocks = () => {
  jest.clearAllMocks()
  mockCollection.findOne.mockReset()
  mockCollection.find.mockReturnValue({
    toArray: jest.fn().mockResolvedValue([]),
    limit: jest.fn().mockReturnThis(),
    sort: jest.fn().mockReturnThis(),
  })
  mockCollection.insertOne.mockReset()
  mockCollection.updateOne.mockReset()
  mockCollection.deleteOne.mockReset()
  mockCollection.aggregate.mockReturnValue({
    toArray: jest.fn().mockResolvedValue([]),
  })
}

// Mock user data
export const mockUser = {
  _id: '507f1f77bcf86cd799439011',
  id: '507f1f77bcf86cd799439011',
  email: 'test@example.com',
  userName: 'TestUser',
  password: '$2a$10$abcdefghijklmnopqrstuvwxyz', // bcrypt hash
  role: 'student',
  isVerified: true,
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
}

// Mock admin user
export const mockAdmin = {
  ...mockUser,
  id: '507f1f77bcf86cd799439012',
  email: 'admin@example.com',
  userName: 'AdminUser',
  role: 'admin',
}

// Mock question data
export const mockQuestion = {
  _id: '507f1f77bcf86cd799439013',
  category: 'Mathematics',
  subject: 'Algebra',
  difficulty: 'easy',
  question: 'What is 2 + 2?',
  options: ['3', '4', '5', '6'],
  correctAnswer: '4',
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
}

// Mock quiz result
export const mockResult = {
  _id: '507f1f77bcf86cd799439014',
  userId: mockUser.id,
  name: mockUser.userName,
  category: 'Mathematics',
  subject: 'Algebra',
  score: 8,
  totalQuestions: 10,
  difficulty: 'easy',
  timeTaken: 300,
  examMode: false,
  createdAt: new Date('2024-01-01'),
}

// Create mock request
export const createMockRequest = (options = {}) => {
  const {
    method = 'GET',
    url = 'http://localhost:3000/api/test',
    headers = {},
    body = null,
    cookies = {},
  } = options

  return {
    method,
    url,
    headers: new Map(Object.entries(headers)),
    cookies: new Map(Object.entries(cookies)),
    json: jest.fn().mockResolvedValue(body),
    text: jest.fn().mockResolvedValue(JSON.stringify(body)),
  }
}

// Create mock response
export const createMockResponse = () => {
  const response = {
    status: 200,
    headers: new Map(),
    cookies: new Map(),
    json: null,
  }

  return {
    ...response,
    status: jest.fn((code) => {
      response.status = code
      return response
    }),
    json: jest.fn((data) => {
      response.json = data
      return response
    }),
  }
}

// Wait for async operations
export const waitFor = (ms = 0) => new Promise((resolve) => setTimeout(resolve, ms))

// Mock fetch
export const mockFetch = (response) => {
  global.fetch = jest.fn(() =>
    Promise.resolve({
      ok: true,
      status: 200,
      json: () => Promise.resolve(response),
      text: () => Promise.resolve(JSON.stringify(response)),
    })
  )
}

// Mock localStorage
export const mockLocalStorage = () => {
  const store = {}
  return {
    getItem: jest.fn((key) => store[key] || null),
    setItem: jest.fn((key, value) => {
      store[key] = value.toString()
    }),
    removeItem: jest.fn((key) => {
      delete store[key]
    }),
    clear: jest.fn(() => {
      Object.keys(store).forEach((key) => delete store[key])
    }),
  }
}
