"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { shuffleArray } from "../utils/shuffle";
import { useSound } from "../utils/useSound";
import { adaptiveDifficultyService } from "../services/adaptiveDifficultyService";

function QuizContent() {
  const searchParams = useSearchParams();
  const category = searchParams.get("category");
  const subject = searchParams.get("subject");
  const initialDifficulty = searchParams.get("difficulty") || "medium";
  const { playCorrect, playWrong, playComplete } = useSound();
  
  const [questions, setQuestions] = useState([]);
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [finished, setFinished] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeLeft, setTimeLeft] = useState(30);
  const [categoryName, setCategoryName] = useState("");
  const [subjectName, setSubjectName] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [adaptiveDifficulty, setAdaptiveDifficulty] = useState(initialDifficulty);
  const [difficultyChanged, setDifficultyChanged] = useState(false);
  const [previousDifficulty, setPreviousDifficulty] = useState(null);

  // Generate unique storage key based on category, subject, and difficulty
  const storageKey = `quiz_progress_${category || 'any'}_${subject || 'any'}_${adaptiveDifficulty}`;

  // Check for adaptive difficulty on mount
  useEffect(() => {
    if (category && subject) {
      const newDifficulty = adaptiveDifficultyService.getAdaptiveDifficulty(
        category,
        subject,
        initialDifficulty
      );
      
      if (newDifficulty !== initialDifficulty) {
        setAdaptiveDifficulty(newDifficulty);
        setDifficultyChanged(true);
        setPreviousDifficulty(initialDifficulty);
      } else {
        setAdaptiveDifficulty(initialDifficulty);
      }
    } else {
      setAdaptiveDifficulty(initialDifficulty);
    }
  }, [category, subject, initialDifficulty]);

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
          
          // Set category and subject name from saved questions
          if (savedQuestions[0]?.category) {
            setCategoryName(savedQuestions[0].category);
          }
          if (savedQuestions[0]?.subject) {
            setSubjectName(savedQuestions[0].subject);
          }
          return; // Skip fetching new questions
        }
      } catch (err) {
        console.error("Failed to restore progress:", err);
        localStorage.removeItem(storageKey);
      }
    }
    
    // Load sound preference
    const savedSoundPref = localStorage.getItem("soundEnabled");
    if (savedSoundPref !== null) {
      setSoundEnabled(savedSoundPref === "true");
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
        
        // Try MongoDB first
        const params = new URLSearchParams();
        
        if (category) {
          params.append('category', category);
        }
        if (subject) {
          params.append('subject', subject);
        }
        if (adaptiveDifficulty) {
          params.append('difficulty', adaptiveDifficulty);
        }
        params.append('limit', '10');
        
        const apiUrl = `/api/questions?${params.toString()}`;
        
        const res = await fetch(apiUrl);
        
        if (res.ok) {
          const data = await res.json();

          if (data.success && data.questions && data.questions.length > 0) {
            // MongoDB has questions - use them
            const formatted = data.questions.map((q) => ({
              question: q.question,
              correct: q.correctAnswer,
              options: shuffleArray([...q.options]),
              category: q.category,
              subject: q.subject,
            }));

            setQuestions(formatted);
            setAnswers(new Array(formatted.length).fill(null));
            
            if (formatted.length > 0) {
              setCategoryName(formatted[0].category);
              setSubjectName(formatted[0].subject);
            }
            
            setLoading(false);
            return;
          }
        }
        
        // Fallback to Open Trivia API if MongoDB has no questions
        console.log("MongoDB returned no questions, falling back to Open Trivia API");
        
        let triviaUrl = "https://opentdb.com/api.php?amount=10&type=multiple";
        if (adaptiveDifficulty) {
          triviaUrl += `&difficulty=${adaptiveDifficulty}`;
        }
        
        const triviaRes = await fetch(triviaUrl);
        
        if (!triviaRes.ok) {
          throw new Error("Failed to fetch questions from both sources");
        }
        
        const triviaData = await triviaRes.json();

        if (triviaData.response_code !== 0) {
          throw new Error("No questions available");
        }

        const formatted = triviaData.results.map((q) => ({
          question: q.question,
          correct: q.correct_answer,
          options: shuffleArray([...q.incorrect_answers, q.correct_answer]),
          category: q.category,
          subject: "General",
        }));

        setQuestions(formatted);
        setAnswers(new Array(formatted.length).fill(null));
        
        if (formatted.length > 0) {
          setCategoryName(formatted[0].category);
          setSubjectName(formatted[0].subject);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchQuestions();
  }, [category, subject, adaptiveDifficulty, refreshKey]);

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

  // Clear localStorage when quiz finishes and play completion sound
  useEffect(() => {
    if (finished) {
      localStorage.removeItem(storageKey);
      
      // Play completion sound
      if (soundEnabled) {
        playComplete();
      }
      
      // Save score to MongoDB and localStorage leaderboard
      const playerName = localStorage.getItem("playerName") || "Anonymous";
      const score = calculateScore();
      
      // Record performance for adaptive difficulty
      if (category && subject) {
        adaptiveDifficultyService.recordQuizResult(
          category,
          subject,
          adaptiveDifficulty,
          score,
          questions.length
        );
      }
      
      const leaderboardEntry = {
        name: playerName,
        score: score,
        total: questions.length,
        category: categoryName || "Mixed",
        subject: subjectName || "Mixed",
        difficulty: adaptiveDifficulty,
        date: new Date().toISOString(),
      };
      
      // Save to MongoDB
      fetch('/api/results', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: playerName,
          category: categoryName || "General",
          subject: subjectName || "General",
          score: score,
          totalQuestions: questions.length,
          difficulty: adaptiveDifficulty,
        }),
      })
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            console.log('Result saved to MongoDB:', data.resultId);
          } else {
            console.error('Failed to save result to MongoDB:', data.error);
          }
        })
        .catch(err => {
          console.error('Error saving result to MongoDB:', err);
        });
      
      // Get existing leaderboard
      const existingLeaderboard = JSON.parse(localStorage.getItem("leaderboard") || "[]");
      
      // Add new entry
      existingLeaderboard.push(leaderboardEntry);
      
      // Sort by score (highest first)
      existingLeaderboard.sort((a, b) => b.score - a.score);
      
      // Keep only top 50 entries
      const topEntries = existingLeaderboard.slice(0, 50);
      
      // Save back to localStorage
      localStorage.setItem("leaderboard", JSON.stringify(topEntries));
    }
  }, [finished, storageKey, categoryName, subjectName, adaptiveDifficulty, questions.length, soundEnabled, playComplete, category, subject]);

  // Timer effect - resets when question changes
  useEffect(() => {
    if (loading || finished) return;

    setTimeLeft(30); // Reset timer for new question

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
    
    // Play sound effect based on answer correctness
    if (soundEnabled) {
      if (option === questions[index].correct) {
        playCorrect();
      } else {
        playWrong();
      }
    }
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
    setTimeLeft(30);
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

  if (finished) {
    const percentage = (score / questions.length) * 100;
    const nextDifficulty = category && subject 
      ? adaptiveDifficultyService.getAdaptiveDifficulty(category, subject, adaptiveDifficulty)
      : adaptiveDifficulty;
    const willChangeDifficulty = nextDifficulty !== adaptiveDifficulty;
    
    return (
      <motion.div 
        className="container mt-5" 
        style={{ maxWidth: 600 }}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, type: "spring" }}
      >
        <motion.div 
          className="card p-4 shadow"
          initial={{ y: 50 }}
          animate={{ y: 0 }}
          transition={{ delay: 0.2, duration: 0.4 }}
        >
          <motion.h2 
            className="text-center"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
          >
            Quiz Finished 🎉
          </motion.h2>
          
          {categoryName && (
            <motion.p 
              className="text-center text-muted mb-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              <small>
                Category: {categoryName} | Subject: {subjectName} | Difficulty: {adaptiveDifficulty.charAt(0).toUpperCase() + adaptiveDifficulty.slice(1)}
              </small>
            </motion.p>
          )}

          {willChangeDifficulty && (
            <motion.div
              className={`alert ${nextDifficulty > adaptiveDifficulty ? 'alert-success' : 'alert-info'} mb-3`}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.45 }}
            >
              <strong>
                {nextDifficulty > adaptiveDifficulty ? '🎉 Great job!' : '💡 Tip:'}
              </strong>
              {' '}
              {nextDifficulty > adaptiveDifficulty 
                ? `Your next quiz will be ${nextDifficulty} difficulty!`
                : `Your next quiz will be ${nextDifficulty} difficulty to help you improve.`
              }
            </motion.div>
          )}

          <motion.p 
            className="text-center fs-5"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            Your Score: <b>{score} / {questions.length}</b>
          </motion.p>

          {/* Performance Message */}
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.6, type: "spring" }}
          >
            {(() => {
              const percent = percentage;
              if (percent < 40) return <p className="text-danger text-center fs-6">Fail</p>;
              else if (percent < 60) return <p className="text-warning text-center fs-6">Average - Need More Improvement</p>;
              else if (percent < 75) return <p className="text-info text-center fs-6">Good</p>;
              else return <p className="text-success text-center fs-6">Excellent 🎉</p>;
            })()}
          </motion.div>

          <motion.div 
            className="d-grid gap-2 mt-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
          >
            <button
              className="btn btn-success btn-lg"
              onClick={handleRestartQuiz}
              aria-label="Restart quiz with new questions"
            >
              🔄 Restart Quiz
            </button>
            <div className="d-flex gap-2">
              <Link href="/leaderboard" className="btn btn-primary w-100">
                🏆 Leaderboard
              </Link>
              <Link href="/" className="btn btn-secondary w-100">
                🏠 Home
              </Link>
            </div>
            <Link 
              href={`/quiz?${category ? `category=${category}&` : ""}${subject ? `subject=${subject}&` : ""}difficulty=${adaptiveDifficulty}`}
              className="btn btn-outline-success w-100"
              onClick={(e) => {
                e.preventDefault();
                handleRestartQuiz();
              }}
            >
              ↻ Try Again
            </Link>
          </motion.div>
        </motion.div>
      </motion.div>
    );
  }

  const current = questions[index];
  const isLocked = !!answers[index];
  const progressPercent = ((index + 1) / questions.length) * 100;

  return (
    <div className="container mt-4" style={{ maxWidth: 600 }}>
      {/* Sound Toggle Button */}
      <motion.div 
        className="d-flex justify-content-end mb-2"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
      >
        <button
          onClick={() => {
            const newSoundState = !soundEnabled;
            setSoundEnabled(newSoundState);
            localStorage.setItem("soundEnabled", newSoundState.toString());
          }}
          className="btn btn-sm btn-outline-secondary"
          aria-label="Toggle sound effects"
          title={soundEnabled ? "Mute sounds" : "Enable sounds"}
        >
          {soundEnabled ? "🔊 Sound On" : "🔇 Sound Off"}
        </button>
      </motion.div>
      
      {/* SCORE */}
      <motion.div 
        className="d-flex justify-content-between align-items-center mb-2"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h5 aria-live="polite" className="mb-0">Score: {score}</h5>
        <h5 aria-live="polite" className="mb-0 text-success">
          {score}/{questions.length}
        </h5>
      </motion.div>
      
      {categoryName && subjectName && (
        <motion.div 
          className="text-center mb-3"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <span className="badge bg-info text-dark me-2">
            📚 {categoryName}
          </span>
          <span className="badge bg-secondary me-2">
            📖 {subjectName}
          </span>
          <span className={`badge ${
            adaptiveDifficulty === "easy" ? "bg-success" : 
            adaptiveDifficulty === "hard" ? "bg-danger" : 
            "bg-warning text-dark"
          }`}>
            {adaptiveDifficulty === "easy" ? "😊 Easy" : 
             adaptiveDifficulty === "hard" ? "🔥 Hard" : 
             "🤔 Medium"}
          </span>
        </motion.div>
      )}

      {difficultyChanged && (
        <motion.div
          className={`alert ${previousDifficulty && adaptiveDifficulty > previousDifficulty ? 'alert-success' : 'alert-info'} mb-3`}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <strong>🎯 Adaptive Difficulty:</strong> Based on your previous performance, 
          difficulty has been {adaptiveDifficulty > previousDifficulty ? 'increased' : 'decreased'} to {adaptiveDifficulty}.
        </motion.div>
      )}

      {/* QUESTION PROGRESS INDICATOR */}
      <motion.div 
        className="card mb-3 p-3 shadow-sm bg-light"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
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
          <motion.div
            className="progress-bar bg-success progress-bar-striped progress-bar-animated"
            role="progressbar"
            style={{ width: `${progressPercent}%` }}
            initial={{ width: 0 }}
            animate={{ width: `${progressPercent}%` }}
            transition={{ duration: 0.5 }}
            aria-valuenow={index + 1}
            aria-valuemin="0"
            aria-valuemax={questions.length}
            aria-label={`Question ${index + 1} of ${questions.length}`}
          ></motion.div>
        </div>
      </motion.div>

      {/* COUNTDOWN TIMER */}
      <motion.div 
        className="card mb-3 p-3 text-center shadow-sm border-2" 
        style={{ borderColor: timeLeft <= 5 ? '#dc3545' : '#198754' }}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        <div className="d-flex align-items-center justify-content-center">
          <span className="me-2 fs-5">⏱️</span>
          <motion.span 
            className={`fs-3 fw-bold ${timeLeft <= 5 ? 'text-danger' : 'text-success'}`}
            aria-live="polite"
            aria-atomic="true"
            animate={{ scale: timeLeft <= 5 ? [1, 1.1, 1] : 1 }}
            transition={{ duration: 0.5, repeat: timeLeft <= 5 ? Infinity : 0 }}
          >
            {timeLeft}s
          </motion.span>
          <span className="ms-2 text-muted small">remaining</span>
        </div>
        <div className="progress mt-2" style={{ height: "8px" }}>
          <div
            className={`progress-bar ${timeLeft <= 5 ? 'bg-danger' : 'bg-success'}`}
            role="progressbar"
            style={{ 
              width: `${(timeLeft / 30) * 100}%`,
              transition: 'width 1s linear'
            }}
            aria-valuenow={timeLeft}
            aria-valuemin="0"
            aria-valuemax="30"
          ></div>
        </div>
      </motion.div>

      {/* QUESTION CARD */}
      <AnimatePresence mode="wait">
        <motion.div 
          key={index}
          className="card p-4 shadow-sm"
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -100 }}
          transition={{ duration: 0.3 }}
        >
          <motion.h5
            dangerouslySetInnerHTML={{ __html: current.question }}
            className="mb-3"
            role="heading"
            aria-level="2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.3 }}
          ></motion.h5>

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
                <motion.button
                  key={i}
                  className={className}
                  onClick={() => handleSelect(option)}
                  dangerouslySetInnerHTML={{ __html: option }}
                  disabled={isLocked}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 + i * 0.1, duration: 0.3 }}
                  whileHover={{ scale: isLocked ? 1 : 1.02 }}
                  whileTap={{ scale: isLocked ? 1 : 0.98 }}
                  role="radio"
                  aria-checked={isSelected}
                  aria-label={`Option ${i + 1}`}
                ></motion.button>
              );
            })}
          </div>
        </motion.div>
      </AnimatePresence>

      {/* BUTTONS */}
      <motion.div 
        className="d-flex justify-content-between mt-3"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.3 }}
      >
        <motion.button
          className="btn btn-secondary"
          onClick={handlePrev}
          disabled={index === 0}
          aria-label="Go to previous question"
          whileHover={{ scale: index === 0 ? 1 : 1.05 }}
          whileTap={{ scale: index === 0 ? 1 : 0.95 }}
        >
          ← Previous
        </motion.button>

        <motion.button
          className="btn btn-success"
          disabled={!isLocked}
          onClick={handleNext}
          aria-label={index === questions.length - 1 ? "Finish quiz" : "Go to next question"}
          whileHover={{ scale: !isLocked ? 1 : 1.05 }}
          whileTap={{ scale: !isLocked ? 1 : 0.95 }}
        >
          {index === questions.length - 1 ? "Finish" : "Next →"}
        </motion.button>
      </motion.div>
    </div>
  );
}

export default function QuizPage() {
  return (
    <Suspense fallback={
      <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    }>
      <QuizContent />
    </Suspense>
  );
}
