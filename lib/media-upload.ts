"use client";

import { createClient } from "@/lib/supabase/client";
import {
  MEDIA_BUCKET,
  MEDIA_FOLDERS,
  getMediaPublicUrl,
  type MediaFolder,
} from "@/lib/media";
import {
  getMediaType,
  validateMediaFile,
} from "@/lib/media-validation";

type UploadMediaOptions = {
  file: File;
  folder: MediaFolder;
  entityId?: string | number;
};

type UploadMediaResult = {
  path: string;
  publicUrl: string;
  type: "image" | "video";
  mimeType: string;
  size: number;
};

function sanitizeFileName(fileName: string) {
  return fileName
    .normalize("NFKD")
    .replace(/[^\w.-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .toLowerCase();
}

export async function uploadMedia({
  file,
  folder,
  entityId,
}: UploadMediaOptions): Promise<UploadMediaResult> {
  validateMediaFile(file);

  const supabase = createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    throw new Error("Anda harus login sebagai admin.");
  }

  const mediaType = getMediaType(file);

  const safeName = sanitizeFileName(file.name) || "media";

  const extension =
    safeName.includes(".")
      ? safeName.split(".").pop()
      : undefined;

  const baseName =
    extension
      ? safeName.slice(0, -(extension.length + 1))
      : safeName;

  const uniqueName = `${baseName}-${crypto.randomUUID()}${
    extension ? `.${extension}` : ""
  }`;

  const folderName = MEDIA_FOLDERS[folder];

  const path = entityId
    ? `${folderName}/${entityId}/${uniqueName}`
    : `${folderName}/${uniqueName}`;

  const { error: uploadError } = await supabase.storage
    .from(MEDIA_BUCKET)
    .upload(path, file, {
      cacheControl: "31536000",
      contentType: file.type,
      upsert: false,
    });

  if (uploadError) {
    throw new Error(uploadError.message);
  }

  const publicUrl = getMediaPublicUrl(supabase, path);

  return {
    path,
    publicUrl,
    type: mediaType,
    mimeType: file.type,
    size: file.size,
  };
}