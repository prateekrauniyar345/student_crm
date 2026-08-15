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
  Ellipsis
} from "lucide-react";
import apiClient from "../../../lib/apiClient";
import { useAuth } from "../../../context/AuthContext";
import User from "../../../models/user";
import "./ProfileView.css";
import { useToast } from "../../../context/ToastContext";
import { useUpdateUser } from "../../../hooks/useCurrentUser";

export default function ProfileView({ currentUser }) {

  const [isSaving, setIsSaving] = useState(false);
  const [copiedId, setCopiedId] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState(false);

  // get update mutation from the useUpdateUser hook
  const updateUserMutation = useUpdateUser();

  // user info state to hold the editable fields
  const [userInfo, setUserInfo] = useState({
    id: currentUser?.id || "",
    email: currentUser?.email || "",
    full_name: currentUser?.full_name || "",
    preferred_first_name: currentUser?.preferred_first_name || "",
    phone_number: currentUser?.phone_number || "",
  });


  console.log("userInfo in ProfileView:", userInfo);



  const [institutionInfo, setInstitutionInfo] = useState({
    institutionId: "",
    role: "",
    department: "",
  });

  const [institutionMemberships, setInstitutionMemberships] = useState([]);

  // get the toast variable from the toast context
  const {
        success,
        warning,
        error,
        info
    } = useToast();



  const [formData, setFormData] = useState({
    title: "Senior Admissions & Advising Officer",
    department: "School of General Studies - Academic Affairs",
    timezone: "America/New_York",
    emailNotifications: true,
    taskAlerts: true,
    weeklyReport: true,
  });




  // copy of the email
  const handleCopyEmail = () => {
    if (currentUser?.email) {
      navigator.clipboard.writeText(currentUser.email);
      setCopiedEmail(true);
      info("Email copied to clipboard!");
      setTimeout(() => setCopiedEmail(false), 2000);
    }
  };

  // copy of the user id
  const handleCopyId = () => {
    if (currentUser?.id) {
      navigator.clipboard.writeText(currentUser.id);
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

      // Only send fields that changed and exist in UserUpdate schema
      const updatePayload = {
        full_name: userInfo.full_name,
        preferred_first_name: userInfo.preferred_first_name || "",
        phone_number: userInfo.phone_number || "",
      };

      // Call mutation - it handles API call + cache invalidation
      setIsSaving(true);
      try {
        await updateUserMutation.mutateAsync({ userId: userInfo.id, updatePayload: updatePayload });
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
            <h2>{userInfo.full_name || currentUser?.email?.split("@")[0] || "Staff Member"}</h2>
            <span className="status-pill status-pill-success">
              <CheckCircle2 size={12} />
              <span>Verified SSO Operator</span>
            </span>
          </div>
          <span className="hero-email font-mono">{currentUser?.email || "advising@columbia.edu"}</span>
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
                <span className="font-mono user-id-text">{currentUser?.id || "Generating UUID..."}</span>
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
                <div className="meta-val font-mono">{currentUser?.email || "advising@columbia.edu"}</div>
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
              <div className="meta-val font-mono">{formatDate(currentUser?.created_at)}</div>
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
                id="full_name"
                name="full_name"
                type="text"
                required
                value={userInfo.full_name}
                onChange={handleUserInfoChange}
                placeholder="e.g. Alex Morgan"
                className="form-input"
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="preferred_first_name">Preferred First Name</label>
                <input
                  id="preferred_first_name"
                  name="preferred_first_name"
                  type="text"
                  value={userInfo.preferred_first_name}
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
                    <Ellipsis size={16} className="save-action" />
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
