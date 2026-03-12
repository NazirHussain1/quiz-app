"use client";

import { useEffect, useState } from "react";
import { shuffleArray } from "../utils/shuffle";

export default function QuizPage() {
  const [questions, setQuestions] = useState([]);
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [finished, setFinished] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchQuestions() {
      try {
        setLoading(true);
        setError(null);
        
        const res = await fetch(
          "https://opentdb.com/api.php?amount=10&type=multiple"
        );
        
        if (!res.ok) {
          throw new Error("Failed to fetch questions");
        }
        
        const data = await res.json();

        if (data.response_code !== 0) {
          throw new Error("No questions available");
        }

        const formatted = data.results.map((q) => ({
          question: q.question,
          correct: q.correct_answer,
          options: shuffleArray([...q.incorrect_answers, q.correct_answer]),
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
  }, []);

  const handleSelect = (option) => {
    if (answers[index]) return;

    const newAnswers = [...answers];
    newAnswers[index] = option;
    setAnswers(newAnswers);
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

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="text-center">
          <div className="spinner-border text-success" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3">Loading questions...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mt-5" style={{ maxWidth: 600 }}>
        <div className="alert alert-danger" role="alert">
          <h4 className="alert-heading">Error!</h4>
          <p>{error}</p>
          <hr />
          <button 
            className="btn btn-danger"
            onClick={() => window.location.reload()}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const score = calculateScore();

  if (finished)
    return (
      <div className="container mt-5" style={{ maxWidth: 600 }}>
        <div className="card p-4 shadow" >
  <h2 className="text-center">Quiz Finished 🎉</h2>

  <p className="text-center fs-5">
    Your Score: <b>{score} / {questions.length}</b>
  </p>

  {/* Performance Message */}
  {(() => {
    const percent = (score / questions.length) * 100;
    if (percent < 40) return <p className="text-danger text-center fs-6">Fail</p>;
    else if (percent < 60) return <p className="text-warning text-center fs-6">Average - Need More Improvement</p>;
    else if (percent < 75) return <p className="text-info text-center fs-6">Good</p>;
    else return <p className="text-success text-center fs-6">Excellent 🎉</p>;
  })()}

  <button
    className="btn btn-success mt-3 w-100"
    onClick={() => window.location.reload()}
  >
    Restart
  </button>
</div>

      </div>
    );

  const current = questions[index];
  const isLocked = !!answers[index];

  return (
    <div className="container mt-4" style={{ maxWidth: 600 }}>
      {/* SCORE + PROGRESS */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h5 aria-live="polite">Score: {score}</h5>
        <h6 aria-live="polite">
          Question {index + 1} / {questions.length}
        </h6>
      </div>

      {/* PROGRESS BAR */}
      <div className="progress mb-3" style={{ height: "8px" }}>
        <div
          className="progress-bar bg-success"
          role="progressbar"
          style={{ width: `${((index + 1) / questions.length) * 100}%` }}
          aria-valuenow={index + 1}
          aria-valuemin="0"
          aria-valuemax={questions.length}
        ></div>
      </div>

      {/* QUESTION CARD */}
      <div className="card p-4 shadow-sm">
        <h5
          dangerouslySetInnerHTML={{ __html: current.question }}
          className="mb-3"
          role="heading"
          aria-level="2"
        ></h5>

        {/* OPTIONS */}
        <div className="list-group" role="radiogroup" aria-label="Answer options">
          {current.options.map((option, i) => {
            let className = "list-group-item list-group-item-action";
            const isSelected = option === answers[index];
            const isCorrect = option === current.correct;

            if (isLocked) {
              if (isCorrect) {
                className += " bg-success text-white";
              } else if (isSelected && !isCorrect) {
                className += " bg-danger text-white";
              }
            }

            return (
              <button
                key={i}
                className={className}
                onClick={() => handleSelect(option)}
                dangerouslySetInnerHTML={{ __html: option }}
                disabled={isLocked}
                role="radio"
                aria-checked={isSelected}
                aria-label={`Option ${i + 1}`}
              ></button>
            );
          })}
        </div>
      </div>

      {/* BUTTONS */}
      <div className="d-flex justify-content-between mt-3">
        <button
          className="btn btn-secondary"
          onClick={handlePrev}
          disabled={index === 0}
          aria-label="Go to previous question"
        >
          ← Previous
        </button>

        <button
          className="btn btn-success"
          disabled={!isLocked}
          onClick={handleNext}
          aria-label={index === questions.length - 1 ? "Finish quiz" : "Go to next question"}
        >
          {index === questions.length - 1 ? "Finish" : "Next →"}
        </button>
      </div>
    </div>
  );
}
