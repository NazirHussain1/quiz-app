import { NextResponse } from 'next/server';
import { rateLimitApi } from '@/app/lib/rateLimit';
import { logSecurity } from '@/app/lib/logger';
import { withErrorHandling, AppError } from '@/app/lib/errorHandler';
import { getQuestions, createQuestion } from '@/app/services/questionService';

export const dynamic = 'force-dynamic';

export const GET = withErrorHandling(async (request) => {
  // Rate limiting
  const rateLimit = rateLimitApi(request);
  if (!rateLimit.allowed) {
    logSecurity('Rate limit exceeded', 'low', {
      event: 'questions_rate_limit',
      ip: request.headers.get('x-forwarded-for') || 'unknown',
    });
    throw new AppError('Too many requests. Please try again later.', 429);
  }

  const { searchParams } = new URL(request.url);
  
  const result = await getQuestions({
    category: searchParams.get('category'),
    subject: searchParams.get('subject'),
    difficulty: searchParams.get('difficulty'),
    search: searchParams.get('search'),
    limit: searchParams.get('limit') || '10'
  });
  
  return NextResponse.json(result, {
    headers: {
      'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
    }
  });
});

export const POST = withErrorHandling(async (request) => {
  // Rate limiting
  const rateLimit = rateLimitApi(request);
  if (!rateLimit.allowed) {
    throw new AppError('Too many requests. Please try again later.', 429);
  }

  const body = await request.json();
  
  const result = await createQuestion(body);
  
  return NextResponse.json(result, { status: 201 });
});
