import {
  TrendingUp,
  Brain,
  FileSpreadsheet,
  Database,
  ShieldCheck,
  ClipboardList,
} from "lucide-react";
import "./FeaturesSection.css";

const crmFeatures = [
  {
    icon: <TrendingUp size={22} />,
    tag: "PostgreSQL Stored Procedure",
    title: "Enrollment & Term Yield Analytics",
    description:
      "Calculate admissions yield rates automatically across student cohorts (Transfer, Veteran, First-Gen, International) with built-in database stored procedures.",
  },
  {
    icon: <Brain size={22} />,
    tag: "LangChain SQL Agent",
    title: "AI Text-to-SQL Co-Pilot",
    description:
      "Allow advisors and analysts to ask complex data questions in plain English. The agent translates inquiries into validated, read-only SELECT queries.",
  },
  {
    icon: <ClipboardList size={22} />,
    tag: "Student Lifecycle",
    title: "Advising & Interaction Logging",
    description:
      "Maintain a 360-degree timeline of 1-on-1 advisor interactions, credit evaluations, degree milestone audits, and follow-up flags.",
  },
  {
    icon: <Database size={22} />,
    tag: "Postgres Relational Core",
    title: "Summary Views & Schema Governance",
    description:
      "Leverage optimized views like v_student_enrollment_summary with citext email indexing, pgcrypto UUID keys, and strict relational integrity.",
  },
  {
    icon: <ShieldCheck size={22} />,
    tag: "Supabase OAuth & JWT",
    title: "Role-Based Access Control (RBAC)",
    description:
      "Enforce granular permissions for Admins, Analysts, Advisors, Faculty, and Viewers. All API endpoints validate Supabase JWT bearer tokens.",
  },
  {
    icon: <FileSpreadsheet size={22} />,
    tag: "Ad-Hoc to Routine Reports",
    title: "Saved Report Canvas",
    description:
      "Save ad-hoc AI query results into persistent routine reports. Export data tables or charts instantly for institutional reporting compliance.",
  },
];

export default function FeaturesSection() {
  const topFeatures = crmFeatures.slice(0, 4);
  const bottomFeatures = crmFeatures.slice(4);

  return (
    <section className="features-section" id="analytics">
      <div className="features-container">
        <div className="features-header">
          <div className="section-kicker">Core System Architecture</div>
          <h2>Purpose-Built for Higher Ed Enrollment Analytics</h2>
          <p>
            Combining modern relational database design with secure AI co-pilots for student management and enrollment analytics.
          </p>
        </div>

        <div className="features-grid-container">
          {/* Top Row: 4 Cards */}
          <div className="features-grid-top">
            {topFeatures.map((feature, index) => (
              <div key={index} className="feature-card">
                <div className="card-top-row">
                  <div className="feature-icon">{feature.icon}</div>
                  <span className="status-pill status-pill-warning">{feature.tag}</span>
                </div>
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
              </div>
            ))}
          </div>

          {/* Bottom Row: 2 Cards Centered Horizontally */}
          <div className="features-grid-bottom">
            {bottomFeatures.map((feature, index) => (
              <div key={index} className="feature-card">
                <div className="card-top-row">
                  <div className="feature-icon">{feature.icon}</div>
                  <span className="status-pill status-pill-warning">{feature.tag}</span>
                </div>
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}


