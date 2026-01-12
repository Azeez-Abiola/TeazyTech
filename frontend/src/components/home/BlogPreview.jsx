import { Link, useNavigate } from "react-router-dom"
import { useState, useEffect } from "react"
import axios from "axios"

const BlogPreview = () => {
   const [blogPosts, setBlogPosts] = useState([])
   const [loading, setLoading] = useState(true)

   const navigate = useNavigate()

    useEffect(() => {
    const fetchPosts = async () => {
      try {
        const postsResponse = await axios.get(`/api/admin/posts`)
        const publishedPosts = postsResponse.data.filter(post => post.status === "published")
        setBlogPosts(publishedPosts)
      } catch (err) {
        console.error("Error fetching data:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchPosts()
  }, [])

    const trackPostView = async (postId, e) => {
      e.preventDefault()
      
      try {
        await axios.post(`/api/posts/${postId}/view`)
        navigate(`/blog/${postId}`)
      } catch (error) {
        console.error("Error tracking view:", error)
        navigate(`/blog/${postId}`)
      }
    }
   const recentPosts = blogPosts.slice(0, 3)

   if (loading) {
    return (
      <div className="blog-page">
        <section className="blog-hero">
          <div className="container">
            <div className="blog-hero-content">
              <h1>Loading Blog...</h1>
            </div>
          </div>
        </section>
      </div>
    )
  }
  if (recentPosts.length === 0) {
    return (
      <div className="blog-page">
        <section className="blog-hero">
          <div className="container">
            <div className="blog-hero-content">
              <h1>No Recent Posts Available</h1>
            </div>
          </div>
        </section>
      </div>
    )
  }
  return (
    <section className="section blog-preview">
      <div className="container">
        <div className="section-header text-center">
          <h2>Latest from Our Blog</h2>
          <p>Insights and tips for educational technology</p>
        </div>
        <div className="blog-preview-grid">
          {recentPosts.map((post) => (
          <div key={post.id} className="blog-card">
            <div className="blog-card-image">
              <img 
                src={post.thumbnail || "/default-blog-thumbnail.png"}
                alt={post.title} 
                onError={(e) => {
                  e.target.onerror = null; 
                  e.target.src = "/default-blog-thumbnail.png";
                }}
              />
            </div>
            <div className="blog-card-content">
              <div className="blog-card-date">{post.published_date}</div>
              <h3>{post.title}</h3>
              <strong className="font-semibold italic">{post.author}</strong>
              <p>{post.excerpt}</p>
                <Link to={`/blog/${post.id}`} onClick={(e) => trackPostView(post.id, e)}>
                   Read More
               </Link>
            </div>
          </div>
            ))}
        </div>
        <div className="blog-preview-cta text-center">
          <Link to="/blog" className="btn btn-primary">
            View All Posts
          </Link>
        </div>
      </div>
    </section>
  )
}

export default BlogPreview 