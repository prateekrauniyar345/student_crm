import { useState } from "react";
import { Menu, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import "./Header.css";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <header className="header">
      <div className="header-container">
        {/* Logo */}
        <div className="logo">
          <div className="logo-icon">📊</div>
          <span className="logo-text">StudentCRM</span>
        </div>

        {/* Navigation - Desktop */}
        <nav className="nav-desktop">
          <a href="#features" className="nav-link">Features</a>
          <a href="#agents" className="nav-link">AI Agents</a>
          <a href="#cta" className="nav-link">Pricing</a>
          <a href="#" className="nav-link">Docs</a>
        </nav>

        {/* CTA Buttons - Desktop */}
        <div className="header-cta">
          <button
            className="btn-login"
            onClick={() => navigate("/login")}
          >
            Sign In
          </button>
          <button
            className="btn-signup"
            onClick={() => navigate("/login")}
          >
            Get Started
          </button>
        </div>

        {/* Mobile Menu Button */}
        <button
          className="mobile-menu-btn"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <nav className="nav-mobile">
          <a href="#features" className="nav-link" onClick={() => setIsMenuOpen(false)}>Features</a>
          <a href="#agents" className="nav-link" onClick={() => setIsMenuOpen(false)}>AI Agents</a>
          <a href="#cta" className="nav-link" onClick={() => setIsMenuOpen(false)}>Pricing</a>
          <a href="#" className="nav-link" onClick={() => setIsMenuOpen(false)}>Docs</a>
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
            className="btn-signup"
            onClick={() => {
              navigate("/login");
              setIsMenuOpen(false);
            }}
          >
            Get Started
          </button>
        </nav>
      )}
    </header>
  );
}
