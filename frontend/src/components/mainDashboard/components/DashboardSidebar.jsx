import React from "react";
import {
  LayoutDashboard,
  Users,
  TrendingUp,
  ClipboardList,
  Sparkles,
  BarChart3,
  ShieldCheck,
  UserCheck,
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Shield,
  ExternalLink,
} from "lucide-react";
import "./DashboardSidebar.css";
import { rolePillsStatusStyle } from "../../../utils/styleGuide";

export const navigationItems = [
  {
    group: "CORE CRM & ANALYTICS",
    items: [
      {
        id: "overview",
        label: "Overview",
        icon: LayoutDashboard,
        badge: null,
        description: "Dashboard KPIs, quick metrics, and workspace overview",
      },
      {
        id: "students",
        label: "Student Roster",
        icon: Users,
        badge: null,
        description: "Non-traditional student directory, credit audits, and cohort filters",
      },
      {
        id: "admissions",
        label: "Admissions & Yield",
        icon: TrendingUp,
        badge: "sp_yield",
        description: "Applicant conversion, stage funnel & stored procedure calculations",
      },
      {
        id: "advising",
        label: "Advising & Tasks",
        icon: ClipboardList,
        badge: null,
        description: "Interaction history timeline, call logger & task queue",
      },
      {
        id: "ai-copilot",
        label: "AI SQL Co-Pilot",
        icon: Sparkles,
        badge: "AI Agent",
        description: "Natural language query runner with read-only SQL validation",
      },
      {
        id: "reports",
        label: "Reports & Audits",
        icon: BarChart3,
        badge: null,
        description: "v_student_enrollment_summary reports and custom exports",
      },
    ],
  },
  {
    group: "SYSTEM & ACCOUNT",
    items: [
      {
        id: "admin",
        label: "Admin Portal",
        icon: ShieldCheck,
        badge: "Admin",
        description: "Manage CRM user accounts, institution memberships & roles",
      },
      {
        id: "profile",
        label: "My Profile",
        icon: UserCheck,
        badge: null,
        description: "User details, role assignments, and profile editing",
      },
      {
        id: "settings",
        label: "Settings",
        icon: Settings,
        badge: null,
        description: "Institution configurations, timezone, and security parameters",
      },
    ],
  },
];

export default function DashboardSidebar({
  activeTab,
  setActiveTab,
  isCollapsed,
  setIsCollapsed,
  user,
  onSignOut,
}) {
  const getInitials = (name, email) => {
    if (name && name.trim()) {
      const parts = name.trim().split(" ");
      if (parts.length >= 2) {
        return (parts[0][0] + parts[1][0]).toUpperCase();
      }
      return parts[0].slice(0, 2).toUpperCase();
    }
    if (email) {
      return email.slice(0, 2).toUpperCase();
    }
    return "GS";
  };

  return (
    <aside className={`dashboard-sidebar ${isCollapsed ? "collapsed" : ""}`}>
      {/* Sidebar Header / Brand */}
      <div className="sidebar-brand-wrapper">
        <div className="sidebar-brand" onClick={() => setActiveTab("overview")}>
          <div className="brand-logo-shield">
            <Shield size={20} />
          </div>
          {!isCollapsed && (
            <div className="brand-text-block">
              <span className="brand-title">GS StudentCRM</span>
              <span className="brand-subtitle">Enrollment Analytics</span>
            </div>
          )}
        </div>

        <button
          className="btn-collapse-toggle"
          onClick={() => setIsCollapsed(!isCollapsed)}
          title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          aria-label="Toggle Sidebar Collapse"
        >
          {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>

      {/* Navigation Group Items */}
      <nav className="sidebar-nav">
        {navigationItems.map((group, groupIdx) => (
          <div key={groupIdx} className="nav-group">
            {!isCollapsed && <span className="nav-group-title">{group.group}</span>}
            <ul className="nav-list">
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <li key={item.id}>
                    <button
                      className={`nav-item-btn ${isActive ? "active" : ""}`}
                      onClick={() => setActiveTab(item.id)}
                      title={isCollapsed ? item.label : undefined}
                    >
                      <span className="nav-icon-box">
                        <Icon size={18} />
                      </span>
                      {!isCollapsed && (
                        <span className="nav-item-label">{item.label}</span>
                      )}
                      {!isCollapsed && item.badge && (
                        <span
                          className={`nav-badge ${
                            item.badge === "Admin"
                              ? `status-pill ${rolePillsStatusStyle["Admin"]}`
                              : item.badge === "AI Agent"
                              ? "badge-ai"
                              : "badge-tag"
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* Sidebar Footer User Info */}
      <div className="sidebar-footer">
        <div
          className="user-profile-summary"
          onClick={() => setActiveTab("profile")}
          title={isCollapsed ? user?.email || "My Profile" : undefined}
        >
          <div className="user-avatar">
            {getInitials(user?.full_name, user?.email)}
          </div>
          {!isCollapsed && (
            <div className="user-info-text">
              <span className="user-display-name">
                {user?.full_name || user?.email?.split("@")[0] || "Staff Member"}
              </span>
              <span className="user-email-text" title={user?.email}>
                {user?.email || "advising@columbia.edu"}
              </span>
            </div>
          )}
        </div>

        <button
          className="btn-sidebar-signout"
          onClick={onSignOut}
          title="Sign out of CRM session"
        >
          <LogOut size={16} />
          {!isCollapsed && <span>Sign Out</span>}
        </button>
      </div>
    </aside>
  );
}
