import { useState } from "react";
import AuthService from "../../services/AuthService";
import "./LoginPage.css";

function LoginPage() {
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleMicrosoftLogin = async () => {
    try {
      setError("");
      setIsLoading(true);

      await AuthService.signInWithMicrosoft();

      // The browser will redirect to Microsoft
    } catch (error) {
      setError(error.message);
      setIsLoading(false);
    }
  };

  return (
    <main className="login-container">
      <div className="login-box">
        <h1>Student CRM</h1>
        <p className="subtitle">Enrollment Analytics & Management</p>

        <button
          type="button"
          onClick={handleMicrosoftLogin}
          disabled={isLoading}
          className="microsoft-button"
        >
          {isLoading ? "Redirecting to Microsoft..." : "Continue with Microsoft"}
        </button>

        {error && (
          <p className="error-message" role="alert">
            {error}
          </p>
        )}
      </div>
    </main>
  );
}

export default LoginPage;
