import Hero from '../../components/marketing/Hero.jsx';
import Benefits from '../../components/marketing/Benefits.jsx';
import Features from '../../components/marketing/Features.jsx';
import DashboardPreview from '../../components/marketing/DashboardPreview.jsx';
import Workflow from '../../components/marketing/Workflow.jsx';
import ReportsSection from '../../components/marketing/ReportsSection.jsx';
import UseCases from '../../components/marketing/UseCases.jsx';
import Testimonials from '../../components/marketing/Testimonials.jsx';
import Pricing from '../../components/marketing/Pricing.jsx';
import Faq from '../../components/marketing/Faq.jsx';
import FinalCta from '../../components/marketing/FinalCta.jsx';

export default function Landing() {
  return (
    <>
      <Hero />
      <Benefits />
      <Features />
      <DashboardPreview />
      <Workflow />
      <ReportsSection />
      <UseCases />
      <Testimonials />
      <Pricing />
      <Faq />
      <FinalCta />
    </>
  );
}
