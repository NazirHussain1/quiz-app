import { success } from '@/app/lib/responses';
import { withErrorHandler } from '@/app/lib/middleware/errorHandler';
import { requireAdmin } from '@/app/lib/middleware';
import { rateLimitApi } from '@/app/lib/rateLimit';
import { RateLimitError, ValidationError } from '@/app/lib/errors';
import { makeUserAdmin } from '@/app/services/userService';

export const dynamic = 'force-dynamic';

export const POST = requireAdmin(withErrorHandler(async (request) => {
  const rateLimit = rateLimitApi(request);
  if (!rateLimit.allowed) {
    throw new RateLimitError();
  }

  const { userId } = await request.json();
  
  if (!userId) {
    throw new ValidationError('User ID is required');
  }
  
  const result = await makeUserAdmin(userId);

  return success(null, result.message);
}));
