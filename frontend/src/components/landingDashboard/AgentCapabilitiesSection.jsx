import { Sparkles, Target, TrendingUp, Users } from "lucide-react";
import "./AgentCapabilitiesSection.css";

const capabilities = [
  {
    icon: <Sparkles size={32} />,
    title: "Intelligent Query Building",
    description:
      "Ask questions in plain English and let AI agents generate optimized SQL queries automatically.",
    examples: ["Show me students at risk", "Enrollment trends this year", "Course performance analysis"],
  },
  {
    icon: <TrendingUp size={32} />,
    title: "Predictive Analytics",
    description:
      "Identify patterns and predict future outcomes using advanced machine learning models.",
    examples: ["Student success predictions", "Retention risk assessment", "Resource optimization"],
  },
  {
    icon: <Target size={32} />,
    title: "Automated Insights",
    description:
      "Get AI-generated summaries and recommendations without writing a single line of code.",
    examples: ["Key metrics summary", "Anomaly detection", "Trend analysis"],
  },
  {
    icon: <Users size={32} />,
    title: "Collaborative Intelligence",
    description:
      "Work with agents to explore data, test hypotheses, and make informed decisions together.",
    examples: ["Interactive data exploration", "Shared analysis sessions", "Real-time collaboration"],
  },
];

export default function AgentCapabilitiesSection() {
  return (
    <section className="agents-section">
      <div className="agents-container">
        <div className="agents-header">
          <h2>AI Agents That Work for You</h2>
          <p>
            Meet your team of intelligent assistants designed to help educators, 
            analysts, and administrators unlock the full potential of student data.
          </p>
        </div>

        <div className="agents-grid">
          {capabilities.map((capability, index) => (
            <div key={index} className="agent-card">
              <div className="agent-icon">{capability.icon}</div>
              <h3>{capability.title}</h3>
              <p>{capability.description}</p>
              <div className="agent-examples">
                <span className="examples-label">Try asking:</span>
                <ul>
                  {capability.examples.map((example, idx) => (
                    <li key={idx}>
                      <span className="example-dot">•</span>
                      {example}
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
