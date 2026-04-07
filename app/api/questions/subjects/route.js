import { NextResponse } from 'next/server';
import { withErrorHandler } from '@/app/lib/middleware/errorHandler';
import { getSubjects } from '@/app/services/questionService';

export const GET = withErrorHandler(async (request) => {
  const { searchParams } = new URL(request.url);
  const result = await getSubjects({
    category: searchParams.get('category'),
  });
  
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
});
