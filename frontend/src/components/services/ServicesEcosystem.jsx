import { Link } from "react-router-dom";
import { ArrowUpRight, BookOpen, Bot, FolderOpen } from "lucide-react";

const ecosystem = [
  {
    id: "resources",
    Icon: FolderOpen,
    tag: "Resources",
    title: "Free & Premium Guides",
    description:
      "Access e-books, webinars, tutorials, and case studies designed to help educators integrate technology into their classrooms with confidence.",
    cta: "Browse Resources",
    to: "/resources",
    external: false,
    accent: "#44BBA4",
  },
  {
    id: "teazy-ai",
    Icon: Bot,
    tag: "Teazy AI",
    title: "AI Tools for Educators",
    description:
      "Generate lesson plans, quizzes, and writing assessments in seconds. Upload handwritten answers and get accurate scoring powered by AI.",
    cta: "Launch Teazy AI",
    href: "https://ai.teazytech.online",
    external: true,
    accent: "#2F6FCC",
  },
  {
    id: "courses",
    Icon: BookOpen,
    tag: "Courses",
    title: "Learn With Teazy Tech",
    description:
      "Structured professional development courses with video lessons, certificates, and a community of educators — learn at your own pace, on any device.",
    cta: "Start Learning",
    href: "https://www.teazytech.online",
    external: true,
    accent: "#233463",
  },
];

const ServicesEcosystem = () => (
  <section className="services-ecosystem">
    <div className="container">
      <div className="services-ecosystem__head">
        <span className="section-tag">Beyond Training</span>
        <h2>Resources, AI &amp; Courses</h2>
        <p>
          Teazy Tech offers more than workshops — explore our full ecosystem of
          tools and learning experiences built for modern educators.
        </p>
      </div>

      <div className="services-ecosystem__grid">
        {ecosystem.map((item, index) => {
          const CtaTag = item.external ? "a" : Link;
          const ctaProps = item.external
            ? { href: item.href, target: "_blank", rel: "noopener noreferrer" }
            : { to: item.to };

          return (
            <article
              key={item.id}
              className="services-ecosystem__card"
              style={{ "--eco-accent": item.accent }}
            >
              <span className="services-ecosystem__idx">
                {String(index + 1).padStart(2, "0")}
              </span>
              <span className="services-ecosystem__icon">
                <item.Icon size={22} strokeWidth={1.5} />
              </span>
              <p className="services-ecosystem__tag">{item.tag}</p>
              <h3>{item.title}</h3>
              <p className="services-ecosystem__desc">{item.description}</p>
              <CtaTag {...ctaProps} className="services-ecosystem__link">
                {item.cta}
                <ArrowUpRight size={14} />
              </CtaTag>
            </article>
          );
        })}
      </div>
    </div>
  </section>
);

export default ServicesEcosystem;
