import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";
import BlogCardIconHeader from "../blog/BlogCardIconHeader";
import "../../styles/BlogCard.css";

const BlogPreview = () => {
    const [blogPosts, setBlogPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchPosts = async () => {
            try {
                const postsResponse = await axios.get(`/api/admin/posts`);
                const publishedPosts = postsResponse.data.filter(
                    (post) => post.status === "published"
                );
                setBlogPosts(publishedPosts);
            } catch (err) {
                console.error("Error fetching data:", err);
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

    const recentPosts = blogPosts.slice(0, 3);

    if (loading || recentPosts.length === 0) {
        return null;
    }

    const [featured, ...rest] = recentPosts;

    const PostCard = ({ post, featured: isFeatured = false }) => (
        <article className={isFeatured ? "tt-mag__featured" : "tt-mag__card"}>
            <div className="tt-mag__img tt-mag__img--icon">
                <BlogCardIconHeader category={post.category} compact />
            </div>
            <div className="tt-mag__body">
                <p className="tt-mag__date">{post.published_date}</p>
                <h3>{post.title}</h3>
                <p className="tt-mag__author">{post.author}</p>
                <p>{post.excerpt}</p>
                <Link
                    to={`/blog/${post.id}`}
                    className="tt-mag__link"
                    onClick={(e) => trackPostView(post.id, e)}
                >
                    Read More <i className="fas fa-arrow-right" />
                </Link>
            </div>
        </article>
    );

    return (
        <section className="tt-mag">
            <div className="container-wide">
                <div className="tt-mag__head">
                    <div>
                        <h2>Latest from Our Blog</h2>
                        <p>Insights and tips for educational technology</p>
                    </div>
                    <Link to="/blog" className="btn btn-outline">
                        View All Posts
                    </Link>
                </div>
                <div className="tt-mag__grid">
                    <PostCard post={featured} featured />
                    {rest.map((post) => (
                        <PostCard key={post.id} post={post} />
                    ))}
                </div>
            </div>
        </section>
    );
};

export default BlogPreview;
