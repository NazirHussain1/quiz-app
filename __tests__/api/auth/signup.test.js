/**
 * API Tests for Signup Endpoint
 */

import { POST } from '@/app/api/auth/signup/route';
import { createUser } from '@/app/lib/auth';
import { rateLimitLogin } from '@/app/lib/rateLimit';
import { sendVerificationEmail } from '@/app/lib/email';
import { createMockRequest } from '../../utils/testUtils';

// Mock dependencies
jest.mock('@/app/lib/auth');
jest.mock('@/app/lib/rateLimit');
jest.mock('@/app/lib/email');
jest.mock('@/app/lib/jwt', () => ({
  generateToken: jest.fn(() => 'mock-token-123'),
}));
jest.mock('@/app/lib/database/connection', () => ({
  connectToDatabase: jest.fn(() =>
    Promise.resolve({
      db: {
        collection: jest.fn(() => ({
          updateOne: jest.fn().mockResolvedValue({ modifiedCount: 1 }),
        })),
      },
    })
  ),
}));
jest.mock('@/app/lib/logger', () => ({
  logAuth: jest.fn(),
  logEmail: jest.fn(),
  logSecurity: jest.fn(),
}));

describe('POST /api/auth/signup', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Default mocks
    rateLimitLogin.mockReturnValue({ allowed: true });
    sendVerificationEmail.mockResolvedValue({ success: true });
  });

  it('should signup successfully with valid data', async () => {
    const mockUser = {
      id: '507f1f77bcf86cd799439011',
      email: 'newuser@example.com',
      userName: 'NewUser',
      role: 'student',
    };

    createUser.mockResolvedValue(mockUser);

    const request = createMockRequest({
      method: 'POST',
      body: {
        email: 'newuser@example.com',
        password: 'Password123!',
        userName: 'NewUser',
      },
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data.success).toBe(true);
    expect(data.message).toContain('Account created successfully');
    expect(data.user).toEqual({
      ...mockUser,
      isVerified: false,
    });
  });

  it('should reject signup with invalid email', async () => {
    const request = createMockRequest({
      method: 'POST',
      body: {
        email: 'invalid-email',
        password: 'Password123!',
        userName: 'TestUser',
      },
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.error.message).toContain('email');
  });

  it('should reject signup with weak password', async () => {
    const request = createMockRequest({
      method: 'POST',
      body: {
        email: 'test@example.com',
        password: '123',
        userName: 'TestUser',
      },
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.error.message).toContain('password');
  });

  it('should reject signup with invalid username', async () => {
    const request = createMockRequest({
      method: 'POST',
      body: {
        email: 'test@example.com',
        password: 'Password123!',
        userName: 'ab', // Too short
      },
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.error.message).toContain('username');
  });

  it('should reject signup for existing user', async () => {
    createUser.mockRejectedValue(new Error('User already exists'));

    const request = createMockRequest({
      method: 'POST',
      body: {
        email: 'existing@example.com',
        password: 'Password123!',
        userName: 'ExistingUser',
      },
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(409);
    expect(data.success).toBe(false);
    expect(data.error.message).toBe('User already exists');
  });

  it('should send verification email after signup', async () => {
    const mockUser = {
      id: '507f1f77bcf86cd799439011',
      email: 'newuser@example.com',
      userName: 'NewUser',
      role: 'student',
    };

    createUser.mockResolvedValue(mockUser);

    const request = createMockRequest({
      method: 'POST',
      body: {
        email: 'newuser@example.com',
        password: 'Password123!',
        userName: 'NewUser',
      },
    });

    await POST(request);

    expect(sendVerificationEmail).toHaveBeenCalledWith(
      'newuser@example.com',
      'NewUser',
      'mock-token-123'
    );
  });

  it('should not fail signup if email sending fails', async () => {
    const mockUser = {
      id: '507f1f77bcf86cd799439011',
      email: 'newuser@example.com',
      userName: 'NewUser',
      role: 'student',
    };

    createUser.mockResolvedValue(mockUser);
    sendVerificationEmail.mockResolvedValue({
      success: false,
      error: 'Email service down',
    });

    const request = createMockRequest({
      method: 'POST',
      body: {
        email: 'newuser@example.com',
        password: 'Password123!',
        userName: 'NewUser',
      },
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data.success).toBe(true);
    expect(data.verificationEmailSent).toBe(false);
    expect(data.message).toContain('could not send the verification email');
  });

  it('should reject signup when rate limit exceeded', async () => {
    rateLimitLogin.mockReturnValue({ allowed: false });

    const request = createMockRequest({
      method: 'POST',
      body: {
        email: 'test@example.com',
        password: 'Password123!',
        userName: 'TestUser',
      },
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(429);
    expect(data.success).toBe(false);
    expect(data.error.message).toContain('Too many');
  });

  it('should sanitize inputs', async () => {
    const mockUser = {
      id: '507f1f77bcf86cd799439011',
      email: 'test@example.com',
      userName: 'TestUser',
      role: 'student',
    };

    createUser.mockResolvedValue(mockUser);

    const request = createMockRequest({
      method: 'POST',
      body: {
        email: '  TEST@EXAMPLE.COM  ',
        password: 'Password123!',
        userName: '  TestUser  ',
      },
    });

    await POST(request);

    expect(createUser).toHaveBeenCalledWith(
      'test@example.com',
      'Password123!',
      'TestUser'
    );
  });

  it('should handle database errors gracefully', async () => {
    createUser.mockRejectedValue(new Error('Database connection failed'));

    const request = createMockRequest({
      method: 'POST',
      body: {
        email: 'test@example.com',
        password: 'Password123!',
        userName: 'TestUser',
      },
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.success).toBe(false);
  });
});
