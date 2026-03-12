const LEADERBOARD_KEY = "leaderboard";
const MAX_ENTRIES = 50;

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

export function getLeaderboard() {
  try {
    const data = localStorage.getItem(LEADERBOARD_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error("Error loading leaderboard:", error);
    return [];
  }
}

export function clearLeaderboard() {
  try {
    localStorage.removeItem(LEADERBOARD_KEY);
  } catch (error) {
    console.error("Error clearing leaderboard:", error);
  }
}

export function filterLeaderboard(difficulty) {
  const leaderboard = getLeaderboard();
  
  if (difficulty === "all") {
    return leaderboard;
  }
  
  return leaderboard.filter(entry => entry.difficulty === difficulty);
}

export function getTopScores(count = 10, difficulty = "all") {
  const filtered = filterLeaderboard(difficulty);
  return filtered.slice(0, count);
}
