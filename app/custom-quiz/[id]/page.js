"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { shuffleArray } from "@/app/utils/shuffle";

export default function CustomQuizPage() {
  const params = useParams();
  const router = useRouter();
  const quizId = params.id;
  
  const [quiz, setQuiz] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [finished, setFinished] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeLeft, setTimeLeft] = useState(30);

  useEffect(() => {
    fetchQuiz();
  }, [quizId]);

  const fetchQuiz = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/custom-quizzes/${quizId}`);
      const data = await res.json();
      
      if (data.success) {
        setQuiz(data.quiz);
        const shuffledQuestions = data.quiz.questions.map(q => ({
          ...q,
          options: shuffleArray([...q.options])
        }));
        setQuestions(shuffledQuestions);
        setAnswers(new Array(shuffledQuestions.length).fill(null));
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError("Failed to load quiz");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (loading || finished) return;

    setTimeLeft(30);

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
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
    if (!answers[index]) {
      const newAnswers = [...answers];
      newAnswers[index] = null;
      setAnswers(newAnswers);
    }

    if (index === questions.length - 1) {
      setFinished(true);
      saveResult();
    } else {
      setIndex(index + 1);
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
      return total + (answer === questions[idx]?.correctAnswer ? 1 : 0);
    }, 0);
  };

  const saveResult = async () => {
    const playerName = localStorage.getItem("playerName") || "Anonymous";
    const score = calculateScore();
    
    try {
      await fetch('/api/results', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: playerName,
          category: "Custom Quiz",
          subject: quiz?.subject || "Custom",
          score: score,
          totalQuestions: questions.length,
          difficulty: quiz?.difficulty || "medium",
          customQuizId: quizId
        }),
      });
    } catch (err) {
      console.error('Error saving result:', err);
    }
  };

  const handleNext = () => {
    if (index === questions.length - 1) {
      setFinished(true);
      saveResult();
      return;
    }
    setIndex(index + 1);
  };

  const handlePrev = () => {
    if (index === 0) return;
    setIndex(index - 1);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-green-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading quiz...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
          <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6">
            <h4 className="text-xl font-bold text-red-800 mb-2">Error!</h4>
            <p className="text-red-700 mb-4">{error}</p>
            <Link href="/" className="inline-block px-6 py-3 bg-gray-600 text-white rounded-xl font-semibold hover:bg-gray-700 transition-all duration-200">Back to Home</Link>
          </div>
        </div>
      </div>
    );
  }

  if (finished) {
    const score = calculateScore();
    const percentage = Math.round((score / questions.length) * 100);
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center px-4 py-8">
        <motion.div 
          className="max-w-md w-full"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <div className="bg-white rounded-2xl shadow-2xl p-8">
            <h2 className="text-3xl font-bold text-center text-gray-900 mb-4">Quiz Completed! 🎉</h2>
            
            <div className="text-center mb-4">
              <h4 className="text-xl font-bold text-gray-900">{quiz.title}</h4>
              <p className="text-gray-600">by {quiz.userName}</p>
            </div>

            <div className="text-center mb-6">
              <h1 className="text-6xl font-bold text-green-600 mb-2">{percentage}%</h1>
              <p className="text-xl text-gray-700">Score: {score} / {questions.length}</p>
            </div>

            {(() => {
              if (percentage < 40) return <p className="text-red-600 text-center text-xl font-semibold">Fail</p>;
              else if (percentage < 60) return <p className="text-yellow-600 text-center text-xl font-semibold">Average</p>;
              else if (percentage < 75) return <p className="text-blue-600 text-center text-xl font-semibold">Good</p>;
              else return <p className="text-green-600 text-center text-xl font-semibold">Excellent! 🎉</p>;
            })()}

            <div className="space-y-3 mt-6">
              <Link href="/my-quizzes" className="block w-full text-center px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-all duration-200 shadow-lg">
                📚 My Quizzes
              </Link>
              <Link href="/" className="block w-full text-center px-6 py-3 bg-gray-600 text-white rounded-xl font-semibold hover:bg-gray-700 transition-all duration-200">
                🏠 Home
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  const current = questions[index];
  const isLocked = !!answers[index];
  const progressPercent = ((index + 1) / questions.length) * 100;

  return (
    <div className="h-screen overflow-hidden bg-gradient-to-br from-blue-50 via-white to-purple-50 flex flex-col">
      <div className="flex-1 overflow-y-auto px-4 py-8 pb-24">
        <div className="max-w-2xl mx-auto">
        <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl shadow-lg p-4 mb-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
            <span className="px-4 py-2 bg-blue-600 text-white rounded-full text-sm font-bold">📝 {quiz.title}</span>
            <span className="text-gray-600 text-sm">by {quiz.userName}</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6 mb-4">
          <div className="flex justify-between items-center mb-3">
            <span className="font-bold text-gray-700">Question {index + 1} of {questions.length}</span>
            <span className="px-3 py-1 bg-blue-600 text-white rounded-full text-sm font-bold">
              {Math.round(progressPercent)}%
            </span>
          </div>
          
          <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-green-500 rounded-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            ></div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6 text-center mb-4">
          <span className={`text-4xl font-bold ${timeLeft <= 5 ? 'text-red-600' : 'text-green-600'}`}>
            ⏱️ {timeLeft}s
          </span>
        </div>

        <AnimatePresence mode="wait">
          <motion.div 
            key={index}
            className="bg-white rounded-2xl shadow-xl p-6 mb-4"
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
          >
            <h5 className="text-xl font-bold text-gray-900 mb-4">{current.question}</h5>

            <div 
              className={`grid gap-3 ${
                // Adaptive layout based on option length
                current.options.every(opt => opt.length < 30) 
                  ? 'grid-cols-1 sm:grid-cols-2' 
                  : 'grid-cols-1'
              }`}
            >
              {current.options.map((option, i) => {
                let className = "w-full text-left px-6 py-4 rounded-xl font-medium transition-all duration-200 border-2 ";
                const isSelected = option === answers[index];
                const isCorrect = option === current.correctAnswer;

                if (isLocked) {
                  if (isCorrect) {
                    className += "bg-green-600 border-green-700 text-white font-bold shadow-lg";
                  } else if (isSelected && !isCorrect) {
                    className += "bg-red-600 border-red-700 text-white font-bold shadow-lg";
                  } else {
                    className += "bg-gray-50 border-gray-200 text-gray-500";
                  }
                } else {
                  className += "bg-white border-gray-200 text-gray-700 hover:border-blue-300 hover:bg-blue-50";
                }

                return (
                  <button
                    key={i}
                    className={className}
                    onClick={() => handleSelect(option)}
                    disabled={isLocked}
                  >
                    {option}
                  </button>
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
            <button
              className="px-6 py-3 bg-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              onClick={handlePrev}
              disabled={index === 0}
            >
              ← Previous
            </button>

            <div className="text-sm text-gray-600 font-medium">
              Question {index + 1} of {questions.length}
            </div>

            <button
              className="px-8 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-bold hover:from-green-600 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed disabled:from-gray-400 disabled:to-gray-500 transition-all duration-200 shadow-lg"
              disabled={!isLocked}
              onClick={handleNext}
            >
              {index === questions.length - 1 ? "🏁 Finish" : "Next →"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
