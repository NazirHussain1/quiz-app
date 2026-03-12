"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { shuffleArray } from "../utils/shuffle";

export default function QuizPage() {
  const searchParams = useSearchParams();
  const categoryId = searchParams.get("category");
  const difficulty = searchParams.get("difficulty") || "medium";
  
  const [questions, setQuestions] = useState([]);
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [finished, setFinished] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeLeft, setTimeLeft] = useState(15);
  const [categoryName, setCategoryName] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  // Generate unique storage key based on category and difficulty
  const storageKey = `quiz_progress_${categoryId || 'any'}_${difficulty}`;

  // Load saved progress from localStorage on mount
  useEffect(() => {
    const savedProgress = localStorage.getItem(storageKey);
    if (savedProgress) {
      try {
        const { savedIndex, savedAnswers, savedQuestions } = JSON.parse(savedProgress);
        if (savedQuestions && savedQuestions.length > 0) {
          setQuestions(savedQuestions);
          setIndex(savedIndex || 0);
          setAnswers(savedAnswers || []);
          setLoading(false);
          
          // Set category name from saved questions
          if (savedQuestions[0]?.category) {
            setCategoryName(savedQuestions[0].category);
          }
          return; // Skip fetching new questions
        }
      } catch (err) {
        console.error("Failed to restore progress:", err);
        localStorage.removeItem(storageKey);
      }
    }
  }, [storageKey]);

  useEffect(() => {
    async function fetchQuestions() {
      // Skip if we already have questions loaded from localStorage
      if (questions.length > 0 && refreshKey === 0) {
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        // Build API URL with optional category and difficulty
        let apiUrl = "https://opentdb.com/api.php?amount=10&type=multiple";
        if (categoryId) {
          apiUrl += `&category=${categoryId}`;
        }
        if (difficulty) {
          apiUrl += `&difficulty=${difficulty}`;
        }
        
        const res = await fetch(apiUrl);
        
        if (!res.ok) {
          throw new Error("Failed to fetch questions");
        }
        
        const data = await res.json();

        if (data.response_code !== 0) {
          throw new Error("No questions available for this category");
        }

        const formatted = data.results.map((q) => ({
          question: q.question,
          correct: q.correct_answer,
          options: shuffleArray([...q.incorrect_answers, q.correct_answer]),
          category: q.category,
        }));

        setQuestions(formatted);
        setAnswers(new Array(formatted.length).fill(null));
        
        // Set category name from first question
        if (formatted.length > 0) {
          setCategoryName(formatted[0].category);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchQuestions();
  }, [categoryId, difficulty, refreshKey]);

  // Save progress to localStorage whenever state changes
  useEffect(() => {
    if (questions.length > 0 && !finished) {
      const progressData = {
        savedIndex: index,
        savedAnswers: answers,
        savedQuestions: questions,
      };
      localStorage.setItem(storageKey, JSON.stringify(progressData));
    }
  }, [index, answers, questions, finished, storageKey]);

  // Clear localStorage when quiz finishes
  useEffect(() => {
    if (finished) {
      localStorage.removeItem(storageKey);
    }
  }, [finished, storageKey]);

  // Timer effect - resets when question changes
  useEffect(() => {
    if (loading || finished) return;

    setTimeLeft(15); // Reset timer for new question

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          // Time's up - auto move to next question
          clearInterval(timer);
          handleTimeUp();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [index, loading, finished]);

  const handleTimeUp = () => {
    // Mark as unanswered if not already answered
    if (!answers[index]) {
      const newAnswers = [...answers];
      newAnswers[index] = null; // Explicitly mark as unanswered
      setAnswers(newAnswers);
    }

    // Move to next question or finish
    if (index === questions.length - 1) {
      setFinished(true);
    } else {
      setIndex(index + 1);
    }
  };

  const handleSelect = (option) => {
    if (answers[index]) return;

    const newAnswers = [...answers];
    newAnswers[index] = option;
    setAnswers(newAnswers);
  };

  // Calculate score dynamically from answers
  const calculateScore = () => {
    return answers.reduce((total, answer, idx) => {
      return total + (answer === questions[idx]?.correct ? 1 : 0);
    }, 0);
  };

  const handleNext = () => {
    if (index === questions.length - 1) {
      setFinished(true);
      return;
    }
    setIndex(index + 1);
  };

  const handlePrev = () => {
    if (index === 0) return;
    setIndex(index - 1);
  };

  const handleRestartQuiz = () => {
    // Clear localStorage before restarting
    localStorage.removeItem(storageKey);
    
    // Reset all state
    setIndex(0);
    setAnswers([]);
    setFinished(false);
    setTimeLeft(15);
    // Trigger re-fetch of questions by updating refreshKey
    setRefreshKey(prev => prev + 1);
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="text-center">
          <div className="spinner-border text-success" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3">Loading questions...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mt-5" style={{ maxWidth: 600 }}>
        <div className="alert alert-danger" role="alert">
          <h4 className="alert-heading">Error!</h4>
          <p>{error}</p>
          <hr />
          <div className="d-flex gap-2">
            <button 
              className="btn btn-danger"
              onClick={() => window.location.reload()}
            >
              Try Again
            </button>
            <Link href="/" className="btn btn-secondary">
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const score = calculateScore();

  if (finished)
    return (
      <div className="container mt-5" style={{ maxWidth: 600 }}>
        <div className="card p-4 shadow">
          <h2 className="text-center">Quiz Finished 🎉</h2>
          
          {categoryName && (
            <p className="text-center text-muted mb-2">
              <small>
                Category: {categoryName} | Difficulty: {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
              </small>
            </p>
          )}

          <p className="text-center fs-5">
            Your Score: <b>{score} / {questions.length}</b>
          </p>

          {/* Performance Message */}
          {(() => {
            const percent = (score / questions.length) * 100;
            if (percent < 40) return <p className="text-danger text-center fs-6">Fail</p>;
            else if (percent < 60) return <p className="text-warning text-center fs-6">Average - Need More Improvement</p>;
            else if (percent < 75) return <p className="text-info text-center fs-6">Good</p>;
            else return <p className="text-success text-center fs-6">Excellent 🎉</p>;
          })()}

          <div className="d-grid gap-2 mt-3">
            <button
              className="btn btn-success btn-lg"
              onClick={handleRestartQuiz}
              aria-label="Restart quiz with new questions"
            >
              🔄 Restart Quiz
            </button>
            <div className="d-flex gap-2">
              <Link href="/" className="btn btn-secondary w-100">
                🏠 New Category
              </Link>
              <Link 
                href={`/quiz?${categoryId ? `category=${categoryId}&` : ""}difficulty=${difficulty}`}
                className="btn btn-outline-success w-100"
                onClick={(e) => {
                  e.preventDefault();
                  handleRestartQuiz();
                }}
              >
                ↻ Try Again
              </Link>
            </div>
          </div>
        </div>
      </div>
    );

  const current = questions[index];
  const isLocked = !!answers[index];
  const progressPercent = ((index + 1) / questions.length) * 100;

  return (
    <div className="container mt-4" style={{ maxWidth: 600 }}>
      {/* SCORE */}
      <div className="d-flex justify-content-between align-items-center mb-2">
        <h5 aria-live="polite" className="mb-0">Score: {score}</h5>
        <h5 aria-live="polite" className="mb-0 text-success">
          {score}/{questions.length}
        </h5>
      </div>
      
      {categoryName && (
        <div className="text-center mb-3">
          <span className="badge bg-info text-dark me-2">
            📚 {categoryName}
          </span>
          <span className={`badge ${
            difficulty === "easy" ? "bg-success" : 
            difficulty === "hard" ? "bg-danger" : 
            "bg-warning text-dark"
          }`}>
            {difficulty === "easy" ? "😊 Easy" : 
             difficulty === "hard" ? "🔥 Hard" : 
             "🤔 Medium"}
          </span>
        </div>
      )}

      {/* QUESTION PROGRESS INDICATOR */}
      <div className="card mb-3 p-3 shadow-sm bg-light">
        <div className="d-flex justify-content-between align-items-center mb-2">
          <span className="fw-bold text-muted">
            Question {index + 1} of {questions.length}
          </span>
          <span className="badge bg-primary">
            {Math.round(progressPercent)}% Complete
          </span>
        </div>
        
        {/* PROGRESS BAR */}
        <div className="progress" style={{ height: "12px" }}>
          <div
            className="progress-bar bg-success progress-bar-striped progress-bar-animated"
            role="progressbar"
            style={{ width: `${progressPercent}%` }}
            aria-valuenow={index + 1}
            aria-valuemin="0"
            aria-valuemax={questions.length}
            aria-label={`Question ${index + 1} of ${questions.length}`}
          ></div>
        </div>
      </div>
        ></div>
      </div>

      {/* COUNTDOWN TIMER */}
      <div className="card mb-3 p-3 text-center shadow-sm border-2" style={{ 
        borderColor: timeLeft <= 5 ? '#dc3545' : '#198754' 
      }}>
        <div className="d-flex align-items-center justify-content-center">
          <span className="me-2 fs-5">⏱️</span>
          <span 
            className={`fs-3 fw-bold ${timeLeft <= 5 ? 'text-danger' : 'text-success'}`}
            aria-live="polite"
            aria-atomic="true"
          >
            {timeLeft}s
          </span>
          <span className="ms-2 text-muted small">remaining</span>
        </div>
        <div className="progress mt-2" style={{ height: "8px" }}>
          <div
            className={`progress-bar ${timeLeft <= 5 ? 'bg-danger' : 'bg-success'}`}
            role="progressbar"
            style={{ 
              width: `${(timeLeft / 15) * 100}%`,
              transition: 'width 1s linear'
            }}
            aria-valuenow={timeLeft}
            aria-valuemin="0"
            aria-valuemax="15"
          ></div>
        </div>
      </div>

      {/* QUESTION CARD */}
      <div className="card p-4 shadow-sm">
        <h5
          dangerouslySetInnerHTML={{ __html: current.question }}
          className="mb-3"
          role="heading"
          aria-level="2"
        ></h5>

        {/* OPTIONS */}
        <div className="list-group" role="radiogroup" aria-label="Answer options">
          {current.options.map((option, i) => {
            let className = "list-group-item list-group-item-action";
            const isSelected = option === answers[index];
            const isCorrect = option === current.correct;

            if (isLocked) {
              if (isCorrect) {
                className += " bg-success text-white";
              } else if (isSelected && !isCorrect) {
                className += " bg-danger text-white";
              }
            }

            return (
              <button
                key={i}
                className={className}
                onClick={() => handleSelect(option)}
                dangerouslySetInnerHTML={{ __html: option }}
                disabled={isLocked}
                role="radio"
                aria-checked={isSelected}
                aria-label={`Option ${i + 1}`}
              ></button>
            );
          })}
        </div>
      </div>

      {/* BUTTONS */}
      <div className="d-flex justify-content-between mt-3">
        <button
          className="btn btn-secondary"
          onClick={handlePrev}
          disabled={index === 0}
          aria-label="Go to previous question"
        >
          ← Previous
        </button>

        <button
          className="btn btn-success"
          disabled={!isLocked}
          onClick={handleNext}
          aria-label={index === questions.length - 1 ? "Finish quiz" : "Go to next question"}
        >
          {index === questions.length - 1 ? "Finish" : "Next →"}
        </button>
      </div>
    </div>
  );
}
