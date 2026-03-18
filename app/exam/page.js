"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { shuffleArray } from "../utils/shuffle";
import { useSound } from "../utils/useSound";

function ExamContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const category = searchParams.get("category");
  const subject = searchParams.get("subject");
  const difficulty = searchParams.get("difficulty") || "medium";
  const { playComplete } = useSound();
  
  const [questions, setQuestions] = useState([]);
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [finished, setFinished] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeLeft, setTimeLeft] = useState(1800); // 30 minutes in seconds
  const [startTime] = useState(Date.now());
  const [soundEnabled, setSoundEnabled] = useState(true);

  useEffect(() => {
    const savedSoundPref = localStorage.getItem("soundEnabled");
    if (savedSoundPref !== null) {
      setSoundEnabled(savedSoundPref === "true");
    }
  }, []);

  useEffect(() => {
    async function fetchQuestions() {
      try {
        setLoading(true);
        setError(null);
        
        const params = new URLSearchParams();
        if (category) params.append('category', category);
        if (subject) params.append('subject', subject);
        if (difficulty) params.append('difficulty', difficulty);
        params.append('limit', '30');
        
        const apiUrl = `/api/questions?${params.toString()}`;
        const res = await fetch(apiUrl);
        
        if (res.ok) {
          const data = await res.json();

          if (data.success && data.questions && data.questions.length > 0) {
            const formatted = data.questions.map((q) => ({
              question: q.question,
              correct: q.correctAnswer,
              options: shuffleArray([...q.options]),
              category: q.category,
              subject: q.subject,
            }));

            setQuestions(formatted);
            setAnswers(new Array(formatted.length).fill(null));
            setLoading(false);
            return;
          }
        }
        
        let triviaUrl = "https://opentdb.com/api.php?amount=30&type=multiple";
        if (difficulty) triviaUrl += `&difficulty=${difficulty}`;
        
        const triviaRes = await fetch(triviaUrl);
        if (!triviaRes.ok) throw new Error("Failed to fetch questions");
        
        const triviaData = await triviaRes.json();
        if (triviaData.response_code !== 0) throw new Error("No questions available");

        const formatted = triviaData.results.map((q) => ({
          question: q.question,
          correct: q.correct_answer,
          options: shuffleArray([...q.incorrect_answers, q.correct_answer]),
          category: q.category,
          subject: "General",
        }));

        setQuestions(formatted);
        setAnswers(new Array(formatted.length).fill(null));
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchQuestions();
  }, [category, subject, difficulty]);

  useEffect(() => {
    if (loading || finished || questions.length === 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleAutoSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [loading, finished, questions.length]);

  const handleAutoSubmit = () => {
    setFinished(true);
    saveExamResult();
    if (soundEnabled) playComplete();
  };

  const saveExamResult = async () => {
    const playerName = localStorage.getItem("playerName") || "Anonymous";
    const score = calculateScore();
    const timeTaken = Math.floor((Date.now() - startTime) / 1000);
    
    try {
      await fetch('/api/results', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: playerName,
          category: category || "General",
          subject: subject || "General",
          score: score,
          totalQuestions: questions.length,
          difficulty: difficulty,
          timeTaken: timeTaken,
          examMode: true
        }),
      });
    } catch (err) {
      console.error('Error saving exam result:', err);
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
      return total + (answer === questions[idx]?.correct ? 1 : 0);
    }, 0);
  };

  const handleNext = () => {
    if (!answers[index]) {
      if (!confirm("You haven't answered this question. Continue anyway?")) {
        return;
      }
    }
    
    if (index === questions.length - 1) {
      setFinished(true);
      saveExamResult();
      if (soundEnabled) playComplete();
      return;
    }
    setIndex(index + 1);
  };

  const handleSubmit = () => {
    const unanswered = answers.filter(a => a === null).length;
    if (unanswered > 0) {
      if (!confirm(`You have ${unanswered} unanswered questions. Submit anyway?`)) {
        return;
      }
    }
    
    setFinished(true);
    saveExamResult();
    if (soundEnabled) playComplete();
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="text-center">
          <div className="spinner-border text-success" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3">Loading exam questions...</p>
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
          <Link href="/" className="btn btn-secondary">
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  const score = calculateScore();
  const progressPercent = ((index + 1) / questions.length) * 100;

  if (finished) {
    const timeTaken = Math.floor((Date.now() - startTime) / 1000);
    const percentage = Math.round((score / questions.length) * 100);
    
    return (
      <motion.div 
        className="container mt-5" 
        style={{ maxWidth: 700 }}
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
            Exam Completed! 🎓
          </motion.h2>
          
          <motion.div
            className="text-center mb-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <p className="text-muted mb-2">
              <small>
                Category: {category || "General"} | Subject: {subject || "General"}
              </small>
            </p>
            <p className="text-muted">
              <small>Time Taken: {formatTime(timeTaken)}</small>
            </p>
          </motion.div>

          <motion.div
            className="row text-center mb-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <div className="col-6">
              <h3 className="text-primary">{score}</h3>
              <p className="text-muted">Correct Answers</p>
            </div>
            <div className="col-6">
              <h3 className="text-danger">{questions.length - score}</h3>
              <p className="text-muted">Wrong Answers</p>
            </div>
          </motion.div>

          <motion.div
            className="text-center mb-4"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.6, type: "spring" }}
          >
            <h1 className="display-3 fw-bold text-success">{percentage}%</h1>
            {(() => {
              if (percentage < 40) return <p className="text-danger fs-5">Fail - Keep Practicing</p>;
              else if (percentage < 60) return <p className="text-warning fs-5">Pass - Need Improvement</p>;
              else if (percentage < 75) return <p className="text-info fs-5">Good Performance</p>;
              else return <p className="text-success fs-5">Excellent! 🎉</p>;
            })()}
          </motion.div>

          <motion.div 
            className="d-grid gap-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
          >
            <Link href="/leaderboard" className="btn btn-primary btn-lg">
              🏆 View Leaderboard
            </Link>
            <Link href="/" className="btn btn-secondary">
              🏠 Back to Home
            </Link>
          </motion.div>
        </motion.div>
      </motion.div>
    );
  }

  const current = questions[index];
  const isAnswered = !!answers[index];

  return (
    <div className="container mt-4" style={{ maxWidth: 700 }}>
      <div className="card shadow-sm mb-3 bg-warning bg-opacity-10 border-warning">
        <div className="card-body py-2">
          <div className="d-flex justify-content-between align-items-center">
            <span className="badge bg-warning text-dark fs-6">
              📝 EXAM MODE
            </span>
            <span className="text-muted small">
              {category} - {subject}
            </span>
          </div>
        </div>
      </div>

      <motion.div 
        className="card mb-3 p-3 shadow-sm"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="d-flex justify-content-between align-items-center mb-2">
          <span className="fw-bold">
            Question {index + 1} of {questions.length}
          </span>
          <span className="badge bg-primary">
            {Math.round(progressPercent)}% Complete
          </span>
        </div>
        
        <div className="progress" style={{ height: "12px" }}>
          <motion.div
            className="progress-bar bg-success progress-bar-striped"
            role="progressbar"
            style={{ width: `${progressPercent}%` }}
            initial={{ width: 0 }}
            animate={{ width: `${progressPercent}%` }}
            transition={{ duration: 0.5 }}
          ></motion.div>
        </div>
      </motion.div>

      <motion.div 
        className={`card mb-3 p-3 text-center shadow-sm border-2`}
        style={{ borderColor: timeLeft <= 300 ? '#dc3545' : '#198754' }}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        <div className="d-flex align-items-center justify-content-center">
          <span className="me-2 fs-5">⏱️</span>
          <motion.span 
            className={`fs-3 fw-bold ${timeLeft <= 300 ? 'text-danger' : 'text-success'}`}
            animate={{ scale: timeLeft <= 300 ? [1, 1.05, 1] : 1 }}
            transition={{ duration: 0.5, repeat: timeLeft <= 300 ? Infinity : 0 }}
          >
            {formatTime(timeLeft)}
          </motion.span>
          <span className="ms-2 text-muted small">remaining</span>
        </div>
      </motion.div>

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
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.3 }}
          ></motion.h5>

          <div className="list-group">
            {current.options.map((option, i) => {
              const isSelected = option === answers[index];
              let className = "list-group-item list-group-item-action";
              
              if (isSelected) {
                className += " active";
              }

              return (
                <motion.button
                  key={i}
                  className={className}
                  onClick={() => handleSelect(option)}
                  dangerouslySetInnerHTML={{ __html: option }}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 + i * 0.1, duration: 0.3 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                ></motion.button>
              );
            })}
          </div>
        </motion.div>
      </AnimatePresence>

      <motion.div 
        className="d-flex justify-content-between mt-3 gap-2"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.3 }}
      >
        <div className="text-muted small">
          ⚠️ Cannot go back to previous questions
        </div>
        
        <div className="d-flex gap-2">
          {index === questions.length - 1 ? (
            <motion.button
              className="btn btn-success btn-lg"
              onClick={handleSubmit}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Submit Exam
            </motion.button>
          ) : (
            <motion.button
              className="btn btn-primary"
              onClick={handleNext}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Next →
            </motion.button>
          )}
        </div>
      </motion.div>

      <div className="text-center mt-3">
        <small className="text-muted">
          Answered: {answers.filter(a => a !== null).length} / {questions.length}
        </small>
      </div>
    </div>
  );
}

export default function ExamPage() {
  return (
    <Suspense fallback={
      <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    }>
      <ExamContent />
    </Suspense>
  );
}
