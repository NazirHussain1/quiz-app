"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function MyQuizzesPage() {
  const router = useRouter();
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    checkAuthAndFetch();
  }, []);

  const checkAuthAndFetch = async () => {
    try {
      const authRes = await fetch("/api/auth/me");
      const authData = await authRes.json();
      
      if (!authData.success) {
        router.push("/login");
        return;
      }
      
      setUser(authData.user);
      fetchQuizzes();
    } catch (err) {
      router.push("/login");
    }
  };

  const fetchQuizzes = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/custom-quizzes");
      const data = await res.json();
      
      if (data.success) {
        setQuizzes(data.quizzes);
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError("Failed to load quizzes");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this quiz?")) {
      return;
    }
    
    try {
      const res = await fetch(`/api/custom-quizzes?id=${id}`, {
        method: "DELETE"
      });
      
      const data = await res.json();
      
      if (data.success) {
        setQuizzes(quizzes.filter(q => q._id !== id));
        alert("Quiz deleted successfully");
      } else {
        alert("Error: " + data.error);
      }
    } catch (err) {
      alert("Error deleting quiz");
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
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="display-6">📚 My Custom Quizzes</h1>
        <div className="d-flex gap-2">
          <Link href="/create-quiz" className="btn btn-success">
            ➕ Create New Quiz
          </Link>
          <Link href="/" className="btn btn-outline-secondary">
            ← Home
          </Link>
        </div>
      </div>

      {error && (
        <div className="alert alert-danger">{error}</div>
      )}

      {quizzes.length === 0 ? (
        <div className="card shadow text-center p-5">
          <h3 className="text-muted">No quizzes yet</h3>
          <p>Create your first custom quiz to get started!</p>
          <Link href="/create-quiz" className="btn btn-primary mt-3">
            Create Quiz
          </Link>
        </div>
      ) : (
        <div className="row">
          {quizzes.map((quiz) => (
            <div key={quiz._id} className="col-md-6 col-lg-4 mb-4">
              <div className="card h-100 shadow-sm">
                <div className="card-body">
                  <h5 className="card-title">{quiz.title}</h5>
                  {quiz.description && (
                    <p className="card-text text-muted small">{quiz.description}</p>
                  )}
                  
                  <div className="mb-3">
                    <span className="badge bg-info me-2">{quiz.subject}</span>
                    <span className="badge bg-warning text-dark me-2">{quiz.difficulty}</span>
                    <span className="badge bg-secondary">{quiz.questions.length} Q's</span>
                    {quiz.isPublic && (
                      <span className="badge bg-success ms-2">Public</span>
                    )}
                  </div>
                  
                  <div className="small text-muted mb-3">
                    Created: {new Date(quiz.createdAt).toLocaleDateString()}
                  </div>
                  
                  <div className="d-grid gap-2">
                    <Link 
                      href={`/custom-quiz/${quiz._id}`}
                      className="btn btn-primary btn-sm"
                    >
                      Take Quiz
                    </Link>
                    <button
                      className="btn btn-outline-danger btn-sm"
                      onClick={() => handleDelete(quiz._id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
