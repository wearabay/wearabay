"use client";

import {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  uploadMedia,
  type UploadMediaResult,
} from "@/lib/media-upload";

import {
  validateMediaFile,
} from "@/lib/media-validation";

import type {
  AdminProductVariant,
} from "@/lib/admin-media";

import { createAdminMediaAction } from "./actions";

type VariantFilter =
  | "all"
  | "general"
  | number;

type Props = {
  productId: number;
  variants: AdminProductVariant[];
  defaultVariant: VariantFilter;
  onSuccess: () => void;
  onClose: () => void;
};

export default function MediaUploader({
  productId,
  variants,
  defaultVariant,
  onSuccess,
  onClose,
}: Props) {
  const inputRef =
    useRef<HTMLInputElement | null>(
      null
    );

  const [file, setFile] =
    useState<File | null>(null);

  const [previewUrl, setPreviewUrl] =
    useState("");

  const [altText, setAltText] =
    useState("");

  const [selectedVariant, setSelectedVariant] =
    useState<VariantFilter>(
      defaultVariant === "all"
        ? "general"
        : defaultVariant
    );

  const [isPrimary, setIsPrimary] =
    useState(false);

  const [isUploading, setIsUploading] =
    useState(false);

  const [error, setError] =
    useState("");

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(
          previewUrl
        );
      }
    };
  }, [previewUrl]);

  function handleFileChange(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const selectedFile =
      event.target.files?.[0] ?? null;

    setError("");

    if (!selectedFile) {
      return;
    }

    try {
      validateMediaFile(
        selectedFile
      );
    } catch (error) {
      setFile(null);
      setPreviewUrl("");

      setError(
        error instanceof Error
          ? error.message
          : "File tidak valid."
      );

      return;
    }

    if (previewUrl) {
      URL.revokeObjectURL(
        previewUrl
      );
    }

    setFile(selectedFile);

    const localUrl =
      URL.createObjectURL(
        selectedFile
      );

    setPreviewUrl(localUrl);

    if (!altText) {
      setAltText(
        selectedFile.name
          .replace(
            /\.[^/.]+$/,
            ""
          )
          .replace(
            /[-_]+/g,
            " "
          )
      );
    }
  }

  function handleRemoveFile() {
    if (previewUrl) {
      URL.revokeObjectURL(
        previewUrl
      );
    }

    setFile(null);
    setPreviewUrl("");
    setError("");

    if (inputRef.current) {
      inputRef.current.value = "";
    }
  }

  async function handleUpload() {
    if (!file) {
      setError(
        "Pilih file terlebih dahulu."
      );
      return;
    }

    if (
      selectedVariant === "all"
    ) {
      setError(
        "Pilih variant atau General Product Media."
      );
      return;
    }

    setIsUploading(true);
    setError("");

    let uploaded:
      | UploadMediaResult
      | null = null;

    try {
      const variantId =
        selectedVariant ===
        "general"
          ? null
          : selectedVariant;

      uploaded =
        await uploadMedia({
          file,
          folder: "products",
          entityId: productId,
          variantId:
            variantId ?? undefined,
        });

      await createAdminMediaAction({
        productId,
        variantId,
        type: uploaded.type,
        storagePath:
          uploaded.path,
        altText:
          altText.trim() ||
          null,
        isPrimary,
      });

      if (previewUrl) {
        URL.revokeObjectURL(
          previewUrl
        );
      }

      setFile(null);
      setPreviewUrl("");
      setAltText("");
      setIsPrimary(false);

      if (inputRef.current) {
        inputRef.current.value = "";
      }

      onSuccess();
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Failed to upload media."
      );
    } finally {
      setIsUploading(false);
    }
  }

  function handleClose() {
    if (isUploading) {
      return;
    }

    if (previewUrl) {
      URL.revokeObjectURL(
        previewUrl
      );
    }

    onClose();
  }

  return (
    <div
      className="fixed inset-0 z-[90] flex items-center justify-center bg-black/70 p-4 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-label="Add media"
      onMouseDown={(event) => {
        if (
          event.target ===
          event.currentTarget
        ) {
          handleClose();
        }
      }}
    >
      <div className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-neutral-200 px-6 py-5">
          <div>
            <h2 className="text-lg font-medium">
              Add Media
            </h2>

            <p className="mt-1 text-sm text-neutral-500">
              Upload media for this
              product or variant.
            </p>
          </div>

          <button
            type="button"
            onClick={handleClose}
            disabled={isUploading}
            aria-label="Close"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-neutral-200 text-lg hover:border-neutral-400 disabled:opacity-40"
          >
            ×
          </button>
        </div>

        <div className="space-y-6 p-6">
          <div>
            <label className="mb-2 block text-sm font-medium">
              Variant
            </label>

            <select
              value={
                selectedVariant ===
                "general"
                  ? "general"
                  : String(
                      selectedVariant
                    )
              }
              onChange={(event) => {
                const value =
                  event.target.value;

                setSelectedVariant(
                  value === "general"
                    ? "general"
                    : Number(value)
                );
              }}
              disabled={isUploading}
              className="h-11 w-full rounded-xl border border-neutral-200 bg-white px-4 text-sm outline-none focus:border-neutral-400 disabled:bg-neutral-50"
            >
              <option value="general">
                General Product Media
              </option>

              {variants.map(
                (variant) => (
                  <option
                    key={
                      variant.id
                    }
                    value={
                      variant.id
                    }
                  >
                    {variant.color} ·{" "}
                    {variant.size}
                    {variant.sku
                      ? ` · ${variant.sku}`
                      : ""}
                  </option>
                )
              )}
            </select>

            <p className="mt-2 text-xs text-neutral-400">
              Choose which variant this
              media belongs to.
            </p>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">
              Media File
            </label>

            <input
              ref={inputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/avif,video/mp4,video/webm"
              onChange={
                handleFileChange
              }
              disabled={isUploading}
              className="block w-full rounded-xl border border-neutral-200 px-4 py-3 text-sm file:mr-4 file:rounded-full file:border-0 file:bg-black file:px-4 file:py-2 file:text-xs file:font-medium file:text-white"
            />

            <p className="mt-2 text-xs text-neutral-400">
              JPG, PNG, WebP, AVIF, MP4,
              or WebM · Max 50 MB
            </p>
          </div>

          {file && previewUrl && (
            <div>
              <div className="mb-2 flex items-center justify-between gap-3">
                <p className="text-sm font-medium">
                  Preview
                </p>

                <button
                  type="button"
                  onClick={
                    handleRemoveFile
                  }
                  disabled={isUploading}
                  className="text-xs font-medium text-neutral-500 hover:text-black disabled:opacity-40"
                >
                  Remove
                </button>
              </div>

              <div className="flex min-h-52 items-center justify-center overflow-hidden rounded-2xl border border-neutral-200 bg-neutral-50 p-3">
                {file.type.startsWith(
                  "video/"
                ) ? (
                  <video
                    src={previewUrl}
                    controls
                    className="max-h-72 max-w-full rounded-xl object-contain"
                  />
                ) : (
                  <img
                    src={previewUrl}
                    alt="Media preview"
                    className="max-h-72 max-w-full rounded-xl object-contain"
                  />
                )}
              </div>

              <p className="mt-2 break-all text-xs text-neutral-400">
                {file.name}
              </p>
            </div>
          )}

          <div>
            <label
              htmlFor="media-alt-text"
              className="mb-2 block text-sm font-medium"
            >
              Alt Text
            </label>

            <input
              id="media-alt-text"
              type="text"
              value={altText}
              onChange={(event) =>
                setAltText(
                  event.target.value
                )
              }
              placeholder="Luna Abaya Black front view"
              disabled={isUploading}
              className="h-11 w-full rounded-xl border border-neutral-200 px-4 text-sm outline-none focus:border-neutral-400 disabled:bg-neutral-50"
            />

            <p className="mt-2 text-xs text-neutral-400">
              Describe what is shown in the
              image or video.
            </p>
          </div>

          <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-neutral-200 p-4 hover:border-neutral-400">
            <input
              type="checkbox"
              checked={isPrimary}
              onChange={(event) =>
                setIsPrimary(
                  event.target.checked
                )
              }
              disabled={isUploading}
              className="mt-0.5 h-4 w-4 accent-black"
            />

            <span>
              <span className="block text-sm font-medium">
                Set as Primary
              </span>

              <span className="mt-1 block text-xs text-neutral-500">
                This becomes the main media
                for the selected variant.
              </span>
            </span>
          </label>

          {error && (
            <div className="rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm text-neutral-700">
              {error}
            </div>
          )}

          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={handleClose}
              disabled={isUploading}
              className="inline-flex h-11 items-center justify-center rounded-full border border-neutral-200 px-6 text-sm font-medium text-neutral-700 hover:border-neutral-400 disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleUpload}
              disabled={
                !file ||
                isUploading
              }
              className="inline-flex h-11 items-center justify-center rounded-full border border-black bg-black px-6 text-sm font-medium text-white hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isUploading
                ? "Uploading..."
                : "Upload Media"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}