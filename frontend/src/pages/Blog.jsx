import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";
import Logo from "../components/Logo";
import "../styles/Blog.css";
import Grainient from "../components/ui/Grainient";
import { FaSearch } from "react-icons/fa";
import { motion } from "framer-motion";

const Blog = () => {
  const [blogPosts, setBlogPosts] = useState([]);
  const [categories, setCategories] = useState(["All Categories"]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalPosts, setTotalPosts] = useState(0);
  const postsPerPage = 10;
  const navigate = useNavigate();

  const fetchPosts = async (page = 1) => {
    setLoading(true);
    try {
      const response = await axios.get(`/api/admin/posts/pagination`, {
        params: { page, limit: postsPerPage },
        withCredentials: true,
      });
      const { posts, pagination } = response.data;
      const publishedPosts = posts.filter(
        (post) => post.status === "published",
      );

      setBlogPosts(publishedPosts);
      setCurrentPage(pagination.currentPage);
      setTotalPages(pagination.totalPages);
      setTotalPosts(pagination.total);

      if (page === 1) {
        const uniqueCategories = [
          "All Categories",
          ...new Set(publishedPosts.map((post) => post.category)),
        ];
        setCategories(uniqueCategories);
      }
    } catch (err) {
      console.error("Error fetching data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts(currentPage);
  }, [currentPage]);

  useEffect(() => {
    window.scroll({ top: 0, left: 0, behavior: "smooth" });
  }, [currentPage]);

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

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    setCurrentPage(1);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
  };

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const filteredPosts = blogPosts.filter((post) => {
    const matchesCategory =
      selectedCategory === "All Categories" ||
      post.category === selectedCategory;
    const matchesSearch =
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const recentPosts = blogPosts.slice(0, 3);

  if (loading) {
    return (
      <div className="blog-preloader">
        <Logo />
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden flex flex-col items-center justify-center pt-10">
      <div className="absolute inset-0 z-0">
        <Grainient
          color1="#9ca9cc"
          color2="#4a6bc5"
          // color3="#B497CF"
          // color4="#2F6FCC"
          timeSpeed={0.25}
          colorBalance={0}
          warpStrength={1}
          warpFrequency={5}
          warpSpeed={2}
          warpAmplitude={50}
          blendAngle={0}
          blendSoftness={0.05}
          rotationAmount={500}
          noiseScale={2}
          grainAmount={0.1}
          grainScale={2}
          grainAnimated={false}
          contrast={1.5}
          gamma={1}
          saturation={1.15}
          centerX={0}
          centerY={0}
          zoom={1.3}
        />
      </div>
      {/* ================= CONTENT ================= */}
      <section className="relative my-14 z-10 w-[90%]">
        <div className="mb-10">
          <h2 className="text-7xl font-bold text-slate-100">Our Blog</h2>

          <p className="text-slate-100 mt-3">
            Browse our latest educational resources.
          </p>
        </div>
        <div className="flex w-full items-center gap-4 mb-10">
          <form
            onSubmit={handleSearch}
            className="flex flex-1 items-center rounded-xl border border-gray-300 bg-white/50 px-4 py-3"
          >
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search..."
              className="flex-1 border-none bg-transparent text-black placeholder:text-gray-500 outline-none"
            />

            <FaSearch className="text-gray-600" />
          </form>

          <select
            defaultValue="all"
            className="w-48 rounded-xl border border-gray-300 bg-white/50 px-4 py-3 outline-none"
          >
            <option value="all">All</option>
            {/* <option value="1">1</option>
            <option value="2">2</option>
            <option value="3">3</option> */}
          </select>
        </div>
        <div className="mx-auto">
          <div className="gap-10">
            {/* ================= MAIN ================= */}
            <div>
              {filteredPosts.length > 0 ? (
                <div className="grid grid-cols-1 gap-8 md:grid-cols-2 xl:grid-cols-3">
                  {filteredPosts.map((post, index) => (
                    <motion.article
                      key={post.id}
                      initial={{ opacity: 0, y: 60 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, margin: "-60px" }}
                      transition={{
                        duration: 0.6,
                        ease: "easeOut",
                        delay: (index % 3) * 0.12,
                      }}
                      className="group flex flex-col overflow-hidden rounded-2xl bg-white shadow-sm border border-slate-200 hover:shadow-xl hover:-translate-y-1.5 transition duration-300"
                    >
                      <Link
                        to={`/blog/${post.id}`}
                        onClick={(e) => trackPostView(post.id, e)}
                        className="relative block aspect-[16/10] overflow-hidden bg-slate-100"
                      >
                        {/* Blurred fill so odd-shaped thumbnails never look cut off */}
                        <img
                          src={post.thumbnail || "/default-blog-thumbnail.png"}
                          alt=""
                          aria-hidden="true"
                          className="absolute inset-0 h-full w-full scale-110 object-cover opacity-60 blur-lg"
                        />
                        <img
                          src={post.thumbnail || "/default-blog-thumbnail.png"}
                          alt={post.title}
                          className="relative h-full w-full object-contain transition duration-500 group-hover:scale-[1.04]"
                        />

                        <div className="absolute top-4 left-4">
                          <span className="rounded-full bg-blue-600 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-white shadow-lg">
                            {post.category}
                          </span>
                        </div>
                      </Link>

                      <div className="flex flex-1 flex-col p-6">
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
                          <span>👤 {post.author}</span>

                          <span>📅 {post.published_date}</span>

                          <span>👁 {post.views || 0}</span>
                        </div>

                        <Link
                          to={`/blog/${post.id}`}
                          onClick={(e) => trackPostView(post.id, e)}
                        >
                          <h2 className="mt-3 text-xl font-bold leading-snug text-slate-900 line-clamp-2 transition group-hover:text-blue-600">
                            {post.title}
                          </h2>
                        </Link>

                        <p className="mt-3 text-sm leading-6 text-slate-600 line-clamp-3">
                          {post.excerpt}
                        </p>

                        <Link
                          to={`/blog/${post.id}`}
                          onClick={(e) => trackPostView(post.id, e)}
                          className="mt-auto inline-flex items-center gap-2 pt-5 text-sm font-semibold text-blue-600"
                        >
                          Read More
                          <i className="fas fa-arrow-right transition group-hover:translate-x-1.5"></i>
                        </Link>
                      </div>
                    </motion.article>
                  ))}
                </div>
              ) : (
                <div className="bg-white/50 shadow p-16 text-center shadow">
                  <h3 className="text-3xl font-bold">No Posts Found</h3>

                  <p className="text-slate-100 mt-3">
                    Try changing your search or category.
                  </p>
                </div>
              )}

              {/* ================= Pagination ================= */}
              {totalPosts > postsPerPage && (
                <div className="flex justify-center flex-wrap gap-3 mt-16">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="h-11 px-5 rounded-xl border bg-white hover:bg-slate-100 transition"
                  >
                    Prev
                  </button>

                  {[...Array(totalPages)].map((_, i) => {
                    const page = i + 1;

                    return (
                      <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        className={`w-11 h-11 rounded-xl transition ${
                          currentPage === page
                            ? "bg-blue-600 text-white"
                            : "bg-white border hover:bg-slate-100"
                        }`}
                      >
                        {page}
                      </button>
                    );
                  })}

                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="h-11 px-5 rounded-xl border bg-white hover:bg-slate-100 transition"
                  >
                    Next
                  </button>
                </div>
              )}
            </div>

            {/* Recent */}

            {/* <div className="rounded-3xl bg-white p-8 shadow border">
                  <h3 className="text-2xl font-bold text-black mb-6">Recent Posts</h3>

                  <div className="space-y-5">
                    {recentPosts.map((post) => (
                      <Link
                        key={post.id}
                        to={`/blog/${post.id}`}
                        onClick={(e) => trackPostView(post.id, e)}
                        className="flex gap-4 group"
                      >
                        <img
                          src={post.thumbnail || "/default-blog-thumbnail.png"}
                          className="w-20 h-20 rounded-xl object-cover"
                        />

                        <div>
                          <h4 className="font-semibold group-hover:text-blue-600 transition">
                            {post.title}
                          </h4>

                          <p className="text-sm text-slate-500 mt-1">
                            {post.published_date}
                          </p>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div> */}

            {/* Subscribe */}

            {/* */}
          </div>
        </div>
      </section>

      <div className="relative overflow-hidden w-full bg-gradient-to-br from-[#0F172A] via-[#1E3A8A] to-[#3B82F6] p-8 text-white shadow-2xl">
        {/* Background decoration */}
        <div className="absolute -right-12 -top-12 h-40 w-40 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -bottom-16 -left-10 h-36 w-36 rounded-full bg-cyan-400/20 blur-3xl" />

        <div className="relative z-10">
          <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 backdrop-blur">
            ✉️
          </div>

          <h3 className="text-3xl font-bold leading-tight">Stay in the Loop</h3>

          <p className="mt-3 text-sm leading-7 text-white/75">
            Get exclusive articles, development tips, design inspiration, and
            curated resources delivered straight to your inbox. No
            spam—unsubscribe anytime.
          </p>

          <form className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="flex-1 rounded-2xl border border-white/15 bg-white/10 p-1 backdrop-blur-md">
              <input
                type="email"
                placeholder="Enter your email address"
                className="w-full rounded-xl bg-transparent px-4 py-3 text-white placeholder:text-white/50 outline-none"
              />
            </div>

            <button
              type="submit"
              className="group flex items-center justify-center gap-2 rounded-2xl bg-white px-6 py-3.5 font-semibold text-slate-900 transition-all duration-300 hover:scale-[1.02] hover:bg-slate-100 active:scale-[0.98] sm:w-auto"
            >
              Subscribe Now
              <span className="transition-transform duration-300 group-hover:translate-x-1">
                →
              </span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Blog;
