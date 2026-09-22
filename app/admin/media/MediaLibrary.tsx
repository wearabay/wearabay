"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import type { AdminMediaLibraryItem } from "@/lib/admin-media";

type Props = {
  media: AdminMediaLibraryItem[];
};

function MediaTypeBadge({
  type,
}: {
  type: string;
}) {
  return (
    <span className="inline-flex shrink-0 items-center rounded-full border border-stone-200 bg-stone-50 px-2.5 py-1 text-[10px] uppercase tracking-[0.12em] text-neutral-600">
      {type}
    </span>
  );
}

function StatusBadge({
  isPrimary,
}: {
  isPrimary: boolean;
}) {
  if (isPrimary) {
    return (
      <span className="inline-flex shrink-0 items-center rounded-full border border-neutral-900 bg-neutral-900 px-2.5 py-1 text-[10px] uppercase tracking-[0.12em] text-white">
        Primary
      </span>
    );
  }

  return (
    <span className="inline-flex shrink-0 items-center rounded-full border border-stone-200 bg-white px-2.5 py-1 text-[10px] uppercase tracking-[0.12em] text-neutral-500">
      Secondary
    </span>
  );
}

function MediaThumbnail({
  item,
}: {
  item: AdminMediaLibraryItem;
}) {
  if (
    item.type === "image" &&
    item.publicUrl
  ) {
    return (
      <img
        src={item.publicUrl}
        alt={
          item.altText ||
          item.productName
        }
        style={{
          display: "block",
          width: "100%",
          height: "100%",
          maxWidth: "100%",
          maxHeight: "100%",
          objectFit: "cover",
        }}
      />
    );
  }

  if (
    item.type === "video" &&
    item.publicUrl
  ) {
    return (
      <video
        src={item.publicUrl}
        muted
        playsInline
        style={{
          display: "block",
          width: "100%",
          height: "100%",
          maxWidth: "100%",
          maxHeight: "100%",
          objectFit: "cover",
        }}
      />
    );
  }

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
      }}
      className="flex items-center justify-center rounded-xl bg-stone-100 text-[10px] uppercase tracking-[0.12em] text-neutral-400"
    >
      {item.type}
    </div>
  );
}

