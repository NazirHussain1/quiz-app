import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/app/lib/mongodb';
import { ObjectId } from 'mongodb';
import { requireAdmin } from '@/app/lib/authMiddleware';
import { validateSubject } from '@/app/lib/models/Question';

export const dynamic = 'force-dynamic';

export const GET = requireAdmin(async (request) => {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const subject = searchParams.get('subject');
    const difficulty = searchParams.get('difficulty');
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    
    const { db } = await connectToDatabase();
    const collection = db.collection('questions');
    
    const filter = {};
    if (category && category !== 'all') filter.category = category;
    if (subject && subject !== 'all') filter.subject = subject;
    if (difficulty && difficulty !== 'all') filter.difficulty = difficulty;
    
    // Add keyword search for question text
    if (search && search.trim()) {
      filter.question = { $regex: search.trim(), $options: 'i' };
    }
    
    // Get total count for pagination
    const totalCount = await collection.countDocuments(filter);
    const totalPages = Math.ceil(totalCount / limit);
    const skip = (page - 1) * limit;
    
    const questions = await collection
      .find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .toArray();
    
    return NextResponse.json({ 
      success: true, 
      count: questions.length,
      totalCount,
      totalPages,
      currentPage: page,
      questions 
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
});

export const POST = requireAdmin(async (request) => {
  try {
    const body = await request.json();
    
    if (!body.category || !body.subject || !body.question || !body.options || !body.correctAnswer) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: category, subject, question, options, and correctAnswer are required' },
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
    
    if (!Array.isArray(body.options) || body.options.length !== 4) {
      return NextResponse.json(
        { success: false, error: 'Question must have exactly 4 options' },
        { status: 400 }
      );
    }
    
    // Validate all options are non-empty strings
    if (body.options.some(opt => !opt || typeof opt !== 'string' || opt.trim() === '')) {
      return NextResponse.json(
        { success: false, error: 'All options must be non-empty strings' },
        { status: 400 }
      );
    }
    
    if (!body.options.includes(body.correctAnswer)) {
      return NextResponse.json(
        { success: false, error: 'Correct answer must exactly match one of the 4 options' },
        { status: 400 }
      );
    }
    
    const { db } = await connectToDatabase();
    const collection = db.collection('questions');
    
    // Check for duplicate question
    const existingQuestion = await collection.findOne({ 
      question: body.question.trim() 
    });
    
    if (existingQuestion) {
      return NextResponse.json(
        { success: false, error: 'A question with this exact text already exists' },
        { status: 409 }
      );
    }
    
    const result = await collection.insertOne({
      category: body.category,
      subject: body.subject,
      topic: body.topic || '',
      difficulty: body.difficulty || 'medium',
      question: body.question.trim(),
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
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
});

export const PUT = requireAdmin(async (request) => {
  try {
    const body = await request.json();
    
    if (!body._id) {
      return NextResponse.json(
        { success: false, error: 'Question ID is required' },
        { status: 400 }
      );
    }
    
    if (body.subject) {
      const subjectValidation = validateSubject(body.subject);
      if (!subjectValidation.valid) {
        return NextResponse.json(
          { success: false, error: subjectValidation.error },
          { status: 400 }
        );
      }
    }
    
    if (body.options) {
      if (!Array.isArray(body.options) || body.options.length !== 4) {
        return NextResponse.json(
          { success: false, error: 'Question must have exactly 4 options' },
          { status: 400 }
        );
      }
      
      // Validate all options are non-empty strings
      if (body.options.some(opt => !opt || typeof opt !== 'string' || opt.trim() === '')) {
        return NextResponse.json(
          { success: false, error: 'All options must be non-empty strings' },
          { status: 400 }
        );
      }
    }
    
    if (body.options && body.correctAnswer && !body.options.includes(body.correctAnswer)) {
      return NextResponse.json(
        { success: false, error: 'Correct answer must exactly match one of the 4 options' },
        { status: 400 }
      );
    }
    
    const { db } = await connectToDatabase();
    const collection = db.collection('questions');
    
    // Check for duplicate question if question text is being updated
    if (body.question) {
      const existingQuestion = await collection.findOne({ 
        question: body.question.trim(),
        _id: { $ne: new ObjectId(body._id) }
      });
      
      if (existingQuestion) {
        return NextResponse.json(
          { success: false, error: 'A question with this exact text already exists' },
          { status: 409 }
        );
      }
    }
    
    const { _id, ...updateData } = body;
    if (updateData.question) {
      updateData.question = updateData.question.trim();
    }
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
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
});

export const DELETE = requireAdmin(async (request) => {
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
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
});
