import { NextResponse } from 'next/server';
import { getSubjects } from '@/app/lib/models/Question';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    
    const subjects = await getSubjects(category);
    const limitedSubjects = subjects.slice(0, 10);
    
    return NextResponse.json({ 
      success: true, 
      subjects: limitedSubjects 
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
