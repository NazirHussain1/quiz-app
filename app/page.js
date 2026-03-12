"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function HomePage() {
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedDifficulty, setSelectedDifficulty] = useState("medium");
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
  }, []);

  return (
    <div className="d-flex flex-column justify-content-center align-items-center vh-100 text-center px-3">
      <h1 className="mb-3">Welcome to Quiz App 🎯</h1>
      <p className="mb-4 fs-5">Test your knowledge with fun and challenging questions!</p>

      <div className="card p-4 shadow" style={{ maxWidth: 500, width: "100%" }}>
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
              className="form-select mb-3"
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

            <Link 
              href={selectedCategory ? `/quiz?category=${selectedCategory}` : "/quiz"}
              className="btn btn-success btn-lg w-100"
              aria-label="Start the quiz"
            >
              Start Quiz
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
