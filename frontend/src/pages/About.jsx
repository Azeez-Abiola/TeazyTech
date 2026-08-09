import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Check,
  Lightbulb,
  Users,
  Heart,
  Star,
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import "../styles/About.css";
import LazyImage from "../components/LazyImage";
import partnersData from "../lib/partnersData";
import { aboutPageImages } from "../lib/siteImages";

const REPEAT_IN_VIEW = { once: false, margin: "-72px", amount: 0.35 };

const riseFromLeft = {
  initial: { opacity: 0, x: -56, y: 28 },
  whileInView: { opacity: 1, x: 0, y: 0 },
  viewport: REPEAT_IN_VIEW,
  transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] },
};

const riseFromRight = {
  initial: { opacity: 0, x: 56, y: 28 },
  whileInView: { opacity: 1, x: 0, y: 0 },
  viewport: REPEAT_IN_VIEW,
  transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] },
};

const MISSION_POINTS = [
  "Bridge traditional teaching and modern EdTech",
  "Empower educators with practical tools and knowledge",
  "Create engaging, effective learning environments",
];

const VISION_POINTS = [
  "Every educator confident with classroom technology",
  "Dynamic classrooms that inspire students",
  "Meaningful learning experiences at scale",
];

const VALUES = [
  {
    Icon: Lightbulb,
    title: "Innovation",
    description:
      "We explore and implement cutting-edge educational technologies to stay ahead of the curve.",
  },
  {
    Icon: Users,
    title: "Collaboration",
    description:
      "We work alongside educators to build solutions that truly meet their needs.",
  },
  {
    Icon: Heart,
    title: "Empathy",
    description:
      "We understand the challenges teachers face and design with their realities in mind.",
  },
  {
    Icon: Star,
    title: "Excellence",
    description:
      "We strive for the highest quality in training, resources, and ongoing support.",
  },
];

const STATS = [
  { value: "3000+", label: "Teachers trained" },
  { value: "60+", label: "Partner schools" },
  { value: "20,000+", label: "Students impacted" },
  { value: "3+", label: "Years of impact" },
];

const TESTIMONIALS = [
  {
    name: "Amoatey Benjamin",
    title: "Teacher (Educator)",
    src: "/images/Teazy tech teachers/amoatey Benjamin.webp",
    quote:
      "I have been able to create beautiful presentations for my lessons using Canva and other tools I learned from Teazy Tech. My students are more engaged now, and I feel more confident in my teaching abilities.",
  },
  {
    name: "Florence Imhande",
    title: "Teacher (Educator)",
    src: "/images/Teazy tech teachers/Florence imhande.webp",
    quote:
      "Teazy Tech gave me practical skills I could immediately apply in my classroom. Highly recommended.",
  },
  {
    name: "Abimbola Abiodun",
    title: "Maths Teacher",
    src: "/images/Teazy tech teachers/abimbola adiodun akanbi.webp",
    quote:
      "Teazy Tech has really helped me in my online teaching. The community is so engaging, and we're always sent resources to ease our work for free.",
  },
];

