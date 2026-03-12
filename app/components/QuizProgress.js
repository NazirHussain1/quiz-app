"use client";

import { motion } from "framer-motion";

export default function QuizProgress({ current, total, score }) {
  const progressPercent = ((current) / total) * 100;

  return (
    <>
      {/* SCORE */}
      <motion.div 
        className="d-flex justify-content-between align-items-center mb-2"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h5 aria-live="polite" className="mb-0">Score: {score}</h5>
        <h5 aria-live="polite" className="mb-0 text-success">
          {score}/{total}
        </h5>
      </motion.div>

      {/* QUESTION PROGRESS INDICATOR */}
      <motion.div 
        className="card mb-3 p-3 shadow-sm bg-light"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="d-flex justify-content-between align-items-center mb-2">
          <span className="fw-bold text-muted">
            Question {current} of {total}
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
            aria-valuenow={current}
            aria-valuemin="0"
            aria-valuemax={total}
            aria-label={`Question ${current} of ${total}`}
          ></motion.div>
        </div>
      </motion.div>
    </>
  );
}
