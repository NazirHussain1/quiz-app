import { success } from '@/app/lib/responses';
import { withErrorHandler } from '@/app/lib/middleware/errorHandler';
import { verifyAdmin } from '@/app/lib/middleware';
import { unauthorized } from '@/app/lib/responses';
import { getAllUsers } from '@/app/services/userService';

export const GET = withErrorHandler(async (request) => {
  const authResult = await verifyAdmin(request);
  if (!authResult.authorized) {
    return unauthorized();
  }

  const users = await getAllUsers();

  return success(users);
});
