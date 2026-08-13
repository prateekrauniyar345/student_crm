import { useState } from "react";
import { Menu, X, Shield, ChevronRight, UserCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";
import "./Header.css";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <header className="header">
      <div className="header-container">
        {/* Logo & Institution Tag */}
        <div className="logo-group" onClick={() => navigate("/")}>
          <div className="logo-icon-box">
            <Shield size={20} className="logo-icon" />
          </div>
          <div className="logo-titles">
            <span className="logo-text">GS StudentCRM</span>
            <span className="logo-subtext">Enrollment Analytics With AI</span>
          </div>
        </div>

        {/* Navigation - Desktop */}
        <nav className="nav-desktop">
          <a href="#overview" className="nav-link">Overview</a>
          <a href="#analytics" className="nav-link">Student Analytics</a>
          <a href="#ai-copilot" className="nav-link">AI Co-Pilot</a>
          <a href="#roster-demo" className="nav-link">Live Roster Demo</a>
          <a href="#specifications" className="nav-link">Architecture</a>
        </nav>

        {/* CTA Buttons - Desktop */}
        <div className="header-cta">
          <button
            className="btn-login"
            onClick={() => navigate("/login")}
          >
            <UserCheck size={16} />
            <span>Sign In</span>
          </button>
          <button
            className="btn-primary-action"
            onClick={() => navigate("/login")}
          >
            <span>Launch CRM Workspace</span>
            <ChevronRight size={16} />
          </button>
        </div>

        {/* Mobile Menu Button */}
        <button
          className="mobile-menu-btn"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Toggle Navigation Menu"
        >
          {isMenuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile Navigation Drawer */}
      {isMenuOpen && (
        <nav className="nav-mobile">
          <a href="#overview" className="nav-link" onClick={() => setIsMenuOpen(false)}>Overview</a>
          <a href="#analytics" className="nav-link" onClick={() => setIsMenuOpen(false)}>Student Analytics</a>
          <a href="#ai-copilot" className="nav-link" onClick={() => setIsMenuOpen(false)}>AI Co-Pilot</a>
          <a href="#roster-demo" className="nav-link" onClick={() => setIsMenuOpen(false)}>Live Roster Demo</a>
          <a href="#specifications" className="nav-link" onClick={() => setIsMenuOpen(false)}>Architecture</a>
          <div className="mobile-cta-group">
            <button
              className="btn-login"
              onClick={() => {
                navigate("/login");
                setIsMenuOpen(false);
              }}
            >
              Sign In
            </button>
            <button
              className="btn-primary-action"
              onClick={() => {
                navigate("/login");
                setIsMenuOpen(false);
              }}
            >
              Launch CRM Workspace
            </button>
          </div>
        </nav>
      )}
    </header>
  );
}

