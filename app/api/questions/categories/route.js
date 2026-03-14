import { NextResponse } from 'next/server';
import { getCategories } from '@/app/lib/models/Question';

export async function GET() {
  try {
    const categories = await getCategories();
    
    return NextResponse.json({ 
      success: true, 
      categories 
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
