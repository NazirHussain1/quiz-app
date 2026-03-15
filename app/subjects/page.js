"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

export default function SubjectSelectionPage() {
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
        
        const data = await res.json();
        
        if (!data.success) {
          throw new Error(data.error || "Failed to load subjects");
        }
        
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

  const handleSubjectClick = (subject) => {
    router.push(`/quiz?category=${encodeURIComponent(category)}&subject=${encodeURIComponent(subject)}&difficulty=${difficulty}`);
  };

  if (!category) {
    return null;
  }

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-md-8 col-lg-6">
          <div className="text-center mb-4">
            <h1 className="mb-3">Select a Subject</h1>
            <p className="text-muted">
              Category: <span className="fw-bold">{category}</span>
            </p>
            <p className="text-muted">
              Difficulty: <span className="fw-bold text-capitalize">{difficulty}</span>
            </p>
          </div>

          <div className="card shadow">
            <div className="card-body p-4">
              {loading ? (
                <div className="text-center py-5">
                  <div className="spinner-border text-success" role="status">
                    <span className="visually-hidden">Loading subjects...</span>
                  </div>
                  <p className="mt-3 text-muted">Loading subjects...</p>
                </div>
              ) : error ? (
                <div className="text-center py-5">
                  <div className="alert alert-danger" role="alert">
                    {error}
                  </div>
                  <Link href="/" className="btn btn-primary">
                    Back to Home
                  </Link>
                </div>
              ) : (
                <div className="list-group">
                  {subjects.map((subject, index) => (
                    <button
                      key={index}
                      className="list-group-item list-group-item-action d-flex justify-content-between align-items-center py-3"
                      onClick={() => handleSubjectClick(subject)}
                      style={{ cursor: "pointer" }}
                    >
                      <span className="fw-semibold">{subject}</span>
                      <span className="badge bg-success rounded-pill">Start →</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="text-center mt-4">
            <Link href="/" className="btn btn-outline-secondary">
              ← Back to Categories
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
