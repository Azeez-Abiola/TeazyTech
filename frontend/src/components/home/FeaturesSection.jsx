import React from "react";
import BorderGlow from "../ui/BorderGlow"
import 'animate.css';

export const features = [
  {
    title: "Expert Educators",
    description:
      "Our team combines decades of classroom experience with technical expertise",
    icon: "fas fa-graduation-cap",
    iconColor: "var(--primary-blue)",
    backgroundColor: "rgba(47, 111, 204, 0.1)",
  },
  {
    title: "Teacher-Centered Approach",
    description: "Solutions designed with real teaching challenges in mind",
    icon: "fas fa-hand-holding-heart",
    iconColor: "var(--secondary-teal)",
    backgroundColor: "rgba(68, 187, 164, 0.1)",
  },
  {
    title: "Practical Applications",
    description:
      "Focus on implementable strategies that work in real classrooms",
    icon: "fas fa-tools",
    iconColor: "var(--secondary-red)",
    backgroundColor: "rgba(233, 79, 55, 0.1)",
  },
  {
    title: "Ongoing Support",
    description:
      "We don't just train and leave - we partner with you for continued success",
    icon: "fas fa-sync-alt",
    iconColor: "var(--accent-orange)",
    backgroundColor: "rgba(243, 160, 77, 0.1)",
  },
  {
    title: "Customized Solutions",
    description:
      "Programs tailored to your specific school, subject, and student needs",
    icon: "fas fa-users",
    iconColor: "var(--primary-dark-blue)",
    backgroundColor: "rgba(35, 52, 99, 0.1)",
  },
  {
    title: "Comprehensive Resources",
    description: "Access to a wide range of tools, templates, and materials",
    icon: "fas fa-puzzle-piece",
    iconColor: "var(--accent-purple)",
    backgroundColor: "rgba(157, 108, 198, 0.1)",
  },
];

const FeaturesSection = () => {
  return (
    <section className="section features-section">
      <div className="container">
        <div className="text-left feature-text">
          <div className="w-[100%] flex mx-auto h-[1px] bg-gradient-to-r from-brand mb-4 via-white to-brand"></div>

          <h2 className="text-sm font-semibold uppercase tracking-wider text-blue-400">
            Why Choose Teazy Tech
          </h2>
          <p className="mt-3 font-display text-3xl font-bold text-black tracking-tight font-font md:text-2xl">
            What sets our educational technology services apart
          </p>
        </div>
        <div className="features-grid">
          {features.map((feature, index) => (
              <div
                key={index}
                className={`animate__animated animate__fadeInDown bg-gray-100 border rounded-[20px] p-10 h-[300px] lg:h-[400px] flex flex-col !gap-4 shadow`}
              >
                <div className="">
                  <div
                    className="feature-icon"
                    // style={{ backgroundColor: feature.backgroundColor }}
                  >
                    <i
                      className={feature.icon}
                      style={{ color: feature.iconColor }}
                    ></i>
                  </div>
                  <div className="w-[50%] h-[1px] bg-gradient-to-r from-brand mb-4 to-white"></div>
                </div>
                <div className="">
                  <h3 className="text-[#0e0042]">{feature.title}</h3>
                  <p className="text-gray-500">{feature.description}</p>
                </div>
              </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
