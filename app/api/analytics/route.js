import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/app/lib/mongodb';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userName = searchParams.get('userName');
    
    if (!userName) {
      return NextResponse.json(
        { success: false, error: 'userName is required' },
        { status: 400 }
      );
    }
    
    const { db } = await connectToDatabase();
    const collection = db.collection('results');
    
    const userResults = await collection
      .find({ name: userName })
      .sort({ createdAt: 1 })
      .toArray();
    
    if (userResults.length === 0) {
      return NextResponse.json({
        success: true,
        analytics: {
          totalQuizzes: 0,
          categoryStats: [],
          subjectStats: [],
          scoreOverTime: [],
          strengths: [],
          weaknesses: []
        }
      });
    }
    
    const categoryStats = {};
    const subjectStats = {};
    const scoreOverTime = [];
    
    userResults.forEach(result => {
      const category = result.category || 'General';
      const subject = result.subject || 'General';
      const percentage = Math.round((result.score / result.totalQuestions) * 100);
      
      if (!categoryStats[category]) {
        categoryStats[category] = { count: 0, totalScore: 0, totalQuestions: 0 };
      }
      categoryStats[category].count++;
      categoryStats[category].totalScore += result.score;
      categoryStats[category].totalQuestions += result.totalQuestions;
      
      if (!subjectStats[subject]) {
        subjectStats[subject] = { count: 0, totalScore: 0, totalQuestions: 0, scores: [] };
      }
      subjectStats[subject].count++;
      subjectStats[subject].totalScore += result.score;
      subjectStats[subject].totalQuestions += result.totalQuestions;
      subjectStats[subject].scores.push(percentage);
      
      scoreOverTime.push({
        date: result.createdAt,
        score: percentage,
        category: category,
        subject: subject,
        examMode: result.examMode || false
      });
    });
    
    const categoryStatsArray = Object.entries(categoryStats).map(([category, stats]) => ({
      category,
      count: stats.count,
      averageScore: Math.round((stats.totalScore / stats.totalQuestions) * 100)
    }));
    
    const subjectStatsArray = Object.entries(subjectStats).map(([subject, stats]) => ({
      subject,
      count: stats.count,
      averageScore: Math.round((stats.totalScore / stats.totalQuestions) * 100),
      scores: stats.scores
    }));
    
    subjectStatsArray.sort((a, b) => b.averageScore - a.averageScore);
    
    const strengths = subjectStatsArray.filter(s => s.averageScore >= 70).slice(0, 5);
    const weaknesses = subjectStatsArray.filter(s => s.averageScore < 70).slice(0, 5);
    
    return NextResponse.json({
      success: true,
      analytics: {
        totalQuizzes: userResults.length,
        categoryStats: categoryStatsArray,
        subjectStats: subjectStatsArray,
        scoreOverTime: scoreOverTime,
        strengths: strengths,
        weaknesses: weaknesses,
        overallAverage: Math.round(
          subjectStatsArray.reduce((sum, s) => sum + s.averageScore, 0) / subjectStatsArray.length
        )
      }
    }, {
      headers: {
        'Cache-Control': 'no-store, max-age=0',
      }
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
