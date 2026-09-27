"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import type { AdminProduct } from "@/lib/admin-products";
import type { AdminProductVariant } from "@/lib/admin-variants";

import { deleteAdminVariantAction } from "../actions";

type Props = {
  product: AdminProduct;
  variants: AdminProductVariant[];
};

type StatusFilter = "all" | "active" | "inactive";

function formatPrice(value: number) {
  const amount = Math.round(value);

  const formatted = String(amount).replace(
    /\B(?=(\d{3})+(?!\d))/g,
    "."
  );

  return `Rp${formatted}`;
}

function statusLabel(status: AdminProductVariant["status"]) {
  return status === "active" ? "Active" : "Inactive";
}

function statusClass(status: AdminProductVariant["status"]) {
  if (status === "active") {
    return "bg-neutral-100 text-neutral-900";
  }

  return "bg-neutral-50 text-neutral-400";
}

function stockClass(stock: number) {
  if (stock === 0) {
    return "text-neutral-900";
  }

  if (stock <= 5) {
    return "text-neutral-600";
  }

  return "text-neutral-500";
}

export default function VariantTable({
  product,
  variants,
}: Props) {
  const router = useRouter();

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<StatusFilter>("all");
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [error, setError] = useState("");

  const filteredVariants = useMemo(() => {
    const query = search.trim().toLowerCase();

    return variants.filter((variant) => {
      const matchesSearch =
        query === "" ||
        variant.color.toLowerCase().includes(query) ||
        variant.size.toLowerCase().includes(query) ||
        (variant.sku ?? "").toLowerCase().includes(query);

      const matchesStatus =
        status === "all" || variant.status === status;

      return matchesSearch && matchesStatus;
    });
  }, [variants, search, status]);

  const totalStock = variants.reduce(
    (total, variant) => total + Math.max(0, variant.stock),
    0
  );

  const activeCount = variants.filter(
    (variant) => variant.status === "active"
  ).length;

  const inactiveCount = variants.filter(
    (variant) => variant.status === "inactive"
  ).length;

  async function handleDelete(variant: AdminProductVariant) {
    const confirmed = window.confirm(
      `Delete "${variant.color} / ${variant.size}" permanently?\n\nThis action cannot be undone.`
    );

    if (!confirmed) {
      return;
    }

    setError("");
    setDeletingId(variant.id);

    try {
      await deleteAdminVariantAction(variant.id, product.id);
      router.refresh();
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Failed to delete variant."
      );
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div>
      {/* Summary */}
      <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-stone-200 bg-white p-5">
          <p className="text-[10px] uppercase tracking-[0.2em] text-neutral-400">
            Variants
          </p>
          <p className="mt-3 text-2xl font-medium tracking-tight">
            {variants.length}
          </p>
        </div>

        <div className="rounded-2xl border border-stone-200 bg-white p-5">
          <p className="text-[10px] uppercase tracking-[0.2em] text-neutral-400">
            Active
          </p>
          <p className="mt-3 text-2xl font-medium tracking-tight">
            {activeCount}
          </p>
        </div>

        <div className="rounded-2xl border border-stone-200 bg-white p-5">
          <p className="text-[10px] uppercase tracking-[0.2em] text-neutral-400">
            Inactive
          </p>
          <p className="mt-3 text-2xl font-medium tracking-tight">
            {inactiveCount}
          </p>
        </div>

        <div className="rounded-2xl border border-stone-200 bg-white p-5">
          <p className="text-[10px] uppercase tracking-[0.2em] text-neutral-400">
            Total Stock
          </p>
          <p className="mt-3 text-2xl font-medium tracking-tight">
            {totalStock}
          </p>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-5 rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm leading-6 text-neutral-700">
          {error}
        </div>
      )}

      {/* Filters */}
      <div className="mb-5 rounded-2xl border border-stone-200 bg-white p-4 sm:p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="w-full lg:max-w-md">
            <label
              htmlFor="variant-search"
              className="sr-only"
            >
              Search variants
            </label>

            <input
              id="variant-search"
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search color, size, or SKU..."
              className="h-11 w-full rounded-xl border border-stone-200 bg-[#FAF9F7] px-4 text-sm outline-none transition placeholder:text-neutral-400 focus:border-neutral-400 focus:bg-white"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {(
              [
                ["all", "All"],
                ["active", "Active"],
                ["inactive", "Inactive"],
              ] as const
            ).map(([value, label]) => (
              <button
                key={value}
                type="button"
                onClick={() => setStatus(value)}
                className={[
                  "rounded-full border px-4 py-2 text-xs font-medium transition",
                  status === value
                    ? "border-neutral-900 bg-neutral-900 text-white"
                    : "border-stone-200 bg-white text-neutral-600 hover:border-neutral-400 hover:text-neutral-900",
                ].join(" ")}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Mobile / Tablet Cards */}
      <div className="space-y-3 lg:hidden">
        {filteredVariants.map((variant) => {
          const isDeleting = deletingId === variant.id;

          return (
            <article
              key={variant.id}
              className="rounded-2xl border border-stone-200 bg-white p-4 sm:p-5"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-sm font-medium text-neutral-900">
                      {variant.color}
                    </h2>

                    <span className="text-neutral-300">/</span>

                    <span className="text-sm text-neutral-600">
                      {variant.size}
                    </span>
                  </div>

                  <p className="mt-1 truncate text-xs text-neutral-400">
                    {variant.sku || "No SKU"}
                  </p>
                </div>

                <span
                  className={`shrink-0 rounded-full px-3 py-1.5 text-[10px] font-medium ${statusClass(
                    variant.status
                  )}`}
                >
                  {statusLabel(variant.status)}
                </span>
              </div>

              <div className="mt-5 grid grid-cols-2 gap-3 border-t border-stone-100 pt-4 sm:grid-cols-4">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.15em] text-neutral-400">
                    Price
                  </p>
                  <p className="mt-1 text-sm text-neutral-700">
                    {formatPrice(variant.price)}
                  </p>
                </div>

                <div>
                  <p className="text-[10px] uppercase tracking-[0.15em] text-neutral-400">
                    Compare
                  </p>
                  <p className="mt-1 text-sm text-neutral-500">
                    {variant.compareAtPrice !== null
                      ? formatPrice(variant.compareAtPrice)
                      : "—"}
                  </p>
                </div>

                <div>
                  <p className="text-[10px] uppercase tracking-[0.15em] text-neutral-400">
                    Stock
                  </p>
                  <p
                    className={`mt-1 text-sm font-medium ${stockClass(
                      variant.stock
                    )}`}
                  >
                    {variant.stock}
                  </p>
                </div>

                <div>
                  <p className="text-[10px] uppercase tracking-[0.15em] text-neutral-400">
                    ID
                  </p>
                  <p className="mt-1 text-sm text-neutral-500">
                    #{variant.id}
                  </p>
                </div>
              </div>

              <div className="mt-4 flex gap-2 border-t border-stone-100 pt-4">
                <Link
                  href={`/admin/products/${product.id}/variants/${variant.id}`}
                  className="inline-flex h-10 flex-1 items-center justify-center rounded-full border border-stone-200 px-4 text-xs font-medium text-neutral-700 transition hover:border-neutral-400 hover:text-neutral-900"
                >
                  Edit
                </Link>

                <button
                  type="button"
                  disabled={isDeleting}
                  onClick={() => handleDelete(variant)}
                  className="inline-flex h-10 flex-1 items-center justify-center rounded-full border border-stone-200 px-4 text-xs font-medium text-neutral-500 transition hover:border-neutral-400 hover:text-neutral-900 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isDeleting ? "Deleting..." : "Delete"}
                </button>
              </div>
            </article>
          );
        })}

        {filteredVariants.length === 0 && (
          <div className="rounded-2xl border border-stone-200 bg-white px-5 py-16 text-center">
            <p className="text-sm font-medium text-neutral-700">
              No variants found
            </p>

            <p className="mt-1 text-sm text-neutral-400">
              Try another search or filter.
            </p>
          </div>
        )}
      </div>

      {/* Desktop Table */}
      <div className="hidden overflow-hidden rounded-2xl border border-stone-200 bg-white lg:block">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1050px] border-collapse text-left">
            <thead>
              <tr className="border-b border-stone-200 bg-[#FAF9F7]">
                <th className="px-5 py-4 text-[10px] font-medium uppercase tracking-[0.15em] text-neutral-400">
                  Color
                </th>

                <th className="px-5 py-4 text-[10px] font-medium uppercase tracking-[0.15em] text-neutral-400">
                  Size
                </th>

                <th className="px-5 py-4 text-[10px] font-medium uppercase tracking-[0.15em] text-neutral-400">
                  SKU
                </th>

                <th className="px-5 py-4 text-right text-[10px] font-medium uppercase tracking-[0.15em] text-neutral-400">
                  Price
                </th>

                <th className="px-5 py-4 text-right text-[10px] font-medium uppercase tracking-[0.15em] text-neutral-400">
                  Compare
                </th>

                <th className="px-5 py-4 text-center text-[10px] font-medium uppercase tracking-[0.15em] text-neutral-400">
                  Stock
                </th>

                <th className="px-5 py-4 text-center text-[10px] font-medium uppercase tracking-[0.15em] text-neutral-400">
                  Status
                </th>

                <th className="px-5 py-4 text-right text-[10px] font-medium uppercase tracking-[0.15em] text-neutral-400">
                  Action
                </th>
              </tr>
            </thead>

            <tbody>
              {filteredVariants.map((variant) => {
                const isDeleting = deletingId === variant.id;

                return (
                  <tr
                    key={variant.id}
                    className="border-b border-stone-100 last:border-0"
                  >
                    <td className="px-5 py-5">
                      <p className="text-sm font-medium text-neutral-900">
                        {variant.color}
                      </p>
                    </td>

                    <td className="px-5 py-5 text-sm text-neutral-600">
                      {variant.size}
                    </td>

                    <td className="px-5 py-5 text-sm text-neutral-500">
                      {variant.sku || "—"}
                    </td>

                    <td className="px-5 py-5 text-right text-sm text-neutral-700">
                      {formatPrice(variant.price)}
                    </td>

                    <td className="px-5 py-5 text-right text-sm text-neutral-500">
                      {variant.compareAtPrice !== null
                        ? formatPrice(variant.compareAtPrice)
                        : "—"}
                    </td>

                    <td
                      className={`px-5 py-5 text-center text-sm font-medium ${stockClass(
                        variant.stock
                      )}`}
                    >
                      {variant.stock}
                    </td>

                    <td className="px-5 py-5 text-center">
                      <span
                        className={`inline-flex rounded-full px-3 py-1.5 text-[10px] font-medium ${statusClass(
                          variant.status
                        )}`}
                      >
                        {statusLabel(variant.status)}
                      </span>
                    </td>

                    <td className="px-5 py-5">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/admin/products/${product.id}/variants/${variant.id}`}
                          className="inline-flex rounded-full border border-stone-200 px-4 py-2 text-xs font-medium text-neutral-700 transition hover:border-neutral-400 hover:text-neutral-900"
                        >
                          Edit
                        </Link>

                        <button
                          type="button"
                          disabled={isDeleting}
                          onClick={() => handleDelete(variant)}
                          className="inline-flex rounded-full border border-stone-200 px-4 py-2 text-xs font-medium text-neutral-500 transition hover:border-neutral-400 hover:text-neutral-900 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {isDeleting ? "Deleting..." : "Delete"}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {filteredVariants.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-5 py-16 text-center">
                    <p className="text-sm font-medium text-neutral-700">
                      No variants found
                    </p>

                    <p className="mt-1 text-sm text-neutral-400">
                      Try another search or filter.
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="border-t border-stone-100 px-5 py-4">
          <p className="text-xs text-neutral-400">
            Showing{" "}
            <span className="font-medium text-neutral-600">
              {filteredVariants.length}
            </span>{" "}
            of{" "}
            <span className="font-medium text-neutral-600">
              {variants.length}
            </span>{" "}
            variants
          </p>
        </div>
      </div>

      {/* Mobile result count */}
      <div className="mt-4 lg:hidden">
        <p className="text-xs text-neutral-400">
          Showing{" "}
          <span className="font-medium text-neutral-600">
            {filteredVariants.length}
          </span>{" "}
          of{" "}
          <span className="font-medium text-neutral-600">
            {variants.length}
          </span>{" "}
          variants
        </p>
      </div>
    </div>
  );
}