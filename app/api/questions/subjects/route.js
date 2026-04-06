import { success } from '@/app/lib/responses';
import { withErrorHandler } from '@/app/lib/middleware/errorHandler';
import { getSubjects } from '@/app/services/questionService';

export const GET = withErrorHandler(async () => {
  const result = await getSubjects();
  
  if (!result.subjects || result.subjects.length === 0) {
    return success(
      { subjects: [] },
      'No subjects found. Please seed the database first.'
    );
  }
  
  const limitedSubjects = result.subjects.slice(0, 10);
  
  return success({ subjects: limitedSubjects });
});
