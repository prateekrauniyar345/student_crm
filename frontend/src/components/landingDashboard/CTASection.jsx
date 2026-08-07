import { CheckCircle2, ArrowRight, ShieldCheck, Database, Code, Key } from "lucide-react";
import { useNavigate } from "react-router-dom";
import "./CTASection.css";

export default function CTASection() {
  const navigate = useNavigate();

  return (
    <section className="cta-section" id="specifications">
      <div className="cta-container">
        <div className="cta-content">
          <div className="section-kicker">Enterprise Ready</div>
          <h2>Ready to Launch Your Student CRM & Analytics Workspace?</h2>
          <p>
            Connect directly with Microsoft Azure SSO or Supabase Auth to begin querying student records, tracking cohort yield rates, and managing advisor interactions.
          </p>

          <div className="cta-benefits">
            <div className="benefit-item">
              <CheckCircle2 size={18} className="benefit-icon" />
              <span>PostgreSQL Relational Schema with Stored Procedures</span>
            </div>
            <div className="benefit-item">
              <CheckCircle2 size={18} className="benefit-icon" />
              <span>Natural Language AI SQL Agent with Read-Only Guards</span>
            </div>
            <div className="benefit-item">
              <CheckCircle2 size={18} className="benefit-icon" />
              <span>Microsoft Azure SSO & Supabase Bearer JWT Security</span>
            </div>
            <div className="benefit-item">
              <CheckCircle2 size={18} className="benefit-icon" />
              <span>FERPA-Compliant Data Governance & Role-Based Control</span>
            </div>
          </div>

          <div className="cta-buttons">
            <button
              className="btn-cta-primary"
              onClick={() => navigate("/login")}
            >
              <span>Sign In to Workspace</span>
              <ArrowRight size={16} />
            </button>
            <button
              className="btn-cta-secondary"
              onClick={() => navigate("/login")}
            >
              <span>Authenticate with SSO</span>
            </button>
          </div>
        </div>

        {/* System Architecture Specifications */}
        <div className="cta-visual">
          <div className="spec-card">
            <div className="spec-card-header">
              <ShieldCheck size={16} className="spec-shield" />
              <span>System Technical Specifications</span>
            </div>

            <div className="spec-grid">
              <div className="spec-item">
                <div className="spec-icon-box">
                  <Database size={16} />
                </div>
                <div className="spec-details">
                  <span className="spec-title">Relational Database</span>
                  <span className="spec-value">PostgreSQL 15+ (Supabase)</span>
                </div>
              </div>

              <div className="spec-item">
                <div className="spec-icon-box">
                  <Code size={16} />
                </div>
                <div className="spec-details">
                  <span className="spec-title">Backend REST Engine</span>
                  <span className="spec-value">Python 3.11 + FastAPI</span>
                </div>
              </div>

              <div className="spec-item">
                <div className="spec-icon-box">
                  <Key size={16} />
                </div>
                <div className="spec-details">
                  <span className="spec-title">Authentication Protocol</span>
                  <span className="spec-value">Supabase Auth & OAuth 2.0</span>
                </div>
              </div>
            </div>

            <div className="spec-footer font-mono">
              Schema version: v0.1.0 • API Prefix: /api/v1
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

