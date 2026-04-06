import { NextResponse } from 'next/server';
import { rateLimitApi } from '@/app/lib/rateLimit';
import { withErrorHandling } from '@/app/lib/errorHandler';
import { resendVerificationEmail } from '@/app/services/authService';

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

  const { email } = await request.json();
  
  const result = await resendVerificationEmail(email);

  return NextResponse.json(result);
});
