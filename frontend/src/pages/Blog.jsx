import { Link, useNavigate } from "react-router-dom"
import { useState, useEffect } from "react"
import axios from "axios"
import "../styles/Blog.css"

const Blog = () => {
  const [blogPosts, setBlogPosts] = useState([])
  const [categories, setCategories] = useState(["All Categories"])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState("All Categories")
  const [searchQuery, setSearchQuery] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalPosts, setTotalPosts] = useState(0)
  const postsPerPage = 10
  const navigate = useNavigate()                                                                                                                                                                                                                                                                                                                                               

  const fetchPosts = async (page = 1) => {
    setLoading(true)
    try {
      const response = await axios.get(`/api/admin/posts/pagination`, {
        params: { page, limit: postsPerPage },
        withCredentials: true
      })
      const { posts, pagination } = response.data
      const publishedPosts = posts.filter(post => post.status === "published")
      
      setBlogPosts(publishedPosts)
      setCurrentPage(pagination.currentPage)
      setTotalPages(pagination.totalPages)
      setTotalPosts(pagination.total)
      
      if (page === 1) {
        const uniqueCategories = ["All Categories", ...new Set(publishedPosts.map(post => post.category))]
        setCategories(uniqueCategories)
      }
    } catch (err) {
      console.error("Error fetching data:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPosts(currentPage)
  }, [currentPage])

  useEffect(() => {
    window.scroll({ top: 0, left: 0, behavior: "smooth" })
  }, [currentPage])

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

  const handleCategoryChange = (category) => {
    setSelectedCategory(category)
    setCurrentPage(1)
  }

  const handleSearch = (e) => {
    e.preventDefault()
    setCurrentPage(1)
  }

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page)
    }
  }

  const filteredPosts = blogPosts.filter(post => {
    const matchesCategory = selectedCategory === "All Categories" || post.category === selectedCategory
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         post.excerpt.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

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

  return (
    <div className="blog-page">
      <section className="blog-hero">
        <div className="container">
          <div className="blog-hero-content">
            <h1>Blog</h1>
            <p>Insights, tips, and resources for educational technology</p>
          </div>
        </div>
      </section>

      <section className="section blog-content">
        <div className="container">
          <div className="blog-layout">
            <div className="blog-main">
              {filteredPosts.length > 0 ? (
                filteredPosts.map((post) => (
                  <div key={post.id} className="blog-post-card">
                    <div className="blog-post-image">
                      <img src={post.thumbnail} alt={post.title} />
                      <div className="blog-post-category">{post.category}</div>
                    </div>
                    <div className="blog-post-content">
                      <div className="blog-post-meta">
                        <span className="blog-post-date">{post.published_date}</span>
                        <span className="blog-post-author">By Teazy</span>
                        <span className="blog-post-views">{post.views || 0} views</span>
                      </div>
                      <h2>{post.title}</h2>
                      <p>{post.excerpt}</p>
                      <Link 
                        to={`/blog/${post.id}`} 
                        className="blog-post-link"
                        onClick={(e) => trackPostView(post.id, e)}
                      >
                        Read More <i className="fas fa-arrow-right"></i>
                      </Link>
                    </div>
                  </div>
                ))
              ) : (
                <div className="no-posts">
                  <h3>No posts found</h3>
                  <p>Try adjusting your search or category filter</p>
                </div>
              )}

              {totalPosts > postsPerPage && (
                <div className="blog-pagination">
                  <button 
                    className="pagination-btn pagination-prev"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    <i className="fas fa-arrow-left"></i> Prev
                  </button>
                  
                  {[...Array(totalPages)].map((_, i) => {
                    const page = i + 1
                    if (totalPages <= 5) {
                      return (
                        <button
                          key={page}
                          className={`pagination-btn ${currentPage === page ? 'active' : ''}`}
                          onClick={() => handlePageChange(page)}
                        >
                          {page}
                        </button>
                      )
                    }
                    if (page === 1 || page === totalPages || 
                        (page >= currentPage - 1 && page <= currentPage + 1)) {
                      return (
                        <button
                          key={page}
                          className={`pagination-btn ${currentPage === page ? 'active' : ''}`}
                          onClick={() => handlePageChange(page)}
                        >
                          {page}
                        </button>
                      )
                    }
                    if (page === currentPage - 2 || page === currentPage + 2) {
                      return <span key={page} className="pagination-ellipsis">...</span>
                    }
                    return null
                  })}
                  
                  <button 
                    className="pagination-btn pagination-next"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                  >
                    Next <i className="fas fa-arrow-right"></i>
                  </button>
                </div>
              )}
            </div>

            <div className="blog-sidebar">
              <div className="sidebar-widget search-widget">
                <h3>Search</h3>
                <form className="search-form" onSubmit={handleSearch}>
                  <input 
                    type="text" 
                    placeholder="Search blog posts..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <button type="submit">
                    <i className="fas fa-search"></i>
                  </button>
                </form>
              </div>

              <div className="sidebar-widget categories-widget">
                <h3>Categories</h3>
                <ul className="category-list">
                  {categories.map((category, index) => (
                    <li key={index}>
                      <a 
                        href="#" 
                        className={category === selectedCategory ? "active" : ""}
                        onClick={(e) => {
                          e.preventDefault()
                          handleCategoryChange(category)
                        }}
                      >
                        {category}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>

              {recentPosts.length > 0 && (
                <div className="sidebar-widget recent-posts-widget">
                  <h3>Recent Posts</h3>
                  <div className="recent-posts">
                    {recentPosts.map((post) => (
                      <div key={post.id} className="recent-post">
                        <div className="recent-post-image">
                          <img src={post.thumbnail} alt={post.title} />
                        </div>
                        <div className="recent-post-content">
                          <h4>
                            <Link to={`/blog/${post.id}`} onClick={(e) => trackPostView(post.id, e)}>
                              {post.title}
                            </Link>
                          </h4>
                          <div className="recent-post-date">{post.published_date}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="sidebar-widget subscribe-widget">
                <h3>Subscribe</h3>
                <p>Get the latest educational technology updates directly to your inbox.</p>
                <form className="subscribe-form">
                  <input type="email" placeholder="Your email address" required />
                  <button type="submit" className="btn btn-primary">
                    Subscribe
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section blog-cta">
        <div className="container">
          <div className="blog-cta-content text-center">
            <h2>Want to Contribute?</h2>
            <p>
              Share your educational technology expertise with our community. We welcome guest posts from educators and
              technology specialists.
            </p>
            <a href="/contact" className="btn btn-accent">
              Submit a Guest Post
            </a>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Blog