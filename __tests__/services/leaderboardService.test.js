/**
 * Unit Tests for Leaderboard Service
 */

import {
  saveScore,
  getLeaderboard,
  clearLeaderboard,
  filterLeaderboard,
  getTopScores,
} from '@/app/services/leaderboardService';

describe('Leaderboard Service', () => {
  let localStorageMock;

  beforeEach(() => {
    // Mock localStorage
    localStorageMock = {
      store: {},
      getItem: jest.fn((key) => localStorageMock.store[key] || null),
      setItem: jest.fn((key, value) => {
        localStorageMock.store[key] = value;
      }),
      removeItem: jest.fn((key) => {
        delete localStorageMock.store[key];
      }),
      clear: jest.fn(() => {
        localStorageMock.store = {};
      }),
    };

    global.localStorage = localStorageMock;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('saveScore', () => {
    it('should save a score to leaderboard', () => {
      const entry = {
        name: 'TestUser',
        score: 100,
        difficulty: 'easy',
        category: 'General Knowledge',
      };

      saveScore(entry);

      expect(localStorageMock.setItem).toHaveBeenCalled();
      const savedData = JSON.parse(localStorageMock.store.leaderboard);
      expect(savedData).toHaveLength(1);
      expect(savedData[0]).toEqual(entry);
    });

    it('should sort scores in descending order', () => {
      const entries = [
        { name: 'User1', score: 50, difficulty: 'easy' },
        { name: 'User2', score: 100, difficulty: 'easy' },
        { name: 'User3', score: 75, difficulty: 'easy' },
      ];

      entries.forEach((entry) => saveScore(entry));

      const leaderboard = getLeaderboard();
      expect(leaderboard[0].score).toBe(100);
      expect(leaderboard[1].score).toBe(75);
      expect(leaderboard[2].score).toBe(50);
    });

    it('should keep only top 50 entries', () => {
      // Add 60 entries
      for (let i = 0; i < 60; i++) {
        saveScore({
          name: `User${i}`,
          score: i,
          difficulty: 'easy',
        });
      }

      const leaderboard = getLeaderboard();
      expect(leaderboard).toHaveLength(50);
      expect(leaderboard[0].score).toBe(59); // Highest score
    });

    it('should handle errors gracefully', () => {
      localStorageMock.setItem.mockImplementation(() => {
        throw new Error('Storage error');
      });

      expect(() => saveScore({ name: 'Test', score: 100 })).not.toThrow();
    });
  });

  describe('getLeaderboard', () => {
    it('should return empty array when no data', () => {
      const leaderboard = getLeaderboard();

      expect(leaderboard).toEqual([]);
      expect(localStorageMock.getItem).toHaveBeenCalledWith('leaderboard');
    });

    it('should return saved leaderboard data', () => {
      const mockData = [
        { name: 'User1', score: 100, difficulty: 'easy' },
        { name: 'User2', score: 90, difficulty: 'medium' },
      ];

      localStorageMock.store.leaderboard = JSON.stringify(mockData);

      const leaderboard = getLeaderboard();

      expect(leaderboard).toEqual(mockData);
    });

    it('should handle corrupted data', () => {
      localStorageMock.store.leaderboard = 'invalid json';

      const leaderboard = getLeaderboard();

      expect(leaderboard).toEqual([]);
    });

    it('should handle storage errors', () => {
      localStorageMock.getItem.mockImplementation(() => {
        throw new Error('Storage error');
      });

      const leaderboard = getLeaderboard();

      expect(leaderboard).toEqual([]);
    });
  });

  describe('clearLeaderboard', () => {
    it('should clear leaderboard data', () => {
      localStorageMock.store.leaderboard = JSON.stringify([
        { name: 'User1', score: 100 },
      ]);

      clearLeaderboard();

      expect(localStorageMock.removeItem).toHaveBeenCalledWith('leaderboard');
      expect(localStorageMock.store.leaderboard).toBeUndefined();
    });

    it('should handle errors gracefully', () => {
      localStorageMock.removeItem.mockImplementation(() => {
        throw new Error('Storage error');
      });

      expect(() => clearLeaderboard()).not.toThrow();
    });
  });

  describe('filterLeaderboard', () => {
    beforeEach(() => {
      const mockData = [
        { name: 'User1', score: 100, difficulty: 'easy' },
        { name: 'User2', score: 90, difficulty: 'medium' },
        { name: 'User3', score: 80, difficulty: 'hard' },
        { name: 'User4', score: 70, difficulty: 'easy' },
      ];

      localStorageMock.store.leaderboard = JSON.stringify(mockData);
    });

    it('should return all entries when difficulty is "all"', () => {
      const filtered = filterLeaderboard('all');

      expect(filtered).toHaveLength(4);
    });

    it('should filter by easy difficulty', () => {
      const filtered = filterLeaderboard('easy');

      expect(filtered).toHaveLength(2);
      expect(filtered.every((entry) => entry.difficulty === 'easy')).toBe(true);
    });

    it('should filter by medium difficulty', () => {
      const filtered = filterLeaderboard('medium');

      expect(filtered).toHaveLength(1);
      expect(filtered[0].difficulty).toBe('medium');
    });

    it('should filter by hard difficulty', () => {
      const filtered = filterLeaderboard('hard');

      expect(filtered).toHaveLength(1);
      expect(filtered[0].difficulty).toBe('hard');
    });

    it('should return empty array for non-existent difficulty', () => {
      const filtered = filterLeaderboard('impossible');

      expect(filtered).toEqual([]);
    });
  });

  describe('getTopScores', () => {
    beforeEach(() => {
      const mockData = [];
      for (let i = 0; i < 20; i++) {
        mockData.push({
          name: `User${i}`,
          score: 100 - i,
          difficulty: i % 2 === 0 ? 'easy' : 'medium',
        });
      }

      localStorageMock.store.leaderboard = JSON.stringify(mockData);
    });

    it('should return top 10 scores by default', () => {
      const topScores = getTopScores();

      expect(topScores).toHaveLength(10);
      expect(topScores[0].score).toBe(100);
      expect(topScores[9].score).toBe(91);
    });

    it('should return custom count of scores', () => {
      const topScores = getTopScores(5);

      expect(topScores).toHaveLength(5);
      expect(topScores[0].score).toBe(100);
      expect(topScores[4].score).toBe(96);
    });

    it('should filter by difficulty', () => {
      const topScores = getTopScores(10, 'easy');

      expect(topScores).toHaveLength(10);
      expect(topScores.every((entry) => entry.difficulty === 'easy')).toBe(true);
    });

    it('should return all scores if count exceeds available', () => {
      const topScores = getTopScores(100);

      expect(topScores).toHaveLength(20);
    });

    it('should handle empty leaderboard', () => {
      localStorageMock.store.leaderboard = JSON.stringify([]);

      const topScores = getTopScores();

      expect(topScores).toEqual([]);
    });
  });
});
