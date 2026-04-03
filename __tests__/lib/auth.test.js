/**
 * Unit Tests for Auth Functions
 */

import bcrypt from 'bcryptjs';
import { hashPassword, verifyPassword, createUser, findUserByEmail, findUserById } from '@/app/lib/auth';
import { mockMongoClient, mockDb, mockCollection, resetMocks, mockUser } from '../utils/testUtils';

// Mock dependencies
jest.mock('@/app/lib/mongodb', () => ({
  connectToDatabase: jest.fn(() => Promise.resolve({ db: mockDb, client: mockMongoClient })),
}));

jest.mock('@/app/lib/rbac', () => ({
  getDefaultRole: jest.fn(() => 'student'),
}));

describe('Auth Functions', () => {
  beforeEach(() => {
    resetMocks();
  });

  describe('hashPassword', () => {
    it('should hash a password successfully', async () => {
      const password = 'testPassword123';
      const hashed = await hashPassword(password);

      expect(hashed).toBeDefined();
      expect(hashed).not.toBe(password);
      expect(hashed.length).toBeGreaterThan(20);
    });

    it('should generate different hashes for same password', async () => {
      const password = 'testPassword123';
      const hash1 = await hashPassword(password);
      const hash2 = await hashPassword(password);

      expect(hash1).not.toBe(hash2);
    });

    it('should handle empty password', async () => {
      const password = '';
      const hashed = await hashPassword(password);

      expect(hashed).toBeDefined();
    });
  });

  describe('verifyPassword', () => {
    it('should verify correct password', async () => {
      const password = 'testPassword123';
      const hashed = await bcrypt.hash(password, 10);

      const isValid = await verifyPassword(password, hashed);

      expect(isValid).toBe(true);
    });

    it('should reject incorrect password', async () => {
      const password = 'testPassword123';
      const wrongPassword = 'wrongPassword';
      const hashed = await bcrypt.hash(password, 10);

      const isValid = await verifyPassword(wrongPassword, hashed);

      expect(isValid).toBe(false);
    });

    it('should handle empty password', async () => {
      const hashed = await bcrypt.hash('test', 10);

      const isValid = await verifyPassword('', hashed);

      expect(isValid).toBe(false);
    });
  });

  describe('createUser', () => {
    it('should create a new user successfully', async () => {
      mockCollection.findOne.mockResolvedValue(null);
      mockCollection.insertOne.mockResolvedValue({
        insertedId: { toString: () => '507f1f77bcf86cd799439011' },
      });

      const user = await createUser('test@example.com', 'password123', 'TestUser');

      expect(user).toEqual({
        id: '507f1f77bcf86cd799439011',
        email: 'test@example.com',
        userName: 'TestUser',
        role: 'student',
      });

      expect(mockCollection.findOne).toHaveBeenCalledWith({ email: 'test@example.com' });
      expect(mockCollection.insertOne).toHaveBeenCalled();
    });

    it('should throw error if user already exists', async () => {
      mockCollection.findOne.mockResolvedValue(mockUser);

      await expect(
        createUser('test@example.com', 'password123', 'TestUser')
      ).rejects.toThrow('User already exists');

      expect(mockCollection.insertOne).not.toHaveBeenCalled();
    });

    it('should hash password before storing', async () => {
      mockCollection.findOne.mockResolvedValue(null);
      mockCollection.insertOne.mockResolvedValue({
        insertedId: { toString: () => '507f1f77bcf86cd799439011' },
      });

      await createUser('test@example.com', 'password123', 'TestUser');

      const insertCall = mockCollection.insertOne.mock.calls[0][0];
      expect(insertCall.password).not.toBe('password123');
      expect(insertCall.password.length).toBeGreaterThan(20);
    });

    it('should set default role', async () => {
      mockCollection.findOne.mockResolvedValue(null);
      mockCollection.insertOne.mockResolvedValue({
        insertedId: { toString: () => '507f1f77bcf86cd799439011' },
      });

      const user = await createUser('test@example.com', 'password123', 'TestUser');

      expect(user.role).toBe('student');
    });

    it('should set timestamps', async () => {
      mockCollection.findOne.mockResolvedValue(null);
      mockCollection.insertOne.mockResolvedValue({
        insertedId: { toString: () => '507f1f77bcf86cd799439011' },
      });

      await createUser('test@example.com', 'password123', 'TestUser');

      const insertCall = mockCollection.insertOne.mock.calls[0][0];
      expect(insertCall.createdAt).toBeInstanceOf(Date);
      expect(insertCall.updatedAt).toBeInstanceOf(Date);
    });
  });

  describe('findUserByEmail', () => {
    it('should find user by email', async () => {
      mockCollection.findOne.mockResolvedValue({
        _id: { toString: () => '507f1f77bcf86cd799439011' },
        email: 'test@example.com',
        userName: 'TestUser',
        password: 'hashedPassword',
        role: 'student',
        isVerified: true,
      });

      const user = await findUserByEmail('test@example.com');

      expect(user).toEqual({
        id: '507f1f77bcf86cd799439011',
        email: 'test@example.com',
        userName: 'TestUser',
        password: 'hashedPassword',
        role: 'student',
        isVerified: true,
      });

      expect(mockCollection.findOne).toHaveBeenCalledWith({ email: 'test@example.com' });
    });

    it('should return null if user not found', async () => {
      mockCollection.findOne.mockResolvedValue(null);

      const user = await findUserByEmail('nonexistent@example.com');

      expect(user).toBeNull();
    });

    it('should use default role if role not set', async () => {
      mockCollection.findOne.mockResolvedValue({
        _id: { toString: () => '507f1f77bcf86cd799439011' },
        email: 'test@example.com',
        userName: 'TestUser',
        password: 'hashedPassword',
        isVerified: true,
      });

      const user = await findUserByEmail('test@example.com');

      expect(user.role).toBe('student');
    });
  });

  describe('findUserById', () => {
    it('should find user by ID', async () => {
      mockCollection.findOne.mockResolvedValue({
        _id: { toString: () => '507f1f77bcf86cd799439011' },
        email: 'test@example.com',
        userName: 'TestUser',
        role: 'student',
      });

      const user = await findUserById('507f1f77bcf86cd799439011');

      expect(user).toEqual({
        id: '507f1f77bcf86cd799439011',
        email: 'test@example.com',
        userName: 'TestUser',
        role: 'student',
      });
    });

    it('should return null if user not found', async () => {
      mockCollection.findOne.mockResolvedValue(null);

      const user = await findUserById('507f1f77bcf86cd799439011');

      expect(user).toBeNull();
    });

    it('should use default role if role not set', async () => {
      mockCollection.findOne.mockResolvedValue({
        _id: { toString: () => '507f1f77bcf86cd799439011' },
        email: 'test@example.com',
        userName: 'TestUser',
      });

      const user = await findUserById('507f1f77bcf86cd799439011');

      expect(user.role).toBe('student');
    });
  });
});
