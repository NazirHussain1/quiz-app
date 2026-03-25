import { NextResponse } from 'next/server';
import { getCategories } from '@/app/lib/models/Question';

export async function GET() {
  try {
    const categories = await getCategories();
    const limitedCategories = categories.slice(0, 10);
    
    return NextResponse.json({ 
      success: true, 
      categories: limitedCategories 
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
