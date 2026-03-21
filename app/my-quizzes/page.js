"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "react-toastify";

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
        toast.success("Quiz deleted successfully");
      } else {
        toast.error(data.error);
      }
    } catch (err) {
      toast.error("Error deleting quiz");
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
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900">📚 My Custom Quizzes</h1>
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <Link href="/create-quiz" className="px-4 py-2 bg-green-500 text-white rounded-xl font-semibold hover:bg-green-600 transition-all duration-200 shadow-lg text-center">
              ➕ Create New Quiz
            </Link>
            <Link href="/" className="px-4 py-2 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-100 transition-all duration-200 text-center">
              ← Home
            </Link>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border-2 border-red-200 text-red-800 rounded-xl p-4 mb-6">{error}</div>
        )}

        {quizzes.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-xl text-center p-8 md:p-12">
            <h3 className="text-2xl font-bold text-gray-400 mb-2">No quizzes yet</h3>
            <p className="text-gray-600 mb-6">Create your first custom quiz to get started!</p>
            <Link href="/create-quiz" className="inline-block px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-semibold hover:from-blue-600 hover:to-purple-700 transition-all duration-200 shadow-lg">
              Create Quiz
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {quizzes.map((quiz) => (
              <div key={quiz._id} className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200 flex flex-col">
                <div className="p-6 flex-1 flex flex-col">
                  <h5 className="text-xl font-bold text-gray-900 mb-2">{quiz.title}</h5>
                  {quiz.description && (
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">{quiz.description}</p>
                  )}
                  
                  <div className="flex flex-wrap gap-2 mb-4">
                    <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">{quiz.subject}</span>
                    <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-medium">{quiz.difficulty}</span>
                    <span className="px-3 py-1 bg-gray-200 text-gray-700 rounded-full text-xs font-medium">{quiz.questions.length} Q's</span>
                    {quiz.isPublic && (
                      <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">Public</span>
                    )}
                  </div>
                  
                  <div className="text-sm text-gray-500 mb-4">
                    Created: {new Date(quiz.createdAt).toLocaleDateString()}
                  </div>
                  
                  <div className="space-y-2 mt-auto">
                    <Link 
                      href={`/custom-quiz/${quiz._id}`}
                      className="block w-full text-center px-4 py-2 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-all duration-200"
                    >
                      Take Quiz
                    </Link>
                    <button
                      className="w-full px-4 py-2 border-2 border-red-300 text-red-600 rounded-xl font-semibold hover:bg-red-50 transition-all duration-200"
                      onClick={() => handleDelete(quiz._id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
