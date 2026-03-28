"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { shuffleArray } from "../utils/shuffle";
import { useSound } from "../utils/useSound";
import { adaptiveDifficultyService } from "../services/adaptiveDifficultyService";

function QuizContent() {
  const searchParams = useSearchParams();
  const subject = searchParams.get("subject");
  const initialDifficulty = searchParams.get("difficulty") || "medium";
  const { playCorrect, playWrong, playComplete } = useSound();
  
  const [questions, setQuestions] = useState([]);
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [finished, setFinished] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeLeft, setTimeLeft] = useState(30);
  const [categoryName, setCategoryName] = useState("");
  const [subjectName, setSubjectName] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [adaptiveDifficulty, setAdaptiveDifficulty] = useState(initialDifficulty);
  const [difficultyChanged, setDifficultyChanged] = useState(false);
  const [previousDifficulty, setPreviousDifficulty] = useState(null);

  // Generate unique storage key based on subject and difficulty
  const storageKey = `quiz_progress_${subject || 'any'}_${adaptiveDifficulty}`;

  // Check for adaptive difficulty on mount
  useEffect(() => {
    if (subject) {
      const newDifficulty = adaptiveDifficultyService.getAdaptiveDifficulty(
        subject,
        subject,
        initialDifficulty
      );
      
      if (newDifficulty !== initialDifficulty) {
        setAdaptiveDifficulty(newDifficulty);
        setDifficultyChanged(true);
        setPreviousDifficulty(initialDifficulty);
      } else {
        setAdaptiveDifficulty(initialDifficulty);
      }
    } else {
      setAdaptiveDifficulty(initialDifficulty);
    }
  }, [subject, initialDifficulty]);

  // Load saved progress from localStorage on mount
  useEffect(() => {
    const savedProgress = localStorage.getItem(storageKey);
    if (savedProgress) {
      try {
        const { savedIndex, savedAnswers, savedQuestions } = JSON.parse(savedProgress);
        if (savedQuestions && savedQuestions.length > 0) {
          setQuestions(savedQuestions);
          setIndex(savedIndex || 0);
          setAnswers(savedAnswers || []);
          setLoading(false);
          
          // Set category and subject name from saved questions
          if (savedQuestions[0]?.category) {
            setCategoryName(savedQuestions[0].category);
          }
          if (savedQuestions[0]?.subject) {
            setSubjectName(savedQuestions[0].subject);
          }
          return; // Skip fetching new questions
        }
      } catch (err) {
        console.error("Failed to restore progress:", err);
        localStorage.removeItem(storageKey);
      }
    }
    
    // Load sound preference
    const savedSoundPref = localStorage.getItem("soundEnabled");
    if (savedSoundPref !== null) {
      setSoundEnabled(savedSoundPref === "true");
    }
  }, [storageKey]);

  useEffect(() => {
    async function fetchQuestions() {
      // Skip if we already have questions loaded from localStorage
      if (questions.length > 0 && refreshKey === 0) {
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        // Use MongoDB for questions
        const params = new URLSearchParams();
        
        if (subject) {
          params.append('subject', subject);
        }
        if (adaptiveDifficulty) {
          params.append('difficulty', adaptiveDifficulty);
        }
        params.append('limit', '10');
        
        const apiUrl = `/api/questions?${params.toString()}`;
        
        const res = await fetch(apiUrl);
        
        if (!res.ok) {
          throw new Error("Failed to fetch questions from server");
        }
        
        const data = await res.json();

        if (!data.success) {
          throw new Error(data.error || "Failed to load questions");
        }

        if (!data.questions || data.questions.length === 0) {
          throw new Error("No questions available for the selected subject and difficulty. Please try different options or contact admin to add questions.");
        }

        // MongoDB has questions - use them
        const formatted = data.questions.map((q) => ({
          question: q.question,
          correct: q.options[q.correctAnswer],
          options: shuffleArray([...q.options]),
          category: q.category || q.subject,
          subject: q.subject,
        }));

        setQuestions(formatted);
        setAnswers(new Array(formatted.length).fill(null));
        
        if (formatted.length > 0) {
          setCategoryName(formatted[0].category);
          setSubjectName(formatted[0].subject);
        }
        
        setLoading(false);
      } catch (err) {
        console.error("Error fetching questions:", err);
        setError(err.message);
        setLoading(false);
      }
    }

    fetchQuestions();
  }, [subject, adaptiveDifficulty, refreshKey]);

  // Save progress to localStorage whenever state changes
  useEffect(() => {
    if (questions.length > 0 && !finished) {
      const progressData = {
        savedIndex: index,
        savedAnswers: answers,
        savedQuestions: questions,
      };
      localStorage.setItem(storageKey, JSON.stringify(progressData));
    }
  }, [index, answers, questions, finished, storageKey]);

  // Clear localStorage when quiz finishes and play completion sound
  useEffect(() => {
    if (finished) {
      localStorage.removeItem(storageKey);
      
      // Play completion sound
      if (soundEnabled) {
        playComplete();
      }
      
      // Save score to MongoDB and localStorage leaderboard
      const playerName = localStorage.getItem("playerName") || "Anonymous";
      const score = calculateScore();
      
      // Record performance for adaptive difficulty
      if (subject) {
        adaptiveDifficultyService.recordQuizResult(
          subject,
          subject,
          adaptiveDifficulty,
          score,
          questions.length
        );
      }
      
      const leaderboardEntry = {
        name: playerName,
        score: score,
        total: questions.length,
        category: categoryName || "Mixed",
        subject: subjectName || "Mixed",
        difficulty: adaptiveDifficulty,
        date: new Date().toISOString(),
      };
      
      // Save to MongoDB
      fetch('/api/results', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: playerName,
          category: categoryName || "General",
          subject: subjectName || "General",
          score: score,
          totalQuestions: questions.length,
          difficulty: adaptiveDifficulty,
        }),
      })
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            console.log('Result saved to MongoDB:', data.resultId);
          } else {
            console.error('Failed to save result to MongoDB:', data.error);
          }
        })
        .catch(err => {
          console.error('Error saving result to MongoDB:', err);
        });
      
      // Get existing leaderboard
      const existingLeaderboard = JSON.parse(localStorage.getItem("leaderboard") || "[]");
      
      // Add new entry
      existingLeaderboard.push(leaderboardEntry);
      
      // Sort by score (highest first)
      existingLeaderboard.sort((a, b) => b.score - a.score);
      
      // Keep only top 50 entries
      const topEntries = existingLeaderboard.slice(0, 50);
      
      // Save back to localStorage
      localStorage.setItem("leaderboard", JSON.stringify(topEntries));
    }
  }, [finished, storageKey, categoryName, subjectName, adaptiveDifficulty, questions.length, soundEnabled, playComplete, category, subject]);

  // Timer effect - resets when question changes
  useEffect(() => {
    if (loading || finished) return;

    setTimeLeft(30); // Reset timer for new question

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          // Time's up - auto move to next question
          clearInterval(timer);
          handleTimeUp();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [index, loading, finished]);

  const handleTimeUp = () => {
    // Mark as unanswered if not already answered
    if (!answers[index]) {
      const newAnswers = [...answers];
      newAnswers[index] = null; // Explicitly mark as unanswered
      setAnswers(newAnswers);
    }

    // Move to next question or finish
    if (index === questions.length - 1) {
      setFinished(true);
    } else {
      setIndex(index + 1);
    }
  };

  const handleSelect = (option) => {
    if (answers[index]) return;

    const newAnswers = [...answers];
    newAnswers[index] = option;
    setAnswers(newAnswers);
    
    // Play sound effect based on answer correctness
    if (soundEnabled) {
      if (option === questions[index].correct) {
        playCorrect();
      } else {
        playWrong();
      }
    }
  };

  // Calculate score dynamically from answers
  const calculateScore = () => {
    return answers.reduce((total, answer, idx) => {
      return total + (answer === questions[idx]?.correct ? 1 : 0);
    }, 0);
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

  const handleRestartQuiz = () => {
    // Clear localStorage before restarting
    localStorage.removeItem(storageKey);
    
    // Reset all state
    setIndex(0);
    setAnswers([]);
    setFinished(false);
    setTimeLeft(30);
    // Trigger re-fetch of questions by updating refreshKey
    setRefreshKey(prev => prev + 1);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center px-4">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl mb-4 animate-pulse">
            <span className="text-white text-2xl font-bold">Q</span>
          </div>
          <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading questions...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
                <span className="text-4xl">⚠️</span>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Oops! Something went wrong</h2>
              <p className="text-gray-600">{error}</p>
            </div>
            
            <div className="space-y-3">
              <button 
                onClick={() => window.location.reload()}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 rounded-xl font-semibold hover:from-blue-600 hover:to-purple-700 transform hover:scale-105 transition-all duration-200 shadow-lg"
              >
                Try Again
              </button>
              <Link 
                href="/" 
                className="block w-full text-center bg-gray-200 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-300 transition-all duration-200"
              >
                Back to Home
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const score = calculateScore();

  if (finished) {
    const percentage = (score / questions.length) * 100;
    const nextDifficulty = subject 
      ? adaptiveDifficultyService.getAdaptiveDifficulty(subject, subject, adaptiveDifficulty)
      : adaptiveDifficulty;
    const willChangeDifficulty = nextDifficulty !== adaptiveDifficulty;
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center px-4 py-8">
        <motion.div 
          className="max-w-2xl w-full"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, type: "spring" }}
        >
          <motion.div 
            className="bg-white rounded-2xl shadow-2xl p-8"
            initial={{ y: 50 }}
            animate={{ y: 0 }}
            transition={{ delay: 0.2, duration: 0.4 }}
          >
            <motion.div
              className="text-center mb-6"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
            >
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-green-400 to-blue-500 rounded-full mb-4">
                <span className="text-5xl">🎉</span>
              </div>
              <h2 className="text-4xl font-bold text-gray-900 mb-2">Quiz Finished!</h2>
              
              {categoryName && (
                <p className="text-gray-600">
                  {categoryName} • {subjectName} • {adaptiveDifficulty.charAt(0).toUpperCase() + adaptiveDifficulty.slice(1)}
                </p>
              )}
            </motion.div>

            {willChangeDifficulty && (
              <motion.div
                className={`rounded-xl p-4 mb-6 ${
                  nextDifficulty > adaptiveDifficulty 
                    ? 'bg-green-50 border-2 border-green-200' 
                    : 'bg-blue-50 border-2 border-blue-200'
                }`}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.45 }}
              >
                <p className={`font-semibold ${
                  nextDifficulty > adaptiveDifficulty ? 'text-green-800' : 'text-blue-800'
                }`}>
                  <strong>
                    {nextDifficulty > adaptiveDifficulty ? '🎉 Great job!' : '💡 Tip:'}
                  </strong>
                  {' '}
                  {nextDifficulty > adaptiveDifficulty 
                    ? `Your next quiz will be ${nextDifficulty} difficulty!`
                    : `Your next quiz will be ${nextDifficulty} difficulty to help you improve.`
                  }
                </p>
              </motion.div>
            )}

            <motion.div
              className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-8 mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <div className="text-center">
                <p className="text-gray-600 mb-2">Your Score</p>
                <p className="text-6xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
                  {score}/{questions.length}
                </p>
                
                <motion.div
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.6, type: "spring" }}
                >
                  {(() => {
                    const percent = percentage;
                    if (percent < 40) return <p className="text-2xl font-semibold text-red-600">Needs Improvement</p>;
                    else if (percent < 60) return <p className="text-2xl font-semibold text-yellow-600">Average - Keep Practicing</p>;
                    else if (percent < 75) return <p className="text-2xl font-semibold text-blue-600">Good Job!</p>;
                    else return <p className="text-2xl font-semibold text-green-600">Excellent! 🎉</p>;
                  })()}
                </motion.div>
              </div>
            </motion.div>

            <motion.div 
              className="space-y-3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
            >
              <button
                className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white py-4 rounded-xl font-semibold text-lg hover:from-green-600 hover:to-emerald-700 transform hover:scale-105 transition-all duration-200 shadow-lg"
                onClick={handleRestartQuiz}
                aria-label="Restart quiz with new questions"
              >
                🔄 Restart Quiz
              </button>
              
              <div className="grid grid-cols-2 gap-3">
                <Link 
                  href="/leaderboard" 
                  className="flex items-center justify-center gap-2 bg-yellow-500 text-white py-3 rounded-xl font-semibold hover:bg-yellow-600 transform hover:scale-105 transition-all duration-200 shadow-md"
                >
                  🏆 Leaderboard
                </Link>
                <Link 
                  href="/" 
                  className="flex items-center justify-center gap-2 bg-gray-600 text-white py-3 rounded-xl font-semibold hover:bg-gray-700 transform hover:scale-105 transition-all duration-200 shadow-md"
                >
                  🏠 Home
                </Link>
              </div>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    );
  }

  const current = questions[index];
  const isLocked = !!answers[index];
  const progressPercent = ((index + 1) / questions.length) * 100;

  return (
    <div className="h-screen overflow-hidden bg-gradient-to-br from-blue-50 via-white to-purple-50 flex flex-col">
      {/* Fixed Top Header */}
      <div className="sticky top-0 z-40 bg-white border-b-2 border-gray-200 shadow-lg">
        <div className="max-w-3xl mx-auto px-4 py-4">
          {/* Timer and Score Row */}
          <div className="flex justify-between items-center mb-3">
            <div className="flex items-center gap-2">
              <span className="text-2xl">⏱️</span>
              <motion.span 
                className={`text-3xl font-bold ${timeLeft <= 5 ? 'text-red-600' : 'text-blue-600'}`}
                animate={{ scale: timeLeft <= 5 ? [1, 1.1, 1] : 1 }}
                transition={{ duration: 0.5, repeat: timeLeft <= 5 ? Infinity : 0 }}
              >
                {timeLeft}s
              </motion.span>
            </div>

            <div className="text-right">
              <div className="text-sm text-gray-500">Score</div>
              <div className="text-2xl font-bold text-gray-900">
                {score}<span className="text-gray-400">/{questions.length}</span>
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mb-2">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-semibold text-gray-700">
                Question {index + 1} of {questions.length}
              </span>
              <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-bold">
                {Math.round(progressPercent)}%
              </span>
            </div>
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-blue-500 to-purple-600 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progressPercent}%` }}
                transition={{ duration: 0.5 }}
              ></motion.div>
            </div>
          </div>

          {/* Category Tags */}
          {categoryName && subjectName && (
            <div className="flex flex-wrap gap-2 mt-3">
              <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                📚 {categoryName}
              </span>
              <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">
                📖 {subjectName}
              </span>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                adaptiveDifficulty === "easy" ? "bg-green-100 text-green-700" : 
                adaptiveDifficulty === "hard" ? "bg-red-100 text-red-700" : 
                "bg-yellow-100 text-yellow-700"
              }`}>
                {adaptiveDifficulty === "easy" ? "😊 Easy" : 
                 adaptiveDifficulty === "hard" ? "🔥 Hard" : 
                 "🤔 Medium"}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Scrollable Content Area */}
      <div className="flex-1 overflow-y-auto px-4 py-6 pb-24">
        <div className="max-w-3xl mx-auto">
        {/* Sound Toggle Button */}
        <motion.div 
          className="flex justify-end mb-4"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          <button
            onClick={() => {
              const newSoundState = !soundEnabled;
              setSoundEnabled(newSoundState);
              localStorage.setItem("soundEnabled", newSoundState.toString());
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all duration-200 ${
              soundEnabled 
                ? "bg-blue-500 text-white hover:bg-blue-600" 
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
            aria-label="Toggle sound effects"
            title={soundEnabled ? "Mute sounds" : "Enable sounds"}
          >
            {soundEnabled ? "🔊 Sound On" : "🔇 Sound Off"}
          </button>
        </motion.div>

        {/* Question Card - Modern UI */}
        <AnimatePresence mode="wait">
          <motion.div 
            key={index}
            className="bg-white rounded-2xl shadow-xl p-6 mb-6"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3 }}
          >
            <motion.h2
              dangerouslySetInnerHTML={{ __html: current.question }}
              className="text-xl md:text-2xl font-bold text-gray-900 mb-6 leading-relaxed"
              role="heading"
              aria-level="2"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.3 }}
            ></motion.h2>

            {/* Options - Modern Card Style with Hover States */}
            <div 
              className={`grid gap-3 ${
                current.options.every(opt => opt.length < 30) 
                  ? 'grid-cols-1 sm:grid-cols-2' 
                  : 'grid-cols-1'
              }`} 
              role="radiogroup" 
              aria-label="Answer options"
            >
              {current.options.map((option, i) => {
                const isSelected = option === answers[index];
                const isCorrect = option === current.correct;
                
                let buttonClass = "w-full text-left px-6 py-4 rounded-xl font-medium transition-all duration-200 border-2 cursor-pointer ";
                
                if (isLocked) {
                  if (isCorrect) {
                    buttonClass += "bg-green-600 border-green-700 text-white font-bold shadow-lg transform scale-105";
                  } else if (isSelected && !isCorrect) {
                    buttonClass += "bg-red-600 border-red-700 text-white font-bold shadow-lg transform scale-105";
                  } else {
                    buttonClass += "bg-gray-50 border-gray-200 text-gray-500 opacity-60";
                  }
                } else {
                  if (isSelected) {
                    buttonClass += "bg-blue-500 border-blue-600 text-white shadow-lg transform scale-105 ring-4 ring-blue-200";
                  } else {
                    buttonClass += "bg-white border-gray-300 text-gray-700 hover:border-blue-400 hover:bg-blue-50 hover:shadow-md hover:scale-102 active:scale-98";
                  }
                }

                return (
                  <motion.button
                    key={i}
                    className={buttonClass}
                    onClick={() => handleSelect(option)}
                    dangerouslySetInnerHTML={{ __html: option }}
                    disabled={isLocked}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 + i * 0.05, duration: 0.2 }}
                    whileHover={!isLocked ? { scale: 1.02 } : {}}
                    whileTap={!isLocked ? { scale: 0.98 } : {}}
                    role="radio"
                    aria-checked={isSelected}
                    aria-label={`Option ${i + 1}`}
                  ></motion.button>
                );
              })}
            </div>
          </motion.div>
        </AnimatePresence>
        </div>
      </div>

      {/* Fixed Bottom Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t-2 border-gray-200 shadow-2xl z-50">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center gap-4">
            <motion.button
              className="px-6 py-3 bg-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              onClick={handlePrev}
              disabled={index === 0}
              aria-label="Go to previous question"
              whileHover={{ scale: index === 0 ? 1 : 1.05 }}
              whileTap={{ scale: index === 0 ? 1 : 0.95 }}
            >
              ← Previous
            </motion.button>

            <div className="text-sm text-gray-600 font-medium">
              Question {index + 1} of {questions.length}
            </div>

            <motion.button
              className="px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-bold hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed disabled:from-gray-400 disabled:to-gray-500 transition-all duration-200 shadow-lg"
              disabled={!isLocked}
              onClick={handleNext}
              aria-label={index === questions.length - 1 ? "Finish quiz" : "Go to next question"}
              whileHover={{ scale: !isLocked ? 1 : 1.05 }}
              whileTap={{ scale: !isLocked ? 1 : 0.95 }}
            >
              {index === questions.length - 1 ? "🏁 Finish" : "Next →"}
            </motion.button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function QuizPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-500"></div>
      </div>
    }>
      <QuizContent />
    </Suspense>
  );
}
