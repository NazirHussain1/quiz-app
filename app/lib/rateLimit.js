// Lightweight in-memory rate limiting

const rateLimitStore = new Map();

/**
 * Simple rate limiter
 * @param {string} identifier - Unique identifier (e.g., IP address, user ID)
 * @param {number} maxRequests - Maximum requests allowed
 * @param {number} windowMs - Time window in milliseconds
 */
export function checkRateLimit(identifier, maxRequests = 5, windowMs = 60000) {
  const now = Date.now();
  const key = identifier;
  
  // Get or create rate limit entry
  let entry = rateLimitStore.get(key);
  
  if (!entry) {
    entry = {
      count: 1,
      resetTime: now + windowMs
    };
    rateLimitStore.set(key, entry);
    return { allowed: true, remaining: maxRequests - 1 };
  }
  
  // Reset if window has passed
  if (now > entry.resetTime) {
    entry.count = 1;
    entry.resetTime = now + windowMs;
    rateLimitStore.set(key, entry);
    return { allowed: true, remaining: maxRequests - 1 };
  }
  
  // Check if limit exceeded
  if (entry.count >= maxRequests) {
    return { 
      allowed: false, 
      remaining: 0,
      resetTime: entry.resetTime 
    };
  }
  
  // Increment count
  entry.count++;
  rateLimitStore.set(key, entry);
  
  return { 
    allowed: true, 
    remaining: maxRequests - entry.count 
  };
}

/**
 * Clean up old entries periodically
 */
export function cleanupRateLimitStore() {
  const now = Date.now();
  
  for (const [key, entry] of rateLimitStore.entries()) {
    if (now > entry.resetTime + 60000) { // 1 minute after reset
      rateLimitStore.delete(key);
    }
  }
}

// Run cleanup every 5 minutes
if (typeof setInterval !== "undefined") {
  setInterval(cleanupRateLimitStore, 5 * 60 * 1000);
}

/**
 * Get client identifier from request
 */
export function getClientIdentifier(req) {
  // Try to get IP from various headers
  const forwarded = req.headers["x-forwarded-for"];
  const ip = forwarded 
    ? forwarded.split(",")[0].trim() 
    : req.headers["x-real-ip"] || req.socket?.remoteAddress || "unknown";
  
  return ip;
}

/**
 * Rate limit middleware for login attempts
 */
export function rateLimitLogin(req) {
  const identifier = getClientIdentifier(req);
  const result = checkRateLimit(`login:${identifier}`, 5, 15 * 60 * 1000); // 5 attempts per 15 minutes
  
  return result;
}

/**
 * Rate limit middleware for API requests
 */
export function rateLimitApi(req) {
  const identifier = getClientIdentifier(req);
  const result = checkRateLimit(`api:${identifier}`, 100, 60 * 1000); // 100 requests per minute
  
  return result;
}
