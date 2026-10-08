"use client";

import Link from "next/link";
import { useState } from "react";

import type { AdminProductVariant } from "@/lib/admin-variants";

import { updateAdminVariantAction } from "../../actions";

type Props = {
  productId: number;
  variant: AdminProductVariant;
};

export default function VariantForm({
  productId,
  variant,
}: Props) {
  const [color, setColor] = useState(variant.color);
  const [size, setSize] = useState(variant.size);
  const [sku, setSku] = useState(variant.sku ?? "");
  const [price, setPrice] = useState(String(variant.price));

  const [compareAtPrice, setCompareAtPrice] = useState(
    variant.compareAtPrice === null
      ? ""
      : String(variant.compareAtPrice)
  );

  const [stock, setStock] = useState(String(variant.stock));

  const [status, setStatus] = useState<
    "active" | "inactive"
  >(variant.status);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  function selectInputValue(
    event: React.FocusEvent<HTMLInputElement>
  ) {
    event.currentTarget.select();
  }

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setError("");

    const parsedPrice = Number(price);

    const parsedCompareAtPrice =
      compareAtPrice.trim() === ""
        ? null
        : Number(compareAtPrice);

    const parsedStock = Number(stock);

    if (!color.trim()) {
      setError("Color is required.");
      return;
    }

    if (!size.trim()) {
      setError("Size is required.");
      return;
    }

    if (!Number.isFinite(parsedPrice) || parsedPrice < 0) {
      setError(
        "Price must be a valid non-negative number."
      );
      return;
    }

    if (
      parsedCompareAtPrice !== null &&
      (!Number.isFinite(parsedCompareAtPrice) ||
        parsedCompareAtPrice < 0)
    ) {
      setError(
        "Compare at price must be a valid non-negative number."
      );
      return;
    }

    if (!Number.isInteger(parsedStock) || parsedStock < 0) {
      setError(
        "Stock must be a non-negative integer."
      );
      return;
    }

    setIsSubmitting(true);

    try {
      await updateAdminVariantAction(variant.id, {
        color: color.trim(),
        size: size.trim(),
        sku: sku.trim() || null,
        price: parsedPrice,
        compareAtPrice: parsedCompareAtPrice,
        stock: parsedStock,
        status,
      });

      window.location.assign(
        `/admin/products/${productId}/variants/${variant.id}`
      );
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Failed to update variant."
      );

      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Variant Information */}
      <section className="rounded-2xl border border-stone-200 bg-white">
        <div className="border-b border-stone-100 px-5 py-5 sm:px-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-[10px] uppercase tracking-[0.2em] text-neutral-400">
                Variant Details
              </p>

              <h2 className="mt-2 text-base font-medium text-neutral-900">
                Variant Information
              </h2>

              <p className="mt-1 text-sm leading-6 text-neutral-500">
                Update the color, size, and SKU for this variant.
              </p>
            </div>

            <span className="w-fit rounded-full bg-neutral-100 px-3 py-1.5 text-[10px] font-medium text-neutral-700">
              Variant #{variant.id}
            </span>
          </div>
        </div>

        <div className="p-5 sm:p-6">
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label
                htmlFor="color"
                className="mb-2 block text-xs font-medium text-neutral-700"
              >
                Color
              </label>

              <input
                id="color"
                type="text"
                value={color}
                onChange={(event) =>
                  setColor(event.target.value)
                }
                className="h-11 w-full rounded-xl border border-stone-200 bg-white px-4 text-sm text-neutral-900 outline-none transition focus:border-neutral-500"
                required
              />
            </div>

            <div>
              <label
                htmlFor="size"
                className="mb-2 block text-xs font-medium text-neutral-700"
              >
                Size
              </label>

              <input
                id="size"
                type="text"
                value={size}
                onChange={(event) =>
                  setSize(event.target.value)
                }
                className="h-11 w-full rounded-xl border border-stone-200 bg-white px-4 text-sm text-neutral-900 outline-none transition focus:border-neutral-500"
                required
              />
            </div>
          </div>

          <div className="mt-5">
            <label
              htmlFor="sku"
              className="mb-2 block text-xs font-medium text-neutral-700"
            >
              SKU
            </label>

            <input
              id="sku"
              type="text"
              value={sku}
              onChange={(event) =>
                setSku(event.target.value)
              }
              className="h-11 w-full rounded-xl border border-stone-200 bg-white px-4 text-sm text-neutral-900 outline-none transition focus:border-neutral-500"
            />

            <p className="mt-2 text-xs text-neutral-400">
              Optional internal product identifier.
            </p>
          </div>
        </div>
      </section>

      {/* Pricing & Stock */}
      <section className="rounded-2xl border border-stone-200 bg-white">
        <div className="border-b border-stone-100 px-5 py-5 sm:px-6">
          <p className="text-[10px] uppercase tracking-[0.2em] text-neutral-400">
            Commercial
          </p>

          <h2 className="mt-2 text-base font-medium text-neutral-900">
            Pricing & Stock
          </h2>

          <p className="mt-1 text-sm leading-6 text-neutral-500">
            Manage price, comparison price, inventory, and availability.
          </p>
        </div>

        <div className="p-5 sm:p-6">
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label
                htmlFor="price"
                className="mb-2 block text-xs font-medium text-neutral-700"
              >
                Price
              </label>

              <div className="relative">
  <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm text-neutral-400">
    Rp
  </span>

  <input
    id="price"
    type="number"
    min="0"
    step="1"
    value={price}
    onFocus={selectInputValue}
    onChange={(event) =>
      setPrice(event.target.value)
    }
    className="h-11 w-full rounded-xl border border-stone-200 bg-white px-4 pl-12 text-sm text-neutral-900 outline-none transition focus:border-neutral-500"
    required
  />
