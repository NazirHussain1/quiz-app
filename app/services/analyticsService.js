/**
 * Analytics Service
 * Handles analytics and statistics business logic
 */

import { connectToDatabase } from '@/app/lib/database/connection';
import { 
  getCacheOrFetch, 
  buildCacheKey, 
  CACHE_KEYS, 
  CACHE_TTL 
} from '@/app/lib/cache';

/**
 * Get admin analytics
 */
export async function getAdminAnalytics() {
  const cacheKey = buildCacheKey(CACHE_KEYS.ADMIN_ANALYTICS);
  
  return await getCacheOrFetch(
    cacheKey,
    async () => {
      const { db } = await connectToDatabase();
      
      const usersCollection = db.collection('users');
      const resultsCollection = db.collection('results');
      const questionsCollection = db.collection('questions');

      // Run independent queries in parallel
      const [
        totalUsers,
        quizStats,
        subjectStats,
        difficultyStats,
        dailyActivity,
        topPerformers,
        categoryStats,
        modeStats,
        totalQuestions,
        questionsBySubject,
        recentActivity,
        roleStats,
        timeStats
      ] = await Promise.all([
        // 1. Total Users
        usersCollection.countDocuments(),

        // 2. Total Quizzes and Average Score
        resultsCollection.aggregate([
          {
            $group: {
              _id: null,
              totalQuizzes: { $sum: 1 },
              averageScore: { $avg: { $multiply: [{ $divide: ['$score', '$totalQuestions'] }, 100] } }
            }
          }
        ]).toArray(),

        // 3. Subject Performance
        resultsCollection.aggregate([
          {
            $group: {
              _id: '$subject',
              totalAttempts: { $sum: 1 },
              averageScore: { $avg: { $multiply: [{ $divide: ['$score', '$totalQuestions'] }, 100] } }
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
        ]).toArray(),

        // 4. Difficulty Distribution
        resultsCollection.aggregate([
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
        ]).toArray(),

        // 5. Daily Activity (Last 7 Days)
        resultsCollection.aggregate([
          {
            $match: {
              createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
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
        ]).toArray(),

        // 6. Top Performers (Top 10)
        resultsCollection.aggregate([
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
        ]).toArray(),

        // 7. Category Distribution
        resultsCollection.aggregate([
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
        ]).toArray(),

        // 8. Exam vs Quiz Mode Stats
        resultsCollection.aggregate([
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
        ]).toArray(),

        // 9. Total Questions in Database
        questionsCollection.countDocuments(),

        // 10. Questions by Subject
        questionsCollection.aggregate([
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
        ]).toArray(),

        // 11. Recent Activity (Last 10 quizzes)
        resultsCollection.aggregate([
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
        ]).toArray(),

        // 12. User Role Distribution
        usersCollection.aggregate([
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
        ]).toArray(),

        // 14. Average Time Per Question
        resultsCollection.aggregate([
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
        ]).toArray()
      ]);

      const totalQuizzes = quizStats[0]?.totalQuizzes || 0;
      const averageScore = quizStats[0]?.averageScore || 0;

      // 13. Overall Accuracy Percentage
      const accuracyPercentage = Math.round(averageScore);

      // 14. Average Time Per Question
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

      // 17. Category Performance (derived from categoryStats)
      const weakCategories = categoryStats
        .filter(c => c.averageScore < 60)
        .sort((a, b) => a.averageScore - b.averageScore)
        .map(c => ({
          name: c.category,
          averageScore: c.averageScore,
          attempts: c.count
        }));

      const strongCategories = categoryStats
        .filter(c => c.averageScore >= 75)
        .sort((a, b) => b.averageScore - a.averageScore)
        .map(c => ({
          name: c.category,
          averageScore: c.averageScore,
          attempts: c.count
        }));

      return {
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
      };
    },
    CACHE_TTL.ADMIN_ANALYTICS
  );
}

/**
 * Get user analytics (public)
 */
export async function getUserAnalytics() {
  const cacheKey = buildCacheKey(CACHE_KEYS.ANALYTICS);
  
  return await getCacheOrFetch(
    cacheKey,
    async () => {
      const { db } = await connectToDatabase();
      const resultsCollection = db.collection('results');

      // Run queries in parallel
      const [stats, subjectStats] = await Promise.all([
        resultsCollection.aggregate([
          {
            $group: {
              _id: null,
              totalQuizzes: { $sum: 1 },
              averageScore: { $avg: { $multiply: [{ $divide: ['$score', '$totalQuestions'] }, 100] } }
            }
          }
        ]).toArray(),

        resultsCollection.aggregate([
          {
            $group: {
              _id: '$subject',
              count: { $sum: 1 },
              averageScore: { $avg: { $multiply: [{ $divide: ['$score', '$totalQuestions'] }, 100] } }
            }
          },
          {
            $project: {
              subject: '$_id',
              count: 1,
              averageScore: { $round: ['$averageScore', 2] },
              _id: 0
            }
          },
          {
            $sort: { count: -1 }
          }
        ]).toArray()
      ]);

      return {
        success: true,
        data: {
          totalQuizzes: stats[0]?.totalQuizzes || 0,
          averageScore: Math.round((stats[0]?.averageScore || 0) * 100) / 100,
          subjectStats
        }
      };
    },
    CACHE_TTL.ANALYTICS
  );
}
