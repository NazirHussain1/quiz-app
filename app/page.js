"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Play, Trophy, BookOpen, Target, Sparkles } from "lucide-react";

export default function HomePage() {
  const router = useRouter();
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState("");
  const [selectedDifficulty, setSelectedDifficulty] = useState("medium");
  const [playerName, setPlayerName] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchSubjects() {
      try {
        setLoading(true);
        const res = await fetch("/api/questions/subjects");
        
        if (!res.ok) {
          throw new Error("Failed to fetch subjects");
        }
        
        const data = await res.json();
        if (data.success) {
          setSubjects(data.subjects);
        } else {
          throw new Error(data.error || "Failed to load subjects");
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchSubjects();
    
    const savedName = localStorage.getItem("playerName");
    if (savedName) {
      setPlayerName(savedName);
    }
  }, []);

  const handleStartQuiz = (e) => {
    e.preventDefault();
    
    if (!playerName.trim()) {
      alert("Please enter your name to start the quiz!");
      return;
    }
    
    localStorage.setItem("playerName", playerName.trim());
    const url = `/quiz?${selectedSubject ? `subject=${selectedSubject}&` : ""}difficulty=${selectedDifficulty}`;
    router.push(url);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center px-4 py-8">
      <div className="max-w-2xl w-full">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl mb-4 shadow-lg">
            <Sparkles className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-3">
            Quiz Master
          </h1>
          <p className="text-xl text-gray-600">
            Test your knowledge with fun and challenging questions!
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
          <form onSubmit={handleStartQuiz} className="space-y-6">
            <div>
              <label htmlFor="player-name" className="block text-sm font-semibold text-gray-700 mb-2">
                Your Name
              </label>
              <input
                type="text"
                id="player-name"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200 outline-none"
                placeholder="Enter your name"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                maxLength={30}
                required
              />
            </div>
            
            <div>
              <label htmlFor="subject-select" className="block text-sm font-semibold text-gray-700 mb-2">
                Quiz Subject
              </label>
              
              {loading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                </div>
              ) : error ? (
                <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 text-red-700">
                  {error}
                </div>
              ) : (
                <select
                  id="subject-select"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200 outline-none bg-white"
                  value={selectedSubject}
                  onChange={(e) => setSelectedSubject(e.target.value)}
                >
                  <option value="">All Subjects (Random)</option>
                  {subjects.map((subject) => (
                    <option key={subject} value={subject}>
                      {subject}
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Difficulty Level
              </label>
              <div className="grid grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedDifficulty("easy")}
                  className={`py-3 px-4 rounded-xl font-medium transition-all duration-200 ${
                    selectedDifficulty === "easy"
                      ? "bg-green-500 text-white shadow-lg scale-105"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  <span className="text-xl mb-1 block">😊</span>
                  Easy
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedDifficulty("medium")}
                  className={`py-3 px-4 rounded-xl font-medium transition-all duration-200 ${
                    selectedDifficulty === "medium"
                      ? "bg-yellow-500 text-white shadow-lg scale-105"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  <span className="text-xl mb-1 block">🤔</span>
                  Medium
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedDifficulty("hard")}
                  className={`py-3 px-4 rounded-xl font-medium transition-all duration-200 ${
                    selectedDifficulty === "hard"
                      ? "bg-red-500 text-white shadow-lg scale-105"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  <span className="text-xl mb-1 block">🔥</span>
                  Hard
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-4 rounded-xl font-semibold text-lg hover:from-blue-600 hover:to-purple-700 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
            >
              <Play className="w-5 h-5" />
              Start Quiz
            </button>
          </form>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            href="/leaderboard"
            className="bg-white rounded-xl p-6 shadow-md hover:shadow-xl transition-all duration-200 transform hover:scale-105 flex flex-col items-center gap-2 text-center group"
          >
            <Trophy className="w-8 h-8 text-yellow-500 group-hover:scale-110 transition-transform" />
            <span className="font-semibold text-gray-800">Leaderboard</span>
            <span className="text-sm text-gray-500">View top scores</span>
          </Link>
          
          <Link
            href="/subjects"
            className="bg-white rounded-xl p-6 shadow-md hover:shadow-xl transition-all duration-200 transform hover:scale-105 flex flex-col items-center gap-2 text-center group"
          >
            <BookOpen className="w-8 h-8 text-blue-500 group-hover:scale-110 transition-transform" />
            <span className="font-semibold text-gray-800">Subjects</span>
            <span className="text-sm text-gray-500">Browse by topic</span>
          </Link>
          
          <Link
            href="/analytics"
            className="bg-white rounded-xl p-6 shadow-md hover:shadow-xl transition-all duration-200 transform hover:scale-105 flex flex-col items-center gap-2 text-center group"
          >
            <Target className="w-8 h-8 text-purple-500 group-hover:scale-110 transition-transform" />
            <span className="font-semibold text-gray-800">Analytics</span>
            <span className="text-sm text-gray-500">Track progress</span>
          </Link>
        </div>

        <div className="text-center mt-8 text-gray-500 text-sm">
          <p>Pakistan Textbook Based Quiz App</p>
        </div>
      </div>
    </div>
  );
}
