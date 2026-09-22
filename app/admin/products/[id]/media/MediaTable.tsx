"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  useEffect,
  useMemo,
  useState,
} from "react";

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

type Props = {
  productId: number;
  media: AdminProductMedia[];
  variants: AdminProductVariant[];
  selectedVariant: string;
};

function TypeBadge({
  type,
}: {
  type: string;
}) {
  return (
    <span className="inline-flex items-center rounded-full border border-stone-200 bg-stone-50 px-2.5 py-1 text-[10px] uppercase tracking-[0.12em] text-neutral-600">
      {type}
    </span>
  );
}

function PrimaryBadge({
  isPrimary,
}: {
  isPrimary: boolean;
}) {
  if (!isPrimary) {
    return (
      <span className="inline-flex items-center rounded-full border border-stone-200 bg-white px-2.5 py-1 text-[10px] uppercase tracking-[0.12em] text-neutral-400">
        Secondary
      </span>
    );
  }

  return (
    <span className="inline-flex items-center rounded-full border border-neutral-900 bg-neutral-900 px-2.5 py-1 text-[10px] uppercase tracking-[0.12em] text-white">
      Primary
    </span>
  );
}

export default function MediaTable({
  productId,
  media,
  variants,
  selectedVariant,
}: Props) {
  const router = useRouter();

  const [search, setSearch] =
    useState("");

  const [
    previewMedia,
    setPreviewMedia,
  ] = useState<AdminProductMedia | null>(
    null,
  );

  const [
    editingId,
    setEditingId,
  ] = useState<number | null>(
    null,
  );

  const [
    editingAltText,
    setEditingAltText,
  ] = useState("");

  const [
    changingVariantId,
    setChangingVariantId,
  ] = useState<number | null>(
    null,
  );

  const [
    changingVariantValue,
    setChangingVariantValue,
  ] = useState("");

  const [
    processingId,
    setProcessingId,
  ] = useState<number | null>(
    null,
  );

  const [error, setError] =
    useState<string | null>(null);

  const filteredMedia =
    useMemo(() => {
      const query =
        search.trim().toLowerCase();

      return media.filter(
        (item) => {
          if (
            selectedVariant !==
            "all"
          ) {
            if (
              selectedVariant ===
              "general"
            ) {
              if (
                item.variantId !==
                null
              ) {
                return false;
              }
            } else if (
              item.variantId !==
              Number(
                selectedVariant,
              )
            ) {
              return false;
            }
          }

          if (!query) {
            return true;
          }

          const variantText =
            item.variant
              ? `${item.variant.color} ${item.variant.size} ${item.variant.sku ?? ""}`
              : "general";

          return [
            item.storagePath,
            item.altText,
            item.type,
            variantText,
          ]
            .filter(Boolean)
            .some((value) =>
              String(value)
                .toLowerCase()
                .includes(query),
            );
        },
      );
    }, [
      media,
      search,
      selectedVariant,
    ]);

  useEffect(() => {
    if (!previewMedia) {
      document.body.style.overflow =
        "";
      return;
    }

    document.body.style.overflow =
      "hidden";

    const handleKeyDown = (
      event: KeyboardEvent,
    ) => {
      if (event.key === "Escape") {
        setPreviewMedia(null);
      }
    };

    window.addEventListener(
      "keydown",
      handleKeyDown,
    );

    return () => {
      document.body.style.overflow =
        "";

      window.removeEventListener(
        "keydown",
        handleKeyDown,
      );
    };
  }, [previewMedia]);

  function startEdit(
    item: AdminProductMedia,
  ) {
    setEditingId(item.id);
    setEditingAltText(
      item.altText ?? "",
    );
    setError(null);
  }

  function cancelEdit() {
    setEditingId(null);
    setEditingAltText("");
  }

  function startChangeVariant(
    item: AdminProductMedia,
  ) {
    setChangingVariantId(item.id);

    setChangingVariantValue(
      item.variantId !== null
        ? String(item.variantId)
        : "general",
    );

    setError(null);
  }

  function cancelChangeVariant() {
    setChangingVariantId(null);
    setChangingVariantValue("");
  }

  async function saveAltText(
    item: AdminProductMedia,
  ) {
    setProcessingId(item.id);
    setError(null);

    try {
      await updateAdminMediaAltTextAction(
        {
          productId,
          mediaId: item.id,
          altText:
            editingAltText,
        },
      );

      cancelEdit();
      router.refresh();
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Failed to update alt text.",
      );
    } finally {
      setProcessingId(null);
    }
  }

  async function changeVariant(
    item: AdminProductMedia,
  ) {
    let variantId:
      | number
      | null;

    if (
      changingVariantValue ===
      "general"
    ) {
      variantId = null;
    } else {
      const parsed = Number(
        changingVariantValue,
      );

      if (
        !Number.isInteger(
          parsed,
        ) ||
        parsed <= 0
      ) {
        setError(
          "Pilih variant terlebih dahulu.",
        );
        return;
      }

      variantId = parsed;
    }

    setProcessingId(item.id);
    setError(null);

    try {
      await changeAdminMediaVariantAction(
        {
          productId,
          mediaId: item.id,
          variantId,
        },
      );

      cancelChangeVariant();
      router.refresh();
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Failed to change media variant.",
      );
    } finally {
      setProcessingId(null);
    }
  }

  async function setPrimary(
    item: AdminProductMedia,
  ) {
    if (item.isPrimary) {
      return;
    }

    setProcessingId(item.id);
    setError(null);

    try {
      await setAdminMediaPrimaryAction(
        {
          productId,
          mediaId: item.id,
        },
      );

      router.refresh();
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Failed to set primary media.",
      );
    } finally {
      setProcessingId(null);
    }
  }

  async function reorder(
    item: AdminProductMedia,
    direction: "up" | "down",
  ) {
    setProcessingId(item.id);
    setError(null);

    try {
      await reorderAdminMediaAction(
        {
          productId,
          mediaId: item.id,
          direction,
        },
      );

      router.refresh();
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Failed to reorder media.",
      );
    } finally {
      setProcessingId(null);
    }
  }

  async function deleteMedia(
    item: AdminProductMedia,
  ) {
    const confirmed =
      window.confirm(
        "Hapus media ini? Tindakan ini tidak dapat dibatalkan.",
      );

    if (!confirmed) {
      return;
    }

    setProcessingId(item.id);
    setError(null);

    try {
      await deleteAdminMediaAction(
        {
          productId,
          mediaId: item.id,
        },
      );

      router.refresh();
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Failed to delete media.",
      );
    } finally {
      setProcessingId(null);
    }
  }

  function renderAltEditor(
    item: AdminProductMedia,
  ) {
    const isEditing =
      editingId === item.id;

    if (!isEditing) {
      return (
        <div className="max-w-xs">
          <p className="line-clamp-2 text-sm text-neutral-600">
            {item.altText || "—"}
          </p>
        </div>
      );
    }

    return (
      <div className="space-y-2">
        <textarea
          value={editingAltText}
          onChange={(event) =>
            setEditingAltText(
              event.target.value,
            )
          }
          rows={3}
          className="w-full rounded-xl border border-stone-200 px-3 py-2 text-sm outline-none transition focus:border-neutral-900"
        />

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            disabled={
              processingId ===
              item.id
            }
            onClick={() =>
              saveAltText(item)
            }
            className="rounded-lg bg-neutral-900 px-3 py-2 text-xs text-white disabled:opacity-50"
          >
            Save
          </button>

          <button
            type="button"
            disabled={
              processingId ===
              item.id
            }
            onClick={cancelEdit}
            className="rounded-lg border border-stone-200 px-3 py-2 text-xs text-neutral-600 disabled:opacity-50"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  function renderVariantEditor(
    item: AdminProductMedia,
  ) {
    const isChanging =
      changingVariantId ===
      item.id;

    if (!isChanging) {
      if (!item.variant) {
        return (
          <span className="text-sm text-neutral-400">
            General
          </span>
        );
      }

      return (
        <div>
          <p className="text-sm text-neutral-800">
            {item.variant.color}
          </p>

          <p className="mt-1 text-xs text-neutral-400">
            {item.variant.size}
          </p>
        </div>
      );
    }

    return (
      <div className="space-y-2">
        <select
          value={
            changingVariantValue
          }
          onChange={(event) =>
            setChangingVariantValue(
              event.target.value,
            )
          }
          className="h-10 w-full rounded-xl border border-stone-200 bg-white px-3 text-sm outline-none focus:border-neutral-900"
        >
          <option value="general">
            General Product Media
          </option>

          {variants
            .filter(
              (variant) =>
                variant.status ===
                "active",
            )
            .map((variant) => (
              <option
                key={variant.id}
                value={String(
                  variant.id,
                )}
              >
                {variant.color} /{" "}
                {variant.size}
                {variant.sku
                  ? ` · ${variant.sku}`
                  : ""}
              </option>
            ))}
        </select>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            disabled={
              processingId ===
              item.id
            }
            onClick={() =>
              changeVariant(item)
            }
            className="rounded-lg bg-neutral-900 px-3 py-2 text-xs text-white disabled:opacity-50"
          >
            Save
          </button>

          <button
            type="button"
            disabled={
              processingId ===
              item.id
            }
            onClick={
              cancelChangeVariant
            }
            className="rounded-lg border border-stone-200 px-3 py-2 text-xs text-neutral-600 disabled:opacity-50"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <section className="space-y-4">
      <div className="rounded-2xl border border-stone-200 bg-white p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-[10px] uppercase tracking-[0.2em] text-neutral-400">
              Product Media
            </p>

            <p className="mt-2 text-sm text-neutral-600">
              {filteredMedia.length}{" "}
              media ditampilkan
            </p>
          </div>

          <div className="w-full lg:max-w-md">
            <label
              htmlFor="product-media-search"
              className="text-[10px] uppercase tracking-[0.2em] text-neutral-400"
            >
              Search
            </label>

            <input
              id="product-media-search"
              type="search"
              value={search}
              onChange={(event) =>
                setSearch(
                  event.target.value,
                )
              }
              placeholder="Search alt text, path, type, variant..."
              className="mt-2 h-11 w-full rounded-xl border border-stone-200 px-4 text-sm outline-none transition placeholder:text-neutral-400 focus:border-neutral-900"
            />
          </div>
        </div>
      </div>

      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {filteredMedia.length ===
      0 ? (
        <section className="rounded-2xl border border-dashed border-stone-300 bg-white px-6 py-16 text-center">
          <p className="text-sm text-neutral-600">
            Tidak ada media yang
            cocok.
          </p>

          {search && (
            <button
              type="button"
              onClick={() =>
                setSearch("")
              }
              className="mt-4 text-sm underline underline-offset-4"
            >
              Clear search
            </button>
          )}
        </section>
      ) : (
        <>
          <section className="space-y-3 lg:hidden">
            {filteredMedia.map(
              (item) => (
                <article
                  key={item.id}
                  className="rounded-2xl border border-stone-200 bg-white p-4"
                >
                  <div className="flex gap-4">
                    <button
                      type="button"
                      onClick={() =>
                        setPreviewMedia(
                          item,
                        )
                      }
                      className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-stone-100"
                    >
                      {item.type ===
                        "image" &&
                      item.publicUrl ? (
                        <Image
                          src={
                            item.publicUrl
                          }
                          alt={
                            item.altText ||
                            item.storagePath
                          }
                          fill
                          sizes="96px"
                          className="object-cover"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-[10px] uppercase tracking-[0.12em] text-neutral-400">
                          {item.type}
                        </div>
                      )}
                    </button>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <TypeBadge
                          type={
                            item.type
                          }
                        />

                        <PrimaryBadge
                          isPrimary={
                            item.isPrimary
                          }
                        />
                      </div>

                      <div className="mt-3">
                        {renderVariantEditor(
                          item,
                        )}
                      </div>

                      <div className="mt-3">
                        {renderAltEditor(
                          item,
                        )}
                      </div>

                      <p className="mt-3 break-all text-xs text-neutral-400">
                        {
                          item.storagePath
                        }
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2 border-t border-stone-100 pt-4">
                    <button
                      type="button"
                      onClick={() =>
                        setPreviewMedia(
                          item,
                        )
                      }
                      className="rounded-lg border border-stone-200 px-3 py-2 text-xs text-neutral-700"
                    >
                      Preview
                    </button>

                    <button
                      type="button"
                      disabled={
                        processingId ===
                        item.id
                      }
                      onClick={() =>
                        reorder(
                          item,
                          "up",
                        )
                      }
                      className="rounded-lg border border-stone-200 px-3 py-2 text-xs disabled:opacity-40"
                    >
                      ↑
                    </button>

                    <button
                      type="button"
                      disabled={
                        processingId ===
                        item.id
                      }
                      onClick={() =>
                        reorder(
                          item,
                          "down",
                        )
                      }
                      className="rounded-lg border border-stone-200 px-3 py-2 text-xs disabled:opacity-40"
                    >
                      ↓
                    </button>

                    {!item.isPrimary && (
                      <button
                        type="button"
                        disabled={
                          processingId ===
                          item.id
                        }
                        onClick={() =>
                          setPrimary(
                            item,
                          )
                        }
                        className="rounded-lg border border-stone-200 px-3 py-2 text-xs disabled:opacity-40"
                      >
                        Set Primary
                      </button>
                    )}

                    {editingId !==
                      item.id && (
                      <button
                        type="button"
                        disabled={
                          processingId ===
                          item.id
                        }
                        onClick={() =>
                          startEdit(
                            item,
                          )
                        }
                        className="rounded-lg border border-stone-200 px-3 py-2 text-xs disabled:opacity-40"
                      >
                        Edit Alt
                      </button>
                    )}

                    {changingVariantId !==
                      item.id && (
                      <button
                        type="button"
                        disabled={
                          processingId ===
                          item.id
                        }
                        onClick={() =>
                          startChangeVariant(
                            item,
                          )
                        }
                        className="rounded-lg border border-stone-200 px-3 py-2 text-xs disabled:opacity-40"
                      >
                        Change Variant
                      </button>
                    )}

                    <button
                      type="button"
                      disabled={
                        processingId ===
                        item.id
                      }
                      onClick={() =>
                        deleteMedia(
                          item,
                        )
                      }
                      className="rounded-lg border border-red-200 px-3 py-2 text-xs text-red-600 disabled:opacity-40"
                    >
                      Delete
                    </button>
                  </div>
                </article>
              ),
            )}
          </section>

          <section className="hidden overflow-hidden rounded-2xl border border-stone-200 bg-white lg:block">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1450px] text-left text-sm">
                <thead className="border-b border-stone-200 bg-stone-50/70">
                  <tr>
                    <th className="px-4 py-4 font-normal text-neutral-500">
                      #
                    </th>

                    <th className="px-4 py-4 font-normal text-neutral-500">
                      Preview
                    </th>

                    <th className="px-4 py-4 font-normal text-neutral-500">
                      Variant
                    </th>

                    <th className="px-4 py-4 font-normal text-neutral-500">
                      Type
                    </th>

                    <th className="px-4 py-4 font-normal text-neutral-500">
                      Alt Text
                    </th>

                    <th className="px-4 py-4 font-normal text-neutral-500">
                      Status
                    </th>

                    <th className="px-4 py-4 font-normal text-neutral-500">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-stone-100">
                  {filteredMedia.map(
                    (item, index) => (
                      <tr
                        key={item.id}
                        className="align-top"
                      >
                        <td className="px-4 py-5 text-xs text-neutral-400">
                          {index + 1}
                        </td>

                        <td className="px-4 py-5">
                          <button
                            type="button"
                            onClick={() =>
                              setPreviewMedia(
                                item,
                              )
                            }
                            className="relative h-20 w-20 overflow-hidden rounded-xl bg-stone-100"
                          >
                            {item.type ===
                              "image" &&
                            item.publicUrl ? (
                              <Image
                                src={
                                  item.publicUrl
                                }
                                alt={
                                  item.altText ||
                                  item.storagePath
                                }
                                fill
                                sizes="80px"
                                className="object-cover"
                              />
                            ) : (
                              <div className="flex h-full items-center justify-center text-[10px] uppercase tracking-[0.1em] text-neutral-400">
                                {item.type}
                              </div>
                            )}
                          </button>
                        </td>

                        <td className="px-4 py-5">
                          {renderVariantEditor(
                            item,
                          )}
                        </td>

                        <td className="px-4 py-5">
                          <TypeBadge
                            type={
                              item.type
                            }
                          />
                        </td>

                        <td className="px-4 py-5">
                          {renderAltEditor(
                            item,
                          )}
                        </td>

                        <td className="px-4 py-5">
                          <PrimaryBadge
                            isPrimary={
                              item.isPrimary
                            }
                          />
                        </td>

                        <td className="px-4 py-5">
                          <div className="flex flex-wrap gap-2">
                            <button
                              type="button"
                              disabled={
                                processingId ===
                                item.id
                              }
                              onClick={() =>
                                reorder(
                                  item,
                                  "up",
                                )
                              }
                              className="rounded-lg border border-stone-200 px-3 py-2 text-xs disabled:opacity-40"
                            >
                              ↑
                            </button>

                            <button
                              type="button"
                              disabled={
                                processingId ===
                                item.id
                              }
                              onClick={() =>
                                reorder(
                                  item,
                                  "down",
                                )
                              }
                              className="rounded-lg border border-stone-200 px-3 py-2 text-xs disabled:opacity-40"
                            >
                              ↓
                            </button>

                            {!item.isPrimary && (
                              <button
                                type="button"
                                disabled={
                                  processingId ===
                                  item.id
                                }
                                onClick={() =>
                                  setPrimary(
                                    item,
                                  )
                                }
                                className="rounded-lg border border-stone-200 px-3 py-2 text-xs disabled:opacity-40"
                              >
                                Set Primary
                              </button>
                            )}

                            {editingId !==
                              item.id && (
                              <button
                                type="button"
                                disabled={
                                  processingId ===
                                  item.id
                                }
                                onClick={() =>
                                  startEdit(
                                    item,
                                  )
                                }
                                className="rounded-lg border border-stone-200 px-3 py-2 text-xs disabled:opacity-40"
                              >
                                Edit Alt
                              </button>
                            )}

                            {changingVariantId !==
                              item.id && (
                              <button
                                type="button"
                                disabled={
                                  processingId ===
                                  item.id
                                }
                                onClick={() =>
                                  startChangeVariant(
                                    item,
                                  )
                                }
                                className="rounded-lg border border-stone-200 px-3 py-2 text-xs disabled:opacity-40"
                              >
                                Change Variant
                              </button>
                            )}

                            <button
                              type="button"
                              disabled={
                                processingId ===
                                item.id
                              }
                              onClick={() =>
                                deleteMedia(
                                  item,
                                )
                              }
                              className="rounded-lg border border-red-200 px-3 py-2 text-xs text-red-600 disabled:opacity-40"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ),
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}

      {previewMedia && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <button
            type="button"
            aria-label="Close preview"
            onClick={() =>
              setPreviewMedia(null)
            }
            className="absolute inset-0"
          />

          <div className="relative z-10 max-h-[90vh] w-full max-w-5xl overflow-hidden rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-stone-200 px-5 py-4">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">
                  {
                    previewMedia.storagePath
                  }
                </p>

                <p className="mt-1 text-xs text-neutral-400">
                  {
                    previewMedia.type
                  }
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  setPreviewMedia(null)
                }
                aria-label="Close preview"
                className="ml-4 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-stone-200 text-lg transition hover:border-neutral-900"
              >
                ×
              </button>
            </div>

            <div className="flex max-h-[75vh] items-center justify-center overflow-auto bg-stone-50 p-5">
              {previewMedia.type ===
                "image" &&
              previewMedia.publicUrl ? (
                <div className="relative h-[70vh] w-full">
                  <Image
                    src={
                      previewMedia.publicUrl
                    }
                    alt={
                      previewMedia.altText ||
                      previewMedia.storagePath
                    }
                    fill
                    sizes="90vw"
                    className="object-contain"
                  />
                </div>
              ) : previewMedia.type ===
                  "video" &&
                previewMedia.publicUrl ? (
                <video
                  src={
                    previewMedia.publicUrl
                  }
                  controls
                  className="max-h-[70vh] max-w-full"
                />
              ) : (
                <div className="py-20 text-sm text-neutral-400">
                  Preview tidak tersedia
                  untuk media ini.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}