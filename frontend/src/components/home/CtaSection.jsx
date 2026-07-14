import { Link } from "react-router-dom";
import { exhibitionImages } from "../../lib/siteImages";

const CtaSection = () => (
    <section className="tt-ignite">
        <div className="tt-ignite__bg" aria-hidden="true">
            <img
                src={exhibitionImages[4]}
                alt=""
                data-cover
            />
        </div>
        <div className="tt-ignite__shade" aria-hidden="true" />
        <div className="tt-ignite__content">
            <h2>Ready to Transform Your Classroom?</h2>
            <p>
                Join thousands of educators who are enhancing their teaching
                methods with Teazy Tech&apos;s resources and services.
            </p>
            <div className="tt-ignite__actions">
                <Link to="/services" className="btn btn-primary">
                    Get Started Today
                </Link>
                <Link to="/contact" className="btn btn-outline-light">
                    Contact Us
                </Link>
            </div>
        </div>
    </section>
);

export default CtaSection;
