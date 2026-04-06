/**
 * User Service
 * Handles user management business logic
 */

import { connectToDatabase } from '@/app/lib/database/connection';
import { validateObjectId } from '@/app/lib/validation';
import { ROLES } from '@/app/lib/rbac';
import { ObjectId } from 'mongodb';
import { AppError } from '@/app/lib/errorHandler';

/**
 * Get all users (admin only)
 */
export async function getAllUsers() {
  const { db } = await connectToDatabase();
  const users = await db.collection('users')
    .find({})
    .sort({ createdAt: -1 })
    .toArray();

  return users.map(user => ({
    _id: user._id.toString(),
    userName: user.userName,
    email: user.email,
    role: user.role,
    createdAt: user.createdAt
  }));
}

/**
 * Make user admin
 */
export async function makeUserAdmin(userId) {
  const idValidation = validateObjectId(userId);
  if (!idValidation.valid) {
    throw new AppError(idValidation.error, 400);
  }

  const { db } = await connectToDatabase();
  const usersCollection = db.collection('users');

  const result = await usersCollection.updateOne(
    { _id: new ObjectId(idValidation.value) },
    {
      $set: {
        role: ROLES.ADMIN,
        updatedAt: new Date()
      }
    }
  );

  if (result.matchedCount === 0) {
    throw new AppError('User not found', 404);
  }

  return {
    success: true,
    message: 'User role updated to admin successfully'
  };
}

/**
 * Delete user
 */
export async function deleteUser(userId) {
  const idValidation = validateObjectId(userId);
  if (!idValidation.valid) {
    throw new AppError(idValidation.error, 400);
  }

  const { db } = await connectToDatabase();
  const usersCollection = db.collection('users');

  const result = await usersCollection.deleteOne({
    _id: new ObjectId(idValidation.value)
  });

  if (result.deletedCount === 0) {
    throw new AppError('User not found', 404);
  }

  return {
    success: true,
    message: 'User deleted successfully'
  };
}

/**
 * Update user role
 */
export async function updateUserRole(userId, role) {
  const idValidation = validateObjectId(userId);
  if (!idValidation.valid) {
    throw new AppError(idValidation.error, 400);
  }

  const validRoles = Object.values(ROLES);
  if (!validRoles.includes(role)) {
    throw new AppError('Invalid role', 400);
  }

  const { db } = await connectToDatabase();
  const usersCollection = db.collection('users');

  const result = await usersCollection.updateOne(
    { _id: new ObjectId(idValidation.value) },
    {
      $set: {
        role,
        updatedAt: new Date()
      }
    }
  );

  if (result.matchedCount === 0) {
    throw new AppError('User not found', 404);
  }

  return {
    success: true,
    message: 'User role updated successfully'
  };
}
