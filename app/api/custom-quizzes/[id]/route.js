import { success } from '@/app/lib/responses';
import { withErrorHandler } from '@/app/lib/middleware/errorHandler';
import { requireAuth } from '@/app/lib/middleware';
import { rateLimitApi } from '@/app/lib/rateLimit';
import { RateLimitError } from '@/app/lib/errors';
import { getQuizById } from '@/app/services/customQuizService';

export const dynamic = 'force-dynamic';

export const GET = requireAuth(withErrorHandler(async (request, { params }) => {
  const rateLimit = rateLimitApi(request);
  if (!rateLimit.allowed) {
    throw new RateLimitError();
  }

  const result = await getQuizById(params.id);
  
  return success(result.quiz);
}));
