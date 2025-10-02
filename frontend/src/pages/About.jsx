import { Link } from "react-router-dom";
import { useEffect } from "react";
import "../styles/About.css";
import LazyImage from "../components/LazyImage";

const About = () => {
    useEffect(() => {
        window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
    }, []);

    return (
        <div className="about-page">
            {/* Hero Section */}
            <section className="about-hero">
                <div className="container">
                    <div className="about-hero-content">
                        <h1>About Teazy Tech</h1>
                        <p>
                            Empowering educators with cutting-edge technology
                            solutions to transform teaching and learning
                            experiences.
                        </p>
                    </div>
                </div>
            </section>

            {/* Mission & Vision */}
            <section className="section mission-vision">
                <div className="container">
                    <div className="mission-vision-grid">
                        <div className="mission-card">
                            <div className="mission-icon">
                                <i className="fas fa-bullseye"></i>
                            </div>
                            <h3>Our Mission</h3>
                            <p>
                                To bridge the gap between traditional teaching
                                methods and modern educational technology,
                                empowering teachers with the tools and knowledge
                                they need to create engaging, effective learning
                                environments.
                            </p>
                        </div>
                        <div className="vision-card">
                            <div className="vision-icon">
                                <i className="fas fa-eye"></i>
                            </div>
                            <h3>Our Vision</h3>
                            <p>
                                A world where every educator is confident and
                                equipped to leverage technology in their
                                teaching, creating dynamic classrooms that
                                inspire and engage students in meaningful
                                learning experiences.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Our Story */}
            <section className="section our-story">
                <div className="container">
                    <div className="our-story-content">
                        <div className="our-story-image">
                            <LazyImage
                                src="/images/workshopPhotos/IMG_8138.jpg"
                                alt="Teazy Tech founders"
                            />
                        </div>
                        <div className="our-story-text">
                            <h2>Our Story</h2>
                            <p>
                                Princess Natasha has always been passionate about education and its advancement. In 2022, she carried out a research to analyze the concerns of Nigerian teachers to integrate technology into their teaching and learning process. The results from this study birthed Teazy Tech and changed the way she empatized with teachers. She noticed a gap in the system- teachers were under trained, misinformed, and wrongfully scared of technology integration because of perceived difficulty, but with Teazy Tech she and the solid Teazy Tech team have been able to bridge that gap. 

                            </p>
                            <p>
                                Teazy Tech is an acronym for Teach Easy Technology, we are an EdTech company dedicated to helping teachers transition from the traditional ways of teaching (teacher centered, chalk and black board, etc) to the use of more digital pedagogies. Since our inception, we have prioritzed the growth of educators through the development of customized resources, courses, and comprehensive training programs. We were born out a necessity not a want because we believe that teachers play an indispensable role in education, so we must demystify educational technology. 
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Values */}
            <section className="section values">
                <div className="container">
                    <div className="section-header text-center">
                        <h2>Our Core Values</h2>
                        <p>
                            The principles that guide everything we do at Teazy
                            Tech
                        </p>
                    </div>
                    <div className="values-grid">
                        <div className="value-card">
                            <div className="value-icon">
                                <i className="fas fa-lightbulb"></i>
                            </div>
                            <h3>Innovation</h3>
                            <p>
                                We continuously explore and implement
                                cutting-edge educational technologies to stay
                                ahead of the curve.
                            </p>
                        </div>
                        <div className="value-card">
                            <div className="value-icon">
                                <i className="fas fa-users"></i>
                            </div>
                            <h3>Collaboration</h3>
                            <p>
                                We believe in the power of working together with
                                educators to create meaningful solutions.
                            </p>
                        </div>
                        <div className="value-card">
                            <div className="value-icon">
                                <i className="fas fa-heart"></i>
                            </div>
                            <h3>Empathy</h3>
                            <p>
                                We understand the challenges educators face and
                                design our solutions with their needs in mind.
                            </p>
                        </div>
                        <div className="value-card">
                            <div className="value-icon">
                                <i className="fas fa-star"></i>
                            </div>
                            <h3>Excellence</h3>
                            <p>
                                We strive for the highest quality in everything
                                we deliver, from training to resources.
                            </p>
                        </div>
                    </div>
                </div>
            </section>


            {/* Team */}
            <section className="section team">
                <div className="container">
                    <div className="section-header text-center">
                        <h2>Meet Our Team</h2>
                        <p>
                            The passionate individuals behind Teazy Tech's
                            mission
                        </p>
                    </div>
                    <div className="team-grid">
                        <div className="team-member">
                            <div className="team-member-image">
                                <LazyImage
                                    src="/images/Teazy Tech Volunteers/Princess Natasha.jpg"
                                    alt="Princess Natasha"
                                />
                            </div>
                            <h3>Princess Natasha</h3>
                            <p className="team-member-role">
                                Founder & CEO
                            </p>
                            <p className="team-member-bio">
                                Educational technology enthusiast with a passion
                                for empowering teachers through innovative
                                solutions.
                            </p>
                            <div className="team-member-social">
                                <a href="#" aria-label="LinkedIn">
                                    <i className="fab fa-linkedin-in"></i>
                                </a>
                                <a href="#" aria-label="Twitter">
                                    <i className="fab fa-twitter"></i>
                                </a>
                            </div>
                        </div>

                        <div className="team-member">
                            <div className="w-full h-[250px] overflow-hidden">
                                <LazyImage
                                    className="object-center w-full h-full object-cover transition-transform duration-500"
                                    src="/images/Teazy Tech Volunteers/Chelsea front picture.jpg"
                                    alt="Team member"
                                />
                            </div>
                            <h3>Chelsea Julius</h3>
                            <p className="team-member-role">
                               Chief Operations Officer
                            </p>
                            <p className="team-member-bio">
                                Overseer of Teazy Tech's general operations.
                            </p>
                            <div className="team-member-social">
                                <a href="#" aria-label="LinkedIn">
                                    <i className="fab fa-linkedin-in"></i>
                                </a>
                              
                            </div>
                        </div>

                        <div className="team-member">
                            <div className="team-member-image">
                                <LazyImage
                                    src="/images/Teazy Tech Volunteers/Adaobi Onyishi.JPG"
                                    alt="Team member"
                                />
                            </div>
                            <h3>Adaobi Onyishi</h3>
                            <p className="team-member-role">
                                Field Representative
                            </p>
                            <p className="team-member-bio">
                                Company representative, promoting Teazy Tech's
                                products and services.
                            </p>
                            <div className="team-member-social">
                                <a href="#" aria-label="LinkedIn">
                                    <i className="fab fa-linkedin-in"></i>
                                </a>
                              
                            </div>
                        </div>

                        <div className="team-member">
                            <div className="team-member-image">
                                <LazyImage
                                    src="/images/Teazy Tech Volunteers/Ridwan Aboki.JPG"
                                    alt="Team member"
                                />
                            </div>
                            <h3>Ridwan Olalere Aboki</h3>
                            <p className="team-member-role">
                                Training Facilitator
                            </p>
                            <p className="team-member-bio">
                                Expert trainer specializing in educational
                                technology integration and teacher development.
                            </p>
                            <div className="team-member-social">
                                <a href="#" aria-label="LinkedIn">
                                    <i className="fab fa-linkedin-in"></i>
                                </a>
                              
                            </div>
                        </div>

                        <div className="team-member">
                            <div className="team-member-image">
                                <LazyImage
                                    src="/images/Teazy Tech Volunteers/Emmanuel Clement.jpg"
                                    alt="Team member"
                                />
                            </div>
                            <h3>Emmanuel Clement</h3>
                            <p className="team-member-role">
                                Video Content Creator
                            </p>
                            <p className="team-member-bio">
                                Our professional Video content creator,
                                versatile with various modern media editing
                                skills
                            </p>
                            <div className="team-member-social">
                                <a href="#" aria-label="LinkedIn">
                                    <i className="fab fa-linkedin-in"></i>
                                </a>
                              
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Impact */}
            <section className="section impact">
                <div className="container">
                    <div className="section-header text-center">
                        <h2>Our Impact</h2>
                        <p>
                            How Teazy Tech is transforming education through
                            technology
                        </p>
                    </div>
                    <div className="impact-stats">
                        <div className="impact-stat">
                            <div className="impact-number">1000+</div>
                            <p>Teachers Trained</p>
                        </div>
                        <div className="impact-stat">
                            <div className="impact-number">60+</div>
                            <p>Schools Partnered</p>
                        </div>
                        <div className="impact-stat">
                            <div className="impact-number">20,000+</div>
                            <p>Students Impacted</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Partners */}
            <section className="section partners">
                <div className="container">
                    <div className="section-header text-center">
                        <h2>Our Partners</h2>
                        <p>
                            Organizations we collaborate with to enhance
                            educational technology
                        </p>
                    </div>
                    <div className="partners-grid">
                        <div className="partner-logo">
                            <img
                                src="https://cdn.worldvectorlogo.com/logos/google-1-1.svg"
                                alt="Partner logo"
                            />
                        </div>
                        <div className="partner-logo">
                            <img
                                src="https://cdn.worldvectorlogo.com/logos/microsoft-5.svg"
                                alt="Partner logo"
                            />
                        </div>
                        <div className="partner-logo">
                            <img
                                src="https://cdn.worldvectorlogo.com/logos/dell-2.svg"
                                alt="Partner logo"
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="section cta">
                <div className="container">
                    <div className="cta-content text-center">
                        <h2>Ready to Transform Your Teaching?</h2>
                        <p>
                            Join thousands of educators who have already
                            revolutionized their classrooms with our innovative
                            EdTech solutions.
                        </p>
                        <div className="cta-buttons">
                            <a href="/contact" className="btn btn-primary">
                                Get Started Today
                            </a>
                            <a href="/services" className="btn btn-outline">
                                Explore Our Services
                            </a>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default About;
