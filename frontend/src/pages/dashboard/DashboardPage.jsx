import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../../context/AuthContext";
import AuthService from "../../services/AuthService";
import "./DashboardPage.css";

function DashboardPage() {
  const navigate = useNavigate();
  const { user, isLoading } = useAuth();
  const [error, setError] = useState("");

  
  const handleSignOut = async () => {
    try {
      await AuthService.signOut();
      navigate("/login", { replace: true });
    } catch (err) {
      setError(err.message);
    }
  };

  if (isLoading) {
    return <div className="dashboard-container">Loading...</div>;
  }

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1>Student CRM Dashboard</h1>
        <button onClick={handleSignOut} className="sign-out-button">
          Sign Out
        </button>
      </header>

      <main className="dashboard-content">
        {error && (
          <div className="error-box">
            <p>{error}</p>
          </div>
        )}

        <div className="welcome-card">
          <h2>Welcome, {user?.email}!</h2>
          <p>You are now logged in to the Student CRM system.</p>
        </div>

        {user && (
          <div className="user-info-card">
            <h3>User Information</h3>
            <div className="info-field">
              <label>User ID:</label>
              <span>{user.id}</span>
            </div>
            <div className="info-field">
              <label>Email:</label>
              <span>{user.email}</span>
            </div>
            <div className="info-field">
              <label>Full Name:</label>
              <span>{user.full_name || "N/A"}</span>
            </div>
          </div>
        )}

        <div className="features-grid">
          <div className="feature-card">
            <h3>Students</h3>
            <p>Manage student records and enrollment status</p>
          </div>
          <div className="feature-card">
            <h3>Analytics</h3>
            <p>View enrollment analytics and insights</p>
          </div>
          <div className="feature-card">
            <h3>Reports</h3>
            <p>Generate and view CRM reports</p>
          </div>
        </div>
      </main>
    </div>
  );
}

export default DashboardPage;
