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

export function errorResponse(message, statusCode = 400) {
  return {
    success: false,
    error: message,
    statusCode
  };
}

export function sendSuccess(res, data = null, message = null, statusCode = 200) {
  return res.status(statusCode).json(successResponse(data, message));
}

export function sendError(res, message, statusCode = 400) {
  return res.status(statusCode).json(errorResponse(message, statusCode));
}

export function handleApiError(res, error, context = "Operation") {
  const isDevelopment = process.env.NODE_ENV === "development";
  const message = isDevelopment 
    ? error.message 
    : `${context} failed. Please try again.`;
  
  return sendError(res, message, 500);
}

export function validateMethod(req, res, allowedMethods) {
  if (!allowedMethods.includes(req.method)) {
    return sendError(res, `Method ${req.method} not allowed`, 405);
  }
  return null;
}

export function validateRequestBody(req, res) {
  if (req.method === "POST" || req.method === "PUT") {
    if (!req.body || typeof req.body !== "object") {
      return sendError(res, "Invalid request body", 400);
    }
  }
  return null;
}
