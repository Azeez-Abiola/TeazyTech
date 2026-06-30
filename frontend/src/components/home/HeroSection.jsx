import { Link } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import "../../styles/Home.css";
import { FaArrowRight } from "react-icons/fa";
// import Particles from "./Particles";

const HeroSection = () => {
  const heroRef = useRef(null);
  const [countedUp, setCountedUp] = useState(false);
  const [yearsCount, setYearsCount] = useState(0);
  const [teachersCount, setTeachersCount] = useState(0);
  const [schoolsCount, setSchoolsCount] = useState(0);

  useEffect(() => {
    if (heroRef.current) {
      heroRef.current.classList.add("loaded");
    }

    // Start the counter animation after the hero section loads
    const timer = setTimeout(() => {
      startCountUp();
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const startCountUp = () => {
    if (countedUp) return;

    const yearsTarget = 3;
    const teachersTarget = 1000;
    const schoolsTarget = 50;
    const duration = 2000; // 2 seconds
    const steps = 40; // Number of steps to reach the target
    const interval = duration / steps;

    let currentStep = 0;

    const counter = setInterval(() => {
      currentStep += 1;
      const progress = currentStep / steps;

      setYearsCount(Math.floor(progress * yearsTarget));
      setTeachersCount(Math.floor(progress * teachersTarget));
      setSchoolsCount(Math.floor(progress * schoolsTarget));

      if (currentStep === steps) {
        setYearsCount(yearsTarget);
        setTeachersCount(teachersTarget);
        setSchoolsCount(schoolsTarget);
        setCountedUp(true);
        clearInterval(counter);
      }
    }, interval);

    return () => clearInterval(counter);
  };

  return (
    <section className="hero !pt-26" ref={heroRef}>
      {/* <div style={{ width: "100%", height: "600px", position: "relative" }}>
        <Particles
          particleColors={["#ffffff"]}
          particleCount={200}
          particleSpread={10}
          speed={0.1}
          particleBaseSize={100}
          moveParticlesOnHover
          alphaParticles={false}
          disableRotation={false}
          pixelRatio={1}
        />
      </div> */}
      <div className="hero-bg-gradient"></div>
      <div className="hero-bg-pattern"></div>
      <div className="hero-bg-dots"></div>

      <div className="container !flex !justify-center !items-cener hero-container">
        <div className="flex flex-col gap-2 items-center justify-center">
          <div className="hero-badge !w-fit !text-center">
            Educational Technology Partner
          </div>
          <h1 className="hero-heading">Empowering Educators with Technology</h1>
          <p className="hero-description !text-center">
            Gain the edge you need to educate this advanced generation of
            learners
          </p>
          <div className="hero-buttons">
            <Link
              to="/services"
              className="group inline-flex h-12 items-center justify-center gap-2 rounded-full bg-brand px-6 text-sm font-semibold text-brand-foreground shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg"
            >
              Explore Services
              <FaArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <Link
              to="/resources"
              className="inline-flex h-12 items-center justify-center rounded-full border border-brand bg-none px-6 text-sm font-semibold text-foreground transition hover:bg-muted"
            >
              Take a Tour
            </Link>
          </div>
          <div className="hero-stats">
            <div className="hero-stat">
              <span className="hero-stat-number">{yearsCount}+</span>
              <span className="hero-stat-label">Years</span>
            </div>
            <div className="hero-stat">
              <span className="hero-stat-number">{teachersCount}+</span>
              <span className="hero-stat-label">Teachers</span>
            </div>
            <div className="hero-stat">
              <span className="hero-stat-number">{schoolsCount}+</span>
              <span className="hero-stat-label">Schools</span>
            </div>
          </div>
        </div>
        {/* <div className="hero-image-container">
          <div className="hero-image-wrapper">
            <img
              src="/images/Gallery Kaduna Training/IMG_5838.jpg"
              alt="Teacher using educational technology"
              className="hero-image"
            />
          </div>
          <div className="hero-floating-element hero-float-1">
            <i className="fas fa-laptop"></i>
            <span>Modern Learning</span>
          </div>
          <div className="hero-floating-element hero-float-2">
            <i className="fas fa-chalkboard-teacher"></i>
            <span>Expert Training</span>
          </div>
        </div> */}
      </div>

      {/* <div className="hero-shapes">
        <div className="hero-shape hero-shape-1"></div>
        <div className="hero-shape hero-shape-2"></div>
        <div className="hero-shape hero-shape-3"></div>
      </div> */}
    </section>
  );
};

export default HeroSection;
