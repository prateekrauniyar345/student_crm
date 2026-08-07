import { CheckCircle, ArrowRight } from "lucide-react";
import "./CTASection.css";

export default function CTASection() {
  return (
    <section className="cta-section">
      <div className="cta-container">
        <div className="cta-content">
          <h2>Ready to Transform Your Data Strategy?</h2>
          <p>
            Join thousands of institutions using intelligent analytics to drive 
            better outcomes for students. Start exploring your data today.
          </p>

          <div className="cta-benefits">
            <div className="benefit-item">
              <CheckCircle size={20} />
              <span>No technical expertise required</span>
            </div>
            <div className="benefit-item">
              <CheckCircle size={20} />
              <span>Instant setup and deployment</span>
            </div>
            <div className="benefit-item">
              <CheckCircle size={20} />
              <span>24/7 AI agent assistance</span>
            </div>
            <div className="benefit-item">
              <CheckCircle size={20} />
              <span>Enterprise-grade security</span>
            </div>
          </div>

          <div className="cta-buttons">
            <button className="btn btn-primary btn-lg">
              Start Your Free Trial
              <ArrowRight size={18} />
            </button>
            <button className="btn btn-link">
              Schedule a Demo →
            </button>
          </div>

          <p className="cta-footer">
            14-day free trial • No credit card required • Full feature access
          </p>
        </div>

        <div className="cta-visual">
          <div className="stats-box">
            <div className="stat">
              <div className="stat-value">500+</div>
              <div className="stat-label">Institutions</div>
            </div>
            <div className="stat">
              <div className="stat-value">10M+</div>
              <div className="stat-label">Student Records</div>
            </div>
            <div className="stat">
              <div className="stat-value">99.9%</div>
              <div className="stat-label">Uptime SLA</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
