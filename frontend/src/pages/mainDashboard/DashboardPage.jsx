import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import AuthService from "../../services/AuthService";
import DashboardSidebar from "../../components/mainDashboard/components/DashboardSidebar";
import DashboardTopNav from "../../components/mainDashboard/components/DashboardTopNav";
import OverviewView from "../../components/mainDashboard/views/OverviewView";
import ProfileView from "../../components/mainDashboard/views/ProfileView";
import AdminOverviewView from "../../components/mainDashboard/views/AdminOverviewView";
import AdminUsersView from "../../components/mainDashboard/views/AdminUsersView";
import AdminProgramsTermsView from "../../components/mainDashboard/views/AdminProgramsTermsView";
import SettingsView from "../../components/mainDashboard/views/SettingsView";
import ComingSoonView from "../../components/mainDashboard/views/ComingSoonView";
import "./DashboardPage.css";
import { useCurrentUser } from "../../hooks/useCurrentUser";
import { Spinner } from "react-bootstrap";

export default function DashboardPage() {
  const { data: currentUser, isLoading, isPending } = useCurrentUser();
  
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("overview");
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Sync document title with active view
  useEffect(() => {
    const tabTitles = {
      overview: "Workspace Overview | GS Student CRM",
      students: "Student Roster | GS Student CRM",
      admissions: "Admissions & Yield | GS Student CRM",
      advising: "Advising & Tasks | GS Student CRM",
      "ai-copilot": "AI SQL Co-Pilot | GS Student CRM",
      reports: "Reports & Audits | GS Student CRM",
      admin: "Admin Overview | GS Student CRM",
      "admin-overview": "Admin Overview | GS Student CRM",
      "admin-users": "Staff & User Management | GS Student CRM",
      "admin-programs-terms": "Programs & Terms | GS Student CRM",
      profile: "My Profile | GS Student CRM",
      settings: "System Settings | GS Student CRM",
    };
    document.title = tabTitles[activeTab] || "Dashboard | GS Student CRM";
  }, [activeTab]);

  const handleSignOut = async () => {
    try {
      await AuthService.signOut();
      navigate("/login");
    } catch (err) {
      console.error("Error signing out:", err);
      navigate("/login");
    }
  };

  const renderActiveView = () => {
    switch (activeTab) {
      case "overview":
        return <OverviewView user={currentUser} setActiveTab={setActiveTab} />;
      case "profile":
        return <ProfileView currentUser={currentUser} />;
      case "admin":
      case "admin-overview":
        return (
          <AdminOverviewView
            currentUser={currentUser}
            setActiveTab={setActiveTab}
          />
        );
      case "admin-users":
        return <AdminUsersView currentUser={currentUser} />;
      case "admin-programs-terms":
        return <AdminProgramsTermsView currentUser={currentUser} />;
      case "settings":
        return <SettingsView />;
      case "students":
      case "admissions":
      case "advising":
      case "ai-copilot":
      case "reports":
      default:
        return <ComingSoonView tabId={activeTab} setActiveTab={setActiveTab} />;
    }
  };

  if (isLoading || isPending) {
    return (
      <div className="initial-loading-container">
        <Spinner animation="border" variant="primary" />
        <p>Preparing Dashboard...</p>
      </div>
    );
  }

  return (
    <div className={`dashboard-layout ${isMobileOpen ? "mobile-open" : ""}`}>
      {/* Collapsible Sidebar */}
      <DashboardSidebar
        activeTab={activeTab}
        setActiveTab={(tab) => {
          setActiveTab(tab);
          setIsMobileOpen(false);
        }}
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
        user={currentUser}
        onSignOut={handleSignOut}
      />

      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          className="sidebar-mobile-backdrop"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Main Content Area */}
      <div className="dashboard-main-container">
        {/* Top Navbar */}
        <DashboardTopNav
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          user={currentUser}
          onSignOut={handleSignOut}
          onToggleSidebar={() => setIsMobileOpen(!isMobileOpen)}
        />

        {/* Dynamic Tab Body */}
        <main className="dashboard-content-body">
          <div className="dashboard-content-wrapper">{renderActiveView()}</div>
        </main>
      </div>
    </div>
  );
}
