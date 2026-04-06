import { NextResponse } from 'next/server';
import { rateLimitApi } from '@/app/lib/rateLimit';
import { withErrorHandling } from '@/app/lib/errorHandler';
import { verifyEmail } from '@/app/services/authService';

export const dynamic = 'force-dynamic';

export const POST = withErrorHandling(async (request) => {
  // Rate limiting
  const rateLimit = rateLimitApi(request);
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { success: false, error: "Too many requests. Please try again later." },
      { status: 429 }
    );
  }

  const { token } = await request.json();
  
  const result = await verifyEmail(token);

  return NextResponse.json(result);
});
