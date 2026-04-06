import { NextResponse } from 'next/server';
import { rateLimitApi } from '@/app/lib/rateLimit';
import { withErrorHandling, AppError } from '@/app/lib/errorHandler';
import { getQuizById } from '@/app/services/customQuizService';

export const dynamic = 'force-dynamic';

export const GET = withErrorHandling(async (request, { params }) => {
  // Rate limiting
  const rateLimit = rateLimitApi(request);
  if (!rateLimit.allowed) {
    throw new AppError('Too many requests. Please try again later.', 429);
  }

  const result = await getQuizById(params.id);
  
  return NextResponse.json(result);
});
