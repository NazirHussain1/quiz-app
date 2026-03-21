"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";

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
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const options = [
      formData.option1,
      formData.option2,
      formData.option3,
      formData.option4
    ];
    
    if (options.some(opt => !opt.trim())) {
      toast.error("All 4 options are required!");
      return;
    }
    
    if (!options.includes(formData.correctAnswer)) {
      toast.error("Correct answer must match one of the options!");
      return;
    }
    
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
        toast.success(data.message);
        resetForm();
        fetchQuestions();
      } else {
        toast.error(data.error);
      }
    } catch (err) {
      toast.error(err.message);
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
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
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
    setEditingQuestion(null);
    setShowForm(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900">🔧 Admin Panel</h1>
          <div className="flex flex-col sm:flex-row gap-2 w-full lg:w-auto">
            <Link href="/admin/analytics" className="px-4 py-2 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-all duration-200 shadow-lg text-center">
              📊 Analytics Dashboard
            </Link>
            <Link href="/" className="px-4 py-2 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-100 transition-all duration-200 text-center">
              ← Back to Home
            </Link>
          </div>
        </div>

        <div className="mb-6">
          <button
            className="w-full bg-green-500 text-white py-4 rounded-xl font-bold text-lg hover:bg-green-600 transition-all duration-200 shadow-lg"
            onClick={() => {
              resetForm();
              setShowForm(!showForm);
            }}
          >
            {showForm ? "✖ Cancel" : "+ Add New Question"}
          </button>
        </div>

        {showForm && (
          <div className="bg-white rounded-2xl shadow-xl mb-6 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-4">
              <h5 className="text-xl font-bold">
                {editingQuestion ? "✏️ Edit Question" : "➕ Add New Question"}
              </h5>
            </div>
            <div className="p-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Category *</label>
                    <input
                      type="text"
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200 outline-none"
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      required
                      placeholder="e.g., Intermediate"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Subject *</label>
                    <input
                      type="text"
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200 outline-none"
                      name="subject"
                      value={formData.subject}
                      onChange={handleInputChange}
                      required
                      placeholder="e.g., Mathematics"
                    />
                  </div>
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
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Difficulty *</label>
                  <select
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200 outline-none"
                    name="difficulty"
                    value={formData.difficulty}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Question *</label>
                  <textarea
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200 outline-none"
                    name="question"
                    value={formData.question}
                    onChange={handleInputChange}
                    required
                    rows="3"
                    placeholder="Enter your question here..."
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Option 1 *</label>
                    <input
                      type="text"
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200 outline-none"
                      name="option1"
                      value={formData.option1}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Option 2 *</label>
                    <input
                      type="text"
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200 outline-none"
                      name="option2"
                      value={formData.option2}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Option 3 *</label>
                    <input
                      type="text"
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200 outline-none"
                      name="option3"
                      value={formData.option3}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Option 4 *</label>
                    <input
                      type="text"
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200 outline-none"
                      name="option4"
                      value={formData.option4}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Correct Answer *</label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200 outline-none"
                    name="correctAnswer"
                    value={formData.correctAnswer}
                    onChange={handleInputChange}
                    required
                    placeholder="Must match one of the options above"
                  />
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <button type="submit" className="px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-all duration-200 shadow-lg">
                    {editingQuestion ? "💾 Update Question" : "➕ Add Question"}
                  </button>
                  <button
                    type="button"
                    className="px-6 py-3 bg-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-300 transition-all duration-200"
                    onClick={resetForm}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-lg mb-6 overflow-hidden">
          <div className="bg-gray-700 text-white px-6 py-4">
            <h5 className="text-lg font-bold">🔍 Filter Questions</h5>
          </div>
          <div className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Search by Keyword</label>
              <input
                type="text"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200 outline-none"
                placeholder="Search question text..."
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Category</label>
                <select
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200 outline-none"
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                >
                  <option value="all">All Categories</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Subject</label>
                <select
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200 outline-none"
                  value={filterSubject}
                  onChange={(e) => setFilterSubject(e.target.value)}
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
                <label className="block text-sm font-bold text-gray-700 mb-2">Difficulty</label>
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
          </div>
        </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-500 mx-auto"></div>
        </div>
      ) : error ? (
        <div className="bg-red-50 border-2 border-red-200 text-red-800 rounded-xl p-4">{error}</div>
      ) : (
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="bg-gray-800 text-white px-6 py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
            <h5 className="text-lg font-bold">📚 Questions ({totalCount})</h5>
            <span className="px-3 py-1 bg-white text-gray-800 rounded-full text-sm font-medium">
              Page {currentPage} of {totalPages}
            </span>
          </div>
          {questions.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No questions found. Add your first question!</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-bold text-gray-700" style={{ width: "40%" }}>Question</th>
                    <th className="px-4 py-3 text-left text-sm font-bold text-gray-700">Category</th>
                    <th className="px-4 py-3 text-left text-sm font-bold text-gray-700">Subject</th>
                    <th className="px-4 py-3 text-left text-sm font-bold text-gray-700">Difficulty</th>
                    <th className="px-4 py-3 text-left text-sm font-bold text-gray-700" style={{ width: "150px" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {questions.map((q) => (
                    <tr key={q._id} className="border-b border-gray-200 hover:bg-gray-50 transition-colors duration-150">
                      <td className="px-4 py-3">
                        <div className="truncate max-w-md">
                          {q.question}
                        </div>
                        <small className="text-gray-500">
                          Answer: {q.correctAnswer}
                        </small>
                      </td>
                      <td className="px-4 py-3">
                        <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                          {q.category}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="px-3 py-1 bg-gray-200 text-gray-700 rounded-full text-xs font-medium">
                          {q.subject}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            q.difficulty === "easy"
                              ? "bg-green-100 text-green-700"
                              : q.difficulty === "hard"
                              ? "bg-red-100 text-red-700"
                              : "bg-yellow-100 text-yellow-700"
                          }`}
                        >
                          {q.difficulty}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <button
                            className="px-3 py-1 border-2 border-blue-300 text-blue-600 rounded-lg hover:bg-blue-50 transition-all duration-200"
                            onClick={() => handleEdit(q)}
                            title="Edit"
                          >
                            ✏️
                          </button>
                          <button
                            className="px-3 py-1 border-2 border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-all duration-200"
                            onClick={() => handleDelete(q._id)}
                            title="Delete"
                          >
                            🗑️
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
            <div className="px-6 py-4 bg-gray-50">
              <nav>
                <ul className="flex justify-center items-center gap-2 flex-wrap">
                  <li>
                    <button 
                      className={`px-4 py-2 rounded-xl font-medium transition-all duration-200 ${currentPage === 1 ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-white border-2 border-gray-300 text-gray-700 hover:bg-gray-100'}`}
                      onClick={() => setCurrentPage(currentPage - 1)}
                      disabled={currentPage === 1}
                    >
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
                            className={`px-4 py-2 rounded-xl font-medium transition-all duration-200 ${currentPage === pageNum ? 'bg-blue-600 text-white shadow-lg' : 'bg-white border-2 border-gray-300 text-gray-700 hover:bg-gray-100'}`}
                            onClick={() => setCurrentPage(pageNum)}
                          >
                            {pageNum}
                          </button>
                        </li>
                      );
                    } else if (pageNum === currentPage - 2 || pageNum === currentPage + 2) {
                      return <li key={pageNum} className="px-2 text-gray-400">...</li>;
                    }
                    return null;
                  })}
                  <li>
                    <button 
                      className={`px-4 py-2 rounded-xl font-medium transition-all duration-200 ${currentPage === totalPages ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-white border-2 border-gray-300 text-gray-700 hover:bg-gray-100'}`}
                      onClick={() => setCurrentPage(currentPage + 1)}
                      disabled={currentPage === totalPages}
                    >
                      Next
                    </button>
                  </li>
                </ul>
              </nav>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
