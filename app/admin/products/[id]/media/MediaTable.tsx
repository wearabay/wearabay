"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import type {
  AdminProductMedia,
  AdminProductVariant,
} from "@/lib/admin-media";

import {
  changeAdminMediaVariantAction,
  deleteAdminMediaAction,
  reorderAdminMediaAction,
  setAdminMediaPrimaryAction,
  updateAdminMediaAltTextAction,
} from "./actions";

type VariantFilter =
  | "all"
  | "general"
  | number;

type Props = {
  product: {
    id: number;
    name: string;
  };
  media: AdminProductMedia[];
  variants: AdminProductVariant[];
  selectedVariant: VariantFilter;
};

export default function MediaTable({
  product,
  media,
  variants,
  selectedVariant,
}: Props) {
  const router = useRouter();

  const [search, setSearch] =
    useState("");

  const [previewMedia, setPreviewMedia] =
    useState<AdminProductMedia | null>(
      null
    );

  const [editingId, setEditingId] =
    useState<number | null>(null);

  const [editingAltText, setEditingAltText] =
    useState("");

  const [changingVariantId, setChangingVariantId] =
    useState<number | null>(null);

  const [changeVariantValue, setChangeVariantValue] =
    useState<number | null>(null);

  const [processingId, setProcessingId] =
    useState<number | null>(null);

  const [error, setError] =
    useState("");

  const filteredMedia = useMemo(() => {
    let result = media;

    if (selectedVariant === "general") {
      result = result.filter(
        (item) =>
          item.variantId === null
      );
    } else if (
      selectedVariant !== "all"
    ) {
      result = result.filter(
        (item) =>
          item.variantId ===
          selectedVariant
      );
    }

    const query =
      search.trim().toLowerCase();

    if (!query) {
      return result;
    }

    return result.filter((item) => {
      const variantText =
        item.variant
          ? `${item.variant.color} ${item.variant.size} ${item.variant.sku ?? ""}`
          : "general product media";

      return (
        item.storagePath
          .toLowerCase()
          .includes(query) ||
        (item.altText ?? "")
          .toLowerCase()
          .includes(query) ||
        item.type
          .toLowerCase()
          .includes(query) ||
        variantText
          .toLowerCase()
          .includes(query)
      );
    });
  }, [
    media,
    search,
    selectedVariant,
  ]);

  useEffect(() => {
    function handleKeyDown(
      event: KeyboardEvent
    ) {
      if (event.key === "Escape") {
        setPreviewMedia(null);
      }
    }

    window.addEventListener(
      "keydown",
      handleKeyDown
    );

    return () => {
      window.removeEventListener(
        "keydown",
        handleKeyDown
      );
    };
  }, []);

  useEffect(() => {
    document.body.style.overflow =
      previewMedia ? "hidden" : "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [previewMedia]);

  function startEditing(
    item: AdminProductMedia
  ) {
    setError("");
    setEditingId(item.id);
    setEditingAltText(
      item.altText ?? ""
    );
  }

  function cancelEditing() {
    setEditingId(null);
    setEditingAltText("");
  }

  function startChangingVariant(
    item: AdminProductMedia
  ) {
    setError("");
    setChangingVariantId(item.id);
    setChangeVariantValue(
      item.variantId
    );
  }

  function cancelChangingVariant() {
    setChangingVariantId(null);
    setChangeVariantValue(null);
  }

  async function handleSaveAltText(
    mediaId: number
  ) {
    setProcessingId(mediaId);
    setError("");

    try {
      await updateAdminMediaAltTextAction({
        productId: product.id,
        mediaId,
        altText:
          editingAltText.trim() ||
          null,
      });

      cancelEditing();
      router.refresh();
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Failed to update alt text."
      );
    } finally {
      setProcessingId(null);
    }
  }

  async function handleChangeVariant(
    mediaId: number
  ) {
    setProcessingId(mediaId);
    setError("");

    try {
      await changeAdminMediaVariantAction({
        productId: product.id,
        mediaId,
        variantId:
          changeVariantValue,
      });

      cancelChangingVariant();
      router.refresh();
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Failed to change media variant."
      );
    } finally {
      setProcessingId(null);
    }
  }

  async function handleSetPrimary(
    mediaId: number
  ) {
    const target = media.find(
      (item) => item.id === mediaId
    );

    if (
      !target ||
      target.isPrimary
    ) {
      return;
    }

    setProcessingId(mediaId);
    setError("");

    try {
      await setAdminMediaPrimaryAction({
        productId: product.id,
        mediaId,
      });

      router.refresh();
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Failed to set primary media."
      );
    } finally {
      setProcessingId(null);
    }
  }

  async function handleReorder(
    mediaId: number,
    direction: "up" | "down"
  ) {
    setProcessingId(mediaId);
    setError("");

    try {
      await reorderAdminMediaAction({
        productId: product.id,
        mediaId,
        direction,
      });

      router.refresh();
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Failed to reorder media."
      );
    } finally {
      setProcessingId(null);
    }
  }

  async function handleDelete(
    item: AdminProductMedia
  ) {
    const confirmed =
      window.confirm(
        item.isPrimary
          ? "Media ini adalah Primary. Jika masih ada media lain pada variant ini, pilih media lain sebagai Primary terlebih dahulu. Hapus media ini?"
          : "Hapus media ini secara permanen dari product dan Storage?"
      );

    if (!confirmed) {
      return;
    }

    setProcessingId(item.id);
    setError("");

    try {
      await deleteAdminMediaAction({
        productId: product.id,
        mediaId: item.id,
      });

      if (
        previewMedia?.id === item.id
      ) {
        setPreviewMedia(null);
      }

      if (
        editingId === item.id
      ) {
        cancelEditing();
      }

      if (
        changingVariantId ===
        item.id
      ) {
        cancelChangingVariant();
      }

      router.refresh();
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Failed to delete media."
      );
    } finally {
      setProcessingId(null);
    }
  }

  return (
    <>
      <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-neutral-500">
          {filteredMedia.length} media
        </p>

        <div className="w-full sm:max-w-sm">
          <input
            type="search"
            value={search}
            onChange={(event) =>
              setSearch(
                event.target.value
              )
            }
            placeholder="Search media..."
            className="h-11 w-full rounded-full border border-neutral-200 bg-white px-5 text-sm outline-none transition placeholder:text-neutral-400 focus:border-neutral-400"
          />
        </div>
      </div>

      {error && (
        <div className="mb-5 flex items-start justify-between gap-4 rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm text-neutral-700">
          <p>{error}</p>

          <button
            type="button"
            onClick={() => setError("")}
            className="shrink-0 text-neutral-400 hover:text-black"
          >
            ×
          </button>
        </div>
      )}

      {filteredMedia.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-neutral-300 px-6 py-16 text-center">
          <p className="text-sm font-medium">
            No media found.
          </p>

          <p className="mt-2 text-sm text-neutral-500">
            Try another variant or search
            keyword.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1450px] border-collapse">
              <thead>
                <tr className="border-b border-neutral-200 text-left">
                  <th className="px-5 py-4 text-xs font-medium uppercase tracking-[0.14em] text-neutral-400">
                    #
                  </th>

                  <th className="px-5 py-4 text-xs font-medium uppercase tracking-[0.14em] text-neutral-400">
                    Preview
                  </th>

                  <th className="px-5 py-4 text-xs font-medium uppercase tracking-[0.14em] text-neutral-400">
                    Variant
                  </th>

                  <th className="px-5 py-4 text-xs font-medium uppercase tracking-[0.14em] text-neutral-400">
                    Type
                  </th>

                  <th className="px-5 py-4 text-xs font-medium uppercase tracking-[0.14em] text-neutral-400">
                    Alt Text
                  </th>

                  <th className="px-5 py-4 text-xs font-medium uppercase tracking-[0.14em] text-neutral-400">
                    Status
                  </th>

                  <th className="px-5 py-4 text-right text-xs font-medium uppercase tracking-[0.14em] text-neutral-400">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody>
                {filteredMedia.map(
                  (item, index) => {
                    const isProcessing =
                      processingId ===
                      item.id;

                    const isEditing =
                      editingId ===
                      item.id;

                    const isChangingVariant =
                      changingVariantId ===
                      item.id;

                    return (
                      <tr
                        key={item.id}
                        className="border-b border-neutral-100 last:border-b-0"
                      >
                        <td className="px-5 py-4 align-top text-sm text-neutral-500">
                          {index + 1}
                        </td>

                        <td className="px-5 py-4">
                          <button
                            type="button"
                            onClick={() =>
                              setPreviewMedia(
                                item
                              )
                            }
                            className="group relative flex h-28 w-28 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-neutral-200 bg-neutral-50"
                          >
                            {item.type ===
                            "video" ? (
                              <video
                                src={
                                  item.publicUrl
                                }
                                muted
                                playsInline
                                className="block h-full w-full object-contain"
                              />
                            ) : (
                              <Image
                                src={
                                  item.publicUrl
                                }
                                alt={
                                  item.altText ??
                                  product.name
                                }
                                fill
                                sizes="112px"
                                className="object-contain transition duration-200 group-hover:scale-105"
                              />
                            )}

                            <span className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/0 text-xs font-medium text-white opacity-0 transition group-hover:bg-black/25 group-hover:opacity-100">
                              Preview
                            </span>
                          </button>
                        </td>

                        <td className="px-5 py-4 align-top">
                          {isChangingVariant ? (
                            <div className="min-w-[260px] space-y-2">
                              <select
                                value={
                                  changeVariantValue ===
                                  null
                                    ? "general"
                                    : String(
                                        changeVariantValue
                                      )
                                }
                                onChange={(
                                  event
                                ) => {
                                  const value =
                                    event
                                      .target
                                      .value;

                                  setChangeVariantValue(
                                    value ===
                                      "general"
                                      ? null
                                      : Number(
                                          value
                                        )
                                  );
                                }}
                                disabled={
                                  isProcessing
                                }
                                className="h-10 w-full rounded-lg border border-neutral-300 bg-white px-3 text-sm outline-none focus:border-black disabled:bg-neutral-50"
                              >
                                <option value="general">
                                  General Product Media
                                </option>

                                {variants.map(
                                  (
                                    variant
                                  ) => (
                                    <option
                                      key={
                                        variant.id
                                      }
                                      value={String(
                                        variant.id
                                      )}
                                    >
                                      {
                                        variant.color
                                      }{" "}
                                      ·{" "}
                                      {
                                        variant.size
                                      }
                                      {variant.sku
                                        ? ` · ${variant.sku}`
                                        : ""}
                                    </option>
                                  )
                                )}
                              </select>

                              <div className="flex gap-2">
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleChangeVariant(
                                      item.id
                                    )
                                  }
                                  disabled={
                                    isProcessing ||
                                    changeVariantValue ===
                                      item.variantId
                                  }
                                  className="rounded-full bg-black px-4 py-2 text-xs font-medium text-white hover:bg-neutral-800 disabled:opacity-40"
                                >
                                  {isProcessing
                                    ? "Saving..."
                                    : "Save"}
                                </button>

                                <button
                                  type="button"
                                  onClick={
                                    cancelChangingVariant
                                  }
                                  disabled={
                                    isProcessing
                                  }
                                  className="rounded-full border border-neutral-200 px-4 py-2 text-xs font-medium text-neutral-600 hover:border-neutral-400 disabled:opacity-40"
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          ) : item.variant ? (
                            <>
                              <p className="font-medium">
                                {
                                  item
                                    .variant
                                    .color
                                }
                              </p>

                              <p className="mt-1 text-xs text-neutral-500">
                                {
                                  item
                                    .variant
                                    .size
                                }
                              </p>

                              {item.variant
                                .sku && (
                                <p className="mt-1 text-xs text-neutral-400">
                                  {
                                    item
                                      .variant
                                      .sku
                                  }
                                </p>
                              )}

                              {variants.length >
                                0 && (
                                <button
                                  type="button"
                                  onClick={() =>
                                    startChangingVariant(
                                      item
                                    )
                                  }
                                  disabled={
                                    processingId !==
                                    null
                                  }
                                  className="mt-3 text-xs font-medium text-neutral-500 hover:text-black hover:underline disabled:opacity-40"
                                >
                                  Change Variant
                                </button>
                              )}
                            </>
                          ) : (
                            <>
                              <span className="text-sm text-neutral-500">
                                General Product
                              </span>

                              {variants.length >
                                0 && (
                                <button
                                  type="button"
                                  onClick={() =>
                                    startChangingVariant(
                                      item
                                    )
                                  }
                                  disabled={
                                    processingId !==
                                    null
                                  }
                                  className="mt-3 block text-xs font-medium text-neutral-500 hover:text-black hover:underline disabled:opacity-40"
                                >
                                  Change Variant
                                </button>
                              )}
                            </>
                          )}
                        </td>

                        <td className="px-5 py-4 align-top">
                          <span className="rounded-full border border-neutral-200 px-3 py-1 text-xs capitalize">
                            {item.type}
                          </span>

                          <p className="mt-3 max-w-[260px] break-all text-xs text-neutral-400">
                            {item.storagePath}
                          </p>
                        </td>

                        <td className="w-[300px] px-5 py-4 align-top">
                          {isEditing ? (
                            <div className="space-y-2">
                              <input
                                type="text"
                                value={
                                  editingAltText
                                }
                                onChange={(
                                  event
                                ) =>
                                  setEditingAltText(
                                    event
                                      .target
                                      .value
                                  )
                                }
                                disabled={
                                  isProcessing
                                }
                                autoFocus
                                className="h-10 w-full rounded-lg border border-neutral-300 px-3 text-sm outline-none focus:border-black disabled:bg-neutral-50"
                              />

                              <div className="flex gap-2">
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleSaveAltText(
                                      item.id
                                    )
                                  }
                                  disabled={
                                    isProcessing
                                  }
                                  className="rounded-full bg-black px-4 py-2 text-xs font-medium text-white hover:bg-neutral-800 disabled:opacity-50"
                                >
                                  {isProcessing
                                    ? "Saving..."
                                    : "Save"}
                                </button>

                                <button
                                  type="button"
                                  onClick={
                                    cancelEditing
                                  }
                                  disabled={
                                    isProcessing
                                  }
                                  className="rounded-full border border-neutral-200 px-4 py-2 text-xs font-medium text-neutral-600 hover:border-neutral-400 disabled:opacity-50"
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div>
                              <p className="text-sm text-neutral-700">
                                {item.altText ||
                                  "—"}
                              </p>

                              <button
                                type="button"
                                onClick={() =>
                                  startEditing(
                                    item
                                  )
                                }
                                disabled={
                                  processingId !==
                                  null
                                }
                                className="mt-2 text-xs font-medium text-neutral-500 hover:text-black hover:underline disabled:opacity-40"
                              >
                                Edit Alt Text
                              </button>
                            </div>
                          )}
                        </td>

                        <td className="px-5 py-4 align-top">
                          {item.isPrimary ? (
                            <span className="inline-flex rounded-full bg-black px-3 py-1 text-xs font-medium text-white">
                              Primary
                            </span>
                          ) : (
                            <span className="text-xs text-neutral-400">
                              Gallery
                            </span>
                          )}
                        </td>

                        <td className="px-5 py-4 align-top">
                          <div className="flex flex-wrap justify-end gap-2">
                            <div className="flex gap-1">
                              <button
                                type="button"
                                onClick={() =>
                                  handleReorder(
                                    item.id,
                                    "up"
                                  )
                                }
                                disabled={
                                  index ===
                                    0 ||
                                  processingId !==
                                    null
                                }
                                title="Move up"
                                className="flex h-9 w-9 items-center justify-center rounded-full border border-neutral-200 text-sm hover:border-black hover:bg-neutral-50 disabled:opacity-30"
                              >
                                ↑
                              </button>

                              <button
                                type="button"
                                onClick={() =>
                                  handleReorder(
                                    item.id,
                                    "down"
                                  )
                                }
                                disabled={
                                  index ===
                                    filteredMedia.length -
                                      1 ||
                                  processingId !==
                                    null
                                }
                                title="Move down"
                                className="flex h-9 w-9 items-center justify-center rounded-full border border-neutral-200 text-sm hover:border-black hover:bg-neutral-50 disabled:opacity-30"
                              >
                                ↓
                              </button>
                            </div>

                            {!item.isPrimary && (
                              <button
                                type="button"
                                onClick={() =>
                                  handleSetPrimary(
                                    item.id
                                  )
                                }
                                disabled={
                                  processingId !==
                                  null
                                }
                                className="rounded-full border border-neutral-300 px-4 py-2 text-xs font-medium hover:border-black hover:bg-neutral-50 disabled:opacity-40"
                              >
                                {isProcessing
                                  ? "Updating..."
                                  : "Set Primary"}
                              </button>
                            )}

                            <button
                              type="button"
                              onClick={() =>
                                startEditing(
                                  item
                                )
                              }
                              disabled={
                                processingId !==
                                null
                              }
                              className="rounded-full border border-neutral-200 px-4 py-2 text-xs font-medium text-neutral-600 hover:border-neutral-400 hover:text-black disabled:opacity-40"
                            >
                              Edit
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                handleDelete(
                                  item
                                )
                              }
                              disabled={
                                processingId !==
                                null
                              }
                              className="rounded-full border border-neutral-200 px-4 py-2 text-xs font-medium text-neutral-600 hover:border-neutral-400 hover:text-black disabled:opacity-40"
                            >
                              {isProcessing
                                ? "Processing..."
                                : "Delete"}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  }
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {previewMedia && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 p-4 sm:p-8"
          role="dialog"
          aria-modal="true"
          onMouseDown={(event) => {
            if (
              event.target ===
              event.currentTarget
            ) {
              setPreviewMedia(null);
            }
          }}
        >
          <button
            type="button"
            onClick={() =>
              setPreviewMedia(null)
            }
            className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full border border-white/30 bg-black/30 text-2xl text-white hover:bg-black/50"
            aria-label="Close preview"
          >
            ×
          </button>

          <div className="flex max-h-[90vh] max-w-[94vw] flex-col items-center">
            {previewMedia.type ===
            "video" ? (
              <video
                src={
                  previewMedia.publicUrl
                }
                controls
                autoPlay
                className="max-h-[82vh] max-w-[90vw] rounded-xl object-contain"
              />
            ) : (
              <div className="relative h-[82vh] w-[90vw] max-w-[1200px]">
                <Image
                  src={
                    previewMedia.publicUrl
                  }
                  alt={
                    previewMedia.altText ??
                    product.name
                  }
                  fill
                  sizes="90vw"
                  className="rounded-xl object-contain"
                />
              </div>
            )}

            <div className="mt-4 max-w-[90vw] text-center text-white">
              <p className="text-sm font-medium">
                {product.name}
              </p>

              {previewMedia.variant && (
                <p className="mt-1 text-sm text-white/80">
                  {
                    previewMedia
                      .variant
                      .color
                  }{" "}
                  ·{" "}
                  {
                    previewMedia
                      .variant
                      .size
                  }
                </p>
              )}

              {previewMedia.altText && (
                <p className="mt-1 text-sm text-white/70">
                  {previewMedia.altText}
                </p>
              )}

              <p className="mt-1 break-all text-xs text-white/50">
                {previewMedia.storagePath}
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}