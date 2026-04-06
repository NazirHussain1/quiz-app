import { NextResponse } from 'next/server';
import { requireRole } from '@/app/lib/middleware';
import { ROLES } from '@/app/lib/rbac';
import { withErrorHandling } from '@/app/lib/errorHandler';
import { updateUserRole } from '@/app/services/userService';
import { connectToDatabase } from '@/app/lib/database/connection';
import { ROLE_PERMISSIONS } from '@/app/lib/rbac';
import { ObjectId } from 'mongodb';

export const dynamic = 'force-dynamic';

export const GET = requireRole([ROLES.ADMIN, ROLES.SUPERADMIN])(withErrorHandling(async (request) => {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');

  if (userId) {
    const { db } = await connectToDatabase();
    const user = await db.collection('users').findOne({ _id: new ObjectId(userId) });

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      role: user.role,
      permissions: ROLE_PERMISSIONS[user.role] || []
    });
  }

  return NextResponse.json({
    success: true,
    roles: Object.values(ROLES),
    rolePermissions: ROLE_PERMISSIONS
  });
}));

export const PUT = requireRole([ROLES.SUPERADMIN])(withErrorHandling(async (request) => {
  const { userId, newRole } = await request.json();

  if (!userId || !newRole) {
    return NextResponse.json(
      { success: false, error: 'User ID and new role are required' },
      { status: 400 }
    );
  }

  // Prevent changing own role
  if (request.user.userId === userId) {
    return NextResponse.json(
      { success: false, error: 'Cannot change your own role' },
      { status: 400 }
    );
  }

  const result = await updateUserRole(userId, newRole);

  return NextResponse.json(result);
}));
