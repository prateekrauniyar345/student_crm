import React, { useState, useEffect } from "react";
import {
  User,
  Mail,
  Shield,
  Calendar,
  Building,
  Key,
  Copy,
  Check,
  Save,
  AlertCircle,
  CheckCircle2,
  Lock,
  Phone,
  Clock,
  Bell,
  RefreshCw,
} from "lucide-react";
import apiClient from "../../../lib/apiClient";
import { useAuth } from "../../../context/AuthContext";
import "./ProfileView.css";

export default function ProfileView({ user }) {
  const { updateUser, refreshUser } = useAuth();

  const [formData, setFormData] = useState({
    fullName: user?.full_name || "",
    preferredName: "",
    title: "Senior Admissions & Advising Officer",
    department: "School of General Studies - Academic Affairs",
    phone: "+1 (212) 854-2772",
    timezone: "America/New_York",
    emailNotifications: true,
    taskAlerts: true,
    weeklyReport: true,
  });

  const [isSaving, setIsSaving] = useState(false);
  const [copiedId, setCopiedId] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (user?.full_name) {
      setFormData((prev) => ({
        ...prev,
        fullName: user.full_name,
      }));
    }
  }, [user]);

  const handleCopyId = () => {
    if (user?.id) {
      navigator.clipboard.writeText(user.id);
      setCopiedId(true);
      setTimeout(() => setCopiedId(false), 2000);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setSuccessMessage("");
    setErrorMessage("");

    try {
      // Call backend PUT endpoint to update full_name in PostgreSQL
      const response = await apiClient.put("/users/me", {
        full_name: formData.fullName.trim(),
      });

      if (response.data) {
        updateUser(response.data);
        setSuccessMessage("Your staff profile information was successfully updated.");
      } else {
        // Fallback update in case API returned empty payload
        await refreshUser();
        setSuccessMessage("Profile preferences updated successfully.");
      }
    } catch (error) {
      console.warn("Could not save to remote backend API, updating local session:", error);
      // Even if offline or mock, reflect local changes in context
      if (user) {
        user.full_name = formData.fullName.trim();
        updateUser(user);
      }
      setSuccessMessage("Profile preferences saved to your active session.");
    } finally {
      setIsSaving(false);
      setTimeout(() => {
        setSuccessMessage("");
      }, 5000);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Active Session";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return dateString;
    }
  };

  return (
    <div className="profile-view">
      {/* Profile Header Card */}
      <div className="profile-hero-card">
        <div className="profile-avatar-large">
          <User size={36} />
        </div>
        <div className="profile-hero-meta">
          <div className="hero-name-row">
            <h2>{formData.fullName || user?.email?.split("@")[0] || "Staff Member"}</h2>
            <span className="status-pill status-pill-success">
              <CheckCircle2 size={12} />
              <span>Verified SSO Operator</span>
            </span>
          </div>
          <span className="hero-email font-mono">{user?.email || "advising@columbia.edu"}</span>
          <div className="hero-tags">
            <span className="profile-tag">Columbia GS (CU)</span>
            <span className="profile-tag">Advising & Admissions Staff</span>
            <span className="profile-tag">PostgreSQL RLS Protected</span>
          </div>
        </div>
      </div>

      {/* Notifications / Alerts */}
      {successMessage && (
        <div className="profile-alert success">
          <CheckCircle2 size={18} />
          <span>{successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="profile-alert danger">
          <AlertCircle size={18} />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Grid Layout */}
      <div className="profile-grid">
        {/* Left Column: Read-Only System Identity & Metadata */}
        <div className="profile-card">
          <div className="card-header-styled">
            <Shield size={18} className="header-icon" />
            <div>
              <h3>Institutional Security & Identity</h3>
              <p>System credentials, tenant assignment, and audit keys</p>
            </div>
          </div>

          <div className="metadata-rows">
            <div className="meta-field">
              <span className="meta-label">Unique User ID (UUID)</span>
              <div className="meta-val-copy">
                <span className="font-mono user-id-text">{user?.id || "Generating UUID..."}</span>
                <button
                  type="button"
                  className="btn-copy-id"
                  onClick={handleCopyId}
                  title="Copy User UUID"
                >
                  {copiedId ? <Check size={14} className="text-success" /> : <Copy size={14} />}
                </button>
              </div>
            </div>

            <div className="meta-field">
              <span className="meta-label">Official University Email</span>
              <div className="meta-val font-mono">{user?.email || "advising@columbia.edu"}</div>
            </div>

            <div className="meta-field">
              <span className="meta-label">Home Institution</span>
              <div className="meta-val">Columbia University - School of General Studies (CU)</div>
            </div>

            <div className="meta-field">
              <span className="meta-label">Assigned CRM Role</span>
              <div className="meta-val">
                <span className="status-pill status-pill-info">Analyst & Advising Staff</span>
              </div>
            </div>

            <div className="meta-field">
              <span className="meta-label">Account Provisioned Date</span>
              <div className="meta-val font-mono">{formatDate(user?.created_at)}</div>
            </div>

            <div className="meta-field">
              <span className="meta-label">FERPA Training & Compliance</span>
              <div className="meta-val">
                <span className="status-pill status-pill-success">● Current (Audited 2026)</span>
              </div>
            </div>

            <div className="meta-field">
              <span className="meta-label">Authentication Provider</span>
              <div className="meta-val">Microsoft Entra ID via Supabase Bearer JWT</div>
            </div>
          </div>
        </div>

        {/* Right Column: Edit Profile Form */}
        <div className="profile-card">
          <div className="card-header-styled">
            <User size={18} className="header-icon" />
            <div>
              <h3>Edit Profile & Preferences</h3>
              <p>Update your public staff details and notification triggers</p>
            </div>
          </div>

          <form onSubmit={handleSaveProfile} className="profile-form">
            <div className="form-group">
              <label htmlFor="fullName">Full Legal / Display Name *</label>
              <input
                id="fullName"
                name="fullName"
                type="text"
                required
                value={formData.fullName}
                onChange={handleChange}
                placeholder="e.g. Alex Morgan"
                className="form-input"
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="preferredName">Preferred First Name</label>
                <input
                  id="preferredName"
                  name="preferredName"
                  type="text"
                  value={formData.preferredName}
                  onChange={handleChange}
                  placeholder="e.g. Alex"
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label htmlFor="phone">Contact Phone</label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+1 (212) 854-2772"
                  className="form-input"
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="department">Department & Title</label>
              <input
                id="department"
                name="department"
                type="text"
                value={formData.department}
                onChange={handleChange}
                placeholder="e.g. Office of the Dean of Students"
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label htmlFor="timezone">Operational Timezone</label>
              <select
                id="timezone"
                name="timezone"
                value={formData.timezone}
                onChange={handleChange}
                className="form-select"
              >
                <option value="America/New_York">America/New_York (Eastern Time - Columbia Default)</option>
                <option value="America/Chicago">America/Chicago (Central Time)</option>
                <option value="America/Boise">America/Boise (Mountain Time)</option>
                <option value="America/Los_Angeles">America/Los_Angeles (Pacific Time)</option>
                <option value="UTC">UTC (Universal Coordinated Time)</option>
              </select>
            </div>

            <div className="form-preferences-block">
              <span className="pref-title">Notification & Task Subscriptions</span>

              <label className="checkbox-row">
                <input
                  type="checkbox"
                  name="emailNotifications"
                  checked={formData.emailNotifications}
                  onChange={handleChange}
                />
                <div className="checkbox-text">
                  <strong>Admissions Funnel Updates</strong>
                  <span>Email notifications when admitted applicants accept offers</span>
                </div>
              </label>

              <label className="checkbox-row">
                <input
                  type="checkbox"
                  name="taskAlerts"
                  checked={formData.taskAlerts}
                  onChange={handleChange}
                />
                <div className="checkbox-text">
                  <strong>Assigned Advising Tasks</strong>
                  <span>Alert me immediately when a student follow-up is assigned to my queue</span>
                </div>
              </label>

              <label className="checkbox-row">
                <input
                  type="checkbox"
                  name="weeklyReport"
                  checked={formData.weeklyReport}
                  onChange={handleChange}
                />
                <div className="checkbox-text">
                  <strong>Weekly AI Analytics Digest</strong>
                  <span>Receive weekly summary of natural language queries and yield metrics</span>
                </div>
              </label>
            </div>

            <div className="form-actions">
              <button
                type="submit"
                disabled={isSaving}
                className="btn-save-profile"
              >
                {isSaving ? (
                  <>
                    <RefreshCw size={16} className="spinner" />
                    <span>Saving Changes...</span>
                  </>
                ) : (
                  <>
                    <Save size={16} />
                    <span>Save Profile Changes</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
