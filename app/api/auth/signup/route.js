import { created } from '@/app/lib/responses';
import { withErrorHandler } from '@/app/lib/middleware/errorHandler';
import { rateLimitLogin } from '@/app/lib/rateLimit';
import { logSecurity } from '@/app/lib/logger';
import { RateLimitError } from '@/app/lib/errors';
import { registerUser } from '@/app/services/authService';

export const POST = withErrorHandler(async (request) => {
  // Rate limiting
  const rateLimit = rateLimitLogin(request);
  if (!rateLimit.allowed) {
    logSecurity('Rate limit exceeded', 'medium', {
      event: 'signup_rate_limit',
      ip: request.headers.get('x-forwarded-for') || 'unknown',
    });
    throw new RateLimitError();
  }

  const body = await request.json();
  const { email, password, userName } = body;

  const result = await registerUser(email, password, userName);

  return created(result.user, result.message);
});
