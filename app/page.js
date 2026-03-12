import Link from "next/link";

export default function HomePage() {
  return (
    <div className="d-flex flex-column justify-content-center align-items-center vh-100 text-center">
      <h1 className="mb-3">Welcome to Quiz App 🎯</h1>
      <p className="mb-4 fs-5">Test your knowledge with fun and challenging questions!</p>

      <Link 
        href="/quiz"
        className="btn btn-success btn-lg"
        aria-label="Start the quiz"
      >
        Start Quiz
      </Link>
      
      <div className="mt-5 text-muted">
        <small>Powered by Open Trivia Database</small>
      </div>
    </div>
  );
}
