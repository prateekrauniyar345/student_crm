import React from "react";
import {
  Sparkles,
  Users,
  TrendingUp,
  ClipboardList,
  BarChart3,
  ArrowRight,
  Database,
  Code,
  Shield,
  Layers,
} from "lucide-react";
import "./ComingSoonView.css";

const comingSoonMeta = {
  students: {
    title: "Student Roster & Degree Audits",
    tagline: "Comprehensive Non-Traditional Student Directory",
    icon: Users,
    schemaObject: "public.people + public.student_profiles",
    description:
      "A complete roster for non-traditional, military veteran, and transfer student profiles with GPA tracking, credit auditing, and cohort segmentation.",
    features: [
      "Dynamic filtering by Transfer, Veteran, and First-Gen tags",
      "Full academic term history and credit progress audits",
      "One-click deep-dive into interaction timeline and advisor notes",
      "CSV & institutional data export for degree clearance",
    ],
  },
  admissions: {
    title: "Admissions Funnel & Yield Analytics",
    tagline: "Stage Conversion & Predictive Yield Engine",
    icon: TrendingUp,
    schemaObject: "v_admissions_funnel + sp_calculate_yield",
    description:
      "Interactive applicant progression analytics tracking prospects through started, submitted, under_review, admitted, and committed stages.",
    features: [
      "Real-time commit rate and yield percentage calculations",
      "Year-over-year application volume comparison",
      "Transfer institution type breakdown (Community College vs 4-Year)",
      "Provisional admission material tracking (Decision Code AP)",
    ],
  },
  advising: {
    title: "Advising Interactions & Task Management",
    tagline: "Unified Student Activity & Follow-Up System",
    icon: ClipboardList,
    schemaObject: "public.interactions + public.tasks",
    description:
      "Streamlined communication logging (email, phone, meeting, advising) with assigned staff follow-ups, priorities, and due dates.",
    features: [
      "Chronological interaction stream with inbound/outbound indicators",
      "Task assignment with priority badges (Low, Medium, High, Urgent)",
      "Automated alerts for students with academic warning or probation",
      "Direct email and advising appointment sync",
    ],
  },
  "ai-copilot": {
    title: "AI SQL Co-Pilot (Text-to-SQL)",
    tagline: "Natural Language Analytics with Strict Read-Only Guardrails",
    icon: Sparkles,
    schemaObject: "SELECT only • AST Mutation Filter Active",
    description:
      "Ask complex institutional questions in plain English (e.g. 'Show Fall 2026 computer science applicants with GPA over 3.5') and get instant SQL results.",
    features: [
      "Strict read-only AST parser disallowing UPDATE/DELETE/DROP",
      "Direct visualization generator (Bar, Line, Funnel, Matrix)",
      "One-click SQL query inspection and parameter tuning",
      "FERPA-compliant synthetic testing dataset integration",
    ],
  },
  reports: {
    title: "Routine Reports & Degree Audits",
    tagline: "Pre-Built SQL Views & Custom Export Engine",
    icon: BarChart3,
    schemaObject: "v_student_reporting + v_applicant_reporting",
    description:
      "Scheduled and ad-hoc report generation powered by optimized PostgreSQL views and cohort definitions.",
    features: [
      "Pre-aggregated institutional KPI summaries",
      "Degree audit clearance and GPA distribution tables",
      "Automated weekly email digests to academic deans",
      "Export directly to Excel, CSV, or institutional data warehouse",
    ],
  },
};

export default function ComingSoonView({ tabId, setActiveTab }) {
  const info = comingSoonMeta[tabId] || {
    title: "Module In Development",
    tagline: "Columbia GS Student CRM Feature",
    icon: Layers,
    schemaObject: "PostgreSQL 15+ Schema",
    description: "This module is currently being built in accordance with the project design strategy.",
    features: [
      "Relational PostgreSQL schema integration",
      "Full RBAC role protection",
      "FERPA compliance auditing",
    ],
  };

  const Icon = info.icon;

  return (
    <div className="coming-soon-view">
      <div className="coming-soon-card">
        <div className="cs-badge-row">
          <span className="status-pill status-pill-info">
            <Sparkles size={12} />
            <span>Next Release Phase</span>
          </span>
          <span className="cs-schema font-mono">
            <Database size={12} />
            <span>{info.schemaObject}</span>
          </span>
        </div>

        <div className="cs-icon-circle">
          <Icon size={40} />
        </div>

        <h2>{info.title}</h2>
        <p className="cs-tagline">{info.tagline}</p>
        <p className="cs-description">{info.description}</p>

        <div className="cs-features-box">
          <h3>Planned Core Capabilities</h3>
          <ul>
            {info.features.map((feat, idx) => (
              <li key={idx}>
                <span className="bullet-dot">●</span>
                <span>{feat}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="cs-actions">
          <button className="btn-cs-primary" onClick={() => setActiveTab("overview")}>
            <span>Return to Workspace Overview</span>
            <ArrowRight size={16} />
          </button>
          <button className="btn-cs-secondary" onClick={() => setActiveTab("admin")}>
            <span>Manage Staff & Access in Admin Portal</span>
          </button>
        </div>
      </div>
    </div>
  );
}
