"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { login, signup, clearError } from "../store/slices/authSlice";
import Link from "next/link";
import { toast } from "react-toastify";

export default function LoginPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { loading } = useSelector((state) => state.auth);
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    userName: ""
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    dispatch(clearError());

    try {
      if (isLogin) {
        const result = await dispatch(login({ 
          email: formData.email, 
          password: formData.password 
        })).unwrap();
        
        if (result) {
          toast.success("Login successful! Welcome back.");
          router.push("/");
        }
      } else {
        const result = await dispatch(signup(formData)).unwrap();
        
        if (result.success) {
          toast.success("Account created successfully! Please login.");
          setIsLogin(true);
          setFormData({ email: formData.email, password: "", userName: "" });
        }
      }
    } catch (err) {
      toast.error(err || "An error occurred");
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-6 col-lg-5">
            <div className="card shadow">
              <div className="card-body p-5">
                <div className="text-center mb-4">
                  <h1 className="h3 mb-3">
                    {isLogin ? "Welcome Back! 👋" : "Create Account 🎓"}
                  </h1>
                  <p className="text-muted">
                    {isLogin 
                      ? "Login to continue your quiz journey" 
                      : "Sign up to start taking quizzes"}
                  </p>
                </div>

                <form onSubmit={handleSubmit}>
                  {!isLogin && (
                    <div className="mb-3">
                      <label htmlFor="userName" className="form-label">
                        Username
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        id="userName"
                        name="userName"
                        value={formData.userName}
                        onChange={handleChange}
                        required={!isLogin}
                        placeholder="Enter your username"
                      />
                    </div>
                  )}

                  <div className="mb-3">
                    <label htmlFor="email" className="form-label">
                      Email Address
                    </label>
                    <input
                      type="email"
                      className="form-control"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      placeholder="Enter your email"
                    />
                  </div>

                  <div className="mb-3">
                    <label htmlFor="password" className="form-label">
                      Password
                    </label>
                    <input
                      type="password"
                      className="form-control"
                      id="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      required
                      minLength={6}
                      placeholder="Enter your password"
                    />
                    {!isLogin && (
                      <small className="text-muted">
                        Minimum 6 characters
                      </small>
                    )}
                  </div>

                  <button
                    type="submit"
                    className="btn btn-primary w-100 mb-3"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2"></span>
                        {isLogin ? "Logging in..." : "Creating account..."}
                      </>
                    ) : (
                      <>{isLogin ? "Login" : "Sign Up"}</>
                    )}
                  </button>
                </form>

                <div className="text-center">
                  <button
                    className="btn btn-link text-decoration-none"
                    onClick={() => {
                      setIsLogin(!isLogin);
                      dispatch(clearError());
                      setFormData({ email: "", password: "", userName: "" });
                    }}
                  >
                    {isLogin 
                      ? "Don't have an account? Sign up" 
                      : "Already have an account? Login"}
                  </button>
                </div>

                <hr className="my-4" />

                <div className="text-center">
                  <Link href="/" className="btn btn-outline-secondary">
                    ← Back to Home
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
