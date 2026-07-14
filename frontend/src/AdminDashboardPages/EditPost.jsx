import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Layout from "../components/Layout";
import { Image, Tag, AlertTriangle, Loader2 } from "lucide-react";
import RichTextEditor from "../components/RichTextEditor";
import axios from "axios";
import { toast, Toaster } from "sonner";
import { isHeicImage, normalizeImageForUpload } from "../lib/normalizeImageForUpload";

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
      const normalized = await normalizeImageForUpload(file);
      const formData = new FormData();
      formData.append("image", normalized);
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

  const handleThumbnailChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isImage = file.type.startsWith("image/") || isHeicImage(file);
    if (!isImage) {
      toast.error("Please upload a valid image file");
      return;
    }

    try {
      const normalized = await normalizeImageForUpload(file);
      setThumbnail(normalized);
      const reader = new FileReader();
      reader.onload = () => setThumbnailPreview(reader.result);
      reader.readAsDataURL(normalized);
    } catch {
      toast.error("Could not process this photo. Try exporting it as JPG first.");
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

  const isFormValid =
    title.trim() !== "" &&
    author.trim() !== "" &&
    excerpt.trim() !== "" &&
    category !== "" &&
    content.replace(/<[^>]*>/g, "").trim() !== "" &&
    (thumbnail !== "" || thumbnail instanceof File);

  if (loading)
    return (
      <Layout title="Edit Post">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#e94235]"></div>
        </div>
      </Layout>
    );

  return (
    <Layout title="Edit Post">
      <Toaster richColors position="top-right" />
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white dark:bg-[#1a1a1a] shadow-md rounded-lg overflow-hidden transition-colors duration-300">
          <div className="px-6 py-4 bg-[#e94235] text-white flex justify-between items-center">
            <h3 className="text-lg font-medium">Edit Post</h3>
          </div>
          <div className="p-6 space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  clearError("title");
                }}
                className={`w-full px-4 py-2 bg-white dark:bg-[#242424] border ${errors.title ? "border-red-500" : "border-gray-300 dark:border-gray-700"} rounded-lg text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-[#e94235]/20 focus:border-[#e94235] transition-all outline-none`}
              />
              {errors.title && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertTriangle className="h-4 w-4 mr-1" />
                  {errors.title}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Author
              </label>
              <input
                type="text"
                value={author}
                onChange={(e) => {
                  setAuthor(e.target.value);
                  clearError("author");
                }}
                className={`w-full px-4 py-2 bg-white dark:bg-[#242424] border ${errors.author ? "border-red-500" : "border-gray-300 dark:border-gray-700"} rounded-lg text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-[#e94235]/20 focus:border-[#e94235] transition-all outline-none`}
              />
              {errors.author && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertTriangle className="h-4 w-4 mr-1" />
                  {errors.author}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Excerpt
              </label>
              <textarea
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                rows={3}
                className="w-full px-4 py-2 bg-white dark:bg-[#242424] border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-[#e94235]/20 focus:border-[#e94235] transition-all outline-none resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Content
              </label>
              <div className="rounded-lg overflow-hidden border border-gray-300 dark:border-gray-700">
                <RichTextEditor
                  value={content}
                  onChange={setContent}
                  uploadImage={uploadImage}
                />
              </div>
              {errors.content && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertTriangle className="h-4 w-4 mr-1" />
                  {errors.content}
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-[#1a1a1a] shadow-md rounded-lg overflow-hidden transition-colors duration-300">
            <div className="px-6 py-4 bg-[#e94235] text-white">
              <h3 className="text-lg font-medium">Post Settings</h3>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  <Tag className="h-4 w-4 mr-1" /> Category
                </label>
                {loadingCategories ? (
                  <div className="animate-pulse h-10 bg-gray-200 dark:bg-gray-800 rounded-md"></div>
                ) : (
                  <>
                    <select
                      value={category}
                      onChange={(e) => {
                        setCategory(e.target.value);
                        clearError("category");
                      }}
                      className={`w-full px-4 py-2 bg-white dark:bg-[#242424] border ${errors.category ? "border-red-500" : "border-gray-300 dark:border-gray-700"} rounded-lg text-gray-900 dark:text-gray-100 shadow-sm focus:ring-2 focus:ring-[#e94235]/20 focus:border-[#e94235] transition-all outline-none appearance-none cursor-pointer`}
                      style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%236B7280'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`, backgroundPosition: 'right 0.75rem center', backgroundSize: '1.25rem', backgroundRepeat: 'no-repeat' }}
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
                      <p className="mt-2 text-sm text-yellow-600 dark:text-yellow-500">
                        No categories available. Please{" "}
                        <a
                          href="/categories"
                          className="text-[#e94235] underline hover:text-[#d23c30]"
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
            </div>
          </div>

          <div className="bg-white dark:bg-[#1a1a1a] shadow-md rounded-lg overflow-hidden transition-colors duration-300">
            <div className="px-6 py-4 bg-[#e94235] text-white">
              <h3 className="text-lg font-medium">Featured Image</h3>
            </div>
            <div className="p-6 space-y-4">
              <input
                type="file"
                accept="image/*,.heic,.heif"
                onChange={handleThumbnailChange}
                className="text-sm text-gray-500 dark:text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-red-50 dark:file:bg-red-900/20 file:text-red-700 dark:file:text-red-400 hover:file:bg-red-100 dark:hover:file:bg-red-900/30 transition-all cursor-pointer"
              />
              {thumbnailPreview && (
                <div className="relative group mt-4">
                  <img
                    src={thumbnailPreview || "/default-blog-thumbnail.png"}
                    className="w-full h-48 object-cover rounded-lg border border-gray-200 dark:border-gray-800"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = "/default-blog-thumbnail.png";
                    }}
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-lg">
                    <p className="text-white text-sm font-medium">Change Image</p>
                  </div>
                </div>
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

        <div className="flex items-center justify-end gap-4 pb-8">
          <button
            type="button"
            onClick={() => navigate("/posts")}
            className="px-6 py-2.5 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-all font-medium"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting || !isFormValid}
            className="px-8 py-2.5 bg-[#e94235] text-white rounded-lg hover:bg-[#d23c30] transition-all font-medium shadow-md shadow-red-500/20 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="animate-spin h-5 w-5" />
                Updating...
              </>
            ) : (
              "Update Post"
            )}
          </button>
        </div>
      </form>
    </Layout>
  );
};

export default EditPost;
