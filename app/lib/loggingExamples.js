/**
 * LOGGING SYSTEM EXAMPLES
 * 
 * This file contains examples of how to use the centralized logging system.
 * DO NOT import this file in production code - it's for reference only.
 */

import {
  logAPI,
  logAuth,
  logError,
  logWarning,
  logInfo,
  logDebug,
  logDB,
  logEmail,
  logSecurity,
} from './logger.js';

import {
  withErrorHandling,
  asyncHandler,
  AppError,
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  RateLimitError,
  DatabaseError,
  successResponse,
  errorResponse,
} from './errorHandler.js';

// ============================================================================
// EXAMPLE 1: Basic API Route with Logging and Error Handling
// ============================================================================

export const GET_Example1 = withErrorHandling(async (request) => {
  // Your API logic here
  const data = { message: 'Hello World' };
  
  // Log info
  logInfo('API endpoint called', { endpoint: '/api/example' });
  
  return successResponse(data);
});

// ============================================================================
// EXAMPLE 2: Authentication Logging
// ============================================================================

export const POST_Login_Example = withErrorHandling(async (request) => {
  const { email, password } = await request.json();
  
  // Validate credentials
  const user = await validateUser(email, password);
  
  if (!user) {
    // Log failed login
    logAuth('login_failed', null, email, false, {
      reason: 'invalid_credentials',
    });
    throw new AuthenticationError('Invalid credentials');
  }
  
  // Log successful login
  logAuth('login_success', user.id, user.email, true, {
    role: user.role,
  });
  
  return successResponse({ user });
});

// ============================================================================
// EXAMPLE 3: Database Operation Logging
// ============================================================================

export const GET_Users_Example = withErrorHandling(async (request) => {
  const startTime = Date.now();
  
  try {
    const { db } = await connectToDatabase();
    const users = await db.collection('users').find({}).toArray();
    
    const duration = Date.now() - startTime;
    
    // Log successful database operation
    logDB('find', 'users', true, duration, {
      count: users.length,
    });
    
    return successResponse(users);
  } catch (error) {
    const duration = Date.now() - startTime;
    
    // Log failed database operation
    logDB('find', 'users', false, duration, {
      error: error.message,
    });
    
    throw new DatabaseError('Failed to fetch users');
  }
});

// ============================================================================
// EXAMPLE 4: Email Logging
// ============================================================================

export const POST_SendEmail_Example = withErrorHandling(async (request) => {
  const { to, subject, body } = await request.json();
  
  try {
    await sendEmail(to, subject, body);
    
    // Log successful email
    logEmail('notification', to, true, {
      subject,
    });
    
    return successResponse({ message: 'Email sent' });
  } catch (error) {
    // Log failed email
    logEmail('notification', to, false, {
      subject,
      error: error.message,
    });
    
    throw new AppError('Failed to send email', 500);
  }
});

// ============================================================================
// EXAMPLE 5: Security Event Logging
// ============================================================================

export const POST_AdminAction_Example = withErrorHandling(async (request) => {
  const user = await getCurrentUser(request);
  
  if (!user.isAdmin) {
    // Log security event
    logSecurity('unauthorized_admin_access', 'high', {
      userId: user.id,
      email: user.email,
      ip: request.headers.get('x-forwarded-for'),
    });
    
    throw new AuthorizationError('Admin access required');
  }
  
  // Perform admin action
  await performAdminAction();
  
  // Log admin action
  logSecurity('admin_action_performed', 'medium', {
    userId: user.id,
    action: 'delete_user',
  });
  
  return successResponse({ message: 'Action completed' });
});

// ============================================================================
// EXAMPLE 6: Error Logging with Context
// ============================================================================

export const POST_ComplexOperation_Example = withErrorHandling(async (request) => {
  try {
    const data = await request.json();
    
    // Complex operation that might fail
    const result = await performComplexOperation(data);
    
    return successResponse(result);
  } catch (error) {
    // Log error with context
    logError(error, {
      operation: 'complex_operation',
      input: data,
      timestamp: new Date().toISOString(),
    });
    
    throw error; // Re-throw to be handled by error handler
  }
});

