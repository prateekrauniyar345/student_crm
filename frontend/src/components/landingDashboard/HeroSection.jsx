import { ArrowRight, BarChart3, Brain, MessageSquare } from "lucide-react";
import "./HeroSection.css";

export default function HeroSection() {
  return (
    <section className="hero-section">
      <div className="hero-container">
        <div className="hero-content">
          <div className="hero-badge">
            <span className="badge-icon">✨</span>
            <span className="badge-text">Powered by Agentic AI</span>
          </div>

          <h1 className="hero-title">
            Intelligent Student Data Management
          </h1>

          <p className="hero-subtitle">
            Unlock deep insights from student data with AI-powered agents. 
            Visualize trends, generate reports, and collaborate seamlessly—all 
            in one unified platform designed for educators, analysts, and 
            administrators.
          </p>

          <div className="hero-features">
            <div className="feature-item">
              <BarChart3 size={20} />
              <span>Interactive Visualizations</span>
            </div>
            <div className="feature-item">
              <Brain size={20} />
              <span>AI Agent Assistants</span>
            </div>
            <div className="feature-item">
              <MessageSquare size={20} />
              <span>Natural Language Chat</span>
            </div>
          </div>

          <div className="hero-cta">
            <button className="btn btn-primary btn-lg">
              Get Started Free
              <ArrowRight size={18} />
            </button>
            <button className="btn btn-secondary btn-lg">
              Watch Demo
            </button>
          </div>

          <p className="hero-note">
            No credit card required. Set up in 5 minutes.
          </p>
        </div>

        <div className="hero-visual">
          <div className="dashboard-mockup">
            <div className="mockup-header">
              <div className="mockup-dot"></div>
              <div className="mockup-dot"></div>
              <div className="mockup-dot"></div>
            </div>
            <div className="mockup-content">
              <div className="mockup-sidebar"></div>
              <div className="mockup-main">
                <div className="mockup-card"></div>
                <div className="mockup-chart"></div>
                <div className="mockup-stats">
                  <div className="mockup-stat"></div>
                  <div className="mockup-stat"></div>
                  <div className="mockup-stat"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
