"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const router = useRouter();
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedDifficulty, setSelectedDifficulty] = useState("medium");
  const [playerName, setPlayerName] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchCategories() {
      try {
        setLoading(true);
        const res = await fetch("https://opentdb.com/api_category.php");
        
        if (!res.ok) {
          throw new Error("Failed to fetch categories");
        }
        
        const data = await res.json();
        setCategories(data.trivia_categories);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchCategories();
    
    // Load saved player name
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
    
    // Save player name to localStorage
    localStorage.setItem("playerName", playerName.trim());
    
    // Navigate to quiz page
    const url = `/quiz?${selectedCategory ? `category=${selectedCategory}&` : ""}difficulty=${selectedDifficulty}`;
    router.push(url);
  };

  return (
    <div className="d-flex flex-column justify-content-center align-items-center vh-100 text-center px-3">
      <h1 className="mb-3">Welcome to Quiz App 🎯</h1>
      <p className="mb-4 fs-5">Test your knowledge with fun and challenging questions!</p>

      <div className="card p-4 shadow" style={{ maxWidth: 500, width: "100%" }}>
        <label htmlFor="player-name" className="form-label fw-bold">
          Enter Your Name
        </label>
        <input
          type="text"
          id="player-name"
          className="form-control mb-4"
          placeholder="Your name"
          value={playerName}
          onChange={(e) => setPlayerName(e.target.value)}
          maxLength={30}
          required
          aria-label="Enter your name"
        />
        
        <label htmlFor="category-select" className="form-label fw-bold">
          Select Quiz Category
        </label>
        
        {loading ? (
          <div className="text-center py-3">
            <div className="spinner-border spinner-border-sm text-success" role="status">
              <span className="visually-hidden">Loading categories...</span>
            </div>
          </div>
        ) : error ? (
          <div className="alert alert-danger" role="alert">
            {error}
          </div>
        ) : (
          <>
            <select
              id="category-select"
              className="form-select mb-4"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              aria-label="Select quiz category"
            >
              <option value="">Any Category (Random)</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>

            <div className="mb-4">
              <label className="form-label fw-bold d-block text-start">
                Select Difficulty Level
              </label>
              <div className="d-flex justify-content-around">
                <div className="form-check">
                  <input
                    className="form-check-input"
                    type="radio"
                    name="difficulty"
                    id="difficulty-easy"
                    value="easy"
                    checked={selectedDifficulty === "easy"}
                    onChange={(e) => setSelectedDifficulty(e.target.value)}
                  />
                  <label className="form-check-label" htmlFor="difficulty-easy">
                    😊 Easy
                  </label>
                </div>
                <div className="form-check">
                  <input
                    className="form-check-input"
                    type="radio"
                    name="difficulty"
                    id="difficulty-medium"
                    value="medium"
                    checked={selectedDifficulty === "medium"}
                    onChange={(e) => setSelectedDifficulty(e.target.value)}
                  />
                  <label className="form-check-label" htmlFor="difficulty-medium">
                    🤔 Medium
                  </label>
                </div>
                <div className="form-check">
                  <input
                    className="form-check-input"
                    type="radio"
                    name="difficulty"
                    id="difficulty-hard"
                    value="hard"
                    checked={selectedDifficulty === "hard"}
                    onChange={(e) => setSelectedDifficulty(e.target.value)}
                  />
                  <label className="form-check-label" htmlFor="difficulty-hard">
                    🔥 Hard
                  </label>
                </div>
              </div>
            </div>

            <button
              onClick={handleStartQuiz}
              className="btn btn-success btn-lg w-100 mb-2"
              aria-label="Start the quiz"
            >
              Start Quiz
            </button>
            
            <Link 
              href="/leaderboard"
              className="btn btn-outline-primary w-100"
              aria-label="View leaderboard"
            >
              🏆 View Leaderboard
            </Link>
          </>
        )}
      </div>
      
      <div className="mt-4 text-muted">
        <small>Powered by Open Trivia Database</small>
      </div>
    </div>
  );
}
