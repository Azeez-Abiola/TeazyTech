import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import "../styles/Services.css";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { FaCheck } from "react-icons/fa";
import { motion } from "framer-motion";
import FaqSection from "../components/home/FaqSection";
import NewsletterSection from "../components/home/NewsletterSection";
import ServicesEcosystem from "../components/services/ServicesEcosystem";
const services = [
  {
    number: "01",
    title: "Professional Development",
    image: "/images/workshopPhotos/IMG_7521.jpg",
    icon: "fas fa-chalkboard-teacher",
    color: "var(--primary-blue)",
    description:
      "Hands-on workshops designed to build confidence and practical classroom technology skills.",
    features: [
      "Customized school workshops",
      "Hands-on classroom practice",
      "Virtual & physical training",
      "Ongoing coaching",
    ],
  },

  {
    number: "02",
    title: "Technology Integration",
    image: "/images/Gallery Kaduna Training/watchingTv.jpg",
    icon: "fas fa-laptop-code",
    color: "var(--secondary-teal)",
    description:
      "Integrate technology into your curriculum using proven instructional strategies.",
    features: [
      "Curriculum Mapping",
      "Hybrid Learning",
      "Learning Objectives",
      "Assessment Strategies",
    ],
  },

  {
    number: "03",
    title: "Instructional Content Design",
    image: "/images/crossedLegs.jpg",
    icon: "fas fa-pencil-ruler",
    color: "var(--secondary-red)",
    description:
      "Create engaging digital resources that improve classroom participation and understanding.",
    features: [
      "Interactive Lessons",
      "Educational Videos",
      "Digital Assessments",
      "Accessibility",
    ],
  },

  {
    number: "04",
    title: "Strategic Planning",
    image: "/images/Gallery Ibadan Training/IMG_7739.jpg",
    icon: "fas fa-users-cog",
    color: "var(--primary-dark-blue)",
    description:
      "Helping institutions create long-term technology adoption strategies.",
    features: [
      "Needs Assessment",
      "Technology Roadmap",
      "Budget Planning",
      "Impact Evaluation",
    ],
  },
];

const bgImages = [
  'url("/images/Gallery Kaduna Training/IMG_5706.jpg")',
  'url("/images/Gallery Kaduna Training/IMG_5756.jpg")',
  'url("/images/Gallery Kaduna Training/IMG_5799.jpg")',
];

const testimonials = [
  {
    name: "Abimbola Abiodun",
    title: "Maths Teacher",
    src: "/images/Teazy tech teachers/abimbola adiodun akanbi.jpg",
    description:
      "Teazy Tech has really helped me in my online teaching. Teazy Tech always sends some really amazing EdTech tools like Photomath that I never knew existed. The community is so engaging, and we're always sent resources to ease our work for free.",
  },
  {
    name: "Wua Msughve Issac",
    title: "Teacher",
    src: "/images/Teazy tech teachers/wua msughve issac.jpg",
    description:
      "Teazytech has become a quick go to platform for me, the short demos and introduction of important edtch tools that I never knew existed before now has made my work better as an educator. Teazy tech absolutely qualifies for every passionate teacher's companion. The demos and illustration videos are short and easy guides even for teachers that have no prior EdTech experience. With teazy tech I've come to appreciate that EdTech isn't as far fetched as I thought.",
  },
  {
    name: "Florence Imhande",
    title: "Teacher",
    src: "/images/Teazy tech teachers/Florence imhande.jpg",
    description:
      "I am now a Canva 'Guru' in my school thanks to Teazy tech training a while back. I'm able to develop any resource for my lesson that I'm not able to find online myself and I'm working on creating my portfolio because I'm hoping to sell some of the educational resources I've been developing online. I'm sure it will be useful to others as well. Thanks so very much.",
  },
];
const minSwipeDistance = 50;

