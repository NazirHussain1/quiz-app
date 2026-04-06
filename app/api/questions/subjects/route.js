import { NextResponse } from 'next/server';
import { withErrorHandling } from '@/app/lib/errorHandler';
import { logError } from '@/app/lib/logger';
import { getSubjects } from '@/app/services/questionService';

export const GET = withErrorHandling(async (request) => {
  try {
    const result = await getSubjects();
    
    if (!result.subjects || result.subjects.length === 0) {
      return NextResponse.json({ 
        success: true, 
        subjects: [],
        message: 'No subjects found. Please seed the database first.'
      });
    }
    
    const limitedSubjects = result.subjects.slice(0, 10);
    
    return NextResponse.json({ 
      success: true, 
      subjects: limitedSubjects 
    });
  } catch (error) {
    logError(error, {
      route: '/api/questions/subjects',
    });
    
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Failed to fetch subjects',
        suggestion: 'Make sure MongoDB is connected and database is seeded. Run: npm run db:seed',
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    );
  }
});
