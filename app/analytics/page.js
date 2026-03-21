"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

export default function AnalyticsPage() {
  const router = useRouter();
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    checkAuthAndFetch();
  }, []);

  const checkAuthAndFetch = async () => {
    try {
      const authRes = await fetch("/api/auth/me");
      const authData = await authRes.json();
      
      if (!authData.success) {
        router.push("/login");
        return;
      }
      
      setUser(authData.user);
      fetchAnalytics();
    } catch (err) {
      router.push("/login");
    }
  };

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/analytics");
      const data = await res.json();
      
      if (data.success) {
        setAnalytics(data.analytics);
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError("Failed to load analytics");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-8 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="bg-red-50 border-2 border-red-200 text-red-800 rounded-xl p-4">{error}</div>
          <Link href="/" className="inline-block mt-4 px-6 py-3 bg-gray-600 text-white rounded-xl font-semibold hover:bg-gray-700 transition-all duration-200">Back to Home</Link>
        </div>
      </div>
    );
  }

  if (!analytics || analytics.totalQuizzes === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 text-center max-w-md">
          <h3 className="text-2xl font-bold text-gray-900 mb-2">No Quiz Data Yet</h3>
          <p className="text-gray-600 mb-6">Take some quizzes to see your analytics!</p>
          <Link href="/" className="inline-block px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-semibold hover:from-blue-600 hover:to-purple-700 transition-all duration-200 shadow-lg">Start Quiz</Link>
        </div>
      </div>
    );
  }

  const scoreHistoryData = {
    labels: analytics.scoreHistory.map(h => `Quiz ${h.quiz}`),
    datasets: [
      {
        label: 'Score %',
        data: analytics.scoreHistory.map(h => h.percentage),
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        tension: 0.4
      }
    ]
  };

  const subjectData = {
    labels: analytics.bySubject.map(s => s.name),
    datasets: [
      {
        label: 'Average Score %',
        data: analytics.bySubject.map(s => s.average),
        backgroundColor: [
          'rgba(255, 99, 132, 0.6)',
          'rgba(54, 162, 235, 0.6)',
          'rgba(255, 206, 86, 0.6)',
          'rgba(75, 192, 192, 0.6)',
          'rgba(153, 102, 255, 0.6)',
          'rgba(255, 159, 64, 0.6)'
        ]
      }
    ]
  };

  const difficultyData = {
    labels: ['Easy', 'Medium', 'Hard'],
    datasets: [
      {
        data: [
          analytics.byDifficulty.easy,
          analytics.byDifficulty.medium,
          analytics.byDifficulty.hard
        ],
        backgroundColor: [
          'rgba(75, 192, 192, 0.6)',
          'rgba(255, 206, 86, 0.6)',
          'rgba(255, 99, 132, 0.6)'
        ]
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        position: 'top'
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900">📊 Performance Analytics</h1>
          <Link href="/" className="px-4 py-2 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-100 transition-all duration-200">
            ← Back
          </Link>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-2xl shadow-lg p-6 text-center">
            <h6 className="text-sm text-gray-600 mb-2">Total Quizzes</h6>
            <h2 className="text-3xl font-bold text-blue-600">{analytics.totalQuizzes}</h2>
          </div>
          <div className="bg-white rounded-2xl shadow-lg p-6 text-center">
            <h6 className="text-sm text-gray-600 mb-2">Accuracy</h6>
            <h2 className="text-3xl font-bold text-green-600">{analytics.accuracyPercentage || analytics.averageScore}%</h2>
          </div>
          <div className="bg-white rounded-2xl shadow-lg p-6 text-center">
            <h6 className="text-sm text-gray-600 mb-2">Avg Time/Question</h6>
            <h2 className="text-3xl font-bold text-blue-500">
              {analytics.averageTimePerQuestion > 0 
                ? `${analytics.averageTimePerQuestion}s` 
                : 'N/A'}
            </h2>
          </div>
          <div className="bg-white rounded-2xl shadow-lg p-6 text-center">
            <h6 className="text-sm text-gray-600 mb-2">Strong Topics</h6>
            <h2 className="text-3xl font-bold text-green-600">{analytics.strongAreas.length}</h2>
            <small className="text-gray-500">≥75%</small>
          </div>
        </div>

        {/* Additional Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="bg-white rounded-2xl shadow-lg border-2 border-yellow-300 p-6 text-center">
            <h6 className="text-sm text-gray-600 mb-2">Weak Topics</h6>
            <h2 className="text-3xl font-bold text-yellow-600">{analytics.weakAreas.length}</h2>
            <small className="text-gray-500">&lt;60% accuracy</small>
          </div>
          <div className="bg-white rounded-2xl shadow-lg p-6 text-center">
            <h6 className="text-sm text-gray-600 mb-2">Average Score</h6>
            <h2 className="text-3xl font-bold text-blue-600">{analytics.averageScore}%</h2>
          </div>
        </div>

        {/* Score History Chart */}
        <div className="bg-white rounded-2xl shadow-lg mb-6 overflow-hidden">
          <div className="bg-blue-600 text-white px-6 py-4">
            <h5 className="text-lg font-bold">📈 Score History Over Time</h5>
          </div>
          <div className="p-6">
            <Line data={scoreHistoryData} options={chartOptions} />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Subject Performance */}
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="bg-blue-500 text-white px-6 py-4">
              <h5 className="text-lg font-bold">📚 Performance by Subject</h5>
            </div>
            <div className="p-6">
              <Bar data={subjectData} options={chartOptions} />
            </div>
          </div>

          {/* Difficulty Distribution */}
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="bg-yellow-500 text-gray-900 px-6 py-4">
              <h5 className="text-lg font-bold">🎯 By Difficulty</h5>
            </div>
            <div className="p-6 flex items-center justify-center">
              <div className="max-w-xs w-full">
                <Doughnut data={difficultyData} />
              </div>
            </div>
          </div>
        </div>

        {/* Weak Areas */}
        {analytics.weakAreas.length > 0 && (
          <div className="bg-white rounded-2xl shadow-lg border-2 border-yellow-300 mb-6 overflow-hidden">
            <div className="bg-yellow-500 text-gray-900 px-6 py-4">
              <h5 className="text-lg font-bold">⚠️ Weak Topics - Need Improvement (&lt;60% Accuracy)</h5>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {analytics.weakAreas.map((area, index) => (
                  <div key={index} className="bg-gray-50 rounded-xl p-4">
                    <div className="flex justify-between items-center mb-2">
                      <div>
                        <h6 className="font-bold text-gray-900">{area.name}</h6>
                        <small className="text-gray-600">{area.count} quiz(zes)</small>
                      </div>
                      <div className="text-right">
                        <h4 className="text-2xl font-bold text-red-600">{area.average}%</h4>
                      </div>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-red-500 rounded-full"
                        style={{ width: `${area.average}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
              {analytics.weakTopics && analytics.weakTopics.length > 0 && (
                <div className="mt-4">
                  <h6 className="text-gray-600 mb-2">Also check these categories:</h6>
                  <div className="flex flex-wrap gap-2">
                    {analytics.weakTopics.map((topic, idx) => (
                      <span key={idx} className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm font-medium">
                        {topic.name} ({topic.average}%)
                      </span>
                    ))}
                  </div>
                </div>
              )}
              <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4 mt-4">
                <strong className="text-blue-800">💡 Tip:</strong> Focus on these subjects to improve your overall performance!
              </div>
            </div>
          </div>
        )}

        {/* Strong Areas */}
        {analytics.strongAreas.length > 0 && (
          <div className="bg-white rounded-2xl shadow-lg border-2 border-green-300 mb-6 overflow-hidden">
            <div className="bg-green-500 text-white px-6 py-4">
              <h5 className="text-lg font-bold">🌟 Strong Topics - Excellent Performance (≥75% Accuracy)</h5>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {analytics.strongAreas.map((area, index) => (
                  <div key={index} className="bg-gray-50 rounded-xl p-4">
                    <div className="flex justify-between items-center mb-2">
                      <div>
                        <h6 className="font-bold text-gray-900">{area.name}</h6>
                        <small className="text-gray-600">{area.count} quiz(zes)</small>
                      </div>
                      <div className="text-right">
                        <h4 className="text-2xl font-bold text-green-600">{area.average}%</h4>
                      </div>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-green-500 rounded-full"
                        style={{ width: `${area.average}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
              {analytics.strongTopics && analytics.strongTopics.length > 0 && (
                <div className="mt-4">
                  <h6 className="text-gray-600 mb-2">Also excelling in these categories:</h6>
                  <div className="flex flex-wrap gap-2">
                    {analytics.strongTopics.map((topic, idx) => (
                      <span key={idx} className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                        {topic.name} ({topic.average}%)
                      </span>
                    ))}
                  </div>
                </div>
              )}
              <div className="bg-green-50 border-2 border-green-200 rounded-xl p-4 mt-4">
                <strong className="text-green-800">🎉 Great job!</strong> Keep up the excellent work in these areas!
              </div>
            </div>
          </div>
        )}

        {/* Recent Quiz History */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="bg-gray-700 text-white px-6 py-4">
            <h5 className="text-lg font-bold">📋 Recent Quiz History</h5>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-bold text-gray-700">#</th>
                  <th className="px-4 py-3 text-left text-sm font-bold text-gray-700">Subject</th>
                  <th className="px-4 py-3 text-left text-sm font-bold text-gray-700">Category</th>
                  <th className="px-4 py-3 text-left text-sm font-bold text-gray-700">Difficulty</th>
                  <th className="px-4 py-3 text-left text-sm font-bold text-gray-700">Score</th>
                  <th className="px-4 py-3 text-left text-sm font-bold text-gray-700">Date</th>
                </tr>
              </thead>
              <tbody>
                {analytics.scoreHistory.slice(-10).reverse().map((quiz, index) => (
                  <tr key={index} className="border-b border-gray-200 hover:bg-gray-50 transition-colors duration-150">
                    <td className="px-4 py-3">{analytics.scoreHistory.length - index}</td>
                    <td className="px-4 py-3">{quiz.subject}</td>
                    <td className="px-4 py-3">
                      <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">{quiz.category}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        quiz.difficulty === 'easy' ? 'bg-green-100 text-green-700' :
                        quiz.difficulty === 'hard' ? 'bg-red-100 text-red-700' :
                        'bg-yellow-100 text-yellow-700'
                      }`}>
                        {quiz.difficulty}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-3 py-1 bg-blue-600 text-white rounded-full text-xs font-bold">
                        {quiz.score}/{quiz.total} ({quiz.percentage}%)
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <small className="text-gray-500">
                        {new Date(quiz.date).toLocaleDateString()}
                      </small>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
