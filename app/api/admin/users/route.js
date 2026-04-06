import { NextResponse } from 'next/server';
import { verifyAdmin } from '@/app/lib/middleware';
import { withErrorHandling } from '@/app/lib/errorHandler';
import { getAllUsers } from '@/app/services/userService';

export const GET = withErrorHandling(async (request) => {
  const authResult = await verifyAdmin(request);
  if (!authResult.authorized) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized' },
      { status: 401 }
    );
  }

  const users = await getAllUsers();

  return NextResponse.json({
    success: true,
    users
  });
});
