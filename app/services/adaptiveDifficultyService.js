const STORAGE_KEY = 'user_performance';

export const adaptiveDifficultyService = {
  getPerformanceKey(category, subject) {
    return `${category}_${subject}`;
  },

  getUserPerformance() {
    if (typeof window === 'undefined') return {};
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : {};
  },

  saveUserPerformance(performance) {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(performance));
  },

  recordQuizResult(category, subject, difficulty, score, totalQuestions) {
    const performance = this.getUserPerformance();
    const key = this.getPerformanceKey(category, subject);
    
    if (!performance[key]) {
      performance[key] = {
        category,
        subject,
        history: []
      };
    }
    
    const percentage = (score / totalQuestions) * 100;
    
    performance[key].history.push({
      difficulty,
      score,
      totalQuestions,
      percentage,
      date: new Date().toISOString()
    });
    
    // Keep only last 10 results per category/subject
    if (performance[key].history.length > 10) {
      performance[key].history = performance[key].history.slice(-10);
    }
    
    performance[key].lastDifficulty = difficulty;
    performance[key].lastPercentage = percentage;
    
    this.saveUserPerformance(performance);
  },

  getAdaptiveDifficulty(category, subject, currentDifficulty) {
    const performance = this.getUserPerformance();
    const key = this.getPerformanceKey(category, subject);
    
    if (!performance[key] || !performance[key].lastDifficulty) {
      return currentDifficulty || 'medium';
    }
    
    const lastDifficulty = performance[key].lastDifficulty;
    const lastPercentage = performance[key].lastPercentage;
    
    // Upgrade difficulty if score > 75% on Easy
    if (lastDifficulty === 'easy' && lastPercentage > 75) {
      return 'medium';
    }
    
    // Upgrade difficulty if score > 75% on Medium
    if (lastDifficulty === 'medium' && lastPercentage > 75) {
      return 'hard';
    }
    
    // Downgrade difficulty if score < 40% on Medium
    if (lastDifficulty === 'medium' && lastPercentage < 40) {
      return 'easy';
    }
    
    // Downgrade difficulty if score < 40% on Hard
    if (lastDifficulty === 'hard' && lastPercentage < 40) {
      return 'medium';
    }
    
    // Keep same difficulty if performance is between 40-75%
    return lastDifficulty;
  },

  getDifficultyChange(category, subject, currentDifficulty) {
    const performance = this.getUserPerformance();
    const key = this.getPerformanceKey(category, subject);
    
    if (!performance[key] || !performance[key].lastDifficulty) {
      return null;
    }
    
    const lastDifficulty = performance[key].lastDifficulty;
    const adaptiveDifficulty = this.getAdaptiveDifficulty(category, subject, currentDifficulty);
    
    if (adaptiveDifficulty !== lastDifficulty) {
      return {
        from: lastDifficulty,
        to: adaptiveDifficulty,
        reason: adaptiveDifficulty > lastDifficulty ? 'upgrade' : 'downgrade'
      };
    }
    
    return null;
  },

  getPerformanceStats(category, subject) {
    const performance = this.getUserPerformance();
    const key = this.getPerformanceKey(category, subject);
    
    if (!performance[key] || !performance[key].history.length) {
      return null;
    }
    
    const history = performance[key].history;
    const totalQuizzes = history.length;
    const averageScore = history.reduce((sum, h) => sum + h.percentage, 0) / totalQuizzes;
    const lastScore = history[history.length - 1].percentage;
    
    return {
      totalQuizzes,
      averageScore: Math.round(averageScore),
      lastScore: Math.round(lastScore),
      lastDifficulty: performance[key].lastDifficulty,
      trend: lastScore > averageScore ? 'improving' : lastScore < averageScore ? 'declining' : 'stable'
    };
  },

  clearPerformance() {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(STORAGE_KEY);
  }
};
