import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";
import BlogCardIconHeader from "../blog/BlogCardIconHeader";
import "../../styles/BlogCard.css";

/**
 * Foresight-style "( OUR BLOG )" rail: an infinite horizontal marquee
 * of blog cards (image, uppercase title, category), paused on hover.
 * Section shell always renders so production never shows a missing block
 * when the API is slow, empty, or temporarily unavailable.
 */
const BlogMarquee = () => {
  const [blogPosts, setBlogPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchFailed, setFetchFailed] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await axios.get(`/api/admin/posts`);
        const published = response.data.filter(
          (post) => post.status === "published",
        );
        setBlogPosts(published.slice(0, 8));
        setFetchFailed(false);
      } catch (err) {
        console.error("Error fetching blog posts:", err);
        setFetchFailed(true);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  const trackPostView = async (postId, e) => {
    e.preventDefault();
    try {
      await axios.post(`/api/posts/${postId}/view`);
      navigate(`/blog/${postId}`);
    } catch (error) {
      console.error("Error tracking view:", error);
      navigate(`/blog/${postId}`);
    }
  };

  const rail = blogPosts.length > 0 ? [...blogPosts, ...blogPosts] : [];

  return (
    <section className="overflow-hidden border-t border-white/10 bg-[#233463] py-20">
      <div className="container">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="font-display text-4xl font-medium uppercase leading-[0.95] !text-white md:text-5xl">
              Our
              <br />
              Blog
            </h2>
            <div className="mt-3 h-[2px] w-24 bg-gradient-to-r from-white/60 to-transparent" />
          </div>
          <Link
            to="/blog"
            className="text-[11px] font-bold uppercase tracking-[0.2em] text-white/70 transition-colors hover:text-white"
          >
            View all posts
          </Link>
        </div>
      </div>

      <div className="mt-14 w-full overflow-hidden">
        {loading ? (
          <p className="container text-sm text-white/50">Loading blog posts…</p>
        ) : blogPosts.length === 0 ? (
          <div className="container">
            <p className="max-w-xl text-sm leading-7 text-white/60">
              {fetchFailed
                ? "Blog posts could not be loaded right now. Visit the blog page directly or try again shortly."
                : "New articles will appear here once they are published."}
            </p>
            <Link
              to="/blog"
              className="mt-6 inline-flex items-center gap-2 border-b border-white/40 pb-1 text-[11px] font-bold uppercase tracking-[0.2em] text-white transition-colors hover:border-white"
            >
              Go to blog
            </Link>
          </div>
        ) : (
          <div
            className="flex w-max !max-w-none flex-nowrap animate-marquee"
            style={{ animationDuration: "22s" }}
          >
            {rail.map((post, index) => (
              <Link
                key={`${post.id}-${index}`}
                to={`/blog/${post.id}`}
                onClick={(e) => trackPostView(post.id, e)}
                className="group mx-3 w-[280px] shrink-0 sm:w-[320px]"
              >
                <div className="aspect-[4/5] overflow-hidden">
                  <BlogCardIconHeader category={post.category} dark compact />
                </div>

                <h3 className="mt-4 truncate text-[13px] font-bold uppercase tracking-[0.15em] !text-white">
                  {post.title}
                </h3>
                <p className="mt-1 text-xs capitalize text-white/50">
                  {post.category}
                </p>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default BlogMarquee;
