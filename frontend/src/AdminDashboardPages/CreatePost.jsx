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

    // Load autosaved data
    const savedPost = localStorage.getItem("teazy_autosave_post");
    if (savedPost) {
      try {
        const data = JSON.parse(savedPost);
        setTitle(data.title || "");
        setAuthor(data.author || "");
        setContent(data.content || "");
        setExcerpt(data.excerpt || "");
        setCategory(data.category || "");
        toast.info("Restored unpublished changes", {
          description: "We found unsaved content and restored it for you.",
          action: {
            label: "Clear",
            onClick: () => {
              localStorage.removeItem("teazy_autosave_post");
              setTitle("");
              setAuthor("");
              setContent("");
              setExcerpt("");
              setCategory("");
            },
          },
        });
      } catch (e) {
        console.error("Failed to parse autosaved post", e);
      }
    }
  }, []);

  // Autosave when content changes
  useEffect(() => {
    const postData = { title, author, content, excerpt, category };
    // Only save if at least one field is not empty
    if (Object.values(postData).some(val => val.trim() !== "")) {
      localStorage.setItem("teazy_autosave_post", JSON.stringify(postData));
    }
  }, [title, author, content, excerpt, category]);

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
  const compressImage = async (file) => {
    if (!(file instanceof File)) return file;

    return new Promise((resolve, reject) => {
      const img = new Image();
      const url = URL.createObjectURL(file);

      img.onload = () => {
        URL.revokeObjectURL(url);
        const canvas = document.createElement("canvas");
        let width = img.width;
        let height = img.height;

        // Max dimensions 1200px
        const MAX_WIDTH = 1200;
        const MAX_HEIGHT = 1200;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob((blob) => {
          if (!blob) {
            reject(new Error("Compression failed"));
            return;
          }
          const compressedFile = new File([blob], file.name.replace(/\.[^/.]+$/, "") + ".jpg", { type: "image/jpeg" });
          console.log(`Optimized: ${file.size / 1024}KB -> ${compressedFile.size / 1024}KB`);
          resolve(compressedFile);
        }, "image/jpeg", 0.7);
      };

      img.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error("Failed to load image"));
      };

      img.src = url;
    });
  };

  const uploadImage = async (file) => {
    const loadingToastId = toast.loading("Optimizing and uploading image...");
    try {
      const optimizedFile = await compressImage(file);
      const formData = new FormData();
      formData.append("image", optimizedFile);
      const res = await axios.post("/api/admin/upload-image", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        withCredentials: true,
      });
      toast.success("Image uploaded successfully!", { id: loadingToastId });
      return res.data.url;
    } catch (err) {
      console.error("Upload failed:", err);
      toast.error("Image upload failed. Try a smaller image.", { id: loadingToastId });
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
      let finalThumbnail = thumbnail;

      // Compress thumbnail if it exists
      if (thumbnail instanceof File) {
        const loadingToastId = toast.loading("Optimizing thumbnail...");
        try {
          finalThumbnail = await compressImage(thumbnail);
          toast.success("Thumbnail optimized!", { id: loadingToastId });
        } catch (e) {
          console.error("Compression failed:", e);
          toast.error("Could not optimize thumbnail, trying original...", { id: loadingToastId });
          finalThumbnail = thumbnail;
        }
      }

      // Final sanity check for size (Vercel limit is 4.5MB)
      if (finalThumbnail && finalThumbnail.size > 4.2 * 1024 * 1024) {
        toast.error("Thumbnail is too large even after optimization. Please use a smaller file.");
        setIsSubmitting(false);
        return;
      }

      const formData = new FormData();
      formData.append("title", trimmedTitle);
      formData.append("author", trimmedAuthor);
      formData.append("excerpt", trimmedExcerpt);
      formData.append("content", content);
      formData.append("category", trimmedCategory);
      formData.append("status", status);
      if (finalThumbnail) {
        formData.append("thumbnail", finalThumbnail);
      }

      if (status === "published") {
        formData.append("published_date", new Date().toISOString());
      }

      const response = await axios.post("/api/admin/create-post", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        withCredentials: true,
      });

      if (response.status === 201) {
        localStorage.removeItem("teazy_autosave_post");
        toast.success(`Post "${title}" created successfully!`);
        navigate("/posts", { replace: true });
      }
    } catch (error) {
      console.error("Create post error:", error);
      const statusCode = error.response?.status;

      if (statusCode === 413 || statusCode === 403) {
        toast.error("Upload failed: The image or content is too large (Vercel 4.5MB limit). Try a smaller image.");
      } else {
        const errorMessage = error.response?.data?.message || error.response?.data?.error || "Failed to create post";
        const reason = error.response?.data?.reason ? ` (Reason: ${error.response.data.reason})` : "";
        toast.error(`${errorMessage}${reason}`);
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
    thumbnail !== null;

  return (
    <Layout title="Create Post">
      <Toaster richColors position="top-right" />
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <div className="px-6 py-4 bg-[#e94235] text-white flex justify-between items-center">
            <h3 className="text-lg font-medium">Post Details</h3>
            <span className="text-xs bg-white/20 px-2 py-1 rounded">Update: v2 (Compression Active)</span>
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
                    className={`w-full px-4 py-2 bg-white border ${errors.category ? "border-red-500" : "border-gray-200"} rounded-lg shadow-sm focus:ring-2 focus:ring-[#e94235] focus:border-transparent transition-all outline-none appearance-none`}
                    style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%236B7280'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`, backgroundPosition: 'right 0.75rem center', backgroundSize: '1.25rem', backgroundRepeat: 'no-repeat' }}
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
            </div>
          </div>

          <div className="bg-white shadow-md rounded-lg overflow-hidden">
            <div className="px-6 py-4 bg-[#e94235] text-white">
              <h3 className="text-lg font-medium">Featured Image</h3>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex flex-col gap-1">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleThumbnailChange}
                  className="text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-red-50 file:text-red-700 hover:file:bg-red-100"
                />
                <p className="text-[10px] text-gray-500 italic">
                  * Max payload 4.5MB. Large images will be auto-optimized.
                </p>
              </div>
              {thumbnailPreview && (
                <img
                  src={thumbnailPreview}
                  className="w-full h-48 object-cover rounded-md"
                />
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-4 pb-8">
          <button
            type="button"
            onClick={() => {
              localStorage.removeItem("teazy_autosave_post");
              navigate("/posts");
            }}
            className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting || !isFormValid}
            className="px-6 py-2.5 bg-[#e94235] text-white rounded-lg hover:bg-[#d23c30] transition-colors font-medium shadow-sm flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="animate-spin h-5 w-5" />
                Publishing...
              </>
            ) : (
              "Publish Post"
            )}
          </button>
        </div>
      </form>
    </Layout>
  );
};

export default CreatePost;