</div>
            </div>

            <div>
              <label
                htmlFor="compareAtPrice"
                className="mb-2 block text-xs font-medium text-neutral-700"
              >
                Compare at Price
              </label>

              <div className="relative">
  <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm text-neutral-400">
    Rp
  </span>

  <input
    id="compareAtPrice"
    type="number"
    min="0"
    step="1"
    value={compareAtPrice}
    onFocus={selectInputValue}
    onChange={(event) =>
      setCompareAtPrice(event.target.value)
    }
    className="h-11 w-full rounded-xl border border-stone-200 bg-white px-4 pl-12 text-sm text-neutral-900 outline-none transition focus:border-neutral-500"
  />
</div>

              <p className="mt-2 text-xs text-neutral-400">
                Optional reference price.
              </p>
            </div>

            <div>
              <label
                htmlFor="stock"
                className="mb-2 block text-xs font-medium text-neutral-700"
              >
                Stock
              </label>

              <input
                id="stock"
                type="number"
                min="0"
                step="1"
                value={stock}
                onFocus={selectInputValue}
                onChange={(event) =>
                  setStock(event.target.value)
                }
                className="h-11 w-full rounded-xl border border-stone-200 bg-white px-4 text-sm text-neutral-900 outline-none transition focus:border-neutral-500"
              />
            </div>

            <div>
              <label
                htmlFor="status"
                className="mb-2 block text-xs font-medium text-neutral-700"
              >
                Status
              </label>

              <select
                id="status"
                value={status}
                onChange={(event) =>
                  setStatus(
                    event.target.value as
                      | "active"
                      | "inactive"
                  )
                }
                className="h-11 w-full rounded-xl border border-stone-200 bg-white px-4 text-sm text-neutral-900 outline-none transition focus:border-neutral-500"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>
        </div>
      </section>

      {/* Error */}
      {error && (
        <div
          role="alert"
          className="rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm leading-6 text-neutral-700"
        >
          {error}
        </div>
      )}

      {/* Actions */}
      <div className="sticky bottom-3 z-10 rounded-2xl border border-stone-200 bg-white/95 p-3 shadow-sm backdrop-blur sm:static sm:flex sm:justify-end sm:border-0 sm:bg-transparent sm:p-0 sm:shadow-none sm:backdrop-blur-0">
        <div className="flex flex-col-reverse gap-2 sm:flex-row">
          <Link
            href={`/admin/products/${productId}/variants`}
            className="inline-flex h-11 items-center justify-center rounded-full border border-stone-200 bg-white px-6 text-xs font-medium text-neutral-700 transition hover:border-neutral-400 hover:text-neutral-900"
          >
            Cancel
          </Link>

          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex h-11 items-center justify-center rounded-full bg-neutral-900 px-6 text-xs font-medium text-white transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSubmitting ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </form>
  );
}