import { NextResponse } from 'next/server';
import { requireAdmin } from '@/app/lib/middleware';
import { rateLimitApi } from '@/app/lib/rateLimit';
import { withErrorHandling, AppError } from '@/app/lib/errorHandler';
import { 
  getQuestionsForAdmin, 
  createQuestion, 
  updateQuestion, 
  deleteQuestion 
} from '@/app/services/questionService';

export const dynamic = 'force-dynamic';

export const GET = requireAdmin(withErrorHandling(async (request) => {
  const rateLimit = rateLimitApi(request);
  if (!rateLimit.allowed) {
    throw new AppError('Too many requests. Please try again later.', 429);
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
  
  return NextResponse.json(result);
}));

export const POST = requireAdmin(withErrorHandling(async (request) => {
  const rateLimit = rateLimitApi(request);
  if (!rateLimit.allowed) {
    throw new AppError('Too many requests. Please try again later.', 429);
  }

  const body = await request.json();
  
  const result = await createQuestion(body);
  
  return NextResponse.json({ 
    ...result,
    message: 'Question added successfully'
  }, { status: 201 });
}));

export const PUT = requireAdmin(withErrorHandling(async (request) => {
  const rateLimit = rateLimitApi(request);
  if (!rateLimit.allowed) {
    throw new AppError('Too many requests. Please try again later.', 429);
  }

  const body = await request.json();
  
  const result = await updateQuestion(body._id, body);
  
  return NextResponse.json(result);
}));

export const DELETE = requireAdmin(withErrorHandling(async (request) => {
  const rateLimit = rateLimitApi(request);
  if (!rateLimit.allowed) {
    throw new AppError('Too many requests. Please try again later.', 429);
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  
  const result = await deleteQuestion(id);
  
  return NextResponse.json(result);
}));
