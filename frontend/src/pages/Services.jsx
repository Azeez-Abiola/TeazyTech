import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import "../styles/Services.css";
import { FaPlus, FaMinus, FaCheck } from "react-icons/fa";
import TestimonialsSection from "../components/home/TestimonialsSection";

const faqs = [
  {
    question: "Am I paying for the resources or guide?",
    answer:
      "No. Most of our resources and guides are completely free for teachers. For premium resources, we always ensure they remain affordable for educators.",
  },
  {
    question: "Can I get help with an EdTech tool that's not mentioned here?",
    answer:
      "Absolutely. Join our community and we'll support you with any educational technology tool you're struggling with, even if it's not currently listed on our platform.",
  },
  {
    question: "Can my school become part of the physical training?",
    answer:
      "Yes. Simply send us an email with your school's name and location and we'll organize a customized on-site training session.",
  },
  {
    question: "Can you train my school privately?",
    answer:
      "Yes. We provide private workshops for schools looking to improve their staff's technology integration skills.",
  },
  {
    question: "Are the EdTech tools for specific grades and subjects?",
    answer:
      "Yes. We recommend different tools based on grade level and subject area so every educator gets the best fit.",
  },
  {
    question: "I'm not tech-savvy. Can I still benefit?",
    answer:
      "Definitely. Our programs are designed for beginners and experienced educators alike. We teach step-by-step with practical examples.",
  },
  {
    question: "How long before I see results?",
    answer:
      "Most educators notice improved classroom engagement within a few weeks of consistently applying what they learn.",
  },
];
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
const Services = () => {
  useEffect(() => {
    window.scroll({ top: 0, left: 0, behaviour: "smooth" });
  }, []);

  const [open, setOpen] = useState(0);
  return (
    <div className="services-page">
      {/* Services Overview */}
      <section className="services-overview">
        <div className="services-overview-overlay"></div>

        <div className="container">
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

              <Link to="/resources" className="btn !rounded-[30px] btn-outline-light">
                Explore Resources
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Main Services */}
      <section className="section main-services">
        <div className="container">
          <div className="section-header !flex !flex-col !justify-center !gap-2 !items-center text-center">
            <span className="section-tag">Our Services</span>

            <h2>Everything You Need To Transform Teaching</h2>

            <p>
              From teacher training to institution-wide technology strategy, we
              provide practical solutions that make a lasting impact.
            </p>
          </div>

          <div className="services-grid">
            {services.map((service, index) => (
              <div className="service-card" key={index}>
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
                        <FaCheck className="fas fa-check" color="white" />

                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>

                  <Link to="/contact" className="service-btn">
                    Learn More
                    <i className="fas fa-arrow-right"></i>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <TestimonialsSection place={"services"} />

      {/* Process */}
      <section className="section services-process">
        <div className="container">
          <div className="section-header !flex !flex-col !justify-center !gap-2 !items-center text-center">
            <span className="section-tag">Our Process</span>

            <h2>How We Transform Classrooms</h2>

            <p>
              Every partnership follows a proven roadmap designed to make
              technology adoption simple, practical, and sustainable.
            </p>
          </div>

          <div className="process-timeline">
            <div className="process-step">
              <div className="process-number">01</div>

              <div className="process-card">
                <h3>Assessment</h3>

                <p>
                  We evaluate your current teaching environment, technology
                  infrastructure, and learning objectives to identify
                  opportunities for improvement.
                </p>
              </div>
            </div>

            <div className="process-step">
              <div className="process-number">02</div>

              <div className="process-card">
                <h3>Planning</h3>

                <p>
                  We design a customized implementation strategy tailored to
                  your school's goals, budget, and timeline.
                </p>
              </div>
            </div>

            <div className="process-step">
              <div className="process-number">03</div>

              <div className="process-card">
                <h3>Implementation</h3>

                <p>
                  Through practical workshops and guided support, we introduce
                  tools and workflows that teachers can immediately apply.
                </p>
              </div>
            </div>

            <div className="process-step">
              <div className="process-number">04</div>

              <div className="process-card">
                <h3>Support</h3>

                <p>
                  Our team stays with you after implementation to answer
                  questions, provide coaching, and ensure long-term success.
                </p>
              </div>
            </div>

            <div className="process-step">
              <div className="process-number">05</div>

              <div className="process-card">
                <h3>Evaluation</h3>

                <p>
                  We monitor outcomes, gather feedback, and continuously refine
                  the strategy to maximize classroom impact.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="section services-faq">
        <div className="container">
          <div className="section-header !flex !flex-col !justify-center !gap-2 !items-center text-center">
            <span className="section-tag">Frequently Asked Questions</span>

            {/* <h3>Everything You Need To Know</h3> */}

            <p>
              Have questions? Here are the answers educators ask us most often.
            </p>
          </div>

          <div className="faq-list">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className={`faq-card ${open === index ? "active" : ""}`}
              >
                <button
                  className="faq-question"
                  onClick={() => setOpen(open === index ? -1 : index)}
                >
                  <h3>{faq.question}</h3>

                  <span className="faq-icon">
                    {open === index ? <FaMinus /> : <FaPlus />}
                  </span>
                </button>

                <div className={`faq-answer ${open === index ? "show" : ""}`}>
                  <p>{faq.answer}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      {/* <section className="section services-cta">
        <div className="container">
          <div className="services-cta-content text-center">
            <h2>Ready to Transform Your Teaching?</h2>
            <p>
              Contact us today to discuss how our services can help you enhance
              your teaching with educational technology.
            </p>
            <div className="services-cta-buttons">
              <Link to="/contact" className="btn btn-accent">
                Schedule a Consultation
              </Link>
              <Link to="/resources" className="btn btn-outline">
                Explore Free Resources
              </Link>
            </div>
          </div>
        </div>
      </section> */}
    </div>
  );
};

export default Services;
