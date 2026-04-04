import { NextResponse } from 'next/server';
import { getCategories } from '@/app/lib/models/Question';
import { withErrorHandling } from '@/app/lib/errorHandler';
import { logError } from '@/app/lib/logger';

export const GET = withErrorHandling(async (request) => {
  try {
    const categories = await getCategories();
    
    // If no categories found, return empty array instead of error
    if (!categories || categories.length === 0) {
      return NextResponse.json({ 
        success: true, 
        categories: [],
        message: 'No categories found. Please seed the database first.'
      });
    }
    
    const limitedCategories = categories.slice(0, 10);
    
    return NextResponse.json({ 
      success: true, 
      categories: limitedCategories 
    });
  } catch (error) {
    logError(error, {
      route: '/api/questions/categories',
    });
    
    // Return more helpful error message
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
