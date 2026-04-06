import { success } from '@/app/lib/responses';
import { withErrorHandler } from '@/app/lib/middleware/errorHandler';
import { requireAdmin } from '@/app/lib/middleware';
import { rateLimitApi } from '@/app/lib/rateLimit';
import { RateLimitError } from '@/app/lib/errors';
import { getAdminAnalytics } from '@/app/services/analyticsService';

export const dynamic = 'force-dynamic';

export const GET = requireAdmin(withErrorHandler(async (request) => {
  // Rate limiting
  const rateLimit = rateLimitApi(request);
  if (!rateLimit.allowed) {
    throw new RateLimitError();
  }

  const result = await getAdminAnalytics();

  return success(result.data);
}));
