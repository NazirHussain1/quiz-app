import { NextResponse } from 'next/server';
import { getSubjects } from '@/app/lib/models/Question';
import { withErrorHandling } from '@/app/lib/errorHandler';
import { logError } from '@/app/lib/logger';

export const GET = withErrorHandling(async (request) => {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    
    const subjects = await getSubjects(category);
    
    // If no subjects found, return empty array instead of error
    if (!subjects || subjects.length === 0) {
      return NextResponse.json({ 
        success: true, 
        subjects: [],
        message: 'No subjects found. Please seed the database first.'
      });
    }
    
    const limitedSubjects = subjects.slice(0, 10);
    
    return NextResponse.json({ 
      success: true, 
      subjects: limitedSubjects 
    });
  } catch (error) {
    logError(error, {
      route: '/api/questions/subjects',
      category,
    });
    
    // Return more helpful error message
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
