import { NextResponse } from 'next/server';
import { withErrorHandler } from '@/app/lib/middleware/errorHandler';
import { rateLimitApi } from '@/app/lib/rateLimit';
import { RateLimitError } from '@/app/lib/errors';
import { getQuestions, createQuestion } from '@/app/services/questionService';

export const dynamic = 'force-dynamic';

export const GET = withErrorHandler(async (request) => {
  const rateLimit = rateLimitApi(request);
  if (!rateLimit.allowed) {
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
  
  const response = NextResponse.json({
    success: true,
    questions: result.questions,
    count: result.count
  });
  
  response.headers.set('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=600');
  
  return response;
});

export const POST = withErrorHandler(async (request) => {
  const rateLimit = rateLimitApi(request);
  if (!rateLimit.allowed) {
    throw new RateLimitError();
  }

  const body = await request.json();
  
  const result = await createQuestion(body);
  
  return NextResponse.json({
    success: true,
    questionId: result.questionId,
    message: 'Question created successfully'
  }, { status: 201 });
});
