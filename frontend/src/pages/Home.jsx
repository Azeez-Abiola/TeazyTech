import React from "react";
import { Link } from "react-router-dom";
import "../styles/Home.css";
import { useState, useEffect } from "react";

// Importing section components
import HeroSection from "../components/home/HeroSection";
import FeaturesSection from "../components/home/FeaturesSection";
import AboutPreview from "../components/home/AboutPreview";
import ServicesPreview from "../components/home/ServicesPreview";
import TestimonialsSection from "../components/home/TestimonialsSection";
import CtaSection from "../components/home/CtaSection";
import BlogPreview from "../components/home/BlogPreview";
import NewsletterSection from "../components/home/NewsletterSection";
import AnimatedSection from "../components/home/AnimatedSection";
import FormSection from "../components/home/formSection";

const Home = () => {
  const [showSuccess, setShowSuccess] = useState(false);
  const [showFailure, setShowFailure] = useState(false);
  useEffect(() => {
    window.scroll({ top: 0, left: 0, behaviour: "smooth" });
  }, []);
  return (
    <div className="home-page">
      {/* Hero with subtle fade-up animation */}
      {/* <AnimatedSection
                animation="fade-up"
                duration={1000}
                threshold={0.05}
            > */}
      <HeroSection />
      {/* </AnimatedSection> */}

      {/* Features with bouncy effect */}
      {/* <AnimatedSection
                animation="bounce"
                duration={900}
                className="animated-features"
            > */}
      <FeaturesSection />
      {/* </AnimatedSection> */}

      {/* Services with slide from left effect */}
      {/* <AnimatedSection animation="slide-left" duration={800} delay={200}> */}
      <ServicesPreview />
      {/* </AnimatedSection> */}

      {/* Testimonials with rotating effect */}
      {/* <AnimatedSection animation="slide-right" duration={800}> */}
      <TestimonialsSection />
      {/* </AnimatedSection> */}

      {/*form with slide in effect from right*/}
      {/* <AnimatedSection animation="slide-left" duration={900} delay={150}> */}
      <FormSection
        showSuccess={showSuccess}
        showFailure={showFailure}
        setShowSuccess={setShowSuccess}
        setShowFailure={setShowFailure}
      />
      {/* </AnimatedSection> */}

      {/* CTA with zoom in effect */}
      {/* <AnimatedSection animation="zoom-in" duration={700} delay={100}> */}
      {/* <CtaSection /> */}
      {/* </AnimatedSection> */}

      {/* <BlogPreview /> */}
      <NewsletterSection />

      {/*The success and failure messages for the form..i coldnt implement it in the form module because the animatedSection component is intefering with it not making the position fixed*/}
      {showSuccess && (
        <div
          className="fixed top-[80%] left-[10%] md:left-[40%] bg-white text-indigo-500 border-[3px] border-green-500
                 rounded-md py-4 px-4 w-[80%] md:w-[20%]"
        >
          Message sent successfully!
        </div>
      )}
      {showFailure && (
        <div
          className="fixed top-[80%] left-[10%] md:left-[40%] bg-white text-red-400 border-[3px] border-red-500
                 rounded-md py-4 px-4 w-[80%] md:w-[20%]"
        >
          Message not sent! Please try again later.
        </div>
      )}
    </div>
  );
};

export default Home;
