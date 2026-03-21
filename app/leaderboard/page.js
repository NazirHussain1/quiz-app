"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Trophy, Medal, Crown, Filter, ChevronLeft, ChevronRight } from "lucide-react";

export default function LeaderboardPage() {
  const [leaderboard, setLeaderboard] = useState([]);
  const [filter, setFilter] = useState("all");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterSubject, setFilterSubject] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  const [userRank, setUserRank] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  
  const [categories, setCategories] = useState([]);
  const [subjects, setSubjects] = useState([]);

  useEffect(() => {
    checkAuth();
    fetchCategories();
    fetchSubjects();
  }, []);

  useEffect(() => {
    setCurrentPage(1); // Reset to page 1 when filters change
    fetchLeaderboard();
  }, [filter, filterCategory, filterSubject]);

  useEffect(() => {
    fetchLeaderboard();
  }, [currentPage]);

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
      params.append('page', currentPage);
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
        setTotalPages(data.totalPages || 1);
        setTotalCount(data.totalCount || data.count);
        
        // Calculate user's rank if logged in
        if (user) {
          const userIndex = data.results.findIndex(r => r.name === user.userName);
          if (userIndex !== -1) {
            setUserRank((currentPage - 1) * 50 + userIndex + 1);
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading leaderboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-6">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">🏆 Global Leaderboard</h1>
          <p className="text-gray-600">Top performers worldwide - {totalCount} total scores</p>
          {error && (
            <div className="bg-yellow-50 border-2 border-yellow-200 text-yellow-800 rounded-xl p-3 mt-4">
              <small>Using local data. {error}</small>
            </div>
          )}
          {user && userRank && (
            <div className="bg-blue-50 border-2 border-blue-200 text-blue-800 rounded-xl p-3 mt-4">
              <strong>Your Rank:</strong> #{userRank} out of {totalCount}
            </div>
          )}
        </div>

        {/* Filter Section */}
        <div className="bg-white rounded-2xl shadow-lg mb-6 overflow-hidden">
          <div className="bg-gray-700 text-white px-6 py-4">
            <h5 className="text-lg font-bold">🔍 Filter Results</h5>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Difficulty</label>
                <div className="flex flex-wrap gap-2">
                  <button
                    className={`px-4 py-2 rounded-xl font-medium transition-all duration-200 ${filter === "all" ? "bg-blue-600 text-white shadow-lg" : "border-2 border-blue-300 text-blue-600 hover:bg-blue-50"}`}
                    onClick={() => setFilter("all")}
                  >
                    All
                  </button>
                  <button
                    className={`px-4 py-2 rounded-xl font-medium transition-all duration-200 ${filter === "easy" ? "bg-green-500 text-white shadow-lg" : "border-2 border-green-300 text-green-600 hover:bg-green-50"}`}
                    onClick={() => setFilter("easy")}
                  >
                    😊 Easy
                  </button>
                  <button
                    className={`px-4 py-2 rounded-xl font-medium transition-all duration-200 ${filter === "medium" ? "bg-yellow-500 text-white shadow-lg" : "border-2 border-yellow-300 text-yellow-600 hover:bg-yellow-50"}`}
                    onClick={() => setFilter("medium")}
                  >
                    🤔 Medium
                  </button>
                  <button
                    className={`px-4 py-2 rounded-xl font-medium transition-all duration-200 ${filter === "hard" ? "bg-red-500 text-white shadow-lg" : "border-2 border-red-300 text-red-600 hover:bg-red-50"}`}
                    onClick={() => setFilter("hard")}
                  >
                    🔥 Hard
                  </button>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Category</label>
                <select
                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200 outline-none"
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
              
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Subject</label>
                <select
                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200 outline-none"
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
          <div className="bg-white rounded-2xl shadow-xl text-center p-8 md:p-12">
            <h3 className="text-2xl font-bold text-gray-400 mb-2">No scores yet!</h3>
            <p className="text-gray-600 mb-6">Be the first to complete a quiz and make it to the leaderboard.</p>
            <Link href="/" className="inline-block px-6 py-3 bg-green-500 text-white rounded-xl font-semibold hover:bg-green-600 transition-all duration-200 shadow-lg">
              Start Quiz
            </Link>
          </div>
        ) : (
          <>
            {/* Top 3 Podium - Desktop Only */}
            <div className="hidden md:grid md:grid-cols-3 gap-4 mb-6">
              {leaderboard.slice(0, 3).map((entry, index) => {
                const medals = ["🥇", "🥈", "🥉"];
                const colors = ["yellow", "gray", "orange"];
                const borderColors = ["border-yellow-400", "border-gray-400", "border-orange-400"];
                
                return (
                  <div key={entry._id || index} className={`bg-white rounded-2xl shadow-lg border-4 ${borderColors[index]} overflow-hidden`}>
                    <div className="p-6 flex flex-col items-center justify-center" style={{ minHeight: [180, 150, 120][index] }}>
                      <div className="text-6xl mb-3">{medals[index]}</div>
                      <h5 className="text-xl font-bold text-gray-900 mb-2">{entry.name}</h5>
                      <div className="mb-2">
                        <span className="px-4 py-2 bg-green-500 text-white rounded-full text-lg font-bold">
                          {entry.score}/{entry.totalQuestions || entry.total}
                        </span>
                      </div>
                      <small className="text-gray-500">{getPercentage(entry.score, entry.totalQuestions || entry.total)}%</small>
                      <small className="text-gray-500">{entry.subject || 'General'}</small>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Full Leaderboard Table */}
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
              <div className="bg-gray-800 text-white px-6 py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                <h5 className="text-lg font-bold">📊 Rankings ({totalCount})</h5>
                <span className="px-3 py-1 bg-white text-gray-800 rounded-full text-sm font-medium">
                  Page {currentPage} of {totalPages}
                </span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-100 sticky top-0">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-bold text-gray-700" style={{ width: "60px" }}>Rank</th>
                      <th className="px-4 py-3 text-left text-sm font-bold text-gray-700">Name</th>
                      <th className="hidden md:table-cell px-4 py-3 text-left text-sm font-bold text-gray-700">Category</th>
                      <th className="px-4 py-3 text-left text-sm font-bold text-gray-700">Subject</th>
                      <th className="px-4 py-3 text-left text-sm font-bold text-gray-700">Score</th>
                      <th className="hidden lg:table-cell px-4 py-3 text-left text-sm font-bold text-gray-700">Mode</th>
                      <th className="hidden xl:table-cell px-4 py-3 text-left text-sm font-bold text-gray-700">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leaderboard.map((entry, index) => {
                      const isCurrentUser = user && entry.name === user.userName;
                      const rowClass = isCurrentUser ? 'bg-blue-50' : 'hover:bg-gray-50';
                      const globalRank = (currentPage - 1) * 50 + index + 1;
                      
                      return (
                        <tr key={entry._id || index} className={`border-b border-gray-200 ${rowClass} transition-colors duration-150`}>
                          <td className="px-4 py-3 font-bold text-lg">
                            {globalRank <= 3 ? getMedalEmoji(globalRank - 1) : `${globalRank}.`}
                          </td>
                          <td className="px-4 py-3">
                            <div className="font-bold text-gray-900">
                              {entry.name}
                              {isCurrentUser && <span className="ml-2 px-2 py-1 bg-blue-600 text-white rounded-full text-xs">You</span>}
                            </div>
                          </td>
                          <td className="hidden md:table-cell px-4 py-3">
                            <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                              {entry.category || 'Mixed'}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <small className="text-gray-600">{entry.subject || 'General'}</small>
                          </td>
                          <td className="px-4 py-3">
                            <div>
                              <span className="px-3 py-1 bg-green-500 text-white rounded-full text-sm font-bold">
                                {entry.score}/{entry.totalQuestions || entry.total}
                              </span>
                              <small className="hidden sm:inline text-gray-500 ml-2">
                                ({getPercentage(entry.score, entry.totalQuestions || entry.total)}%)
                              </small>
                            </div>
                            <div className="mt-1">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                entry.difficulty === "easy" ? "bg-green-100 text-green-700" :
                                entry.difficulty === "hard" ? "bg-red-100 text-red-700" :
                                "bg-yellow-100 text-yellow-700"
                              }`}>
                                {entry.difficulty}
                              </span>
                            </div>
                          </td>
                          <td className="hidden lg:table-cell px-4 py-3">
                            {entry.examMode ? (
                              <div>
                                <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-medium">📝 Exam</span>
                                {entry.timeTaken && (
                                  <div>
                                    <small className="text-gray-500">{formatTime(entry.timeTaken)}</small>
                                  </div>
                                )}
                              </div>
                            ) : (
                              <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">Quiz</span>
                            )}
                          </td>
                          <td className="hidden xl:table-cell px-4 py-3">
                            <small className="text-gray-500">
                              {formatDate(entry.createdAt || entry.date)}
                            </small>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              {totalPages > 1 && (
                <div className="px-6 py-4 bg-gray-50">
                  <nav>
                    <ul className="flex justify-center items-center gap-2 flex-wrap">
                      <li>
                        <button 
                          className={`px-4 py-2 rounded-xl font-medium transition-all duration-200 ${currentPage === 1 ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-white border-2 border-gray-300 text-gray-700 hover:bg-gray-100'}`}
                          onClick={() => setCurrentPage(currentPage - 1)}
                          disabled={currentPage === 1}
                        >
                          Previous
                        </button>
                      </li>
                      {[...Array(totalPages)].map((_, i) => {
                        const pageNum = i + 1;
                        if (
                          pageNum === 1 || 
                          pageNum === totalPages || 
                          (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)
                        ) {
                          return (
                            <li key={pageNum}>
                              <button 
                                className={`px-4 py-2 rounded-xl font-medium transition-all duration-200 ${currentPage === pageNum ? 'bg-blue-600 text-white shadow-lg' : 'bg-white border-2 border-gray-300 text-gray-700 hover:bg-gray-100'}`}
                                onClick={() => setCurrentPage(pageNum)}
                              >
                                {pageNum}
                              </button>
                            </li>
                          );
                        } else if (pageNum === currentPage - 2 || pageNum === currentPage + 2) {
                          return <li key={pageNum} className="px-2 text-gray-400">...</li>;
                        }
                        return null;
                      })}
                      <li>
                        <button 
                          className={`px-4 py-2 rounded-xl font-medium transition-all duration-200 ${currentPage === totalPages ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-white border-2 border-gray-300 text-gray-700 hover:bg-gray-100'}`}
                          onClick={() => setCurrentPage(currentPage + 1)}
                          disabled={currentPage === totalPages}
                        >
                          Next
                        </button>
                      </li>
                    </ul>
                  </nav>
                </div>
              )}
            </div>
          </>
        )}

      {/* Action Buttons */}
      <div className="flex flex-wrap justify-center gap-3 mt-6">
        <Link href="/" className="px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-all duration-200 shadow-lg">
          🏠 Back to Home
        </Link>
        {!user && (
          <Link href="/login" className="px-6 py-3 bg-green-500 text-white rounded-xl font-semibold hover:bg-green-600 transition-all duration-200 shadow-lg">
            🔐 Login to Track Your Rank
          </Link>
        )}
        {leaderboard.length > 0 && (
          <button 
            className="px-6 py-3 border-2 border-red-300 text-red-600 rounded-xl font-semibold hover:bg-red-50 transition-all duration-200"
            onClick={clearLeaderboard}
          >
            🗑️ Clear Local Data
          </button>
        )}
      </div>

      {/* Stats Section */}
      {leaderboard.length > 0 && (
        <div className="bg-white rounded-2xl shadow-lg p-6 mt-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <h5 className="text-sm text-gray-600 mb-1">Total Scores</h5>
              <h3 className="text-2xl font-bold text-gray-900">{leaderboard.length}</h3>
            </div>
            <div>
              <h5 className="text-sm text-gray-600 mb-1">Highest Score</h5>
              <h3 className="text-2xl font-bold text-gray-900">{leaderboard[0]?.score}/{leaderboard[0]?.totalQuestions || leaderboard[0]?.total}</h3>
            </div>
            <div>
              <h5 className="text-sm text-gray-600 mb-1">Top Player</h5>
              <h3 className="text-2xl font-bold text-gray-900 truncate">{leaderboard[0]?.name}</h3>
            </div>
            <div>
              <h5 className="text-sm text-gray-600 mb-1">Avg Score</h5>
              <h3 className="text-2xl font-bold text-gray-900">
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
