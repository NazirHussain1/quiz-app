import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/app/lib/database/connection';
import { logInfo, logDB } from '@/app/lib/logger';
import { withErrorHandling, successResponse } from '@/app/lib/errorHandler';

/**
 * Health Check Endpoint
 * Tests database connectivity and logs system health
 */
export const GET = withErrorHandling(async () => {
  const startTime = Date.now();
  
  // Test database connection
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
    
    return successResponse({
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
    
    return NextResponse.json({
      success: false,
      status: 'unhealthy',
      database: 'disconnected',
      error: error.message,
    }, { status: 503 });
  }
});
