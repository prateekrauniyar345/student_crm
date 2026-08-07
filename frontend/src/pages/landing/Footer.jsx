import { Shield, Database, Lock } from "lucide-react";
import "./Footer.css";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-content">
          {/* Institutional Branding */}
          <div className="footer-section main-section">
            <div className="footer-logo">
              <Shield size={22} className="footer-logo-icon" />
              <span className="logo-tex text-white">GS StudentCRM</span>
            </div>
            <p className="footer-tagline">
              Intelligent enrollment management, advising interaction tracking, and read-only AI SQL co-pilots for higher education institutions.
            </p>
            <div className="system-status-pill">
              <span className="status-dot">●</span>
              <span>PostgreSQL & Supabase Services Operational</span>
            </div>
          </div>

          {/* Core Modules */}
          <div className="footer-section">
            <h4>CRM Modules</h4>
            <ul>
              <li><a href="#overview">Overview & Dashboard</a></li>
              <li><a href="#analytics">Enrollment & Yield Rates</a></li>
              <li><a href="#ai-copilot">AI Text-to-SQL Co-Pilot</a></li>
              <li><a href="#roster-demo">Student Advising Roster</a></li>
              <li><a href="#specifications">System Specifications</a></li>
            </ul>
          </div>

          {/* Database & Architecture */}
          <div className="footer-section">
            <h4>Architecture</h4>
            <ul>
              <li><a href="#schema">PostgreSQL 15+ Schema</a></li>
              <li><a href="#procedures">Stored Procedures (Yield)</a></li>
              <li><a href="#views">v_student_enrollment_summary</a></li>
              <li><a href="#fastapi">FastAPI Python REST API</a></li>
              <li><a href="#langchain">LangChain Agent Tools</a></li>
            </ul>
          </div>

          {/* Data Governance & Compliance */}
          <div className="footer-section">
            <h4>Security & Compliance</h4>
            <ul>
              <li><a href="#privacy">FERPA Compliance Guidelines</a></li>
              <li><a href="#sso">Microsoft Azure SSO</a></li>
              <li><a href="#jwt">Supabase JWT Auth</a></li>
              <li><a href="#rbac">Role-Based Access Control</a></li>
              <li><a href="#terms">Terms & Privacy Policy</a></li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="footer-bottom">
          <p>© {currentYear} GS StudentCRM Platform. Built for Higher Education Analytics.</p>
          <div className="footer-meta-links">
            <span className="meta-item"><Database size={13} /> PostgreSQL Schema v0.1.0</span>
            <span className="meta-item"><Lock size={13} /> OAuth 2.0 / Bearer JWT Protected</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

