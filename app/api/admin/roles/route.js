import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/app/lib/mongodb';
import { requireRole } from '@/app/lib/authMiddleware';
import { ROLES, isValidRole, ROLE_PERMISSIONS } from '@/app/lib/rbac';
import { ObjectId } from 'mongodb';

export const dynamic = 'force-dynamic';

// Get user role or list all roles
export const GET = requireRole([ROLES.ADMIN, ROLES.SUPERADMIN])(async (request) => {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (userId) {
      // Get specific user's role
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

    // Return all available roles and their permissions
    return NextResponse.json({
      success: true,
      roles: Object.values(ROLES),
      rolePermissions: ROLE_PERMISSIONS
    });
  } catch (error) {
    console.error('Get roles error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch roles' },
      { status: 500 }
    );
  }
});

// Update user role
export const PUT = requireRole([ROLES.SUPERADMIN])(async (request) => {
  try {
    const { userId, newRole } = await request.json();

    if (!userId || !newRole) {
      return NextResponse.json(
        { success: false, error: 'User ID and new role are required' },
        { status: 400 }
      );
    }

    // Validate role
    if (!isValidRole(newRole)) {
      return NextResponse.json(
        { success: false, error: `Invalid role. Must be one of: ${Object.values(ROLES).join(', ')}` },
        { status: 400 }
      );
    }

    const { db } = await connectToDatabase();
    const usersCollection = db.collection('users');

    // Check if user exists
    const user = await usersCollection.findOne({ _id: new ObjectId(userId) });

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    // Prevent changing own role (safety measure)
    if (request.user.userId === userId) {
      return NextResponse.json(
        { success: false, error: 'Cannot change your own role' },
        { status: 400 }
      );
    }

    // Update role
    await usersCollection.updateOne(
      { _id: new ObjectId(userId) },
      {
        $set: {
          role: newRole,
          updatedAt: new Date()
        }
      }
    );

    return NextResponse.json({
      success: true,
      message: `User role updated to ${newRole}`,
      user: {
        id: user._id.toString(),
        email: user.email,
        userName: user.userName,
        role: newRole
      }
    });
  } catch (error) {
    console.error('Update role error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update role' },
      { status: 500 }
    );
  }
});
