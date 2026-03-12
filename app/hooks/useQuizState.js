import { useState, useEffect } from "react";
import { shuffleArray } from "../utils/shuffle";
import { fetchQuestions } from "../services/quizService";
import { saveProgress, loadProgress, removeProgress } from "../services/storageService";

/**
 * Custom hook for managing quiz state
 * @param {string} categoryId - Category ID
 * @param {string} difficulty - Difficulty level
 * @returns {Object} Quiz state and methods
 */
export function useQuizState(categoryId, difficulty) {
  const [questions, setQuestions] = useState([]);
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [finished, setFinished] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [categoryName, setCategoryName] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  const storageKey = `quiz_progress_${categoryId || 'any'}_${difficulty}`;

  // Load saved progress
  useEffect(() => {
    const savedProgress = loadProgress(storageKey);
    if (savedProgress) {
      const { savedIndex, savedAnswers, savedQuestions } = savedProgress;
      if (savedQuestions && savedQuestions.length > 0) {
        setQuestions(savedQuestions);
        setIndex(savedIndex || 0);
        setAnswers(savedAnswers || []);
        setLoading(false);
        
        if (savedQuestions[0]?.category) {
          setCategoryName(savedQuestions[0].category);
        }
        return;
      }
    }
  }, [storageKey]);

  // Fetch questions
  useEffect(() => {
    async function loadQuestions() {
      if (questions.length > 0 && refreshKey === 0) {
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        const results = await fetchQuestions({
          category: categoryId,
          difficulty: difficulty,
          amount: 10
        });

        const formatted = results.map((q) => ({
          question: q.question,
          correct: q.correct_answer,
          options: shuffleArray([...q.incorrect_answers, q.correct_answer]),
          category: q.category,
        }));

        setQuestions(formatted);
        setAnswers(new Array(formatted.length).fill(null));
        
        if (formatted.length > 0) {
          setCategoryName(formatted[0].category);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    loadQuestions();
  }, [categoryId, difficulty, refreshKey]);

  // Save progress
  useEffect(() => {
    if (questions.length > 0 && !finished) {
      saveProgress(storageKey, {
        savedIndex: index,
        savedAnswers: answers,
        savedQuestions: questions,
      });
    }
  }, [index, answers, questions, finished, storageKey]);

  // Clear progress when finished
  useEffect(() => {
    if (finished) {
      removeProgress(storageKey);
    }
  }, [finished, storageKey]);

  const handleSelect = (option) => {
    if (answers[index]) return;

    const newAnswers = [...answers];
    newAnswers[index] = option;
    setAnswers(newAnswers);
  };

  const handleNext = () => {
    if (index === questions.length - 1) {
      setFinished(true);
      return;
    }
    setIndex(index + 1);
  };

  const handlePrev = () => {
    if (index === 0) return;
    setIndex(index - 1);
  };

  const handleRestart = () => {
    removeProgress(storageKey);
    setIndex(0);
    setAnswers([]);
    setFinished(false);
    setRefreshKey(prev => prev + 1);
  };

  const calculateScore = () => {
    return answers.reduce((total, answer, idx) => {
      return total + (answer === questions[idx]?.correct ? 1 : 0);
    }, 0);
  };

  return {
    questions,
    index,
    answers,
    finished,
    loading,
    error,
    categoryName,
    handleSelect,
    handleNext,
    handlePrev,
    handleRestart,
    calculateScore,
    setIndex,
    setFinished,
    setAnswers,
  };
}
