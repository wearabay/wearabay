"use client";

import Link from "next/link";
import { useState } from "react";

import type { AdminProductVariant } from "@/lib/admin-variants";

import { updateAdminVariantAction } from "../actions";

type Props = {
  productId: number;
  variant: AdminProductVariant;
};

export default function VariantForm({
  productId,
  variant,
}: Props) {
  const [color, setColor] =
    useState(variant.color);

  const [size, setSize] =
    useState(variant.size);

  const [sku, setSku] =
    useState(variant.sku ?? "");

  const [price, setPrice] =
    useState(String(variant.price));

  const [compareAtPrice, setCompareAtPrice] =
    useState(
      variant.compareAtPrice === null
        ? ""
        : String(
            variant.compareAtPrice
          )
    );

  const [stock, setStock] =
    useState(String(variant.stock));

  const [status, setStatus] =
    useState<
      "active" | "inactive"
    >(variant.status);

  const [isSubmitting, setIsSubmitting] =
    useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState(false);

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setError("");
    setSuccess(false);

    const parsedPrice =
      Number(price);

    const parsedCompareAtPrice =
      compareAtPrice.trim() === ""
        ? null
        : Number(compareAtPrice);

    const parsedStock =
      Number(stock);

    if (!color.trim()) {
      setError("Color is required.");
      return;
    }

    if (!size.trim()) {
      setError("Size is required.");
      return;
    }

    if (
      !Number.isFinite(parsedPrice) ||
      parsedPrice < 0
    ) {
      setError(
        "Price must be a valid non-negative number."
      );
      return;
    }

    if (
      parsedCompareAtPrice !== null &&
      (!Number.isFinite(
        parsedCompareAtPrice
      ) ||
        parsedCompareAtPrice < 0)
    ) {
      setError(
        "Compare at price must be a valid non-negative number."
      );
      return;
    }

    if (
      !Number.isInteger(parsedStock) ||
      parsedStock < 0
    ) {
      setError(
        "Stock must be a non-negative integer."
      );
      return;
    }

    setIsSubmitting(true);

    try {
      await updateAdminVariantAction(
        variant.id,
        {
          color: color.trim(),
          size: size.trim(),
          sku: sku.trim() || null,
          price: parsedPrice,
          compareAtPrice:
            parsedCompareAtPrice,
          stock: parsedStock,
          status,
        }
      );

      setSuccess(true);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Failed to update variant."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6"
    >
      <section className="rounded-2xl border border-neutral-200 bg-white p-6">
        <div className="mb-6">
          <h2 className="text-base font-medium">
            Variant Information
          </h2>

          <p className="mt-1 text-sm text-neutral-500">
            Update this product variant.
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label
              htmlFor="color"
              className="mb-2 block text-sm font-medium"
            >
              Color
            </label>

            <input
              id="color"
              type="text"
              value={color}
              onChange={(event) =>
                setColor(
                  event.target.value
                )
              }
              className="h-11 w-full rounded-xl border border-neutral-200 px-4 text-sm outline-none focus:border-neutral-400"
              required
            />
          </div>

          <div>
            <label
              htmlFor="size"
              className="mb-2 block text-sm font-medium"
            >
              Size
            </label>

            <input
              id="size"
              type="text"
              value={size}
              onChange={(event) =>
                setSize(
                  event.target.value
                )
              }
              className="h-11 w-full rounded-xl border border-neutral-200 px-4 text-sm outline-none focus:border-neutral-400"
              required
            />
          </div>
        </div>

        <div className="mt-5">
          <label
            htmlFor="sku"
            className="mb-2 block text-sm font-medium"
          >
            SKU
          </label>

          <input
            id="sku"
            type="text"
            value={sku}
            onChange={(event) =>
              setSku(
                event.target.value
              )
            }
            className="h-11 w-full rounded-xl border border-neutral-200 px-4 text-sm outline-none focus:border-neutral-400"
          />
        </div>
      </section>

      <section className="rounded-2xl border border-neutral-200 bg-white p-6">
        <div className="mb-6">
          <h2 className="text-base font-medium">
            Pricing & Stock
          </h2>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label
              htmlFor="price"
              className="mb-2 block text-sm font-medium"
            >
              Price
            </label>

            <input
              id="price"
              type="number"
              min="0"
              step="1"
              value={price}
              onChange={(event) =>
                setPrice(
                  event.target.value
                )
              }
              className="h-11 w-full rounded-xl border border-neutral-200 px-4 text-sm outline-none focus:border-neutral-400"
              required
            />
          </div>

          <div>
            <label
              htmlFor="compareAtPrice"
              className="mb-2 block text-sm font-medium"
            >
              Compare at Price
            </label>

            <input
              id="compareAtPrice"
              type="number"
              min="0"
              step="1"
              value={compareAtPrice}
              onChange={(event) =>
                setCompareAtPrice(
                  event.target.value
                )
              }
              className="h-11 w-full rounded-xl border border-neutral-200 px-4 text-sm outline-none focus:border-neutral-400"
            />
          </div>

          <div>
            <label
              htmlFor="stock"
              className="mb-2 block text-sm font-medium"
            >
              Stock
            </label>

            <input
              id="stock"
              type="number"
              min="0"
              step="1"
              value={stock}
              onChange={(event) =>
                setStock(
                  event.target.value
                )
              }
              className="h-11 w-full rounded-xl border border-neutral-200 px-4 text-sm outline-none focus:border-neutral-400"
            />
          </div>

          <div>
            <label
              htmlFor="status"
              className="mb-2 block text-sm font-medium"
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
              className="h-11 w-full rounded-xl border border-neutral-200 bg-white px-4 text-sm outline-none focus:border-neutral-400"
            >
              <option value="active">
                Active
              </option>

              <option value="inactive">
                Inactive
              </option>
            </select>
          </div>
        </div>
      </section>

      {error && (
        <div className="rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm text-neutral-700">
          {error}
        </div>
      )}

      {success && (
        <div className="rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm text-neutral-700">
          Variant updated successfully.
        </div>
      )}

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Link
          href={`/admin/products/${productId}/variants`}
          className="inline-flex h-11 items-center justify-center rounded-full border border-neutral-200 px-6 text-sm font-medium text-neutral-700 transition hover:border-neutral-400 hover:text-black"
        >
          Back to Variants
        </Link>

        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex h-11 items-center justify-center rounded-full border border-black bg-black px-6 text-sm font-medium text-white transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isSubmitting
            ? "Saving..."
            : "Save Changes"}
        </button>
      </div>
    </form>
  );
}