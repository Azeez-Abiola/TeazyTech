import { Link } from "react-router-dom"

const AboutPreview = () => {
  return (
    <section className="section about-preview">
      <div className="container">
        <div className="about-preview-content">
          <div className="about-preview-text">
            <h2>About Teazy Tech</h2>
            <p>
              At Teazy Tech, we believe that in this digital age, every teacher should have access to resources that
              help make learning more dynamic, engaging, and impactful.
            </p> 
            <p>
              Our mission is to equip teachers with the knowledge of educational technology, helping them thrive and
              adapt confidently within the modern, technology, helping them thrive and adapt confidently within the
              modern, digital classroom.
            </p>
            <Link to="/about" className="btn btn-secondary">
              Learn More About Us
            </Link>
          </div>
          <div className="about-preview-image">
            <img 
              src="https://images.unsplash.com/photo-1577896851231-70ef18881754?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80" 
              alt="Teachers collaborating" 
            />
          </div>
        </div>
      </div>
    </section>
  )
}

export default AboutPreview 