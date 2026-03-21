"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "react-toastify";

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
      toast.error("Please enter a question");
      return;
    }
    
    if (currentQuestion.options.some(opt => !opt.trim())) {
      toast.error("Please fill all 4 options");
      return;
    }
    
    if (!currentQuestion.correctAnswer.trim()) {
      toast.error("Please select the correct answer");
      return;
    }
    
    if (!currentQuestion.options.includes(currentQuestion.correctAnswer)) {
      toast.error("Correct answer must match one of the options");
      return;
    }
    
    setQuestions([...questions, { ...currentQuestion }]);
    toast.success("Question added successfully!");
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
      toast.error("Please enter a quiz title");
      return;
    }
    
    const finalQuestions = creationMode === "manual" ? questions : selectedQuestions.map(q => ({
      question: q.question,
      options: q.options,
      correctAnswer: q.correctAnswer
    }));
    
    if (finalQuestions.length === 0) {
      toast.error("Please add at least one question");
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
        toast.success("Quiz created successfully!");
        router.push(`/custom-quiz/${data.quizId}`);
      } else {
        toast.error(data.error);
      }
    } catch (error) {
      toast.error("Error creating quiz");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-8 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900">📝 Create Custom Quiz</h1>
          <Link href="/" className="px-4 py-2 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-100 transition-all duration-200">
            ← Back
          </Link>
        </div>

          {/* Progress Steps */}
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
            <div className="flex items-center justify-between">
              <div className={`text-center flex-1 ${step >= 1 ? 'text-blue-600' : 'text-gray-400'}`}>
                <div className={`w-10 h-10 rounded-full inline-flex items-center justify-center font-bold ${step >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>
                  1
                </div>
                <div className="text-xs sm:text-sm mt-2">Quiz Info</div>
              </div>
              <div className="flex-1 h-0.5" style={{ backgroundColor: step >= 2 ? '#2563eb' : '#e5e7eb' }}></div>
              <div className={`text-center flex-1 ${step >= 2 ? 'text-blue-600' : 'text-gray-400'}`}>
                <div className={`w-10 h-10 rounded-full inline-flex items-center justify-center font-bold ${step >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>
                  2
                </div>
                <div className="text-xs sm:text-sm mt-2">Add Questions</div>
              </div>
              <div className="flex-1 h-0.5" style={{ backgroundColor: step >= 3 ? '#2563eb' : '#e5e7eb' }}></div>
              <div className={`text-center flex-1 ${step >= 3 ? 'text-blue-600' : 'text-gray-400'}`}>
                <div className={`w-10 h-10 rounded-full inline-flex items-center justify-center font-bold ${step >= 3 ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>
                  3
                </div>
                <div className="text-xs sm:text-sm mt-2">Review & Create</div>
              </div>
            </div>
          </div>

          {/* Step 1: Quiz Information */}
          {step === 1 && (
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
              <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-4">
                <h5 className="text-xl font-bold">Step 1: Quiz Information</h5>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Quiz Title *</label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200 outline-none"
                    name="title"
                    value={quizInfo.title}
                    onChange={handleQuizInfoChange}
                    placeholder="e.g., My Physics Quiz"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Description</label>
                  <textarea
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200 outline-none"
                    name="description"
                    value={quizInfo.description}
                    onChange={handleQuizInfoChange}
                    rows="3"
                    placeholder="Brief description of your quiz"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Subject</label>
                    <input
                      type="text"
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200 outline-none"
                      name="subject"
                      value={quizInfo.subject}
                      onChange={handleQuizInfoChange}
                      placeholder="e.g., Physics, Math"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Difficulty</label>
                    <select
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200 outline-none"
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

                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    id="isPublic"
                    name="isPublic"
                    checked={quizInfo.isPublic}
                    onChange={handleQuizInfoChange}
                  />
                  <label className="text-sm text-gray-700" htmlFor="isPublic">
                    Make this quiz public (others can take it)
                  </label>
                </div>

                <button
                  className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 rounded-xl font-semibold hover:from-blue-600 hover:to-purple-700 transform hover:scale-105 transition-all duration-200 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
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
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
              <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-4">
                <h5 className="text-xl font-bold">Step 2: Add Questions</h5>
              </div>
              <div className="p-6">
                <div className="flex gap-2 mb-6">
                  <button
                    className={`flex-1 py-3 rounded-xl font-semibold transition-all duration-200 ${creationMode === "manual" ? "bg-blue-600 text-white shadow-lg" : "bg-gray-200 text-gray-700 hover:bg-gray-300"}`}
                    onClick={() => setCreationMode("manual")}
                  >
                    ✏️ Create Manually
                  </button>
                  <button
                    className={`flex-1 py-3 rounded-xl font-semibold transition-all duration-200 ${creationMode === "pool" ? "bg-blue-600 text-white shadow-lg" : "bg-gray-200 text-gray-700 hover:bg-gray-300"}`}
                    onClick={() => {
                      setCreationMode("pool");
                      fetchAvailableQuestions();
                    }}
                  >
                    📚 Select from Pool
                  </button>
                </div>

                {creationMode === "manual" ? (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Question</label>
                      <textarea
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200 outline-none"
                        name="question"
                        value={currentQuestion.question}
                        onChange={handleQuestionChange}
                        rows="2"
                        placeholder="Enter your question"
                      />
                    </div>

                    {currentQuestion.options.map((option, index) => (
                      <div key={index}>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Option {index + 1}</label>
                        <input
                          type="text"
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200 outline-none"
                          value={option}
                          onChange={(e) => handleOptionChange(index, e.target.value)}
                          placeholder={`Option ${index + 1}`}
                        />
                      </div>
                    ))}

                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Correct Answer</label>
                      <input
                        type="text"
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200 outline-none"
                        name="correctAnswer"
                        value={currentQuestion.correctAnswer}
                        onChange={handleQuestionChange}
                        placeholder="Must match one of the options above"
                      />
                    </div>

                    <button className="w-full bg-green-500 text-white py-3 rounded-xl font-semibold hover:bg-green-600 transition-all duration-200 shadow-lg" onClick={addQuestion}>
                      ➕ Add Question
                    </button>

                    {questions.length > 0 && (
                      <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
                        <strong className="text-blue-800">{questions.length}</strong> question(s) added
                      </div>
                    )}

                    <div className="space-y-2">
                      {questions.map((q, index) => (
                        <div key={index} className="bg-gray-50 border-2 border-gray-200 rounded-xl p-4">
                          <div className="flex justify-between items-start gap-4">
                            <div className="flex-1">
                              <strong className="text-gray-900">Q{index + 1}:</strong> {q.question}
                              <div className="text-sm text-gray-500 mt-1">
                                Answer: {q.correctAnswer}
                              </div>
                            </div>
                            <button
                              className="px-3 py-1 text-red-600 border-2 border-red-300 rounded-lg hover:bg-red-50 transition-all duration-200"
                              onClick={() => removeQuestion(index)}
                            >
                              🗑️
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <select
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200 outline-none"
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
                      <div>
                        <select
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200 outline-none"
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

                    <button className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition-all duration-200 shadow-lg" onClick={fetchAvailableQuestions}>
                      🔍 Search Questions
                    </button>

                    {selectedQuestions.length > 0 && (
                      <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
                        <strong className="text-blue-800">{selectedQuestions.length}</strong> question(s) selected
                      </div>
                    )}

                    <div className="space-y-2 max-h-96 overflow-y-auto">
                      {availableQuestions.map((q) => {
                        const isSelected = selectedQuestions.find(sq => sq._id === q._id);
                        return (
                          <div
                            key={q._id}
                            className={`p-4 rounded-xl cursor-pointer transition-all duration-200 ${isSelected ? 'bg-blue-600 text-white shadow-lg' : 'bg-gray-50 hover:bg-gray-100 border-2 border-gray-200'}`}
                            onClick={() => toggleQuestionSelection(q)}
                          >
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <div className="font-medium">{q.question}</div>
                                <small className={isSelected ? 'text-blue-100' : 'text-gray-500'}>
                                  {q.subject} - {q.difficulty}
                                </small>
                              </div>
                              {isSelected && <span className="text-2xl">✓</span>}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row justify-between gap-3 mt-6">
                  <button className="px-6 py-3 bg-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-300 transition-all duration-200" onClick={() => setStep(1)}>
                    ← Back
                  </button>
                  <button
                    className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-semibold hover:from-blue-600 hover:to-purple-700 transition-all duration-200 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
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
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
              <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-4">
                <h5 className="text-xl font-bold">Step 3: Review & Create</h5>
              </div>
              <div className="p-6 space-y-4">
                <h5 className="text-2xl font-bold text-gray-900">{quizInfo.title}</h5>
                {quizInfo.description && <p className="text-gray-600">{quizInfo.description}</p>}
                
                <div className="flex flex-wrap gap-2">
                  <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">{quizInfo.subject || 'Custom'}</span>
                  <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm font-medium">{quizInfo.difficulty}</span>
                  <span className="px-3 py-1 bg-gray-200 text-gray-700 rounded-full text-sm font-medium">
                    {creationMode === "manual" ? questions.length : selectedQuestions.length} questions
                  </span>
                  {quizInfo.isPublic && <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">Public</span>}
                </div>

                <div className="bg-green-50 border-2 border-green-200 rounded-xl p-4">
                  <strong className="text-green-800">Ready to create!</strong> Click the button below to save your quiz.
                </div>

                <div className="flex flex-col sm:flex-row justify-between gap-3">
                  <button className="px-6 py-3 bg-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-300 transition-all duration-200" onClick={() => setStep(2)}>
                    ← Back
                  </button>
                  <button className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-semibold text-lg hover:from-green-600 hover:to-emerald-700 transform hover:scale-105 transition-all duration-200 shadow-lg" onClick={handleSubmit}>
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
