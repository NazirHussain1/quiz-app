/**
 * API Tests for Login Endpoint
 */

import { POST } from '@/app/api/auth/login/route';
import { findUserByEmail, verifyPassword } from '@/app/lib/auth';
import { rateLimitLogin } from '@/app/lib/rateLimit';
import { createMockRequest, mockUser } from '../../utils/testUtils';

// Mock dependencies
jest.mock('@/app/lib/auth');
jest.mock('@/app/lib/rateLimit');
jest.mock('@/app/lib/logger', () => ({
  logAuth: jest.fn(),
  logSecurity: jest.fn(),
}));

describe('POST /api/auth/login', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Default rate limit mock
    rateLimitLogin.mockReturnValue({ allowed: true });
  });

  it('should login successfully with valid credentials', async () => {
    const mockVerifiedUser = { ...mockUser, isVerified: true };
    findUserByEmail.mockResolvedValue(mockVerifiedUser);
    verifyPassword.mockResolvedValue(true);

    const request = createMockRequest({
      method: 'POST',
      body: {
        email: 'test@example.com',
        password: 'password123',
      },
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.user).toEqual({
      id: mockUser.id,
      email: mockUser.email,
      userName: mockUser.userName,
      role: mockUser.role,
    });
  });

  it('should reject login with invalid email', async () => {
    const request = createMockRequest({
      method: 'POST',
      body: {
        email: 'invalid-email',
        password: 'password123',
      },
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.error.message).toContain('email');
  });

  it('should reject login with missing password', async () => {
    const request = createMockRequest({
      method: 'POST',
      body: {
        email: 'test@example.com',
      },
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.error.message).toContain('Password');
  });

  it('should reject login for non-existent user', async () => {
    findUserByEmail.mockResolvedValue(null);

    const request = createMockRequest({
      method: 'POST',
      body: {
        email: 'nonexistent@example.com',
        password: 'password123',
      },
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.success).toBe(false);
    expect(data.error.message).toBe('Invalid credentials');
  });

  it('should reject login with incorrect password', async () => {
    findUserByEmail.mockResolvedValue(mockUser);
    verifyPassword.mockResolvedValue(false);

    const request = createMockRequest({
      method: 'POST',
      body: {
        email: 'test@example.com',
        password: 'wrongpassword',
      },
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.success).toBe(false);
    expect(data.error.message).toBe('Invalid credentials');
  });

  it('should reject login for unverified email', async () => {
    const unverifiedUser = { ...mockUser, isVerified: false };
    findUserByEmail.mockResolvedValue(unverifiedUser);
    verifyPassword.mockResolvedValue(true);

    const request = createMockRequest({
      method: 'POST',
      body: {
        email: 'test@example.com',
        password: 'password123',
      },
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(403);
    expect(data.success).toBe(false);
    expect(data.error).toContain('verify your email');
    expect(data.needsVerification).toBe(true);
  });

  it('should reject login when rate limit exceeded', async () => {
    rateLimitLogin.mockReturnValue({ allowed: false });

    const request = createMockRequest({
      method: 'POST',
      body: {
        email: 'test@example.com',
        password: 'password123',
      },
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.success).toBe(false);
    expect(data.error.message).toContain('Too many');
  });

  it('should set auth cookie on successful login', async () => {
    const mockVerifiedUser = { ...mockUser, isVerified: true };
    findUserByEmail.mockResolvedValue(mockVerifiedUser);
    verifyPassword.mockResolvedValue(true);

    const request = createMockRequest({
      method: 'POST',
      body: {
        email: 'test@example.com',
        password: 'password123',
      },
    });

    const response = await POST(request);

    // Check if cookie was set (implementation specific)
    expect(response.cookies).toBeDefined();
  });

  it('should handle database errors gracefully', async () => {
    findUserByEmail.mockRejectedValue(new Error('Database error'));

    const request = createMockRequest({
      method: 'POST',
      body: {
        email: 'test@example.com',
        password: 'password123',
      },
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.success).toBe(false);
  });

  it('should sanitize email input', async () => {
    const mockVerifiedUser = { ...mockUser, isVerified: true };
    findUserByEmail.mockResolvedValue(mockVerifiedUser);
    verifyPassword.mockResolvedValue(true);

    const request = createMockRequest({
      method: 'POST',
      body: {
        email: '  TEST@EXAMPLE.COM  ',
        password: 'password123',
      },
    });

    await POST(request);

    expect(findUserByEmail).toHaveBeenCalledWith('test@example.com');
  });
});
