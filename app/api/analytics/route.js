import { NextResponse } from 'next/server';
import { requireAuth } from '@/app/lib/middleware';
import { rateLimitApi } from '@/app/lib/rateLimit';
import { withErrorHandling, AppError } from '@/app/lib/errorHandler';
import { getUserAnalytics } from '@/app/services/analyticsService';

export const dynamic = 'force-dynamic';

export const GET = requireAuth(withErrorHandling(async (request) => {
  // Rate limiting
  const rateLimit = rateLimitApi(request);
  if (!rateLimit.allowed) {
    throw new AppError('Too many requests. Please try again later.', 429);
  }

  const result = await getUserAnalytics();

  return NextResponse.json(result, {
    headers: {
      'Cache-Control': 'private, s-maxage=300, stale-while-revalidate=600',
    }
  });
}));
