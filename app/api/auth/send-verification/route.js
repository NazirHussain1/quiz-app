import { NextResponse } from 'next/server';
import { withErrorHandler } from '@/app/lib/middleware/errorHandler';
import { rateLimitApi } from '@/app/lib/rateLimit';
import { RateLimitError } from '@/app/lib/errors';
import { resendVerificationEmail } from '@/app/services/authService';

export const dynamic = 'force-dynamic';

export const POST = withErrorHandler(async (request) => {
  // Rate limiting
  const rateLimit = rateLimitApi(request);
  if (!rateLimit.allowed) {
    throw new RateLimitError();
  }

  const { email } = await request.json();
  
  const result = await resendVerificationEmail(email);

  if (!result.success) {
    return NextResponse.json(
      {
        success: false,
        error: result.message
      },
      { status: 500 }
    );
  }

  return NextResponse.json({
    success: true,
    message: result.message
  });
});
