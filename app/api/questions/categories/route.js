import { NextResponse } from 'next/server';
import { withErrorHandling } from '@/app/lib/errorHandler';
import { logError } from '@/app/lib/logger';
import { getCategories } from '@/app/services/questionService';

export const GET = withErrorHandling(async (request) => {
  try {
    const result = await getCategories();
    
    if (!result.categories || result.categories.length === 0) {
      return NextResponse.json({ 
        success: true, 
        categories: [],
        message: 'No categories found. Please seed the database first.'
      });
    }
    
    const limitedCategories = result.categories.slice(0, 10);
    
    return NextResponse.json({ 
      success: true, 
      categories: limitedCategories 
    });
  } catch (error) {
    logError(error, {
      route: '/api/questions/categories',
    });
    
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Failed to fetch categories',
        suggestion: 'Make sure MongoDB is connected and database is seeded. Run: npm run db:seed',
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    );
  }
});
