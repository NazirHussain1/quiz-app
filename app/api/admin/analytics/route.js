import { NextResponse } from 'next/server';
import { requireAdmin } from '@/app/lib/middleware';
import { rateLimitApi } from '@/app/lib/rateLimit';
import { withErrorHandling, AppError } from '@/app/lib/errorHandler';
import { getAdminAnalytics } from '@/app/services/analyticsService';

export const dynamic = 'force-dynamic';

export const GET = requireAdmin(withErrorHandling(async (request) => {
  // Rate limiting
  const rateLimit = rateLimitApi(request);
  if (!rateLimit.allowed) {
    throw new AppError('Too many requests. Please try again later.', 429);
  }

  const result = await getAdminAnalytics();

  return NextResponse.json(result);
}));
