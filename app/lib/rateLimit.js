// Enhanced rate limiting with IP tracking and throttling
// Optimized for Vercel serverless deployment

const rateLimitStore = new Map();
const ipThrottleStore = new Map();

/**
 * Get client IP address from request (Vercel-optimized)
 * @param {Request} request - Next.js request object
 * @returns {string} Client IP address
 */
function getClientIP(request) {
  // Vercel-specific headers (priority)
  const vercelIP = request.headers.get('x-vercel-forwarded-for');
  if (vercelIP) return vercelIP.split(',')[0].trim();
  
  // Standard forwarded headers
  const forwardedFor = request.headers.get('x-forwarded-for');
  if (forwardedFor) return forwardedFor.split(',')[0].trim();
  
  // Cloudflare
  const cfIP = request.headers.get('cf-connecting-ip');
  if (cfIP) return cfIP;
  
  // Real IP
  const realIP = request.headers.get('x-real-ip');
  if (realIP) return realIP;
  
  return 'unknown';
}

/**
 * IP-based throttling - Max 5 requests per minute per IP
 * Prevents brute force and DDoS attacks
 * @param {Request} request - Next.js request object
 * @returns {Object} Throttle result
 */
export function ipThrottle(request) {
  const ip = getClientIP(request);
  const now = Date.now();
  const windowMs = 60 * 1000; // 1 minute
  const maxRequests = 5;

  const ipData = ipThrottleStore.get(ip);

  if (!ipData || now > ipData.resetTime) {
    ipThrottleStore.set(ip, {
      count: 1,
      resetTime: now + windowMs,
    });
    return {
      allowed: true,
      remaining: maxRequests - 1,
      resetTime: now + windowMs,
      retryAfter: null,
    };
  }

  if (ipData.count >= maxRequests) {
    return {
      allowed: false,
      remaining: 0,
      resetTime: ipData.resetTime,
      retryAfter: Math.ceil((ipData.resetTime - now) / 1000),
    };
  }

  ipData.count++;
  return {
    allowed: true,
    remaining: maxRequests - ipData.count,
    resetTime: ipData.resetTime,
    retryAfter: null,
  };
}

/**
 * General API rate limiting
 * @param {Request} request - Next.js request object
 * @param {Object} options - Rate limit options
 * @returns {Object} Rate limit result
 */
export function rateLimitApi(request, options = {}) {
  const {
    windowMs = 15 * 60 * 1000, // 15 minutes
    maxRequests = 100,
  } = options;

  const ip = getClientIP(request);
  const key = `api:${ip}`;
  const now = Date.now();

  const data = rateLimitStore.get(key);

  if (!data || now > data.resetTime) {
    rateLimitStore.set(key, {
      count: 1,
      resetTime: now + windowMs,
    });
    return {
      allowed: true,
      remaining: maxRequests - 1,
      retryAfter: null,
    };
  }

  if (data.count >= maxRequests) {
    return {
      allowed: false,
      remaining: 0,
      retryAfter: Math.ceil((data.resetTime - now) / 1000),
    };
  }

  data.count++;
  return {
    allowed: true,
    remaining: maxRequests - data.count,
    retryAfter: null,
  };
}

/**
 * Login-specific rate limiting (stricter)
 * Prevents brute force attacks
 * @param {Request} request - Next.js request object
 * @returns {Object} Rate limit result
 */
export function rateLimitLogin(request) {
  const ip = getClientIP(request);
  const key = `login:${ip}`;
  const now = Date.now();
  const windowMs = 15 * 60 * 1000; // 15 minutes
  const maxAttempts = 5;

  const data = rateLimitStore.get(key);

  if (!data || now > data.resetTime) {
    rateLimitStore.set(key, {
      count: 1,
      resetTime: now + windowMs,
    });
    return {
      allowed: true,
      remaining: maxAttempts - 1,
      retryAfter: null,
    };
  }

  if (data.count >= maxAttempts) {
    return {
      allowed: false,
      remaining: 0,
      retryAfter: Math.ceil((data.resetTime - now) / 1000),
    };
  }

  data.count++;
  return {
    allowed: true,
    remaining: maxAttempts - data.count,
    retryAfter: null,
  };
}

/**
 * Signup-specific rate limiting (very strict)
 * Prevents spam account creation
 * @param {Request} request - Next.js request object
 * @returns {Object} Rate limit result
 */
export function rateLimitSignup(request) {
  const ip = getClientIP(request);
  const key = `signup:${ip}`;
  const now = Date.now();
  const windowMs = 60 * 60 * 1000; // 1 hour
  const maxAttempts = 3;

  const data = rateLimitStore.get(key);

  if (!data || now > data.resetTime) {
    rateLimitStore.set(key, {
      count: 1,
      resetTime: now + windowMs,
    });
    return {
      allowed: true,
      remaining: maxAttempts - 1,
      retryAfter: null,
    };
  }

  if (data.count >= maxAttempts) {
    return {
      allowed: false,
      remaining: 0,
      retryAfter: Math.ceil((data.resetTime - now) / 1000),
    };
  }

  data.count++;
  return {
    allowed: true,
    remaining: maxAttempts - data.count,
    retryAfter: null,
  };
}

/**
 * Clean up old entries periodically
 * Prevents memory leaks in serverless environment
 */
export function cleanupRateLimitStores() {
  const now = Date.now();
  
  // Clean rate limit store
  for (const [key, data] of rateLimitStore.entries()) {
    if (now > data.resetTime + 60000) { // 1 minute after reset
      rateLimitStore.delete(key);
    }
  }
  
  // Clean IP throttle store
  for (const [ip, data] of ipThrottleStore.entries()) {
    if (now > data.resetTime + 60000) {
      ipThrottleStore.delete(ip);
    }
  }
}

// Run cleanup every 5 minutes (only in Node.js environment)
if (typeof setInterval !== 'undefined') {
  setInterval(cleanupRateLimitStores, 5 * 60 * 1000);
}

/**
 * Get client identifier from request (legacy support)
 */
export function getClientIdentifier(req) {
  if (req.headers && typeof req.headers.get === 'function') {
    return getClientIP(req);
  }
  
  // Fallback for older API
  const forwarded = req.headers?.['x-forwarded-for'];
  const ip = forwarded 
    ? forwarded.split(',')[0].trim() 
    : req.headers?.['x-real-ip'] || req.socket?.remoteAddress || 'unknown';
  
  return ip;
}

/**
 * Simple rate limit check (legacy support)
 */
export function checkRateLimit(identifier, maxRequests = 5, windowMs = 60000) {
  const now = Date.now();
  const key = identifier;
  
  let entry = rateLimitStore.get(key);
  
  if (!entry) {
    entry = {
      count: 1,
      resetTime: now + windowMs
    };
    rateLimitStore.set(key, entry);
    return { allowed: true, remaining: maxRequests - 1 };
  }
  
  if (now > entry.resetTime) {
    entry.count = 1;
    entry.resetTime = now + windowMs;
    rateLimitStore.set(key, entry);
    return { allowed: true, remaining: maxRequests - 1 };
  }
  
  if (entry.count >= maxRequests) {
    return { 
      allowed: false, 
      remaining: 0,
      resetTime: entry.resetTime,
      retryAfter: Math.ceil((entry.resetTime - now) / 1000),
    };
  }
  
  entry.count++;
  rateLimitStore.set(key, entry);
  
  return { 
    allowed: true, 
    remaining: maxRequests - entry.count 
  };
}
