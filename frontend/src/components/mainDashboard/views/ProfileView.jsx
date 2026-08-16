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
import "./ProfileView.css";
import { useToast } from "../../../context/ToastContext";
import { useUpdateUser } from "../../../hooks/useCurrentUser";
import { useMyMemberships, useInstitutionById, useUpdateInstitution } from "../../../hooks/useInstitution";


const rolePillsStatusStyle = {
  "Admin": "status-pill status-pill-danger",
  "Analyst": "status-pill status-pill-danger",
  "Advisor": "status-pill status-pill-success",
  "Faculty": "status-pill status-pill-success",
  "Viewer": "status-pill status-pill-warning",
}



export default function ProfileView({ currentUser }) {
  const [isSaving, setIsSaving] = useState(false);
  const [copiedStates, setCopiedStates] = useState({ email: false, id: false });

  const updateUserMutation = useUpdateUser();
  const updateInstitutionMutation = useUpdateInstitution();

  // Single unified state for all form data
  const [formState, setFormState] = useState({
    // currentUser fields 
    id: currentUser?.id || "",
    email: currentUser?.email || "",
    full_name: currentUser?.full_name || "",
    preferred_first_name: currentUser?.preferred_first_name || "",
    phone_number: currentUser?.phone_number || "",
    // institution fields
    name: "",
    code: "", 
    timezone: "America/New_York",

    // institution membership fields
    role: "",
    department: "",

    // other preferences
    emailNotifications: true,
    taskAlerts: true,
    weeklyReport: true,
  });

  // Track original user values for change detection
  const [originalValues] = useState({
    full_name: currentUser?.full_name || "",
    preferred_first_name: currentUser?.preferred_first_name || "",
    phone_number: currentUser?.phone_number || "",
  });

  // Get memberships and institution
  const { data: memberships, isLoading: membershipsLoading } = useMyMemberships(currentUser?.id);
  const primaryMembership = memberships?.[0];
  const { data: institutionData, isLoading: institutionLoading } = useInstitutionById(
    primaryMembership?.institutionId
  );

  const { success, warning, error, info } = useToast();

  // Sync institution data to formState
  useEffect(() => {
    if (institutionData?.timezone) {
      setFormState(prev => ({
         ...prev, 
         name: institutionData.name,
         code: institutionData.code,
         timezone: institutionData.timezone 
        }));
    }
  }, [institutionData]);

  // Sync membership data to formState
  useEffect(() => {
    if (primaryMembership?.department) {
      setFormState(prev => ({ 
          ...prev, 
          role: primaryMembership.role,
          department: primaryMembership.department 
        }));
    }
  }, [primaryMembership]);


  console.log("institutionData User:", institutionData);
  // console.log("primaryMembership User:", primaryMembership);


  // SINGLE UNIFIED COPY HANDLER
  const handleCopy = async (textToCopy, key, message) => {
    if (!textToCopy) return;

    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopiedStates(prev => ({ ...prev, [key]: true }));
      info(message);
      setTimeout(() => {
        setCopiedStates(prev => ({ ...prev, [key]: false }));
      }, 2000);
    } catch (err) {
      error("Failed to copy to clipboard");
    }
  };



  // SINGLE UNIFIED INPUT HANDLER
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    console.log("name:", name, "value:", value, "type:", type, "checked:", checked);
    setFormState(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };


  const handleSaveProfile = async (e) => {
    e.preventDefault();

    // Build payload with ONLY changed fields
    const updateUserPayload = {};
    const updateInstitutionPayload = {};
    let hasUserChanges = false;
    let hasTimezoneChanges = false;

    // Check full_name
    if (formState.full_name !== originalValues.full_name) {
      updateUserPayload.full_name = formState.full_name;
      hasUserChanges = true;
    }

    // Check preferred_first_name
    if (formState.preferred_first_name !== originalValues.preferred_first_name) {
      updateUserPayload.preferred_first_name = formState.preferred_first_name || "";
      hasUserChanges = true;
    }

    // Check phone_number
    if (formState.phone_number !== originalValues.phone_number) {
      updateUserPayload.phone_number = formState.phone_number || "";
      hasUserChanges = true;
    }

    if (formState.timezone !== institutionData?.timezone) {
      updateInstitutionPayload.timezone = formState.timezone;
      hasTimezoneChanges = true;
    }

    // If nothing changed, show info and return
    if (!hasUserChanges && !hasTimezoneChanges) {
      info("No changes to save");
      return;
    }

    // Call mutations only for changed entities
    setIsSaving(true);
    try {
      if (hasUserChanges) {
        await updateUserMutation.mutateAsync({ userId: formState.id, updatePayload: updateUserPayload });
      }
      if (hasTimezoneChanges) {
        await updateInstitutionMutation.mutateAsync({ institutionId: institutionData.id, updates: updateInstitutionPayload });
      }
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
            <h2>{formState.full_name || currentUser?.email?.split("@")[0] || "Staff Member"}</h2>
            <span className={`status-pill ${rolePillsStatusStyle[formState.role] || ""}`}>
              <CheckCircle2 size={12} />
              <span>{formState.role}</span>
            </span>
          </div>
          <span className="hero-email font-mono">{currentUser?.email}</span>
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
                <span className="font-mono user-id-text">{currentUser?.id}</span>
                <button
                  type="button"
                  className="btn-copy-id"
                  onClick={() => handleCopy(currentUser?.id, 'id', 'User UUID copied!')}
                  title="Copy User UUID"
                >
                  {copiedStates.id ? <Check size={14} className="text-success" /> : <Copy size={14} />}
                </button>
              </div>
            </div>

            <div className="meta-field">
              <span className="meta-label">Email</span>
              <div className="meta-val-copy">
                <div className="meta-val font-mono">{currentUser?.email}</div>
                <button
                  type="button"
                  className="btn-copy-id"
                  onClick={() => handleCopy(currentUser?.email, 'email', 'Email copied!')}
                  title="Copy Email"
                >
                  {copiedStates.email ? <Check size={14} className="text-success" /> : <Copy size={14} />}
                </button>
              </div>
            </div>

            <div className="meta-field">
              <span className="meta-label">Home Institution</span>
              <div className="meta-val">
                {institutionLoading ? "Loading..." : `${formState.name} (${formState.code})`}
              </div>
            </div>

            <div className="meta-field">
              <span className="meta-label">Assigned CRM Role</span>
              <div className="meta-val">
                <span className={`status-pill ${rolePillsStatusStyle[formState.role] || ""}`}>
                  {formState.role || "Loading..."}
                </span>
              </div>
            </div>

            <div className="meta-field">
              <span className="meta-label">Department & Title</span>
              <div className="meta-val">
                {formState.department || "Loading..."}
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
              <label htmlFor="full_name">Full Legal / Display Name *</label>
              <input
                id="full_name"
                name="full_name"
                type="text"
                required
                value={formState.full_name}
                onChange={handleInputChange}
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
                  value={formState.preferred_first_name}
                  onChange={handleInputChange}
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
                  value={formState.phone_number ?? ''}
                  onChange={handleInputChange}
                  placeholder="+1 (212) 854-2772"
                  className="form-input"
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="timezone">Operational Timezone</label>
              <select
                id="timezone"
                name="timezone"
                value={formState.timezone}
                onChange={handleInputChange}
                className="form-select"
              >
                <option value="America/New_York">America/New_York (Eastern Time)</option>
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
                  checked={formState.emailNotifications}
                  onChange={handleInputChange}
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
                  checked={formState.taskAlerts}
                  onChange={handleInputChange}
                />
                <div className="checkbox-text">
                  <strong>Assigned Advising Tasks</strong>
                  <span>Alert me immediately when a student follow-up is assigned</span>
                </div>
              </label>

              <label className="checkbox-row">
                <input
                  type="checkbox"
                  name="weeklyReport"
                  checked={formState.weeklyReport}
                  onChange={handleInputChange}
                />
                <div className="checkbox-text">
                  <strong>Weekly AI Analytics Digest</strong>
                  <span>Receive weekly summary of natural language queries</span>
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
