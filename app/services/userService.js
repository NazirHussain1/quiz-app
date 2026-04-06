/**
 * User Service
 * Handles user management business logic
 */

import { validate } from '@/app/lib/validation';
import { updateRoleSchema, makeAdminSchema, deleteUserSchema, roleSchema } from '@/app/lib/validation/schemas';
import { ROLES } from '@/app/lib/rbac';
import { AppError } from '@/app/lib/errorHandler';
import { getCollection, updateById, deleteById } from './shared/database';

/**
 * Get all users (admin only)
 */
export async function getAllUsers() {
  const users = await getCollection('users');
  const userList = await users
    .find({})
    .sort({ createdAt: -1 })
    .toArray();

  return userList.map(user => ({
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
  validate(makeAdminSchema, { userId });
  
  await updateById('users', userId, { role: ROLES.ADMIN });

  return {
    success: true,
    message: 'User role updated to admin successfully'
  };
}

/**
 * Delete user
 */
export async function deleteUser(userId) {
  validate(deleteUserSchema, { userId });
  
  await deleteById('users', userId);

  return {
    success: true,
    message: 'User deleted successfully'
  };
}

/**
 * Update user role
 */
export async function updateUserRole(userId, role) {
  const validated = validate(updateRoleSchema, { userId, newRole: role });

  await updateById('users', validated.userId, { role: validated.newRole });

  return {
    success: true,
    message: 'User role updated successfully'
  };
}
