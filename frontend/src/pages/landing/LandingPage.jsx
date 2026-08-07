import HeroSection from "../../components/landingDashboard/HeroSection";
import FeaturesSection from "../../components/landingDashboard/FeaturesSection";
import AgentCapabilitiesSection from "../../components/landingDashboard/AgentCapabilitiesSection";
import CTASection from "../../components/landingDashboard/CTASection";
import Header from "./Header";
import Footer from "./Footer";
import "./LandingPage.css";

export default function LandingPage() {
  return (
    <div className="landing-page">
      <Header />

      <main className="landing-main">
        <HeroSection />
        <FeaturesSection />
        <AgentCapabilitiesSection />
        <CTASection />
      </main>

      <Footer />
    </div>
  );
}
