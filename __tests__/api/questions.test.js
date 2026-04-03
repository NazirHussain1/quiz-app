/**
 * API Tests for Questions Endpoint
 */

import { GET } from '@/app/api/questions/route';
import { rateLimitApi } from '@/app/lib/rateLimit';
import { createMockRequest, mockQuestion, mockDb, mockCollection, resetMocks } from '../utils/testUtils';

// Mock dependencies
jest.mock('@/app/lib/rateLimit');
jest.mock('@/app/lib/mongodb', () => ({
  connectToDatabase: jest.fn(() =>
    Promise.resolve({
      db: mockDb,
    })
  ),
}));
jest.mock('@/app/lib/cache', () => ({
  getCacheOrFetch: jest.fn((key, fetchFn) => fetchFn()),
  buildCacheKey: jest.fn((prefix, params) => `${prefix}:${JSON.stringify(params)}`),
  CACHE_KEYS: { QUESTIONS: 'questions' },
  CACHE_TTL: { QUESTIONS: 300 },
  invalidateCache: jest.fn(),
}));
jest.mock('@/app/lib/logger', () => ({
  logDB: jest.fn(),
  logSecurity: jest.fn(),
}));

describe('GET /api/questions', () => {
  beforeEach(() => {
    resetMocks();
    jest.clearAllMocks();
    
    // Default rate limit mock
    rateLimitApi.mockReturnValue({ allowed: true });
  });

  it('should fetch questions successfully', async () => {
    const mockQuestions = [mockQuestion, { ...mockQuestion, _id: '507f1f77bcf86cd799439014' }];
    
    mockCollection.aggregate.mockReturnValue({
      toArray: jest.fn().mockResolvedValue(mockQuestions),
    });

    const request = createMockRequest({
      method: 'GET',
      url: 'http://localhost:3000/api/questions?limit=10',
    });

    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.questions).toEqual(mockQuestions);
    expect(data.count).toBe(2);
  });

  it('should filter questions by category', async () => {
    const mockQuestions = [mockQuestion];
    
    mockCollection.aggregate.mockReturnValue({
      toArray: jest.fn().mockResolvedValue(mockQuestions),
    });

    const request = createMockRequest({
      method: 'GET',
      url: 'http://localhost:3000/api/questions?category=Mathematics&limit=10',
    });

    await GET(request);

    const aggregateCall = mockCollection.aggregate.mock.calls[0][0];
    expect(aggregateCall).toContainEqual({
      $match: expect.objectContaining({ category: 'Mathematics' }),
    });
  });

  it('should filter questions by subject', async () => {
    const mockQuestions = [mockQuestion];
    
    mockCollection.aggregate.mockReturnValue({
      toArray: jest.fn().mockResolvedValue(mockQuestions),
    });

    const request = createMockRequest({
      method: 'GET',
      url: 'http://localhost:3000/api/questions?subject=Algebra&limit=10',
    });

    await GET(request);

    const aggregateCall = mockCollection.aggregate.mock.calls[0][0];
    expect(aggregateCall).toContainEqual({
      $match: expect.objectContaining({ subject: 'Algebra' }),
    });
  });

  it('should filter questions by difficulty', async () => {
    const mockQuestions = [mockQuestion];
    
    mockCollection.aggregate.mockReturnValue({
      toArray: jest.fn().mockResolvedValue(mockQuestions),
    });

    const request = createMockRequest({
      method: 'GET',
      url: 'http://localhost:3000/api/questions?difficulty=easy&limit=10',
    });

    await GET(request);

    const aggregateCall = mockCollection.aggregate.mock.calls[0][0];
    expect(aggregateCall).toContainEqual({
      $match: expect.objectContaining({ difficulty: 'easy' }),
    });
  });

  it('should search questions by text', async () => {
    const mockQuestions = [mockQuestion];
    
    mockCollection.aggregate.mockReturnValue({
      toArray: jest.fn().mockResolvedValue(mockQuestions),
    });

    const request = createMockRequest({
      method: 'GET',
      url: 'http://localhost:3000/api/questions?search=algebra&limit=10',
    });

    await GET(request);

    const aggregateCall = mockCollection.aggregate.mock.calls[0][0];
    expect(aggregateCall).toContainEqual({
      $match: expect.objectContaining({
        question: { $regex: 'algebra', $options: 'i' },
      }),
    });
  });

  it('should respect limit parameter', async () => {
    const mockQuestions = [mockQuestion];
    
    mockCollection.aggregate.mockReturnValue({
      toArray: jest.fn().mockResolvedValue(mockQuestions),
    });

    const request = createMockRequest({
      method: 'GET',
      url: 'http://localhost:3000/api/questions?limit=5',
    });

    await GET(request);

    const aggregateCall = mockCollection.aggregate.mock.calls[0][0];
    expect(aggregateCall).toContainEqual({ $sample: { size: 5 } });
  });

  it('should enforce maximum limit of 100', async () => {
    const mockQuestions = [mockQuestion];
    
    mockCollection.aggregate.mockReturnValue({
      toArray: jest.fn().mockResolvedValue(mockQuestions),
    });

    const request = createMockRequest({
      method: 'GET',
      url: 'http://localhost:3000/api/questions?limit=200',
    });

    await GET(request);

    const aggregateCall = mockCollection.aggregate.mock.calls[0][0];
    expect(aggregateCall).toContainEqual({ $sample: { size: 100 } });
  });

  it('should enforce minimum limit of 1', async () => {
    const mockQuestions = [mockQuestion];
    
    mockCollection.aggregate.mockReturnValue({
      toArray: jest.fn().mockResolvedValue(mockQuestions),
    });

    const request = createMockRequest({
      method: 'GET',
      url: 'http://localhost:3000/api/questions?limit=0',
    });

    await GET(request);

    const aggregateCall = mockCollection.aggregate.mock.calls[0][0];
    expect(aggregateCall).toContainEqual({ $sample: { size: 1 } });
  });

  it('should use default limit of 10', async () => {
    const mockQuestions = [mockQuestion];
    
    mockCollection.aggregate.mockReturnValue({
      toArray: jest.fn().mockResolvedValue(mockQuestions),
    });

    const request = createMockRequest({
      method: 'GET',
      url: 'http://localhost:3000/api/questions',
    });

    await GET(request);

    const aggregateCall = mockCollection.aggregate.mock.calls[0][0];
    expect(aggregateCall).toContainEqual({ $sample: { size: 10 } });
  });

  it('should reject when rate limit exceeded', async () => {
    rateLimitApi.mockReturnValue({ allowed: false });

    const request = createMockRequest({
      method: 'GET',
      url: 'http://localhost:3000/api/questions',
    });

    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(429);
    expect(data.success).toBe(false);
    expect(data.error.message).toContain('Too many');
  });

  it('should return empty array when no questions found', async () => {
    mockCollection.aggregate.mockReturnValue({
      toArray: jest.fn().mockResolvedValue([]),
    });

    const request = createMockRequest({
      method: 'GET',
      url: 'http://localhost:3000/api/questions',
    });

    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.questions).toEqual([]);
    expect(data.count).toBe(0);
  });

  it('should sanitize search input', async () => {
    const mockQuestions = [mockQuestion];
    
    mockCollection.aggregate.mockReturnValue({
      toArray: jest.fn().mockResolvedValue(mockQuestions),
    });

    const request = createMockRequest({
      method: 'GET',
      url: 'http://localhost:3000/api/questions?search=<script>alert("xss")</script>',
    });

    await GET(request);

    const aggregateCall = mockCollection.aggregate.mock.calls[0][0];
    const matchStage = aggregateCall.find((stage) => stage.$match);
    
    // Should not contain script tags
    expect(matchStage.$match.question.$regex).not.toContain('<script>');
  });

  it('should handle database errors gracefully', async () => {
    mockCollection.aggregate.mockReturnValue({
      toArray: jest.fn().mockRejectedValue(new Error('Database error')),
    });

    const request = createMockRequest({
      method: 'GET',
      url: 'http://localhost:3000/api/questions',
    });

    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.success).toBe(false);
  });

  it('should set cache headers', async () => {
    const mockQuestions = [mockQuestion];
    
    mockCollection.aggregate.mockReturnValue({
      toArray: jest.fn().mockResolvedValue(mockQuestions),
    });

    const request = createMockRequest({
      method: 'GET',
      url: 'http://localhost:3000/api/questions',
    });

    const response = await GET(request);

    expect(response.headers.get('Cache-Control')).toContain('public');
  });
});
