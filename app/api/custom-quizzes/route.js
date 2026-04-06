import { NextResponse } from 'next/server';
import { requireAuth } from '@/app/lib/middleware';
import { rateLimitApi } from '@/app/lib/rateLimit';
import { withErrorHandling, AppError } from '@/app/lib/errorHandler';
import { getUserQuizzes, createCustomQuiz, deleteCustomQuiz } from '@/app/services/customQuizService';

export const dynamic = 'force-dynamic';

export const GET = requireAuth(withErrorHandling(async (request) => {
  // Rate limiting
  const rateLimit = rateLimitApi(request);
  if (!rateLimit.allowed) {
    throw new AppError('Too many requests. Please try again later.', 429);
  }

  const user = request.user;
  const result = await getUserQuizzes(user.userId);
  
  return NextResponse.json(result);
}));

export const POST = requireAuth(withErrorHandling(async (request) => {
  // Rate limiting
  const rateLimit = rateLimitApi(request);
  if (!rateLimit.allowed) {
    throw new AppError('Too many requests. Please try again later.', 429);
  }

  const user = request.user;
  const body = await request.json();
  
  const result = await createCustomQuiz(user.userId, user.userName, body);
  
  return NextResponse.json(result, { status: 201 });
}));

export const DELETE = requireAuth(withErrorHandling(async (request) => {
  // Rate limiting
  const rateLimit = rateLimitApi(request);
  if (!rateLimit.allowed) {
    throw new AppError('Too many requests. Please try again later.', 429);
  }

  const user = request.user;
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  
  const result = await deleteCustomQuiz(id, user.userId);
  
  return NextResponse.json(result);
}));
