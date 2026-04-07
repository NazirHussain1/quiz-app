"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

function SubjectSelectionContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const category = searchParams.get("category");
  const difficulty = searchParams.get("difficulty") || "medium";
  
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!category) {
      router.push("/");
      return;
    }

    async function fetchSubjects() {
      try {
        setLoading(true);
        const res = await fetch(`/api/questions/subjects?category=${encodeURIComponent(category)}`);
        
        if (!res.ok) {
          throw new Error("Failed to fetch subjects");
        }
        
        const response = await res.json();
        
        if (!response.success) {
          throw new Error(response.error?.message || "Failed to load subjects");
        }
        
        const data = response.data;
        
        if (!data.subjects || data.subjects.length === 0) {
          throw new Error("No subjects available for this category");
        }
        
        setSubjects(data.subjects);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchSubjects();
  }, [category, router]);

  const handleSubjectClick = (subject, isExamMode = false) => {
    const route = isExamMode ? '/exam' : '/quiz';
    router.push(`${route}?category=${encodeURIComponent(category)}&subject=${encodeURIComponent(subject)}&difficulty=${difficulty}`);
  };

  if (!category) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-6 md:mb-8">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-3">
            Select a Subject
          </h1>
          <div className="space-y-1">
            <p className="text-sm md:text-base text-gray-600">
              Category: <span className="font-semibold text-gray-800">{category}</span>
            </p>
            <p className="text-sm md:text-base text-gray-600">
              Difficulty: <span className="font-semibold text-gray-800 capitalize">{difficulty}</span>
            </p>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="p-4 md:p-6">
            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                <p className="mt-4 text-gray-600">Loading subjects...</p>
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6 mb-4">
                  <p className="text-red-700">{error}</p>
                </div>
                <Link href="/" className="inline-flex items-center gap-2 px-6 py-3 bg-blue-500 text-white rounded-xl font-semibold hover:bg-blue-600 transition-colors">
                  Back to Home
                </Link>
              </div>
            ) : (
              <div className="space-y-2">
                {subjects.map((subject, index) => (
                  <div key={index} className="flex flex-col sm:flex-row border-2 border-gray-100 rounded-xl overflow-hidden hover:border-blue-200 transition-colors">
                    <button
                      className="flex-1 px-4 py-4 md:py-5 text-left hover:bg-blue-50 transition-colors"
                      onClick={() => handleSubjectClick(subject, false)}
                    >
                      <span className="font-semibold text-gray-800 text-sm md:text-base">{subject}</span>
                      <span className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium ml-2">
                        Quiz Mode
                      </span>
                    </button>
                    <button
                      className="px-4 py-3 md:px-6 md:py-5 bg-yellow-400 hover:bg-yellow-500 transition-colors border-t-2 sm:border-t-0 sm:border-l-2 border-yellow-300"
                      onClick={() => handleSubjectClick(subject, true)}
                      title="Exam Mode: 30 questions, 30 minutes"
                    >
                      <span className="font-semibold text-gray-800 text-sm md:text-base">📝 Exam</span>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="text-center mt-6">
          <Link href="/" className="inline-flex items-center gap-2 px-6 py-3 bg-white text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors shadow-md">
            ← Back to Categories
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function SubjectSelectionPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-500"></div>
      </div>
    }>
      <SubjectSelectionContent />
    </Suspense>
  );
}
