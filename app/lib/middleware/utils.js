/**
 * Middleware Utilities
 */

/**
 * Get client IP address from request
 */
export function getClientIP(request) {
  const forwarded = request?.headers?.get('x-forwarded-for');
  const real = request?.headers?.get('x-real-ip');
  const vercel = request?.headers?.get('x-vercel-forwarded-for');
  const cloudflare = request?.headers?.get('cf-connecting-ip');

  if (vercel) return vercel.split(',')[0].trim();
  if (cloudflare) return cloudflare;
  if (forwarded) return forwarded.split(',')[0].trim();
  if (real) return real;
  
  return 'unknown';
}

/**
 * Wrapper to apply middleware to route handler
 * @param {Function} middleware - Middleware function
 * @param {Function} handler - Route handler function
 * @returns {Function} Wrapped handler
 */
export function withMiddleware(middleware, handler) {
  return async function wrappedHandler(request, context) {
    const middlewareResult = await middleware(request);

    if (middlewareResult) {
      return middlewareResult;
    }

    return handler(request, context);
  };
}

/**
 * Combine multiple middlewares
 * @param {Function[]} middlewares - Array of middleware functions
 * @returns {Function} Combined middleware
 */
export function combineMiddlewares(...middlewares) {
  return async function combinedMiddleware(request) {
    for (const middleware of middlewares) {
      const result = await middleware(request);
      if (result) {
        return result;
      }
    }
    return null;
  };
}
