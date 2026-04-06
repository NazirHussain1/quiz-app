"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { Search, Edit2, Trash2, ChevronLeft, ChevronRight, Loader2, X, Plus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import AdminLayout from "@/app/admin/components/AdminLayout";

export default function AdminPanel() {
  const { user, loading: authLoading } = useSelector((state) => state.auth);
  const router = useRouter();
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);
  
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterSubject, setFilterSubject] = useState("all");
  const [filterDifficulty, setFilterDifficulty] = useState("all");
  const [searchKeyword, setSearchKeyword] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  
  const [categories, setCategories] = useState([]);
  const [subjects, setSubjects] = useState([]);
  
  const [formData, setFormData] = useState({
    category: "",
    subject: "",
    topic: "",
    difficulty: "medium",
    question: "",
    option1: "",
    option2: "",
    option3: "",
    option4: "",
    correctAnswer: ""
  });

  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Role-based access control
  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push("/login");
      } else if (user.role !== "admin") {
        router.push("/");
      }
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user && user.role === "admin") {
      setCurrentPage(1); // Reset to page 1 when filters change
      fetchQuestions();
      fetchCategories();
      fetchSubjects();
    }
  }, [filterCategory, filterSubject, filterDifficulty, searchKeyword, user]);

  useEffect(() => {
    if (user && user.role === "admin") {
      fetchQuestions();
    }
  }, [currentPage]);

  // Show loading while checking auth
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-500"></div>
      </div>
    );
  }

  // Show access denied if not admin
  if (!user || user.role !== "admin") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
          <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6">
            <h4 className="text-xl font-bold text-red-800 mb-2">Access Denied</h4>
            <p className="text-red-700 mb-4">You do not have permission to access this page.</p>
            <Link href="/" className="inline-block px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-all duration-200">
              Go to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.append('page', currentPage);
      params.append('limit', '20');
      if (filterCategory !== "all") params.append("category", filterCategory);
      if (filterSubject !== "all") params.append("subject", filterSubject);
      if (filterDifficulty !== "all") params.append("difficulty", filterDifficulty);
      if (searchKeyword.trim()) params.append("search", searchKeyword.trim());
      
      const res = await fetch(`/api/admin/questions?${params}`);
      const data = await res.json();
      
      if (data.success) {
        setQuestions(data.questions);
        setTotalPages(data.totalPages || 1);
        setTotalCount(data.totalCount || data.count);
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await fetch("/api/questions/categories");
      const data = await res.json();
      if (data.success) {
        setCategories(data.categories);
      }
    } catch (err) {
      console.error("Error fetching categories:", err);
    }
  };

  const fetchSubjects = async () => {
    try {
      const res = await fetch("/api/questions/subjects");
      const data = await res.json();
      if (data.success) {
        setSubjects(data.subjects);
      }
    } catch (err) {
      console.error("Error fetching subjects:", err);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: ""
      });
    }
  };

  const validateForm = () => {
    const errors = {};
    
    if (!formData.category.trim()) {
      errors.category = "Category is required";
    }
    
    if (!formData.subject.trim()) {
      errors.subject = "Subject is required";
    }
    
    if (!formData.question.trim()) {
      errors.question = "Question is required";
    }
    
    if (!formData.option1.trim()) {
      errors.option1 = "Option 1 is required";
    }
    
    if (!formData.option2.trim()) {
      errors.option2 = "Option 2 is required";
    }
    
    if (!formData.option3.trim()) {
      errors.option3 = "Option 3 is required";
    }
    
    if (!formData.option4.trim()) {
      errors.option4 = "Option 4 is required";
    }
    
    if (!formData.correctAnswer.trim()) {
      errors.correctAnswer = "Correct answer is required";
    } else {
      const options = [
        formData.option1,
        formData.option2,
        formData.option3,
        formData.option4
      ];
      if (!options.includes(formData.correctAnswer)) {
        errors.correctAnswer = "Correct answer must match one of the options";
      }
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error("Please fix the errors in the form");
      return;
    }
    
    const options = [
      formData.option1,
      formData.option2,
      formData.option3,
      formData.option4
    ];
    
    const questionData = {
      category: formData.category,
      subject: formData.subject,
      topic: formData.topic,
      difficulty: formData.difficulty,
      question: formData.question,
      options: options,
      correctAnswer: formData.correctAnswer
    };
    
    try {
      setIsSubmitting(true);
      let res;
      if (editingQuestion) {
        questionData._id = editingQuestion._id;
        res = await fetch("/api/admin/questions", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(questionData)
        });
      } else {
        res = await fetch("/api/admin/questions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(questionData)
        });
      }
      
      const data = await res.json();
      
      if (data.success) {
        toast.success(data.message || (editingQuestion ? "Question updated successfully!" : "Question created successfully!"));
        resetForm();
        fetchQuestions();
      } else {
        toast.error(data.error || "Failed to save question");
      }
    } catch (err) {
      toast.error(err.message || "An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (question) => {
    setEditingQuestion(question);
    setFormData({
      category: question.category,
      subject: question.subject,
      topic: question.topic || "",
      difficulty: question.difficulty,
      question: question.question,
      option1: question.options[0],
      option2: question.options[1],
      option3: question.options[2],
      option4: question.options[3],
      correctAnswer: question.correctAnswer
    });
    setFormErrors({});
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this question?")) {
      return;
    }
    
    try {
      const res = await fetch(`/api/admin/questions?id=${id}`, {
        method: "DELETE"
      });
      
      const data = await res.json();
      
      if (data.success) {
        toast.success(data.message);
        fetchQuestions();
      } else {
        toast.error(data.error);
      }
    } catch (err) {
      toast.error(err.message);
    }
  };

  const resetForm = () => {
    setFormData({
      category: "",
      subject: "",
      topic: "",
      difficulty: "medium",
      question: "",
      option1: "",
      option2: "",
      option3: "",
      option4: "",
      correctAnswer: ""
    });
    setFormErrors({});
    setEditingQuestion(null);
    setShowForm(false);
  };

  return (
    <AdminLayout user={user}>
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900">🔧 Questions Management</h1>
          <div className="flex flex-col sm:flex-row gap-2 w-full lg:w-auto">
            <Link href="/admin/analytics" className="px-4 py-2 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-all duration-200 shadow-lg text-center">
              📊 Analytics Dashboard
            </Link>
          </div>
        </div>

        <div className="mb-6">
          <button
            className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-4 rounded-xl font-bold text-lg hover:from-green-600 hover:to-green-700 transition-all duration-200 shadow-lg flex items-center justify-center gap-2 focus:outline-none focus:ring-4 focus:ring-green-300"
            onClick={() => {
              resetForm();
              setShowForm(true);
            }}
            aria-label="Add new question"
          >
            <Plus className="w-6 h-6" />
            Add New Question
          </button>
        </div>

        <AnimatePresence>
          {showForm && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
              onClick={resetForm}
              role="dialog"
              aria-modal="true"
              aria-labelledby="modal-title"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                transition={{ type: "spring", duration: 0.5 }}
                className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-4 flex justify-between items-center rounded-t-2xl z-10">
                  <h5 id="modal-title" className="text-xl font-bold">
                    {editingQuestion ? "✏️ Edit Question" : "➕ Add New Question"}
                  </h5>
                  <button
                    onClick={resetForm}
                    className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white"
                    aria-label="Close modal"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
                <div className="p-6">
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">
                          Category <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-4 transition-all duration-200 outline-none ${
                            formErrors.category
                              ? "border-red-300 focus:border-red-500 focus:ring-red-100"
                              : "border-gray-200 focus:border-blue-500 focus:ring-blue-100"
                          }`}
                          name="category"
                          value={formData.category}
                          onChange={handleInputChange}
                          placeholder="e.g., Intermediate"
                          aria-label="Category"
                          aria-required="true"
                          aria-invalid={!!formErrors.category}
                          aria-describedby={formErrors.category ? "category-error" : undefined}
                        />
                        {formErrors.category && (
                          <p id="category-error" className="text-red-500 text-xs mt-1" role="alert">{formErrors.category}</p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">
                          Subject <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-4 transition-all duration-200 outline-none ${
                            formErrors.subject
                              ? "border-red-300 focus:border-red-500 focus:ring-red-100"
                              : "border-gray-200 focus:border-blue-500 focus:ring-blue-100"
                          }`}
                          name="subject"
                          value={formData.subject}
                          onChange={handleInputChange}
                          placeholder="e.g., Mathematics"
                          aria-label="Subject"
                          aria-required="true"
                          aria-invalid={!!formErrors.subject}
                          aria-describedby={formErrors.subject ? "subject-error" : undefined}
                        />
                        {formErrors.subject && (
                          <p id="subject-error" className="text-red-500 text-xs mt-1" role="alert">{formErrors.subject}</p>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Topic</label>
                        <input
                          type="text"
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200 outline-none"
                          name="topic"
                          value={formData.topic}
                          onChange={handleInputChange}
                          placeholder="e.g., Algebra"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">
                          Difficulty <span className="text-red-500">*</span>
                        </label>
                        <select
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200 outline-none bg-white"
                          name="difficulty"
                          value={formData.difficulty}
                          onChange={handleInputChange}
                        >
                          <option value="easy">Easy</option>
                          <option value="medium">Medium</option>
                          <option value="hard">Hard</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">
                        Question <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-4 transition-all duration-200 outline-none ${
                          formErrors.question
                            ? "border-red-300 focus:border-red-500 focus:ring-red-100"
                            : "border-gray-200 focus:border-blue-500 focus:ring-blue-100"
                        }`}
                        name="question"
                        value={formData.question}
                        onChange={handleInputChange}
                        rows="3"
                        placeholder="Enter your question here..."
                      />
                      {formErrors.question && (
                        <p className="text-red-500 text-xs mt-1">{formErrors.question}</p>
                      )}
                    </div>

                    <div className="space-y-3">
                      <label className="block text-sm font-bold text-gray-700">
                        Options <span className="text-red-500">*</span>
                      </label>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {[1, 2, 3, 4].map((num) => (
                          <div key={num}>
                            <input
                              type="text"
                              className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-4 transition-all duration-200 outline-none ${
                                formErrors[`option${num}`]
                                  ? "border-red-300 focus:border-red-500 focus:ring-red-100"
                                  : "border-gray-200 focus:border-blue-500 focus:ring-blue-100"
                              }`}
                              name={`option${num}`}
                              value={formData[`option${num}`]}
                              onChange={handleInputChange}
                              placeholder={`Option ${num}`}
                            />
                            {formErrors[`option${num}`] && (
                              <p className="text-red-500 text-xs mt-1">{formErrors[`option${num}`]}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">
                        Correct Answer <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-4 transition-all duration-200 outline-none ${
                          formErrors.correctAnswer
                            ? "border-red-300 focus:border-red-500 focus:ring-red-100"
                            : "border-gray-200 focus:border-blue-500 focus:ring-blue-100"
                        }`}
                        name="correctAnswer"
                        value={formData.correctAnswer}
                        onChange={handleInputChange}
                        placeholder="Must match one of the options above"
                      />
                      {formErrors.correctAnswer && (
                        <p className="text-red-500 text-xs mt-1">{formErrors.correctAnswer}</p>
                      )}
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 pt-4">
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 focus:outline-none focus:ring-4 focus:ring-blue-300"
                        aria-label={editingQuestion ? "Update question" : "Add question"}
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          <>
                            {editingQuestion ? "💾 Update Question" : "➕ Add Question"}
                          </>
                        )}
                      </button>
                      <button
                        type="button"
                        className="px-6 py-3 bg-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-300 transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-gray-300"
                        onClick={resetForm}
                        disabled={isSubmitting}
                        aria-label="Cancel"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="bg-white rounded-2xl shadow-lg mb-6 overflow-hidden">
          <div className="bg-gradient-to-r from-gray-700 to-gray-800 text-white px-6 py-4">
            <h5 className="text-lg font-bold flex items-center gap-2">
              <Search className="w-5 h-5" />
              Search & Filter Questions
            </h5>
          </div>
          <div className="p-6 space-y-4">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200 outline-none"
                placeholder="Search question text..."
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                aria-label="Search questions"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Subject</label>
                <select
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200 outline-none bg-white"
                  value={filterSubject}
                  onChange={(e) => setFilterSubject(e.target.value)}
                  aria-label="Filter by subject"
                >
                  <option value="all">All Subjects</option>
                  {subjects.map((subj) => (
                    <option key={subj} value={subj}>
                      {subj}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Difficulty</label>
                <select
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200 outline-none bg-white"
                  value={filterDifficulty}
                  onChange={(e) => setFilterDifficulty(e.target.value)}
                  aria-label="Filter by difficulty"
                >
                  <option value="all">All Difficulties</option>
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>
            </div>
          </div>
        </div>

      {loading ? (
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="flex flex-col items-center justify-center py-16">
            <Loader2 className="w-12 h-12 text-blue-500 animate-spin mb-4" />
            <p className="text-gray-600 font-medium">Loading questions...</p>
          </div>
        </div>
      ) : error ? (
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="bg-red-50 border-2 border-red-200 text-red-800 rounded-xl p-6 m-6">
            <h4 className="font-bold mb-2">Error Loading Questions</h4>
            <p>{error}</p>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="bg-gradient-to-r from-gray-800 to-gray-900 text-white px-6 py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
            <h5 className="text-lg font-bold">📚 Questions Database</h5>
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-300">Total: {totalCount}</span>
              <span className="px-3 py-1 bg-white text-gray-800 rounded-full text-sm font-medium">
                Page {currentPage} / {totalPages}
              </span>
            </div>
          </div>
          {questions.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">📝</div>
              <p className="text-gray-500 text-lg font-medium mb-2">No questions found</p>
              <p className="text-gray-400 text-sm">Try adjusting your filters or add a new question</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b-2 border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Question</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Subject</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Difficulty</th>
                    <th className="px-6 py-4 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {questions.map((q) => (
                    <tr key={q._id} className="hover:bg-blue-50 transition-colors duration-200 group">
                      <td className="px-6 py-4">
                        <div className="max-w-md">
                          <p className="text-sm font-medium text-gray-900 line-clamp-2">
                            {q.question}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            <span className="font-semibold">Answer:</span> {q.correctAnswer}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-semibold">
                          {q.subject}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                            q.difficulty === "easy"
                              ? "bg-green-100 text-green-700"
                              : q.difficulty === "hard"
                              ? "bg-red-100 text-red-700"
                              : "bg-yellow-100 text-yellow-700"
                          }`}
                        >
                          {q.difficulty.charAt(0).toUpperCase() + q.difficulty.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-all duration-200 group-hover:scale-110 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            onClick={() => handleEdit(q)}
                            title="Edit Question"
                            aria-label={`Edit question: ${q.question}`}
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-all duration-200 group-hover:scale-110 focus:outline-none focus:ring-2 focus:ring-red-500"
                            onClick={() => handleDelete(q._id)}
                            title="Delete Question"
                            aria-label={`Delete question: ${q.question}`}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {totalPages > 1 && (
            <div className="px-6 py-4 bg-gradient-to-r from-gray-50 to-gray-100 border-t border-gray-200">
              <nav>
                <ul className="flex justify-center items-center gap-2 flex-wrap">
                  <li>
                    <button 
                      className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all duration-200 focus:outline-none focus:ring-4 ${
                        currentPage === 1 
                          ? 'bg-gray-200 text-gray-400 cursor-not-allowed focus:ring-gray-300' 
                          : 'bg-white border-2 border-gray-300 text-gray-700 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-600 focus:ring-blue-300'
                      }`}
                      onClick={() => setCurrentPage(currentPage - 1)}
                      disabled={currentPage === 1}
                      aria-label="Previous page"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      Previous
                    </button>
                  </li>
                  {[...Array(totalPages)].map((_, i) => {
                    const pageNum = i + 1;
                    if (
                      pageNum === 1 || 
                      pageNum === totalPages || 
                      (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)
                    ) {
                      return (
                        <li key={pageNum}>
                          <button 
                            className={`min-w-[40px] px-4 py-2 rounded-xl font-semibold transition-all duration-200 focus:outline-none focus:ring-4 ${
                              currentPage === pageNum 
                                ? 'bg-blue-600 text-white shadow-lg scale-110 focus:ring-blue-300' 
                                : 'bg-white border-2 border-gray-300 text-gray-700 hover:bg-gray-100 hover:border-gray-400 focus:ring-gray-300'
                            }`}
                            onClick={() => setCurrentPage(pageNum)}
                            aria-label={`Go to page ${pageNum}`}
                            aria-current={currentPage === pageNum ? "page" : undefined}
                          >
                            {pageNum}
                          </button>
                        </li>
                      );
                    } else if (pageNum === currentPage - 2 || pageNum === currentPage + 2) {
                      return <li key={pageNum} className="px-2 text-gray-400 font-bold">...</li>;
                    }
                    return null;
                  })}
                  <li>
                    <button 
                      className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all duration-200 focus:outline-none focus:ring-4 ${
                        currentPage === totalPages 
                          ? 'bg-gray-200 text-gray-400 cursor-not-allowed focus:ring-gray-300' 
                          : 'bg-white border-2 border-gray-300 text-gray-700 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-600 focus:ring-blue-300'
                      }`}
                      onClick={() => setCurrentPage(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      aria-label="Next page"
                    >
                      Next
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </li>
                </ul>
              </nav>
            </div>
          )}
        </div>
      )}
      </div>
    </AdminLayout>
  );
}