export default function MediaLibrary({
  media,
}: Props) {
  const [search, setSearch] =
    useState("");

  const [
    previewMedia,
    setPreviewMedia,
  ] = useState<AdminMediaLibraryItem | null>(
    null,
  );

  const filteredMedia =
    useMemo(() => {
      const query =
        search.trim().toLowerCase();

      if (!query) {
        return media;
      }

      return media.filter(
        (item) => {
          const variantText =
            item.variant
              ? `${item.variant.color} ${item.variant.size} ${item.variant.sku ?? ""}`
              : "general";

          return [
            item.productName,
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
    }, [media, search]);

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

  const imageCount =
    media.filter(
      (item) => item.type === "image",
    ).length;

  const videoCount =
    media.filter(
      (item) => item.type === "video",
    ).length;

  return (
    <main className="min-w-0 max-w-full space-y-8 overflow-x-hidden pt-2 lg:overflow-visible lg:pt-8">
      <div className="flex min-w-0 flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div className="min-w-0">
          <p className="text-[10px] uppercase tracking-[0.28em] text-neutral-400">
            Workspace
          </p>

          <h1 className="mt-2 text-2xl font-light tracking-tight sm:text-3xl">
            Media Library
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-neutral-500">
            Kelola seluruh media produk
            yang tersimpan di Wearabay.
          </p>
        </div>

        <Link
          href="/admin/products"
          className="inline-flex h-11 shrink-0 items-center justify-center rounded-xl border border-stone-200 bg-white px-5 text-sm text-neutral-700 transition hover:border-neutral-900 hover:text-neutral-900"
        >
          Products
        </Link>
      </div>

      <section className="grid min-w-0 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-stone-200 bg-white p-5">
          <p className="text-xs text-neutral-500">
            Total Media
          </p>

          <p className="mt-2 text-2xl font-light">
            {media.length}
          </p>
        </div>

        <div className="rounded-2xl border border-stone-200 bg-white p-5">
          <p className="text-xs text-neutral-500">
            Images
          </p>

          <p className="mt-2 text-2xl font-light">
            {imageCount}
          </p>
        </div>

        <div className="rounded-2xl border border-stone-200 bg-white p-5">
          <p className="text-xs text-neutral-500">
            Videos
          </p>

          <p className="mt-2 text-2xl font-light">
            {videoCount}
          </p>
        </div>
      </section>

      <section className="min-w-0 max-w-full rounded-2xl border border-stone-200 bg-white p-5">
        <label
          htmlFor="media-search"
          className="text-[10px] uppercase tracking-[0.2em] text-neutral-400"
        >
          Search Media
        </label>

        <div className="mt-3 min-w-0">
          <input
            id="media-search"
            type="search"
            value={search}
            onChange={(event) =>
              setSearch(
                event.target.value,
              )
            }
            placeholder="Search product, alt text, storage path, variant..."
            className="h-11 w-full max-w-full rounded-xl border border-stone-200 bg-white px-4 text-sm outline-none transition placeholder:text-neutral-400 focus:border-neutral-900"
          />
        </div>
      </section>

      {filteredMedia.length ===
      0 ? (
        <section className="rounded-2xl border border-dashed border-stone-300 bg-white px-6 py-16 text-center">
          <p className="text-sm text-neutral-600">
            Tidak ada media yang cocok
            dengan pencarian.
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
          {/* MOBILE */}
          <section className="min-w-0 max-w-full space-y-3 overflow-hidden lg:hidden">
            {filteredMedia.map(
              (item) => (
                <article
                  key={item.id}
                  className="min-w-0 max-w-full overflow-hidden rounded-2xl border border-stone-200 bg-white p-4"
                >
                  <div className="flex min-w-0 items-start gap-4">
                    {/* Fixed thumbnail */}
                    <button
  type="button"
  onClick={() =>
    setPreviewMedia(item)
  }
  aria-label={`Preview ${item.productName}`}
  className="shrink-0 overflow-hidden rounded-xl bg-stone-100"
  style={{
    width: "88px",
    height: "88px",
    minWidth: "88px",
    minHeight: "88px",
    maxWidth: "88px",
    maxHeight: "88px",
    flex: "0 0 88px",
  }}
>
  <MediaThumbnail item={item} />
</button>

                    {/* Content */}
                    <div className="min-w-0 flex-1">
                      <div className="flex min-w-0 items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium text-neutral-900">
                            {
                              item.productName
                            }
                          </p>

                          <p className="mt-1 truncate text-xs text-neutral-400">
                            {
                              item.storagePath
                            }
                          </p>

                          {item.variant && (
                            <p className="mt-1 truncate text-xs text-neutral-400">
                              {
                                item
                                  .variant
                                  .color
                              }{" "}
                              /{" "}
                              {
                                item
                                  .variant
                                  .size
                              }
                            </p>
                          )}
                        </div>

                        <StatusBadge
                          isPrimary={
                            item.isPrimary
                          }
                        />
                      </div>

                      <div className="mt-3 flex min-w-0 items-center gap-2">
                        <MediaTypeBadge
                          type={
                            item.type
                          }
                        />

                        {item.altText ? (
                          <span className="min-w-0 truncate text-xs text-neutral-500">
                            {
                              item.altText
                            }
                          </span>
                        ) : (
                          <span className="text-xs text-neutral-400">
                            No alt text
                          </span>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          setPreviewMedia(
                            item,
                          )
                        }
                        className="mt-3 text-xs underline underline-offset-4"
                      >
                        Preview
                      </button>
                    </div>
                  </div>
                </article>
              ),
            )}
          </section>

          {/* DESKTOP */}
          <section className="hidden min-w-0 overflow-hidden rounded-2xl border border-stone-200 bg-white lg:block">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1000px] text-left text-sm">
                <thead className="border-b border-stone-200 bg-stone-50/70">
                  <tr>
                    <th className="px-5 py-4 font-normal text-neutral-500">
                      Preview
                    </th>

                    <th className="px-5 py-4 font-normal text-neutral-500">
                      Product
                    </th>

                    <th className="px-5 py-4 font-normal text-neutral-500">
                      Variant
                    </th>

                    <th className="px-5 py-4 font-normal text-neutral-500">
                      Type
                    </th>

                    <th className="px-5 py-4 font-normal text-neutral-500">
                      Alt Text
                    </th>

                    <th className="px-5 py-4 font-normal text-neutral-500">
                      Status
                    </th>

                    <th className="px-5 py-4 font-normal text-neutral-500">
                      Action
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-stone-100">
                  {filteredMedia.map(
                    (item) => (
                      <tr
                        key={item.id}
                        className="align-middle"
                      >
                        <td className="px-5 py-4">
                          <button
                            type="button"
                            onClick={() =>
                              setPreviewMedia(
                                item,
                              )
                            }
                            aria-label={`Preview ${item.productName}`}
                            className="h-16 w-16 overflow-hidden rounded-xl bg-stone-100"
                          >
                            <MediaThumbnail
                              item={item}
                            />
                          </button>
                        </td>

                        <td className="px-5 py-4">
                          <p className="font-medium text-neutral-900">
                            {
                              item.productName
                            }
                          </p>

                          <p className="mt-1 max-w-xs truncate text-xs text-neutral-400">
                            {
                              item.storagePath
                            }
                          </p>
                        </td>

                        <td className="px-5 py-4">
                          {item.variant ? (
                            <div>
                              <p className="text-sm text-neutral-800">
                                {
                                  item
                                    .variant
                                    .color
                                }
                              </p>

                              <p className="mt-1 text-xs text-neutral-400">
                                {
                                  item
                                    .variant
                                    .size
                                }
                              </p>
                            </div>
                          ) : (
                            <span className="text-sm text-neutral-400">
                              General
                            </span>
                          )}
                        </td>

                        <td className="px-5 py-4">
                          <MediaTypeBadge
                            type={
                              item.type
                            }
                          />
                        </td>

                        <td className="max-w-xs px-5 py-4 text-neutral-500">
                          <span className="line-clamp-2">
                            {item.altText ||
                              "—"}
                          </span>
                        </td>

                        <td className="px-5 py-4">
                          <StatusBadge
                            isPrimary={
                              item.isPrimary
                            }
                          />
                        </td>

                        <td className="px-5 py-4">
                          <button
                            type="button"
                            onClick={() =>
                              setPreviewMedia(
                                item,
                              )
                            }
                            className="text-xs underline underline-offset-4"
                          >
                            Preview
                          </button>
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

      {/* PREVIEW MODAL */}
      {previewMedia && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-2 sm:p-4">
          <button
            type="button"
            aria-label="Close preview"
            onClick={() =>
              setPreviewMedia(null)
            }
            className="absolute inset-0 cursor-default"
          />

          <div className="relative z-10 flex max-h-[calc(100dvh-16px)] w-full max-w-5xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl sm:max-h-[calc(100dvh-32px)]">
            {/* Header */}
            <div className="flex min-h-[68px] shrink-0 items-center justify-between border-b border-stone-200 px-4 py-3 sm:px-5 sm:py-4">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">
                  {
                    previewMedia.productName
                  }
                </p>

                <p className="mt-1 truncate text-xs text-neutral-400">
                  {
                    previewMedia.storagePath
                  }
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  setPreviewMedia(null)
                }
                className="ml-4 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-stone-200 text-lg transition hover:border-neutral-900"
                aria-label="Close preview"
              >
                ×
              </button>
            </div>

            {/* Preview area */}
            <div className="flex min-h-0 flex-1 items-center justify-center overflow-hidden bg-stone-100 p-3 sm:p-5">
              {previewMedia.type ===
                "image" &&
              previewMedia.publicUrl ? (
                <img
                  src={
                    previewMedia.publicUrl
                  }
                  alt={
                    previewMedia.altText ||
                    previewMedia.productName
                  }
                  className="block rounded-xl object-contain"
                  style={{
                    display: "block",
                    width: "auto",
                    height: "auto",
                    maxWidth:
                      "calc(100vw - 32px)",
                    maxHeight:
                      "calc(100dvh - 120px)",
                    objectFit: "contain",
                  }}
                />
              ) : previewMedia.type ===
                  "video" &&
                previewMedia.publicUrl ? (
                <video
                  src={
                    previewMedia.publicUrl
                  }
                  controls
                  playsInline
                  className="block rounded-xl object-contain"
                  style={{
                    display: "block",
                    width: "auto",
                    height: "auto",
                    maxWidth:
                      "calc(100vw - 32px)",
                    maxHeight:
                      "calc(100dvh - 120px)",
                    objectFit: "contain",
                  }}
                />
              ) : (
                <div className="rounded-xl border border-stone-200 bg-white px-6 py-12 text-center text-sm text-neutral-400">
                  Preview tidak tersedia
                  untuk media ini.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}