// ============================================================================
// EXAMPLE 7: Warning Logging
// ============================================================================

export const GET_DeprecatedEndpoint_Example = withErrorHandling(async (request) => {
  // Log warning for deprecated endpoint
  logWarning('Deprecated endpoint accessed', {
    endpoint: '/api/old-endpoint',
    userAgent: request.headers.get('user-agent'),
    message: 'This endpoint will be removed in v2.0',
  });
  
  const data = await getOldData();
  
  return successResponse(data, 200, 'This endpoint is deprecated');
});

// ============================================================================
// EXAMPLE 8: Debug Logging (Development Only)
// ============================================================================

export const POST_Debug_Example = withErrorHandling(async (request) => {
  const data = await request.json();
  
  // Debug logs only appear in development
  logDebug('Processing request', {
    data,
    headers: Object.fromEntries(request.headers),
    url: request.url,
  });
  
  const result = await processData(data);
  
  logDebug('Request processed', {
    result,
    duration: '123ms',
  });
  
  return successResponse(result);
});

// ============================================================================
// EXAMPLE 9: Custom Error Classes
// ============================================================================

export const POST_Validation_Example = withErrorHandling(async (request) => {
  const data = await request.json();
  
  // Validate input
  if (!data.email) {
    throw new ValidationError('Email is required', [
      { field: 'email', message: 'Email is required' },
    ]);
  }
  
  if (!data.password || data.password.length < 8) {
    throw new ValidationError('Invalid password', [
      { field: 'password', message: 'Password must be at least 8 characters' },
    ]);
  }
  
  return successResponse({ message: 'Validation passed' });
});

// ============================================================================
// EXAMPLE 10: Rate Limiting with Logging
// ============================================================================

export const POST_RateLimit_Example = withErrorHandling(async (request) => {
  const rateLimit = checkRateLimit(request);
  
  if (!rateLimit.allowed) {
    // Log rate limit exceeded
    logSecurity('rate_limit_exceeded', 'medium', {
      ip: request.headers.get('x-forwarded-for'),
      endpoint: '/api/example',
    });
    
    throw new RateLimitError('Too many requests');
  }
  
  return successResponse({ message: 'Request processed' });
});

// ============================================================================
// LOG LEVELS
// ============================================================================

/**
 * LOG LEVELS (in order of severity):
 * 
 * 1. error   - Critical errors that need immediate attention
 * 2. warn    - Warning messages for potentially harmful situations
 * 3. info    - Informational messages about application flow
 * 4. http    - HTTP request/response logging
 * 5. debug   - Detailed debugging information (dev only)
 * 
 * In production:
 * - Console: info and above
 * - Files: All levels in separate files
 * 
 * In development:
 * - Console: debug and above (colorized)
 * - Files: None
 */

// ============================================================================
// LOG STORAGE
// ============================================================================

/**
 * PRODUCTION LOG FILES:
 * 
 * logs/error-YYYY-MM-DD.log      - Error logs only
 * logs/combined-YYYY-MM-DD.log   - All logs
 * logs/api-YYYY-MM-DD.log        - HTTP request logs
 * 
 * ROTATION:
 * - Daily rotation
 * - Max file size: 20MB
 * - Retention: 14 days (error/combined), 7 days (api)
 * 
 * DEVELOPMENT:
 * - Console only (colorized, formatted)
 * - No file logging
 */

// ============================================================================
// STRUCTURED LOGGING
// ============================================================================

/**
 * All logs are structured as JSON with:
 * - timestamp: ISO 8601 format
 * - level: Log level (error, warn, info, etc.)
 * - message: Human-readable message
 * - metadata: Additional context (object)
 * - stack: Error stack trace (for errors)
 * 
 * Example log entry:
 * {
 *   "timestamp": "2024-01-15 10:30:45",
 *   "level": "info",
 *   "message": "Auth Event",
 *   "event": "login_success",
 *   "userId": "123",
 *   "email": "user@example.com",
 *   "success": true,
 *   "role": "student"
 * }
 */
