import { NextResponse } from 'next/server';
import { seedQuestions } from '@/app/lib/seed/seedDatabase';

export async function POST() {
  try {
    const result = await seedQuestions();
    
    if (result) {
      return NextResponse.json({ 
        success: true, 
        message: `${result.insertedCount} questions seeded successfully` 
      });
    } else {
      return NextResponse.json({ 
        success: true, 
        message: 'Database already seeded' 
      });
    }
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
