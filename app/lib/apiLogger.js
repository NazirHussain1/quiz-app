import { logAPI, logError } from './logger.js';

/**
 * API Request Logger Middleware
 * Logs all API requests with method, URL, status code, and duration
 */
export function apiLogger(handler) {
  return async (req, context) => {
    const startTime = Date.now();
    const method = req.method;
    const url = req.url;

    try {
      // Execute the API handler
      const response = await handler(req, context);
      
      // Calculate duration
      const duration = Date.now() - startTime;
      
      // Get status code from response
      const statusCode = response?.status || 200;
      
      // Log the request
      logAPI(method, url, statusCode, duration, {
        userAgent: req.headers.get('user-agent'),
        ip: getClientIP(req),
      });

      return response;
    } catch (error) {
      // Calculate duration even on error
      const duration = Date.now() - startTime;
      
      // Log error
      logError(error, {
        method,
        url,
        duration: `${duration}ms`,
        userAgent: req.headers.get('user-agent'),
        ip: getClientIP(req),
      });

      // Re-throw the error to be handled by error handler
      throw error;
    }
  };
}

/**
 * Get client IP address from request
 * Handles various proxy headers (Vercel, Cloudflare, etc.)
 */
function getClientIP(req) {
  // Check various headers for IP address
  const forwarded = req.headers.get('x-forwarded-for');
  const real = req.headers.get('x-real-ip');
  const vercel = req.headers.get('x-vercel-forwarded-for');
  const cloudflare = req.headers.get('cf-connecting-ip');

  if (vercel) return vercel.split(',')[0].trim();
  if (cloudflare) return cloudflare;
  if (forwarded) return forwarded.split(',')[0].trim();
  if (real) return real;
  
  return 'unknown';
}

/**
 * Wrapper for Next.js API routes to add logging
 * Usage: export const GET = withLogging(async (req) => { ... });
 */
export function withLogging(handler) {
  return async (req, context) => {
    return apiLogger(handler)(req, context);
  };
}
