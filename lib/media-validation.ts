export const ALLOWED_MEDIA_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
  "video/mp4",
  "video/webm",
] as const;

export const MAX_MEDIA_SIZE = 50 * 1024 * 1024; // 50 MB

export function validateMediaFile(file: File) {
  if (!ALLOWED_MEDIA_TYPES.includes(
    file.type as (typeof ALLOWED_MEDIA_TYPES)[number],
  )) {
    throw new Error(
      "File type tidak didukung. Gunakan JPG, PNG, WebP, AVIF, MP4, atau WebM.",
    );
  }

  if (file.size > MAX_MEDIA_SIZE) {
    throw new Error("Ukuran file maksimal adalah 50 MB.");
  }

  return true;
}

export function getMediaType(file: File): "image" | "video" {
  if (file.type.startsWith("video/")) {
    return "video";
  }

  return "image";
}