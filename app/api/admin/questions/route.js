import { success, created } from '@/app/lib/responses';
import { withErrorHandler } from '@/app/lib/middleware/errorHandler';
import { requireAdmin } from '@/app/lib/middleware';
import { rateLimitApi } from '@/app/lib/rateLimit';
import { RateLimitError } from '@/app/lib/errors';
import { 
  getQuestionsForAdmin, 
  createQuestion, 
  updateQuestion, 
  deleteQuestion 
} from '@/app/services/questionService';

export const dynamic = 'force-dynamic';

export const GET = requireAdmin(withErrorHandler(async (request) => {
  const rateLimit = rateLimitApi(request);
  if (!rateLimit.allowed) {
    throw new RateLimitError();
  }

  const { searchParams } = new URL(request.url);
  
  const result = await getQuestionsForAdmin({
    category: searchParams.get('category'),
    subject: searchParams.get('subject'),
    difficulty: searchParams.get('difficulty'),
    search: searchParams.get('search'),
    page: searchParams.get('page') || '1',
    limit: searchParams.get('limit') || '20'
  });
  
  return success(result);
}));

export const POST = requireAdmin(withErrorHandler(async (request) => {
  const rateLimit = rateLimitApi(request);
  if (!rateLimit.allowed) {
    throw new RateLimitError();
  }

  const body = await request.json();
  
  const result = await createQuestion(body);
  
  return created(
    { questionId: result.questionId },
    'Question added successfully'
  );
}));

export const PUT = requireAdmin(withErrorHandler(async (request) => {
  const rateLimit = rateLimitApi(request);
  if (!rateLimit.allowed) {
    throw new RateLimitError();
  }

  const body = await request.json();
  
  const result = await updateQuestion(body._id, body);
  
  return success(null, result.message);
}));

export const DELETE = requireAdmin(withErrorHandler(async (request) => {
  const rateLimit = rateLimitApi(request);
  if (!rateLimit.allowed) {
    throw new RateLimitError();
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  
  const result = await deleteQuestion(id);
  
  return success(null, result.message);
}));
