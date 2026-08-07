import {
  BarChart3,
  Brain,
  MessageSquare,
  FileText,
  Database,
  Zap,
} from "lucide-react";
import "./FeaturesSection.css";

const features = [
  {
    icon: <BarChart3 size={28} />,
    title: "Data Visualization",
    description:
      "Transform raw data into beautiful, interactive visualizations that reveal hidden patterns and trends.",
  },
  {
    icon: <Brain size={28} />,
    title: "AI Agent Assistants",
    description:
      "Leverage intelligent agents to automate complex queries, analyze data, and generate actionable insights.",
  },
  {
    icon: <MessageSquare size={28} />,
    title: "Conversational AI",
    description:
      "Chat naturally with AI agents to retrieve data, execute SQL queries, and generate comprehensive reports.",
  },
  {
    icon: <FileText size={28} />,
    title: "Smart Reports",
    description:
      "Generate professional reports automatically with AI-powered analysis and recommendations.",
  },
  {
    icon: <Database size={28} />,
    title: "Data Management",
    description:
      "Manage student records, institutional data, and custom datasets with powerful tools.",
  },
  {
    icon: <Zap size={28} />,
    title: "Real-time Collaboration",
    description:
      "Work together seamlessly with team members, share insights, and track progress in real time.",
  },
];

export default function FeaturesSection() {
  return (
    <section className="features-section">
      <div className="features-container">
        <div className="features-header">
          <h2>Powerful Features Built for Education</h2>
          <p>
            Everything you need to make data-driven decisions about student success.
          </p>
        </div>

        <div className="features-grid">
          {features.map((feature, index) => (
            <div key={index} className="feature-card">
              <div className="feature-icon">{feature.icon}</div>
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
