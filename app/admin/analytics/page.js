"use client";

import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import Link from "next/link";
import AdminLayout from "../components/AdminLayout";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line, Bar, Pie, Doughnut } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

export default function AdminAnalytics() {
  const { user, loading: authLoading } = useSelector((state) => state.auth);
  const router = useRouter();
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Role-based access control
  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push("/login");
      } else if (user.role !== "admin") {
        router.push("/");
      }
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user && user.role === "admin") {
      fetchAnalytics();
    }
  }, [user]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/analytics');
      const data = await res.json();
      
      if (data.success) {
        setAnalytics(data.data);
      } else {
        setError(data.error || 'Failed to fetch analytics');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Show loading while checking auth
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-500"></div>
      </div>
    );
  }

  // Show access denied if not admin
  if (!user || user.role !== "admin") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
          <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6">
            <h4 className="text-xl font-bold text-red-800 mb-2">Access Denied</h4>
            <p className="text-red-700 mb-4">You do not have permission to access this page.</p>
            <Link href="/" className="inline-block px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-all duration-200">
              Go to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <AdminLayout user={user}>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading analytics data...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout user={user}>
        <div className="flex items-center justify-center py-12">
          <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
            <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6">
              <h4 className="text-xl font-bold text-red-800 mb-2">Error</h4>
              <p className="text-red-700 mb-4">{error}</p>
              <button onClick={fetchAnalytics} className="px-6 py-3 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 transition-all duration-200">
                Retry
              </button>
            </div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (!analytics) {
    return null;
  }

  // Chart Data Preparation
  const dailyActivityData = {
    labels: analytics.dailyActivity.map(d => new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })),
    datasets: [
      {
        label: 'Quizzes Taken',
        data: analytics.dailyActivity.map(d => d.quizCount),
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        tension: 0.4,
      },
    ],
  };

  const subjectPerformanceData = {
    labels: analytics.subjectStats.map(s => s.subject),
    datasets: [
      {
        label: 'Average Score (%)',
        data: analytics.subjectStats.map(s => s.averageScore),
        backgroundColor: 'rgba(54, 162, 235, 0.6)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1,
      },
      {
        label: 'Total Attempts',
        data: analytics.subjectStats.map(s => s.totalAttempts),
        backgroundColor: 'rgba(255, 159, 64, 0.6)',
        borderColor: 'rgba(255, 159, 64, 1)',
        borderWidth: 1,
      },
    ],
  };

  const difficultyData = {
    labels: analytics.difficultyStats.map(d => d.difficulty?.charAt(0).toUpperCase() + d.difficulty?.slice(1) || 'Unknown'),
    datasets: [
      {
        label: 'Quiz Count',
        data: analytics.difficultyStats.map(d => d.count),
        backgroundColor: [
          'rgba(75, 192, 192, 0.6)',
          'rgba(255, 206, 86, 0.6)',
          'rgba(255, 99, 132, 0.6)',
        ],
        borderColor: [
          'rgba(75, 192, 192, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(255, 99, 132, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  const modeData = {
    labels: analytics.modeStats.map(m => m.mode),
    datasets: [
      {
        label: 'Count',
        data: analytics.modeStats.map(m => m.count),
        backgroundColor: [
          'rgba(153, 102, 255, 0.6)',
          'rgba(54, 162, 235, 0.6)',
        ],
        borderColor: [
          'rgba(153, 102, 255, 1)',
          'rgba(54, 162, 235, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        position: 'top',
      },
    },
  };

  return (
    <AdminLayout user={user}>
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-1">📊 Analytics Dashboard</h2>
            <p className="text-gray-600">Comprehensive system insights and statistics</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 w-full lg:w-auto">
            <button onClick={fetchAnalytics} className="px-4 py-2 border-2 border-blue-300 text-blue-600 rounded-xl font-semibold hover:bg-blue-50 transition-all duration-200 text-center">
              🔄 Refresh
            </button>
          </div>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-2xl shadow-lg border-2 border-blue-300 p-6">
            <div className="flex justify-between items-center">
              <div>
                <h6 className="text-sm text-gray-600 mb-1">Total Users</h6>
                <h3 className="text-3xl font-bold text-gray-900">{analytics.overview.totalUsers}</h3>
              </div>
              <div className="text-5xl">👥</div>
            </div>
          </div>
          <div className="bg-white rounded-2xl shadow-lg border-2 border-green-300 p-6">
            <div className="flex justify-between items-center">
              <div>
                <h6 className="text-sm text-gray-600 mb-1">Total Quizzes</h6>
                <h3 className="text-3xl font-bold text-gray-900">{analytics.overview.totalQuizzes}</h3>
              </div>
              <div className="text-5xl">📝</div>
            </div>
          </div>
          <div className="bg-white rounded-2xl shadow-lg border-2 border-yellow-300 p-6">
            <div className="flex justify-between items-center">
              <div>
                <h6 className="text-sm text-gray-600 mb-1">Accuracy</h6>
                <h3 className="text-3xl font-bold text-gray-900">{analytics.overview.accuracyPercentage}%</h3>
              </div>
              <div className="text-5xl">🎯</div>
            </div>
          </div>
          <div className="bg-white rounded-2xl shadow-lg border-2 border-blue-300 p-6">
            <div className="flex justify-between items-center">
              <div>
                <h6 className="text-sm text-gray-600 mb-1">Avg Time/Q</h6>
                <h3 className="text-3xl font-bold text-gray-900">
                  {analytics.overview.averageTimePerQuestion > 0 
                    ? `${analytics.overview.averageTimePerQuestion}s` 
                    : 'N/A'}
                </h3>
              </div>
              <div className="text-5xl">⏱️</div>
            </div>
          </div>
        </div>

        {/* Weak and Strong Topics Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div className="bg-white rounded-2xl shadow-lg border-2 border-yellow-300 overflow-hidden">
            <div className="bg-yellow-500 text-gray-900 px-6 py-4">
              <h5 className="text-lg font-bold">⚠️ Weak Topics (&lt;60% Accuracy)</h5>
            </div>
            <div className="p-6">
              {analytics.weakTopics && analytics.weakTopics.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-2">Topic</th>
                        <th className="text-right py-2">Avg Score</th>
                        <th className="text-right py-2">Attempts</th>
                      </tr>
                    </thead>
                    <tbody>
                      {analytics.weakTopics.map((topic, index) => (
                        <tr key={index} className="border-b border-gray-100">
                          <td className="py-2">{topic.name}</td>
                          <td className="text-right py-2">
                            <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium">{topic.averageScore}%</span>
                          </td>
                          <td className="text-right py-2">{topic.attempts}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-gray-500">No weak topics found. Great job!</p>
              )}
              {analytics.weakCategories && analytics.weakCategories.length > 0 && (
                <div className="mt-4">
                  <small className="text-gray-600">Weak Categories:</small>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {analytics.weakCategories.map((cat, idx) => (
                      <span key={idx} className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-medium">
                        {cat.name} ({cat.averageScore}%)
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
          <div className="bg-white rounded-2xl shadow-lg border-2 border-green-300 overflow-hidden">
            <div className="bg-green-500 text-white px-6 py-4">
              <h5 className="text-lg font-bold">🌟 Strong Topics (≥75% Accuracy)</h5>
            </div>
            <div className="p-6">
              {analytics.strongTopics && analytics.strongTopics.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-2">Topic</th>
                        <th className="text-right py-2">Avg Score</th>
                        <th className="text-right py-2">Attempts</th>
                      </tr>
                    </thead>
                    <tbody>
                      {analytics.strongTopics.map((topic, index) => (
                        <tr key={index} className="border-b border-gray-100">
                          <td className="py-2">{topic.name}</td>
                          <td className="text-right py-2">
                            <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">{topic.averageScore}%</span>
                          </td>
                          <td className="text-right py-2">{topic.attempts}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-gray-500">No strong topics yet. Keep practicing!</p>
              )}
              {analytics.strongCategories && analytics.strongCategories.length > 0 && (
                <div className="mt-4">
                  <small className="text-gray-600">Strong Categories:</small>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {analytics.strongCategories.map((cat, idx) => (
                      <span key={idx} className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                        {cat.name} ({cat.averageScore}%)
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Charts Row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h5 className="text-lg font-bold text-gray-900">📈 Daily Activity (Last 7 Days)</h5>
            </div>
            <div className="p-6">
              <Line data={dailyActivityData} options={chartOptions} />
            </div>
          </div>
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h5 className="text-lg font-bold text-gray-900">🎮 Quiz vs Exam Mode</h5>
            </div>
            <div className="p-6">
              <Doughnut data={modeData} options={chartOptions} />
            </div>
          </div>
        </div>

        {/* Charts Row 2 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h5 className="text-lg font-bold text-gray-900">📚 Subject Performance</h5>
            </div>
            <div className="p-6">
              <Bar data={subjectPerformanceData} options={chartOptions} />
            </div>
          </div>
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h5 className="text-lg font-bold text-gray-900">⚡ Difficulty Distribution</h5>
            </div>
            <div className="p-6">
              <Pie data={difficultyData} options={chartOptions} />
            </div>
          </div>
        </div>

        {/* Top Performers */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h5 className="text-lg font-bold text-gray-900">🏆 Top Performers</h5>
            </div>
            <div className="p-6">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-2 text-sm font-bold text-gray-700">Rank</th>
                      <th className="text-left py-2 text-sm font-bold text-gray-700">Name</th>
                      <th className="text-left py-2 text-sm font-bold text-gray-700">Subject</th>
                      <th className="text-left py-2 text-sm font-bold text-gray-700">Score</th>
                      <th className="text-left py-2 text-sm font-bold text-gray-700">%</th>
                    </tr>
                  </thead>
                  <tbody>
                    {analytics.topPerformers.map((performer, index) => (
                      <tr key={index} className="border-b border-gray-100 hover:bg-gray-50 transition-colors duration-150">
                        <td className="py-2">
                          {index === 0 && '🥇'}
                          {index === 1 && '🥈'}
                          {index === 2 && '🥉'}
                          {index > 2 && `#${index + 1}`}
                        </td>
                        <td className="py-2">{performer.name}</td>
                        <td className="py-2"><span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">{performer.subject}</span></td>
                        <td className="py-2">{performer.score}/{performer.totalQuestions}</td>
                        <td className="py-2"><strong>{performer.percentage}%</strong></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h5 className="text-lg font-bold text-gray-900">🕐 Recent Activity</h5>
            </div>
            <div className="p-6">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-2 text-sm font-bold text-gray-700">User</th>
                      <th className="text-left py-2 text-sm font-bold text-gray-700">Subject</th>
                      <th className="text-left py-2 text-sm font-bold text-gray-700">Score</th>
                      <th className="text-left py-2 text-sm font-bold text-gray-700">Mode</th>
                    </tr>
                  </thead>
                  <tbody>
                    {analytics.recentActivity.map((activity, index) => (
                      <tr key={index} className="border-b border-gray-100 hover:bg-gray-50 transition-colors duration-150">
                        <td className="py-2">{activity.name}</td>
                        <td className="py-2"><span className="px-2 py-1 bg-gray-200 text-gray-700 rounded-full text-xs font-medium">{activity.subject}</span></td>
                        <td className="py-2">{activity.score}/{activity.totalQuestions}</td>
                        <td className="py-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${activity.examMode ? 'bg-yellow-100 text-yellow-700' : 'bg-blue-100 text-blue-700'}`}>
                            {activity.examMode ? 'Exam' : 'Quiz'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h5 className="text-lg font-bold text-gray-900">📖 Questions by Subject</h5>
            </div>
            <div className="p-6">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-2">Subject</th>
                      <th className="text-right py-2">Question Count</th>
                    </tr>
                  </thead>
                  <tbody>
                    {analytics.questionsBySubject.map((item, index) => (
                      <tr key={index} className="border-b border-gray-100">
                        <td className="py-2">{item.subject}</td>
                        <td className="text-right py-2"><strong>{item.count}</strong></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h5 className="text-lg font-bold text-gray-900">👥 User Roles</h5>
            </div>
            <div className="p-6">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-2">Role</th>
                      <th className="text-right py-2">Count</th>
                    </tr>
                  </thead>
                  <tbody>
                    {analytics.roleStats.map((item, index) => (
                      <tr key={index} className="border-b border-gray-100">
                        <td className="py-2">
                          {item.role === 'admin' ? '👑' : '👤'} {item.role.charAt(0).toUpperCase() + item.role.slice(1)}
                        </td>
                        <td className="text-right py-2"><strong>{item.count}</strong></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
