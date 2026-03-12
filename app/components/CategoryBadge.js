"use client";

import { motion } from "framer-motion";

export default function CategoryBadge({ category, difficulty }) {
  const getDifficultyStyle = () => {
    switch (difficulty) {
      case "easy":
        return { class: "bg-success", emoji: "😊 Easy" };
      case "hard":
        return { class: "bg-danger", emoji: "🔥 Hard" };
      default:
        return { class: "bg-warning text-dark", emoji: "🤔 Medium" };
    }
  };

  const diffStyle = getDifficultyStyle();

  return (
    <motion.div 
      className="text-center mb-3"
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <span className="badge bg-info text-dark me-2">
        📚 {category}
      </span>
      <span className={`badge ${diffStyle.class}`}>
        {diffStyle.emoji}
      </span>
    </motion.div>
  );
}
