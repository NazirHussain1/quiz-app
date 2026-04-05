/**
 * Unit Tests for Authentication Functions
 */

import bcrypt from 'bcryptjs';
import { ObjectId } from 'mongodb';
import {
  hashPassword,
  verifyPassword,
  createUser,
  findUserByEmail,
  findUserById,
} from '@/app/lib/auth';
import { createMockUser, createMockDb } from '../utils/testUtils';

// Mock dependencies
jest.mock('@/app/lib/database/connection');
jest.mock('@/app/lib/rbac', () => ({
  getDefaultRole: jest.fn(() => 'student'),
}));

const { connectToDatabase } = require('@/app/lib/database/connection');

describe('Auth Functions', () => {
  let mockDb;

  beforeEach(() => {
    jest.clearAllMocks();
    mockDb = createMockDb();
    connectToDatabase.mockResolvedValue({ db: mockDb });
  });

  describe('hashPassword', () => {
    it('should hash a password successfully', async () => {
      const password = 'testPassword123';
      const hashed = await hashPassword(password);

      expect(hashed).toBeDefined();
      expect(hashed).not.toBe(password);
      expect(hashed.length).toBeGreaterThan(0);
    });

    it('should generate different hashes for same password', async () => {
      const password = 'testPassword123';
      const hash1 = await hashPassword(password);
      const hash2 = await hashPassword(password);

      expect(hash1).not.toBe(hash2);
    });

    it('should create bcrypt hash', async () => {
      const password = 'testPassword123';
      const hashed = await hashPassword(password);

      // Bcrypt hashes start with $2a$ or $2b$
      expect(hashed).toMatch(/^\$2[ab]\$/);
    });
  });

  describe('verifyPassword', () => {
    it('should verify correct password', async () => {
      const password = 'testPassword123';
      const hashed = await hashPassword(password);
      const isValid = await verifyPassword(password, hashed);

      expect(isValid).toBe(true);
    });

    it('should reject incorrect password', async () => {
      const password = 'testPassword123';
      const wrongPassword = 'wrongPassword456';
      const hashed = await hashPassword(password);
      const isValid = await verifyPassword(wrongPassword, hashed);

      expect(isValid).toBe(false);
    });

    it('should handle empty password', async () => {
      const hashed = await hashPassword('test');
      const isValid = await verifyPassword('', hashed);

      expect(isValid).toBe(false);
    });
  });

  describe('createUser', () => {
    it('should create a new user successfully', async () => {
      const email = 'newuser@example.com';
      const password = 'password123';
      c