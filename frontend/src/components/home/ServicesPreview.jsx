import { Link } from "react-router-dom";
import { FaArrowRight } from "react-icons/fa";

const services = [
  {
    title: "Professional Development",
    desc: "Customized training programs for educators at all technology proficiency levels",
    img: "https://www.teazytech.org/images/Gallery%20Ibadan%20Training/IMG_7742.jpg",
  },
  {
    title: "Technology Integration",
    desc: "Strategies for seamlessly incorporating technology into your curriculum",
    img: "https://www.teazytech.org/images/Gallery%20Ibadan%20Training/IMG_7713.jpg",
  },
  {
    title: "Instructional Content Design",
    desc: "Tools and techniques for creating engaging digital learning materials",
    img: "https://www.teazytech.org/images/Gallery%20Ibadan%20Training/IMG_7741.jpg",
  },
];
const ServicesPreview = () => {
//   useEffect(() => {
//     window.scroll({ top: 0, left: 0, behaviour: "smooth" });
//   }, []);
  return (
   <section>
      <div className="container-page section-y p-20 !bg-[#f8faff]">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-wider text-brand">
              Our Services
            </p>
            <h2 className="mt-3 service font-display text-xl font-bold text-blue-500 tracking- md:text-4xl">
              Comprehensive solutions to enhance your teaching with technology
            </h2>
          </div>
          <Link
            to="/services"
            className="group inline-flex items-center gap-2 text-sm font-semibold text-foreground"
          >
            View all services
            <FaArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {services.map((s, i) => (
            <div key={s.title} delay={i * 80}>
              <Link
                to="/services"
                className="group block h-full overflow-hidden rounded-3xl border border-border bg-background transition-all hover:-translate-y-1 hover:shadow-[0_30px_60px_-25px_rgb(15_23_42/0.25)]"
              >
                <div className="aspect-[4/3] overflow-hidden bg-muted">
                  <img
                    src={s.img}
                    alt={s.title}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                </div>
                <div className="p-6">
                  <h3 className="font-display text-xl font-semibold text-brand">
                    {s.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-brand">
                    {s.desc}
                  </p>
                  <div className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-blue-500">
                    Learn More{" "}
                    <FaArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ServicesPreview;
