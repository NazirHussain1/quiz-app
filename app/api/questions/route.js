import { NextResponse } from 'next/server';
import { getQuestions, getRandomQuestions, createQuestion } from '@/app/lib/models/Question';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const subject = searchParams.get('subject');
    const difficulty = searchParams.get('difficulty');
    const random = searchParams.get('random');
    const limit = parseInt(searchParams.get('limit') || '10');
    
    const filters = {};
    if (category) filters.category = category;
    if (subject) filters.subject = subject;
    if (difficulty) filters.difficulty = difficulty;
    
    let questions;
    if (random === 'true') {
      questions = await getRandomQuestions(filters, limit);
    } else {
      questions = await getQuestions(filters);
    }
    
    return NextResponse.json({ 
      success: true, 
      count: questions.length,
      questions 
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    
    if (!body.category || !body.subject || !body.question || !body.options || !body.correctAnswer) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    const result = await createQuestion(body);
    
    return NextResponse.json({ 
      success: true, 
      questionId: result.insertedId 
    }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
