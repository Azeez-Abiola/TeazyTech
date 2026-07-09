import React from "react";
import {
  GraduationCap,
  Heart,
  Lightbulb,
  RefreshCw,
  Users,
  BookOpen,
} from "lucide-react";

export const features = [
  {
    title: "Expert Educators",
    description:
      "Our team combines decades of classroom experience with technical expertise",
    Icon: GraduationCap,
  },
  {
    title: "Teacher-Centered Approach",
    description: "Solutions designed with real teaching challenges in mind",
    Icon: Heart,
  },
  {
    title: "Practical Applications",
    description:
      "Focus on implementable strategies that work in real classrooms",
    Icon: Lightbulb,
  },
  {
    title: "Ongoing Support",
    description:
      "We don't just train and leave — we partner with you for continued success",
    Icon: RefreshCw,
  },
  {
    title: "Customized Solutions",
    description:
      "Programs tailored to your specific school, subject, and student needs",
    Icon: Users,
  },
  {
    title: "Comprehensive Resources",
    description: "Access to a wide range of tools, templates, and materials",
    Icon: BookOpen,
  },
];

const FeaturesSection = () => {
  return (
    <section className="bg-[#233463] py-28 lg:pb-40">
      <div className="container">
        <h2 className="text-center font-display text-4xl font-medium uppercase leading-tight !text-white/90 md:text-6xl">
          Why Choose Teazy Tech?
        </h2>

        <div className="features-grid mt-20 !grid gap-6 md:!grid-cols-2 lg:!grid-cols-3">
          {features.map((feature, index) => {
            const Icon = feature.Icon;
            return (
              <div
                key={feature.title}
                className={`flex flex-col items-center border border-white/15 bg-white/[0.06] px-8 py-14 text-center transition-colors duration-300 hover:border-white/50 ${
                  index % 3 === 1 ? "lg:translate-y-10" : ""
                }`}
              >
                <span className="flex h-16 w-16 items-center justify-center rounded-full border border-white/25">
                  <Icon className="h-6 w-6 text-white" strokeWidth={1.5} />
                </span>

                <h3 className="mt-8 font-display text-lg font-medium uppercase tracking-wide !text-white">
                  {feature.title}
                </h3>

                <p className="mt-4 max-w-xs text-sm leading-6 text-white/60">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
