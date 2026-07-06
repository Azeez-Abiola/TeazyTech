import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

const NewsletterSection = () => {
  return (
    <section className="border-t border-white/10 bg-[#0c0c0e] py-24 text-center">
      <div className="container">
        <p className="text-xs font-bold uppercase tracking-[0.35em] text-white/50">
          ( Newsletter )
        </p>

        <h2 className="mt-6 font-display text-4xl font-medium uppercase !text-white md:text-6xl">
          Stay Updated
        </h2>

        <p className="mx-auto mt-6 max-w-xl text-sm leading-7 text-neutral-400">
          Subscribe to our newsletter to receive the latest educational
          technology tips, resources, and updates directly to your inbox.
        </p>

        <Link
          to="/"
          className="mt-10 inline-flex items-center gap-3 bg-white px-8 py-4 text-[11px] font-bold uppercase tracking-[0.2em] text-neutral-900 transition-colors hover:bg-neutral-200"
        >
          Subscribe
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </section>
  );
};

export default NewsletterSection;
