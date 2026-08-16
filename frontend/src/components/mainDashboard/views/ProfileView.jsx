import React, { useState, useEffect } from "react";
import {
  User as UserIcon,
  Shield,
  Copy,
  Check,
  Save,
  CheckCircle2,
  Clock,
  Globe,
  Ellipsis,
} from "lucide-react";
import "./ProfileView.css";
import { useToast } from "../../../context/ToastContext";
import { useUpdateUser } from "../../../hooks/useCurrentUser";
import {
  useMyMemberships,
  useInstitutionById,
  useUpdateInstitution,
} from "../../../hooks/useInstitution";

// Reusable UI components from src/ui
import {
  Select,
  Input,
  Button,
  RolePill,
  StatusPill,
  Card,
} from "../../../ui";

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
  const { data: memberships, isLoading: membershipsLoading } = useMyMemberships(
    currentUser?.id
  );
  const primaryMembership = memberships?.[0];
  const { data: institutionData, isLoading: institutionLoading } = useInstitutionById(
    primaryMembership?.institutionId
  );

  const { info, error } = useToast();

  // Sync institution data to formState
  useEffect(() => {
    if (institutionData?.timezone) {
      setFormState((prev) => ({
        ...prev,
        name: institutionData.name,
        code: institutionData.code,
        timezone: institutionData.timezone,
      }));
    }
  }, [institutionData]);

  // Sync membership data to formState
  useEffect(() => {
    if (primaryMembership?.department || primaryMembership?.role) {
      setFormState((prev) => ({
        ...prev,
        role: primaryMembership.role,
        department: primaryMembership.department,
      }));
    }
  }, [primaryMembership]);

  // Unified Copy Handler
  const handleCopy = async (textToCopy, key, message) => {
    if (!textToCopy) return;

    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopiedStates((prev) => ({ ...prev, [key]: true }));
      info(message);
      setTimeout(() => {
        setCopiedStates((prev) => ({ ...prev, [key]: false }));
      }, 2000);
    } catch (err) {
      error("Failed to copy to clipboard");
    }
  };

  // Unified Input Handler
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormState((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();

    // Build payload with ONLY changed fields
    const updateUserPayload = {};
    const updateInstitutionPayload = {};
    let hasUserChanges = false;
    let hasTimezoneChanges = false;

    if (formState.full_name !== originalValues.full_name) {
      updateUserPayload.full_name = formState.full_name;
      hasUserChanges = true;
    }

    if (formState.preferred_first_name !== originalValues.preferred_first_name) {
      updateUserPayload.preferred_first_name = formState.preferred_first_name || "";
      hasUserChanges = true;
    }

    if (formState.phone_number !== originalValues.phone_number) {
      updateUserPayload.phone_number = formState.phone_number || "";
      hasUserChanges = true;
    }

    if (formState.timezone !== institutionData?.timezone) {
      updateInstitutionPayload.timezone = formState.timezone;
      hasTimezoneChanges = true;
    }

    if (!hasUserChanges && !hasTimezoneChanges) {
      info("No changes to save");
      return;
    }

    setIsSaving(true);
    try {
      if (hasUserChanges) {
        await updateUserMutation.mutateAsync({
          userId: formState.id,
          updatePayload: updateUserPayload,
        });
      }
      if (hasTimezoneChanges && institutionData?.id) {
        await updateInstitutionMutation.mutateAsync({
          institutionId: institutionData.id,
          updates: updateInstitutionPayload,
        });
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

  // Timezone options for the reusable Select component
  const timezoneOptions = [
    { value: "America/New_York", label: "America/New_York (Eastern Time - UTC-5)" },
    { value: "America/Chicago", label: "America/Chicago (Central Time - UTC-6)" },
    { value: "America/Denver", label: "America/Denver (Mountain Time - UTC-7)" },
    { value: "America/Phoenix", label: "America/Phoenix (Mountain Standard - UTC-7)" },
    { value: "America/Los_Angeles", label: "America/Los_Angeles (Pacific Time - UTC-8)" },
    { value: "America/Anchorage", label: "America/Anchorage (Alaska Time - UTC-9)" },
    { value: "Pacific/Honolulu", label: "Pacific/Honolulu (Hawaii Time - UTC-10)" },
  ];

  return (
    <div className="profile-view">
      {/* Profile Header Hero Card */}
      <div className="profile-hero-card">
        <div className="profile-avatar-large">
          <UserIcon size={36} />
        </div>
        <div className="profile-hero-meta">
          <div className="hero-name-row">
            <h2>
              {formState.full_name ||
                currentUser?.email?.split("@")[0] ||
                "Staff Member"}
            </h2>
            <RolePill role={formState.role || "Viewer"} icon={<CheckCircle2 size={12} />} />
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
        <Card
          title="Institutional Security & Identity"
          subtitle="System credentials, tenant assignment, and audit keys"
          icon={<Shield size={18} />}
          className="profile-card"
        >
          <div className="metadata-rows">
            {/* User UUID */}
            <div className="meta-field">
              <span className="meta-label">Unique User ID (UUID)</span>
              <div className="meta-val-copy">
                <span className="font-mono user-id-text">{currentUser?.id}</span>
                <button
                  type="button"
                  className="btn-copy-id"
                  onClick={() => handleCopy(currentUser?.id, "id", "User UUID copied!")}
                  title="Copy User UUID"
                >
                  {copiedStates.id ? (
                    <Check size={14} className="text-success" />
                  ) : (
                    <Copy size={14} />
                  )}
                </button>
              </div>
            </div>

            {/* Email */}
            <div className="meta-field">
              <span className="meta-label">Email</span>
              <div className="meta-val-copy">
                <div className="meta-val font-mono">{currentUser?.email}</div>
                <button
                  type="button"
                  className="btn-copy-id"
                  onClick={() => handleCopy(currentUser?.email, "email", "Email copied!")}
                  title="Copy Email"
                >
                  {copiedStates.email ? (
                    <Check size={14} className="text-success" />
                  ) : (
                    <Copy size={14} />
                  )}
                </button>
              </div>
            </div>

            {/* Home Institution */}
            <div className="meta-field">
              <span className="meta-label">Home Institution</span>
              <div className="meta-val">
                {institutionLoading
                  ? "Loading..."
                  : `${formState.name || "Columbia University"} (${formState.code || "CU"})`}
              </div>
            </div>

            {/* Assigned CRM Role Dropdown/Badge */}
            <div className="meta-field">
              <span className="meta-label">Assigned CRM Role</span>
              <div className="meta-val">
                <RolePill role={formState.role || "Viewer"} />
              </div>
            </div>

            {/* Department */}
            <div className="meta-field">
              <span className="meta-label">Department & Title</span>
              <div className="meta-val">
                {formState.department || "Advising & Student Services"}
              </div>
            </div>

            {/* Account Provisioned Date */}
            <div className="meta-field">
              <span className="meta-label">Account Provisioned Date</span>
              <div className="meta-val font-mono">{formatDate(currentUser?.created_at)}</div>
            </div>

            {/* FERPA Compliance */}
            <div className="meta-field">
              <span className="meta-label">FERPA Training & Compliance</span>
              <div className="meta-val">
                <StatusPill variant="success" dot>Current (Audited 2026)</StatusPill>
              </div>
            </div>

            {/* Auth Provider */}
            <div className="meta-field">
              <span className="meta-label">Authentication Provider</span>
              <div className="meta-val">Microsoft Entra ID via Supabase Bearer JWT</div>
            </div>
          </div>
        </Card>

        {/* Right Column: Edit Profile Form */}
        <Card
          title="Edit Profile & Preferences"
          subtitle="Update your public staff details and notification triggers"
          icon={<UserIcon size={18} />}
          className="profile-card"
        >
          <form onSubmit={handleSaveProfile} className="profile-form">
            {/* Full Legal Name Input */}
            <Input
              label="Full Legal / Display Name *"
              id="full_name"
              name="full_name"
              required
              value={formState.full_name}
              onChange={handleInputChange}
              placeholder="e.g. Alex Morgan"
              fullWidth
            />

            <div className="form-row">
              {/* Preferred First Name Input */}
              <Input
                label="Preferred First Name"
                id="preferred_first_name"
                name="preferred_first_name"
                value={formState.preferred_first_name}
                onChange={handleInputChange}
                placeholder="e.g. Alex"
                fullWidth
              />

              {/* Contact Phone Input */}
              <Input
                label="Contact Phone"
                id="phone_number"
                name="phone_number"
                type="tel"
                value={formState.phone_number ?? ""}
                onChange={handleInputChange}
                placeholder="+1 (212) 854-2772"
                fullWidth
              />
            </div>

            {/* Reusable Select Dropdown for Timezone */}
            <Select
              label="Operational Timezone"
              id="timezone"
              name="timezone"
              icon={<Clock size={14} />}
              value={formState.timezone}
              onChange={handleInputChange}
              options={timezoneOptions}
              fullWidth
            />

            {/* Notification Preferences */}
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

            {/* Save Button */}
            <div className="form-actions">
              <Button
                type="submit"
                variant="primary"
                size="md"
                loading={isSaving}
                icon={<Save size={16} />}
              >
                {isSaving ? "Saving Changes..." : "Save Profile Changes"}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}
