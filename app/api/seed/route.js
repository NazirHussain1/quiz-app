import { success } from '@/app/lib/responses';
import { withErrorHandler } from '@/app/lib/middleware/errorHandler';
import { seedQuestions } from '@/app/lib/seed/seedDatabase';

export const POST = withErrorHandler(async () => {
  const result = await seedQuestions();
  
  if (result) {
    return success(
      { insertedCount: result.insertedCount },
      `${result.insertedCount} questions seeded successfully`
    );
  }
  
  return success(null, 'Database already seeded');
});
