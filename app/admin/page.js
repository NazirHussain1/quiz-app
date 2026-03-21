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
      <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  // Show access denied if not admin
  if (!user || user.role !== "admin") {
    return (
      <div className="container mt-5">
        <div className="alert alert-danger" role="alert">
          <h4 className="alert-heading">Access Denied</h4>
          <p>You do not have permission to access this page.</p>
          <hr />
          <Link href="/" className="btn btn-primary">
            Go to Home
          </Link>
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
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="display-5">🔧 Admin Panel</h1>
        <div className="d-flex gap-2">
          <Link href="/admin/analytics" className="btn btn-primary">
            📊 Analytics Dashboard
          </Link>
          <Link href="/" className="btn btn-outline-secondary">
            ← Back to Home
          </Link>
        </div>
      </div>

      <div className="row mb-4">
        <div className="col-12">
          <button
            className="btn btn-success btn-lg w-100"
            onClick={() => {
              resetForm();
              setShowForm(!showForm);
            }}
          >
            {showForm ? "✖ Cancel" : "+ Add New Question"}
          </button>
        </div>
      </div>

      {showForm && (
        <div className="card shadow mb-4">
          <div className="card-header bg-primary text-white">
            <h5 className="mb-0">
              {editingQuestion ? "✏️ Edit Question" : "➕ Add New Question"}
            </h5>
          </div>
          <div className="card-body">
            <form onSubmit={handleSubmit}>
              <div className="row">
                <div className="col-md-4 mb-3">
                  <label className="form-label fw-bold">Category *</label>
                  <input
                    type="text"
                    className="form-control"
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    required
                    placeholder="e.g., Intermediate"
                  />
                </div>
                <div className="col-md-4 mb-3">
                  <label className="form-label fw-bold">Subject *</label>
                  <input
                    type="text"
                    className="form-control"
                    name="subject"
                    value={formData.subject}
                    onChange={handleInputChange}
                    required
                    placeholder="e.g., Mathematics"
                  />
                </div>
                <div className="col-md-4 mb-3">
                  <label className="form-label fw-bold">Topic</label>
                  <input
                    type="text"
                    className="form-control"
                    name="topic"
                    value={formData.topic}
                    onChange={handleInputChange}
                    placeholder="e.g., Algebra"
                  />
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label fw-bold">Difficulty *</label>
                <select
                  className="form-select"
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

              <div className="mb-3">
                <label className="form-label fw-bold">Question *</label>
                <textarea
                  className="form-control"
                  name="question"
                  value={formData.question}
                  onChange={handleInputChange}
                  required
                  rows="3"
                  placeholder="Enter your question here..."
                />
              </div>

              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="form-label fw-bold">Option 1 *</label>
                  <input
                    type="text"
                    className="form-control"
                    name="option1"
                    value={formData.option1}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="col-md-6 mb-3">
                  <label className="form-label fw-bold">Option 2 *</label>
                  <input
                    type="text"
                    className="form-control"
                    name="option2"
                    value={formData.option2}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="col-md-6 mb-3">
                  <label className="form-label fw-bold">Option 3 *</label>
                  <input
                    type="text"
                    className="form-control"
                    name="option3"
                    value={formData.option3}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="col-md-6 mb-3">
                  <label className="form-label fw-bold">Option 4 *</label>
                  <input
                    type="text"
                    className="form-control"
                    name="option4"
                    value={formData.option4}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label fw-bold">Correct Answer *</label>
                <input
                  type="text"
                  className="form-control"
                  name="correctAnswer"
                  value={formData.correctAnswer}
                  onChange={handleInputChange}
                  required
                  placeholder="Must match one of the options above"
                />
              </div>

              <div className="d-flex gap-2">
                <button type="submit" className="btn btn-primary">
                  {editingQuestion ? "💾 Update Question" : "➕ Add Question"}
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={resetForm}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="card shadow mb-4">
        <div className="card-header bg-secondary text-white">
          <h5 className="mb-0">🔍 Filter Questions</h5>
        </div>
        <div className="card-body">
          <div className="row mb-3">
            <div className="col-12">
              <label className="form-label fw-bold">Search by Keyword</label>
              <input
                type="text"
                className="form-control"
                placeholder="Search question text..."
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
              />
            </div>
          </div>
          <div className="row">
            <div className="col-md-4 mb-3">
              <label className="form-label fw-bold">Category</label>
              <select
                className="form-select"
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
            <div className="col-md-4 mb-3">
              <label className="form-label fw-bold">Subject</label>
              <select
                className="form-select"
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
            <div className="col-md-4 mb-3">
              <label className="form-label fw-bold">Difficulty</label>
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
        </div>
      </div>

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      ) : error ? (
        <div className="alert alert-danger">{error}</div>
      ) : (
        <div className="card shadow">
          <div className="card-header bg-dark text-white d-flex justify-content-between align-items-center">
            <h5 className="mb-0">📚 Questions ({totalCount})</h5>
            <span className="badge bg-light text-dark">
              Page {currentPage} of {totalPages}
            </span>
          </div>
          <div className="card-body p-0">
            {questions.length === 0 ? (
              <div className="text-center py-5">
                <p className="text-muted">No questions found. Add your first question!</p>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table table-hover mb-0">
                  <thead className="table-light">
                    <tr>
                      <th style={{ width: "40%" }}>Question</th>
                      <th>Category</th>
                      <th>Subject</th>
                      <th>Difficulty</th>
                      <th style={{ width: "150px" }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {questions.map((q) => (
                      <tr key={q._id}>
                        <td>
                          <div className="text-truncate" style={{ maxWidth: "400px" }}>
                            {q.question}
                          </div>
                          <small className="text-muted">
                            Answer: {q.correctAnswer}
                          </small>
                        </td>
                        <td>
                          <span className="badge bg-info text-dark">
                            {q.category}
                          </span>
                        </td>
                        <td>
                          <span className="badge bg-secondary">
                            {q.subject}
                          </span>
                        </td>
                        <td>
                          <span
                            className={`badge ${
                              q.difficulty === "easy"
                                ? "bg-success"
                                : q.difficulty === "hard"
                                ? "bg-danger"
                                : "bg-warning text-dark"
                            }`}
                          >
                            {q.difficulty}
                          </span>
                        </td>
                        <td>
                          <div className="btn-group btn-group-sm">
                            <button
                              className="btn btn-outline-primary"
                              onClick={() => handleEdit(q)}
                              title="Edit"
                            >
                              ✏️
                            </button>
                            <button
                              className="btn btn-outline-danger"
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
          </div>
          {totalPages > 1 && (
            <div className="card-footer">
              <nav>
                <ul className="pagination justify-content-center mb-0">
                  <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                    <button 
                      className="page-link" 
                      onClick={() => setCurrentPage(currentPage - 1)}
                      disabled={currentPage === 1}
                    >
                      Previous
                    </button>
                  </li>
                  {[...Array(totalPages)].map((_, i) => {
                    const pageNum = i + 1;
                    // Show first, last, current, and adjacent pages
                    if (
                      pageNum === 1 || 
                      pageNum === totalPages || 
                      (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)
                    ) {
                      return (
                        <li key={pageNum} className={`page-item ${currentPage === pageNum ? 'active' : ''}`}>
                          <button 
                            className="page-link" 
                            onClick={() => setCurrentPage(pageNum)}
                          >
                            {pageNum}
                          </button>
                        </li>
                      );
                    } else if (pageNum === currentPage - 2 || pageNum === currentPage + 2) {
                      return <li key={pageNum} className="page-item disabled"><span className="page-link">...</span></li>;
                    }
                    return null;
                  })}
                  <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                    <button 
                      className="page-link" 
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
