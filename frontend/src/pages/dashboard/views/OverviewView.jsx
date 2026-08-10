import React from "react";
import {
  Users,
  TrendingUp,
  ClipboardList,
  Sparkles,
  ShieldCheck,
  BarChart3,
  UserCheck,
  CheckCircle2,
  ArrowRight,
  Database,
  Calendar,
  AlertCircle,
  FileSpreadsheet,
  Clock,
} from "lucide-react";
import "./OverviewView.css";

export default function OverviewView({ user, setActiveTab }) {
  return (
    <div className="overview-view">
      {/* Welcome Banner */}
      <div className="overview-welcome-card">
        <div className="welcome-left">
          <div className="welcome-badge">
            <ShieldCheck size={15} />
            <span>Columbia GS Institutional Standard</span>
          </div>
          <h2>Welcome back, {user?.full_name || user?.email?.split("@")[0] || "Operator"}!</h2>
          <p>
            You are logged into the Non-Traditional Student CRM & Enrollment Analytics Workspace. Below is your current institutional summary and operational status.
          </p>
          <div className="welcome-actions">
            <button
              className="btn-primary-action"
              onClick={() => setActiveTab("profile")}
            >
              <UserCheck size={16} />
              <span>Manage Profile</span>
            </button>
            <button
              className="btn-secondary-action"
              onClick={() => setActiveTab("admin")}
            >
              <ShieldCheck size={16} />
              <span>Admin Management</span>
            </button>
          </div>
        </div>

        <div className="welcome-right">
          <div className="system-pill-stat">
            <span className="pill-title">Active Database Mode</span>
            <span className="pill-val font-mono">PostgreSQL 15+</span>
            <span className="status-pill status-pill-success">● Connected</span>
          </div>
          <div className="system-pill-stat">
            <span className="pill-title">Auth Operator Role</span>
            <span className="pill-val">Advising & Analytics</span>
            <span className="status-pill status-pill-info">RBAC Active</span>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-header">
            <span className="kpi-title">Total Applicants Tracked</span>
            <div className="kpi-icon-box blue">
              <Users size={18} />
            </div>
          </div>
          <div className="kpi-value font-mono">4,820</div>
          <div className="kpi-footer">
            <span className="status-pill status-pill-success">+12.4%</span>
            <span className="kpi-sub">vs previous academic year</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-header">
            <span className="kpi-title">Calculated Term Yield</span>
            <div className="kpi-icon-box green">
              <TrendingUp size={18} />
            </div>
          </div>
          <div className="kpi-value font-mono">68.4%</div>
          <div className="kpi-footer">
            <span className="status-pill status-pill-info">sp_calculate_yield</span>
            <span className="kpi-sub">Admitted → Enrolled</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-header">
            <span className="kpi-title">Non-Traditional Cohorts</span>
            <div className="kpi-icon-box amber">
              <ClipboardList size={18} />
            </div>
          </div>
          <div className="kpi-value font-mono">1,420</div>
          <div className="kpi-footer">
            <span className="status-pill status-pill-warning">Transfer & Veteran</span>
            <span className="kpi-sub">Active degree audits</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-header">
            <span className="kpi-title">Advising Follow-ups</span>
            <div className="kpi-icon-box cyan">
              <Clock size={18} />
            </div>
          </div>
          <div className="kpi-value font-mono">18</div>
          <div className="kpi-footer">
            <span className="status-pill status-pill-warning">Action Needed</span>
            <span className="kpi-sub">Pending credit audits</span>
          </div>
        </div>
      </div>

      {/* Main Two-Column Layout */}
      <div className="overview-split-grid">
        {/* Left Column: Quick Navigation Modules */}
        <div className="overview-modules-card">
          <div className="card-section-header">
            <div className="header-text-group">
              <h3>CRM Application Modules</h3>
              <p>Direct navigation across core system workflows</p>
            </div>
          </div>

          <div className="modules-list">
            <div className="module-item" onClick={() => setActiveTab("profile")}>
              <div className="module-icon-box">
                <UserCheck size={18} />
              </div>
              <div className="module-info">
                <strong>My Staff Profile & Preferences</strong>
                <span>View authentication metadata, update contact info, and manage notification settings</span>
              </div>
              <ArrowRight size={16} className="module-arrow" />
            </div>

            <div className="module-item" onClick={() => setActiveTab("admin")}>
              <div className="module-icon-box">
                <ShieldCheck size={18} />
              </div>
              <div className="module-info">
                <strong>Administration & Staff User Management</strong>
                <span>Inspect active operators, assign roles (Admin, Analyst, Advisor), and manage institution settings</span>
              </div>
              <ArrowRight size={16} className="module-arrow" />
            </div>

            <div className="module-item" onClick={() => setActiveTab("students")}>
              <div className="module-icon-box">
                <Users size={18} />
              </div>
              <div className="module-info">
                <strong>Student Roster & Degree Audits</strong>
                <span>Search applicant directories, filter by Transfer/Veteran cohorts, and review transcripts</span>
              </div>
              <span className="status-pill status-pill-neutral">Coming Soon</span>
            </div>

            <div className="module-item" onClick={() => setActiveTab("ai-copilot")}>
              <div className="module-icon-box">
                <Sparkles size={18} />
              </div>
              <div className="module-info">
                <strong>AI SQL Co-Pilot (Text-to-SQL)</strong>
                <span>Natural language reporting agent with read-only SELECT guardrails</span>
              </div>
              <span className="status-pill status-pill-info">In Development</span>
            </div>
          </div>
        </div>

        {/* Right Column: Active Institutional Context & Recent Timeline */}
        <div className="overview-context-card">
          <div className="card-section-header">
            <div className="header-text-group">
              <h3>System Architecture Status</h3>
              <p>Relational schema and database objects</p>
            </div>
            <span className="status-pill status-pill-success">● Verified</span>
          </div>

          <div className="arch-spec-list">
            <div className="arch-row">
              <span className="arch-label">Primary View</span>
              <span className="arch-code font-mono">v_student_enrollment_summary</span>
            </div>
            <div className="arch-row">
              <span className="arch-label">Stored Procedure</span>
              <span className="arch-code font-mono">sp_calculate_term_yield_rate</span>
            </div>
            <div className="arch-row">
              <span className="arch-label">Active Institution</span>
              <span className="arch-val">Columbia University (CU)</span>
            </div>
            <div className="arch-row">
              <span className="arch-label">Academic Term</span>
              <span className="arch-val font-mono">Fall 2026 (2026FA)</span>
            </div>
            <div className="arch-row">
              <span className="arch-label">Security Protocol</span>
              <span className="arch-val">Supabase Bearer JWT + OAuth 2.0</span>
            </div>
          </div>

          <div className="quick-help-card">
            <div className="help-icon">
              <AlertCircle size={18} />
            </div>
            <div className="help-text">
              <strong>Need to update your operator details?</strong>
              <p>Visit the Profile page to change your display name or manage department assignments.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