const processSteps = [
  {
    id: "01",
    title: "Assessment",
    desc: "We evaluate your current teaching environment, technology infrastructure, and learning objectives to identify opportunities for improvement.",
  },
  {
    id: "02",
    title: "Planning",
    desc: "We design a customized implementation strategy tailored to your school's goals, budget, and timeline.",
  },
  {
    id: "03",
    title: "Implementation",
    desc: "Through practical workshops and guided support, we introduce tools and workflows that teachers can immediately apply.",
  },
  {
    id: "04",
    title: "Support",
    desc: "Our team stays with you after implementation to answer questions, provide coaching, and ensure long-term success.",
  },
  {
    id: "05",
    title: "Evaluation",
    desc: "We monitor outcomes, gather feedback, and continuously refine the strategy to maximize classroom impact.",
  },
];

const Services = () => {
  // ── State ──────────────────────────────────────────────
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);
  const [currentBg, setCurrentBg] = useState(0);

  // ── Effects ─────────────────────────────────────────────
  useEffect(() => {
    window.scroll({ top: 0, left: 0, behavior: "smooth" });

    const timer = setInterval(() => {
      setCurrentBg((prev) => (prev + 1) % bgImages.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      nextTestimonial();
    }, 6000);

    return () => clearInterval(interval);
  }, [currentTestimonial]);

  const nextTestimonial = () => {
    setCurrentTestimonial((prev) =>
      prev === testimonials.length - 1 ? 0 : prev + 1,
    );
  };

  const prevTestimonial = () => {
    setCurrentTestimonial((prev) =>
      prev === 0 ? testimonials.length - 1 : prev - 1,
    );
  };
  const onTouchStart = (e) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;

    const distance = touchStart - touchEnd;

    if (distance > minSwipeDistance) nextTestimonial();

    if (distance < -minSwipeDistance) prevTestimonial();
  };

  return (
    <div className="services-page">
      {/* Services Overview */}
      <section className="services-overview">
        <div className="services-overview-overlay"></div>
        <div className="hero-bg-container">
          {bgImages.map((bg, index) => (
            <div
              key={index}
              className={`hero-bg-slide ${index === currentBg ? "active" : ""}`}
              style={{ backgroundImage: bg }}
            />
          ))}
        </div>

        <div className="container hero-content">
          <div className="services-overview-content">
            <span className="overview-badge">
              Empowering Educators Worldwide
            </span>

            <h2>How We Help You Thrive</h2>

            <p>
              At Teazy Tech, we are here to support you no matter where you are
              on your journey to educational technology integration. Beyond
              providing personal workshops and training sessions for teachers,
              we also partner with private, public and governmental institutions
              to improve technology integration and position you for success on
              a global scale.
            </p>

            <div className="overview-buttons">
              <Link to="/contact" className="btn !rounded-[30px] btn-primary">
                Book a Training
              </Link>

              <Link
                to="/resources"
                className="btn !rounded-[30px] btn-outline-light"
              >
                Explore Resources
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Main Services */}
      <section className="section main-services">
        <div className="container">
          <div className="services-pin-layout">
            {/* Sticky Header */}
            <div className="services-pin-left">
              <span className="section-tag">Our Services</span>

              <h2>Everything You Need To Transform Teaching</h2>

              <p>
                From teacher training to institution-wide technology strategy,
                we provide practical solutions that make a lasting impact.
              </p>
            </div>

            {/* Scrolling Cards */}
            <div className="services-pin-cards">
              {services.map((service, index) => (
                <motion.div
                  className={`service-card-rect ${index % 2 !== 0 ? "reverse" : ""}`}
                  key={service.number}
                  initial={{ opacity: 0, y: 70 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: false, margin: "-80px" }}
                  transition={{ duration: 0.7, ease: "easeOut" }}
                >
                  <div className="service-image">
                    <img src={service.image} alt={service.title} />

                    <div className="service-number">{service.number}</div>
                  </div>

                  <div className="service-content">
                    <div
                      className="service-icon"
                      style={{
                        backgroundColor: `${service.color}15`,
                        color: service.color,
                      }}
                    >
                      <i className={service.icon}></i>
                    </div>

                    <h3>{service.title}</h3>

                    <p>{service.description}</p>

                    <div className="service-features">
                      {service.features.map((feature, i) => (
                        <div key={i} className="feature-pill">
                          <FaCheck className="fas fa-check text-brand" color="" />

                          <span>{feature}</span>
                        </div>
                      ))}
                    </div>

                    <Link to="/contact" className="service-btn">
                      Learn More
                      <i className="fas fa-arrow-right"></i>
                    </Link>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <ServicesEcosystem />

      {/* Testimonials */}
      <div className="relative z-10 mx-auto flex min-h-fit max-w-7xl items-center px-0 py-16 lg:px-10">
        <div className="grid w-full items-center gap-10 lg:grid-cols-2">
          {/* LEFT */}
          <div className="text-brand text-center lg:text-left">
            <h2 className="mt-4 text-4xl font-bold leading-tight sm:text-4xl lg:text-4xl">
              What Our Clients Say
            </h2>

            <p className="mt-6 max-w-xl mx-auto lg:mx-0 text-base sm:text-lg leading-8 text-gray-500/80">
              Feedback from educators who have transformed their teaching with
              our services
            </p>
          </div>

          {/* RIGHT */}

          <div
            className="rounded-3xl border border-white/20 bg-gray-200/10 backdrop-blur-xl"
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
          >
            {/* Slider */}
            <div className="overflow-hidden">
              <div
                className="!flex !flex-nowrap transition-transform duration-500 ease-in-out"
                style={{
                  transform: `translateX(-${currentTestimonial * 100}%)`,
                }}
              >
                {testimonials.map((item, index) => (
                  <div key={index} className="w-full shrink-0 px-5 py-6 sm:p-8">
                    <div className="flex flex-col gap-6">
                      <div className="flex items-center gap-4">
                        <img
                          src={item.src}
                          alt={item.name}
                          className="h-14 w-14 sm:h-16 sm:w-16 rounded-full object-cover border-2 border-white/20"
                        />

                        <div className="min-w-0">
                          <h3 className="text-lg sm:text-xl font-semibold text-gray-600">
                            {item.name}
                          </h3>

                          <p className="text-sm sm:text-base text-gray-600/60">
                            {item.title}
                          </p>
                        </div>
                      </div>

                      <p className="text-base sm:text-lg leading-7 sm:leading-8 text-gray-500/80">
                        "{item.description}"
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-5 border-t border-gray-500 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-8">
              {/* Dots */}
              <div className="flex justify-center gap-2">
                {testimonials.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentTestimonial(index)}
                    className={`h-2 rounded-full transition-all duration-300 ${
                      currentTestimonial === index
                        ? "w-8 bg-gray-500"
                        : "w-2 bg-gray-100"
                    }`}
                  />
                ))}
              </div>

              {/* Arrows */}
              <div className="flex justify-center gap-3">
                <button
                  onClick={prevTestimonial}
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-500 transition hover:bg-blue-500/20"
                >
                  <ChevronLeft className="text-white" />
                </button>

                <button
                  onClick={nextTestimonial}
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-500 transition hover:bg-blue-500/20"
                >
                  <ChevronRight className="text-white" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Process */}
      <section className="section services-process">
        <div className="container">
          <div className="section-header !flex !flex-col !justify-center !gap-2 !items-center text-center">
            <span className="section-tag">Our Process</span>

            <h2>How We Transform Classrooms</h2>

            <p className="!text-black">
              Every partnership follows a proven roadmap designed to make
              technology adoption simple, practical, and sustainable.
            </p>
          </div>

          <div
            className="services-grid-two"
            style={{ borderColor: "#e5e5e5", overflow: "hidden" }}
          >
            {processSteps.map((service, index) => (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                whileHover={{ y: -5 }}
                viewport={{ once: false, margin: "-50px" }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="service-card-two"
                style={{
                  backgroundColor: "#ffffff",
                  color: "#121212",
                  borderColor: "#f0f0f0",
                  boxShadow: "0 4px 15px rgba(0,0,0,0.03)",
                }}
              >
                <span
                  className="service-number"
                  style={{ color: "black", fontWeight: "700" }}
                >
                  [{service.id}]
                </span>
                <h1 className="service-title">{service.title}</h1>
                <p className="service-desc">{service.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <FaqSection />

      {/* Newsletter */}
      <NewsletterSection />
    </div>
  );
};

export default Services;
