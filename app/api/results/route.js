import { NextResponse } from 'next/server';
import { rateLimitApi } from '@/app/lib/rateLimit';
import { withErrorHandling, AppError } from '@/app/lib/errorHandler';
import { saveQuizResult, getLeaderboard } from '@/app/services/quizResultService';

export const dynamic = 'force-dynamic';

export const POST = withErrorHandling(async (request) => {
  // Rate limiting
  const rateLimit = rateLimitApi(request);
  if (!rateLimit.allowed) {
    throw new AppError('Too many requests. Please try again later.', 429);
  }

  const body = await request.json();
  
  const result = await saveQuizResult(body);
  
  return NextResponse.json(result, { status: 201 });
});

export const GET = withErrorHandling(async (request) => {
  // Rate limiting
  const rateLimit = rateLimitApi(request);
  if (!rateLimit.allowed) {
    throw new AppError('Too many requests. Please try again later.', 429);
  }

  const { searchParams } = new URL(request.url);
  
  const result = await getLeaderboard({
    limit: searchParams.get('limit') || '50',
    page: searchParams.get('page') || '1',
    category: searchParams.get('category'),
    subject: searchParams.get('subject'),
    difficulty: searchParams.get('difficulty')
  });
  
  return NextResponse.json(result, {
    headers: {
      'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
    }
  });
});
