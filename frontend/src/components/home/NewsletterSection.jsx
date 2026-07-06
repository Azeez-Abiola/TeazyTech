import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

const NewsletterSection = () => {
  return (
    <div className="relative w-full">
    {/* Background Image */}
    <div className="h-[500px] overflow-hidden">
      <img
        src="/images/Gallery Kaduna Training/IMG_5756.jpg"
        alt="Newsletter"
        className="h-full w-full object-cover"
      />
  
      {/* Optional dark overlay */}
      <div className="absolute inset-0 bg-black/30" />
    </div>
  
    {/* Floating CTA Card */}
    <section className="overflow-hidden container-page relative -mt-[400px] z-20 pb-20">
      <div className="mx-auto w-[90%] rounded-[2rem] border border-white/20 bg-[#233463]/80 p-10 backdrop-blur-md shadow-2xl md:p-16">
        {/* Decorative Blobs */}
        <div
          aria-hidden
          className="pointer-events-none absolute -right-20 -top-20 h-80 w-80 rounded-full bg-blue-500/10 blur-3xl"
        />
  
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-24 -left-12 h-72 w-72 rounded-full bg-purple-400/10 blur-3xl"
        />
  
        <div className="relative mx-auto max-w-2xl text-center">
          <h2 className="text-4xl font-bold text-white md:text-5xl">
            Stay Updated
          </h2>
  
          <p className="mt-4 text-lg leading-relaxed text-white/80">
            Subscribe to our newsletter to receive the latest educational
            technology tips, resources, and updates directly to your inbox.
          </p>
  
          <div className="mt-8">
            <Link
              to="/"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-white px-8 text-sm font-semibold text-[#233463] transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
            >
              Subscribe
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  </div>
  );
};

export default NewsletterSection;
