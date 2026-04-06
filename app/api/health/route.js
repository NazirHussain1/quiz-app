import { success, serverError } from '@/app/lib/responses';
import { withErrorHandler } from '@/app/lib/middleware/errorHandler';
import { connectToDatabase } from '@/app/lib/database/connection';
import { logInfo, logDB } from '@/app/lib/logger';

/**
 * Health Check Endpoint
 * Tests database connectivity and logs system health
 */
export const GET = withErrorHandler(async () => {
  const startTime = Date.now();
  
  try {
    const { db } = await connectToDatabase();
    await db.admin().ping();
    
    const duration = Date.now() - startTime;
    
    logDB('ping', 'admin', true, duration, {
      status: 'healthy',
    });
    
    logInfo('Health check passed', {
      database: 'connected',
      uptime: process.uptime(),
      memory: process.memoryUsage(),
    });
    
    return success({
      status: 'healthy',
      database: 'connected',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    const duration = Date.now() - startTime;
    
    logDB('ping', 'admin', false, duration, {
      status: 'unhealthy',
      error: error.message,
    });
    
    return serverError('Database connection failed', {
      status: 'unhealthy',
      database: 'disconnected',
      error: error.message,
    });
  }
});
