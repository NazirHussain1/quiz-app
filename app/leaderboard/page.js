"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Trophy, Medal, Crown, Filter, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";

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

  const VALID_SUBJECTS = ["Mathematics", "Physics", "Chemistry", "Biology", "Computer Science"];

  useEffect(() => {
    checkAuth();
    fetchCategories();
    fetchSubjects();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
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
      setError(null);
      
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

  const getRowBgClass = (index, isCurrentUser) => {
    const globalRank = (currentPage - 1) * 50 + index;
    if (isCurrentUser) return "bg-blue-50 border-l-4 border-blue-500";
    if (globalRank === 0) return "bg-gradient-to-r from-yellow-50 to-yellow-100 border-l-4 border-yellow-400";
    if (globalRank === 1) return "bg-gradient-to-r from-gray-50 to-gray-100 border-l-4 border-gray-400";
    if (globalRank === 2) return "bg-gradient-to-r from-orange-50 to-orange-100 border-l-4 border-orange-400";
    return "hover:bg-gray-50";
  };

  if (loading && leaderboard.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-16 h-16 text-blue-500 animate-spin mx-auto mb-4" />
          <p className="text-xl font-semibold text-gray-700">Loading leaderboard...</p>
          <p className="text-sm text-gray-500 mt-2">Fetching top scores</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-6">
          <div className="flex items-center justify-center gap-3 mb-2">
            <Trophy className="w-10 h-10 text-yellow-500" />
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900">Global Leaderboard</h1>
            <Trophy className="w-10 h-10 text-yellow-500" />
          </div>
          <p className="text-gray-600">Top performers worldwide - {totalCount.toLocaleString()} total scores</p>
          {error && (
            <div className="bg-yellow-50 border-2 border-yellow-200 text-yellow-800 rounded-xl p-3 mt-4 max-w-2xl mx-auto">
              <small>⚠️ Using local data. {error}</small>
            </div>
          )}
          {user && userRank && (
            <div className="bg-blue-50 border-2 border-blue-200 text-blue-800 rounded-xl p-3 mt-4 max-w-2xl mx-auto">
              <strong>Your Rank:</strong> #{userRank} out of {totalCount.toLocaleString()}
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl shadow-lg mb-6 overflow-hidden">
          <div className="bg-gradient-to-r from-gray-700 to-gray-800 text-white px-6 py-4 flex items-center gap-2">
            <Filter className="w-5 h-5" />
            <h5 className="text-lg font-bold">Filter Results</h5>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Subject</label>
                <select
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200 outline-none bg-white cursor-pointer font-medium"
                  value={filterSubject}
                  onChange={(e) => setFilterSubject(e.target.value)}
                >
                  <option value="all">All Subjects</option>
                  {VALID_SUBJECTS.map((subj) => (
                    <option key={subj} value={subj}>
                      {subj}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Difficulty</label>
                <select
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200 outline-none bg-white cursor-pointer font-medium"
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                >
                  <option value="all">All Difficulties</option>
                  <option value="easy">😊 Easy</option>
                  <option value="medium">🤔 Medium</option>
                  <option value="hard">🔥 Hard</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Category</label>
                <select
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200 outline-none bg-white cursor-pointer font-medium"
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
            </div>
          </div>
        </div>

        {loading && leaderboard.length > 0 && (
          <div className="bg-blue-50 border-2 border-blue-200 text-blue-700 rounded-xl p-3 mb-4 flex items-center justify-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span className="font-medium">Updating leaderboard...</span>
          </div>
        )}

        {!loading && leaderboard.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-xl text-center p-12">
            <div className="text-6xl mb-4">🏆</div>
            <h3 className="text-2xl font-bold text-gray-400 mb-2">No scores yet!</h3>
            <p className="text-gray-600 mb-6">Be the first to complete a quiz and make it to the leaderboard.</p>
            <Link href="/" className="inline-block px-6 py-3 bg-green-500 text-white rounded-xl font-semibold hover:bg-green-600 transition-all duration-200 shadow-lg transform hover:scale-105">
              Start Quiz
            </Link>
          </div>
        ) : (
          <>
            {leaderboard.length >= 3 && currentPage === 1 && (
              <div className="hidden md:grid md:grid-cols-3 gap-4 mb-6">
                {leaderboard.slice(0, 3).map((entry, index) => {
                  const medals = ["🥇", "🥈", "🥉"];
                  const bgGradients = [
                    "bg-gradient-to-br from-yellow-100 to-yellow-200",
                    "bg-gradient-to-br from-gray-100 to-gray-200",
                    "bg-gradient-to-br from-orange-100 to-orange-200"
                  ];
                  const borderColors = ["border-yellow-400", "border-gray-400", "border-orange-400"];
                  const heights = [200, 170, 140];
                  
                  return (
                    <div key={entry._id || index} className={`${bgGradients[index]} rounded-2xl shadow-lg border-4 ${borderColors[index]} overflow-hidden transform hover:scale-105 transition-all duration-200`}>
                      <div className="p-6 flex flex-col items-center justify-center" style={{ minHeight: heights[index] }}>
                        <div className="text-7xl mb-3 animate-bounce">{medals[index]}</div>
                        <h5 className="text-xl font-bold text-gray-900 mb-2 truncate max-w-full px-2">{entry.name}</h5>
                        <div className="mb-2">
                          <span className="px-5 py-2 bg-green-500 text-white rounded-full text-lg font-bold shadow-md">
                            {entry.score}/{entry.totalQuestions || entry.total}
                          </span>
                        </div>
                        <div className="text-sm font-semibold text-gray-600">{getPercentage(entry.score, entry.totalQuestions || entry.total)}% Accuracy</div>
                        <div className="text-xs text-gray-500 mt-1">{entry.subject || 'General'}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
              <div className="bg-gradient-to-r from-gray-800 to-gray-900 text-white px-6 py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                <h5 className="text-lg font-bold flex items-center gap-2">
                  <Medal className="w-5 h-5" />
                  Rankings ({totalCount.toLocaleString()})
                </h5>
                <span className="px-4 py-1.5 bg-white text-gray-800 rounded-full text-sm font-bold shadow-md">
                  Page {currentPage} of {totalPages}
                </span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-100 sticky top-0 z-10 shadow-sm">
                    <tr>
                      <th className="px-4 py-4 text-left text-sm font-bold text-gray-700 border-b-2 border-gray-200" style={{ width: "70px" }}>Rank</th>
                      <th className="px-4 py-4 text-left text-sm font-bold text-gray-700 border-b-2 border-gray-200">Name</th>
                      <th className="hidden md:table-cell px-4 py-4 text-left text-sm font-bold text-gray-700 border-b-2 border-gray-200">Category</th>
                      <th className="px-4 py-4 text-left text-sm font-bold text-gray-700 border-b-2 border-gray-200">Subject</th>
                      <th className="px-4 py-4 text-left text-sm font-bold text-gray-700 border-b-2 border-gray-200">Score</th>
                      <th className="hidden lg:table-cell px-4 py-4 text-left text-sm font-bold text-gray-700 border-b-2 border-gray-200">Mode</th>
                      <th className="hidden xl:table-cell px-4 py-4 text-left text-sm font-bold text-gray-700 border-b-2 border-gray-200">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leaderboard.map((entry, index) => {
                      const isCurrentUser = user && entry.name === user.userName;
                      const globalRank = (currentPage - 1) * 50 + index + 1;
                      const rowClass = getRowBgClass(index, isCurrentUser);
                      
                      return (
                        <tr key={entry._id || index} className={`border-b border-gray-200 ${rowClass} transition-all duration-150 cursor-pointer`}>
                          <td className="px-4 py-4 font-bold text-lg">
                            {globalRank <= 3 ? (
                              <span className="text-2xl">{getMedalEmoji(globalRank - 1)}</span>
                            ) : (
                              <span className="text-gray-600">{globalRank}.</span>
                            )}
                          </td>
                          <td className="px-4 py-4">
                            <div className="font-bold text-gray-900 flex items-center gap-2">
                              {entry.name}
                              {isCurrentUser && (
                                <span className="px-2 py-1 bg-blue-600 text-white rounded-full text-xs font-bold shadow-sm">
                                  You
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="hidden md:table-cell px-4 py-4">
                            <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                              {entry.category || 'Mixed'}
                            </span>
                          </td>
                          <td className="px-4 py-4">
                            <span className="text-sm text-gray-600 font-medium">{entry.subject || 'General'}</span>
                          </td>
                          <td className="px-4 py-4">
                            <div className="flex flex-col gap-1">
                              <span className="px-3 py-1 bg-green-500 text-white rounded-full text-sm font-bold inline-block w-fit shadow-sm">
                                {entry.score}/{entry.totalQuestions || entry.total}
                              </span>
                              <span className="text-xs text-gray-500 font-medium">
                                {getPercentage(entry.score, entry.totalQuestions || entry.total)}% accuracy
                              </span>
                              <span className={`px-2 py-0.5 rounded-full text-xs font-medium inline-block w-fit ${
                                entry.difficulty === "easy" ? "bg-green-100 text-green-700" :
                                entry.difficulty === "hard" ? "bg-red-100 text-red-700" :
                                "bg-yellow-100 text-yellow-700"
                              }`}>
                                {entry.difficulty}
                              </span>
                            </div>
                          </td>
                          <td className="hidden lg:table-cell px-4 py-4">
                            {entry.examMode ? (
                              <div className="flex flex-col gap-1">
                                <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-medium inline-block w-fit">
                                  📝 Exam
                                       </button>
        )}
      </div>

      {leaderboard.length > 0 && (
        <div className="bg-white rounded-2xl shadow-lg p-6 mt-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div className="p-4 bg-blue-50 rounded-xl">
              <h5 className="text-sm text-gray-600 mb-1 font-semibold">Total Scores</h5>
              <h3 className="text-3xl font-bold text-blue-600">{totalCount.toLocaleString()}</h3>
            </div>
            <div classNameransition-all duration-200 shadow-lg transform hover:scale-105 flex items-center gap-2">
            🔐 Login to Track Your Rank
          </Link>
        )}
        {leaderboard.length > 0 && (
          <button 
            className="px-6 py-3 border-2 border-red-300 text-red-600 rounded-xl font-semibold hover:bg-red-50 transition-all duration-200 transform hover:scale-105"
            onClick={clearLeaderboard}
          >
            🗑️ Clear Local Data
"px-6 py-3 bg-green-500 text-white rounded-xl font-semibold hover:bg-green-600 t       </li>
                    </ul>
                  </nav>
                </div>
              )}
            </div>
          </>
        )}

      <div className="flex flex-wrap justify-center gap-3 mt-6">
        <Link href="/" className="px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-all duration-200 shadow-lg transform hover:scale-105 flex items-center gap-2">
          🏠 Back to Home
        </Link>
        {!user && (
          <Link href="/login" className=        <ChevronRight className="w-4 h-4" />
                        </button>
               ap-1 ${
                            currentPage === totalPages 
                              ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                              : 'bg-white border-2 border-gray-300 text-gray-700 hover:bg-gray-100 hover:border-gray-400 shadow-sm'
                          }`}
                          onClick={() => setCurrentPage(currentPage + 1)}
                          disabled={currentPage === totalPages}
                        >
                          Next
                                   className={`px-4 py-2 rounded-xl font-medium transition-all duration-200 flex items-center g            >
                                {pageNum}
                              </button>
                            </li>
                          );
                        } else if (pageNum === currentPage - 2 || pageNum === currentPage + 2) {
                          return <li key={pageNum} className="px-2 text-gray-400 font-bold">...</li>;
                        }
                        return null;
                      })}
                      <li>
                        <button 
         ay-700 hover:bg-gray-100 hover:border-gray-400 shadow-sm'
                                }`}
                                onClick={() => setCurrentPage(pageNum)}
                  eNum <= currentPage + 1)
                        ) {
                          return (
                            <li key={pageNum}>
                              <button 
                                className={`px-4 py-2 rounded-xl font-medium transition-all duration-200 ${
                                  currentPage === pageNum 
                                    ? 'bg-blue-600 text-white shadow-lg transform scale-110' 
                                    : 'bg-white border-2 border-gray-300 text-gr       disabled={currentPage === 1}
                        >
                          <ChevronLeft className="w-4 h-4" />
                          Previous
                        </button>
                      </li>
                      {[...Array(totalPages)].map((_, i) => {
                        const pageNum = i + 1;
                        if (
                          pageNum === 1 || 
                          pageNum === totalPages || 
                          (pageNum >= currentPage - 1 && pagnClick={() => setCurrentPage(currentPage - 1)}
                    gap-2 flex-wrap">
                      <li>
                        <button 
                          className={`px-4 py-2 rounded-xl font-medium transition-all duration-200 flex items-center gap-1 ${
                            currentPage === 1 
                              ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                              : 'bg-white border-2 border-gray-300 text-gray-700 hover:bg-gray-100 hover:border-gray-400 shadow-sm'
                          }`}
                          ov className="px-6 py-4 bg-gray-50 border-t-2 border-gray-200">
                  <nav>
                    <ul className="flex justify-center items-center                  </td>
                          <td className="hidden xl:table-cell px-4 py-4">
                            <span className="text-xs text-gray-500">
                              {formatDate(entry.createdAt || entry.date)}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              {totalPages > 1 && (
                <di )}
           </span>
                                {entry.timeTaken && (
                                  <span className="text-xs text-gray-500">{formatTime(entry.timeTaken)}</span>
                                )}
                              </div>
                            ) : (
                              <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium inline-block w-fit">
                                Quiz
                              </span>
                           