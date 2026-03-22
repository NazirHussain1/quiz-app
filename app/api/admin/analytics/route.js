import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/app/lib/mongodb';
import { requireAdmin } from '@/app/lib/authMiddleware';
import { rateLimitApi } from '@/app/lib/rateLimit';

export const dynamic = 'force-dynamic';

export const GET = requireAdmin(async (request) => {
  try {
    // Rate limiting
    const rateLimit = rateLimitApi(request);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { success: false, error: "Too many requests. Please try again later." },
        { status: 429 }
      );
    }

    const { db } = await connectToDatabase();
    
    // Get collections
    const usersCollection = db.collection('users');
    const resultsCollection = db.collection('results');
    const questionsCollection = db.collection('questions');

    // 1. Total Users
    const totalUsers = await usersCollection.countDocuments();

    // 2. Total Quizzes and Average Score
    const quizStats = await resultsCollection.aggregate([
      {
        $group: {
          _id: null,
          totalQuizzes: { $sum: 1 },
          averageScore: { $avg: { $multiply: [{ $divide: ['$score', '$totalQuestions'] }, 100] } }
        }
      }
    ]).toArray();

    const totalQuizzes = quizStats[0]?.totalQuizzes || 0;
    const averageScore = quizStats[0]?.averageScore || 0;

    // 3. Subject Performance
    const subjectStats = await resultsCollection.aggregate([
      {
        $group: {
          _id: '$subject',
          totalAttempts: { $sum: 1 },
          averageScore: { $avg: { $multiply: [{ $divide: ['$score', '$totalQuestions'] }, 100] } },
          totalScore: { $sum: '$score' },
          totalQuestions: { $sum: '$totalQuestions' }
        }
      },
      {
        $project: {
          subject: '$_id',
          totalAttempts: 1,
          averageScore: { $round: ['$averageScore', 2] },
          _id: 0
        }
      },
      {
        $sort: { totalAttempts: -1 }
      }
    ]).toArray();

    // 4. Difficulty Distribution
    const difficultyStats = await resultsCollection.aggregate([
      {
        $group: {
          _id: '$difficulty',
          count: { $sum: 1 },
          averageScore: { $avg: { $multiply: [{ $divide: ['$score', '$totalQuestions'] }, 100] } }
        }
      },
      {
        $project: {
          difficulty: '$_id',
          count: 1,
          averageScore: { $round: ['$averageScore', 2] },
          _id: 0
        }
      }
    ]).toArray();

    // 5. Daily Activity (Last 7 Days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const dailyActivity = await resultsCollection.aggregate([
      {
        $match: {
          createdAt: { $gte: sevenDaysAgo }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
          },
          quizCount: { $sum: 1 },
          averageScore: { $avg: { $multiply: [{ $divide: ['$score', '$totalQuestions'] }, 100] } }
        }
      },
      {
        $project: {
          date: '$_id',
          quizCount: 1,
          averageScore: { $round: ['$averageScore', 2] },
          _id: 0
        }
      },
      {
        $sort: { date: 1 }
      }
    ]).toArray();

    // 6. Top Performers (Top 10)
    const topPerformers = await resultsCollection.aggregate([
      {
        $project: {
          name: 1,
          subject: 1,
          category: 1,
          score: 1,
          totalQuestions: 1,
          percentage: { $multiply: [{ $divide: ['$score', '$totalQuestions'] }, 100] },
          createdAt: 1
        }
      },
      {
        $sort: { percentage: -1, score: -1 }
      },
      {
        $limit: 10
      },
      {
        $project: {
          name: 1,
          subject: 1,
          category: 1,
          score: 1,
          totalQuestions: 1,
          percentage: { $round: ['$percentage', 2] },
          date: '$createdAt',
          _id: 0
        }
      }
    ]).toArray();

    // 7. Category Distribution
    const categoryStats = await resultsCollection.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          averageScore: { $avg: { $multiply: [{ $divide: ['$score', '$totalQuestions'] }, 100] } }
        }
      },
      {
        $project: {
          category: '$_id',
          count: 1,
          averageScore: { $round: ['$averageScore', 2] },
          _id: 0
        }
      },
      {
        $sort: { count: -1 }
      }
    ]).toArray();

    // 8. Exam vs Quiz Mode Stats
    const modeStats = await resultsCollection.aggregate([
      {
        $group: {
          _id: { $ifNull: ['$examMode', false] },
          count: { $sum: 1 },
          averageScore: { $avg: { $multiply: [{ $divide: ['$score', '$totalQuestions'] }, 100] } }
        }
      },
      {
        $project: {
          mode: { $cond: [{ $eq: ['$_id', true] }, 'Exam', 'Quiz'] },
          count: 1,
          averageScore: { $round: ['$averageScore', 2] },
          _id: 0
        }
      }
    ]).toArray();

    // 9. Total Questions in Database
    const totalQuestions = await questionsCollection.countDocuments();

    // 10. Questions by Subject
    const questionsBySubject = await questionsCollection.aggregate([
      {
        $group: {
          _id: '$subject',
          count: { $sum: 1 }
        }
      },
      {
        $project: {
          subject: '$_id',
          count: 1,
          _id: 0
        }
      },
      {
        $sort: { count: -1 }
      }
    ]).toArray();

    // 11. Recent Activity (Last 10 quizzes)
    const recentActivity = await resultsCollection.aggregate([
      {
        $sort: { createdAt: -1 }
      },
      {
        $limit: 10
      },
      {
        $project: {
          name: 1,
          subject: 1,
          score: 1,
          totalQuestions: 1,
          difficulty: 1,
          examMode: 1,
          createdAt: 1,
          _id: 0
        }
      }
    ]).toArray();

    // 12. User Role Distribution
    const roleStats = await usersCollection.aggregate([
      {
        $group: {
          _id: { $ifNull: ['$role', 'student'] },
          count: { $sum: 1 }
        }
      },
      {
        $project: {
          role: '$_id',
          count: 1,
          _id: 0
        }
      }
    ]).toArray();

    // 13. Overall Accuracy Percentage
    const accuracyPercentage = Math.round(averageScore);

    // 14. Average Time Per Question
    const timeStats = await resultsCollection.aggregate([
      {
        $match: {
          timeTaken: { $exists: true, $gt: 0 }
        }
      },
      {
        $group: {
          _id: null,
          totalTime: { $sum: '$timeTaken' },
          totalQuestions: { $sum: '$totalQuestions' }
        }
      }
    ]).toArray();

    const averageTimePerQuestion = timeStats[0] 
      ? Math.round(timeStats[0].totalTime / timeStats[0].totalQuestions)
      : 0;

    // 15. Weak Topics
    const weakTopics = subjectStats
      .filter(s => s.averageScore < 60)
      .sort((a, b) => a.averageScore - b.averageScore)
      .map(s => ({
        name: s.subject,
        averageScore: s.averageScore,
        attempts: s.totalAttempts
      }));

    // 16. Strong Topics
    const strongTopics = subjectStats
      .filter(s => s.averageScore >= 75)
      .sort((a, b) => b.averageScore - a.averageScore)
      .map(s => ({
        name: s.subject,
        averageScore: s.averageScore,
        attempts: s.totalAttempts
      }));

    // 17. Category Performance
    const categoryPerformance = await resultsCollection.aggregate([
      {
        $group: {
          _id: '$category',
          totalAttempts: { $sum: 1 },
          averageScore: { $avg: { $multiply: [{ $divide: ['$score', '$totalQuestions'] }, 100] } }
        }
      },
      {
        $project: {
          category: '$_id',
          totalAttempts: 1,
          averageScore: { $round: ['$averageScore', 2] },
          _id: 0
        }
      }
    ]).toArray();

    const weakCategories = categoryPerformance
      .filter(c => c.averageScore < 60)
      .sort((a, b) => a.averageScore - b.averageScore)
      .map(c => ({
        name: c.category,
        averageScore: c.averageScore,
        attempts: c.totalAttempts
      }));

    const strongCategories = categoryPerformance
      .filter(c => c.averageScore >= 75)
      .sort((a, b) => b.averageScore - a.averageScore)
      .map(c => ({
        name: c.category,
        averageScore: c.averageScore,
        attempts: c.totalAttempts
      }));

    return NextResponse.json({
      success: true,
      data: {
        overview: {
          totalUsers,
          totalQuizzes,
          averageScore: Math.round(averageScore * 100) / 100,
          accuracyPercentage,
          averageTimePerQuestion,
          totalQuestions
        },
        subjectStats,
        difficultyStats,
        dailyActivity,
        topPerformers,
        categoryStats,
        modeStats,
        questionsBySubject,
        recentActivity,
        roleStats,
        weakTopics,
        strongTopics,
        weakCategories,
        strongCategories
      }
    });

  } catch (error) {
    console.error('Error fetching admin analytics:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch analytics' },
      { status: 500 }
    );
  }
});
