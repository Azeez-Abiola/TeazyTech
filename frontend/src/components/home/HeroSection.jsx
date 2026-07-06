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

  const stats = [
    { value: yearsCount, label: "Years Experience" },
    { value: teachersCount, label: "Teachers Trained" },
    { value: schoolsCount, label: "Partner Schools" },
  ];

  return (
    <section
      ref={heroRef}
      className="relative flex min-h-screen flex-col justify-between overflow-hidden pb-16 pt-32"
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
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/55 to-black/75" />
      </div>

      {/* Stats — top left */}
      <div className="container relative z-10 mt-8">
        <div className="flex flex-wrap gap-10 md:gap-20">
          {stats.map((stat) => (
            <div key={stat.label}>
              <span className="font-display text-4xl font-medium text-white md:text-5xl">
                {stat.value}+
              </span>
              <p className="mt-2 text-[11px] uppercase tracking-[0.25em] text-white/60">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Headline — bottom left, paragraph — right */}
      <div className="container relative z-10">
        <div className="grid items-end gap-10 lg:grid-cols-[1.7fr_1fr]">
          <h1 className="font-display text-[clamp(3.2rem,8.5vw,7.5rem)] font-medium uppercase leading-[0.95] !text-white">
            Empowering Educators With Technology.
          </h1>

          <div className="max-w-sm lg:justify-self-end lg:text-right">
            <p className="text-sm leading-7 text-white/80">
              Gain the edge you need to educate this advanced generation of
              learners.
            </p>

            <div className="mt-6 flex flex-wrap gap-6 lg:justify-end">
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
                Take a Tour
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
