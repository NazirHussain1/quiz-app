import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/app/lib/database/connection';
import { ObjectId } from 'mongodb';
import { requireAdmin } from '@/app/lib/middleware';
import {
  validateSubject,
  validateDifficulty,
  validateCategory,
  validateQuestion,
  validateOptions,
  validateCorrectAnswer,
  validateObjectId,
  sanitizeString
} from '@/app/lib/validation';
import { rateLimitApi } from '@/app/lib/rateLimit';
import { invalidateCache, CACHE_KEYS } from '@/app/lib/cache';

export const dynamic = 'force-dynamic';

export const GET = requireAdmin(async (request) => {
  try {
    const rateLimit = rateLimitApi(request);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { success: false, error: "Too many requests. Please try again later." },
        { status: 429 }
      );
    }

    const { searchParams } = new URL(request.url);
    
    const category = sanitizeString(searchParams.get('category') || '');
    const subject = sanitizeString(searchParams.get('subject') || '');
    const difficulty = sanitizeString(searchParams.get('difficulty') || '');
    const search = sanitizeString(searchParams.get('search') || '');
    
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '20')));
    
    const { db } = await connectToDatabase();
    const collection = db.collection('questions');
    
    const filter = {};
    
    if (category && category !== 'all') {
      filter.category = category;
    }
    
    if (subject && subject !== 'all') {
      const subjectValidation = validateSubject(subject);
      if (subjectValidation.valid) {
        filter.subject = subjectValidation.value;
      }
    }
    
    if (difficulty && difficulty !== 'all') {
      const difficultyValidation = validateDifficulty(difficulty);
      if (difficultyValidation.valid) {
        filter.difficulty = difficultyValidation.value;
      }
    }
    
    if (search) {
      filter.question = { $regex: search, $options: 'i' };
    }
    
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
    console.error('GET questions error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch questions' },
      { status: 500 }
    );
  }
});

