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
      return "border-green-200 bg-green-50 text-green-700";

    case "draft":
      return "border-amber-200 bg-amber-50 text-amber-700";

    case "archived":
      return "border-stone-200 bg-stone-100 text-neutral-500";

    default:
      return "border-stone-200 bg-stone-50 text-neutral-600";
  }
}

function statusDotClass(
  status: AdminProduct["status"]
) {
  switch (status) {
    case "published":
      return "bg-green-500";

    case "draft":
      return "bg-amber-500";

    case "archived":
      return "bg-neutral-400";

    default:
      return "bg-neutral-400";
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

  const filteredProducts =
    useMemo(() => {
      const query =
        search
          .trim()
          .toLowerCase();

      return products.filter(
        (product) => {
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
        }
      );
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
    <div className="space-y-5">
      {/* =====================================================
          SUMMARY
      ===================================================== */}

      <section
        className="
          grid
          gap-4
          sm:grid-cols-2
          xl:grid-cols-4
        "
      >
        <div
          className="
            rounded-2xl
            border
            border-stone-200
            bg-white
            p-5
          "
        >
          <p
            className="
              text-[10px]
              uppercase
              tracking-[0.2em]
              text-neutral-400
            "
          >
            Total Products
          </p>

          <p
            className="
              mt-5
              text-3xl
              font-light
              tracking-tight
            "
          >
            {products.length}
          </p>

          <p
            className="
              mt-2
              text-xs
              text-neutral-500
            "
          >
            Products in catalog
          </p>
        </div>

        <div
          className="
            rounded-2xl
            border
            border-stone-200
            bg-white
            p-5
          "
        >
          <p
            className="
              text-[10px]
              uppercase
              tracking-[0.2em]
              text-neutral-400
            "
          >
            Published
          </p>

          <p
            className="
              mt-5
              text-3xl
              font-light
              tracking-tight
            "
          >
            {publishedCount}
          </p>

          <p
            className="
              mt-2
              text-xs
              text-neutral-500
            "
          >
            Live in storefront
          </p>
        </div>

        <div
          className="
            rounded-2xl
            border
            border-stone-200
            bg-white
            p-5
          "
        >
          <p
            className="
              text-[10px]
              uppercase
              tracking-[0.2em]
              text-neutral-400
            "
          >
            Draft
          </p>

          <p
            className="
              mt-5
              text-3xl
              font-light
              tracking-tight
            "
          >
            {draftCount}
          </p>

          <p
            className="
              mt-2
              text-xs
              text-neutral-500
            "
          >
            Not yet published
          </p>
        </div>

        <div
          className="
            rounded-2xl
            border
            border-stone-200
            bg-white
            p-5
          "
        >
          <p
            className="
              text-[10px]
              uppercase
              tracking-[0.2em]
              text-neutral-400
            "
          >
            Archived
          </p>

          <p
            className="
              mt-5
              text-3xl
              font-light
              tracking-tight
            "
          >
            {archivedCount}
          </p>

          <p
            className="
              mt-2
              text-xs
              text-neutral-500
            "
          >
            Archived products
          </p>
        </div>
      </section>

      {/* =====================================================
          ERROR
      ===================================================== */}

      {error && (
        <div
          className="
            rounded-2xl
            border
            border-red-200
            bg-red-50
            px-4
            py-3
            text-sm
            text-red-700
          "
        >
          {error}
        </div>
      )}

      {/* =====================================================
          TOOLBAR
      ===================================================== */}

      <section
        className="
          rounded-2xl
          border
          border-stone-200
          bg-white
          p-4
          sm:p-5
        "
      >
        <div
          className="
            flex
            flex-col
            gap-4
            lg:flex-row
            lg:items-center
            lg:justify-between
          "
        >
          {/* SEARCH */}

          <div className="w-full lg:max-w-md">
            <label
              htmlFor="product-search"
              className="sr-only"
            >
              Search products
            </label>

            <input
              id="product-search"
              type="search"
              value={search}
              onChange={(event) =>
                setSearch(
                  event.target.value
                )
              }
              placeholder="Search products..."
              className="
                h-11
                w-full
                rounded-xl
                border
                border-stone-200
                bg-stone-50
                px-4
                text-sm
                text-neutral-900
                outline-none
                transition
                placeholder:text-neutral-400
                focus:border-neutral-900
                focus:bg-white
              "
            />
          </div>

          {/* STATUS FILTER */}

          <div
            className="
              flex
              w-full
              gap-2
              overflow-x-auto
              pb-1
              lg:w-auto
              lg:pb-0
            "
          >
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
                  className={[
                    "shrink-0 rounded-xl border px-4 py-2.5 text-[10px] font-medium uppercase tracking-[0.12em] transition",
                    status === value
                      ? "border-neutral-900 bg-neutral-900 text-white"
                      : "border-stone-200 bg-white text-neutral-600 hover:border-neutral-400 hover:text-neutral-900",
                  ].join(" ")}
                >
                  {label}
                </button>
              )
            )}
          </div>
        </div>

        {/* RESULT META */}

        <div
          className="
            mt-4
            flex
            flex-col
            gap-2
            border-t
            border-stone-100
            pt-4
            text-[10px]
            uppercase
            tracking-[0.18em]
            text-neutral-400
            sm:flex-row
            sm:items-center
            sm:justify-between
          "
        >
          <span>
            Showing{" "}
            <span className="text-neutral-700">
              {filteredProducts.length}
            </span>{" "}
            of{" "}
            <span className="text-neutral-700">
              {products.length}
            </span>{" "}
            products
          </span>

          {(search ||
            status !== "all") && (
            <button
              type="button"
              onClick={() => {
                setSearch("");
                setStatus("all");
              }}
              className="
                w-fit
                text-neutral-500
                underline
                underline-offset-4
                transition
                hover:text-neutral-900
              "
            >
              Reset filters
            </button>
          )}
        </div>
      </section>

      {/* =====================================================
          EMPTY STATE
      ===================================================== */}

      {filteredProducts.length ===
        0 ? (
        <div
          className="
            rounded-2xl
            border
            border-stone-200
            bg-white
            px-6
            py-12
            text-center
          "
        >
          <p
            className="
              text-sm
              font-medium
              text-neutral-700
            "
          >
            No products found
          </p>

          <p
            className="
              mt-1
              text-sm
              text-neutral-400
            "
          >
            Try another search or
            filter.
          </p>

          {(search ||
            status !== "all") && (
            <button
              type="button"
              onClick={() => {
                setSearch("");
                setStatus("all");
              }}
              className="
                mt-4
                text-[10px]
                uppercase
                tracking-[0.18em]
                text-neutral-500
                underline
                underline-offset-4
                transition
                hover:text-neutral-900
              "
            >
              Reset filters
            </button>
          )}
        </div>
      ) : (
        <>
          {/* =================================================
              MOBILE PRODUCT LIST
          ================================================= */}

          <div className="space-y-3 lg:hidden">
            {filteredProducts.map(
              (product) => {
                const isDeleting =
                  deletingId ===
                  product.id;

                return (
                  <article
                    key={product.id}
                    className="
                      rounded-2xl
                      border
                      border-stone-200
                      bg-white
                    "
                  >
                    <div className="p-4 sm:p-5">
                      <div
                        className="
                          flex
                          items-start
                          justify-between
                          gap-4
                        "
                      >
                        <div className="min-w-0">
                          <Link
                            href={`/admin/products/${product.id}`}
                            className="
                              block
                              truncate
                              text-sm
                              font-medium
                              text-neutral-900
                              hover:underline
                              hover:underline-offset-4
                            "
                          >
                            {product.name}
                          </Link>

                          <p
                            className="
                              mt-1
                              truncate
                              text-xs
                              text-neutral-400
                            "
                          >
                            /{product.slug}
                          </p>
                        </div>

                        <span
                          className={[
                            "inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-[9px] uppercase tracking-[0.12em]",
                            statusClass(
                              product.status
                            ),
                          ].join(" ")}
                        >
                          <span
                            className={[
                              "h-1.5 w-1.5 rounded-full",
                              statusDotClass(
                                product.status
                              ),
                            ].join(" ")}
                          />

                          {statusLabel(
                            product.status
                          )}
                        </span>
                      </div>

                      <div
                        className="
                          mt-5
                          grid
                          grid-cols-3
                          divide-x
                          divide-stone-100
                          rounded-xl
                          border
                          border-stone-100
                          bg-stone-50
                        "
                      >
                        <div className="px-3 py-3">
                          <p
                            className="
                              text-[9px]
                              uppercase
                              tracking-[0.12em]
                              text-neutral-400
                            "
                          >
                            Category
                          </p>

                          <p
                            className="
                              mt-1
                              truncate
                              text-xs
                              text-neutral-700
                            "
                          >
                            {product.category ||
                              "—"}
                          </p>
                        </div>

                        <div className="px-3 py-3">
                          <p
                            className="
                              text-[9px]
                              uppercase
                              tracking-[0.12em]
                              text-neutral-400
                            "
                          >
                            Variants
                          </p>

                          <p
                            className="
                              mt-1
                              text-xs
                              text-neutral-700
                            "
                          >
                            {
                              product.variantCount
                            }
                          </p>
                        </div>

                        <div className="px-3 py-3">
                          <p
                            className="
                              text-[9px]
                              uppercase
                              tracking-[0.12em]
                              text-neutral-400
                            "
                          >
                            Media
                          </p>

                          <p
                            className="
                              mt-1
                              text-xs
                              text-neutral-700
                            "
                          >
                            {
                              product.mediaCount
                            }
                          </p>
                        </div>
                      </div>

                      <div
                        className="
                          mt-4
                          flex
                          items-center
                          justify-between
                          gap-3
                        "
                      >
                        <p
                          className="
                            text-[10px]
                            uppercase
                            tracking-[0.12em]
                            text-neutral-400
                          "
                        >
                          Updated{" "}
                          {formatDate(
                            product.updatedAt
                          )}
                        </p>

                        <Link
                          href={`/admin/products/${product.id}`}
                          className="
                            text-[10px]
                            font-medium
                            uppercase
                            tracking-[0.15em]
                            text-neutral-700
                            underline
                            underline-offset-4
                            transition
                            hover:text-neutral-900
                          "
                        >
                          Manage
                        </Link>
                      </div>

                      <div
                        className="
                          mt-4
                          flex
                          gap-2
                          border-t
                          border-stone-100
                          pt-4
                        "
                      >
                        <Link
                          href={`/admin/products/${product.id}`}
                          className="
                            flex-1
                            rounded-xl
                            border
                            border-stone-300
                            px-4
                            py-2.5
                            text-center
                            text-[10px]
                            font-medium
                            uppercase
                            tracking-[0.12em]
                            transition
                            hover:border-neutral-900
                            hover:bg-neutral-900
                            hover:text-white
                          "
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
                          className="
                            flex-1
                            rounded-xl
                            border
                            border-stone-200
                            px-4
                            py-2.5
                            text-[10px]
                            font-medium
                            uppercase
                            tracking-[0.12em]
                            text-neutral-500
                            transition
                            hover:border-neutral-400
                            hover:text-neutral-900
                            disabled:cursor-not-allowed
                            disabled:opacity-50
                          "
                        >
                          {isDeleting
                            ? "Deleting..."
                            : "Delete"}
                        </button>
                      </div>
                    </div>
                  </article>
                );
              }
            )}
          </div>

          {/* =================================================
              DESKTOP TABLE
          ================================================= */}

          <div
            className="
              hidden
              overflow-hidden
              rounded-2xl
              border
              border-stone-200
              bg-white
              lg:block
            "
          >
            <div className="overflow-x-auto">
              <table
                className="
                  w-full
                  min-w-[1000px]
                  border-collapse
                  text-left
                "
              >
                <thead>
                  <tr
                    className="
                      border-b
                      border-stone-200
                      bg-stone-50
                    "
                  >
                    <th
                      className="
                        px-5
                        py-4
                        text-[9px]
                        font-medium
                        uppercase
                        tracking-[0.18em]
                        text-neutral-400
                      "
                    >
                      Product
                    </th>

                    <th
                      className="
                        px-5
                        py-4
                        text-[9px]
                        font-medium
                        uppercase
                        tracking-[0.18em]
                        text-neutral-400
                      "
                    >
                      Category
                    </th>

                    <th
                      className="
                        px-5
                        py-4
                        text-[9px]
                        font-medium
                        uppercase
                        tracking-[0.18em]
                        text-neutral-400
                      "
                    >
                      Status
                    </th>

                    <th
                      className="
                        px-5
                        py-4
                        text-center
                        text-[9px]
                        font-medium
                        uppercase
                        tracking-[0.18em]
                        text-neutral-400
                      "
                    >
                      Variants
                    </th>

                    <th
                      className="
                        px-5
                        py-4
                        text-center
                        text-[9px]
                        font-medium
                        uppercase
                        tracking-[0.18em]
                        text-neutral-400
                      "
                    >
                      Media
                    </th>

                    <th
                      className="
                        px-5
                        py-4
                        text-[9px]
                        font-medium
                        uppercase
                        tracking-[0.18em]
                        text-neutral-400
                      "
                    >
                      Updated
                    </th>

                    <th
                      className="
                        px-5
                        py-4
                        text-right
                        text-[9px]
                        font-medium
                        uppercase
                        tracking-[0.18em]
                        text-neutral-400
                      "
                    >
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
                          className="
                            border-b
                            border-stone-100
                            transition
                            last:border-0
                            hover:bg-stone-50
                          "
                        >
                          <td className="px-5 py-4">
                            <div>
                              <Link
                                href={`/admin/products/${product.id}`}
                                className="
                                  font-medium
                                  text-neutral-900
                                  hover:underline
                                  hover:underline-offset-4
                                "
                              >
                                {
                                  product.name
                                }
                              </Link>

                              <p
                                className="
                                  mt-1
                                  text-[11px]
                                  text-neutral-400
                                "
                              >
                                /
                                {
                                  product.slug
                                }
                              </p>
                            </div>
                          </td>

                          <td
                            className="
                              px-5
                              py-4
                              text-sm
                              text-neutral-600
                            "
                          >
                            {product.category ||
                              "—"}
                          </td>

                          <td className="px-5 py-4">
                            <span
                              className={[
                                "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[9px] uppercase tracking-[0.12em]",
                                statusClass(
                                  product.status
                                ),
                              ].join(" ")}
                            >
                              <span
                                className={[
                                  "h-1.5 w-1.5 rounded-full",
                                  statusDotClass(
                                    product.status
                                  ),
                                ].join(" ")}
                              />

                              {statusLabel(
                                product.status
                              )}
                            </span>
                          </td>

                          <td
                            className="
                              px-5
                              py-4
                              text-center
                              text-sm
                              text-neutral-600
                            "
                          >
                            {
                              product.variantCount
                            }
                          </td>

                          <td
                            className="
                              px-5
                              py-4
                              text-center
                              text-sm
                              text-neutral-600
                            "
                          >
                            {
                              product.mediaCount
                            }
                          </td>

                          <td
                            className="
                              px-5
                              py-4
                              text-sm
                              text-neutral-500
                            "
                          >
                            {formatDate(
                              product.updatedAt
                            )}
                          </td>

                          <td className="px-5 py-4">
                            <div
                              className="
                                flex
                                items-center
                                justify-end
                                gap-2
                              "
                            >
                              <Link
                                href={`/admin/products/${product.id}`}
                                className="
                                  inline-flex
                                  rounded-xl
                                  border
                                  border-stone-200
                                  px-4
                                  py-2
                                  text-[10px]
                                  font-medium
                                  uppercase
                                  tracking-[0.12em]
                                  text-neutral-600
                                  transition
                                  hover:border-neutral-900
                                  hover:bg-neutral-900
                                  hover:text-white
                                "
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
                                className="
                                  inline-flex
                                  rounded-xl
                                  border
                                  border-stone-200
                                  px-4
                                  py-2
                                  text-[10px]
                                  font-medium
                                  uppercase
                                  tracking-[0.12em]
                                  text-neutral-500
                                  transition
                                  hover:border-neutral-400
                                  hover:text-neutral-900
                                  disabled:cursor-not-allowed
                                  disabled:opacity-50
                                "
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
                </tbody>
              </table>
            </div>

            <div
              className="
                border-t
                border-stone-100
                px-5
                py-4
              "
            >
              <p
                className="
                  text-[10px]
                  uppercase
                  tracking-[0.15em]
                  text-neutral-400
                "
              >
                Showing{" "}
                <span className="text-neutral-600">
                  {
                    filteredProducts.length
                  }
                </span>{" "}
                of{" "}
                <span className="text-neutral-600">
                  {products.length}
                </span>{" "}
                products
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}