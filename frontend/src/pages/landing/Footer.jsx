import { Mail, Code, Users, MessageCircle } from "lucide-react";
import "./Footer.css";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer-container">
        {/* Footer Content */}
        <div className="footer-content">
          {/* Company Info */}
          <div className="footer-section">
            <div className="footer-logo">
              <div className="logo-icon">📊</div>
              <span className="logo-text">StudentCRM</span>
            </div>
            <p className="footer-tagline">
              Intelligent data management for educational institutions.
            </p>
            <div className="social-links">
              <a href="#" className="social-link" title="Email">
                <Mail size={20} />
              </a>
              <a href="#" className="social-link" title="GitHub">
                <Code size={20} />
              </a>
              <a href="#" className="social-link" title="Team">
                <Users size={20} />
              </a>
              <a href="#" className="social-link" title="Contact">
                <MessageCircle size={20} />
              </a>
            </div>
          </div>

          {/* Product Links */}
          <div className="footer-section">
            <h4>Product</h4>
            <ul>
              <li><a href="#features">Features</a></li>
              <li><a href="#agents">AI Agents</a></li>
              <li><a href="#pricing">Pricing</a></li>
              <li><a href="#roadmap">Roadmap</a></li>
              <li><a href="#changelog">Changelog</a></li>
            </ul>
          </div>

          {/* Company Links */}
          <div className="footer-section">
            <h4>Company</h4>
            <ul>
              <li><a href="#about">About</a></li>
              <li><a href="#blog">Blog</a></li>
              <li><a href="#careers">Careers</a></li>
              <li><a href="#press">Press Kit</a></li>
              <li><a href="#contact">Contact</a></li>
            </ul>
          </div>

          {/* Resources Links */}
          <div className="footer-section">
            <h4>Resources</h4>
            <ul>
              <li><a href="#docs">Documentation</a></li>
              <li><a href="#api">API Reference</a></li>
              <li><a href="#help">Help Center</a></li>
              <li><a href="#community">Community</a></li>
              <li><a href="#status">Status Page</a></li>
            </ul>
          </div>

          {/* Legal Links */}
          <div className="footer-section">
            <h4>Legal</h4>
            <ul>
              <li><a href="#privacy">Privacy Policy</a></li>
              <li><a href="#terms">Terms of Service</a></li>
              <li><a href="#security">Security</a></li>
              <li><a href="#compliance">Compliance</a></li>
              <li><a href="#dpa">Data Processing</a></li>
            </ul>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="footer-bottom">
          <p>
            © {currentYear} StudentCRM. All rights reserved.
          </p>
          <div className="footer-links">
            <a href="#privacy">Privacy</a>
            <a href="#terms">Terms</a>
            <a href="#cookies">Cookies</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