export const POST = requireAdmin(async (request) => {
  try {
    const rateLimit = rateLimitApi(request);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { success: false, error: "Too many requests. Please try again later." },
        { status: 429 }
      );
    }

    const body = await request.json();
    
    const categoryValidation = validateCategory(body.category);
    if (!categoryValidation.valid) {
      return NextResponse.json(
        { success: false, error: categoryValidation.error },
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
    
    const difficultyValidation = validateDifficulty(body.difficulty || 'medium');
    if (!difficultyValidation.valid) {
      return NextResponse.json(
        { success: false, error: difficultyValidation.error },
        { status: 400 }
      );
    }
    
    const questionValidation = validateQuestion(body.question);
    if (!questionValidation.valid) {
      return NextResponse.json(
        { success: false, error: questionValidation.error },
        { status: 400 }
      );
    }
    
    const optionsValidation = validateOptions(body.options);
    if (!optionsValidation.valid) {
      return NextResponse.json(
        { success: false, error: optionsValidation.error },
        { status: 400 }
      );
    }
    
    const correctAnswerValidation = validateCorrectAnswer(
      body.correctAnswer, 
      optionsValidation.value
    );
    if (!correctAnswerValidation.valid) {
      return NextResponse.json(
        { success: false, error: correctAnswerValidation.error },
        { status: 400 }
      );
    }
    
    const { db } = await connectToDatabase();
    const collection = db.collection('questions');
    
    const existingQuestion = await collection.findOne({ 
      question: questionValidation.value
    });
    
    if (existingQuestion) {
      return NextResponse.json(
        { success: false, error: 'A question with this exact text already exists' },
        { status: 409 }
      );
    }
    
    const result = await collection.insertOne({
      category: categoryValidation.value,
      subject: subjectValidation.value,
      topic: body.topic ? sanitizeString(body.topic) : '',
      difficulty: difficultyValidation.value,
      question: questionValidation.value,
      options: optionsValidation.value,
      correctAnswer: correctAnswerValidation.value,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    // Invalidate questions cache
    await invalidateCache(CACHE_KEYS.QUESTIONS);
    console.log('🗑️  Questions cache invalidated');
    
    return NextResponse.json({ 
      success: true, 
      questionId: result.insertedId.toString(),
      message: 'Question added successfully'
    }, { status: 201 });
  } catch (error) {
    console.error('POST question error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to add question' },
      { status: 500 }
    );
  }
});

export const PUT = requireAdmin(async (request) => {
  try {
    const rateLimit = rateLimitApi(request);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { success: false, error: "Too many requests. Please try again later." },
        { status: 429 }
      );
    }

    const body = await request.json();
    
    const idValidation = validateObjectId(body._id);
    if (!idValidation.valid) {
      return NextResponse.json(
        { success: false, error: idValidation.error },
        { status: 400 }
      );
    }
    
    const updateFields = { updatedAt: new Date() };
    
    if (body.category) {
      const categoryValidation = validateCategory(body.category);
      if (!categoryValidation.valid) {
        return NextResponse.json(
          { success: false, error: categoryValidation.error },
          { status: 400 }
        );
      }
      updateFields.category = categoryValidation.value;
    }
    
    if (body.subject) {
      const subjectValidation = validateSubject(body.subject);
      if (!subjectValidation.valid) {
        return NextResponse.json(
          { success: false, error: subjectValidation.error },
          { status: 400 }
        );
      }
      updateFields.subject = subjectValidation.value;
    }
    
    if (body.difficulty) {
      const difficultyValidation = validateDifficulty(body.difficulty);
      if (!difficultyValidation.valid) {
        return NextResponse.json(
          { success: false, error: difficultyValidation.error },
          { status: 400 }
        );
      }
      updateFields.difficulty = difficultyValidation.value;
    }
    
    if (body.question) {
      const questionValidation = validateQuestion(body.question);
      if (!questionValidation.valid) {
        return NextResponse.json(
          { success: false, error: questionValidation.error },
          { status: 400 }
        );
      }
      updateFields.question = questionValidation.value;
    }
    
    if (body.options) {
      const optionsValidation = validateOptions(body.options);
      if (!optionsValidation.valid) {
        return NextResponse.json(
          { success: false, error: optionsValidation.error },
          { status: 400 }
        );
      }
      updateFields.options = optionsValidation.value;
      
      if (body.correctAnswer) {
        const correctAnswerValidation = validateCorrectAnswer(
          body.correctAnswer,
          optionsValidation.value
        );
        if (!correctAnswerValidation.valid) {
          return NextResponse.json(
            { success: false, error: correctAnswerValidation.error },
            { status: 400 }
          );
        }
        updateFields.correctAnswer = correctAnswerValidation.value;
      }
    }
    
    if (body.topic) {
      updateFields.topic = sanitizeString(body.topic);
    }
    
    const { db } = await connectToDatabase();
    const collection = db.collection('questions');
    
    if (updateFields.question) {
      const existingQuestion = await collection.findOne({ 
        question: updateFields.question,
        _id: { $ne: new ObjectId(idValidation.value) }
      });
      
      if (existingQuestion) {
        return NextResponse.json(
          { success: false, error: 'A question with this exact text already exists' },
          { status: 409 }
        );
      }
    }
    
    const result = await collection.updateOne(
      { _id: new ObjectId(idValidation.value) },
      { $set: updateFields }
    );
    
    if (result.matchedCount === 0) {
      return NextResponse.json(
        { success: false, error: 'Question not found' },
        { status: 404 }
      );
    }
    
    // Invalidate questions cache
    await invalidateCache(CACHE_KEYS.QUESTIONS);
    console.log('🗑️  Questions cache invalidated');
    
    return NextResponse.json({ 
      success: true, 
      message: 'Question updated successfully'
    });
  } catch (error) {
    console.error('PUT question error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update question' },
      { status: 500 }
    );
  }
});

export const DELETE = requireAdmin(async (request) => {
  try {
    const rateLimit = rateLimitApi(request);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { success: false, error: "Too many requests. Please try again later." },
        { status: 429 }
      );
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    const idValidation = validateObjectId(id);
    if (!idValidation.valid) {
      return NextResponse.json(
        { success: false, error: idValidation.error },
        { status: 400 }
      );
    }
    
    const { db } = await connectToDatabase();
    const collection = db.collection('questions');
    
    const result = await collection.deleteOne({ 
      _id: new ObjectId(idValidation.value) 
    });
    
    if (result.deletedCount === 0) {
      return NextResponse.json(
        { success: false, error: 'Question not found' },
        { status: 404 }
      );
    }
    
    // Invalidate questions cache
    await invalidateCache(CACHE_KEYS.QUESTIONS);
    console.log('🗑️  Questions cache invalidated');
    
    return NextResponse.json({ 
      success: true, 
      message: 'Question deleted successfully'
    });
  } catch (error) {
    console.error('DELETE question error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete question' },
      { status: 500 }
    );
  }
});
