import { NextResponse } from 'next/server';
import { verifyAdmin } from '@/app/lib/middleware';
import { withErrorHandling } from '@/app/lib/errorHandler';
import { makeUserAdmin } from '@/app/services/userService';

export const POST = withErrorHandling(async (request) => {
  const authResult = await verifyAdmin(request);
  if (!authResult.authorized) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized' },
      { status: 401 }
    );
  }

  const { userId } = await request.json();
  
  const result = await makeUserAdmin(userId);

  return NextResponse.json(result);
});
