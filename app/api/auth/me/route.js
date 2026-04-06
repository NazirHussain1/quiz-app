import { success, unauthorized, notFound, rateLimit as rateLimitResponse } from '@/app/lib/responses';
import { withErrorHandler } from '@/app/lib/middleware/errorHandler';
import { verifyToken } from '@/app/lib/jwt';
import { findUserById } from '@/app/lib/auth';
import { rateLimitApi } from '@/app/lib/rateLimit';
import { RateLimitError, AuthenticationError, NotFoundError } from '@/app/lib/errors';

export const GET = withErrorHandler(async (request) => {
  const rateLimit = rateLimitApi(request);
  if (!rateLimit.allowed) {
    throw new RateLimitError();
  }

  const token = request.cookies.get('auth-token')?.value;
  
  if (!token) {
    throw new AuthenticationError('Not authenticated');
  }
  
  const decoded = await verifyToken(token);
  
  if (!decoded) {
    throw new AuthenticationError('Invalid or expired token');
  }
  
  const user = await findUserById(decoded.userId);
  
  if (!user) {
    throw new NotFoundError('User not found');
  }
  
  return success({
    user: {
      id: user.id,
      email: user.email,
      userName: user.userName,
      role: user.role
    }
  });
});
