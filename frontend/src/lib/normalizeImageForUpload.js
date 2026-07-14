import heic2any from "heic2any";

const HEIC_TYPES = new Set([
  "image/heic",
  "image/heif",
  "image/heic-sequence",
  "image/heif-sequence",
]);
const HEIC_EXT = /\.(heic|heif)$/i;

export function isHeicImage(file) {
  if (!file) return false;
  return HEIC_TYPES.has(file.type) || HEIC_EXT.test(file.name);
}

/** Convert iPhone HEIC/HEIF to JPEG before upload or preview. */
export async function normalizeImageForUpload(file) {
  if (!file || !isHeicImage(file)) return file;

  const converted = await heic2any({
    blob: file,
    toType: "image/jpeg",
    quality: 0.92,
  });

  const blob = Array.isArray(converted) ? converted[0] : converted;
  const baseName = file.name.replace(HEIC_EXT, "") || "photo";

  return new File([blob], `${baseName}.jpg`, { type: "image/jpeg" });
}
