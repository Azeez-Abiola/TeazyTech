import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";

/**
 * Foresight-style "( OUR BLOG )" rail: an infinite horizontal marquee
 * of blog cards (image, uppercase title, category), paused on hover.
 */
const BlogMarquee = () => {
  const [blogPosts, setBlogPosts] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await axios.get(`/api/admin/posts`);
        const published = response.data.filter(
          (post) => post.status === "published",
        );
        setBlogPosts(published.slice(0, 8));
      } catch (err) {
        console.error("Error fetching blog posts:", err);
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

  if (blogPosts.length === 0) return null;

  // Track is rendered twice so the -50% translate loops seamlessly
  const rail = [...blogPosts, ...blogPosts];

  return (
    <section className="overflow-hidden border-t border-white/10 bg-[#233463] py-20">
      <div className="container">
        <h2 className="font-display text-4xl font-medium uppercase leading-[0.95] !text-white md:text-5xl">
          (Our
          <br />
          Blog)
        </h2>
        <div className="mt-3 h-[2px] w-24 bg-gradient-to-r from-white/60 to-transparent" />
      </div>

      <div className="mt-14 w-full overflow-hidden">
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
              <div className="aspect-[4/5] overflow-hidden bg-white/10">
                <img
                  src={post.thumbnail || "/default-blog-thumbnail.png"}
                  alt={post.title}
                  loading="lazy"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "/default-blog-thumbnail.png";
                  }}
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
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
      </div>
    </section>
  );
};

export default BlogMarquee;
