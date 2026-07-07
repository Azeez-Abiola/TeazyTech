import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

const NewsletterSection = () => {
  return (
    <section className="bg-blue-200 py-24 text-center">
      <div className="container">
        <p className="text-xs font-bold uppercase tracking-[0.35em] text-[#233463]/60">
          ( Newsletter )
        </p>

        <h2 className="mt-6 font-display text-4xl font-medium uppercase !text-[#233463] md:text-6xl">
          Stay Updated
        </h2>

        <p className="mx-auto mt-6 max-w-xl text-sm leading-7 text-[#233463]/80">
          Subscribe to our newsletter to receive the latest educational
          technology tips, resources, and updates directly to your inbox.
        </p>

        <Link
          to="/resources#newsletter"
          className="mt-10 inline-flex items-center gap-3 bg-gradient-to-r from-[#233463] to-[#2F6FCC] px-8 py-4 text-[11px] font-bold uppercase tracking-[0.2em] !text-white transition-opacity hover:opacity-90"
        >
          Subscribe
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </section>
  );
};

export default NewsletterSection;
