"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function CreateQuizPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState(1);
  
  const [quizInfo, setQuizInfo] = useState({
    title: "",
    description: "",
    subject: "",
    difficulty: "medium",
    isPublic: false
  });
  
  const [creationMode, setCreationMode] = useState("manual"); // manual or pool
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState({
    question: "",
    options: ["", "", "", ""],
    correctAnswer: ""
  });
  
  const [availableQuestions, setAvailableQuestions] = useState([]);
  const [selectedQuestions, setSelectedQuestions] = useState([]);
  const [filterSubject, setFilterSubject] = useState("all");
  const [filterDifficulty, setFilterDifficulty] = useState("all");

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const res = await fetch("/api/auth/me");
      const data = await res.json();
      
      if (data.success) {
        setUser(data.user);
      } else {
        router.push("/login");
      }
    } catch (error) {
      router.push("/login");
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableQuestions = async () => {
    try {
      const params = new URLSearchParams();
      if (filterSubject !== "all") params.append("subject", filterSubject);
      if (filterDifficulty !== "all") params.append("difficulty", filterDifficulty);
      params.append("limit", "50");
      
      const res = await fetch(`/api/questions?${params}`);
      const data = await res.json();
      
      if (data.success) {
        setAvailableQuestions(data.questions);
      }
    } catch (error) {
      console.error("Error fetching questions:", error);
    }
  };

  const handleQuizInfoChange = (e) => {
    const { name, value, type, checked } = e.target;
    setQuizInfo({
      ...quizInfo,
      [name]: type === "checkbox" ? checked : value
    });
  };

  const handleQuestionChange = (e) => {
    setCurrentQuestion({
      ...currentQuestion,
      [e.target.name]: e.target.value
    });
  };

  const handleOptionChange = (index, value) => {
    const newOptions = [...currentQuestion.options];
    newOptions[index] = value;
    setCurrentQuestion({
      ...currentQuestion,
      options: newOptions
    });
  };

  const addQuestion = () => {
    if (!currentQuestion.question.trim()) {
      alert("Please enter a question");
      return;
    }
    
    if (currentQuestion.options.some(opt => !opt.trim())) {
      alert("Please fill all 4 options");
      return;
    }
    
    if (!currentQuestion.correctAnswer.trim()) {
      alert("Please select the correct answer");
      return;
    }
    
    if (!currentQuestion.options.includes(currentQuestion.correctAnswer)) {
      alert("Correct answer must match one of the options");
      return;
    }
    
    setQuestions([...questions, { ...currentQuestion }]);
    setCurrentQuestion({
      question: "",
      options: ["", "", "", ""],
      correctAnswer: ""
    });
  };

  const removeQuestion = (index) => {
    setQuestions(questions.filter((_, i) => i !== index));
  };

  const toggleQuestionSelection = (question) => {
    const isSelected = selectedQuestions.find(q => q._id === question._id);
    
    if (isSelected) {
      setSelectedQuestions(selectedQuestions.filter(q => q._id !== question._id));
    } else {
      setSelectedQuestions([...selectedQuestions, question]);
    }
  };

  const handleSubmit = async () => {
    if (!quizInfo.title.trim()) {
      alert("Please enter a quiz title");
      return;
    }
    
    const finalQuestions = creationMode === "manual" ? questions : selectedQuestions.map(q => ({
      question: q.question,
      options: q.options,
      correctAnswer: q.correctAnswer
    }));
    
    if (finalQuestions.length === 0) {
      alert("Please add at least one question");
      return;
    }
    
    try {
      const res = await fetch("/api/custom-quizzes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...quizInfo,
          questions: finalQuestions
        })
      });
      
      const data = await res.json();
      
      if (data.success) {
        alert("Quiz created successfully!");
        router.push(`/custom-quiz/${data.quizId}`);
      } else {
        alert("Error: " + data.error);
      }
    } catch (error) {
      alert("Error creating quiz");
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="spinner-border text-primary"></div>
      </div>
    );
  }

  return (
    <div className="container py-4">
      <div className="row justify-content-center">
        <div className="col-lg-10">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h1 className="display-6">📝 Create Custom Quiz</h1>
            <Link href="/" className="btn btn-outline-secondary">
              ← Back
            </Link>
          </div>

          {/* Progress Steps */}
          <div className="card shadow-sm mb-4">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div className={`text-center flex-fill ${step >= 1 ? 'text-primary' : 'text-muted'}`}>
                  <div className={`rounded-circle d-inline-flex align-items-center justify-content-center ${step >= 1 ? 'bg-primary text-white' : 'bg-light'}`} style={{ width: 40, height: 40 }}>
                    1
                  </div>
                  <div className="small mt-2">Quiz Info</div>
                </div>
                <div className="flex-fill" style={{ height: 2, backgroundColor: step >= 2 ? '#0d6efd' : '#dee2e6' }}></div>
                <div className={`text-center flex-fill ${step >= 2 ? 'text-primary' : 'text-muted'}`}>
                  <div className={`rounded-circle d-inline-flex align-items-center justify-content-center ${step >= 2 ? 'bg-primary text-white' : 'bg-light'}`} style={{ width: 40, height: 40 }}>
                    2
                  </div>
                  <div className="small mt-2">Add Questions</div>
                </div>
                <div className="flex-fill" style={{ height: 2, backgroundColor: step >= 3 ? '#0d6efd' : '#dee2e6' }}></div>
                <div className={`text-center flex-fill ${step >= 3 ? 'text-primary' : 'text-muted'}`}>
                  <div className={`rounded-circle d-inline-flex align-items-center justify-content-center ${step >= 3 ? 'bg-primary text-white' : 'bg-light'}`} style={{ width: 40, height: 40 }}>
                    3
                  </div>
                  <div className="small mt-2">Review & Create</div>
                </div>
              </div>
            </div>
          </div>

          {/* Step 1: Quiz Information */}
          {step === 1 && (
            <div className="card shadow">
              <div className="card-header bg-primary text-white">
                <h5 className="mb-0">Step 1: Quiz Information</h5>
              </div>
              <div className="card-body">
                <div className="mb-3">
                  <label className="form-label fw-bold">Quiz Title *</label>
                  <input
                    type="text"
                    className="form-control"
                    name="title"
                    value={quizInfo.title}
                    onChange={handleQuizInfoChange}
                    placeholder="e.g., My Physics Quiz"
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label fw-bold">Description</label>
                  <textarea
                    className="form-control"
                    name="description"
                    value={quizInfo.description}
                    onChange={handleQuizInfoChange}
                    rows="3"
                    placeholder="Brief description of your quiz"
                  />
                </div>

                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label fw-bold">Subject</label>
                    <input
                      type="text"
                      className="form-control"
                      name="subject"
                      value={quizInfo.subject}
                      onChange={handleQuizInfoChange}
                      placeholder="e.g., Physics, Math"
                    />
                  </div>

                  <div className="col-md-6 mb-3">
                    <label className="form-label fw-bold">Difficulty</label>
                    <select
                      className="form-select"
                      name="difficulty"
                      value={quizInfo.difficulty}
                      onChange={handleQuizInfoChange}
                    >
                      <option value="easy">Easy</option>
                      <option value="medium">Medium</option>
                      <option value="hard">Hard</option>
                    </select>
                  </div>
                </div>

                <div className="form-check mb-3">
                  <input
                    type="checkbox"
                    className="form-check-input"
                    id="isPublic"
                    name="isPublic"
                    checked={quizInfo.isPublic}
                    onChange={handleQuizInfoChange}
                  />
                  <label className="form-check-label" htmlFor="isPublic">
                    Make this quiz public (others can take it)
                  </label>
                </div>

                <button
                  className="btn btn-primary"
                  onClick={() => setStep(2)}
                  disabled={!quizInfo.title.trim()}
                >
                  Next: Add Questions →
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Add Questions */}
          {step === 2 && (
            <div className="card shadow">
              <div className="card-header bg-primary text-white">
                <h5 className="mb-0">Step 2: Add Questions</h5>
              </div>
              <div className="card-body">
                <div className="btn-group w-100 mb-4">
                  <button
                    className={`btn ${creationMode === "manual" ? "btn-primary" : "btn-outline-primary"}`}
                    onClick={() => setCreationMode("manual")}
                  >
                    ✏️ Create Manually
                  </button>
                  <button
                    className={`btn ${creationMode === "pool" ? "btn-primary" : "btn-outline-primary"}`}
                    onClick={() => {
                      setCreationMode("pool");
                      fetchAvailableQuestions();
                    }}
                  >
                    📚 Select from Pool
                  </button>
                </div>

                {creationMode === "manual" ? (
                  <>
                    <div className="mb-3">
                      <label className="form-label fw-bold">Question</label>
                      <textarea
                        className="form-control"
                        name="question"
                        value={currentQuestion.question}
                        onChange={handleQuestionChange}
                        rows="2"
                        placeholder="Enter your question"
                      />
                    </div>

                    {currentQuestion.options.map((option, index) => (
                      <div key={index} className="mb-2">
                        <label className="form-label">Option {index + 1}</label>
                        <input
                          type="text"
                          className="form-control"
                          value={option}
                          onChange={(e) => handleOptionChange(index, e.target.value)}
                          placeholder={`Option ${index + 1}`}
                        />
                      </div>
                    ))}

                    <div className="mb-3">
                      <label className="form-label fw-bold">Correct Answer</label>
                      <input
                        type="text"
                        className="form-control"
                        name="correctAnswer"
                        value={currentQuestion.correctAnswer}
                        onChange={handleQuestionChange}
                        placeholder="Must match one of the options above"
                      />
                    </div>

                    <button className="btn btn-success mb-4" onClick={addQuestion}>
                      ➕ Add Question
                    </button>

                    {questions.length > 0 && (
                      <div className="alert alert-info">
                        <strong>{questions.length}</strong> question(s) added
                      </div>
                    )}

                    <div className="list-group mb-3">
                      {questions.map((q, index) => (
                        <div key={index} className="list-group-item">
                          <div className="d-flex justify-content-between align-items-start">
                            <div className="flex-grow-1">
                              <strong>Q{index + 1}:</strong> {q.question}
                              <div className="small text-muted mt-1">
                                Answer: {q.correctAnswer}
                              </div>
                            </div>
                            <button
                              className="btn btn-sm btn-outline-danger"
                              onClick={() => removeQuestion(index)}
                            >
                              🗑️
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <>
                    <div className="row mb-3">
                      <div className="col-md-6">
                        <select
                          className="form-select"
                          value={filterSubject}
                          onChange={(e) => setFilterSubject(e.target.value)}
                        >
                          <option value="all">All Subjects</option>
                          <option value="Mathematics">Mathematics</option>
                          <option value="Physics">Physics</option>
                          <option value="Chemistry">Chemistry</option>
                          <option value="Biology">Biology</option>
                          <option value="Computer Science">Computer Science</option>
                        </select>
                      </div>
                      <div className="col-md-6">
                        <select
                          className="form-select"
                          value={filterDifficulty}
                          onChange={(e) => setFilterDifficulty(e.target.value)}
                        >
                          <option value="all">All Difficulties</option>
                          <option value="easy">Easy</option>
                          <option value="medium">Medium</option>
                          <option value="hard">Hard</option>
                        </select>
                      </div>
                    </div>

                    <button className="btn btn-primary mb-3" onClick={fetchAvailableQuestions}>
                      🔍 Search Questions
                    </button>

                    {selectedQuestions.length > 0 && (
                      <div className="alert alert-info">
                        <strong>{selectedQuestions.length}</strong> question(s) selected
                      </div>
                    )}

                    <div className="list-group" style={{ maxHeight: 400, overflowY: 'auto' }}>
                      {availableQuestions.map((q) => {
                        const isSelected = selectedQuestions.find(sq => sq._id === q._id);
                        return (
                          <div
                            key={q._id}
                            className={`list-group-item list-group-item-action ${isSelected ? 'active' : ''}`}
                            onClick={() => toggleQuestionSelection(q)}
                            style={{ cursor: 'pointer' }}
                          >
                            <div className="d-flex justify-content-between">
                              <div>
                                <div>{q.question}</div>
                                <small className="text-muted">
                                  {q.subject} - {q.difficulty}
                                </small>
                              </div>
                              {isSelected && <span>✓</span>}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </>
                )}

                <div className="d-flex justify-content-between mt-4">
                  <button className="btn btn-secondary" onClick={() => setStep(1)}>
                    ← Back
                  </button>
                  <button
                    className="btn btn-primary"
                    onClick={() => setStep(3)}
                    disabled={creationMode === "manual" ? questions.length === 0 : selectedQuestions.length === 0}
                  >
                    Next: Review →
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Review */}
          {step === 3 && (
            <div className="card shadow">
              <div className="card-header bg-primary text-white">
                <h5 className="mb-0">Step 3: Review & Create</h5>
              </div>
              <div className="card-body">
                <h5>{quizInfo.title}</h5>
                {quizInfo.description && <p className="text-muted">{quizInfo.description}</p>}
                
                <div className="mb-3">
                  <span className="badge bg-info me-2">{quizInfo.subject || 'Custom'}</span>
                  <span className="badge bg-warning text-dark me-2">{quizInfo.difficulty}</span>
                  <span className="badge bg-secondary">
                    {creationMode === "manual" ? questions.length : selectedQuestions.length} questions
                  </span>
                  {quizInfo.isPublic && <span className="badge bg-success ms-2">Public</span>}
                </div>

                <div className="alert alert-success">
                  <strong>Ready to create!</strong> Click the button below to save your quiz.
                </div>

                <div className="d-flex justify-content-between">
                  <button className="btn btn-secondary" onClick={() => setStep(2)}>
                    ← Back
                  </button>
                  <button className="btn btn-success btn-lg" onClick={handleSubmit}>
                    🎉 Create Quiz
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
