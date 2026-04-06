import { success } from '@/app/lib/responses';
import { withErrorHandler } from '@/app/lib/middleware/errorHandler';
import { requireAuth } from '@/app/lib/middleware';
import { rateLimitApi } from '@/app/lib/rateLimit';
import { RateLimitError } from '@/app/lib/errors';
import { getUserAnalytics } from '@/app/services/analyticsService';

export const dynamic = 'force-dynamic';

export const GET = requireAuth(withErrorHandler(async (request) => {
  const rateLimit = rateLimitApi(request);
  if (!rateLimit.allowed) {
    throw new RateLimitError();
  }

  const result = await getUserAnalytics();

  const response = success(result.data);
  response.headers.set('Cache-Control', 'private, s-maxage=300, stale-while-revalidate=600');
  
  return response;
}));
