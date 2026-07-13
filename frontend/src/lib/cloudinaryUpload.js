import axios from "./api";

/**
 * Upload a file straight to Cloudinary (browser → CDN), skipping the backend hop.
 * Much faster than sending files through Express first.
 */
export async function uploadToCloudinary(file, { kind = "thumbnail", onProgress } = {}) {
  const { data: sign } = await axios.get("/api/admin/sign-upload", {
    params: kind === "resource"
      ? { kind: "resource", filename: file.name }
      : { kind: "resource-thumbnail" },
    withCredentials: true,
  });

  const formData = new FormData();
  formData.append("file", file);
  formData.append("api_key", sign.apiKey);
  formData.append("timestamp", String(sign.timestamp));
  formData.append("signature", sign.signature);
  formData.append("folder", sign.folder);
  if (sign.public_id) formData.append("public_id", sign.public_id);

  const resourceType = sign.resourceType || "image";
  const uploadUrl = `https://api.cloudinary.com/v1_1/${sign.cloudName}/${resourceType}/upload`;

  const response = await axios.post(uploadUrl, formData, {
    withCredentials: false,
    timeout: 120000,
    onUploadProgress: onProgress,
  });

  return response.data.secure_url;
}