const About = () => {
  const [testimonialIndex, setTestimonialIndex] = useState(0);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setTestimonialIndex((i) => (i + 1) % TESTIMONIALS.length);
    }, 7000);
    return () => clearInterval(timer);
  }, []);

  const prevTestimonial = () => {
    setTestimonialIndex(
      (i) => (i - 1 + TESTIMONIALS.length) % TESTIMONIALS.length,
    );
  };

  const nextTestimonial = () => {
    setTestimonialIndex((i) => (i + 1) % TESTIMONIALS.length);
  };

  return (
    <div className="about-page">
      {/* Breadcrumb */}
      <nav className="about-breadcrumb" aria-label="Breadcrumb">
        <div className="container">
          <Link to="/">Home</Link>
          <span aria-hidden="true">/</span>
          <span className="about-breadcrumb__current">About Us</span>
        </div>
      </nav>

      {/* Split hero — Beonex-style */}
      <section className="about-hero-split">
        <div className="container about-hero-split__grid">
          <motion.div
            className="about-hero-split__copy"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65 }}
          >
            <span className="about-hero-split__tag">About Us</span>
            <h1>
              Crafting excellence in{" "}
              <span className="about-hero-split__accent">EdTech education</span>
            </h1>
            <p>
              Building future-ready teachers through practical EdTech training,
              resources, and ongoing support across Nigeria.
            </p>
            <p className="about-hero-split__lead">
              Teazy Tech is an EdTech company dedicated to helping teachers
              transition from traditional ways of teaching to digital pedagogies.
              Since our inception, we have prioritized educator growth through
              customized resources, courses, and comprehensive training programs.
            </p>
          </motion.div>

          <motion.div
            className="about-hero-split__visual"
            initial={{ opacity: 0, x: 56, y: 28 }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            transition={{ duration: 0.7, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
          >
            <LazyImage
              src={aboutPageImages.training[0]}
              alt="Teazy Tech training session"
            />
            <span className="about-hero-split__badge">
              <strong>3000+</strong>
              Teachers trained
            </span>
          </motion.div>
        </div>
      </section>

      {/* Intro + stats */}
      <section className="about-intro-stats">
        <div className="container">
          <div className="about-intro-stats__grid">
            {STATS.map((stat, i) => (
              <motion.div
                key={stat.label}
                className="about-intro-stats__item"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
              >
                <strong>{stat.value}</strong>
                <span>{stat.label}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission */}
      <section className="about-block">
        <div className="container about-block__grid">
          <motion.div
            className="about-block__media"
            {...riseFromLeft}
          >
            <LazyImage
              src={aboutPageImages.training[2]}
              alt="Teazy Tech workshop"
            />
          </motion.div>
          <motion.div
            className="about-block__content"
            {...riseFromRight}
            transition={{ ...riseFromRight.transition, delay: 0.1 }}
          >
            <span className="section-tag">Our Mission</span>
            <h2>Empowering educators with the tools they need</h2>
            <p>
              To bridge the gap between traditional teaching methods and modern
              educational technology, empowering teachers with the tools and
              knowledge they need to create engaging, effective learning
              environments.
            </p>
            <ul className="about-block__list">
              {MISSION_POINTS.map((point) => (
                <li key={point}>
                  <Check size={16} strokeWidth={2.5} />
                  {point}
                </li>
              ))}
            </ul>
          </motion.div>
        </div>
      </section>

      {/* Vision */}
      <section className="about-block about-block--alt">
        <div className="container about-block__grid about-block__grid--reverse">
          <motion.div
            className="about-block__content"
            {...riseFromLeft}
          >
            <span className="section-tag">Our Vision</span>
            <h2>A world of confident, tech-enabled teachers</h2>
            <p>
              A world where every educator is confident and equipped to leverage
              technology in their teaching, creating dynamic classrooms that
              inspire and engage students in meaningful learning experiences.
            </p>
            <ul className="about-block__list">
              {VISION_POINTS.map((point) => (
                <li key={point}>
                  <Check size={16} strokeWidth={2.5} />
                  {point}
                </li>
              ))}
            </ul>
            <Link to="/contact" className="btn btn-primary about-block__cta">
              Let's Talk
            </Link>
          </motion.div>
          <motion.div
            className="about-block__media about-block__media--duo"
            {...riseFromRight}
            transition={{ ...riseFromRight.transition, delay: 0.1 }}
          >
            <LazyImage
              src={aboutPageImages.training[1]}
              alt="Teacher training in Ibadan"
              className="about-block__duo-primary"
            />
            <LazyImage
              src={aboutPageImages.exhibition}
              alt="Teazy Tech exhibition"
              className="about-block__duo-secondary"
            />
          </motion.div>
        </div>
      </section>

      {/* Our Story */}
      <section className="about-block">
        <div className="container about-block__grid about-block__grid--story">
          <motion.div
            className="about-block__content about-block__content--story"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={REPEAT_IN_VIEW}
            transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
          >
            <span className="section-tag">Our Story</span>
            <h2>Teach Easy Technology</h2>
            <p>
              Princess Natasha has always been passionate about education and its
              advancement. In 2022, she carried out research to analyze the
              concerns of Nigerian teachers integrating technology into their
              teaching and learning process. The results from this study birthed
              Teazy Tech and changed the way she empathized with teachers. She
              noticed a gap in the system — teachers were under-trained,
              misinformed, and wrongfully scared of technology integration
              because of perceived difficulty. With Teazy Tech, she and the solid
              Teazy Tech team have been able to bridge that gap.
            </p>
            <p>
              Teazy Tech is an acronym for Teach Easy Technology. We were born
              out of necessity, not want — because we believe teachers play an
              indispensable role in education, and we must demystify educational
              technology.
            </p>
          </motion.div>

          <div className="about-block__media about-block__media--pair">
            <motion.div className="about-block__pair-image" {...riseFromLeft}>
              <img
                src={aboutPageImages.story[0]}
                alt="Teazy Tech team and educators"
              />
            </motion.div>
            <motion.div
              className="about-block__pair-image"
              {...riseFromRight}
              transition={{ ...riseFromRight.transition, delay: 0.08 }}
            >
              <img
                src={aboutPageImages.story[1]}
                alt="Teazy Tech training in action"
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Why us / Values */}
      <section className="about-why">
        <div className="container">
          <div className="about-why__head">
            <span className="section-tag section-tag--light">What guides us</span>
            <h2>Why Teazy Tech?</h2>
            <p>The principles that guide everything we do</p>
          </div>
          <div className="about-why__grid">
            {VALUES.map((v, i) => (
              <motion.article
                key={v.title}
                className="about-why__card"
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
              >
                <span className="about-why__icon">
                  <v.Icon size={20} strokeWidth={1.75} />
                </span>
                <h3>{v.title}</h3>
                <p>{v.description}</p>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      {/* Commitment — Foresight-style */}
      <section className="about-commitment">
        <div className="container">
          <motion.div
            className="about-commitment__head"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2>Our commitment to values-driven success</h2>
            <p>
              We exist to make EdTech accessible, practical, and transformative
              for every educator who walks into a classroom.
            </p>
          </motion.div>
          <motion.div
            className="about-commitment__image"
            initial={{ opacity: 0, y: 32 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={REPEAT_IN_VIEW}
            transition={{ duration: 0.7, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          >
            <LazyImage
              src={aboutPageImages.training[0]}
              alt="Teazy Tech community"
            />
          </motion.div>
          <div className="about-commitment__cols">
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              Since our inception, we have prioritized the growth of educators
              through customized resources, courses, and comprehensive training
              programs tailored to Nigerian classrooms.
            </motion.p>
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              From Kaduna to Ibadan and beyond, our workshops, webinars, and
              digital tools reach teachers where they are — helping them build
              confidence one lesson at a time.
            </motion.p>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="about-testimonials">
        <div className="container">
          <div className="about-testimonials__head">
            <span className="section-tag">Testimonials</span>
            <h2>What educators say about us</h2>
          </div>
          <div className="about-testimonials__slider">
            <div
              className="about-testimonials__track"
              style={{
                transform: `translateX(-${testimonialIndex * 100}%)`,
              }}
            >
              {TESTIMONIALS.map((item) => (
                <article key={item.name} className="about-testimonials__slide">
                  <div className="about-testimonials__quote">
                    <p>"{item.quote}"</p>
                  </div>
                  <div className="about-testimonials__author">
                    <img src={item.src} alt={item.name} />
                    <div>
                      <strong>{item.name}</strong>
                      <span>{item.title}</span>
                    </div>
                  </div>
                </article>
              ))}
            </div>
            <div className="about-testimonials__nav">
              <button
                type="button"
                onClick={prevTestimonial}
                aria-label="Previous testimonial"
              >
                <ChevronLeft size={20} />
              </button>
              <div className="about-testimonials__dots">
                {TESTIMONIALS.map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    className={i === testimonialIndex ? "is-active" : ""}
                    onClick={() => setTestimonialIndex(i)}
                    aria-label={`Go to testimonial ${i + 1}`}
                  />
                ))}
              </div>
              <button
                type="button"
                onClick={nextTestimonial}
                aria-label="Next testimonial"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Partners */}
      <section className="about-partners">
        <div className="container">
          <div className="about-partners__head">
            <span className="section-tag">Collaborators</span>
            <h2>Our Partners</h2>
            <p>
              Organizations we partner with to enhance effective educational
              technology integration
            </p>
          </div>
          <div className="about-partners__list">
            {partnersData.map((partner) => (
              <span key={partner.id} className="about-partners__item">
                {partner.logo ? (
                  <img
                    src={
                      partner.id === "orange-corners-nigeria"
                        ? aboutPageImages.partnerLogo
                        : partner.logo
                    }
                    alt={partner.name}
                    className={`about-partners__logo${
                      partner.id === "orange-corners-nigeria"
                        ? " about-partners__logo--orange"
                        : ""
                    }`}
                  />
                ) : (
                  <span className="about-partners__name">{partner.name}</span>
                )}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="about-cta">
        <div className="about-cta__bg" aria-hidden="true">
          <img src={aboutPageImages.training[1]} alt="" />
        </div>
        <div className="about-cta__overlay" aria-hidden="true" />
        <div className="container about-cta__inner">
          <h2>Ready to transform your teaching?</h2>
          <p>
            Join thousands of educators who have revolutionized their classrooms
            with our innovative EdTech solutions.
          </p>
          <div className="about-cta__actions">
            <Link to="/contact" className="btn btn-primary">
              Get Started Today
            </Link>
            <Link to="/services" className="btn btn-outline-light">
              Explore Our Services
              <ArrowUpRight size={14} />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
