import { success, created } from '@/app/lib/responses';
import { withErrorHandler } from '@/app/lib/middleware/errorHandler';
import { rateLimitApi } from '@/app/lib/rateLimit';
import { logSecurity } from '@/app/lib/logger';
import { RateLimitError } from '@/app/lib/errors';
import { getQuestions, createQuestion } from '@/app/services/questionService';

export const dynamic = 'force-dynamic';

export const GET = withErrorHandler(async (request) => {
  const rateLimit = rateLimitApi(request);
  if (!rateLimit.allowed) {
    logSecurity('Rate limit exceeded', 'low', {
      event: 'questions_rate_limit',
      ip: request.headers.get('x-forwarded-for') || 'unknown',
    });
    throw new RateLimitError();
  }

  const { searchParams } = new URL(request.url);
  
  const result = await getQuestions({
    category: searchParams.get('category'),
    subject: searchParams.get('subject'),
    difficulty: searchParams.get('difficulty'),
    search: searchParams.get('search'),
    limit: searchParams.get('limit') || '10'
  });
  
  const response = success({
    questions: result.questions,
    count: result.count
  });
  
  response.headers.set('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=600');
  
  return response;
});

export const POST = withErrorHandler(async (request) => {
  // Rate limiting
  const rateLimit = rateLimitApi(request);
  if (!rateLimit.allowed) {
    throw new RateLimitError();
  }

  const body = await request.json();
  
  const result = await createQuestion(body);
  
  return created({ questionId: result.questionId }, 'Question created successfully');
});
