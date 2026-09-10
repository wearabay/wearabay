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

type Product = {
  id: number;
  name: string;
};

export type VariantFilter =
  | "all"
  | "general"
  | number;

type Props = {
  product: Product;
  media: AdminProductMedia[];
  variants: AdminProductVariant[];
};

export default function MediaPageClient({
  product,
  media,
  variants,
}: Props) {
  const router = useRouter();

  const [showUploader, setShowUploader] =
    useState(false);

  const [selectedVariant, setSelectedVariant] =
    useState<VariantFilter>("all");

  const activeVariants =
    variants.filter(
      (variant) =>
        variant.status === "active"
    );

  function handleUploadSuccess() {
    setShowUploader(false);
    router.refresh();
  }

  return (
    <>
      <main className="px-6 py-24 lg:px-10">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8">
            <div className="mb-4 flex flex-wrap items-center gap-2 text-xs text-neutral-400">
              <Link
                href="/admin/products"
                className="transition hover:text-black"
              >
                Products
              </Link>

              <span>/</span>

              <Link
                href={`/admin/products/${product.id}`}
                className="transition hover:text-black"
              >
                {product.name}
              </Link>

              <span>/</span>

              <span>Media</span>
            </div>

            <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="mb-2 text-xs uppercase tracking-[0.2em] text-neutral-500">
                  Product Media
                </p>

                <h1 className="text-3xl font-medium tracking-tight">
                  {product.name}
                </h1>

                <p className="mt-2 text-sm text-neutral-500">
                  Manage product and variant
                  media.
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <Link
                  href={`/admin/products/${product.id}`}
                  className="inline-flex h-11 items-center justify-center rounded-full border border-neutral-300 px-5 text-sm font-medium transition hover:border-black hover:bg-neutral-50"
                >
                  Back to Edit Product
                </Link>

                <button
                  type="button"
                  onClick={() =>
                    setShowUploader(true)
                  }
                  className="inline-flex h-11 items-center justify-center rounded-full border border-black bg-black px-6 text-sm font-medium text-white transition hover:bg-neutral-800"
                >
                  + Add Media
                </button>
              </div>
            </div>
          </div>

          <div className="mb-6 rounded-2xl border border-neutral-200 bg-white p-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.16em] text-neutral-400">
                  Variant
                </p>

                <p className="mt-1 text-sm text-neutral-500">
                  Filter media by product
                  variant.
                </p>
              </div>

              <select
                value={
                  selectedVariant === "all"
                    ? ""
                    : selectedVariant ===
                        "general"
                      ? "general"
                      : String(
                          selectedVariant
                        )
                }
                onChange={(event) => {
                  const value =
                    event.target.value;

                  if (!value) {
                    setSelectedVariant(
                      "all"
                    );
                    return;
                  }

                  if (
                    value === "general"
                  ) {
                    setSelectedVariant(
                      "general"
                    );
                    return;
                  }

                  setSelectedVariant(
                    Number(value)
                  );
                }}
                className="h-11 w-full rounded-full border border-neutral-200 bg-white px-4 text-sm outline-none transition focus:border-neutral-400 sm:w-[380px]"
              >
                <option value="">
                  All Variants
                </option>

                <option value="general">
                  General Product Media
                </option>

                {activeVariants.map(
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
            </div>
          </div>

          <MediaTable
            product={product}
            media={media}
            variants={activeVariants}
            selectedVariant={
              selectedVariant
            }
          />
        </div>
      </main>

      {showUploader && (
        <MediaUploader
          productId={product.id}
          variants={activeVariants}
          defaultVariant={
            selectedVariant
          }
          onSuccess={
            handleUploadSuccess
          }
          onClose={() =>
            setShowUploader(false)
          }
        />
      )}
    </>
  );
}