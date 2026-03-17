"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "../contexts/AuthContext";

export default function Navbar({ darkMode, toggleDarkMode }) {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  // Don't show navbar on login page
  if (pathname === "/login") {
    return null;
  }

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-primary shadow-sm">
      <div className="container-fluid">
        <Link href="/" className="navbar-brand fw-bold">
          🎯 Quiz App
        </Link>
        
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav me-auto">
            <li className="nav-item">
              <Link 
                href="/" 
                className={`nav-link ${pathname === "/" ? "active" : ""}`}
              >
                Home
              </Link>
            </li>
            <li className="nav-item">
              <Link 
                href="/leaderboard" 
                className={`nav-link ${pathname === "/leaderboard" ? "active" : ""}`}
              >
                🏆 Leaderboard
              </Link>
            </li>
            {user && (
              <>
                <li className="nav-item">
                  <Link 
                    href="/analytics" 
                    className={`nav-link ${pathname === "/analytics" ? "active" : ""}`}
                  >
                    📊 Analytics
                  </Link>
                </li>
                <li className="nav-item">
                  <Link 
                    href="/my-quizzes" 
                    className={`nav-link ${pathname === "/my-quizzes" ? "active" : ""}`}
                  >
                    📚 My Quizzes
                  </Link>
                </li>
                <li className="nav-item">
                  <Link 
                    href="/create-quiz" 
                    className={`nav-link ${pathname === "/create-quiz" ? "active" : ""}`}
                  >
                    ➕ Create Quiz
                  </Link>
                </li>
                <li className="nav-item">
                  <Link 
                    href="/admin" 
                    className={`nav-link ${pathname === "/admin" ? "active" : ""}`}
                  >
                    🔧 Admin
                  </Link>
                </li>
              </>
            )}
          </ul>
          
          <div className="d-flex align-items-center gap-2">
            <button
              onClick={toggleDarkMode}
              className="btn btn-outline-light btn-sm"
              title={darkMode ? "Switch to light mode" : "Switch to dark mode"}
            >
              {darkMode ? "☀️" : "🌙"}
            </button>
            
            {user ? (
              <div className="dropdown">
                <button
                  className="btn btn-outline-light dropdown-toggle"
                  type="button"
                  data-bs-toggle="dropdown"
                >
                  👤 {user.userName}
                </button>
                <ul className="dropdown-menu dropdown-menu-end">
                  <li>
                    <Link href="/analytics" className="dropdown-item">
                      📊 My Analytics
                    </Link>
                  </li>
                  <li>
                    <Link href="/my-quizzes" className="dropdown-item">
                      📚 My Quizzes
                    </Link>
                  </li>
                  <li><hr className="dropdown-divider" /></li>
                  <li>
                    <button onClick={logout} className="dropdown-item text-danger">
                      🚪 Logout
                    </button>
                  </li>
                </ul>
              </div>
            ) : (
              <Link href="/login" className="btn btn-light">
                🔐 Login
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
