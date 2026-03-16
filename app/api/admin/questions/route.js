import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/app/lib/mongodb';
import { ObjectId } from 'mongodb';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const subject = searchParams.get('subject');
    const difficulty = searchParams.get('difficulty');
    
    const { db } = await connectToDatabase();
    const collection = db.collection('questions');
    
    const filter = {};
    if (category && category !== 'all') filter.category = category;
    if (subject && subject !== 'all') filter.subject = subject;
    if (difficulty && difficulty !== 'all') filter.difficulty = difficulty;
    
    const questions = await collection
      .find(filter)
      .sort({ createdAt: -1 })
      .toArray();
    
    return NextResponse.json({ 
      success: true, 
      count: questions.length,
      questions 
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
    
    if (!Array.isArray(body.options) || body.options.length !== 4) {
      return NextResponse.json(
        { success: false, error: 'Options must be an array of 4 items' },
        { status: 400 }
      );
    }
    
    if (!body.options.includes(body.correctAnswer)) {
      return NextResponse.json(
        { success: false, error: 'Correct answer must be one of the options' },
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
      questionId: result.insertedId,
      message: 'Question added successfully'
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating question:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function PUT(request) {
  try {
    const body = await request.json();
    
    if (!body._id) {
      return NextResponse.json(
        { success: false, error: 'Question ID is required' },
        { status: 400 }
      );
    }
    
    if (body.options && (!Array.isArray(body.options) || body.options.length !== 4)) {
      return NextResponse.json(
        { success: false, error: 'Options must be an array of 4 items' },
        { status: 400 }
      );
    }
    
    if (body.options && body.correctAnswer && !body.options.includes(body.correctAnswer)) {
      return NextResponse.json(
        { success: false, error: 'Correct answer must be one of the options' },
        { status: 400 }
      );
    }
    
    const { db } = await connectToDatabase();
    const collection = db.collection('questions');
    
    const { _id, ...updateData } = body;
    updateData.updatedAt = new Date();
    
    const result = await collection.updateOne(
      { _id: new ObjectId(_id) },
      { $set: updateData }
    );
    
    if (result.matchedCount === 0) {
      return NextResponse.json(
        { success: false, error: 'Question not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ 
      success: true,
      message: 'Question updated successfully'
    });
  } catch (error) {
    console.error('Error updating question:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Question ID is required' },
        { status: 400 }
      );
    }
    
    const { db } = await connectToDatabase();
    const collection = db.collection('questions');
    
    const result = await collection.deleteOne({ _id: new ObjectId(id) });
    
    if (result.deletedCount === 0) {
      return NextResponse.json(
        { success: false, error: 'Question not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ 
      success: true,
      message: 'Question deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting question:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
