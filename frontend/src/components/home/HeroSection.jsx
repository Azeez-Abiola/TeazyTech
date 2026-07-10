import { Link } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import "../../styles/Home.css";
import { FaArrowRight } from "react-icons/fa";
// import Particles from "./Particles";

const heroImages = [
  "/images/Gallery Ibadan Training/IMG_7713.jpg",
  "/images/Gallery Kaduna Training/IMG_5756.jpg",
  "/images/Mastercard Foundation Edtech Conference/IMG_6333.jpg",
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
    const teachersTarget = 3000;
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

  const stats = [
    { value: yearsCount, label: "Years Experience" },
    { value: teachersCount, label: "Teachers Trained" },
    { value: schoolsCount, label: "Partner Schools" },
  ];

  return (
    <section
      ref={heroRef}
      data-no-reveal
      className="relative flex min-h-screen items-center overflow-hidden pt-20"
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
        <div className="absolute inset-0 bg-black/50" />
      </div>

      {/* Hero content — desktop: stats above title, copy pinned right;
          mobile: title, copy, then stats (Foresight column-reverse) */}
      <div className="container relative z-10 flex w-full flex-col text-white">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="order-3 mt-12 flex flex-row flex-wrap gap-8 lg:order-none lg:mb-[60px] lg:mt-0 lg:gap-[60px]"
        >
          {stats.map((stat) => (
            <div key={stat.label} className="flex flex-col">
              <span className="mb-1 font-display text-[28px] font-bold leading-tight text-white">
                {stat.value}+
              </span>
              <span className="text-xs uppercase tracking-[1px] text-white/80">
                {stat.label}
              </span>
            </div>
          ))}
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="order-1 mb-10 font-display text-[clamp(40px,10vw,60px)] font-light uppercase leading-[0.9] tracking-[-1px] !text-white md:text-[clamp(60px,8vw,100px)] md:tracking-[-3px] lg:order-none"
        >
          Empowering
          <br />
          Educators With
          <br />
          Technology.
        </motion.h1>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="order-2 max-w-[360px] text-xs leading-6 text-white/80 [text-shadow:0_2px_10px_rgba(0,0,0,0.5)] lg:absolute lg:right-6 lg:top-1/2 lg:order-none lg:-translate-y-1/2 lg:text-right"
        >
          <p>
            Building Future Ready Teachers Today
          </p>

          <div className="mt-5 flex flex-wrap gap-6 lg:justify-end">
            <Link
              to="/services"
              className="group inline-flex items-center gap-2 border-b border-white/60 pb-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-white transition-colors hover:border-white"
            >
              Explore Services
              <FaArrowRight className="size-3 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>

            <Link
              to="/resources"
              className="inline-flex items-center gap-2 border-b border-transparent pb-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-white/70 transition-colors hover:border-white/60 hover:text-white"
            >
              Resources
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;
