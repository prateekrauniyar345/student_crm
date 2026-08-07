import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, Lock, ArrowRight, Loader, ShieldCheck, CheckCircle2, ArrowLeft, AlertTriangle } from "lucide-react";
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
      setError("Failed to authenticate via Microsoft SSO. Please try again.");
      setIsLoading(false);
    }
  };

  const handleEmailSubmit = (e) => {
    e.preventDefault();
    setError("");
    
    if (!email || !password) {
      setError("Please enter both an enterprise email and password.");
      return;
    }

    setError("Password authentication is restricted to registered advising staff. Please use Microsoft SSO.");
  };

  return (
    <div className="login-container">
      {/* Top Navbar / Back Link */}
      <div className="login-nav">
        <div className="login-nav-content">
          <button className="btn-back-landing" onClick={() => navigate("/")}>
            <ArrowLeft size={16} />
            <span>Return to Landing Page</span>
          </button>
        </div>
      </div>

      <main className="login-main">
        {/* Left Side - Institutional Branding & System Meta */}
        <div className="login-branding">
          <div className="branding-badge">
            <ShieldCheck size={16} />
            <span>Columbia GS Standard • Secure Portal</span>
          </div>

          <h1 className="branding-title">
            Intelligent Student CRM & Enrollment Analytics
          </h1>

          <p className="branding-subtitle">
            Secure workspace for non-traditional student tracking, admissions yield calculations, and advising call management.
          </p>

          <div className="branding-key-points">
            <div className="branding-point">
              <CheckCircle2 size={16} className="point-icon" />
              <div>
                <strong>Single Sign-On Integration</strong>
                <span>Enterprise Microsoft OAuth 2.0 & Supabase Auth</span>
              </div>
            </div>
            <div className="branding-point">
              <CheckCircle2 size={16} className="point-icon" />
              <div>
                <strong>Role-Based Access Control</strong>
                <span>PostgreSQL RLS for Advisors, Analysts & Admins</span>
              </div>
            </div>
            <div className="branding-point">
              <CheckCircle2 size={16} className="point-icon" />
              <div>
                <strong>Read-Only AI SQL Co-Pilot</strong>
                <span>Natural language reporting with zero data mutation</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Clean High-Contrast Auth Card */}
        <div className="login-form-wrapper">
          <div className="form-card">
            {/* Logo Group */}
            <div className="form-brand-header">
              <div className="logo-shield-box">
                <ShieldCheck size={20} />
              </div>
              <div className="brand-titles">
                <span className="brand-name">GS StudentCRM</span>
                <span className="brand-sub">Enrollment & Advising Portal</span>
              </div>
            </div>

            {/* Header */}
            <div className="form-header">
              <h2>{isSignUp ? "Request Staff Account" : "Sign In to Workspace"}</h2>
              <p>
                {isSignUp
                  ? "Submit account request for Columbia GS admissions staff"
                  : "Access your advising roster and analytics dashboard"}
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="error-banner">
                <AlertTriangle size={16} className="error-icon" />
                <span>{error}</span>
              </div>
            )}

            {/* Microsoft SSO Sign In Button */}
            <button
              type="button"
              className="btn-microsoft-sso"
              onClick={handleMicrosoftLogin}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader size={18} className="spin-icon" />
                  <span>Authenticating...</span>
                </>
              ) : (
                <>
                  <svg className="ms-icon-svg" width="18" height="18" viewBox="0 0 23 23">
                    <path fill="#f35325" d="M1 1h10v10H1z"/>
                    <path fill="#81bc06" d="M12 1h10v10H12z"/>
                    <path fill="#05a6f0" d="M1 12h10v10H1z"/>
                    <path fill="#ffba08" d="M12 12h10v10H12z"/>
                  </svg>
                  <span>Continue with Microsoft SSO</span>
                </>
              )}
            </button>

            {/* Divider */}
            <div className="form-divider">
              <span>or sign in with staff email</span>
            </div>

            {/* Email Form */}
            <form onSubmit={handleEmailSubmit} className="email-form">
              <div className="form-group">
                <label htmlFor="email">Institutional Email</label>
                <div className="input-wrapper">
                  <Mail size={16} className="input-icon" />
                  <input
                    id="email"
                    type="email"
                    placeholder="advisor@columbia.edu"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="form-group">
                <div className="label-row">
                  <label htmlFor="password">Password</label>
                  {!isSignUp && (
                    <a href="#forgot" className="forgot-link">
                      Reset Password
                    </a>
                  )}
                </div>
                <div className="input-wrapper">
                  <Lock size={16} className="input-icon" />
                  <input
                    id="password"
                    type="password"
                    placeholder="••••••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
              </div>

              <button
                type="submit"
                className="btn-submit-action"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader size={18} className="spin-icon" />
                    <span>Signing in...</span>
                  </>
                ) : (
                  <>
                    <span>{isSignUp ? "Submit Account Request" : "Sign In with Password"}</span>
                    <ArrowRight size={16} />
                  </>
                )}
              </button>
            </form>

            {/* Toggle Sign Up / Sign In */}
            <div className="form-footer">
              <p>
                {isSignUp ? "Already have an active account?" : "Need new staff access?"}
                <button
                  type="button"
                  className="toggle-btn"
                  onClick={() => {
                    setIsSignUp(!isSignUp);
                    setError("");
                  }}
                >
                  {isSignUp ? "Sign In" : "Request Access"}
                </button>
              </p>
            </div>

            {/* Links */}
            <div className="form-meta-links">
              <a href="#terms">Security Policy</a>
              <span>•</span>
              <a href="#privacy">FERPA Compliance</a>
              <span>•</span>
              <a href="#contact">IT Support</a>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

