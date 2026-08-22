import React, { useState, useEffect } from "react";
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
  ChevronDown,
  LogOut,
  Shield,
  GraduationCap,
  Calendar,
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
        description: "Manage CRM user accounts, degree programs, and academic terms",
        children: [
          {
            id: "admin-overview",
            label: "Overview",
            icon: LayoutDashboard,
            description: "Admin overview, quick metrics across users, programs, terms",
          },
          {
            id: "admin-users",
            label: "Users & Roles",
            icon: Users,
            description: "Manage CRM user accounts, institution memberships & roles",
          },
          {
            id: "admin-programs-terms",
            label: "Programs & Terms",
            icon: GraduationCap,
            description: "Manage academic programs, degree levels, and academic term calendars",
          },
        ],
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
  // Track open dropdowns
  const [openDropdowns, setOpenDropdowns] = useState({
    admin: true,
  });

  // Automatically keep admin dropdown open if an admin sub-tab is active
  useEffect(() => {
    if (
      activeTab === "admin" ||
      activeTab === "admin-overview" ||
      activeTab === "admin-users" ||
      activeTab === "admin-programs-terms"
    ) {
      setOpenDropdowns((prev) => ({ ...prev, admin: true }));
    }
  }, [activeTab]);

  const toggleDropdown = (parentId, defaultChildId) => {
    if (isCollapsed) {
      setIsCollapsed(false);
      setOpenDropdowns((prev) => ({ ...prev, [parentId]: true }));
      if (defaultChildId) {
        setActiveTab(defaultChildId);
      }
      return;
    }

    setOpenDropdowns((prev) => ({
      ...prev,
      [parentId]: !prev[parentId],
    }));
  };

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
                const hasChildren = Boolean(item.children && item.children.length > 0);
                const isChildActive =
                  hasChildren &&
                  item.children.some((child) => child.id === activeTab);
                const isParentActive = activeTab === item.id || isChildActive;
                const isDropdownOpen = Boolean(openDropdowns[item.id]);

                return (
                  <li key={item.id} className="nav-list-item">
                    {/* Main Nav Button */}
                    <button
                      className={`nav-item-btn ${
                        isParentActive ? "active" : ""
                      } ${hasChildren ? "has-dropdown" : ""}`}
                      onClick={() => {
                        if (hasChildren) {
                          toggleDropdown(item.id, item.children[0].id);
                          if (!isChildActive && !isCollapsed) {
                            setActiveTab(item.children[0].id);
                          }
                        } else {
                          setActiveTab(item.id);
                        }
                      }}
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

                      {!isCollapsed && hasChildren && (
                        <span
                          className={`nav-chevron-icon ${
                            isDropdownOpen ? "expanded" : ""
                          }`}
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleDropdown(item.id);
                          }}
                        >
                          <ChevronDown size={14} />
                        </span>
                      )}
                    </button>

                    {/* Submenu Dropdown Items */}
                    {!isCollapsed && hasChildren && isDropdownOpen && (
                      <ul className="nav-sub-list">
                        {item.children.map((child) => {
                          const ChildIcon = child.icon;
                          const isCurrentChildActive = activeTab === child.id;

                          return (
                            <li key={child.id}>
                              <button
                                className={`nav-sub-item-btn ${
                                  isCurrentChildActive ? "active" : ""
                                }`}
                                onClick={() => setActiveTab(child.id)}
                              >
                                <span className="nav-sub-icon-box">
                                  <ChildIcon size={15} />
                                </span>
                                <span className="nav-sub-item-label">
                                  {child.label}
                                </span>
                              </button>
                            </li>
                          );
                        })}
                      </ul>
                    )}
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
