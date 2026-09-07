"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import type { AdminProduct } from "@/lib/admin-products";
import { deleteAdminProductAction } from "./actions";

type Props = {
  products: AdminProduct[];
};

type StatusFilter =
  | "all"
  | "published"
  | "draft"
  | "archived";

function formatDate(value: string) {
  return new Intl.DateTimeFormat(
    "en-US",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }
  ).format(new Date(value));
}

function statusLabel(
  status: AdminProduct["status"]
) {
  switch (status) {
    case "published":
      return "Published";

    case "draft":
      return "Draft";

    case "archived":
      return "Archived";

    default:
      return status;
  }
}

function statusClass(
  status: AdminProduct["status"]
) {
  switch (status) {
    case "published":
      return "bg-neutral-100 text-neutral-900";

    case "draft":
      return "bg-neutral-50 text-neutral-500";

    case "archived":
      return "bg-neutral-100 text-neutral-400";

    default:
      return "bg-neutral-100 text-neutral-600";
  }
}

export default function ProductTable({
  products,
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

  const filteredProducts = useMemo(() => {
    const query =
      search.trim().toLowerCase();

    return products.filter((product) => {
      const matchesSearch =
        query === "" ||
        product.name
          .toLowerCase()
          .includes(query) ||
        product.slug
          .toLowerCase()
          .includes(query) ||
        product.category
          .toLowerCase()
          .includes(query);

      const matchesStatus =
        status === "all" ||
        product.status === status;

      return (
        matchesSearch &&
        matchesStatus
      );
    });
  }, [
    products,
    search,
    status,
  ]);

  const publishedCount =
    products.filter(
      (product) =>
        product.status ===
        "published"
    ).length;

  const draftCount =
    products.filter(
      (product) =>
        product.status === "draft"
    ).length;

  const archivedCount =
    products.filter(
      (product) =>
        product.status ===
        "archived"
    ).length;

  async function handleDelete(
    product: AdminProduct
  ) {
    const confirmed =
      window.confirm(
        `Delete "${product.name}" permanently?\n\nThis action cannot be undone.`
      );

    if (!confirmed) {
      return;
    }

    setError("");
    setDeletingId(product.id);

    try {
      await deleteAdminProductAction(
        product.id
      );

      router.refresh();
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Failed to delete product."
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
            Total Products
          </p>

          <p className="mt-3 text-2xl font-medium">
            {products.length}
          </p>
        </div>

        <div className="rounded-2xl border border-neutral-200 bg-white p-5">
          <p className="text-xs uppercase tracking-[0.16em] text-neutral-500">
            Published
          </p>

          <p className="mt-3 text-2xl font-medium">
            {publishedCount}
          </p>
        </div>

        <div className="rounded-2xl border border-neutral-200 bg-white p-5">
          <p className="text-xs uppercase tracking-[0.16em] text-neutral-500">
            Draft
          </p>

          <p className="mt-3 text-2xl font-medium">
            {draftCount}
          </p>
        </div>

        <div className="rounded-2xl border border-neutral-200 bg-white p-5">
          <p className="text-xs uppercase tracking-[0.16em] text-neutral-500">
            Archived
          </p>

          <p className="mt-3 text-2xl font-medium">
            {archivedCount}
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
            placeholder="Search products..."
            className="h-11 w-full rounded-xl border border-neutral-200 bg-white px-4 text-sm outline-none transition placeholder:text-neutral-400 focus:border-neutral-400"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          {(
            [
              ["all", "All"],
              [
                "published",
                "Published",
              ],
              ["draft", "Draft"],
              [
                "archived",
                "Archived",
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
                  Product
                </th>

                <th className="px-5 py-4 text-xs font-medium uppercase tracking-[0.12em] text-neutral-500">
                  Category
                </th>

                <th className="px-5 py-4 text-xs font-medium uppercase tracking-[0.12em] text-neutral-500">
                  Status
                </th>

                <th className="px-5 py-4 text-center text-xs font-medium uppercase tracking-[0.12em] text-neutral-500">
                  Variants
                </th>

                <th className="px-5 py-4 text-center text-xs font-medium uppercase tracking-[0.12em] text-neutral-500">
                  Media
                </th>

                <th className="px-5 py-4 text-xs font-medium uppercase tracking-[0.12em] text-neutral-500">
                  Updated
                </th>

                <th className="px-5 py-4 text-right text-xs font-medium uppercase tracking-[0.12em] text-neutral-500">
                  Action
                </th>
              </tr>
            </thead>

            <tbody>
              {filteredProducts.map(
                (product) => {
                  const isDeleting =
                    deletingId ===
                    product.id;

                  return (
                    <tr
                      key={product.id}
                      className="border-b border-neutral-100 last:border-0"
                    >
                      <td className="px-5 py-5">
                        <div>
                          <p className="font-medium text-neutral-900">
                            {product.name}
                          </p>

                          <p className="mt-1 text-xs text-neutral-400">
                            /{product.slug}
                          </p>
                        </div>
                      </td>

                      <td className="px-5 py-5 text-sm text-neutral-600">
                        {product.category ||
                          "—"}
                      </td>

                      <td className="px-5 py-5">
                        <span
                          className={`inline-flex rounded-full px-3 py-1.5 text-xs font-medium ${statusClass(
                            product.status
                          )}`}
                        >
                          {statusLabel(
                            product.status
                          )}
                        </span>
                      </td>

                      <td className="px-5 py-5 text-center text-sm text-neutral-600">
                        {
                          product.variantCount
                        }
                      </td>

                      <td className="px-5 py-5 text-center text-sm text-neutral-600">
                        {
                          product.mediaCount
                        }
                      </td>

                      <td className="px-5 py-5 text-sm text-neutral-500">
                        {formatDate(
                          product.updatedAt
                        )}
                      </td>

                      <td className="px-5 py-5">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/admin/products/${product.id}`}
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
                                product
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

              {filteredProducts.length ===
                0 && (
                <tr>
                  <td
                    colSpan={7}
                    className="px-5 py-16 text-center"
                  >
                    <p className="text-sm font-medium text-neutral-700">
                      No products found
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
                filteredProducts.length
              }
            </span>{" "}
            of{" "}
            <span className="font-medium text-neutral-600">
              {products.length}
            </span>{" "}
            products
          </p>
        </div>
      </div>
    </div>
  );
}