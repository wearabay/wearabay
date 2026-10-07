"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

import { uploadMedia } from "@/lib/media-upload";

import {
  createAdminCategoryAction,
  setAdminCategoryCoverAction,
  updateAdminCategoryAction,
} from "./actions";

import type { AdminCategory } from "@/lib/admin-categories";

type Props = {
  mode: "create" | "edit";
  category?: AdminCategory;
};

function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export default function CategoryForm({
  mode,
  category,
}: Props) {
  const isEdit = mode === "edit";

  const [name, setName] = useState(
    category?.name ?? "",
  );

  const [slug, setSlug] = useState(
    category?.slug ?? "",
  );

  const [description, setDescription] =
    useState(
      category?.description ?? "",
    );

  const [sortOrder, setSortOrder] =
    useState(
      String(category?.sortOrder ?? 0),
    );

  const [isActive, setIsActive] =
    useState(
      category?.isActive ?? true,
    );

  const [coverImage, setCoverImage] =
    useState<string | null>(
      category?.coverImage ?? null,
    );

  const [selectedFile, setSelectedFile] =
    useState<File | null>(null);

  const [removeCover, setRemoveCover] =
    useState(false);

  const [pending, setPending] =
    useState(false);

  const [uploading, setUploading] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);

  function handleNameChange(
    value: string,
  ) {
    setName(value);

    if (!isEdit) {
      setSlug(slugify(value));
    }
  }

  function handleFileChange(
    event: React.ChangeEvent<HTMLInputElement>,
  ) {
    const file =
      event.target.files?.[0] ?? null;

    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      setError(
        "Cover image harus berupa file gambar.",
      );

      event.target.value = "";
      return;
    }

    setSelectedFile(file);
    setRemoveCover(false);
    setError(null);
  }

  function handleRemoveCover() {
    setSelectedFile(null);
    setCoverImage(null);
    setRemoveCover(true);
    setError(null);
  }

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (!name.trim()) {
      setError(
        "Category name wajib diisi.",
      );
      return;
    }

    if (!slug.trim()) {
      setError("Slug wajib diisi.");
      return;
    }

    setPending(true);
    setError(null);

    try {
      if (!isEdit) {
        const created =
          await createAdminCategoryAction({
            name: name.trim(),
            slug: slug.trim(),
            description:
              description.trim(),
            sortOrder:
              Number(sortOrder) || 0,
            isActive,
          });

        if (selectedFile) {
          setUploading(true);

          const uploaded =
            await uploadMedia({
              file: selectedFile,
              folder: "categories",
              entityId: created.id,
            });

          await setAdminCategoryCoverAction(
            created.id,
            uploaded.publicUrl,
          );

          setUploading(false);
        }

        window.location.href =
          `/admin/categories/${created.id}`;

        return;
      }

      if (!category) {
        throw new Error(
          "Category data tidak ditemukan.",
        );
      }

      await updateAdminCategoryAction(
        category.id,
        {
          name: name.trim(),
          slug: slug.trim(),
          description:
            description.trim(),
          coverImage:
            removeCover &&
            !selectedFile
              ? ""
              : category.coverImage ??
                "",
          sortOrder:
            Number(sortOrder) || 0,
          isActive,
        },
      );

      if (selectedFile) {
        setUploading(true);

        const uploaded =
          await uploadMedia({
            file: selectedFile,
            folder: "categories",
            entityId: category.id,
          });

        await setAdminCategoryCoverAction(
          category.id,
          uploaded.publicUrl,
        );

        setUploading(false);
      } else if (removeCover) {
        await setAdminCategoryCoverAction(
          category.id,
          null,
        );
      }

      window.location.href =
        "/admin/categories";
    } catch (caughtError) {
      setUploading(false);

      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Something went wrong.",
      );
    } finally {
      setPending(false);
    }
  }

  const displayedCover =
    selectedFile
      ? URL.createObjectURL(
          selectedFile,
        )
      : coverImage;

  const busy =
    pending || uploading;

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6"
    >
      {/* =================================================
          BASIC INFORMATION
      ================================================= */}

      <section className="overflow-hidden rounded-2xl border border-stone-300 bg-white">
        <div className="border-b border-stone-300 bg-stone-50/70 px-5 py-5 sm:px-6">
          <p className="text-xs uppercase tracking-[0.25em] text-neutral-500">
            Category
          </p>

          <h2 className="mt-2 font-medium">
            Basic Information
          </h2>

          <p className="mt-1 text-sm text-neutral-500">
            Define the category information used
            across the Wearabay catalog.
          </p>
        </div>

        <div className="space-y-5 p-5 sm:p-6">
          {/* NAME */}

          <div>
            <label
              htmlFor="category-name"
              className="text-sm font-medium"
            >
              Category Name
            </label>

            <input
              id="category-name"
              type="text"
              value={name}
              onChange={(event) =>
                handleNameChange(
                  event.target.value,
                )
              }
              placeholder="e.g. Abaya"
              disabled={busy}
              className="mt-2 h-11 w-full rounded-xl border border-stone-300 bg-white px-4 text-sm outline-none transition focus:border-black disabled:bg-stone-50"
            />
          </div>

          {/* SLUG */}

          <div>
            <div className="flex items-center justify-between gap-4">
              <label
                htmlFor="category-slug"
                className="text-sm font-medium"
              >
                Slug
              </label>

              <button
                type="button"
                onClick={() =>
                  setSlug(
                    slugify(name),
                  )
                }
                disabled={busy}
                className="text-xs text-neutral-500 underline underline-offset-4 transition hover:text-black disabled:opacity-50"
              >
                Generate from name
              </button>
            </div>

            <input
              id="category-slug"
              type="text"
              value={slug}
              onChange={(event) =>
                setSlug(
                  slugify(
                    event.target.value,
                  ),
                )
              }
              placeholder="abaya"
              disabled={busy}
              className="mt-2 h-11 w-full rounded-xl border border-stone-300 bg-white px-4 text-sm outline-none transition focus:border-black disabled:bg-stone-50"
            />

            <p className="mt-2 text-xs text-neutral-500">
              Storefront URL: /category/
              {slug || "..."}
            </p>
          </div>

          {/* DESCRIPTION */}

          <div>
            <label
              htmlFor="category-description"
              className="text-sm font-medium"
            >
              Description
            </label>

            <textarea
              id="category-description"
              value={description}
              onChange={(event) =>
                setDescription(
                  event.target.value,
                )
              }
              placeholder="Short description for this category..."
              rows={4}
              disabled={busy}
              className="mt-2 w-full resize-y rounded-xl border border-stone-300 bg-white px-4 py-3 text-sm leading-6 outline-none transition focus:border-black disabled:bg-stone-50"
            />
          </div>
        </div>
      </section>

      {/* =================================================
          COVER IMAGE
      ================================================= */}

      <section className="overflow-hidden rounded-2xl border border-stone-300 bg-white">
        <div className="border-b border-stone-300 bg-stone-50/70 px-5 py-5 sm:px-6">
          <p className="text-xs uppercase tracking-[0.25em] text-neutral-500">
            Visual
          </p>

          <h2 className="mt-2 font-medium">
            Cover Image
          </h2>

          <p className="mt-1 text-sm text-neutral-500">
            Used for category presentation and
            storefront collections.
          </p>
        </div>

        <div className="p-5 sm:p-6">
          <div className="flex flex-col gap-5 sm:flex-row">
            {/* PREVIEW */}

            <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl border border-stone-300 bg-stone-50 sm:w-64">
              {displayedCover ? (
                <Image
                  src={displayedCover}
                  alt={
                    name
                      ? `${name} cover`
                      : "Category cover"
                  }
                  fill
                  unoptimized={displayedCover.startsWith(
                    "blob:",
                  )}
                  className="object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center px-6 text-center">
                  <span className="text-xs uppercase tracking-[0.18em] text-neutral-400">
                    No Cover Image
                  </span>
                </div>
              )}
            </div>

            {/* UPLOAD CONTROLS */}

            <div className="flex min-w-0 flex-1 flex-col justify-center">
              <label
                htmlFor="category-cover"
                className={`inline-flex h-11 items-center justify-center rounded-full border border-stone-300 px-5 text-sm font-medium transition ${
                  busy
                    ? "cursor-not-allowed opacity-50"
                    : "cursor-pointer hover:border-black"
                }`}
              >
                {selectedFile
                  ? "Choose Another Image"
                  : "Upload Cover Image"}

                <input
                  id="category-cover"
                  type="file"
                  accept="image/*"
                  onChange={
                    handleFileChange
                  }
                  disabled={busy}
                  className="sr-only"
                />
              </label>

              {selectedFile && (
                <p className="mt-3 break-all text-xs text-neutral-500">
                  {selectedFile.name}
                </p>
              )}

              {(coverImage ||
                selectedFile) && (
                <button
                  type="button"
                  onClick={
                    handleRemoveCover
                  }
                  disabled={busy}
                  className="mt-3 w-fit text-xs text-neutral-500 underline underline-offset-4 transition hover:text-black disabled:opacity-50"
                >
                  Remove cover image
                </button>
              )}

              <p className="mt-4 text-xs leading-5 text-neutral-500">
                Upload an image suitable for
                the category collection card.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* =================================================
          DISPLAY SETTINGS
      ================================================= */}

      <section className="overflow-hidden rounded-2xl border border-stone-300 bg-white">
        <div className="border-b border-stone-300 bg-stone-50/70 px-5 py-5 sm:px-6">
          <p className="text-xs uppercase tracking-[0.25em] text-neutral-500">
            Display
          </p>

          <h2 className="mt-2 font-medium">
            Category Settings
          </h2>
        </div>

        <div className="space-y-5 p-5 sm:p-6">
          {/* SORT ORDER */}

          <div>
            <label
              htmlFor="category-sort-order"
              className="text-sm font-medium"
            >
              Sort Order
            </label>

            <input
              id="category-sort-order"
              type="number"
              min="0"
              value={sortOrder}
              onChange={(event) =>
                setSortOrder(
                  event.target.value,
                )
              }
              disabled={busy}
              className="mt-2 h-11 w-full rounded-xl border border-stone-300 bg-white px-4 text-sm outline-none transition focus:border-black disabled:bg-stone-50 sm:max-w-xs"
            />

            <p className="mt-2 text-xs text-neutral-500">
              Lower numbers appear first.
            </p>
          </div>

          {/* ACTIVE */}

          <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-stone-200 p-4">
            <input
              type="checkbox"
              checked={isActive}
              onChange={(event) =>
                setIsActive(
                  event.target.checked,
                )
              }
              disabled={busy}
              className="mt-0.5 h-4 w-4 accent-black"
            />

            <span>
              <span className="block text-sm font-medium">
                Active category
              </span>

              <span className="mt-1 block text-xs leading-5 text-neutral-500">
                Active categories can be used
                throughout the catalog.
              </span>
            </span>
          </label>
        </div>
      </section>

      {/* =================================================
          ERROR
      ================================================= */}

      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* =================================================
          ACTIONS
      ================================================= */}

      <div className="flex flex-col-reverse gap-3 border-t border-stone-200 pt-6 sm:flex-row sm:items-center sm:justify-between">
        <Link
          href="/admin/categories"
          className="inline-flex h-11 items-center justify-center rounded-full border border-stone-300 px-5 text-sm font-medium transition hover:border-black"
        >
          Cancel
        </Link>

        <button
          type="submit"
          disabled={busy}
          className="inline-flex h-11 items-center justify-center rounded-full bg-black px-6 text-sm font-medium text-white transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {uploading
            ? "Uploading Cover..."
            : pending
              ? "Saving..."
              : isEdit
                ? "Save Changes"
                : "Create Category"}
        </button>
      </div>
    </form>
  );
}