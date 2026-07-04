import { Link } from "react-router-dom";
import Logo from "./Logo.jsx";
import "../styles/Footer.css";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer overflow-hidden">
      <div className="container">
        <div className="footer-top">
          <div className="footer-logo">
            <div className="footer-logo-wrapper">
              <Logo variant="icon-light" />
            </div>
            <p>
              Empowering educators with cutting-edge knowledge and tools in
              educational technologies .
            </p>
          </div>

          <div className="footer-links">
            <div className="footer-links-column">
              <h4>Quick Links</h4>
              <Link to="/">Home</Link>
              {/* <Link to="/about">About Us</Link> */}
              <Link to="/resources">Resources</Link>
              <Link to="/services">Services</Link>
              <Link to="/gallery">Gallery</Link>
              <Link to="/blog">Blog</Link>
              <Link to="/contact">Contact</Link>
            </div>

            <div className="footer-links-column">
              <h4>Resources</h4>
              <Link to="/resources">E-Books</Link>
              <Link to="/resources">Webinars</Link>
              <Link to="/resources">Tutorials</Link>
              <Link to="/resources">Case Studies</Link>
            </div>

            <div className="footer-links-column">
              <h4>Contact</h4>
              <p>Email: Teazytech1@gmail.com </p>
              <p>Phone: +234 81 4430 6629</p>
              <div className="footer-social">
                <a
                  href="https://facebook.com"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <i className="fab fa-facebook-f"></i>
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
                  <i className="fab fa-linkedin-in"></i>
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <p>&copy; {currentYear} Teazy Tech. All rights reserved.</p>
          <div className="footer-bottom-links">
            <Link to="/privacy">Privacy Policy</Link>
            <Link to="/terms">Terms of Service</Link>
          </div>
        </div>
      </div>
      <div className="overflow-hidden whitespace-nowrap -mb-24 py-6">
        <div className="!flex !flex-row !flex-nowrap w-max animate-marquee">
          {[...Array(8)].map((_, i) => (
            <span
              key={i}
              className="mx-8 text-8xl font-bold text-brand uppercase font-orbitron"
            >
             TEAZY TECH
            </span>
          ))}
        </div>
      </div>
    </footer>
  );
};

export default Footer;
