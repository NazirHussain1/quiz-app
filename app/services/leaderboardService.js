/**
 * Leaderboard Service - Handles leaderboard operations
 */

const LEADERBOARD_KEY = "leaderboard";
const MAX_ENTRIES = 50;

/**
 * Save score to leaderboard
 * @param {Object} entry - Leaderboard entry
 * @param {string} entry.name - Player name
 * @param {number} entry.score - Score achieved
 * @param {number} entry.total - Total questions
 * @param {string} entry.category - Quiz category
 * @param {string} entry.difficulty - Difficulty level
 * @param {string} entry.date - ISO date string
 */
export function saveScore(entry) {
  try {
    const leaderboard = getLeaderboard();
    leaderboard.push(entry);
    
    // Sort by score (highest first)
    leaderboard.sort((a, b) => b.score - a.score);
    
    // Keep only top entries
    const topEntries = leaderboard.slice(0, MAX_ENTRIES);
    
    localStorage.setItem(LEADERBOARD_KEY, JSON.stringify(topEntries));
  } catch (error) {
    console.error("Error saving score:", error);
  }
}

/**
 * Get leaderboard entries
 * @returns {Array} Array of leaderboard entries
 */
export function getLeaderboard() {
  try {
    const data = localStorage.getItem(LEADERBOARD_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error("Error loading leaderboard:", error);
    return [];
  }
}

/**
 * Clear all leaderboard entries
 */
export function clearLeaderboard() {
  try {
    localStorage.removeItem(LEADERBOARD_KEY);
  } catch (error) {
    console.error("Error clearing leaderboard:", error);
  }
}

/**
 * Filter leaderboard by difficulty
 * @param {string} difficulty - Difficulty level or "all"
 * @returns {Array} Filtered leaderboard entries
 */
export function filterLeaderboard(difficulty) {
  const leaderboard = getLeaderboard();
  
  if (difficulty === "all") {
    return leaderboard;
  }
  
  return leaderboard.filter(entry => entry.difficulty === difficulty);
}

/**
 * Get top N entries from leaderboard
 * @param {number} count - Number of entries to return
 * @param {string} difficulty - Optional difficulty filter
 * @returns {Array} Top N entries
 */
export function getTopScores(count = 10, difficulty = "all") {
  const filtered = filterLeaderboard(difficulty);
  return filtered.slice(0, count);
}
