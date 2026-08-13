import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import AuthService from "../../services/AuthService";
import DashboardSidebar from "./components/DashboardSidebar";
import DashboardTopNav from "./components/DashboardTopNav";
import OverviewView from "./views/OverviewView";
import ProfileView from "./views/ProfileView";
import AdminView from "./views/AdminView";
import SettingsView from "./views/SettingsView";
import ComingSoonView from "./views/ComingSoonView";
import "./DashboardPage.css";

export default function DashboardPage() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("overview");
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Sync title with active view
  useEffect(() => {
    const tabTitles = {
      overview: "Workspace Overview | GS Student CRM",
      students: "Student Roster | GS Student CRM",
      admissions: "Admissions & Yield | GS Student CRM",
      advising: "Advising & Tasks | GS Student CRM",
      "ai-copilot": "AI SQL Co-Pilot | GS Student CRM",
      reports: "Reports & Audits | GS Student CRM",
      admin: "Admin Management | GS Student CRM",
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
        return <ProfileView user={currentUser} />;
      case "admin":
        return <AdminView currentUser={currentUser} />;
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
