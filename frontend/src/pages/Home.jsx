import "../styles/Home.css";
import { useEffect } from "react";

import HeroSection from "../components/home/HeroSection";
import FeaturesSection from "../components/home/FeaturesSection";
import ServicesPreview from "../components/home/ServicesPreview";
import TestimonialsSection from "../components/home/TestimonialsSection";
import PartnersSection from "../components/home/PartnersSection";
import BlogMarquee from "../components/home/BlogMarquee";
import FaqSection from "../components/home/FaqSection";
import NewsletterSection from "../components/home/NewsletterSection";
import TeazyAIBlock from "../components/home/TeazyAIBlock";
import TeazyLMSBlock from "../components/home/TeazyLMSBlock";

const Home = () => {
  useEffect(() => {
    window.scroll({ top: 0, left: 0, behaviour: "smooth" });
  }, []);

  return (
    <div className="home-page">
      <HeroSection />
      <FeaturesSection />
      <ServicesPreview />
      <TeazyAIBlock />
      <TeazyLMSBlock />
      <TestimonialsSection />
      <PartnersSection />
      <BlogMarquee />
      <FaqSection />
      <NewsletterSection />
    </div>
  );
};

export default Home;
