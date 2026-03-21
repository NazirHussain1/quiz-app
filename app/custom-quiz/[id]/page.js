"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { shuffleArray } from "../../utils/shuffle";

export default function CustomQuizPage() {
  const params = useParams();
  const router = useRouter();
  const quizId = params.id;
  
  const [quiz, setQuiz] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [finished, setFinished] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeLeft, setTimeLeft] = useState(30);

  useEffect(() => {
    fetchQuiz();
  }, [quizId]);

  const fetchQuiz = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/custom-quizzes/${quizId}`);
      const data = await res.json();
      
      if (data.success) {
        setQuiz(data.quiz);
        const shuffledQuestions = data.quiz.questions.map(q => ({
          ...q,
          options: shuffleArray([...q.options])
        }));
        setQuestions(shuffledQuestions);
        setAnswers(new Array(shuffledQuestions.length).fill(null));
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError("Failed to load quiz");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (loading || finished) return;

    setTimeLeft(30);

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
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
    if (!answers[index]) {
      const newAnswers = [...answers];
      newAnswers[index] = null;
      setAnswers(newAnswers);
    }

    if (index === questions.length - 1) {
      setFinished(true);
      saveResult();
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

  const calculateScore = () => {
    return answers.reduce((total, answer, idx) => {
      return total + (answer === questions[idx]?.correctAnswer ? 1 : 0);
    }, 0);
  };

  const saveResult = async () => {
    const playerName = localStorage.getItem("playerName") || "Anonymous";
    const score = calculateScore();
    
    try {
      await fetch('/api/results', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: playerName,
          category: "Custom Quiz",
          subject: quiz?.subject || "Custom",
          score: score,
          totalQuestions: questions.length,
          difficulty: quiz?.difficulty || "medium",
          customQuizId: quizId
        }),
      });
    } catch (err) {
      console.error('Error saving result:', err);
    }
  };

  const handleNext = () => {
    if (index === questions.length - 1) {
      setFinished(true);
      saveResult();
      return;
    }
    setIndex(index + 1);
  };

  const handlePrev = () => {
    if (index === 0) return;
    setIndex(index - 1);
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="text-center">
          <div className="spinner-border text-success"></div>
          <p className="mt-3">Loading quiz...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mt-5" style={{ maxWidth: 600 }}>
        <div className="alert alert-danger">
          <h4>Error!</h4>
          <p>{error}</p>
          <Link href="/" className="btn btn-secondary">Back to Home</Link>
        </div>
      </div>
    );
  }

  const score = calculateScore();
  const progressPercent = ((index + 1) / questions.length) * 100;

  if (finished) {
    const percentage = Math.round((score / questions.length) * 100);
    
    return (
      <motion.div 
        className="container mt-5" 
        style={{ maxWidth: 600 }}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
      >
        <div className="card p-4 shadow">
          <h2 className="text-center">Quiz Completed! 🎉</h2>
          
          <div className="text-center mb-3">
            <h4>{quiz.title}</h4>
            <p className="text-muted">by {quiz.userName}</p>
          </div>

          <div className="text-center mb-4">
            <h1 className="display-3 text-success">{percentage}%</h1>
            <p className="fs-5">Score: {score} / {questions.length}</p>
          </div>

          {(() => {
            if (percentage < 40) return <p className="text-danger text-center">Fail</p>;
            else if (percentage < 60) return <p className="text-warning text-center">Average</p>;
            else if (percentage < 75) return <p className="text-info text-center">Good</p>;
            else return <p className="text-success text-center">Excellent! 🎉</p>;
          })()}

          <div className="d-grid gap-2 mt-4">
            <Link href="/my-quizzes" className="btn btn-primary">
              📚 My Quizzes
            </Link>
            <Link href="/" className="btn btn-secondary">
              🏠 Home
            </Link>
          </div>
        </div>
      </motion.div>
    );
  }

  const current = questions[index];
  const isLocked = !!answers[index];

  return (
    <div className="container mt-4" style={{ maxWidth: 600 }}>
      <div className="card shadow-sm mb-3 bg-info bg-opacity-10">
        <div className="card-body py-2">
          <div className="d-flex justify-content-between align-items-center">
            <span className="badge bg-info fs-6">📝 {quiz.title}</span>
            <span className="text-muted small">by {quiz.userName}</span>
          </div>
        </div>
      </div>

      <div className="card mb-3 p-3 shadow-sm">
        <div className="d-flex justify-content-between align-items-center mb-2">
          <span className="fw-bold">Question {index + 1} of {questions.length}</span>
          <span className="badge bg-primary">{Math.round(progressPercent)}%</span>
        </div>
        
        <div className="progress" style={{ height: "12px" }}>
          <div
            className="progress-bar bg-success"
            style={{ width: `${progressPercent}%` }}
          ></div>
        </div>
      </div>

      <div className="card mb-3 p-3 text-center shadow-sm">
        <span className={`fs-3 fw-bold ${timeLeft <= 5 ? 'text-danger' : 'text-success'}`}>
          ⏱️ {timeLeft}s
        </span>
      </div>

      <AnimatePresence mode="wait">
        <motion.div 
          key={index}
          className="card p-4 shadow-sm"
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -100 }}
        >
          <h5 className="mb-3">{current.question}</h5>

          <div className="list-group">
            {current.options.map((option, i) => {
              let className = "list-group-item list-group-item-action";
              const isSelected = option === answers[index];
              const isCorrect = option === current.correctAnswer;

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
                  disabled={isLocked}
                >
                  {option}
                </button>
              );
            })}
          </div>
        </motion.div>
      </AnimatePresence>

      <div className="d-flex justify-content-between mt-3">
        <button
          className="btn btn-secondary"
          onClick={handlePrev}
          disabled={index === 0}
        >
          ← Previous
        </button>

        <button
          className="btn btn-success"
          disabled={!isLocked}
          onClick={handleNext}
        >
          {index === questions.length - 1 ? "Finish" : "Next →"}
        </button>
      </div>
    </div>
  );
}
