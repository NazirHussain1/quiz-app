"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Trophy, Medal, Award, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";

export default function LeaderboardPage() {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [user, setUser] = useState(null);

  useEffect(() => {
    checkAuth();
    fetchLeaderboard();
  }, []);

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

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/results");
      const data = await res.json();
      
      if (data.success) {
        setLeaderboard(data.results || []);
      }
    } catch (error) {
      console.error("Failed to fetch leaderboard:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredLeaderboard = leaderboard.filter(entry => {
    if (filter === "all") return true;
    return entry.difficulty === filter;
  });

  const getRankIcon = (index) => {
    if (index === 0) return <Trophy className="w-6 h-6 text-yellow-500" />;
    if (index === 1) return <Medal className="w-6 h-6 text-gray-400" />;
    if (index === 2) return <Award className="w-6 h-6 text-orange-600" />;
    return <span className="text-gray-500 font-bold">{index + 1}</span>;
  };

  const getRankBadge = (index) => {
    if (index === 0) return "bg-gradient-to-r from-yellow-400 to-yellow-600 text-white";
    if (index === 1) return "bg-gradient-to-r from-gray-300 to-gray-500 text-white";
    if (index === 2) return "bg-gradient-to-r from-orange-400 to-orange-600 text-white";
    return "bg-white";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-8 px-4">
      <div className="max-w-5xl mx-auto">
        <motion.div 
          className="text-center mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center justify-center gap-3 mb-3">
            <Trophy className="w-12 h-12 text-yellow-500" />
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Leaderboard
            </h1>
            <Trophy className="w-12 h-12 text-yellow-500" />
          </div>
          <p className="text-gray-600 text-lg">Top performers worldwide</p>
        </motion.div>

        {/* Filter Buttons */}
        <motion.div 
          className="flex flex-wrap justify-center gap-3 mb-6"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.3 }}
        >
          <button
            onClick={() => setFilter("all")}
            className={`px-6 py-2 rounded-xl font-semibold transition-all duration-200 ${
              filter === "all"
                ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg"
                : "bg-white text-gray-700 hover:bg-gray-50 border-2 border-gray-200"
            }`}
          >
            All Levels
          </button>
          <button
            onClick={() => setFilter("easy")}
            className={`px-6 py-2 rounded-xl font-semibold transition-all duration-200 ${
              filter === "easy"
                ? "bg-green-500 text-white shadow-lg"
                : "bg-white text-gray-700 hover:bg-gray-50 border-2 border-gray-200"
            }`}
          >
            😊 Easy
          </button>
          <button
            onClick={() => setFilter("medium")}
            className={`px-6 py-2 rounded-xl font-semibold transition-all duration-200 ${
              filter === "medium"
                ? "bg-yellow-500 text-white shadow-lg"
                : "bg-white text-gray-700 hover:bg-gray-50 border-2 border-gray-200"
            }`}
          >
            🤔 Medium
          </button>
          <button
            onClick={() => setFilter("hard")}
            className={`px-6 py-2 rounded-xl font-semibold transition-all duration-200 ${
              filter === "hard"
                ? "bg-red-500 text-white shadow-lg"
                : "bg-white text-gray-700 hover:bg-gray-50 border-2 border-gray-200"
            }`}
          >
            🔥 Hard
          </button>
        </motion.div>

        {loading ? (
          <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-4 border-blue-500 mb-4"></div>
            <p className="text-gray-600">Loading leaderboard...</p>
          </div>
        ) : filteredLeaderboard.length === 0 ? (
          <motion.div 
            className="bg-white rounded-2xl shadow-xl p-12 text-center"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <TrendingUp className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">No Results Yet</h2>
            <p className="text-gray-600 mb-6">
              Be the first to complete a quiz and claim the top spot!
            </p>
            <Link 
              href="/" 
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-semibold hover:from-blue-600 hover:to-purple-700 transition-all duration-200 shadow-lg"
            >
              Start a Quiz
            </Link>
          </motion.div>
        ) : (
          <motion.div 
            className="bg-white rounded-2xl shadow-xl overflow-hidden"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
                  <tr>
                    <th className="px-4 py-4 text-left font-semibold">Rank</th>
                    <th className="px-4 py-4 text-left font-semibold">Player</th>
                    <th className="px-4 py-4 text-left font-semibold hidden md:table-cell">Category</th>
                    <th className="px-4 py-4 text-left font-semibold hidden sm:table-cell">Subject</th>
                    <th className="px-4 py-4 text-center font-semibold">Score</th>
                    <th className="px-4 py-4 text-center font-semibold hidden lg:table-cell">Difficulty</th>
                    <th className="px-4 py-4 text-center font-semibold hidden xl:table-cell">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLeaderboard.map((entry, index) => (
                    <motion.tr
                      key={entry._id || index}
                      className={`border-b border-gray-100 hover:bg-blue-50 transition-colors ${getRankBadge(index)}`}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05, duration: 0.3 }}
                    >
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          {getRankIcon(index)}
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <span className="font-semibold text-gray-900">{entry.name || "Anonymous"}</span>
                      </td>
                      <td className="px-4 py-4 text-gray-600 hidden md:table-cell">
                        {entry.category || "General"}
                      </td>
                      <td className="px-4 py-4 text-gray-600 hidden sm:table-cell">
                        {entry.subject || "Mixed"}
                      </td>
                      <td className="px-4 py-4 text-center">
                        <span className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-700 rounded-full font-bold">
                          {entry.score}/{entry.totalQuestions}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-center hidden lg:table-cell">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                          entry.difficulty === "easy" ? "bg-green-100 text-green-700" :
                          entry.difficulty === "hard" ? "bg-red-100 text-red-700" :
                          "bg-yellow-100 text-yellow-700"
                        }`}>
                          {entry.difficulty || "medium"}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-center text-gray-500 text-sm hidden xl:table-cell">
                        {entry.date ? new Date(entry.date).toLocaleDateString() : "N/A"}
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        <motion.div 
          className="text-center mt-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
        >
          <Link 
            href="/" 
            className="inline-flex items-center gap-2 px-6 py-3 bg-white text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-all duration-200 shadow-md"
          >
            ← Back to Home
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
