import { NextResponse } from 'next/server';
import { withErrorHandler } from '@/app/lib/middleware/errorHandler';
import { getCategories } from '@/app/services/questionService';

export const GET = withErrorHandler(async () => {
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
});
