import { Link } from "react-router-dom";
import { FaArrowRight } from "react-icons/fa";

const services = [
  {
    number: "01",
    title: "Professional Development",
    desc: "Customized training programs for educators at all technology proficiency levels.",
  },
  {
    number: "02",
    title: "Technology Integration",
    desc: "Strategies for seamlessly incorporating technology into your curriculum.",
  },
  {
    number: "03",
    title: "Instructional Content Design",
    desc: "Tools and techniques for creating engaging digital learning materials.",
  },
  {
    number: "04",
    title: "Strategic Planning",
    desc: "Helping institutions create long-term technology adoption strategies.",
  },
];

const ServicesPreview = () => {
  return (
    <section className="bg-[#fafafa] py-24">
      <div className="container">
        {/* Section label */}
        <div className="text-center">
          <span className="text-xs font-bold uppercase tracking-[0.35em] text-neutral-900">
            ( What We Do )
          </span>
          <div className="mx-auto mt-3 h-[2px] w-24 bg-gradient-to-r from-[#2F6FCC] to-transparent" />
        </div>

        {/* Hairline grid */}
        <div className="mt-16 grid border border-neutral-200 bg-white md:grid-cols-2" data-reveal-cards>
          {services.map((service) => (
            <Link
              key={service.number}
              to="/services"
              className="group -m-px flex min-h-[300px] flex-col border border-neutral-200 p-10 transition-colors hover:bg-[#f4f7fc] lg:min-h-[340px]"
            >
              <span className="text-sm font-semibold text-[#2F6FCC]">
                [{service.number}]
              </span>

              <h3 className="mt-8 max-w-md font-display text-3xl font-medium uppercase leading-tight text-neutral-900 md:text-4xl">
                {service.title}
              </h3>

              <p className="mt-auto max-w-sm pt-10 text-sm leading-6 text-neutral-500">
                {service.desc}
              </p>
            </Link>
          ))}
        </div>

        <div className="mt-12 text-center">
          <Link
            to="/services"
            className="group inline-flex items-center gap-2 border-b border-neutral-300 pb-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-neutral-900 transition-colors hover:border-[#2F6FCC] hover:text-[#2F6FCC]"
          >
            View All Services
            <FaArrowRight className="size-3 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default ServicesPreview;
