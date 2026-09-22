"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import type {
  AdminProductMedia,
  AdminProductVariant,
} from "@/lib/admin-media";

import MediaTable from "./MediaTable";
import MediaUploader from "./MediaUploader";

type Props = {
  product: {
    id: number;
    name: string;
  };
  media: AdminProductMedia[];
  variants: AdminProductVariant[];
};

export default function MediaPageClient({
  product,
  media,
  variants,
}: Props) {
  const router = useRouter();

  const [
    showUploader,
    setShowUploader,
  ] = useState(false);

  const [
    selectedVariant,
    setSelectedVariant,
  ] = useState<string>("all");

  const activeVariants =
    variants.filter(
      (variant) =>
        variant.status === "active",
    );

  const imageCount =
    media.filter(
      (item) => item.type === "image",
    ).length;

  const videoCount =
    media.filter(
      (item) => item.type === "video",
    ).length;

  const primaryCount =
    media.filter(
      (item) => item.isPrimary,
    ).length;

  return (
    <main className="space-y-8 pt-2 lg:pt-8">
      <div className="space-y-5">
        <div className="flex flex-wrap items-center gap-2 text-xs text-neutral-400">
          <Link
            href="/admin/products"
            className="transition hover:text-neutral-900"
          >
            Products
          </Link>

          <span>/</span>

          <Link
            href={`/admin/products/${product.id}`}
            className="transition hover:text-neutral-900"
          >
            {product.name}
          </Link>

          <span>/</span>

          <span className="text-neutral-600">
            Media
          </span>
        </div>

        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-[10px] uppercase tracking-[0.28em] text-neutral-400">
              Product Workspace
            </p>

            <h1 className="mt-2 text-2xl font-light tracking-tight sm:text-3xl">
              Product Media
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-neutral-500">
              Kelola media untuk produk{" "}
              {product.name}.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href={`/admin/products/${product.id}`}
              className="inline-flex h-11 items-center justify-center rounded-xl border border-stone-200 bg-white px-5 text-sm text-neutral-700 transition hover:border-neutral-900 hover:text-neutral-900"
            >
              Back to Product
            </Link>

            <button
              type="button"
              onClick={() =>
                setShowUploader(true)
              }
              className="inline-flex h-11 items-center justify-center rounded-xl bg-neutral-900 px-5 text-sm text-white transition hover:bg-neutral-800"
            >
              Add Media
            </button>
          </div>
        </div>
      </div>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
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

        <div className="rounded-2xl border border-stone-200 bg-white p-5">
          <p className="text-xs text-neutral-500">
            Primary
          </p>

          <p className="mt-2 text-2xl font-light">
            {primaryCount}
          </p>
        </div>
      </section>

      <section className="rounded-2xl border border-stone-200 bg-white p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium">
              Variant Filter
            </p>

            <p className="mt-1 text-xs text-neutral-400">
              Filter media berdasarkan
              variant produk.
            </p>
          </div>

          <label className="sm:min-w-[280px]">
            <span className="sr-only">
              Filter variant
            </span>

            <select
              value={selectedVariant}
              onChange={(event) =>
                setSelectedVariant(
                  event.target.value,
                )
              }
              className="h-11 w-full rounded-xl border border-stone-200 bg-white px-4 text-sm outline-none transition focus:border-neutral-900"
            >
              <option value="all">
                All Variants
              </option>

              <option value="general">
                General Product Media
              </option>

              {activeVariants.map(
                (variant) => (
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
                ),
              )}
            </select>
          </label>
        </div>
      </section>

      <MediaTable
        productId={product.id}
        media={media}
        variants={variants}
        selectedVariant={
          selectedVariant
        }
      />

      {showUploader && (
        <MediaUploader
          productId={product.id}
          variants={activeVariants}
          defaultVariant={
            selectedVariant === "all"
              ? "general"
              : selectedVariant ===
                  "general"
                ? "general"
                : Number(
                    selectedVariant,
                  )
          }
          onClose={() =>
            setShowUploader(false)
          }
          onSuccess={() => {
            setShowUploader(false);
            router.refresh();
          }}
        />
      )}
    </main>
  );
}