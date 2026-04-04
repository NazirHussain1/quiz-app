"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { shuffleArray } from "../utils/shuffle";
import { useSound } from "../utils/useSound";
import { toast } from "react-toastify";

function ExamContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const category = searchParams.get("category");
  const subject = searchParams.get("subject");
  const difficulty = searchParams.get("difficulty") || "medium";
  const { playComplete } = useSound();
  
  const [questions, setQuestions] = useState([]);
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [finished, setFinished] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeLeft, setTimeLeft] = useState(1800); // 30 minutes in seconds
  const [startTime] = useState(Date.now());
  const [soundEnabled, setSoundEnabled] = useState(true);

  useEffect(() => {
    const savedSoundPref = localStorage.getItem("soundEnabled");
    if (savedSoundPref !== null) {
      setSoundEnabled(savedSoundPref === "true");
    }
  }, []);

  useEffect(() => {
    async function fetchQuestions() {
      try {
        setLoading(true);
        setError(null);
        
        const params = new URLSearchParams();
        if (category) params.append('category', category);
        if (subject) params.append('subject', subject);
        if (difficulty) params.append('difficulty', difficulty);
        params.append('limit', '30');
        
        let apiUrl = `/api/questions?${params.toString()}`;
        let res = await fetch(apiUrl);
        
        if (res.ok) {
          let data = await res.json();

          // If no questions found with specific difficulty, try without difficulty filter
          if (data.success && (!data.questions || data.questions.length === 0) && difficulty) {
            console.log(`No questions found for difficulty: ${difficulty}, trying without difficulty filter...`);
            
            const fallbackParams = new URLSearchParams();
            if (category) fallbackParams.append('category', category);
            if (subject) fallbackParams.append('subject', subject);
            fallbackParams.append('limit', '30');
            
            apiUrl = `/api/questions?${fallbackParams.toString()}`;
            res = await fetch(apiUrl);
            
            if (res.ok) {
              data = await res.json();
            }
          }

          if (data.success && data.questions && data.questions.length > 0) {
            const formatted = data.questions.map((q) => ({
              question: q.question,
              correct: q.correctAnswer,
              options: shuffleArray([...q.options]),
              category: q.category,
              subject: q.subject,
            }));

            setQuestions(formatted);
            setAnswers(new Array(formatted.length).fill(null));
            setLoading(false);
            return;
          }
        }
        
        // Fallback to OpenTDB API
        let triviaUrl = "https://opentdb.com/api.php?amount=30&type=multiple";
        if (difficulty) triviaUrl += `&difficulty=${difficulty}`;
        
        const triviaRes = await fetch(triviaUrl);
        if (!triviaRes.ok) throw new Error("Failed to fetch questions");
        
        const triviaData = await triviaRes.json();
        if (triviaData.response_code !== 0) throw new Error("No questions available");

        const formatted = triviaData.results.map((q) => ({
          question: q.question,
          correct: q.correct_answer,
          options: shuffleArray([...q.incorrect_answers, q.correct_answer]),
          category: q.category,
          subject: "General",
        }));

        setQuestions(formatted);
        setAnswers(new Array(formatted.length).fill(null));
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchQuestions();
  }, [category, subject, difficulty]);

  useEffect(() => {
    if (loading || finished || questions.length === 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleAutoSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [loading, finished, questions.length]);

  const handleAutoSubmit = () => {
    setFinished(true);
    saveExamResult();
    if (soundEnabled) playComplete();
  };

  const saveExamResult = async () => {
    const playerName = localStorage.getItem("playerName") || "Anonymous";
    const score = calculateScore();
    const timeTaken = Math.floor((Date.now() - startTime) / 1000);
    
    try {
      await fetch('/api/results', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: playerName,
          category: category || "General",
          subject: subject || "General",
          score: score,
          totalQuestions: questions.length,
          difficulty: difficulty,
          timeTaken: timeTaken,
          examMode: true
        }),
      });
    } catch (err) {
      console.error('Error saving exam result:', err);
    }
  };

  const handleSelect = (option) => {
    if (answers[index]) return;

    const newAnswers = [...answers];
    newAnswers[index] = option;
    setAnswers(newAnswers);
  };

  const calculateScore = () => {
    return answers.reduce((total, answer, idx) => {
      return total + (answer === questions[idx]?.correct ? 1 : 0);
    }, 0);
  };

  const handleNext = () => {
    if (!answers[index]) {
      if (!confirm("You haven't answered this question. Continue anyway?")) {
        return;
      }
    }
    
    if (index === questions.length - 1) {
      setFinished(true);
      saveExamResult();
      if (soundEnabled) playComplete();
      toast.success("Exam submitted successfully!");
      return;
    }
    setIndex(index + 1);
  };

  const handleSubmit = () => {
    const unanswered = answers.filter(a => a === null).length;
    if (unanswered > 0) {
      if (!confirm(`You have ${unanswered} unanswered questions. Submit anyway?`)) {
        return;
      }
    }
    
    setFinished(true);
    saveExamResult();
    if (soundEnabled) playComplete();
    toast.success("Exam submitted successfully!");
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center px-4">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl mb-4 animate-pulse">
            <span className="text-white text-2xl font-bold">📝</span>
          </div>
          <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-yellow-500 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading exam questions...</p>
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
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Error Loading Exam</h2>
              <p className="text-gray-600">{error}</p>
            </div>
            <Link 
              href="/" 
              className="block w-full text-center bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 rounded-xl font-semibold hover:from-blue-600 hover:to-purple-700 transition-all duration-200"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const score = calculateScore();
  const progressPercent = ((index + 1) / questions.length) * 100;

  if (finished) {
    const timeTaken = Math.floor((Date.now() - startTime) / 1000);
    const percentage = Math.round((score / questions.length) * 100);
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center px-4 py-8">
        <motion.div 
          className="max-w-2xl w-full"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, type: "spring" }}
        >
          <motion.div 
            className="bg-white rounded-2xl shadow-2xl p-6 md:p-10"
            initial={{ y: 50 }}
            animate={{ y: 0 }}
            transition={{ delay: 0.2, duration: 0.4 }}
          >
            <motion.div
              className="text-center mb-8"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
            >
              <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full mb-4">
                <span className="text-6xl">🎓</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">Exam Completed!</h2>
              
              <div className="space-y-1 text-gray-600">
                <p className="text-sm md:text-base">
                  {category || "General"} • {subject || "General"}
                </p>
                <p className="text-sm md:text-base">
                  Time Taken: <span className="font-semibold">{formatTime(timeTaken)}</span>
                </p>
              </div>
            </motion.div>

            <motion.div
              className="grid grid-cols-2 gap-4 mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <div className="bg-green-50 rounded-xl p-6 text-center border-2 border-green-200">
                <p className="text-4xl md:text-5xl font-bold text-green-600 mb-2">{score}</p>
                <p className="text-gray-600 font-medium">Correct</p>
              </div>
              <div className="bg-red-50 rounded-xl p-6 text-center border-2 border-red-200">
                <p className="text-4xl md:text-5xl font-bold text-red-600 mb-2">{questions.length - score}</p>
                <p className="text-gray-600 font-medium">Wrong</p>
              </div>
            </motion.div>

            <motion.div
              className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-8 mb-8 text-center"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.6, type: "spring" }}
            >
              <p className="text-gray-600 mb-2">Final Score</p>
              <p className="text-7xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
                {percentage}%
              </p>
              {(() => {
                if (percentage < 40) return <p className="text-xl font-semibold text-red-600">Needs Improvement</p>;
                else if (percentage < 60) return <p className="text-xl font-semibold text-yellow-600">Pass - Keep Practicing</p>;
                else if (percentage < 75) return <p className="text-xl font-semibold text-blue-600">Good Performance</p>;
                else return <p className="text-xl font-semibold text-green-600">Excellent! 🎉</p>;
              })()}
            </motion.div>

            <motion.div 
              className="space-y-3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
            >
              <Link 
                href="/leaderboard" 
                className="block w-full text-center bg-gradient-to-r from-yellow-400 to-orange-500 text-white py-4 rounded-xl font-semibold text-lg hover:from-yellow-500 hover:to-orange-600 transform hover:scale-105 transition-all duration-200 shadow-lg"
              >
                🏆 View Leaderboard
              </Link>
              <Link 
                href="/" 
                className="block w-full text-center bg-gray-600 text-white py-4 rounded-xl font-semibold text-lg hover:bg-gray-700 transform hover:scale-105 transition-all duration-200 shadow-md"
              >
                🏠 Back to Home
              </Link>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="h-screen overflow-hidden bg-gradient-to-br from-blue-50 via-white to-purple-50 flex flex-col">
      <div className="flex-1 overflow-y-auto px-4 py-8 pb-24">
        <div className="max-w-4xl mx-auto">
        {/* Exam Mode Banner */}
        <div className="bg-yellow-100 border-2 border-yellow-400 rounded-2xl shadow-md mb-6 p-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div className="flex items-center gap-3">
              <span className="px-4 py-2 bg-yellow-400 text-yellow-900 rounded-full text-sm md:text-base font-bold">
                📝 EXAM MODE
              </span>
              <span className="text-sm md:text-base text-gray-700">
                {category} - {subject}
              </span>
            </div>
            <span className="text-xs md:text-sm text-gray-600">
              30 questions • 30 minutes
            </span>
          </div>
        </div>

        {/* Progress Card */}
        <motion.div 
          className="bg-white rounded-2xl shadow-lg p-6 mb-6"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
            <span className="text-base md:text-lg font-bold text-gray-700">
              Question {index + 1} of {questions.length}
            </span>
            <span className="px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm md:text-base font-medium">
              {Math.round(progressPercent)}% Complete
            </span>
          </div>
          
          <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-blue-500 to-purple-600 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 0.5 }}
            ></motion.div>
          </div>
        </motion.div>

        {/* Timer Card */}
        <motion.div 
          className={`rounded-2xl shadow-lg p-6 mb-6 transition-all duration-300 ${
            timeLeft <= 300 
              ? 'bg-red-50 border-2 border-red-300' 
              : 'bg-white border-2 border-gray-200'
          }`}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex items-center justify-center gap-3">
            <span className="text-2xl md:text-3xl">⏱️</span>
            <motion.span 
              className={`text-4xl md:text-5xl font-bold ${timeLeft <= 300 ? 'text-red-600' : 'text-gray-900'}`}
              animate={{ scale: timeLeft <= 300 ? [1, 1.05, 1] : 1 }}
              transition={{ duration: 0.5, repeat: timeLeft <= 300 ? Infinity : 0 }}
            >
              {formatTime(timeLeft)}
            </motion.span>
            <span className="text-gray-500 text-sm">remaining</span>
          </div>
        </motion.div>

        {/* Question Card */}
        <AnimatePresence mode="wait">
          <motion.div 
            key={index}
            className="bg-white rounded-2xl shadow-xl p-6 md:p-8 mb-6"
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ duration: 0.3 }}
          >
            <motion.h2
              dangerouslySetInnerHTML={{ __html: current.question }}
              className="text-xl md:text-2xl font-bold text-gray-900 mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.3 }}
            ></motion.h2>

            <div 
              className={`grid gap-3 ${
                // Adaptive layout based on option length
                current.options.every(opt => opt.length < 30) 
                  ? 'grid-cols-1 sm:grid-cols-2' 
                  : 'grid-cols-1'
              }`}
            >
              {current.options.map((option, i) => {
                const isSelected = option === answers[index];
                let buttonClass = "w-full text-left px-6 py-4 rounded-xl font-medium transition-all duration-200 border-2 ";
                
                if (isSelected) {
                  buttonClass += "bg-blue-50 border-blue-500 text-blue-900 shadow-md";
                } else {
                  buttonClass += "bg-white border-gray-200 text-gray-700 hover:border-blue-300 hover:bg-blue-50 hover:shadow-md";
                }

                return (
                  <motion.button
                    key={i}
                    className={buttonClass}
                    onClick={() => handleSelect(option)}
                    dangerouslySetInnerHTML={{ __html: option }}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 + i * 0.1, duration: 0.3 }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  ></motion.button>
                );
              })}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Fixed Bottom Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t-2 border-gray-200 shadow-2xl z-50">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center gap-4">
            <div className="text-sm text-gray-600 font-medium">
              ⚠️ Cannot go back
            </div>

            <div className="text-sm text-gray-600 font-medium">
              Answered: <span className="font-bold text-gray-900">{answers.filter(a => a !== null).length}</span> / {questions.length}
            </div>

            {index === questions.length - 1 ? (
              <motion.button
                className="px-8 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-bold hover:from-green-600 hover:to-emerald-700 transition-all duration-200 shadow-lg"
                onClick={handleSubmit}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                🏁 Submit Exam
              </motion.button>
            ) : (
              <motion.button
                className="px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-bold hover:from-blue-600 hover:to-purple-700 transition-all duration-200 shadow-lg"
                onClick={handleNext}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Next →
              </motion.button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ExamPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-500"></div>
      </div>
    }>
      <ExamContent />
    </Suspense>
  );
}
