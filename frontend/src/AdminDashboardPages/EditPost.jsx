import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Layout from "../components/Layout";
import { Image, Tag, AlertTriangle, Loader2 } from "lucide-react";
import RichTextEditor from "../components/RichTextEditor";
import axios from "axios";
import { toast, Toaster } from "sonner";

const EditPost = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [content, setContent] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [category, setCategory] = useState("");
  const [thumbnail, setThumbnail] = useState("");
  const [thumbnailPreview, setThumbnailPreview] = useState("");
  const [status, setStatus] = useState("draft");
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const uploadImage = async (file) => {
    try {
      const formData = new FormData();
      formData.append("image", file);
      const res = await axios.post("/api/admin/upload-image", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        withCredentials: true,
      });
      return res.data.url;
    } catch {
      toast.error("Image upload failed");
      return "";
    }
  };

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await axios.get("/api/admin/categories", {
          withCredentials: true,
        });
        setCategories(res.data.map((c) => c.name));
      } catch {
        toast.error("Failed to load categories");
      } finally {
        setLoadingCategories(false);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const res = await axios.get(`/api/admin/posts/${id}`, {
          withCredentials: true,
        });
        const post = res.data;
        setTitle(post.title);
        setAuthor(post.author);
        setContent(post.content || "");
        setExcerpt(post.excerpt || "");
        setCategory(post.category);
        setThumbnail(post.thumbnail || "");
        setThumbnailPreview(post.thumbnail || "");
        setStatus(post.status);
      } catch {
        toast.error("Failed to load post");
      } finally {
        setLoading(false);
      }
    };
    fetchPost();
  }, [id]);

  const handleThumbnailChange = (e) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith("image/")) {
      setThumbnail(file);
      const reader = new FileReader();
      reader.onload = () => setThumbnailPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const clearError = (field) =>
    setErrors((prev) => {
      const copy = { ...prev };
      delete copy[field];
      return copy;
    });

  const validateForm = () => {
    const newErrors = {};
    if (!title.trim()) newErrors.title = "Title is required";
    if (!author.trim()) newErrors.author = "Author is required";
    if (!content || content.replace(/<[^>]+>/g, "").trim() === "")
      newErrors.content = "Content is required";
    if (!category) newErrors.category = "Category is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("title", title.trim());
      formData.append("author", author.trim());
      formData.append("excerpt", excerpt.trim());
      formData.append("content", content);
      formData.append("category", category);
      formData.append("status", status);

      if (thumbnail instanceof File) {
        formData.append("thumbnail", thumbnail);
      } else if (thumbnail) {
        formData.append("thumbnail", thumbnail);
      }

      if (status === "published") {
        formData.append("published_date", new Date().toISOString());
      }

      console.log("Sending update data:", {
        title: title.trim(),
        author: author.trim(),
        excerpt: excerpt.trim(),
        content: content ? "content exists" : "no content",
        category,
        status,
        hasThumbnail: !!thumbnail,
      });

      await axios.patch(`/api/admin/posts/${id}`, formData, {
        withCredentials: true,
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success("Post updated successfully");
      navigate("/posts");
    } catch (error) {
      console.error("Failed to update post:", error);
      if (error.response?.data?.errors) {
        const serverErrors = {};
        error.response.data.errors.forEach((err) => {
          serverErrors[err.field] = err.message;
        });
        setErrors(serverErrors);
        toast.error("Please fix the validation errors");
      } else {
        toast.error("Failed to update post");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading)
    return (
      <Layout title="Edit Post">
        <div className="flex justify-center items-center h-64">
          <Loader2 className="animate-spin h-12 w-12 text-[#e94235]" />
        </div>
      </Layout>
    );

  return (
    <Layout title="Edit Post">
      <Toaster richColors position="top-right" />
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <div className="px-6 py-4 bg-[#e94235] text-white">
            <h3 className="text-lg font-medium">Edit Post</h3>
          </div>
          <div className="p-6 space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  clearError("title");
                }}
                className={`w-full px-3 py-2 border ${errors.title ? "border-red-500" : "border-gray-300"} rounded-md`}
              />
              {errors.title && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertTriangle className="h-4 w-4 mr-1" />
                  {errors.title}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Author
              </label>
              <input
                type="text"
                value={author}
                onChange={(e) => {
                  setAuthor(e.target.value);
                  clearError("author");
                }}
                className={`w-full px-3 py-2 border ${errors.author ? "border-red-500" : "border-gray-300"} rounded-md`}
              />
              {errors.author && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertTriangle className="h-4 w-4 mr-1" />
                  {errors.author}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Excerpt
              </label>
              <textarea
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>

            <div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Content
                </label>
                <RichTextEditor
                  value={content}
                  onChange={setContent}
                  uploadImage={uploadImage}
                />
                {errors.content && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <AlertTriangle className="h-4 w-4 mr-1" />
                    {errors.content}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white shadow-md rounded-lg overflow-hidden">
            <div className="px-6 py-4 bg-[#e94235] text-white">
              <h3 className="text-lg font-medium">Post Settings</h3>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="flex items-center text-sm font-medium text-gray-700 mb-1">
                  <Tag className="h-4 w-4 mr-1" /> Category
                </label>
                {loadingCategories ? (
                  <div className="animate-pulse py-2 bg-gray-200 rounded-md"></div>
                ) : (
                  <>
                    <select
                      value={category}
                      onChange={(e) => {
                        setCategory(e.target.value);
                        clearError("category");
                      }}
                      className={`w-full px-3 py-2 border ${errors.category ? "border-red-500" : "border-gray-300"} rounded-md`}
                      disabled={categories.length === 0}
                    >
                      <option value="">Select a category</option>
                      {categories.map((cat, i) => (
                        <option key={i} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                    {categories.length === 0 && (
                      <p className="mt-2 text-sm text-yellow-600">
                        No categories available. Please{" "}
                        <a
                          href="/categories"
                          className="text-[#e94235] underline"
                        >
                          add categories
                        </a>{" "}
                        first.
                      </p>
                    )}
                    {errors.category && (
                      <p className="mt-1 text-sm text-red-600 flex items-center">
                        <AlertTriangle className="h-4 w-4 mr-1" />
                        {errors.category}
                      </p>
                    )}
                  </>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <div className="flex items-center gap-4">
                  <label>
                    <input
                      type="radio"
                      checked={status === "draft"}
                      onChange={() => setStatus("draft")}
                    />{" "}
                    Draft
                  </label>
                  <label>
                    <input
                      type="radio"
                      checked={status === "published"}
                      onChange={() => setStatus("published")}
                    />{" "}
                    Published
                  </label>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white shadow-md rounded-lg overflow-hidden">
            <div className="px-6 py-4 bg-[#e94235] text-white">
              <h3 className="text-lg font-medium">Featured Image</h3>
            </div>
            <div className="p-6 space-y-4">
              <input
                type="file"
                accept="image/*"
                onChange={handleThumbnailChange}
              />
              {thumbnailPreview && (
                <img
                  src={thumbnailPreview || "/default-blog-thumbnail.png"}
                  className="w-full h-48 object-cover rounded-md"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "/default-blog-thumbnail.png";
                  }}
                />
              )}
              {errors.thumbnail && (
                <p className="mt-2 text-sm text-red-600 flex items-center">
                  <AlertTriangle className="h-4 w-4 mr-1" />
                  {errors.thumbnail}
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-4">
          <button
            type="button"
            onClick={() => navigate("/posts")}
            className="px-4 py-2 border rounded-md"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-4 py-2 bg-[#e94235] text-white rounded-md"
          >
            {isSubmitting ? (
              <Loader2 className="animate-spin h-5 w-5 mr-2 inline-block" />
            ) : null}
            {isSubmitting ? "Updating..." : "Update Post"}
          </button>
        </div>
      </form>
    </Layout>
  );
};

export default EditPost;
