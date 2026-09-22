"use client";

import { useMemo, useState } from "react";

import type { AdminInventoryVariant } from "@/lib/admin-inventory";

type Props = {
  inventory: AdminInventoryVariant[];
};

type StockFilter =
  | "all"
  | "in-stock"
  | "low-stock"
  | "out-of-stock";

type SortOption =
  | "product-asc"
  | "product-desc"
  | "stock-low"
  | "stock-high";

function getStockLabel(stock: number) {
  if (stock === 0) {
    return {
      label: "Out of Stock",
      className:
        "border-stone-200 bg-stone-100 text-stone-700",
      dotClassName:
        "bg-neutral-400",
    };
  }

  if (stock <= 2) {
    return {
      label: "Low Stock",
      className:
        "border-amber-200 bg-amber-50 text-amber-800",
      dotClassName:
        "bg-amber-500",
    };
  }

  return {
    label: "In Stock",
    className:
      "border-emerald-200 bg-emerald-50 text-emerald-800",
    dotClassName:
      "bg-emerald-500",
  };
}

function formatPrice(value: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);
}

export default function InventoryTable({
  inventory,
}: Props) {
  const [search, setSearch] =
    useState("");

  const [productFilter, setProductFilter] =
    useState("all");

  const [stockFilter, setStockFilter] =
    useState<StockFilter>("all");

  const [sort, setSort] =
    useState<SortOption>(
      "product-asc"
    );

  const [openProducts, setOpenProducts] =
    useState<Record<string, boolean>>({});

  const productNames = useMemo(() => {
    return Array.from(
      new Set(
        inventory.map(
          (variant) =>
            variant.productName
        )
      )
    ).sort((a, b) =>
      a.localeCompare(b)
    );
  }, [inventory]);

  const filteredInventory = useMemo(() => {
    const normalizedSearch =
      search.trim().toLowerCase();

    const filtered =
      inventory.filter(
        (variant) => {
          const matchesSearch =
            normalizedSearch === "" ||
            variant.productName
              .toLowerCase()
              .includes(
                normalizedSearch
              ) ||
            variant.color
              .toLowerCase()
              .includes(
                normalizedSearch
              ) ||
            variant.size
              .toLowerCase()
              .includes(
                normalizedSearch
              ) ||
            (variant.sku ?? "")
              .toLowerCase()
              .includes(
                normalizedSearch
              );

          const matchesProduct =
            productFilter ===
              "all" ||
            variant.productName ===
              productFilter;

          const matchesStock =
            stockFilter === "all" ||
            (stockFilter ===
              "in-stock" &&
              variant.stock > 2) ||
            (stockFilter ===
              "low-stock" &&
              variant.stock > 0 &&
              variant.stock <= 2) ||
            (stockFilter ===
              "out-of-stock" &&
              variant.stock === 0);

          return (
            matchesSearch &&
            matchesProduct &&
            matchesStock
          );
        }
      );

    return [...filtered].sort(
      (a, b) => {
        if (sort === "product-asc") {
          const productCompare =
            a.productName.localeCompare(
              b.productName
            );

          if (productCompare !== 0) {
            return productCompare;
          }

          return (
            a.color.localeCompare(
              b.color
            ) ||
            a.size.localeCompare(
              b.size
            )
          );
        }

        if (sort === "product-desc") {
          const productCompare =
            b.productName.localeCompare(
              a.productName
            );

          if (productCompare !== 0) {
            return productCompare;
          }

          return (
            b.color.localeCompare(
              a.color
            ) ||
            b.size.localeCompare(
              a.size
            )
          );
        }

        if (sort === "stock-low") {
          if (a.stock !== b.stock) {
            return a.stock - b.stock;
          }

          return a.productName.localeCompare(
            b.productName
          );
        }

        if (sort === "stock-high") {
          if (a.stock !== b.stock) {
            return b.stock - a.stock;
          }

          return a.productName.localeCompare(
            b.productName
          );
        }

        return 0;
      }
    );
  }, [
    inventory,
    search,
    productFilter,
    stockFilter,
    sort,
  ]);

  const groupedInventory =
    useMemo(() => {
      const groups = new Map<
        string,
        AdminInventoryVariant[]
      >();

      for (const variant of filteredInventory) {
        const existing =
          groups.get(
            variant.productName
          ) ?? [];

        existing.push(variant);

        groups.set(
          variant.productName,
          existing
        );
      }

      return Array.from(
        groups.entries()
      );
    }, [filteredInventory]);

  function toggleProduct(
    productName: string
  ) {
    setOpenProducts(
      (current) => ({
        ...current,
        [productName]:
          !(current[productName] ??
            false),
      })
    );
  }

  function openAll() {
    const nextState: Record<
      string,
      boolean
    > = {};

    for (const [
      productName,
    ] of groupedInventory) {
      nextState[productName] = true;
    }

    setOpenProducts(nextState);
  }

  function closeAll() {
    setOpenProducts({});
  }

  function resetFilters() {
    setSearch("");
    setProductFilter("all");
    setStockFilter("all");
    setSort("product-asc");
  }

  return (
    <section
      className="
        overflow-hidden
        rounded-2xl
        border
        border-stone-200
        bg-white
      "
    >
      {/* =====================================================
          SECTION HEADER
      ===================================================== */}

      <div
        className="
          border-b
          border-stone-200
          px-5
          py-5
          sm:px-6
        "
      >
        <p
          className="
            text-[10px]
            uppercase
            tracking-[0.25em]
            text-neutral-400
          "
        >
          Product Variants
        </p>

        <h2
          className="
            mt-1
            text-lg
            font-light
          "
        >
          Stock Overview
        </h2>
      </div>

      {/* =====================================================
          FILTERS
      ===================================================== */}

      <div
        className="
          border-b
          border-stone-200
          p-4
          sm:p-5
        "
      >
        <div
          className="
            grid
            gap-3
            xl:grid-cols-[minmax(240px,1fr)_200px_170px_190px]
          "
        >
          {/* SEARCH */}

          <div>
            <label
              htmlFor="inventory-search"
              className="sr-only"
            >
              Search inventory
            </label>

            <input
              id="inventory-search"
              type="search"
              value={search}
              onChange={(event) =>
                setSearch(
                  event.target.value
                )
              }
              placeholder="Search product, color, size, SKU..."
              className="
                h-11
                w-full
                rounded-xl
                border
                border-stone-200
                bg-stone-50
                px-4
                text-sm
                outline-none
                transition
                placeholder:text-neutral-400
                focus:border-neutral-900
                focus:bg-white
              "
            />
          </div>

          {/* PRODUCT */}

          <div>
            <label
              htmlFor="inventory-product"
              className="sr-only"
            >
              Filter by product
            </label>

            <select
              id="inventory-product"
              value={productFilter}
              onChange={(event) =>
                setProductFilter(
                  event.target.value
                )
              }
              className="
                h-11
                w-full
                rounded-xl
                border
                border-stone-200
                bg-stone-50
                px-4
                text-sm
                outline-none
                transition
                focus:border-neutral-900
                focus:bg-white
              "
            >
              <option value="all">
                All Products
              </option>

              {productNames.map(
                (productName) => (
                  <option
                    key={productName}
                    value={productName}
                  >
                    {productName}
                  </option>
                )
              )}
            </select>
          </div>

          {/* STOCK */}

          <div>
            <label
              htmlFor="inventory-stock"
              className="sr-only"
            >
              Filter by stock
            </label>

            <select
              id="inventory-stock"
              value={stockFilter}
              onChange={(event) =>
                setStockFilter(
                  event.target.value as StockFilter
                )
              }
              className="
                h-11
                w-full
                rounded-xl
                border
                border-stone-200
                bg-stone-50
                px-4
                text-sm
                outline-none
                transition
                focus:border-neutral-900
                focus:bg-white
              "
            >
              <option value="all">
                All Stock
              </option>

              <option value="in-stock">
                In Stock
              </option>

              <option value="low-stock">
                Low Stock
              </option>

              <option value="out-of-stock">
                Out of Stock
              </option>
            </select>
          </div>

          {/* SORT */}

          <div>
            <label
              htmlFor="inventory-sort"
              className="sr-only"
            >
              Sort inventory
            </label>

            <select
              id="inventory-sort"
              value={sort}
              onChange={(event) =>
                setSort(
                  event.target.value as SortOption
                )
              }
              className="
                h-11
                w-full
                rounded-xl
                border
                border-stone-200
                bg-stone-50
                px-4
                text-sm
                outline-none
                transition
                focus:border-neutral-900
                focus:bg-white
              "
            >
              <option value="product-asc">
                Product A–Z
              </option>

              <option value="product-desc">
                Product Z–A
              </option>

              <option value="stock-low">
                Stock Low → High
              </option>

              <option value="stock-high">
                Stock High → Low
              </option>
            </select>
          </div>
        </div>

        {/* RESULT / CONTROLS */}

        <div
          className="
            mt-4
            flex
            flex-col
            gap-3
            border-t
            border-stone-100
            pt-4
            text-[10px]
            uppercase
            tracking-[0.15em]
            text-neutral-400
            sm:flex-row
            sm:items-center
            sm:justify-between
          "
        >
          <p>
            Showing{" "}
            <span className="text-neutral-700">
              {groupedInventory.length}
            </span>{" "}
            product
            {groupedInventory.length ===
            1
              ? ""
              : "s"}{" "}
            /{" "}
            <span className="text-neutral-700">
              {filteredInventory.length}
            </span>{" "}
            variant
            {filteredInventory.length ===
            1
              ? ""
              : "s"}
          </p>

          <div className="flex flex-wrap items-center gap-4">
            {(search ||
              productFilter !==
                "all" ||
              stockFilter !==
                "all" ||
              sort !==
                "product-asc") && (
              <button
                type="button"
                onClick={resetFilters}
                className="
                  underline
                  underline-offset-4
                  transition
                  hover:text-neutral-900
                "
              >
                Reset filters
              </button>
            )}

            {groupedInventory.length >
              0 && (
              <>
                <button
                  type="button"
                  onClick={openAll}
                  className="
                    underline
                    underline-offset-4
                    transition
                    hover:text-neutral-900
                  "
                >
                  Expand all
                </button>

                <button
                  type="button"
                  onClick={closeAll}
                  className="
                    underline
                    underline-offset-4
                    transition
                    hover:text-neutral-900
                  "
                >
                  Collapse all
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* =====================================================
          EMPTY STATE
      ===================================================== */}

      {!groupedInventory.length ? (
        <div
          className="
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
            No inventory matches
            your filters.
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
            productFilter !==
              "all" ||
            stockFilter !==
              "all" ||
            sort !==
              "product-asc") && (
            <button
              type="button"
              onClick={resetFilters}
              className="
                mt-4
                text-[10px]
                uppercase
                tracking-[0.15em]
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
        <div>
          {groupedInventory.map(
            ([
              productName,
              variants,
            ]) => {
              const isOpen =
                openProducts[
                  productName
                ] ?? false;

              const productUnits =
                variants.reduce(
                  (total, variant) =>
                    total +
                    variant.stock,
                  0
                );

              const lowStockCount =
                variants.filter(
                  (variant) =>
                    variant.stock >
                      0 &&
                    variant.stock <= 2
                ).length;

              const outOfStockCount =
                variants.filter(
                  (variant) =>
                    variant.stock ===
                    0
                ).length;

              return (
                <div
                  key={productName}
                  className="
                    border-b
                    border-stone-200
                    last:border-0
                  "
                >
                  {/* PRODUCT HEADER */}

                  <button
                    type="button"
                    onClick={() =>
                      toggleProduct(
                        productName
                      )
                    }
                    className="
                      flex
                      w-full
                      items-center
                      justify-between
                      gap-4
                      px-5
                      py-5
                      text-left
                      transition
                      hover:bg-stone-50
                      sm:px-6
                    "
                  >
                    <div className="min-w-0">
                      <p
                        className="
                          truncate
                          text-sm
                          font-medium
                          text-neutral-900
                        "
                      >
                        {productName}
                      </p>

                      <div
                        className="
                          mt-2
                          flex
                          flex-wrap
                          items-center
                          gap-x-3
                          gap-y-1
                          text-[10px]
                          uppercase
                          tracking-[0.12em]
                          text-neutral-400
                        "
                      >
                        <span>
                          {variants.length}{" "}
                          variant
                          {variants.length ===
                          1
                            ? ""
                            : "s"}
                        </span>

                        <span className="text-stone-300">
                          •
                        </span>

                        <span>
                          {productUnits}{" "}
                          units
                        </span>

                        {lowStockCount >
                          0 && (
                          <>
                            <span className="text-stone-300">
                              •
                            </span>

                            <span className="text-amber-600">
                              {
                                lowStockCount
                              }{" "}
                              low
                            </span>
                          </>
                        )}

                        {outOfStockCount >
                          0 && (
                          <>
                            <span className="text-stone-300">
                              •
                            </span>

                            <span className="text-neutral-500">
                              {
                                outOfStockCount
                              }{" "}
                              out
                            </span>
                          </>
                        )}
                      </div>
                    </div>

                    <span
                      className="
                        flex
                        h-8
                        w-8
                        shrink-0
                        items-center
                        justify-center
                        rounded-full
                        border
                        border-stone-200
                        text-lg
                        font-light
                        text-neutral-600
                      "
                      aria-hidden="true"
                    >
                      {isOpen
                        ? "−"
                        : "+"}
                    </span>
                  </button>

                  {/* =================================================
                      MOBILE VARIANTS
                  ================================================= */}

                  {isOpen && (
                    <div className="lg:hidden">
                      <div className="space-y-2 border-t border-stone-100 bg-stone-50 p-3 sm:p-4">
                        {variants.map(
                          (variant) => {
                            const stock =
                              getStockLabel(
                                variant.stock
                              );

                            return (
                              <div
                                key={
                                  variant.id
                                }
                                className="
                                  rounded-xl
                                  border
                                  border-stone-200
                                  bg-white
                                  p-4
                                "
                              >
                                <div
                                  className="
                                    flex
                                    items-start
                                    justify-between
                                    gap-3
                                  "
                                >
                                  <div>
                                    <p className="text-sm font-medium">
                                      {
                                        variant.color
                                      }
                                    </p>

                                    <p className="mt-1 text-xs text-neutral-500">
                                      Size{" "}
                                      {
                                        variant.size
                                      }
                                    </p>
                                  </div>

                                  <span
                                    className={[
                                      "inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-1 text-[9px] uppercase tracking-[0.1em]",
                                      stock.className,
                                    ].join(
                                      " "
                                    )}
                                  >
                                    <span
                                      className={[
                                        "h-1.5 w-1.5 rounded-full",
                                        stock.dotClassName,
                                      ].join(
                                        " "
                                      )}
                                    />

                                    {
                                      stock.label
                                    }
                                  </span>
                                </div>

                                <div
                                  className="
                                    mt-4
                                    grid
                                    grid-cols-2
                                    gap-x-4
                                    gap-y-3
                                    border-t
                                    border-stone-100
                                    pt-3
                                  "
                                >
                                  <div>
                                    <p
                                      className="
                                        text-[9px]
                                        uppercase
                                        tracking-[0.12em]
                                        text-neutral-400
                                      "
                                    >
                                      SKU
                                    </p>

                                    <p
                                      className="
                                        mt-1
                                        truncate
                                        text-xs
                                        text-neutral-600
                                      "
                                    >
                                      {variant.sku ??
                                        "—"}
                                    </p>
                                  </div>

                                  <div>
                                    <p
                                      className="
                                        text-[9px]
                                        uppercase
                                        tracking-[0.12em]
                                        text-neutral-400
                                      "
                                    >
                                      Price
                                    </p>

                                    <p
                                      className="
                                        mt-1
                                        text-xs
                                        text-neutral-600
                                      "
                                    >
                                      {formatPrice(
                                        variant.price
                                      )}
                                    </p>
                                  </div>

                                  <div>
                                    <p
                                      className="
                                        text-[9px]
                                        uppercase
                                        tracking-[0.12em]
                                        text-neutral-400
                                      "
                                    >
                                      Stock
                                    </p>

                                    <p
                                      className="
                                        mt-1
                                        text-sm
                                        font-medium
                                        text-neutral-900
                                      "
                                    >
                                      {
                                        variant.stock
                                      }
                                    </p>
                                  </div>

                                  <div>
                                    <p
                                      className="
                                        text-[9px]
                                        uppercase
                                        tracking-[0.12em]
                                        text-neutral-400
                                      "
                                    >
                                      Status
                                    </p>

                                    <p
                                      className={[
                                        "mt-1 text-xs",
                                        variant.status ===
                                        "active"
                                          ? "text-emerald-700"
                                          : "text-neutral-500",
                                      ].join(
                                        " "
                                      )}
                                    >
                                      {variant.status ===
                                      "active"
                                        ? "Active"
                                        : "Inactive"}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            );
                          }
                        )}
                      </div>
                    </div>
                  )}

                  {/* =================================================
                      DESKTOP VARIANTS
                  ================================================= */}

                  {isOpen && (
                    <div className="hidden overflow-x-auto lg:block">
                      <table className="w-full min-w-[900px] text-sm">
                        <thead>
                          <tr
                            className="
                              border-t
                              border-b
                              border-stone-100
                              bg-stone-50
                              text-left
                            "
                          >
                            <th
                              className="
                                px-6
                                py-3
                                text-[9px]
                                font-medium
                                uppercase
                                tracking-[0.18em]
                                text-neutral-400
                              "
                            >
                              Color
                            </th>

                            <th
                              className="
                                px-6
                                py-3
                                text-[9px]
                                font-medium
                                uppercase
                                tracking-[0.18em]
                                text-neutral-400
                              "
                            >
                              Size
                            </th>

                            <th
                              className="
                                px-6
                                py-3
                                text-[9px]
                                font-medium
                                uppercase
                                tracking-[0.18em]
                                text-neutral-400
                              "
                            >
                              SKU
                            </th>

                            <th
                              className="
                                px-6
                                py-3
                                text-[9px]
                                font-medium
                                uppercase
                                tracking-[0.18em]
                                text-neutral-400
                              "
                            >
                              Price
                            </th>

                            <th
                              className="
                                px-6
                                py-3
                                text-[9px]
                                font-medium
                                uppercase
                                tracking-[0.18em]
                                text-neutral-400
                              "
                            >
                              Stock
                            </th>

                            <th
                              className="
                                px-6
                                py-3
                                text-[9px]
                                font-medium
                                uppercase
                                tracking-[0.18em]
                                text-neutral-400
                              "
                            >
                              Status
                            </th>
                          </tr>
                        </thead>

                        <tbody>
                          {variants.map(
                            (variant) => {
                              const stock =
                                getStockLabel(
                                  variant.stock
                                );

                              return (
                                <tr
                                  key={
                                    variant.id
                                  }
                                  className="
                                    border-b
                                    border-stone-100
                                    last:border-0
                                    hover:bg-stone-50
                                  "
                                >
                                  <td className="px-6 py-4">
                                    {
                                      variant.color
                                    }
                                  </td>

                                  <td className="px-6 py-4">
                                    {
                                      variant.size
                                    }
                                  </td>

                                  <td className="px-6 py-4 text-neutral-500">
                                    {variant.sku ??
                                      "—"}
                                  </td>

                                  <td className="px-6 py-4">
                                    {formatPrice(
                                      variant.price
                                    )}
                                  </td>

                                  <td className="px-6 py-4">
                                    <span className="font-medium">
                                      {
                                        variant.stock
                                      }
                                    </span>
                                  </td>

                                  <td className="px-6 py-4">
                                    <span
                                      className={[
                                        "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[9px] uppercase tracking-[0.12em]",
                                        stock.className,
                                      ].join(
                                        " "
                                      )}
                                    >
                                      <span
                                        className={[
                                          "h-1.5 w-1.5 rounded-full",
                                          stock.dotClassName,
                                        ].join(
                                          " "
                                        )}
                                      />

                                      {
                                        stock.label
                                      }
                                    </span>
                                  </td>
                                </tr>
                              );
                            }
                          )}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              );
            }
          )}
        </div>
      )}
    </section>
  );
}