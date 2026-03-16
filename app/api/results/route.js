import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/app/lib/mongodb';

export const dynamic = 'force-dynamic';

export async function POST(request) {
  try {
    const body = await request.json();
    
    if (!body.name || body.score === undefined || !body.totalQuestions) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: name, score, totalQuestions' },
        { status: 400 }
      );
    }
    
    const { db } = await connectToDatabase();
    const collection = db.collection('results');
    
    const result = await collection.insertOne({
      name: body.name,
      category: body.category || 'General',
      subject: body.subject || 'General',
      score: body.score,
      totalQuestions: body.totalQuestions,
      difficulty: body.difficulty || 'medium',
      timeTaken: body.timeTaken || null,
      examMode: body.examMode || false,
      createdAt: new Date()
    });
    
    return NextResponse.json({ 
      success: true, 
      resultId: result.insertedId 
    }, { status: 201 });
  } catch (error) {
    console.error('Error storing result:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const category = searchParams.get('category');
    const subject = searchParams.get('subject');
    const difficulty = searchParams.get('difficulty');
    
    const { db } = await connectToDatabase();
    const collection = db.collection('results');
    
    const filter = {};
    if (category) filter.category = category;
    if (subject) filter.subject = subject;
    if (difficulty) filter.difficulty = difficulty;
    
    const results = await collection
      .find(filter)
      .sort({ score: -1, createdAt: -1 })
      .limit(limit)
      .toArray();
    
    return NextResponse.json({ 
      success: true, 
      count: results.length,
      results 
    }, {
      headers: {
        'Cache-Control': 'no-store, max-age=0',
      }
    });
  } catch (error) {
    console.error('Error fetching results:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
