import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/app/lib/mongodb';
import { validateSubject } from '@/app/lib/models/Question';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const subject = searchParams.get('subject');
    const difficulty = searchParams.get('difficulty');
    const search = searchParams.get('search');
    const limit = parseInt(searchParams.get('limit') || '10');
    
    const { db } = await connectToDatabase();
    const collection = db.collection('questions');
    
    const matchStage = {};
    if (category) matchStage.category = category;
    if (subject) matchStage.subject = subject;
    if (difficulty) matchStage.difficulty = difficulty;
    
    // Add keyword search for question text
    if (search && search.trim()) {
      matchStage.question = { $regex: search.trim(), $options: 'i' };
    }
    
    const pipeline = [];
    
    if (Object.keys(matchStage).length > 0) {
      pipeline.push({ $match: matchStage });
    }
    
    pipeline.push({ $sample: { size: limit } });
    
    const questions = await collection.aggregate(pipeline).toArray();
    
    return NextResponse.json({ 
      success: true, 
      count: questions.length,
      questions 
    }, {
      headers: {
        'Cache-Control': 'no-store, max-age=0',
      }
    });
  } catch (error) {
    console.error('Error fetching questions:', error);
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
    
    const subjectValidation = validateSubject(body.subject);
    if (!subjectValidation.valid) {
      return NextResponse.json(
        { success: false, error: subjectValidation.error },
        { status: 400 }
      );
    }
    
    const { db } = await connectToDatabase();
    const collection = db.collection('questions');
    
    const result = await collection.insertOne({
      category: body.category,
      subject: body.subject,
      topic: body.topic || '',
      difficulty: body.difficulty || 'medium',
      question: body.question,
      options: body.options,
      correctAnswer: body.correctAnswer,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    return NextResponse.json({ 
      success: true, 
      questionId: result.insertedId 
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating question:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
