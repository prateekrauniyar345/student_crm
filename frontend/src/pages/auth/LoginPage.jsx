import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, Lock, ArrowRight, Loader } from "lucide-react";
import AuthService from "../../services/AuthService";
import "./LoginPage.css";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const navigate = useNavigate();

  const handleMicrosoftLogin = async () => {
    setIsLoading(true);
    setError("");
    try {
      await AuthService.signInWithMicrosoft();
    } catch (err) {
      setError("Failed to sign in. Please try again.");
      setIsLoading(false);
    }
  };

  const handleEmailSubmit = (e) => {
    e.preventDefault();
    setError("");
    
    if (!email || !password) {
      setError("Please enter both email and password");
      return;
    }

    setError("Email authentication coming soon");
  };

  return (
    <div className="login-container">
      {/* Left Side - Branding */}
      <div className="login-branding">
        <div className="branding-content">
          <div className="branding-logo">
            <div className="logo-icon">📊</div>
            <span className="logo-text">StudentCRM</span>
          </div>

          <div className="branding-text">
            <h1>Intelligent Student Data Management</h1>
            <p>
              Unlock deep insights with AI-powered agents. Make data-driven 
              decisions with visualizations, reports, and collaborative tools.
            </p>
          </div>

          <div className="branding-features">
            <div className="feature">
              <span className="feature-dot">✓</span>
              <span>AI-powered insights</span>
            </div>
            <div className="feature">
              <span className="feature-dot">✓</span>
              <span>Interactive dashboards</span>
            </div>
            <div className="feature">
              <span className="feature-dot">✓</span>
              <span>Real-time collaboration</span>
            </div>
            <div className="feature">
              <span className="feature-dot">✓</span>
              <span>Enterprise security</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Auth Form */}
      <div className="login-form-container">
        <div className="form-card">
          {/* Header */}
          <div className="form-header">
            <h2>{isSignUp ? "Create Account" : "Welcome Back"}</h2>
            <p>
              {isSignUp
                ? "Join thousands of institutions using intelligent analytics"
                : "Sign in to your account to continue"}
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="error-banner">
              <span>⚠️</span>
              <span>{error}</span>
            </div>
          )}

          {/* Microsoft Sign In */}
          <button
            className="btn-microsoft"
            onClick={handleMicrosoftLogin}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader size={18} className="spin" />
                <span>Redirecting...</span>
              </>
            ) : (
              <>
                <span className="microsoft-icon">🔷</span>
                <span>Continue with Microsoft</span>
              </>
            )}
          </button>

          {/* Divider */}
          <div className="form-divider">
            <span>or</span>
          </div>

          {/* Email Form */}
          <form onSubmit={handleEmailSubmit} className="email-form">
            {/* Email Field */}
            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <div className="input-wrapper">
                <Mail size={18} className="input-icon" />
                <input
                  id="email"
                  type="email"
                  placeholder="you@institution.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <div className="input-wrapper">
                <Lock size={18} className="input-icon" />
                <input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Forgot Password Link */}
            {!isSignUp && (
              <a href="#forgot" className="forgot-password">
                Forgot password?
              </a>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              className="btn-submit"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader size={18} className="spin" />
                  <span>Signing in...</span>
                </>
              ) : (
                <>
                  <span>{isSignUp ? "Create Account" : "Sign In"}</span>
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          {/* Toggle Sign Up / Sign In */}
          <div className="form-footer">
            <p>
              {isSignUp ? "Already have an account?" : "Don't have an account?"}
              <button
                type="button"
                className="toggle-btn"
                onClick={() => {
                  setIsSignUp(!isSignUp);
                  setError("");
                }}
              >
                {isSignUp ? "Sign In" : "Sign Up"}
              </button>
            </p>
          </div>

          {/* Links */}
          <div className="form-links">
            <a href="#terms">Terms of Service</a>
            <span>•</span>
            <a href="#privacy">Privacy Policy</a>
            <span>•</span>
            <a href="#contact">Contact Support</a>
          </div>
        </div>

        {/* Back to Landing */}
        <button
          className="btn-back-landing"
          onClick={() => navigate("/")}
        >
          ← Back to Landing
        </button>
      </div>
    </div>
  );
}
