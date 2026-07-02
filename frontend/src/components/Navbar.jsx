"use client";

import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import "../styles/Navbar.css";
import Logo from "./Logo";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const menuRef = useRef(null);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setIsMenuOpen(false); // Close menu when route changes
  }, [location]);

  useEffect(() => {
    // Disable body scroll when menu is open on mobile
    if (isMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isMenuOpen]);

  // Close menu when clicking outside
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
          <span className="menu-toggle-bar"></span>
          <span className="menu-toggle-bar"></span>
          <span className="menu-toggle-bar"></span>
        </button>

        <div
          className={`navbar-menu ${isMenuOpen ? "active" : ""}`}
          ref={menuRef}
        >
          <div className="navbar-menu-header">
            <Link to="/" className="navbar-menu-logo">
              <div className="logo-container-mobile">
                <Logo />
              </div>
            </Link>
            <button
              className="menu-close"
              onClick={() => setIsMenuOpen(false)}
              aria-label="Close navigation menu"
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M18 6L6 18"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M6 6L18 18"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>

          <nav className={`nav-links ${scrolled ? "!text-brand" : "text-white"}`}>
            <ul>
              <li className={location.pathname === "/" ? "active" : ""}>
                <Link to="/">
                  <span className="nav-icon">🏠</span>
                  <span className="nav-text">Home</span>
                </Link>
              </li>
              {/* <li className={location.pathname === '/about' ? 'active' : ''}>
                <Link to="/about">
                  <span className="nav-icon">👥</span>
                  <span className="nav-text">About Us</span>
                </Link>
              </li> */}
              <li
                className={location.pathname === "/resources" ? "active" : ""}
              >
                <Link to="/resources">
                  <span className="nav-icon">📚</span>
                  <span className="nav-text">Resources</span>
                </Link>
              </li>
              <li className={location.pathname === "/services" ? "active" : ""}>
                <Link to="/services">
                  <span className="nav-icon">🛠️</span>
                  <span className="nav-text">Services</span>
                </Link>
              </li>
              <li className={location.pathname === "/gallery" ? "active" : ""}>
                <Link to="/gallery">
                  <span className="nav-icon">🖼️</span>
                  <span className="nav-text">Gallery</span>
                </Link>
              </li>
              <li className={location.pathname === "/blog" ? "active" : ""}>
                <Link to="/blog">
                  <span className="nav-icon">📝</span>
                  <span className="nav-text">Blogs</span>
                </Link>
              </li>
              {/* <li className={location.pathname === '/contact' ? 'active' : ''}>
                <Link to="/contact">
                  <span className="nav-icon">📝</span>
                  <span className="nav-text">Contact</span>
                </Link>
              </li> */}
            </ul>
          </nav>

          <div className="navbar-menu-footer">
            <Link to="/contact" className="btn-mobile-contact">
              Contact Us
            </Link>
            <Link to="/get-started" className="btn-mobile-cta">
              Get Started
            </Link>

            <div className="social-links">
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
              >
                <i className="fab fa-twitter"></i>
              </a>
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
              >
                <i className="fab fa-facebook"></i>
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
              >
                <i className="fab fa-instagram"></i>
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
              >
                <i className="fab fa-linkedin"></i>
              </a>
            </div>
          </div>
        </div>
        <button className="bg-[#2F6FCC] rounded-[30px] px-4 py-2 text-sm">
          Contact us
        </button>
      </div>
    </header>
  );
};

export default Navbar;
