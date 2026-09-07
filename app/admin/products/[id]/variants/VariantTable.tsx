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

type StatusFilter =
  | "all"
  | "active"
  | "inactive";

function formatPrice(value: number) {
  const amount =
    Math.round(value);

  const formatted =
    String(amount).replace(
      /\B(?=(\d{3})+(?!\d))/g,
      "."
    );

  return `Rp${formatted}`;
}

function statusLabel(
  status: AdminProductVariant["status"]
) {
  return status === "active"
    ? "Active"
    : "Inactive";
}

function statusClass(
  status: AdminProductVariant["status"]
) {
  if (status === "active") {
    return "bg-neutral-100 text-neutral-900";
  }

  return "bg-neutral-50 text-neutral-400";
}

function stockClass(
  stock: number
) {
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

  const [search, setSearch] =
    useState("");

  const [status, setStatus] =
    useState<StatusFilter>("all");

  const [deletingId, setDeletingId] =
    useState<number | null>(null);

  const [error, setError] =
    useState("");

  const filteredVariants =
    useMemo(() => {
      const query =
        search
          .trim()
          .toLowerCase();

      return variants.filter(
        (variant) => {
          const matchesSearch =
            query === "" ||
            variant.color
              .toLowerCase()
              .includes(query) ||
            variant.size
              .toLowerCase()
              .includes(query) ||
            (variant.sku ?? "")
              .toLowerCase()
              .includes(query);

          const matchesStatus =
            status === "all" ||
            variant.status ===
              status;

          return (
            matchesSearch &&
            matchesStatus
          );
        }
      );
    }, [
      variants,
      search,
      status,
    ]);

  const totalStock =
    variants.reduce(
      (total, variant) =>
        total +
        Math.max(
          0,
          variant.stock
        ),
      0
    );

  const activeCount =
    variants.filter(
      (variant) =>
        variant.status ===
        "active"
    ).length;

  const inactiveCount =
    variants.filter(
      (variant) =>
        variant.status ===
        "inactive"
    ).length;

  async function handleDelete(
    variant: AdminProductVariant
  ) {
    const confirmed =
      window.confirm(
        `Delete "${variant.color} / ${variant.size}" permanently?\n\nThis action cannot be undone.`
      );

    if (!confirmed) {
      return;
    }

    setError("");
    setDeletingId(variant.id);

    try {
      await deleteAdminVariantAction(
        variant.id,
        product.id
      );

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

      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-neutral-200 bg-white p-5">
          <p className="text-xs uppercase tracking-[0.16em] text-neutral-500">
            Variants
          </p>

          <p className="mt-3 text-2xl font-medium">
            {variants.length}
          </p>
        </div>

        <div className="rounded-2xl border border-neutral-200 bg-white p-5">
          <p className="text-xs uppercase tracking-[0.16em] text-neutral-500">
            Active
          </p>

          <p className="mt-3 text-2xl font-medium">
            {activeCount}
          </p>
        </div>

        <div className="rounded-2xl border border-neutral-200 bg-white p-5">
          <p className="text-xs uppercase tracking-[0.16em] text-neutral-500">
            Inactive
          </p>

          <p className="mt-3 text-2xl font-medium">
            {inactiveCount}
          </p>
        </div>

        <div className="rounded-2xl border border-neutral-200 bg-white p-5">
          <p className="text-xs uppercase tracking-[0.16em] text-neutral-500">
            Total Stock
          </p>

          <p className="mt-3 text-2xl font-medium">
            {totalStock}
          </p>
        </div>
      </div>

      {/* Error */}

      {error && (
        <div className="mb-5 rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm text-neutral-700">
          {error}
        </div>
      )}

      {/* Filters */}

      <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="w-full lg:max-w-md">
          <input
            type="search"
            value={search}
            onChange={(event) =>
              setSearch(
                event.target.value
              )
            }
            placeholder="Search color, size, or SKU..."
            className="h-11 w-full rounded-xl border border-neutral-200 bg-white px-4 text-sm outline-none transition placeholder:text-neutral-400 focus:border-neutral-400"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          {(
            [
              ["all", "All"],
              ["active", "Active"],
              [
                "inactive",
                "Inactive",
              ],
            ] as const
          ).map(
            ([value, label]) => (
              <button
                key={value}
                type="button"
                onClick={() =>
                  setStatus(value)
                }
                className={`rounded-full border px-4 py-2 text-xs font-medium transition ${
                  status === value
                    ? "border-black bg-black text-white"
                    : "border-neutral-200 bg-white text-neutral-600 hover:border-neutral-400"
                }`}
              >
                {label}
              </button>
            )
          )}
        </div>
      </div>

      {/* Table */}

      <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1100px] border-collapse text-left">
            <thead>
              <tr className="border-b border-neutral-200 bg-neutral-50">
                <th className="px-5 py-4 text-xs font-medium uppercase tracking-[0.12em] text-neutral-500">
                  Color
                </th>

                <th className="px-5 py-4 text-xs font-medium uppercase tracking-[0.12em] text-neutral-500">
                  Size
                </th>

                <th className="px-5 py-4 text-xs font-medium uppercase tracking-[0.12em] text-neutral-500">
                  SKU
                </th>

                <th className="px-5 py-4 text-right text-xs font-medium uppercase tracking-[0.12em] text-neutral-500">
                  Price
                </th>

                <th className="px-5 py-4 text-right text-xs font-medium uppercase tracking-[0.12em] text-neutral-500">
                  Compare
                </th>

                <th className="px-5 py-4 text-center text-xs font-medium uppercase tracking-[0.12em] text-neutral-500">
                  Stock
                </th>

                <th className="px-5 py-4 text-center text-xs font-medium uppercase tracking-[0.12em] text-neutral-500">
                  Status
                </th>

                <th className="px-5 py-4 text-right text-xs font-medium uppercase tracking-[0.12em] text-neutral-500">
                  Action
                </th>
              </tr>
            </thead>

            <tbody>
              {filteredVariants.map(
                (variant) => {
                  const isDeleting =
                    deletingId ===
                    variant.id;

                  return (
                    <tr
                      key={variant.id}
                      className="border-b border-neutral-100 last:border-0"
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
                        {variant.sku ||
                          "—"}
                      </td>

                      <td className="px-5 py-5 text-right text-sm text-neutral-700">
                        {formatPrice(
                          variant.price
                        )}
                      </td>

                      <td className="px-5 py-5 text-right text-sm text-neutral-500">
                        {variant.compareAtPrice !==
                        null
                          ? formatPrice(
                              variant.compareAtPrice
                            )
                          : "—"}
                      </td>

                      <td
                        className={`px-5 py-5 text-center text-sm font-medium ${stockClass(
                          variant.stock
                        )}`}
                      >
                        {
                          variant.stock
                        }
                      </td>

                      <td className="px-5 py-5 text-center">
                        <span
                          className={`inline-flex rounded-full px-3 py-1.5 text-xs font-medium ${statusClass(
                            variant.status
                          )}`}
                        >
                          {statusLabel(
                            variant.status
                          )}
                        </span>
                      </td>

                      <td className="px-5 py-5">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/admin/products/${product.id}/variants/${variant.id}`}
                            className="inline-flex rounded-full border border-neutral-200 px-4 py-2 text-xs font-medium text-neutral-700 transition hover:border-neutral-400 hover:text-black"
                          >
                            Edit
                          </Link>

                          <button
                            type="button"
                            disabled={
                              isDeleting
                            }
                            onClick={() =>
                              handleDelete(
                                variant
                              )
                            }
                            className="inline-flex rounded-full border border-neutral-200 px-4 py-2 text-xs font-medium text-neutral-500 transition hover:border-neutral-400 hover:text-black disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {isDeleting
                              ? "Deleting..."
                              : "Delete"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                }
              )}

              {filteredVariants.length ===
                0 && (
                <tr>
                  <td
                    colSpan={8}
                    className="px-5 py-16 text-center"
                  >
                    <p className="text-sm font-medium text-neutral-700">
                      No variants found
                    </p>

                    <p className="mt-1 text-sm text-neutral-400">
                      Try another search or
                      filter.
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="border-t border-neutral-100 px-5 py-4">
          <p className="text-xs text-neutral-400">
            Showing{" "}
            <span className="font-medium text-neutral-600">
              {
                filteredVariants.length
              }
            </span>{" "}
            of{" "}
            <span className="font-medium text-neutral-600">
              {variants.length}
            </span>{" "}
            variants
          </p>
        </div>
      </div>
    </div>
  );
}