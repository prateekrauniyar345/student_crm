import { Terminal, Shield, BarChart, SaveCheck } from "lucide-react";
import "./AgentCapabilitiesSection.css";

const agentSteps = [
  {
    step: "01",
    icon: <Terminal size={20} />,
    title: "Natural Language Ingestion",
    description:
      "Advisors and analysts ask complex questions in plain English without requiring manual SQL writing.",
    examples: [
      '"Show enrollment yield rate for transfer students in Fall 2025"',
      '"List students with unreviewed credit evaluations"',
    ],
  },
  {
    step: "02",
    icon: <Shield size={20} />,
    title: "Read-Only SQL Validation",
    description:
      "The agent translates the prompt into strict SELECT statements. Write, UPDATE, or DROP operations are automatically blocked.",
    examples: [
      "Parameterized query execution against Postgres schema",
      "Enforced row-level security & user permissions",
    ],
  },
  {
    step: "03",
    icon: <BarChart size={20} />,
    title: "Data Aggregation & Visuals",
    description:
      "Query results are returned instantly in structured JSON tables, summary stats, or chart render configurations.",
    examples: [
      "Sub-20ms database response times",
      "Instant breakdown by student type and status",
    ],
  },
  {
    step: "04",
    icon: <SaveCheck size={20} />,
    title: "Routine Report Archiving",
    description:
      "Save ad-hoc query outputs directly to the institutional canvas as permanent routine reports for recurring compliance audits.",
    examples: [
      "Direct mapping to institutional report needs",
      "One-click CSV/PDF data export",
    ],
  },
];

export default function AgentCapabilitiesSection() {
  return (
    <section className="agents-section" id="ai-copilot">
      <div className="agents-container">
        <div className="agents-header">
          <div className="section-kicker">Agentic AI Architecture</div>
          <h2>AI Co-Pilot Workflow: Natural Language to SQL</h2>
          <p>
            Eliminate manual reporting bottlenecks. Enable non-technical staff to perform deep ad-hoc analysis securely.
          </p>
        </div>

        <div className="agents-grid">
          {agentSteps.map((item, index) => (
            <div key={index} className="agent-card">
              <div className="agent-card-header">
                <div className="step-badge">{item.step}</div>
                <div className="agent-icon">{item.icon}</div>
              </div>

              <h3>{item.title}</h3>
              <p>{item.description}</p>

              <div className="agent-examples">
                <span className="examples-label">Execution Details:</span>
                <ul>
                  {item.examples.map((example, idx) => (
                    <li key={idx}>
                      <span className="example-bullet">•</span>
                      <span>{example}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

