import {
  HeroSection,
  FeaturesSection,
  FeaturedCoursesSection,
  TestimonialsSection,
  CTASection,
  Footer,
} from "../components/landing";

export const LandingPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <HeroSection />
      <FeaturesSection />
      <FeaturedCoursesSection />
      <TestimonialsSection />
      <CTASection />
      <Footer />
    </div>
  );
};

