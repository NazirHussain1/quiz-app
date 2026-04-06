import { success } from '@/app/lib/responses';
import { withErrorHandler } from '@/app/lib/middleware/errorHandler';
import { requireAdmin } from '@/app/lib/middleware';
import { getAllUsers } from '@/app/services/userService';

export const dynamic = 'force-dynamic';

export const GET = requireAdmin(withErrorHandler(async (request) => {
  const users = await getAllUsers();

  return success(users);
}));
