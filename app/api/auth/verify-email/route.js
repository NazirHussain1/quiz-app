import { success } from '@/app/lib/responses';
import { withErrorHandler } from '@/app/lib/middleware/errorHandler';
import { rateLimitApi } from '@/app/lib/rateLimit';
import { RateLimitError } from '@/app/lib/errors';
import { verifyEmail } from '@/app/services/authService';

export const dynamic = 'force-dynamic';

export const POST = withErrorHandler(async (request) => {
  // Rate limiting
  const rateLimit = rateLimitApi(request);
  if (!rateLimit.allowed) {
    throw new RateLimitError();
  }

  const { token } = await request.json();
  
  const result = await verifyEmail(token);

  return success(null, { message: result.message });
});
