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
      <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="text-center">
          <div className="spinner-border text-primary"></div>
          <p className="mt-3">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mt-5">
        <div className="alert alert-danger">{error}</div>
        <Link href="/" className="btn btn-secondary">Back to Home</Link>
      </div>
    );
  }

  if (!analytics || analytics.totalQuizzes === 0) {
    return (
      <div className="container mt-5">
        <div className="card p-5 text-center">
          <h3>No Quiz Data Yet</h3>
          <p className="text-muted">Take some quizzes to see your analytics!</p>
          <Link href="/" className="btn btn-primary mt-3">Start Quiz</Link>
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
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="display-6">📊 Performance Analytics</h1>
        <Link href="/" className="btn btn-outline-secondary">
          ← Back
        </Link>
      </div>

      {/* Overview Cards */}
      <div className="row mb-4">
        <div className="col-md-3 mb-3">
          <div className="card shadow-sm h-100">
            <div className="card-body text-center">
              <h6 className="text-muted">Total Quizzes</h6>
              <h2 className="text-primary">{analytics.totalQuizzes}</h2>
            </div>
          </div>
        </div>
        <div className="col-md-3 mb-3">
          <div className="card shadow-sm h-100">
            <div className="card-body text-center">
              <h6 className="text-muted">Average Score</h6>
              <h2 className="text-success">{analytics.averageScore}%</h2>
            </div>
          </div>
        </div>
        <div className="col-md-3 mb-3">
          <div className="card shadow-sm h-100">
            <div className="card-body text-center">
              <h6 className="text-muted">Strong Areas</h6>
              <h2 className="text-info">{analytics.strongAreas.length}</h2>
            </div>
          </div>
        </div>
        <div className="col-md-3 mb-3">
          <div className="card shadow-sm h-100">
            <div className="card-body text-center">
              <h6 className="text-muted">Weak Areas</h6>
              <h2 className="text-warning">{analytics.weakAreas.length}</h2>
            </div>
          </div>
        </div>
      </div>

      {/* Score History Chart */}
      <div className="card shadow mb-4">
        <div className="card-header bg-primary text-white">
          <h5 className="mb-0">📈 Score History Over Time</h5>
        </div>
        <div className="card-body">
          <Line data={scoreHistoryData} options={chartOptions} />
        </div>
      </div>

      <div className="row mb-4">
        {/* Subject Performance */}
        <div className="col-lg-8 mb-4">
          <div className="card shadow h-100">
            <div className="card-header bg-info text-white">
              <h5 className="mb-0">📚 Performance by Subject</h5>
            </div>
            <div className="card-body">
              <Bar data={subjectData} options={chartOptions} />
            </div>
          </div>
        </div>

        {/* Difficulty Distribution */}
        <div className="col-lg-4 mb-4">
          <div className="card shadow h-100">
            <div className="card-header bg-warning text-dark">
              <h5 className="mb-0">🎯 By Difficulty</h5>
            </div>
            <div className="card-body d-flex align-items-center justify-content-center">
              <div style={{ maxWidth: '300px', width: '100%' }}>
                <Doughnut data={difficultyData} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Weak Areas */}
      {analytics.weakAreas.length > 0 && (
        <div className="card shadow mb-4 border-warning">
          <div className="card-header bg-warning text-dark">
            <h5 className="mb-0">⚠️ Areas Needing Improvement</h5>
          </div>
          <div className="card-body">
            <div className="row">
              {analytics.weakAreas.map((area, index) => (
                <div key={index} className="col-md-6 mb-3">
                  <div className="card bg-light">
                    <div className="card-body">
                      <div className="d-flex justify-content-between align-items-center">
                        <div>
                          <h6 className="mb-1">{area.name}</h6>
                          <small className="text-muted">{area.count} quiz(zes)</small>
                        </div>
                        <div className="text-end">
                          <h4 className="text-danger mb-0">{area.average}%</h4>
                        </div>
                      </div>
                      <div className="progress mt-2" style={{ height: '8px' }}>
                        <div
                          className="progress-bar bg-danger"
                          style={{ width: `${area.average}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="alert alert-info mt-3 mb-0">
              <strong>💡 Tip:</strong> Focus on these subjects to improve your overall performance!
            </div>
          </div>
        </div>
      )}

      {/* Strong Areas */}
      {analytics.strongAreas.length > 0 && (
        <div className="card shadow mb-4 border-success">
          <div className="card-header bg-success text-white">
            <h5 className="mb-0">🌟 Your Strong Areas</h5>
          </div>
          <div className="card-body">
            <div className="row">
              {analytics.strongAreas.map((area, index) => (
                <div key={index} className="col-md-6 mb-3">
                  <div className="card bg-light">
                    <div className="card-body">
                      <div className="d-flex justify-content-between align-items-center">
                        <div>
                          <h6 className="mb-1">{area.name}</h6>
                          <small className="text-muted">{area.count} quiz(zes)</small>
                        </div>
                        <div className="text-end">
                          <h4 className="text-success mb-0">{area.average}%</h4>
                        </div>
                      </div>
                      <div className="progress mt-2" style={{ height: '8px' }}>
                        <div
                          className="progress-bar bg-success"
                          style={{ width: `${area.average}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="alert alert-success mt-3 mb-0">
              <strong>🎉 Great job!</strong> Keep up the excellent work in these areas!
            </div>
          </div>
        </div>
      )}

      {/* Recent Quiz History */}
      <div className="card shadow">
        <div className="card-header bg-secondary text-white">
          <h5 className="mb-0">📋 Recent Quiz History</h5>
        </div>
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover mb-0">
              <thead className="table-light">
                <tr>
                  <th>#</th>
                  <th>Subject</th>
                  <th>Category</th>
                  <th>Difficulty</th>
                  <th>Score</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {analytics.scoreHistory.slice(-10).reverse().map((quiz, index) => (
                  <tr key={index}>
                    <td>{analytics.scoreHistory.length - index}</td>
                    <td>{quiz.subject}</td>
                    <td>
                      <span className="badge bg-info text-dark">{quiz.category}</span>
                    </td>
                    <td>
                      <span className={`badge ${
                        quiz.difficulty === 'easy' ? 'bg-success' :
                        quiz.difficulty === 'hard' ? 'bg-danger' :
                        'bg-warning text-dark'
                      }`}>
                        {quiz.difficulty}
                      </span>
                    </td>
                    <td>
                      <span className="badge bg-primary">
                        {quiz.score}/{quiz.total} ({quiz.percentage}%)
                      </span>
                    </td>
                    <td>
                      <small className="text-muted">
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
