"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function LeaderboardPage() {
  const [leaderboard, setLeaderboard] = useState([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchLeaderboard() {
      try {
        setLoading(true);
        const res = await fetch('/api/results?limit=50');
        
        if (!res.ok) {
          throw new Error('Failed to fetch leaderboard');
        }
        
        const data = await res.json();
        
        if (data.success) {
          setLeaderboard(data.results);
        } else {
          throw new Error(data.error || 'Failed to load leaderboard');
        }
      } catch (err) {
        console.error('Error fetching leaderboard:', err);
        setError(err.message);
        
        // Fallback to localStorage if API fails
        const localData = JSON.parse(localStorage.getItem("leaderboard") || "[]");
        setLeaderboard(localData);
      } finally {
        setLoading(false);
      }
    }

    fetchLeaderboard();
  }, []);

  // Filter leaderboard by difficulty
  const filteredLeaderboard = filter === "all" 
    ? leaderboard 
    : leaderboard.filter(entry => entry.difficulty === filter);

  // Get top 10
  const top10 = filteredLeaderboard.slice(0, 10);

  const formatDate = (dateValue) => {
    const date = new Date(dateValue);
    return date.toLocaleDateString() + " " + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getPercentage = (score, total) => {
    return Math.round((score / total) * 100);
  };

  const getMedalEmoji = (position) => {
    if (position === 0) return "🥇";
    if (position === 1) return "🥈";
    if (position === 2) return "🥉";
    return `${position + 1}.`;
  };

  const clearLeaderboard = () => {
    if (confirm("Are you sure you want to clear the local leaderboard? (This won't affect MongoDB data)")) {
      localStorage.removeItem("leaderboard");
      // Refresh from MongoDB
      window.location.reload();
    }
  };

  if (loading) {
    return (
      <div className="container mt-5">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading leaderboard...</span>
          </div>
          <p className="mt-3">Loading leaderboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-4" style={{ maxWidth: 900 }}>
      <div className="text-center mb-4">
        <h1 className="display-4">🏆 Leaderboard</h1>
        <p className="text-muted">Top quiz performers</p>
        {error && (
          <div className="alert alert-warning" role="alert">
            <small>Using local data. {error}</small>
          </div>
        )}
      </div>

      {/* Filter Buttons */}
      <div className="d-flex justify-content-center gap-2 mb-4">
        <button
          className={`btn ${filter === "all" ? "btn-primary" : "btn-outline-primary"}`}
          onClick={() => setFilter("all")}
        >
          All
        </button>
        <button
          className={`btn ${filter === "easy" ? "btn-success" : "btn-outline-success"}`}
          onClick={() => setFilter("easy")}
        >
          😊 Easy
        </button>
        <button
          className={`btn ${filter === "medium" ? "btn-warning" : "btn-outline-warning"}`}
          onClick={() => setFilter("medium")}
        >
          🤔 Medium
        </button>
        <button
          className={`btn ${filter === "hard" ? "btn-danger" : "btn-outline-danger"}`}
          onClick={() => setFilter("hard")}
        >
          🔥 Hard
        </button>
      </div>

      {/* Leaderboard Table */}
      {top10.length === 0 ? (
        <div className="card p-5 text-center shadow">
          <h3 className="text-muted">No scores yet!</h3>
          <p>Be the first to complete a quiz and make it to the leaderboard.</p>
          <Link href="/" className="btn btn-success mt-3">
            Start Quiz
          </Link>
        </div>
      ) : (
        <div className="card shadow">
          <div className="table-responsive">
            <table className="table table-hover mb-0">
              <thead className="table-light">
                <tr>
                  <th scope="col" style={{ width: "60px" }}>Rank</th>
                  <th scope="col">Name</th>
                  <th scope="col">Subject</th>
                  <th scope="col">Score</th>
                  <th scope="col">Date</th>
                </tr>
              </thead>
              <tbody>
                {top10.map((entry, index) => (
                  <tr key={entry._id || index}>
                    <td className="fw-bold fs-5">{getMedalEmoji(index)}</td>
                    <td className="fw-bold">{entry.name}</td>
                    <td>
                      <div className="d-flex flex-column">
                        <small className="text-muted">{entry.subject || 'General'}</small>
                        <small className="text-muted" style={{ fontSize: '0.75rem' }}>
                          {entry.category || 'Mixed'}
                        </small>
                      </div>
                    </td>
                    <td>
                      <span className="badge bg-success fs-6">
                        {entry.score}/{entry.totalQuestions || entry.total}
                      </span>
                      <small className="text-muted ms-2">
                        ({getPercentage(entry.score, entry.totalQuestions || entry.total)}%)
                      </small>
                      <div>
                        <span className={`badge ${
                          entry.difficulty === "easy" ? "bg-success" :
                          entry.difficulty === "hard" ? "bg-danger" :
                          "bg-warning text-dark"
                        }`} style={{ fontSize: '0.7rem' }}>
                          {entry.difficulty}
                        </span>
                      </div>
                    </td>
                    <td>
                      <small className="text-muted">
                        {formatDate(entry.createdAt || entry.date)}
                      </small>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="d-flex gap-2 mt-4 justify-content-center">
        <Link href="/" className="btn btn-primary">
          🏠 Back to Home
        </Link>
        {leaderboard.length > 0 && (
          <button 
            className="btn btn-outline-danger"
            onClick={clearLeaderboard}
          >
            🗑️ Clear Local Data
          </button>
        )}
      </div>

      {/* Stats */}
      {leaderboard.length > 0 && (
        <div className="card mt-4 p-3 bg-light">
          <div className="row text-center">
            <div className="col-4">
              <h5 className="text-muted">Total Quizzes</h5>
              <h3>{leaderboard.length}</h3>
            </div>
            <div className="col-4">
              <h5 className="text-muted">Highest Score</h5>
              <h3>{leaderboard[0]?.score}/{leaderboard[0]?.totalQuestions || leaderboard[0]?.total}</h3>
            </div>
            <div className="col-4">
              <h5 className="text-muted">Top Player</h5>
              <h3>{leaderboard[0]?.name}</h3>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
