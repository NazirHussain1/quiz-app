"use client";

import { motion } from "framer-motion";
import Link from "next/link";

export default function QuizResults({ 
  score, 
  total, 
  category, 
  difficulty, 
  categoryId,
  onRestart 
}) {
  const percent = (score / total) * 100;
  
  const getPerformanceMessage = () => {
    if (percent < 40) return { text: "Fail", color: "text-danger" };
    if (percent < 60) return { text: "Average - Need More Improvement", color: "text-warning" };
    if (percent < 75) return { text: "Good", color: "text-info" };
    return { text: "Excellent 🎉", color: "text-success" };
  };

  const performance = getPerformanceMessage();

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
        
        {category && (
          <motion.p 
            className="text-center text-muted mb-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <small>
              Category: {category} | Difficulty: {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
            </small>
          </motion.p>
        )}

        <motion.p 
          className="text-center fs-5"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          Your Score: <b>{score} / {total}</b>
        </motion.p>

        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.6, type: "spring" }}
        >
          <p className={`${performance.color} text-center fs-6`}>
            {performance.text}
          </p>
        </motion.div>

        <motion.div 
          className="d-grid gap-2 mt-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
        >
          <button
            className="btn btn-success btn-lg"
            onClick={onRestart}
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
            href={`/quiz?${categoryId ? `category=${categoryId}&` : ""}difficulty=${difficulty}`}
            className="btn btn-outline-success w-100"
            onClick={(e) => {
              e.preventDefault();
              onRestart();
            }}
          >
            ↻ Try Again
          </Link>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
