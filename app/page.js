
export default function HomePage() {
  return (
    <div className="d-flex flex-column justify-content-center align-items-center vh-100 text-center">
      
      <h1 className="mb-3">Welcome to Quiz App 🎯</h1>
      <p className="mb-4 fs-5">Test your knowledge with fun and challenging questions!</p>

      <a 
        href="/quiz"
        className="btn btn-success btn-lg"
      >
        Start Quiz
      </a>
      
    </div>
  );
}
