import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";
import "../styles/ViewBlog.css";

const ViewBlog = () => {
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  useEffect(() => {
    window.scroll({ top: 0, left: 0, behaviour: "smooth" });
  }, []);
  useEffect(() => {
    const fetchData = async () => {
      try {
        await axios
          .post(
            `/api/posts/${id}/view`,
            {},
            {
              headers: { "Content-Type": "application/json" },
              withCredentials: true,
            },
          )
          .catch((e) => console.warn("View tracking failed:", e.message));

        const response = await axios.get(`/api/admin/posts/${id}`, {
          headers: { "Content-Type": "application/json" },
        });

        if (!response.data) throw new Error("Post data missing");
        if (response.data.status !== "published")
          throw new Error("Post not published");

        setPost({
          author: response.data.author || "Unauthored post",
          title: response.data.title || "Untitled Post",
          content: response.data.content || "<p>Content not available</p>",
          thumbnail: response.data.thumbnail || "",
          published_date: response.data.published_date || "date not available",
          category: response.data.category || "Uncategorized",
          views: response.data.views || 0,
        });
      } catch (err) {
        setError(
          err.response?.data?.message || err.message || "Failed to load post",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const createMarkup = (html) => {
    try {
      return { __html: html || "" };
    } catch (e) {
      return { __html: "<p>Error displaying content</p>" };
    }
  };

  if (loading) return <div className="loading-spinner"></div>;
  if (error) return <div className="error-message">{error}</div>;
  if (!post) return <div className="not-found">Post not found</div>;

  return (
    <div className="blog-container">
      {/* Hero Section */}
      <header className="blog-header">
        <div className="header-content">
          <h1 className="blog-title">{post.title}</h1>
          <div className="blog-meta">
            <h3 className="blog-author">Author: {post.author}</h3>
            <span className="publish-date">
              {post?.published_date || "Date not available"}
            </span>
            <span className="category-tag">{post.category}</span>
            <span className="view-count">{post.views} views</span>
          </div>
        </div>
      </header>

      {/* Featured Image */}
      {post.thumbnail && (
        <div className="featured-image-container">
          <img
            src={post.thumbnail}
            alt={post.title}
            className="featured-image"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = "/default-blog-thumbnail.png";
              e.target.classList.add("error-image");
            }}
          />
        </div>
      )}

      {/* Main Content */}
      <main className="blog-main-content">
        <article className="blog-article">
          <div
            className="article-content"
            dangerouslySetInnerHTML={createMarkup(post.content)}
          />
        </article>

        {/* Sidebar */}
        <aside className="blog-sidebar">
          <div className="sidebar-section">
            <h3>About {post.category}</h3>
            <p>Explore more {post.category} articles</p>
            <a
              href={`/blog?category=${encodeURIComponent(post.category)}`}
              className="category-link"
            >
              View all {post.category} posts →
            </a>
          </div>
        </aside>
      </main>

      {/* Footer CTA */}
      <footer className="blog-footer">
        <a href="/blog" className="back-to-blog">
          ← Back to Blog Home
        </a>
      </footer>
    </div>
  );
};

export default ViewBlog;
