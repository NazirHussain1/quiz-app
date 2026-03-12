"use client";

import { motion, AnimatePresence } from "framer-motion";

export default function QuestionDisplay({ 
  question, 
  options, 
  selectedAnswer, 
  correctAnswer, 
  isLocked, 
  onSelect,
  questionIndex 
}) {
  return (
    <AnimatePresence mode="wait">
      <motion.div 
        key={questionIndex}
        className="card p-4 shadow-sm"
        initial={{ opacity: 0, x: 100 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -100 }}
        transition={{ duration: 0.3 }}
      >
        <motion.h5
          dangerouslySetInnerHTML={{ __html: question }}
          className="mb-3"
          role="heading"
          aria-level="2"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.3 }}
        ></motion.h5>

        {/* OPTIONS */}
        <div className="list-group" role="radiogroup" aria-label="Answer options">
          {options.map((option, i) => {
            let className = "list-group-item list-group-item-action";
            const isSelected = option === selectedAnswer;
            const isCorrect = option === correctAnswer;

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
                onClick={() => onSelect(option)}
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
  );
}
