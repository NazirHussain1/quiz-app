"use client";

import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import Link from "next/link";
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
      <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  // Show access denied if not admin
  if (!user || user.role !== "admin") {
    return (
      <div className="container mt-5">
        <div className="alert alert-danger" role="alert">
          <h4 className="alert-heading">Access Denied</h4>
          <p>You do not have permission to access this page.</p>
          <hr />
          <Link href="/" className="btn btn-primary">
            Go to Home
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container mt-5">
        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
          <div className="text-center">
            <div className="spinner-border text-primary mb-3" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="text-muted">Loading analytics data...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mt-5">
        <div className="alert alert-danger" role="alert">
          <h4 className="alert-heading">Error</h4>
          <p>{error}</p>
          <button onClick={fetchAnalytics} className="btn btn-danger">
            Retry
          </button>
        </div>
      </div>
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
    <div className="container-fluid mt-4 mb-5">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="mb-1">📊 Admin Analytics Dashboard</h2>
          <p className="text-muted mb-0">Comprehensive system insights and statistics</p>
        </div>
        <div className="d-flex gap-2">
          <button onClick={fetchAnalytics} className="btn btn-outline-primary btn-sm">
            🔄 Refresh
          </button>
          <Link href="/admin" className="btn btn-outline-secondary btn-sm">
            ← Back to Admin
          </Link>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="row g-3 mb-4">
        <div className="col-md-3">
          <div className="card border-primary shadow-sm">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="text-muted mb-1">Total Users</h6>
                  <h3 className="mb-0">{analytics.overview.totalUsers}</h3>
                </div>
                <div className="fs-1">👥</div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card border-success shadow-sm">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="text-muted mb-1">Total Quizzes</h6>
                  <h3 className="mb-0">{analytics.overview.totalQuizzes}</h3>
                </div>
                <div className="fs-1">📝</div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card border-warning shadow-sm">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="text-muted mb-1">Average Score</h6>
                  <h3 className="mb-0">{analytics.overview.averageScore}%</h3>
                </div>
                <div className="fs-1">🎯</div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card border-info shadow-sm">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="text-muted mb-1">Total Questions</h6>
                  <h3 className="mb-0">{analytics.overview.totalQuestions}</h3>
                </div>
                <div className="fs-1">❓</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Row 1 */}
      <div className="row g-3 mb-4">
        <div className="col-lg-8">
          <div className="card shadow-sm">
            <div className="card-header bg-white">
              <h5 className="mb-0">📈 Daily Activity (Last 7 Days)</h5>
            </div>
            <div className="card-body">
              <Line data={dailyActivityData} options={chartOptions} />
            </div>
          </div>
        </div>
        <div className="col-lg-4">
          <div className="card shadow-sm">
            <div className="card-header bg-white">
              <h5 className="mb-0">🎮 Quiz vs Exam Mode</h5>
            </div>
            <div className="card-body">
              <Doughnut data={modeData} options={chartOptions} />
            </div>
          </div>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="row g-3 mb-4">
        <div className="col-lg-8">
          <div className="card shadow-sm">
            <div className="card-header bg-white">
              <h5 className="mb-0">📚 Subject Performance</h5>
            </div>
            <div className="card-body">
              <Bar data={subjectPerformanceData} options={chartOptions} />
            </div>
          </div>
        </div>
        <div className="col-lg-4">
          <div className="card shadow-sm">
            <div className="card-header bg-white">
              <h5 className="mb-0">⚡ Difficulty Distribution</h5>
            </div>
            <div className="card-body">
              <Pie data={difficultyData} options={chartOptions} />
            </div>
          </div>
        </div>
      </div>

      {/* Top Performers */}
      <div className="row g-3 mb-4">
        <div className="col-lg-6">
          <div className="card shadow-sm">
            <div className="card-header bg-white">
              <h5 className="mb-0">🏆 Top Performers</h5>
            </div>
            <div className="card-body">
              <div className="table-responsive">
                <table className="table table-hover mb-0">
                  <thead>
                    <tr>
                      <th>Rank</th>
                      <th>Name</th>
                      <th>Subject</th>
                      <th>Score</th>
                      <th>%</th>
                    </tr>
                  </thead>
                  <tbody>
                    {analytics.topPerformers.map((performer, index) => (
                      <tr key={index}>
                        <td>
                          {index === 0 && '🥇'}
                          {index === 1 && '🥈'}
                          {index === 2 && '🥉'}
                          {index > 2 && `#${index + 1}`}
                        </td>
                        <td>{performer.name}</td>
                        <td><span className="badge bg-info">{performer.subject}</span></td>
                        <td>{performer.score}/{performer.totalQuestions}</td>
                        <td><strong>{performer.percentage}%</strong></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="col-lg-6">
          <div className="card shadow-sm">
            <div className="card-header bg-white">
              <h5 className="mb-0">🕐 Recent Activity</h5>
            </div>
            <div className="card-body">
              <div className="table-responsive">
                <table className="table table-hover mb-0">
                  <thead>
                    <tr>
                      <th>User</th>
                      <th>Subject</th>
                      <th>Score</th>
                      <th>Mode</th>
                    </tr>
                  </thead>
                  <tbody>
                    {analytics.recentActivity.map((activity, index) => (
                      <tr key={index}>
                        <td>{activity.name}</td>
                        <td><span className="badge bg-secondary">{activity.subject}</span></td>
                        <td>{activity.score}/{activity.totalQuestions}</td>
                        <td>
                          <span className={`badge ${activity.examMode ? 'bg-warning' : 'bg-primary'}`}>
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
      </div>

      {/* Additional Stats */}
      <div className="row g-3">
        <div className="col-lg-6">
          <div className="card shadow-sm">
            <div className="card-header bg-white">
              <h5 className="mb-0">📖 Questions by Subject</h5>
            </div>
            <div className="card-body">
              <div className="table-responsive">
                <table className="table table-sm mb-0">
                  <thead>
                    <tr>
                      <th>Subject</th>
                      <th className="text-end">Question Count</th>
                    </tr>
                  </thead>
                  <tbody>
                    {analytics.questionsBySubject.map((item, index) => (
                      <tr key={index}>
                        <td>{item.subject}</td>
                        <td className="text-end"><strong>{item.count}</strong></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        <div className="col-lg-6">
          <div className="card shadow-sm">
            <div className="card-header bg-white">
              <h5 className="mb-0">👥 User Roles</h5>
            </div>
            <div className="card-body">
              <div className="table-responsive">
                <table className="table table-sm mb-0">
                  <thead>
                    <tr>
                      <th>Role</th>
                      <th className="text-end">Count</th>
                    </tr>
                  </thead>
                  <tbody>
                    {analytics.roleStats.map((item, index) => (
                      <tr key={index}>
                        <td>
                          {item.role === 'admin' ? '👑' : '👤'} {item.role.charAt(0).toUpperCase() + item.role.slice(1)}
                        </td>
                        <td className="text-end"><strong>{item.count}</strong></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
