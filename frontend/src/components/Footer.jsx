import { Link } from "react-router-dom";
import Logo from "./Logo.jsx";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#0b0b0d] text-white">
      <div className="container py-20">
        {/* Wordmark + tagline */}
        <div className="grid items-start gap-12 lg:grid-cols-2">
          <div>
            <div className="h-10 w-10">
              <Logo variant="icon-light" />
            </div>
            <h2 className="mt-8 font-display text-6xl font-medium uppercase leading-[0.95] !text-white md:text-8xl">
              Teazy
              <br />
              Tech
            </h2>
          </div>

          <div className="max-w-md lg:justify-self-end">
            <p className="font-display text-xl font-medium uppercase leading-relaxed text-white/90 md:text-2xl">
              Empowering educators with cutting-edge knowledge and tools in
              educational technologies.
            </p>

            <Link
              to="/contact"
              className="mt-8 inline-flex items-center gap-3 bg-white px-7 py-4 text-[11px] font-bold uppercase tracking-[0.2em] !text-neutral-900 transition-colors hover:bg-neutral-200"
            >
              Get Started Now
              <span aria-hidden="true">↗</span>
            </Link>
          </div>
        </div>

        {/* Link columns */}
        <div className="mt-20 grid gap-10 border-t border-white/10 pt-12 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <h4 className="text-[11px] font-bold uppercase tracking-[0.3em] text-white/40">
              Menu
            </h4>
            <div className="mt-5 space-y-3">
              <Link to="/" className="block text-sm text-white/80 transition-colors hover:text-white">Home</Link>
              <Link to="/resources" className="block text-sm text-white/80 transition-colors hover:text-white">Resources</Link>
              <Link to="/services" className="block text-sm text-white/80 transition-colors hover:text-white">Services</Link>
              <Link to="/gallery" className="block text-sm text-white/80 transition-colors hover:text-white">Gallery</Link>
              <Link to="/blog" className="block text-sm text-white/80 transition-colors hover:text-white">Blog</Link>
              <Link to="/contact" className="block text-sm text-white/80 transition-colors hover:text-white">Contact</Link>
            </div>
          </div>

          <div>
            <h4 className="text-[11px] font-bold uppercase tracking-[0.3em] text-white/40">
              Resources
            </h4>
            <div className="mt-5 space-y-3">
              <Link to="/resources" className="block text-sm text-white/80 transition-colors hover:text-white">E-Books</Link>
              <Link to="/resources" className="block text-sm text-white/80 transition-colors hover:text-white">Webinars</Link>
              <Link to="/resources" className="block text-sm text-white/80 transition-colors hover:text-white">Tutorials</Link>
              <Link to="/resources" className="block text-sm text-white/80 transition-colors hover:text-white">Case Studies</Link>
            </div>
          </div>

          <div>
            <h4 className="text-[11px] font-bold uppercase tracking-[0.3em] text-white/40">
              Contact
            </h4>
            <div className="mt-5 space-y-3 text-sm text-white/80">
              <p>
                <a href="mailto:hello@teazytech.org" className="transition-colors hover:text-white">
                  hello@teazytech.org
                </a>
              </p>
              <p>
                <a href="tel:+2348144306629" className="transition-colors hover:text-white">
                  +234 81 4430 6629
                </a>
              </p>
            </div>
          </div>

          <div>
            <h4 className="text-[11px] font-bold uppercase tracking-[0.3em] text-white/40">
              Social
            </h4>
            <div className="mt-5 space-y-3">
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="block text-sm text-white/80 transition-colors hover:text-white">Facebook</a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="block text-sm text-white/80 transition-colors hover:text-white">Instagram</a>
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="block text-sm text-white/80 transition-colors hover:text-white">LinkedIn</a>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-14 flex flex-col gap-4 border-t border-white/10 pt-6 text-xs text-white/50 sm:flex-row sm:items-center sm:justify-between">
          <p>&copy; {currentYear} Teazy Tech. All rights reserved.</p>
          <div className="flex gap-6">
            <Link to="/privacy" className="transition-colors hover:text-white">Privacy Policy</Link>
            <Link to="/terms" className="transition-colors hover:text-white">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
