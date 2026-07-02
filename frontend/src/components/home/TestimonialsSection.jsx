import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const images = [
  "/images/Teazy tech teachers/abimbola adiodun akanbi.jpg",
  "/images/Teazy tech teachers/amoatey Benjamin.jpg",
  "/images/Teazy tech teachers/Florence imhande.jpg",
  "/images/Teazy tech teachers/Amos happiness.jpg",
  "/images/Teazy tech teachers/wua msughve isaac.jpg",
];

const testimonials = [
  {
    name: "Amoatey Benjamin",
    title: "Teacher (Educator)",
    src: "/images/Teazy tech teachers/amoatey Benjamin.jpg",
    description:
      "I have been able to create beautiful presentations for my lessons using Canva and other tools I learned from Teazy Tech. My students are more engaged now, and I feel more confident in my teaching abilities. The training was practical and easy to follow.",
  },
  {
    name: "Amos Happiness",
    title: "Teacher (Educator)",
    src: "/images/Teazy tech teachers/Amos happiness.jpg",
    description:
      "The training transformed the way I teach. I now use digital tools confidently and my students enjoy every lesson.",
  },
  {
    name: "Florence Imhande",
    title: "Teacher (Educator)",
    src: "/images/Teazy tech teachers/Florence imhande.jpg",
    description:
      "Teazy Tech gave me practical skills I could immediately apply in my classroom. Highly recommended.",
  },
];

export default function TestimonialsSection(place) {
  const [currentImage, setCurrentImage] = useState(0);
  const [currentTestimonial, setCurrentTestimonial] = useState(0);

  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);

  // Background slideshow
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % images.length);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  // Testimonial autoplay
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

  // Swipe
  const minSwipeDistance = 50;

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
    <section className={`relative overflow-hidden ${place !== "services" ? "min-h-screen" : "min-h-fit"}`}>
      {/* Background */}

      <img
        key={currentTestimonial}
        src={testimonials[currentTestimonial].src}
        alt={testimonials[currentTestimonial].name}
        className="absolute inset-0 h-full w-full object-cover scale-105 transition-all duration-700"
      />

      <div className="absolute inset-0 bg-[#1E2A78]/70" />

      {/* Content */}

      <div className="relative z-10 mx-auto flex min-h-screen max-w-7xl items-center px-5 py-16 lg:px-10">
        <div className="grid w-full items-center gap-10 lg:grid-cols-2">
          {/* LEFT */}

          <div className="text-white text-center lg:text-left">
            <p className="uppercase tracking-[0.3em] text-sm text-white/70">
              Testimonials
            </p>

            <h2 className="mt-4 text-4xl font-bold leading-tight sm:text-5xl lg:text-6xl">
              What Educators Say About Us
            </h2>

            <p className="mt-6 max-w-xl mx-auto lg:mx-0 text-base sm:text-lg leading-8 text-white/80">
              Hear from teachers who have transformed their classrooms with our
              EdTech solutions and training programs.
            </p>
          </div>

          {/* RIGHT */}

          <div
            className="rounded-3xl border border-white/20 bg-white/10 backdrop-blur-xl"
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
          >
            {/* Slider */}

            <div className="overflow-hidden">
              <div
                className="flex transition-transform duration-500 ease-in-out"
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
                          <h3 className="text-lg sm:text-xl font-semibold text-white">
                            {item.name}
                          </h3>

                          <p className="text-sm sm:text-base text-white/60">
                            {item.title}
                          </p>
                        </div>
                      </div>

                      <p className="text-base sm:text-lg leading-7 sm:leading-8 text-white/80">
                        "{item.description}"
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer */}

            <div className="flex flex-col gap-5 border-t border-white/10 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-8">
              {/* Dots */}

              <div className="flex justify-center gap-2">
                {testimonials.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentTestimonial(index)}
                    className={`h-2 rounded-full transition-all duration-300 ${
                      currentTestimonial === index
                        ? "w-8 bg-white"
                        : "w-2 bg-white/40"
                    }`}
                  />
                ))}
              </div>

              {/* Arrows */}

              <div className="flex justify-center gap-3">
                <button
                  onClick={prevTestimonial}
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 transition hover:bg-white/20"
                >
                  <ChevronLeft className="text-white" />
                </button>

                <button
                  onClick={nextTestimonial}
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 transition hover:bg-white/20"
                >
                  <ChevronRight className="text-white" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
