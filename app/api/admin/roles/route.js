import { success } from '@/app/lib/responses';
import { withErrorHandler } from '@/app/lib/middleware/errorHandler';
import { requireRole } from '@/app/lib/middleware';
import { ROLES, ROLE_PERMISSIONS } from '@/app/lib/rbac';
import { ValidationError, NotFoundError } from '@/app/lib/errors';
import { updateUserRole } from '@/app/services/userService';
import { connectToDatabase } from '@/app/lib/database/connection';
import { ObjectId } from 'mongodb';

export const dynamic = 'force-dynamic';

export const GET = requireRole([ROLES.ADMIN, ROLES.SUPERADMIN])(withErrorHandler(async (request) => {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');

  if (userId) {
    const { db } = await connectToDatabase();
    const user = await db.collection('users').findOne({ _id: new ObjectId(userId) });

    if (!user) {
      throw new NotFoundError('User not found');
    }

    return success({
      role: user.role,
      permissions: ROLE_PERMISSIONS[user.role] || []
    });
  }

  return success({
    roles: Object.values(ROLES),
    rolePermissions: ROLE_PERMISSIONS
  });
}));

export const PUT = requireRole([ROLES.SUPERADMIN])(withErrorHandler(async (request) => {
  const { userId, newRole } = await request.json();

  if (!userId || !newRole) {
    throw new ValidationError('User ID and new role are required');
  }

  // Prevent changing own role
  if (request.user.userId === userId) {
    throw new ValidationError('Cannot change your own role');
  }

  const result = await updateUserRole(userId, newRole);

  return success(result, 'User role updated successfully');
}));
