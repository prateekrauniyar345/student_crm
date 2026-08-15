import HeroSection from "../../components/landingDashboard/HeroSection";
import FeaturesSection from "../../components/landingDashboard/FeaturesSection";
import AgentCapabilitiesSection from "../../components/landingDashboard/AgentCapabilitiesSection";
import LiveRosterSection from "../../components/landingDashboard/LiveRosterSection";
import CTASection from "../../components/landingDashboard/CTASection";
import Header from "../../components/landingDashboard/Header";
import Footer from "../../components/landingDashboard/Footer";
import "./LandingPage.css";

export default function LandingPage() {
  return (
    <div className="landing-page">
      <Header />

      <main className="landing-main">
        <HeroSection />
        <FeaturesSection />
        <AgentCapabilitiesSection />
        <LiveRosterSection />
        <CTASection />
      </main>

      <Footer />
    </div>
  );
}

