"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function LeaderboardPage() {
  const [leaderboard, setLeaderboard] = useState([]);
  const [filter, setFilter] = useState("all");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterSubject, setFilterSubject] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  const [userRank, setUserRank] = useState(null);
  
  const [categories, setCategories] = useState([]);
  const [subjects, setSubjects] = useState([]);

  useEffect(() => {
    checkAuth();
    fetchCategories();
    fetchSubjects();
  }, []);

  useEffect(() => {
    fetchLeaderboard();
  }, [filter, filterCategory, filterSubject]);

  const checkAuth = async () => {
    try {
      const res = await fetch("/api/auth/me");
      const data = await res.json();
      
      if (data.success) {
        setUser(data.user);
      }
    } catch (error) {
      console.error("Auth check failed:", error);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await fetch("/api/questions/categories");
      const data = await res.json();
      if (data.success) {
        setCategories(data.categories);
      }
    } catch (err) {
      console.error("Error fetching categories:", err);
    }
  };

  const fetchSubjects = async () => {
    try {
      const res = await fetch("/api/questions/subjects");
      const data = await res.json();
      if (data.success) {
        setSubjects(data.subjects);
      }
    } catch (err) {
      console.error("Error fetching subjects:", err);
    }
  };

  async function fetchLeaderboard() {
    try {
      setLoading(true);
      
      const params = new URLSearchParams();
      params.append('limit', '50');
      
      if (filter !== "all") {
        params.append('difficulty', filter);
      }
      if (filterCategory !== "all") {
        params.append('category', filterCategory);
      }
      if (filterSubject !== "all") {
        params.append('subject', filterSubject);
      }
      
      const res = await fetch(`/api/results?${params}`);
      
      if (!res.ok) {
        throw new Error('Failed to fetch leaderboard');
      }
      
      const data = await res.json();
      
      if (data.success) {
        setLeaderboard(data.results);
        
        // Calculate user's rank if logged in
        if (user) {
          const userIndex = data.results.findIndex(r => r.name === user.userName);
          if (userIndex !== -1) {
            setUserRank(userIndex + 1);
          } else {
            setUserRank(null);
          }
        }
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

  const formatDate = (dateValue) => {
    const date = new Date(dateValue);
    return date.toLocaleDateString() + " " + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatTime = (seconds) => {
    if (!seconds) return "N/A";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
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
    <div className="container mt-4" style={{ maxWidth: 1200 }}>
      <div className="text-center mb-4">
        <h1 className="display-4">🏆 Global Leaderboard</h1>
        <p className="text-muted">Top 50 quiz performers worldwide</p>
        {error && (
          <div className="alert alert-warning" role="alert">
            <small>Using local data. {error}</small>
          </div>
        )}
        {user && userRank && (
          <div className="alert alert-info">
            <strong>Your Rank:</strong> #{userRank} out of {leaderboard.length}
          </div>
        )}
      </div>

      {/* Filter Section */}
      <div className="card shadow mb-4">
        <div className="card-header bg-secondary text-white">
          <h5 className="mb-0">🔍 Filter Results</h5>
        </div>
        <div className="card-body">
          <div className="row g-3">
            <div className="col-md-4">
              <label className="form-label fw-bold">Difficulty</label>
              <div className="d-flex gap-2 flex-wrap">
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
            </div>
            
            <div className="col-md-4">
              <label className="form-label fw-bold">Category</label>
              <select
                className="form-select"
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
              >
                <option value="all">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="col-md-4">
              <label className="form-label fw-bold">Subject</label>
              <select
                className="form-select"
                value={filterSubject}
                onChange={(e) => setFilterSubject(e.target.value)}
              >
                <option value="all">All Subjects</option>
                {subjects.map((subj) => (
                  <option key={subj} value={subj}>
                    {subj}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Leaderboard Table */}
      {leaderboard.length === 0 ? (
        <div className="card p-5 text-center shadow">
          <h3 className="text-muted">No scores yet!</h3>
          <p>Be the first to complete a quiz and make it to the leaderboard.</p>
          <Link href="/" className="btn btn-success mt-3">
            Start Quiz
          </Link>
        </div>
      ) : (
        <>
          {/* Top 3 Podium - Desktop Only */}
          <div className="d-none d-md-block mb-4">
            <div className="row text-center">
              {leaderboard.slice(0, 3).map((entry, index) => {
                const medals = ["🥇", "🥈", "🥉"];
                const colors = ["warning", "secondary", "danger"];
                const heights = [180, 150, 120];
                
                return (
                  <div key={entry._id || index} className="col-4">
                    <div className={`card shadow-sm border-${colors[index]} h-100`}>
                      <div className="card-body d-flex flex-column justify-content-center" style={{ minHeight: heights[index] }}>
                        <div className="display-1 mb-2">{medals[index]}</div>
                        <h5 className="fw-bold">{entry.name}</h5>
                        <div className="mb-2">
                          <span className="badge bg-success fs-5">
                            {entry.score}/{entry.totalQuestions || entry.total}
                          </span>
                        </div>
                        <small className="text-muted">{getPercentage(entry.score, entry.totalQuestions || entry.total)}%</small>
                        <small className="text-muted">{entry.subject || 'General'}</small>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Full Leaderboard Table */}
          <div className="card shadow">
            <div className="card-header bg-dark text-white d-flex justify-content-between align-items-center">
              <h5 className="mb-0">📊 Rankings ({leaderboard.length})</h5>
              <span className="badge bg-light text-dark">Top 50</span>
            </div>
            <div className="card-body p-0">
              <div className="table-responsive">
                <table className="table table-hover mb-0">
                  <thead className="table-light sticky-top">
                    <tr>
                      <th style={{ width: "60px" }}>Rank</th>
                      <th>Name</th>
                      <th className="d-none d-md-table-cell">Category</th>
                      <th>Subject</th>
                      <th>Score</th>
                      <th className="d-none d-lg-table-cell">Mode</th>
                      <th className="d-none d-xl-table-cell">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leaderboard.map((entry, index) => {
                      const isCurrentUser = user && entry.name === user.userName;
                      const rowClass = isCurrentUser ? 'table-primary' : '';
                      
                      return (
                        <tr key={entry._id || index} className={rowClass}>
                          <td className="fw-bold fs-5">
                            {getMedalEmoji(index)}
                          </td>
                          <td>
                            <div className="fw-bold">
                              {entry.name}
                              {isCurrentUser && <span className="badge bg-primary ms-2">You</span>}
                            </div>
                          </td>
                          <td className="d-none d-md-table-cell">
                            <span className="badge bg-info text-dark">
                              {entry.category || 'Mixed'}
                            </span>
                          </td>
                          <td>
                            <small className="text-muted">{entry.subject || 'General'}</small>
                          </td>
                          <td>
                            <div>
                              <span className="badge bg-success fs-6">
                                {entry.score}/{entry.totalQuestions || entry.total}
                              </span>
                              <small className="text-muted ms-2 d-none d-sm-inline">
                                ({getPercentage(entry.score, entry.totalQuestions || entry.total)}%)
                              </small>
                            </div>
                            <div className="mt-1">
                              <span className={`badge ${
                                entry.difficulty === "easy" ? "bg-success" :
                                entry.difficulty === "hard" ? "bg-danger" :
                                "bg-warning text-dark"
                              }`} style={{ fontSize: '0.7rem' }}>
                                {entry.difficulty}
                              </span>
                            </div>
                          </td>
                          <td className="d-none d-lg-table-cell">
                            {entry.examMode ? (
                              <div>
                                <span className="badge bg-warning text-dark">📝 Exam</span>
                                {entry.timeTaken && (
                                  <div>
                                    <small className="text-muted">{formatTime(entry.timeTaken)}</small>
                                  </div>
                                )}
                              </div>
                            ) : (
                              <span className="badge bg-primary">Quiz</span>
                            )}
                          </td>
                          <td className="d-none d-xl-table-cell">
                            <small className="text-muted">
                              {formatDate(entry.createdAt || entry.date)}
                            </small>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Action Buttons */}
      <div className="d-flex gap-2 mt-4 justify-content-center flex-wrap">
        <Link href="/" className="btn btn-primary">
          🏠 Back to Home
        </Link>
        {!user && (
          <Link href="/login" className="btn btn-success">
            🔐 Login to Track Your Rank
          </Link>
        )}
        {leaderboard.length > 0 && (
          <button 
            className="btn btn-outline-danger"
            onClick={clearLeaderboard}
          >
            🗑️ Clear Local Data
          </button>
        )}
      </div>

      {/* Stats Section */}
      {leaderboard.length > 0 && (
        <div className="card mt-4 p-3 bg-light shadow-sm">
          <div className="row text-center">
            <div className="col-6 col-md-3">
              <h5 className="text-muted">Total Scores</h5>
              <h3>{leaderboard.length}</h3>
            </div>
            <div className="col-6 col-md-3">
              <h5 className="text-muted">Highest Score</h5>
              <h3>{leaderboard[0]?.score}/{leaderboard[0]?.totalQuestions || leaderboard[0]?.total}</h3>
            </div>
            <div className="col-6 col-md-3">
              <h5 className="text-muted">Top Player</h5>
              <h3 className="text-truncate">{leaderboard[0]?.name}</h3>
            </div>
            <div className="col-6 col-md-3">
              <h5 className="text-muted">Avg Score</h5>
              <h3>
                {Math.round(
                  leaderboard.reduce((sum, e) => sum + getPercentage(e.score, e.totalQuestions || e.total), 0) / 
                  leaderboard.length
                )}%
              </h3>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
