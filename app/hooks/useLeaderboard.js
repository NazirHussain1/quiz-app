import { useState, useEffect } from "react";
import { 
  getLeaderboard, 
  saveScore, 
  clearLeaderboard as clearLeaderboardService,
  getTopScores 
} from "../services/leaderboardService";

export function useLeaderboard() {
  const [leaderboard, setLeaderboard] = useState([]);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    loadLeaderboard();
  }, []);

  const loadLeaderboard = () => {
    const data = getLeaderboard();
    setLeaderboard(data);
  };

  const addScore = (entry) => {
    saveScore(entry);
    loadLeaderboard();
  };

  const clearAll = () => {
    clearLeaderboardService();
    setLeaderboard([]);
  };

  const getFiltered = () => {
    return getTopScores(10, filter);
  };

  return {
    leaderboard,
    filter,
    setFilter,
    addScore,
    clearAll,
    getFiltered,
    reload: loadLeaderboard,
  };
}
