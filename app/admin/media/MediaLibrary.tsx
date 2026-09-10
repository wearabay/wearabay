"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import type {
  AdminMediaLibraryItem,
} from "@/lib/admin-media";

type Props = {
  media: AdminMediaLibraryItem[];
};

export default function MediaLibrary({
  media,
}: Props) {
  const [search, setSearch] =
    useState("");

  const [selectedMedia, setSelectedMedia] =
    useState<AdminMediaLibraryItem | null>(
      null
    );

  const filteredMedia = useMemo(() => {
    const query =
      search.trim().toLowerCase();

    if (!query) {
      return media;
    }

    return media.filter((item) => {
      return (
        item.productName
          .toLowerCase()
          .includes(query) ||
        item.altText
          ?.toLowerCase()
          .includes(query) ||
        item.storagePath
          .toLowerCase()
          .includes(query)
      );
    });
  }, [media, search]);

  useEffect(() => {
    function handleKeyDown(
      event: KeyboardEvent
    ) {
      if (event.key === "Escape") {
        setSelectedMedia(null);
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
    if (selectedMedia) {
      document.body.style.overflow =
        "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [selectedMedia]);

  return (
    <>
      <main className="px-6 py-24 lg:px-10">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8">
            <div className="mb-4 flex flex-wrap items-center gap-2 text-xs text-neutral-400">
              <Link
                href="/admin"
                className="transition hover:text-black"
              >
                Dashboard
              </Link>

              <span>/</span>

              <span>Media</span>
            </div>

            <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="mb-2 text-xs uppercase tracking-[0.2em] text-neutral-500">
                  Media Library
                </p>

                <h1 className="text-3xl font-medium tracking-tight">
                  Media
                </h1>

                <p className="mt-2 text-sm text-neutral-500">
                  Manage product images and
                  videos across the store.
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <Link
                  href="/admin/products"
                  className="inline-flex h-11 items-center justify-center rounded-full border border-neutral-300 px-5 text-sm font-medium transition hover:border-black hover:bg-neutral-50"
                >
                  Products
                </Link>
              </div>
            </div>
          </div>

          <div className="mb-6 grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-neutral-200 bg-white p-5">
              <p className="text-xs uppercase tracking-[0.16em] text-neutral-400">
                Total Media
              </p>

              <p className="mt-2 text-2xl font-medium">
                {media.length}
              </p>
            </div>

            <div className="rounded-2xl border border-neutral-200 bg-white p-5">
              <p className="text-xs uppercase tracking-[0.16em] text-neutral-400">
                Images
              </p>

              <p className="mt-2 text-2xl font-medium">
                {
                  media.filter(
                    (item) =>
                      item.type === "image"
                  ).length
                }
              </p>
            </div>

            <div className="rounded-2xl border border-neutral-200 bg-white p-5">
              <p className="text-xs uppercase tracking-[0.16em] text-neutral-400">
                Videos
              </p>

              <p className="mt-2 text-2xl font-medium">
                {
                  media.filter(
                    (item) =>
                      item.type === "video"
                  ).length
                }
              </p>
            </div>
          </div>

          <div className="mb-5">
            <input
              type="search"
              value={search}
              onChange={(event) =>
                setSearch(
                  event.target.value
                )
              }
              placeholder="Search product, alt text, or file path..."
              className="h-11 w-full rounded-full border border-neutral-200 bg-white px-5 text-sm outline-none transition placeholder:text-neutral-400 focus:border-neutral-400"
            />
          </div>

          {filteredMedia.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-neutral-300 px-6 py-16 text-center">
              <p className="text-sm font-medium">
                {media.length === 0
                  ? "No media yet."
                  : "No media found."}
              </p>

              <p className="mt-2 text-sm text-neutral-500">
                {media.length === 0
                  ? "Upload product media from the product media manager."
                  : "Try a different search keyword."}
              </p>
            </div>
          ) : (
            <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[900px] border-collapse">
                  <thead>
                    <tr className="border-b border-neutral-200 text-left">
                      <th className="px-5 py-4 text-xs font-medium uppercase tracking-[0.14em] text-neutral-400">
                        Preview
                      </th>

                      <th className="px-5 py-4 text-xs font-medium uppercase tracking-[0.14em] text-neutral-400">
                        Product
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
                        Action
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredMedia.map(
                      (item) => (
                        <tr
                          key={item.id}
                          className="border-b border-neutral-100 last:border-b-0"
                        >
                          <td className="px-5 py-4">
                            <button
                              type="button"
                              onClick={() =>
                                setSelectedMedia(
                                  item
                                )
                              }
                              className="group relative flex h-20 w-20 items-center justify-center overflow-hidden rounded-xl border border-neutral-200 bg-neutral-50"
                              aria-label={`Preview ${item.productName}`}
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
                                <img
                                  src={
                                    item.publicUrl
                                  }
                                  alt={
                                    item.altText ??
                                    item.productName
                                  }
                                  className="block h-full w-full object-contain transition duration-200 group-hover:scale-105"
                                />
                              )}

                              <span className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/0 text-white opacity-0 transition group-hover:bg-black/25 group-hover:opacity-100">
                                Preview
                              </span>
                            </button>
                          </td>

                          <td className="px-5 py-4">
                            <Link
                              href={`/admin/products/${item.productId}/media`}
                              className="font-medium transition hover:underline"
                            >
                              {item.productName}
                            </Link>

                            <p className="mt-1 text-xs text-neutral-400">
                              Product #
                              {item.productId}
                            </p>
                          </td>

                          <td className="px-5 py-4">
                            <span className="rounded-full border border-neutral-200 px-3 py-1 text-xs capitalize">
                              {item.type}
                            </span>
                          </td>

                          <td className="max-w-[240px] px-5 py-4">
                            <p className="truncate text-sm text-neutral-600">
                              {item.altText ||
                                "—"}
                            </p>
                          </td>

                          <td className="px-5 py-4">
                            {item.isPrimary ? (
                              <span className="rounded-full bg-black px-3 py-1 text-xs font-medium text-white">
                                Primary
                              </span>
                            ) : (
                              <span className="text-xs text-neutral-400">
                                Gallery
                              </span>
                            )}
                          </td>

                          <td className="px-5 py-4 text-right">
                            <Link
                              href={`/admin/products/${item.productId}/media`}
                              className="text-sm font-medium transition hover:underline"
                            >
                              Manage
                            </Link>
                          </td>
                        </tr>
                      )
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </main>

      {selectedMedia && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 p-4 sm:p-8"
          role="dialog"
          aria-modal="true"
          aria-label="Media preview"
          onMouseDown={(event) => {
            if (
              event.target ===
              event.currentTarget
            ) {
              setSelectedMedia(null);
            }
          }}
        >
          <button
            type="button"
            onClick={() =>
              setSelectedMedia(null)
            }
            aria-label="Close preview"
            className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full border border-white/30 bg-black/30 text-2xl text-white transition hover:bg-black/50"
          >
            ×
          </button>

          <div className="flex max-h-[90vh] max-w-[94vw] flex-col items-center">
            {selectedMedia.type ===
            "video" ? (
              <video
                src={selectedMedia.publicUrl}
                controls
                autoPlay
                className="max-h-[82vh] max-w-[90vw] rounded-xl object-contain"
              />
            ) : (
              <img
                src={selectedMedia.publicUrl}
                alt={
                  selectedMedia.altText ??
                  selectedMedia.productName
                }
                className="max-h-[82vh] max-w-[90vw] rounded-xl object-contain"
              />
            )}

            <div className="mt-4 max-w-[90vw] text-center text-white">
              <p className="text-sm font-medium">
                {selectedMedia.productName}
              </p>

              <p className="mt-1 break-all text-xs text-white/60">
                {selectedMedia.storagePath}
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}