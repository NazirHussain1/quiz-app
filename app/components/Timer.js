"use client";

import { motion } from "framer-motion";

export default function Timer({ timeLeft, totalTime = 30 }) {
  const isLowTime = timeLeft <= 5;

  return (
    <motion.div 
      className="card mb-3 p-3 text-center shadow-sm border-2" 
      style={{ borderColor: isLowTime ? '#dc3545' : '#198754' }}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="d-flex align-items-center justify-content-center">
        <span className="me-2 fs-5">⏱️</span>
        <motion.span 
          className={`fs-3 fw-bold ${isLowTime ? 'text-danger' : 'text-success'}`}
          aria-live="polite"
          aria-atomic="true"
          animate={{ scale: isLowTime ? [1, 1.1, 1] : 1 }}
          transition={{ duration: 0.5, repeat: isLowTime ? Infinity : 0 }}
        >
          {timeLeft}s
        </motion.span>
        <span className="ms-2 text-muted small">remaining</span>
      </div>
      <div className="progress mt-2" style={{ height: "8px" }}>
        <div
          className={`progress-bar ${isLowTime ? 'bg-danger' : 'bg-success'}`}
          role="progressbar"
          style={{ 
            width: `${(timeLeft / totalTime) * 100}%`,
            transition: 'width 1s linear'
          }}
          aria-valuenow={timeLeft}
          aria-valuemin="0"
          aria-valuemax={totalTime}
        ></div>
      </div>
    </motion.div>
  );
}
