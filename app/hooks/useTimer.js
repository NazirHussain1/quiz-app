import { useState, useEffect } from "react";

/**
 * Custom hook for managing quiz timer
 * @param {number} initialTime - Initial time in seconds
 * @param {boolean} isActive - Whether timer is active
 * @param {Function} onTimeUp - Callback when time runs out
 * @returns {Object} Timer state
 */
export function useTimer(initialTime = 15, isActive = true, onTimeUp) {
  const [timeLeft, setTimeLeft] = useState(initialTime);

  useEffect(() => {
    if (!isActive) return;

    setTimeLeft(initialTime);

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          if (onTimeUp) onTimeUp();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isActive, initialTime, onTimeUp]);

  return { timeLeft, setTimeLeft };
}
