import { useEffect, useRef, useState } from "react";
import "../../styles/Home.css";
import AnimatedSection from "./AnimatedSection";
import LazyImage from "../LazyImage";

import { Quote } from "lucide-react";
const testimonials = [
  {
    name: "Amoatey Benjamin",
    role: "Teacher (Educator)",
    src: "/images/Teazy tech teachers/amoatey Benjamin.jpg",
    quote:
      "I have been able to create beautiful presentations for my lessons using Canva and other tools I learned from Teazy Tech. My students are more engaged now, and I feel more confident in my teaching abilities. The training was practical and easy to follow.",
  },
];

const TestimonialsSection = () => {
  const [visibleItems, setVisibleItems] = useState([]);
  const itemRefs = useRef([]);

  const addToRefs = (el, index) => {
    if (el && !itemRefs.current.includes(el)) {
      itemRefs.current[index] = el;
    }
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = itemRefs.current.indexOf(entry.target);
            if (index !== -1 && !visibleItems.includes(index)) {
              setVisibleItems((prev) => [...prev, index]);
            }
          }
        });
      },
      {
        threshold: 0.2,
        rootMargin: "50px",
      },
    );

    itemRefs.current.forEach((ref) => {
      if (ref) observer.observe(ref);
    });

    return () => {
      itemRefs.current.forEach((ref) => {
        if (ref) observer.unobserve(ref);
      });
    };
  }, [visibleItems]);

  return (
    <section className="border-y border-border bg-brand p-10">
      <div className="container-page section-y">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-wider text-blue-600">
            Testimonials
          </p>
          <h2 className="mt-3 font-display text-3xl font-bold tracking-tight md:text-3xl">
            What Educators Say About Us
          </h2>
          <p className="mt-4 text-base text-muted-foreground">
            Hear from teachers who have transformed their classrooms with our
            EdTech solutions and training programs.
          </p>
        </div>

        <div className="mt-14 grid flex mx-auto w-[50%] gap-6 md:grid-cols-2">
          {testimonials.map((t, i) => (
            <div key={t.name} delay={i * 80}>
              <figure className="h-full rounded-3xl border border-border bg-background p-8 shadow-[0_10px_30px_-15px_rgb(15_23_42/0.15)]">
                <Quote className="size-8 text-brand" />
                <blockquote className="mt-4 text-base leading-relaxed text-brand">
                  "{t.quote}"
                </blockquote>
                <div className="mt-6 flex items-center gap-3 border-t border-border pt-5"></div>
                <div className="flex gap-2 items-center">
                  <img
                    src={t.src}
                    alt="image"
                    className="w-20 h-20 rounded-[50%]"
                  />
                  <div className="flex flex-col">
                     <p className="font-semibold text-lg text-brand">{t.name}</p>
                     <p className="font-light text-blue-500">{t.role}</p>
                  </div>
                </div>
              </figure>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
