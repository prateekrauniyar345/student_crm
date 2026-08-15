// src/pages/AuthCallbackPage.jsx
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "./AuthCallbackPage.css";

function AuthCallbackPage() {
  const navigate = useNavigate();
  // Use isAuthInitializing to determine if the authentication process 
  // is still ongoing
  const { session, isAuthInitializing } = useAuth();

  useEffect(() => {
    if (!isAuthInitializing && session) {
      navigate("/dashboard", { replace: true });
    }
  }, [session, isAuthInitializing, navigate]);

  // Show spinner while Supabase processes the token from the URL
  if (isAuthInitializing) {
    return (
      <div className="callback-container">
        <div className="callback-content">
          <div className="spinner"></div>
          <p>Completing Microsoft sign-in...</p>
        </div>
      </div>
    );
  }

  // Only show failure if initialization finished and no session exists
  if (!session) {
    return (
      <div className="callback-container">
        <div className="callback-content">
          <h1>Sign-in failed</h1>
          <p>No authentication session was created.</p>
          <button onClick={() => navigate("/login", { replace: true })}>
            Try again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="callback-container">
      <div className="callback-content">
        <p>Signed in successfully. Redirecting...</p>
      </div>
    </div>
  );
}

export default AuthCallbackPage;