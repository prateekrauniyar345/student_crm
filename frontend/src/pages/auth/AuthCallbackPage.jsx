import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../../context/AuthContext";
import "./AuthCallbackPage.css";

function AuthCallbackPage() {
  const navigate = useNavigate();
  const { session, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && session) {
      navigate("/dashboard", { replace: true });
    }
  }, [session, isLoading, navigate]);

  if (isLoading) {
    return (
      <div className="callback-container">
        <div className="callback-content">
          <div className="spinner"></div>
          <p>Completing Microsoft sign-in...</p>
        </div>
      </div>
    );
  }

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
