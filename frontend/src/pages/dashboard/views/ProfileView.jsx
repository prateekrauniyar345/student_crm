import React, { useState, useEffect } from "react";
import {
  User as UserIcon,
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
import User from "../../../models/user";
import "./ProfileView.css";
import { useToast } from "../../../context/ToastContext";

export default function ProfileView({ user }) {
  const { updateCurrentUser, refreshUser } = useAuth();

  const [userInfo, setUserInfo] = useState({
    fullName: user?.full_name || "",
    preferredName: user?.preferred_first_name || "",
    phone_number: user?.phone_number || "",
  });

  // get the toast variable from the toast context
  const {
        success,
        warning,
        error,
        info
    } = useToast();

  console.log("user in the ProfileView:", user);


  const [formData, setFormData] = useState({
    title: "Senior Admissions & Advising Officer",
    department: "School of General Studies - Academic Affairs",
    timezone: "America/New_York",
    emailNotifications: true,
    taskAlerts: true,
    weeklyReport: true,
  });

  const [isSaving, setIsSaving] = useState(false);
  const [copiedId, setCopiedId] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState(false);



  const handleCopyEmail = () => {
    if (user?.email) {
      navigator.clipboard.writeText(user.email);
      setCopiedEmail(true);
      info("Email copied to clipboard!");
      setTimeout(() => setCopiedEmail(false), 2000);
    }
  };

  const handleCopyId = () => {
    if (user?.id) {
      navigator.clipboard.writeText(user.id);
      setCopiedId(true);
      info("User UUID copied to clipboard!");
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


  const handleUserInfoChange = (e) =>{
    const { name, value} = e.target;
    setUserInfo((prev) => ({
      ...prev,
      [name]: value,
    }));
  }


  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const updatePayload = {
            full_name: userInfo.fullName.trim(),
            preferred_first_name: userInfo.preferredName.trim(),
            phone_number: userInfo.phone_number.trim(),
        };
        await updateCurrentUser(updatePayload);
        success("Profile preferences saved successfully.");
    } catch (error) {
        setErrorMessage(error.message);
        console.warn("Could not save to remote backend API, updating local session:", error);
        error("Could not save changes : ", error);
    } finally {
        setIsSaving(false);
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
          <UserIcon size={36} />
        </div>
        <div className="profile-hero-meta">
          <div className="hero-name-row">
            <h2>{userInfo.fullName || user?.email?.split("@")[0] || "Staff Member"}</h2>
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
              <span className="meta-label">Email</span>
              <div className="meta-val-copy">
                <div className="meta-val font-mono">{user?.email || "advising@columbia.edu"}</div>
                <button
                  type="button"
                  className="btn-copy-id"
                  onClick={handleCopyEmail}
                  title="Copy Email"
                >
                  {copiedEmail ? <Check size={14} className="text-success" /> : <Copy size={14} />}
                </button>
              </div>
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
            <UserIcon size={18} className="header-icon" />
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
                value={userInfo.fullName}
                onChange={handleUserInfoChange}
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
                  value={userInfo.preferredName}
                  onChange={handleUserInfoChange}
                  placeholder="e.g. Alex"
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label htmlFor="phone_number">Contact Phone</label>
                <input
                  id="phone_number"
                  name="phone_number"
                  type="tel"
                  value={userInfo.phone_number ?? ''}
                  onChange={handleUserInfoChange}
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
