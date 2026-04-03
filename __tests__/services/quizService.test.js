/**
 * Unit Tests for Quiz Service
 */

import { fetchCategories, fetchQuestions } from '@/app/services/quizService';

describe('Quiz Service', () => {
  beforeEach(() => {
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('fetchCategories', () => {
    it('should fetch categories successfully', async () => {
      const mockCategories = [
        { id: 9, name: 'General Knowledge' },
        { id: 10, name: 'Entertainment: Books' },
        { id: 11, name: 'Entertainment: Film' },
      ];

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ trivia_categories: mockCategories }),
      });

      const categories = await fetchCategories();

      expect(categories).toEqual(mockCategories);
      expect(global.fetch).toHaveBeenCalledWith('https://opentdb.com/api_category.php');
    });

    it('should throw error when fetch fails', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: false,
      });

      await expect(fetchCategories()).rejects.toThrow('Failed to fetch categories');
    });

    it('should handle network errors', async () => {
      global.fetch.mockRejectedValueOnce(new Error('Network error'));

      await expect(fetchCategories()).rejects.toThrow('Network error');
    });
  });

  describe('fetchQuestions', () => {
    const mockQuestions = [
      {
        category: 'General Knowledge',
        type: 'multiple',
        difficulty: 'easy',
        question: 'What is 2+2?',
        correct_answer: '4',
        incorrect_answers: ['3', '5', '6'],
      },
      {
        category: 'General Knowledge',
        type: 'multiple',
        difficulty: 'easy',
        question: 'What is the capital of France?',
        correct_answer: 'Paris',
        incorrect_answers: ['London', 'Berlin', 'Madrid'],
      },
    ];

    it('should fetch questions with default amount', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ response_code: 0, results: mockQuestions }),
      });

      const questions = await fetchQuestions({});

      expect(questions).toEqual(mockQuestions);
      expect(global.fetch).toHaveBeenCalledWith(
        'https://opentdb.com/api.php?amount=10&type=multiple'
      );
    });

    it('should fetch questions with category', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ response_code: 0, results: mockQuestions }),
      });

      const questions = await fetchQuestions({ category: 9 });

      expect(questions).toEqual(mockQuestions);
      expect(global.fetch).toHaveBeenCalledWith(
        'https://opentdb.com/api.php?amount=10&type=multiple&category=9'
      );
    });

    it('should fetch questions with difficulty', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ response_code: 0, results: mockQuestions }),
      });

      const questions = await fetchQuestions({ difficulty: 'easy' });

      expect(questions).toEqual(mockQuestions);
      expect(global.fetch).toHaveBeenCalledWith(
        'https://opentdb.com/api.php?amount=10&type=multiple&difficulty=easy'
      );
    });

    it('should fetch questions with custom amount', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ response_code: 0, results: mockQuestions }),
      });

      const questions = await fetchQuestions({ amount: 20 });

      expect(questions).toEqual(mockQuestions);
      expect(global.fetch).toHaveBeenCalledWith(
        'https://opentdb.com/api.php?amount=20&type=multiple'
      );
    });

    it('should fetch questions with all parameters', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ response_code: 0, results: mockQuestions }),
      });

      const questions = await fetchQuestions({
        category: 9,
        difficulty: 'medium',
        amount: 15,
      });

      expect(questions).toEqual(mockQuestions);
      expect(global.fetch).toHaveBeenCalledWith(
        'https://opentdb.com/api.php?amount=15&type=multiple&category=9&difficulty=medium'
      );
    });

    it('should throw error when fetch fails', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: false,
      });

      await expect(fetchQuestions({})).rejects.toThrow('Failed to fetch questions');
    });

    it('should throw error when no questions available', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ response_code: 1, results: [] }),
      });

      await expect(fetchQuestions({})).rejects.toThrow(
        'No questions available for this category'
      );
    });

    it('should handle network errors', async () => {
      global.fetch.mockRejectedValueOnce(new Error('Network error'));

      await expect(fetchQuestions({})).rejects.toThrow('Network error');
    });
  });
});
