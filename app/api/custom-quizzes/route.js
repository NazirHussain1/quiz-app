import { success, created } from '@/app/lib/responses';
import { withErrorHandler } from '@/app/lib/middleware/errorHandler';
import { requireAuth } from '@/app/lib/middleware';
import { rateLimitApi } from '@/app/lib/rateLimit';
import { RateLimitError } from '@/app/lib/errors';
import { getUserQuizzes, createCustomQuiz, deleteCustomQuiz } from '@/app/services/customQuizService';

export const dynamic = 'force-dynamic';

export const GET = requireAuth(withErrorHandler(async (request) => {
  // Rate limiting
  const rateLimit = rateLimitApi(request);
  if (!rateLimit.allowed) {
    throw new RateLimitError();
  }

  const user = request.user;
  const result = await getUserQuizzes(user.userId);
  
  return success({
    quizzes: result.quizzes,
    count: result.count
  });
}));

export const POST = requireAuth(withErrorHandler(async (request) => {
  // Rate limiting
  const rateLimit = rateLimitApi(request);
  if (!rateLimit.allowed) {
    throw new RateLimitError();
  }

  const user = request.user;
  const body = await request.json();
  
  const result = await createCustomQuiz(user.userId, user.userName, body);
  
  return created({ quizId: result.quizId }, result.message);
}));

export const DELETE = requireAuth(withErrorHandler(async (request) => {
  // Rate limiting
  const rateLimit = rateLimitApi(request);
  if (!rateLimit.allowed) {
    throw new RateLimitError();
  }

  const user = request.user;
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  
  const result = await deleteCustomQuiz(id, user.userId);
  
  return success(null, { message: result.message });
}));
