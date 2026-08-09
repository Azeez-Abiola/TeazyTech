"use client";

import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import "../styles/Navbar.css";
import Logo from "./Logo";
import NavDropdown from "./NavDropdown";
import { Users, Images, FolderOpen, Briefcase } from "lucide-react";

const TEAZY_AI_URL = "https://ai.teazytech.online";
const COURSES_URL = "https://www.teazytech.online";

const ABOUT_ITEMS = [
  {
    label: "About Us",
    to: "/about",
    description: "Our mission, vision, and story empowering educators",
    Icon: Users,
  },
  {
    label: "Gallery",
    to: "/gallery",
    description: "Photos from trainings, workshops, and events",
    Icon: Images,
  },
];

const SERVICES_ITEMS = [
  {
    label: "Our Services",
    to: "/services",
    description: "Workshops, training, and technology integration for schools",
    Icon: Briefcase,
  },
  {
    label: "Resources",
    to: "/resources",
    description: "Guides, e-books, webinars, and EdTech tools",
    Icon: FolderOpen,
  },
];

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const menuRef = useRef(null);
  const location = useLocation();

  const isAboutActive =
    location.pathname === "/about" || location.pathname === "/gallery";
  const isServicesActive =
    location.pathname === "/services" ||
    location.pathname === "/resources" ||
    location.pathname.startsWith("/services");

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setIsMenuOpen(false);
  }, [location]);

  useEffect(() => {
    document.body.style.overflow = isMenuOpen ? "hidden" : "unset";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isMenuOpen]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target) &&
        !event.target.classList.contains("menu-toggle")
      ) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header
      className={`navbar ${scrolled ? "navbar-scrolled" : ""} ${isMenuOpen ? "menu-open" : ""}`}
    >
      <div className="md:px-20 navbar-container">
        <div className="navbar-logo">
          <Link to="/" className="flex items-center">
            <div className="logo-container">
              <Logo />
            </div>
          </Link>
        </div>

        <button
          className={`menu-toggle ${isMenuOpen ? "active" : ""}`}
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Toggle navigation menu"
        >
          <span className="menu-toggle-bar" />
          <span className="menu-toggle-bar" />
          <span className="menu-toggle-bar" />
        </button>

        <div
          className={`navbar-menu ${isMenuOpen ? "active" : ""}`}
          ref={menuRef}
        >
          <div className="navbar-menu-header">
            <Link to="/" className="navbar-menu-logo flex items-center gap-2">
              <img
                src="/images/logo/teazy-tech-logo-icon.png"
                alt="Teazy Tech logo"
                className="h-8 w-8 object-contain"
              />
              <span className="text-lg font-bold">Teazy Tech</span>
            </Link>
            <button
              className="menu-close"
              onClick={() => setIsMenuOpen(false)}
              aria-label="Close navigation menu"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path
                  d="M18 6L6 18"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
                <path
                  d="M6 6L18 18"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          </div>

          <nav className="nav-links">
            <ul className="nav-links__desktop">
              <li className={location.pathname === "/" ? "active" : ""}>
                <Link to="/">
                  <span className="nav-text">Home</span>
                </Link>
              </li>

              <NavDropdown
                label="About"
                items={ABOUT_ITEMS}
                isActive={isAboutActive}
              />

              <NavDropdown
                label="Services"
                items={SERVICES_ITEMS}
                isActive={isServicesActive}
              />

              <li>
                <a
                  href={TEAZY_AI_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <span className="nav-text">Teazy AI</span>
                </a>
              </li>

              <li>
                <a
                  href={COURSES_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <span className="nav-text">Courses</span>
                </a>
              </li>

              <li className={location.pathname === "/blog" ? "active" : ""}>
                <Link to="/blog">
                  <span className="nav-text">Blog</span>
                </Link>
              </li>
            </ul>

            <ul className="nav-links__mobile">
              <li className={location.pathname === "/" ? "active" : ""}>
                <Link to="/">
                  <span className="nav-text">Home</span>
                </Link>
              </li>
              <NavDropdown label="About" items={ABOUT_ITEMS} isActive={isAboutActive} mobile />
              <NavDropdown
                label="Services"
                items={SERVICES_ITEMS}
                isActive={isServicesActive}
                mobile
              />
              <li>
                <a
                  href={TEAZY_AI_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <span className="nav-text">Teazy AI</span>
                </a>
              </li>
              <li>
                <a
                  href={COURSES_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <span className="nav-text">Courses</span>
                </a>
              </li>
              <li className={location.pathname === "/blog" ? "active" : ""}>
                <Link to="/blog">
                  <span className="nav-text">Blog</span>
                </Link>
              </li>
            </ul>
          </nav>

          <div className="navbar-menu-footer">
            <Link to="/contact" className="btn-mobile-contact">
              Contact Us
            </Link>
            <Link to="/services" className="btn-mobile-cta">
              Get Started
            </Link>
            <div className="social-links">
              <a
                href="https://web.facebook.com/people/Teazy-Tech/61561340034465/"
                target="_blank"
                rel="noopener noreferrer"
              >
                <i className="fab fa-facebook" />
              </a>
              <a
                href="https://www.instagram.com/teazy_tech/"
                target="_blank"
                rel="noopener noreferrer"
              >
                <i className="fab fa-instagram" />
              </a>
              <a
                href="https://www.linkedin.com/company/teazy-tech/"
                target="_blank"
                rel="noopener noreferrer"
              >
                <i className="fab fa-linkedin" />
              </a>
            </div>
          </div>
        </div>

        <Link
          to="/contact"
          className="bg-gradient-to-r from-[#233463] to-[#2F6FCC] !text-white lg:inline-flex hidden items-center px-6 py-3 text-[11px] font-bold uppercase tracking-[0.2em] transition-opacity hover:opacity-90"
        >
          Contact Us
        </Link>
      </div>
    </header>
  );
};

export default Navbar;
