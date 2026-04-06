import { success, unauthorized } from '@/app/lib/responses';
import { withErrorHandler } from '@/app/lib/middleware/errorHandler';
import { verifyAdmin } from '@/app/lib/middleware';
import { deleteUser } from '@/app/services/userService';

export const DELETE = withErrorHandler(async (request) => {
  const authResult = await verifyAdmin(request);
  if (!authResult.authorized) {
    return unauthorized();
  }

  const { userId } = await request.json();
  
  const result = await deleteUser(userId);

  return success(null, { message: result.message });
});
