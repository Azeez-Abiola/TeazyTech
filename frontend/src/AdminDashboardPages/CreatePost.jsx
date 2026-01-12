// src/pages/CreatePost.tsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import { Image, Tag, AlertTriangle, Loader2 } from "lucide-react";
import RichTextEditor from "../components/RichTextEditor";
import axios from "axios";
import { z } from "zod";
import { toast, Toaster } from "sonner";

const postSchema = z.object({
  author: z.string().trim().min(4, "Author name is required"),
  title: z.string().trim().min(1, "Title is required"),
  content: z.string().min(1, "Content is required"),
  excerpt: z.string().trim().min(1, "Excerpt is required"),
  category: z.string().trim().min(1, "Category is required"),
  status: z.enum(["draft", "published"]),
});

const CreatePost = () => {
  const navigate = useNavigate();
  const [author, setAuthor] = useState("");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [category, setCategory] = useState("");
  const [thumbnail, setThumbnail] = useState(null);
  const [thumbnailPreview, setThumbnailPreview] = useState("");
  const [status, setStatus] = useState("published");
  const [errors, setErrors] = useState({});
  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get("/api/admin/categories", {
          withCredentials: true,
        });
        setCategories(response.data.map((cat) => cat.name));
      } catch {
        toast.error("Failed to load categories");
      } finally {
        setLoadingCategories(false);
      }
    };
    fetchCategories();
  }, []);

  const handleThumbnailChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith("image/")) {
      setThumbnail(file);
      const reader = new FileReader();
      reader.onload = () => setThumbnailPreview(reader.result);
      reader.readAsDataURL(file);
    } else {
      setThumbnail(null);
      setThumbnailPreview("");
      if (file) toast.error("Please upload a valid image file");
    }
  };

  const clearError = (field) => {
    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[field];
      return newErrors;
    });
  };

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    const trimmedTitle = title.trim();
    const trimmedAuthor = author.trim();
    const trimmedExcerpt = excerpt.trim();
    const trimmedCategory = category.trim();
    const isContentEmpty =
      !content || content.replace(/<[^>]*>/g, "").trim() === "";

    // Thumbnail is optional now
    // if (!thumbnail) {
    //   setErrors((prev) => ({ ...prev, thumbnail: "Thumbnail is required" }));
    //   return;
    // }

    setIsSubmitting(true);

    const validation = postSchema.safeParse({
      author: trimmedAuthor,
      title: trimmedTitle,
      content: isContentEmpty ? "" : content,
      excerpt: trimmedExcerpt,
      category: trimmedCategory,
      status,
    });

    if (!validation.success) {
      const fieldErrors = {};
      validation.error.errors.forEach((err) => {
        fieldErrors[err.path[0]] = err.message;
      });
      setErrors(fieldErrors);
      toast.error("Please fix the errors below");
      setIsSubmitting(false);
      return;
    }

    setErrors((prev) => {
      const { thumbnail, ...rest } = prev;
      return rest;
    });

    try {
      const formData = new FormData();
      formData.append("title", trimmedTitle);
      formData.append("author", trimmedAuthor);
      formData.append("excerpt", trimmedExcerpt);
      formData.append("content", content);
      formData.append("category", trimmedCategory);
      formData.append("status", status);
      if (thumbnail) {
        formData.append("thumbnail", thumbnail);
      }

      if (status === "published") {
        formData.append("published_date", new Date().toISOString());
      }

      const response = await axios.post("/api/admin/create-post", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        withCredentials: true,
      });

      if (response.status === 201) {
        toast.success(`Post "${title}" created successfully!`);
        navigate("/posts", { replace: true });
      }
    } catch (error) {
      toast.error("Failed to create post");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Layout title="Create Post">
      <Toaster richColors position="top-right" />
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <div className="px-6 py-4 bg-[#e94235] text-white">
            <h3 className="text-lg font-medium">Post Details</h3>
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
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Excerpt
              </label>
              <textarea
                value={excerpt}
                onChange={(e) => {
                  setExcerpt(e.target.value);
                  clearError("excerpt");
                }}
                className={`w-full px-3 py-2 border ${errors.excerpt ? "border-red-500" : "border-gray-300"} rounded-md`}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Content
              </label>
              <RichTextEditor
                value={content}
                onChange={setContent}
                uploadImage={uploadImage}
              />
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
                  <Tag className="h-4 w-4 mr-1" />
                  Category
                </label>
                {loadingCategories ? (
                  <div className="animate-pulse py-2 bg-gray-200 rounded-md"></div>
                ) : (
                  <select
                    value={category}
                    onChange={(e) => {
                      setCategory(e.target.value);
                      clearError("category");
                    }}
                    className={`w-full px-3 py-2 border ${errors.category ? "border-red-500" : "border-gray-300"} rounded-md`}
                  >
                    <option value="">Select a category</option>
                    {categories.map((cat, idx) => (
                      <option key={idx} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
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
                    />
                    Draft
                  </label>
                  <label>
                    <input
                      type="radio"
                      checked={status === "published"}
                      onChange={() => setStatus("published")}
                    />
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
                  src={thumbnailPreview}
                  className="w-full h-48 object-cover rounded-md"
                />
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-4">
          <button type="button" onClick={() => navigate("/posts")}>
            Cancel
          </button>
          <button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Publishing..." : "Publish Post"}
          </button>
        </div>
      </form>
    </Layout>
  );
};

export default CreatePost;
