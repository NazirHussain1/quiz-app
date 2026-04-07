import { success, created } from '@/app/lib/responses';
import { withErrorHandler } from '@/app/lib/middleware/errorHandler';
import { rateLimitApi } from '@/app/lib/rateLimit';
import { RateLimitError } from '@/app/lib/errors';
import { saveQuizResult, getLeaderboard } from '@/app/services/quizResultService';

export const dynamic = 'force-dynamic';

export const POST = withErrorHandler(async (request) => {
  // Rate limiting
  const rateLimit = rateLimitApi(request);
  if (!rateLimit.allowed) {
    throw new RateLimitError();
  }

  const body = await request.json();
  
  const result = await saveQuizResult(body);
  
  return created({ resultId: result.resultId }, 'Result saved successfully');
});

export const GET = withErrorHandler(async (request) => {
  // Rate limiting
  const rateLimit = rateLimitApi(request);
  if (!rateLimit.allowed) {
    throw new RateLimitError();
  }

  const { searchParams } = new URL(request.url);
  
  const result = await getLeaderboard({
    limit: searchParams.get('limit') || '50',
    page: searchParams.get('page') || '1',
    category: searchParams.get('category'),
    subject: searchParams.get('subject'),
    difficulty: searchParams.get('difficulty')
  });
  
  const response = success({
    results: result.results,
    count: result.count,
    totalCount: result.totalCount,
    totalPages: result.totalPages,
    currentPage: result.currentPage
  });
  
  response.headers.set('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=600');
  
  return response;
});
