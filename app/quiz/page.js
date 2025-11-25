"use client";

import { useEffect, useState } from "react";
import { shuffleArray } from "../utils/shuffle";

export default function QuizPage() {
  const [questions, setQuestions] = useState([]);
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState([]); // store selected answers
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);

  useEffect(() => {
    async function fetchQuestions() {
      const res = await fetch(
        "https://opentdb.com/api.php?amount=10&type=multiple"
      );
      const data = await res.json();

      const formatted = data.results.map((q) => ({
        question: q.question,
        correct: q.correct_answer,
        options: shuffleArray([...q.incorrect_answers, q.correct_answer]),
      }));

      setQuestions(formatted);
      setAnswers(new Array(formatted.length).fill(null)); // initialize answers
    }

    fetchQuestions();
  }, []);

  const handleSelect = (option) => {
    if (answers[index]) return; // already answered, cannot change

    const newAnswers = [...answers];
    newAnswers[index] = option;
    setAnswers(newAnswers);

    if (option === questions[index].correct) {
      setScore(score + 1);
    }
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

  if (!questions.length)
    return <h2 className="text-center mt-5">Loading...</h2>;

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
        <h5>Score: {score}</h5>
        <h6>
          Question {index + 1} / {questions.length}
        </h6>
      </div>

      {/* QUESTION CARD */}
      <div className="card p-4 shadow-sm">
        <h5
          dangerouslySetInnerHTML={{ __html: current.question }}
          className="mb-3"
        ></h5>

        {/* OPTIONS */}
        <div className="list-group">
          {current.options.map((option, i) => {
            let className = "list-group-item list-group-item-action";

            if (isLocked) {
              if (option === current.correct) {
                className += " bg-success text-white"; // green for correct
              } else if (
                option === answers[index] &&
                option !== current.correct
              ) {
                className += " bg-danger text-white"; // red for wrong
              }
            }

            return (
              <button
                key={i}
                className={className}
                onClick={() => handleSelect(option)}
                dangerouslySetInnerHTML={{ __html: option }}
                disabled={isLocked} // cannot change after selection
              ></button>
            );
          })}
        </div>
      </div>

      {/* BUTTONS */}
      <div className="d-flex justify-content-between mt-3">
        <button
          className="btn btn-success"
          onClick={handlePrev}
          disabled={index === 0}
        >
          Previous
        </button>

        <button
          className="btn btn-success"
          disabled={!isLocked}
          onClick={handleNext}
        >
          {index === questions.length - 1 ? "Finish" : "Next"}
        </button>
      </div>
    </div>
  );
}
