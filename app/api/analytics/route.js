import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/app/lib/mongodb';
import { requireAuth } from '@/app/lib/authMiddleware';
import { rateLimitApi } from '@/app/lib/rateLimit';

export const dynamic = 'force-dynamic';

export const GET = requireAuth(async (request) => {
  try {
    // Rate limiting
    const rateLimit = rateLimitApi(request);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { success: false, error: "Too many requests. Please try again later." },
        { status: 429 }
      );
    }

    const user = request.user;

    const { db } = await connectToDatabase();
    const collection = db.collection('results');
    
    const userResults = await collection
      .find({ name: user.userName })
      .sort({ createdAt: 1 })
      .toArray();
    
    if (userResults.length === 0) {
      return NextResponse.json({
        success: true,
        analytics: {
          totalQuizzes: 0,
          averageScore: 0,
          accuracyPercentage: 0,
          averageTimePerQuestion: 0,
          byCategory: {},
          bySubject: {},
          byDifficulty: {},
          scoreHistory: [],
          weakAreas: [],
          strongAreas: []
        }
      });
    }
    
    const totalQuizzes = userResults.length;
    const totalScore = userResults.reduce((sum, r) => sum + r.score, 0);
    const totalQuestions = userResults.reduce((sum, r) => sum + (r.totalQuestions || r.total), 0);
    const averageScore = Math.round((totalScore / totalQuestions) * 100);
    const accuracyPercentage = averageScore;
    
    // Calculate average time per question
    const resultsWithTime = userResults.filter(r => r.timeTaken && r.timeTaken > 0);
    let averageTimePerQuestion = 0;
    if (resultsWithTime.length > 0) {
      const totalTime = resultsWithTime.reduce((sum, r) => sum + r.timeTaken, 0);
      const totalQuestionsWithTime = resultsWithTime.reduce((sum, r) => sum + (r.totalQuestions || r.total), 0);
      averageTimePerQuestion = Math.round(totalTime / totalQuestionsWithTime);
    }
    
    const byCategory = {};
    const bySubject = {};
    const byDifficulty = { easy: [], medium: [], hard: [] };
    
    userResults.forEach(result => {
      const percentage = Math.round((result.score / (result.totalQuestions || result.total)) * 100);
      
      if (result.category) {
        if (!byCategory[result.category]) {
          byCategory[result.category] = { scores: [], count: 0, totalScore: 0 };
        }
        byCategory[result.category].scores.push(percentage);
        byCategory[result.category].count++;
        byCategory[result.category].totalScore += percentage;
      }
      
      if (result.subject) {
        if (!bySubject[result.subject]) {
          bySubject[result.subject] = { scores: [], count: 0, totalScore: 0 };
        }
        bySubject[result.subject].scores.push(percentage);
        bySubject[result.subject].count++;
        bySubject[result.subject].totalScore += percentage;
      }
      
      if (result.difficulty && byDifficulty[result.difficulty]) {
        byDifficulty[result.difficulty].push(percentage);
      }
    });
    
    const categoryStats = Object.entries(byCategory).map(([name, data]) => ({
      name,
      average: Math.round(data.totalScore / data.count),
      count: data.count,
      scores: data.scores
    }));
    
    const subjectStats = Object.entries(bySubject).map(([name, data]) => ({
      name,
      average: Math.round(data.totalScore / data.count),
      count: data.count,
      scores: data.scores
    }));
    
    const difficultyStats = {
      easy: byDifficulty.easy.length > 0 
        ? Math.round(byDifficulty.easy.reduce((a, b) => a + b, 0) / byDifficulty.easy.length) 
        : 0,
      medium: byDifficulty.medium.length > 0 
        ? Math.round(byDifficulty.medium.reduce((a, b) => a + b, 0) / byDifficulty.medium.length) 
        : 0,
      hard: byDifficulty.hard.length > 0 
        ? Math.round(byDifficulty.hard.reduce((a, b) => a + b, 0) / byDifficulty.hard.length) 
        : 0
    };
    
    const scoreHistory = userResults.map((r, index) => ({
      quiz: index + 1,
      score: r.score,
      total: r.totalQuestions || r.total,
      percentage: Math.round((r.score / (r.totalQuestions || r.total)) * 100),
      subject: r.subject,
      category: r.category,
      difficulty: r.difficulty,
      date: r.createdAt || r.date
    }));
    
    const weakAreas = subjectStats
      .filter(s => s.average < 60)
      .sort((a, b) => a.average - b.average)
      .slice(0, 5);
    
    const strongAreas = subjectStats
      .filter(s => s.average >= 75)
      .sort((a, b) => b.average - a.average)
      .slice(0, 5);
    
    const weakTopics = categoryStats
      .filter(c => c.average < 60)
      .sort((a, b) => a.average - b.average);
    
    const strongTopics = categoryStats
      .filter(c => c.average >= 75)
      .sort((a, b) => b.average - a.average);
    
    return NextResponse.json({
      success: true,
      analytics: {
        totalQuizzes,
        averageScore,
        accuracyPercentage,
        averageTimePerQuestion,
        byCategory: categoryStats,
        bySubject: subjectStats,
        byDifficulty: difficultyStats,
        scoreHistory,
        weakAreas,
        strongAreas,
        weakTopics,
        strongTopics
      }
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch analytics' },
      { status: 500 }
    );
  }
});
