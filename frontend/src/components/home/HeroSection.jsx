import { Link } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import "../../styles/Home.css";
import { FaArrowRight } from "react-icons/fa";
// import Particles from "./Particles";

const heroImages = [
  "/images/Gallery Ibadan Training/IMG_7713.jpg",
  "/images/Gallery Kaduna Training/IMG_5756.jpg",
  "/images/Mastercard Foundation Edtech Conference/IMG_6333.jpg",
  "/images/Gallery Kaduna Training/IMG_6071.jpg",
  "/images/workshopPhotos/IMG_7526.jpg",
];

const HeroSection = () => {
  const heroRef = useRef(null);
  const [currentSlide, setCurrentSlide] = useState(0);
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

  // Background slideshow
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroImages.length);
    }, 6000);

    return () => clearInterval(interval);
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
    <section
      ref={heroRef}
      className="relative min-h-screen overflow-hidden flex items-center justify-center pt-28"
    >
      {/* Background Slideshow */}
      <div className="absolute inset-0 z-0">
        {heroImages.map((src, index) => (
          <img
            key={src}
            src={src}
            alt=""
            className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-[1500ms] ease-in-out ${
              index === currentSlide ? "opacity-100" : "opacity-0"
            }`}
          />
        ))}
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/70" />
      </div>

      {/* Optional Overlay */}
      {/* <div className="absolute inset-0 z-[1] bg-white/30 backdrop-blur-[2px]" /> */}

      {/* Hero Content */}
      <div className="container relative z-10 flex flex-col items-center justify-center text-center">
        <div className="hero-badge !bg-white/15 !text-white w-fit">Educational Technology Partner</div>

        <h1 className="hero-heading !text-white max-w-5xl">
          Empowering Educators with Technology
        </h1>

        <p className="hero-description !text-white/90 max-w-2xl">
          Gain the edge you need to educate this advanced generation of
          learners.
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <Link
            to="/services"
            className="group inline-flex h-12 items-center justify-center gap-2 rounded-full bg-[#2F6FCC] px-6 text-sm font-semibold text-brand-foreground shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
          >
            Explore Services
            <FaArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-1" />
          </Link>

          <Link
            to="/resources"
            className="inline-flex h-12 items-center justify-center rounded-full border border-white/60 px-6 text-sm font-semibold text-white transition-all duration-300 hover:bg-[#2F6FCC]/50 hover:text-white hover:border-transparent"
          >
            Take a Tour
          </Link>
        </div>

        <div className="mt-16 flex flex-wrap justify-center gap-12">
          <div className="flex flex-col items-center">
            <span className="text-4xl font-bold text-white">{yearsCount}+</span>
            <span className="text-white/70">Years</span>
          </div>

          <div className="flex flex-col items-center">
            <span className="text-4xl font-bold text-white">
              {teachersCount}+
            </span>
            <span className="text-white/70">Teachers</span>
          </div>

          <div className="flex flex-col items-center">
            <span className="text-4xl font-bold text-white">
              {schoolsCount}+
            </span>
            <span className="text-white/70">Schools</span>
          </div>
        </div>
      </div>

      {/* Bottom Fade */}
      <div className="absolute bottom-0 left-0 right-0 z-[2] h-40 bg-gradient-to-t from-white via-white/40 to-transparent" />
    </section>
  );
};

export default HeroSection;
