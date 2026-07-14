// src/pages/CreatePost.tsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import { Image, Tag, AlertTriangle, Loader2 } from "lucide-react";
import RichTextEditor from "../components/RichTextEditor";
import axios from "axios";
import { z } from "zod";
import { toast, Toaster } from "sonner";
import { isHeicImage, normalizeImageForUpload } from "../lib/normalizeImageForUpload";

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

  const handleThumbnailChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const isImage = file.type.startsWith("image/") || isHeicImage(file);
    if (!isImage) {
      setThumbnail(null);
      setThumbnailPreview("");
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
      setThumbnail(null);
      setThumbnailPreview("");
      toast.error("Could not process this photo. Try exporting it as JPG first.");
    }
  };

  const clearError = (field) => {
    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[field];
      return newErrors;
    });
  };
  // No compression needed - Cloudinary handles up to 50MB
  // The 4.5MB limit is only Vercel's serverless function, but Cloudinary 
  // processes on their end after receiving the stream

  const uploadImage = async (file) => {
    const loadingToastId = toast.loading("Starting direct upload...");
    try {
      const normalized = await normalizeImageForUpload(file);
      // 1. Get signature from backend
      const { data: signData } = await axios.get("/api/admin/sign-upload", {
        withCredentials: true
      });

      // 2. Upload directly to Cloudinary
      const formData = new FormData();
      formData.append("file", normalized);
      formData.append("api_key", signData.apiKey);
      formData.append("timestamp", signData.timestamp);
      formData.append("signature", signData.signature);
      formData.append("folder", "thumbnails");

      const cloudinaryRes = await axios.post(
        `https://api.cloudinary.com/v1_1/${signData.cloudName}/image/upload`,
        formData,
        {
          withCredentials: false,
          headers: { "Content-Type": "multipart/form-data" },
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            // Update toast text rarely to avoid flicker/lag
            if (percentCompleted % 20 === 0) {
              toast.loading(`Uploading: ${percentCompleted}%`, { id: loadingToastId });
            }
          }
        }
      );

      toast.success("Image uploaded successfully!", { id: loadingToastId });
      return cloudinaryRes.data.secure_url;
    } catch (err) {
      console.error("Direct upload failed:", err);
      const msg = err.response?.data?.error?.message || "Upload failed";
      toast.error(`Error: ${msg}`, { id: loadingToastId });
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
      // If thumbnail is a File, upload it first to get the URL
      if (thumbnail instanceof File) {
        const uploadedUrl = await uploadImage(thumbnail);
        if (!uploadedUrl) {
          setIsSubmitting(false);
          return; // uploadImage handles the error toast
        }
        finalThumbnail = uploadedUrl;
      }

      // Prepare JSON payload
      const payload = {
        title: trimmedTitle,
        author: trimmedAuthor,
        excerpt: trimmedExcerpt,
        content: content,
        category: trimmedCategory,
        status: status,
        thumbnail: finalThumbnail,
        published_date: status === "published" ? new Date().toISOString() : undefined
      };

      const response = await axios.post("/api/admin/create-post", payload, {
        headers: { "Content-Type": "application/json" },
        withCredentials: true,
      });

      if (response.status === 201) {
        localStorage.removeItem("teazy_autosave_post");
        toast.success(`Post "${title}" created successfully!`);
        navigate("/posts", { replace: true });
      }
    } catch (error) {
      console.error("Create post error:", error);
      console.error("Response data:", error.response?.data);
      const statusCode = error.response?.status;

      if (statusCode === 413 || statusCode === 403) {
        toast.error("Validation failed: Content too large or permissions issue.");
      } else if (statusCode === 400 && error.response?.data?.errors) {
        // Validation errors from server
        const validationErrors = error.response.data.errors;
        const errorMessages = validationErrors.map(e => `${e.field}: ${e.message}`).join(", ");
        toast.error(`Validation failed: ${errorMessages}`);
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
        <div className="bg-white dark:bg-[#1a1a1a] shadow-md rounded-lg overflow-hidden transition-colors duration-300">
          <div className="px-6 py-4 bg-[#e94235] text-white flex justify-between items-center">
            <h3 className="text-lg font-medium">Post Details</h3>
            <span className="text-xs bg-white/20 px-2 py-1 rounded">v3 (Direct Upload)</span>
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
                placeholder="Enter post title"
                className={`w-full px-4 py-2.5 bg-white dark:bg-[#242424] border ${errors.title ? "border-red-500" : "border-gray-300 dark:border-gray-700"} rounded-lg text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-[#e94235]/20 focus:border-[#e94235] transition-all outline-none`}
              />
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
                placeholder="Author name"
                className={`w-full px-4 py-2.5 bg-white dark:bg-[#242424] border ${errors.author ? "border-red-500" : "border-gray-300 dark:border-gray-700"} rounded-lg text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-[#e94235]/20 focus:border-[#e94235] transition-all outline-none`}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Excerpt
              </label>
              <textarea
                value={excerpt}
                onChange={(e) => {
                  setExcerpt(e.target.value);
                  clearError("excerpt");
                }}
                placeholder="Short summary of the post"
                rows={3}
                className={`w-full px-4 py-2.5 bg-white dark:bg-[#242424] border ${errors.excerpt ? "border-red-500" : "border-gray-300 dark:border-gray-700"} rounded-lg text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-[#e94235]/20 focus:border-[#e94235] transition-all outline-none resize-none`}
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
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-[#1a1a1a] shadow-md rounded-lg overflow-hidden transition-colors duration-300 text-gray-900 dark:text-gray-100">
            <div className="px-6 py-4 bg-[#e94235] text-white">
              <h3 className="text-lg font-medium">Post Settings</h3>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  <Tag className="h-4 w-4 mr-1" />
                  Category
                </label>
                {loadingCategories ? (
                  <div className="animate-pulse h-10 bg-gray-200 dark:bg-gray-800 rounded-md"></div>
                ) : (
                  <select
                    value={category}
                    onChange={(e) => {
                      setCategory(e.target.value);
                      clearError("category");
                    }}
                    className={`w-full px-4 py-2.5 bg-white dark:bg-[#242424] border ${errors.category ? "border-red-500" : "border-gray-300 dark:border-gray-700"} rounded-lg text-gray-900 dark:text-gray-100 shadow-sm focus:ring-2 focus:ring-[#e94235]/20 focus:border-[#e94235] transition-all outline-none appearance-none`}
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

          <div className="bg-white dark:bg-[#1a1a1a] shadow-md rounded-lg overflow-hidden transition-colors duration-300">
            <div className="px-6 py-4 bg-[#e94235] text-white">
              <h3 className="text-lg font-medium">Featured Image</h3>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex flex-col gap-1">
                <input
                  type="file"
                  accept="image/*,.heic,.heif"
                  onChange={handleThumbnailChange}
                  className="text-sm text-gray-500 dark:text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-red-50 dark:file:bg-red-900/20 file:text-red-700 dark:file:text-red-400 hover:file:bg-red-100 dark:hover:file:bg-red-900/30 transition-all cursor-pointer"
                />
              </div>
              {thumbnailPreview ? (
                <div className="relative group">
                  <img
                    src={thumbnailPreview}
                    className="w-full h-48 object-cover rounded-lg border border-gray-200 dark:border-gray-800"
                    alt="Preview"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-lg">
                    <p className="text-white text-sm font-medium">Change Image</p>
                  </div>
                </div>
              ) : (
                <div className="w-full h-48 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg flex flex-col items-center justify-center text-gray-400 dark:text-gray-500">
                  <Image className="h-10 w-10 mb-2 opacity-50" />
                  <p className="text-sm">Upload a featured image</p>
                </div>
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
