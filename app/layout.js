"use client";

import "bootstrap/dist/css/bootstrap.min.css";
import "./globals.css";
import { useEffect, useState } from "react";

export default function RootLayout({ children }) {
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    // Load theme preference from localStorage
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "dark") {
      setDarkMode(true);
      document.documentElement.setAttribute("data-bs-theme", "dark");
    } else {
      setDarkMode(false);
      document.documentElement.setAttribute("data-bs-theme", "light");
    }
  }, []);

  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    
    if (newMode) {
      document.documentElement.setAttribute("data-bs-theme", "dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.setAttribute("data-bs-theme", "light");
      localStorage.setItem("theme", "light");
    }
  };

  return (
    <html lang="en" data-bs-theme={darkMode ? "dark" : "light"}>
      <body>
        {/* Dark Mode Toggle Button */}
        <button
          onClick={toggleDarkMode}
          className="btn btn-outline-secondary position-fixed top-0 end-0 m-3"
          style={{ zIndex: 1050 }}
          aria-label="Toggle dark mode"
          title={darkMode ? "Switch to light mode" : "Switch to dark mode"}
        >
          {darkMode ? "☀️" : "🌙"}
        </button>
        
        {children}
      </body>
    </html>
  );
}
