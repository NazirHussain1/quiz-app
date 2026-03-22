// Standardized API response utilities

/**
 * Success response
 */
export function successResponse(data = null, message = null) {
  const response = { success: true };
  
  if (data !== null) {
    response.data = data;
  }
  
  if (message) {
    response.message = message;
  }
  
  return response;
}

/**
 * Error response
 */
export function errorResponse(message, statusCode = 400) {
  return {
    success: false,
    error: message,
    statusCode
  };
}

/**
 * Send success response
 */
export function sendSuccess(res, data = null, message = null, statusCode = 200) {
  return res.status(statusCode).json(successResponse(data, message));
}

/**
 * Send error response
 */
export function sendError(res, message, statusCode = 400) {
  return res.status(statusCode).json(errorResponse(message, statusCode));
}

/**
 * Handle API errors safely without exposing internals
 */
export function handleApiError(res, error, context = "Operation") {
  console.error(`${context} error:`, error);
  
  // Don't expose internal error details in production
  const isDevelopment = process.env.NODE_ENV === "development";
  const message = isDevelopment 
    ? error.message 
    : `${context} failed. Please try again.`;
  
  return sendError(res, message, 500);
}

/**
 * Validate request method
 */
export function validateMethod(req, res, allowedMethods) {
  if (!allowedMethods.includes(req.method)) {
    return sendError(res, `Method ${req.method} not allowed`, 405);
  }
  return null;
}

/**
 * Check if request body is valid JSON
 */
export function validateRequestBody(req, res) {
  if (req.method === "POST" || req.method === "PUT") {
    if (!req.body || typeof req.body !== "object") {
      return sendError(res, "Invalid request body", 400);
    }
  }
  return null;
}
