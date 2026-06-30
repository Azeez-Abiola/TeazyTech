import React from 'react'

const FeaturesSection = () => {
  return (
    <section className="section features-section">
      <div className="container">
        <div className="text-center">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-blue-400">Why Choose Teazy Tech</h2>
          <p className="mt-3 font-display text-3xl font-bold text-brand tracking-tight font-font md:text-2xl">What sets our educational technology services apart</p>
        </div>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon" style={{ backgroundColor: "rgba(47, 111, 204, 0.1)" }}>
              <i className="fas fa-graduation-cap" style={{ color: "var(--primary-blue)" }}></i>
            </div>
            <h3>Expert Educators</h3>
            <p>Our team combines decades of classroom experience with technical expertise</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon" style={{ backgroundColor: "rgba(68, 187, 164, 0.1)" }}>
              <i className="fas fa-hand-holding-heart" style={{ color: "var(--secondary-teal)" }}></i>
            </div>
            <h3>Teacher-Centered Approach</h3>
            <p>Solutions designed with real teaching challenges in mind</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon" style={{ backgroundColor: "rgba(233, 79, 55, 0.1)" }}>
              <i className="fas fa-tools" style={{ color: "var(--secondary-red)" }}></i>
            </div>
            <h3>Practical Applications</h3>
            <p>Focus on implementable strategies that work in real classrooms</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon" style={{ backgroundColor: "rgba(243, 160, 77, 0.1)" }}>
              <i className="fas fa-sync-alt" style={{ color: "var(--accent-orange)" }}></i>
            </div>
            <h3>Ongoing Support</h3>
            <p>We don't just train and leave - we partner with you for continued success</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon" style={{ backgroundColor: "rgba(35, 52, 99, 0.1)" }}>
              <i className="fas fa-users" style={{ color: "var(--primary-dark-blue)" }}></i>
            </div>
            <h3>Customized Solutions</h3>
            <p>Programs tailored to your specific school, subject, and student needs</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon" style={{ backgroundColor: "rgba(157, 108, 198, 0.1)" }}>
              <i className="fas fa-puzzle-piece" style={{ color: "var(--accent-purple)" }}></i>
            </div>
            <h3>Comprehensive Resources</h3>
            <p>Access to a wide range of tools, templates, and materials</p>
          </div>
        </div>
      </div>
    </section>
  )
}

export default FeaturesSection 