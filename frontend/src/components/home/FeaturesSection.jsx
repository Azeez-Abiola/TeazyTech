import React from "react";

export const features = [
  {
    title: "Expert Educators",
    description:
      "Our team combines decades of classroom experience with technical expertise",
    icon: "fas fa-graduation-cap",
  },
  {
    title: "Teacher-Centered Approach",
    description: "Solutions designed with real teaching challenges in mind",
    icon: "fas fa-hand-holding-heart",
  },
  {
    title: "Practical Applications",
    description:
      "Focus on implementable strategies that work in real classrooms",
    icon: "fas fa-tools",
  },
  {
    title: "Ongoing Support",
    description:
      "We don't just train and leave - we partner with you for continued success",
    icon: "fas fa-sync-alt",
  },
  {
    title: "Customized Solutions",
    description:
      "Programs tailored to your specific school, subject, and student needs",
    icon: "fas fa-users",
  },
  {
    title: "Comprehensive Resources",
    description: "Access to a wide range of tools, templates, and materials",
    icon: "fas fa-puzzle-piece",
  },
];

const FeaturesSection = () => {
  return (
    <section className="bg-[#0c0c0e] py-28 lg:pb-40">
      <div className="container">
        <h2 className="text-center font-display text-4xl font-medium uppercase leading-tight text-[#4a83d8]/90 md:text-6xl">
          ( Why Choose Teazy Tech? )
        </h2>

        <div className="features-grid mt-20 !grid gap-6 md:!grid-cols-2 lg:!grid-cols-3">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              className={`flex flex-col items-center border border-white/10 bg-[#121214] px-8 py-14 text-center transition-colors duration-300 hover:border-[#2F6FCC]/60 ${
                index % 3 === 1 ? "lg:translate-y-10" : ""
              }`}
            >
              <span className="flex h-16 w-16 items-center justify-center rounded-full border border-white/25">
                <i className={`${feature.icon} text-lg text-white`}></i>
              </span>

              <h3 className="mt-8 font-display text-lg font-medium uppercase tracking-wide !text-white">
                {feature.title}
              </h3>

              <p className="mt-4 max-w-xs text-sm leading-6 text-neutral-400">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
