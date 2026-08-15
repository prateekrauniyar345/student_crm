import React, { useState } from "react";
import {
  Settings,
  Building,
  Shield,
  Sparkles,
  Save,
  CheckCircle2,
  Lock,
  Database,
  Sliders,
  Clock,
  AlertTriangle,
} from "lucide-react";
import "./SettingsView.css";

export default function SettingsView() {
  const [settings, setSettings] = useState({
    institutionName: "Columbia University - School of General Studies",
    institutionCode: "CU",
    timezone: "America/New_York",
    termFormat: "YYYY[FA/SP/SU]",
    ferpaLogging: true,
    mfaEnforced: true,
    sessionTimeoutMins: 60,
    aiMaxRows: 500,
    aiTimeoutSecs: 15,
    aiStrictReadOnly: true,
  });

  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleToggle = (key) => {
    setSettings((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSettings((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = (e) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 4000);
  };

  return (
    <div className="settings-view">
      {/* Header */}
      <div className="settings-header-card">
        <div className="header-icon-badge">
          <Settings size={22} />
        </div>
        <div className="header-text">
          <h2>System & Institution Configuration</h2>
          <p>Tenant parameters, compliance auditing, and AI Co-Pilot query guardrails</p>
        </div>
      </div>

      {savedSuccess && (
        <div className="settings-alert success">
          <CheckCircle2 size={18} />
          <span>Institutional configurations saved and synced to database session.</span>
        </div>
      )}

      <form onSubmit={handleSave} className="settings-form-grid">
        {/* Card 1: Institution Profile */}
        <div className="settings-card">
          <div className="card-header-styled">
            <Building size={18} className="header-icon" />
            <div>
              <h3>Institutional Profile</h3>
              <p>Top-level multi-tenant parameters (table: institutions)</p>
            </div>
          </div>

          <div className="settings-body">
            <div className="form-group">
              <label>Institution Legal Name</label>
              <input
                type="text"
                name="institutionName"
                value={settings.institutionName}
                onChange={handleChange}
                className="form-input"
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Institution Short Code</label>
                <input
                  type="text"
                  name="institutionCode"
                  value={settings.institutionCode}
                  onChange={handleChange}
                  className="form-input font-mono"
                />
              </div>

              <div className="form-group">
                <label>System Timezone</label>
                <select
                  name="timezone"
                  value={settings.timezone}
                  onChange={handleChange}
                  className="form-select"
                >
                  <option value="America/New_York">America/New_York (Eastern)</option>
                  <option value="America/Chicago">America/Chicago (Central)</option>
                  <option value="America/Boise">America/Boise (Mountain)</option>
                  <option value="America/Los_Angeles">America/Los_Angeles (Pacific)</option>
                  <option value="UTC">UTC</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label>Academic Term Code Pattern</label>
              <input
                type="text"
                name="termFormat"
                value={settings.termFormat}
                onChange={handleChange}
                className="form-input font-mono"
              />
            </div>
          </div>
        </div>

        {/* Card 2: Security & FERPA Auditing */}
        <div className="settings-card">
          <div className="card-header-styled">
            <Shield size={18} className="header-icon" />
            <div>
              <h3>Security, Auth & Compliance</h3>
              <p>Access policies, FERPA logs, and SSO token lifespans</p>
            </div>
          </div>

          <div className="settings-body">
            <label className="toggle-row">
              <div className="toggle-info">
                <strong>FERPA Audit Logging</strong>
                <span>Log student record access and SQL inspection queries to immutable audit tables</span>
              </div>
              <input
                type="checkbox"
                checked={settings.ferpaLogging}
                onChange={() => handleToggle("ferpaLogging")}
                className="custom-toggle"
              />
            </label>

            <label className="toggle-row">
              <div className="toggle-info">
                <strong>Enforce Microsoft MFA</strong>
                <span>Mandate two-factor hardware or authenticator tokens for operator login</span>
              </div>
              <input
                type="checkbox"
                checked={settings.mfaEnforced}
                onChange={() => handleToggle("mfaEnforced")}
                className="custom-toggle"
              />
            </label>

            <div className="form-group">
              <label>Operator Session Inactivity Timeout (minutes)</label>
              <input
                type="number"
                name="sessionTimeoutMins"
                value={settings.sessionTimeoutMins}
                onChange={handleChange}
                className="form-input font-mono"
              />
            </div>
          </div>
        </div>

        {/* Card 3: AI SQL Co-Pilot Guardrails */}
        <div className="settings-card full-width">
          <div className="card-header-styled">
            <Sparkles size={18} className="header-icon" />
            <div>
              <h3>AI SQL Co-Pilot Safety Guardrails</h3>
              <p>Controls for natural language to SQL translation engine</p>
            </div>
          </div>

          <div className="settings-body guardrails-body">
            <div className="guardrail-grid">
              <label className="toggle-row">
                <div className="toggle-info">
                  <strong>Strict Read-Only Enforcement</strong>
                  <span>Automatically reject any generated queries containing UPDATE, INSERT, DELETE, DROP, or ALTER</span>
                </div>
                <input
                  type="checkbox"
                  checked={settings.aiStrictReadOnly}
                  onChange={() => handleToggle("aiStrictReadOnly")}
                  className="custom-toggle"
                />
              </label>

              <div className="form-group">
                <label>Maximum Result Limit (LIMIT clause)</label>
                <input
                  type="number"
                  name="aiMaxRows"
                  value={settings.aiMaxRows}
                  onChange={handleChange}
                  className="form-input font-mono"
                />
              </div>

              <div className="form-group">
                <label>Query Execution Timeout (seconds)</label>
                <input
                  type="number"
                  name="aiTimeoutSecs"
                  value={settings.aiTimeoutSecs}
                  onChange={handleChange}
                  className="form-input font-mono"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="settings-footer full-width">
          <button type="submit" className="btn-save-settings">
            <Save size={16} />
            <span>Save All Configuration</span>
          </button>
        </div>
      </form>
    </div>
  );
}
