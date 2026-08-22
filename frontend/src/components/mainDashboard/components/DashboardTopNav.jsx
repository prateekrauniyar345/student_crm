import React, { useState, useRef, useEffect } from "react";
import {
  Search,
  Shield,
  User,
  Bell,
  LogOut,
  ChevronDown,
  Sparkles,
  Database,
  Menu,
  ShieldCheck
} from "lucide-react";
import "./DashboardTopNav.css";
import { useInstitutionById, useMyMemberships } from "../../../hooks/useInstitution";
import { rolePillsStatusStyle } from "../../../utils/styleGuide";

export default function DashboardTopNav({
  activeTab,
  setActiveTab,
  user,
  onSignOut,
  onToggleSidebar,
}) {
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);


  const { data: institutionMembershipData } = useMyMemberships(user?.id);
  const primaryMembership = institutionMembershipData?.[0];

  console.log("Primary Membership in dashboard top nav:", primaryMembership);

  const { data: institutionData } = useInstitutionById(primaryMembership?.institutionId);
  console.log("Institution Data in dashboard top nav:", institutionData);



  useEffect(() =>{
    document.addEventListener("mousedown", handleClickOutside);
    return () =>{
      document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [])


  const handleClickOutside = (event) =>{
    if(dropdownRef.current && !dropdownRef.current.contains(event.target)) {
      setShowDropdown(false);
    }
  }

  const getTabLabel = (id) => {
    switch (id) {
      case "overview":
        return "Workspace Overview";
      case "students":
        return "Student Roster & Profiles";
      case "admissions":
        return "Admissions & Yield Analytics";
      case "advising":
        return "Advising Interactions & Tasks";
      case "ai-copilot":
        return "AI SQL Co-Pilot (Text-to-SQL)";
      case "reports":
        return "Routine Reports & Degree Audits";
      case "admin":
      case "admin-overview":
        return "Admin Portal / Overview";
      case "admin-users":
        return "Admin Portal / Users & Access";
      case "admin-programs-terms":
        return "Admin Portal / Programs & Terms";
      case "profile":
        return "User Profile & Account";
      case "settings":
        return "Institution & System Settings";
      default:
        return "Dashboard";
    }
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
    <header className="dashboard-topnav">
      <div className="topnav-left">
        <button
          className="btn-mobile-sidebar-toggle"
          onClick={onToggleSidebar}
          aria-label="Toggle navigation menu"
        >
          <Menu size={18} />
        </button>

        <div className="breadcrumb-box">
          <span className="breadcrumb-root">CRM Workspace</span>
          <span className="breadcrumb-divider">/</span>
          <span className="breadcrumb-current">{getTabLabel(activeTab)}</span>
        </div>

      </div>

      <div className="topnav-right">
        {/* Quick Search */}
        <div className="topnav-search-box">
          <Search size={14} className="search-icon" />
          <input
            type="text"
            placeholder="Search students, cohorts, reports..."
            className="topnav-search-input"
          />
          <span className="search-kbd">⌘K</span>
        </div>

        {/* Quick Action: AI Co-Pilot Shortcut */}
        <button
          className="btn-quick-ai"
          onClick={() => setActiveTab("ai-copilot")}
          title="Open AI SQL Co-Pilot"
        >
          <Sparkles size={14} />
          <span>AI Co-Pilot</span>
        </button>

        {/* User Dropdown */}
        <div className="user-dropdown-wrapper" ref={dropdownRef}>
          <button
            className="user-menu-trigger"
            onClick={() => setShowDropdown(!showDropdown)}
            aria-expanded={showDropdown}
          >
            <div className="avatar-circle">
              {getInitials(user?.full_name, user?.email)}
            </div>
            <div className="user-meta-col">
              <span className="trigger-user-name">
                {user?.full_name || user?.email?.split("@")[0] || "User"}
              </span>
              <span className="trigger-user-role">{primaryMembership?.role || "Viewer"}</span>
            </div>
            <ChevronDown size={14} className="dropdown-arrow" />
          </button>

          {showDropdown && (
            <div className="topnav-dropdown-menu">
              <div className="topnav-user-header">
                <span className="dd-user-name">{user?.full_name || "Staff Member"}</span>
                <span className="dd-user-email font-mono">{user?.email}</span>
                <span className={`status-pill ${rolePillsStatusStyle[primaryMembership?.role] || "status-pill status-pill-warning"}`}>
                  {primaryMembership?.role === "Admin" && <ShieldCheck size={12} />}
                  <span>{primaryMembership?.role || "Viewer"}</span>
                </span>
              </div>

              <div className="topnav-dropdown-divider"></div>

              <button
                type="button"
                className="topnav-dropdown-item"
                onClick={() => {
                  setActiveTab("profile");
                  setShowDropdown(false);
                }}
              >
                <User size={16} className="dd-item-icon" />
                <span className="dd-item-text">My Profile & Security</span>
              </button>

              <button
                type="button"
                className="topnav-dropdown-item"
                onClick={() => {
                  setActiveTab("admin");
                  setShowDropdown(false);
                }}
              >
                <Database size={16} className="dd-item-icon" />
                <span className="dd-item-text">Admin Management</span>
              </button>

              <div className="topnav-dropdown-divider"></div>

              <button
                type="button"
                className="topnav-dropdown-item text-danger"
                onClick={() => {
                  setShowDropdown(false);
                  onSignOut();
                }}
              >
                <LogOut size={16} className="dd-item-icon" />
                <span className="dd-item-text">Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
