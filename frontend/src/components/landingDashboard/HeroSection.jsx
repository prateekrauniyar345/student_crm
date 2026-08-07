import { useState } from "react";
import { ArrowRight, BarChart3, Database, Sparkles, CheckCircle2, ShieldCheck, Search, Terminal, Users, UserCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";
import "./HeroSection.css";

export default function HeroSection() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("yield");
  const [demoQuery, setDemoQuery] = useState("Show transfer student yield rate by term for Fall 2025");

  return (
    <section className="hero-section" id="overview">
      <div className="hero-container">
        {/* Left Column: Text & CTAs */}
        <div className="hero-content">
          <div className="hero-badge">
            <ShieldCheck size={16} className="badge-shield" />
            <span className="badge-text">Columbia GS Standard • PostgreSQL & AI Co-Pilot</span>
          </div>

          <h1 className="hero-title">
            Intelligent Student CRM & Enrollment Analytics
          </h1>

          <p className="hero-subtitle">
            Engineered specifically for non-traditional student tracking, admissions yield calculations, and advising workflows. Query complex PostgreSQL schemas using natural language AI agents.
          </p>

          <div className="hero-key-points">
            <div className="key-point">
              <CheckCircle2 size={16} className="point-icon" />
              <span>Ad-Hoc Reporting via Read-Only Text-to-SQL</span>
            </div>
            <div className="key-point">
              <CheckCircle2 size={16} className="point-icon" />
              <span>Automated Term Yield & Transfer Credit Metrics</span>
            </div>
            <div className="key-point">
              <CheckCircle2 size={16} className="point-icon" />
              <span>Supabase OAuth & Role-Based Authorization</span>
            </div>
          </div>

          <div className="hero-cta-group">
            <button
              className="btn-hero-primary"
              onClick={() => navigate("/login")}
            >
              <span>Sign In to CRM Workspace</span>
              <ArrowRight size={16} />
            </button>
            <a href="#roster-demo" className="btn-hero-secondary">
              <span>View Roster Preview</span>
            </a>
          </div>

          {/* Quick Metrics Bar */}
          <div className="hero-metrics-bar">
            <div className="metric-item">
              <span className="metric-value">4,820</span>
              <span className="metric-label">Applicants Tracked</span>
            </div>
            <div className="metric-divider"></div>
            <div className="metric-item">
              <span className="metric-value">64.2%</span>
              <span className="metric-label">Term Yield Rate</span>
            </div>
            <div className="metric-divider"></div>
            <div className="metric-item">
              <span className="metric-value">12ms</span>
              <span className="metric-label">SQL Execution</span>
            </div>
          </div>
        </div>

        {/* Right Column: Interactive Live CRM Preview Card */}
        <div className="hero-interactive-card">
          {/* Card Top Bar */}
          <div className="card-window-header">
            <div className="window-dots">
              <span className="dot dot-red"></span>
              <span className="dot dot-yellow"></span>
              <span className="dot dot-green"></span>
            </div>
            <div className="window-title">
              <Database size={13} />
              <span>student_crm.public • Live Workspace</span>
            </div>
            <div className="status-pill status-pill-success">
              <span>● Operational</span>
            </div>
          </div>

          {/* Card Navigation Tabs */}
          <div className="card-tabs">
            <button
              className={`card-tab ${activeTab === "yield" ? "active" : ""}`}
              onClick={() => setActiveTab("yield")}
            >
              <BarChart3 size={14} />
              <span>Yield Summary</span>
            </button>
            <button
              className={`card-tab ${activeTab === "ai" ? "active" : ""}`}
              onClick={() => setActiveTab("ai")}
            >
              <Sparkles size={14} />
              <span>AI SQL Co-Pilot</span>
            </button>
            <button
              className={`card-tab ${activeTab === "advising" ? "active" : ""}`}
              onClick={() => setActiveTab("advising")}
            >
              <Users size={14} />
              <span>Advising Queue</span>
            </button>
          </div>

          {/* Tab 1: Yield Summary Content */}
          {activeTab === "yield" && (
            <div className="tab-body">
              <div className="preview-stat-grid gap-2">
                <div className="stat-card">
                  <span className="stat-title">Total Non-Traditional</span>
                  <span className="stat-num">1,420</span>
                  <span className="status-pill status-pill-info">+12% vs last term</span>
                </div>
                <div className="stat-card">
                  <span className="stat-title">Calculated Yield</span>
                  <span className="stat-num">68.4%</span>
                  <span className="status-pill status-pill-success">sp_calculate_yield</span>
                </div>
              </div>

              <div className="distribution-box">
                <div className="box-header">
                  <span className="box-title">Student Cohort Breakdown</span>
                  <span className="box-subtitle">Fall 2025 Active Cohorts</span>
                </div>

                <div className="progress-bar-group">
                  <div className="progress-label-row">
                    <span>Transfer Applicants (42%)</span>
                    <span className="font-mono">596 Students</span>
                  </div>
                  <div className="progress-track">
                    <div className="progress-fill fill-blue" style={{ width: "42%" }}></div>
                  </div>
                </div>

                <div className="progress-bar-group">
                  <div className="progress-label-row">
                    <span>First-Generation (31%)</span>
                    <span className="font-mono">440 Students</span>
                  </div>
                  <div className="progress-track">
                    <div className="progress-fill fill-green" style={{ width: "31%" }}></div>
                  </div>
                </div>

                <div className="progress-bar-group">
                  <div className="progress-label-row">
                    <span>Veterans & Adult Learners (27%)</span>
                    <span className="font-mono">384 Students</span>
                  </div>
                  <div className="progress-track">
                    <div className="progress-fill fill-amber" style={{ width: "27%" }}></div>
                  </div>
                </div>
              </div>

              {/* Full Width 3rd Metric Card */}
              <div className="full-width-metric-card p-3">
                <div className="metric-left">
                  <span className="stat-title">Avg Transfer Credit Evaluation</span>
                  <span className="stat-num-sm">48.5 Approved Credits</span>
                </div>
                <div className="metric-right">
                  <span className="status-pill status-pill-success">94.6% Audit Completion</span>
                  <span className="stat-sub">Degree Milestones Verified</span>
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: AI SQL Co-Pilot */}
          {activeTab === "ai" && (
            <div className="tab-body">
              <div className="query-input-box">
                <div className="query-header">
                  <Terminal size={14} className="terminal-icon" />
                  <span>Natural Language SQL Generator</span>
                </div>
                <div className="input-row">
                  <input
                    type="text"
                    className="query-input"
                    value={demoQuery}
                    onChange={(e) => setDemoQuery(e.target.value)}
                  />
                  <button className="btn-run-query">
                    <Sparkles size={14} />
                    <span>Run Query</span>
                  </button>
                </div>
              </div>

              <div className="sql-code-block">
                <div className="code-header">
                  <span>Generated PostgreSQL Statement</span>
                  <span className="status-pill status-pill-success">SELECT ONLY</span>
                </div>
                <pre className="code-content">
{`SELECT term_applied, student_type, 
       COUNT(id) AS total_applied,
       ROUND(COUNT(CASE WHEN status = 'enrolled' THEN 1 END)::numeric / COUNT(id) * 100, 2) AS yield_rate
FROM student_crm.applications
WHERE student_type = 'Transfer'
GROUP BY term_applied, student_type;`}
                </pre>
              </div>

              <div className="mini-result-table">
                <div className="table-row table-head">
                  <span>Term</span>
                  <span>Cohort</span>
                  <span>Applied</span>
                  <span>Yield Rate</span>
                </div>
                <div className="table-row">
                  <span>Fall 2025</span>
                  <span>Transfer</span>
                  <span className="font-mono">596</span>
                  <span className="status-pill status-pill-success">68.4%</span>
                </div>
                <div className="table-row">
                  <span>Spring 2025</span>
                  <span>Transfer</span>
                  <span className="font-mono">412</span>
                  <span className="status-pill status-pill-info">64.1%</span>
                </div>
              </div>
            </div>
          )}

          {/* Tab 3: Advising Queue */}
          {activeTab === "advising" && (
            <div className="tab-body">
              <div className="search-bar-row">
                <Search size={14} className="search-icon" />
                <input
                  type="text"
                  placeholder="Filter student interactions by name, status, or type..."
                  className="search-input"
                  readOnly
                  value="Filter: Transfer / Action Required"
                />
              </div>

              <div className="queue-list">
                <div className="queue-item">
                  <div className="queue-info">
                    <div className="student-name">
                      <span>Eleanor Vance</span>
                      <span className="status-pill status-pill-warning">Advising Review</span>
                    </div>
                    <div className="student-meta">Transfer • 48 Credits • Applied Fall 2025</div>
                  </div>
                  <button className="btn-action-sm">
                    <UserCheck size={14} />
                    <span>Log Call</span>
                  </button>
                </div>

                <div className="queue-item">
                  <div className="queue-info">
                    <div className="student-name">
                      <span>Marcus Chen</span>
                      <span className="status-pill status-pill-success">Enrolled</span>
                    </div>
                    <div className="student-meta">Veteran • 60 Credits • Degree Audit Verified</div>
                  </div>
                  <button className="btn-action-sm">
                    <span>View Record</span>
                  </button>
                </div>

                <div className="queue-item">
                  <div className="queue-info">
                    <div className="student-name">
                      <span>Sarah Jenkins</span>
                      <span className="status-pill status-pill-info">Admitted</span>
                    </div>
                    <div className="student-meta">First-Gen • 32 Credits • Financial Aid Pending</div>
                  </div>
                  <button className="btn-action-sm">
                    <span>View Record</span>
                  </button>
                </div>

                <div className="queue-item">
                  <div className="queue-info">
                    <div className="student-name">
                      <span>David Rodriguez</span>
                      <span className="status-pill status-pill-warning">Credit Audit</span>
                    </div>
                    <div className="student-meta">International • 42 Credits • Transcript Pending</div>
                  </div>
                  <button className="btn-action-sm">
                    <UserCheck size={14} />
                    <span>Log Call</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Card Footer Banner */}
          <div className="card-footer-banner">
            <span>Schema: <strong className="font-mono">v_student_enrollment_summary</strong></span>
            <span>Security: <strong className="font-mono">PostgreSQL RLS Active</strong></span>
          </div>
        </div>
      </div>
    </section>
  );
}

