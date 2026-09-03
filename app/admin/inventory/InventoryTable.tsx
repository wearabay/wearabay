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
      className: "bg-stone-100 text-stone-700",
    };
  }

  if (stock <= 2) {
    return {
      label: "Low Stock",
      className: "bg-amber-50 text-amber-800",
    };
  }

  return {
    label: "In Stock",
    className: "bg-emerald-50 text-emerald-800",
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
  const [search, setSearch] = useState("");
  const [productFilter, setProductFilter] = useState("all");
  const [stockFilter, setStockFilter] =
    useState<StockFilter>("all");
  const [sort, setSort] =
    useState<SortOption>("product-asc");

  const [openProducts, setOpenProducts] = useState<
    Record<string, boolean>
  >({});

  const productNames = useMemo(() => {
    return Array.from(
      new Set(
        inventory.map(
          (variant) => variant.productName
        )
      )
    ).sort((a, b) =>
      a.localeCompare(b)
    );
  }, [inventory]);

  const filteredInventory = useMemo(() => {
    const normalizedSearch =
      search.trim().toLowerCase();

    const filtered = inventory.filter(
      (variant) => {
        const matchesSearch =
          normalizedSearch === "" ||
          variant.productName
            .toLowerCase()
            .includes(normalizedSearch) ||
          variant.color
            .toLowerCase()
            .includes(normalizedSearch) ||
          variant.size
            .toLowerCase()
            .includes(normalizedSearch) ||
          (variant.sku ?? "")
            .toLowerCase()
            .includes(normalizedSearch);

        const matchesProduct =
          productFilter === "all" ||
          variant.productName ===
            productFilter;

        const matchesStock =
          stockFilter === "all" ||
          (stockFilter === "in-stock" &&
            variant.stock > 2) ||
          (stockFilter === "low-stock" &&
            variant.stock > 0 &&
            variant.stock <= 2) ||
          (stockFilter === "out-of-stock" &&
            variant.stock === 0);

        return (
          matchesSearch &&
          matchesProduct &&
          matchesStock
        );
      }
    );

    return [...filtered].sort((a, b) => {
      if (sort === "product-asc") {
        const productCompare =
          a.productName.localeCompare(
            b.productName
          );

        if (productCompare !== 0) {
          return productCompare;
        }

        return (
          a.color.localeCompare(b.color) ||
          a.size.localeCompare(b.size)
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
          b.color.localeCompare(a.color) ||
          b.size.localeCompare(a.size)
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
    });
  }, [
    inventory,
    search,
    productFilter,
    stockFilter,
    sort,
  ]);

  const groupedInventory = useMemo(() => {
    const groups = new Map<
      string,
      AdminInventoryVariant[]
    >();

    for (const variant of filteredInventory) {
      const existing =
        groups.get(variant.productName) ?? [];

      existing.push(variant);

      groups.set(
        variant.productName,
        existing
      );
    }

    return Array.from(groups.entries());
  }, [filteredInventory]);

  function toggleProduct(
    productName: string
  ) {
    setOpenProducts((current) => ({
      ...current,
      [productName]:
        !(current[productName] ?? false),
    }));
  }

  function openAll() {
    const nextState: Record<
      string,
      boolean
    > = {};

    for (const [productName] of groupedInventory) {
      nextState[productName] = true;
    }

    setOpenProducts(nextState);
  }

  function closeAll() {
    setOpenProducts({});
  }

  return (
    <section
      className="
        overflow-hidden
        rounded-2xl
        border
        border-stone-200
      "
    >
      {/* SECTION HEADER */}

      <div
        className="
          border-b
          border-stone-200
          px-6
          py-5
        "
      >
        <p
          className="
            text-xs
            uppercase
            tracking-[0.3em]
            text-neutral-500
          "
        >
          Product Variants
        </p>
      </div>


      {/* FILTERS */}

      <div
        className="
          border-b
          border-stone-200
          px-6
          py-5
        "
      >
        <div
          className="
            grid
            gap-3
            lg:grid-cols-[minmax(220px,1fr)_180px_160px_180px]
          "
        >

          {/* SEARCH */}

          <input
            type="search"
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
            placeholder="Search product, color, size, SKU..."
            className="
              h-11
              rounded-full
              border
              border-stone-300
              bg-white
              px-4
              text-sm
              outline-none
              transition
              placeholder:text-neutral-400
              focus:border-stone-500
            "
          />


          {/* PRODUCT FILTER */}

          <select
            value={productFilter}
            onChange={(event) =>
              setProductFilter(event.target.value)
            }
            className="
              h-11
              rounded-full
              border
              border-stone-300
              bg-white
              px-4
              text-sm
              outline-none
              focus:border-stone-500
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


          {/* STOCK FILTER */}

          <select
            value={stockFilter}
            onChange={(event) =>
              setStockFilter(
                event.target.value as StockFilter
              )
            }
            className="
              h-11
              rounded-full
              border
              border-stone-300
              bg-white
              px-4
              text-sm
              outline-none
              focus:border-stone-500
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


          {/* SORT */}

          <select
            value={sort}
            onChange={(event) =>
              setSort(
                event.target.value as SortOption
              )
            }
            className="
              h-11
              rounded-full
              border
              border-stone-300
              bg-white
              px-4
              text-sm
              outline-none
              focus:border-stone-500
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


        {/* RESULT / EXPAND CONTROLS */}

        <div
          className="
            mt-4
            flex
            flex-col
            gap-3
            text-xs
            text-neutral-500
            sm:flex-row
            sm:items-center
            sm:justify-between
          "
        >

          <p>
            Showing{" "}
            <span className="font-medium text-neutral-700">
              {groupedInventory.length}
            </span>{" "}
            product
            {groupedInventory.length === 1
              ? ""
              : "s"}{" "}
            /{" "}
            <span className="font-medium text-neutral-700">
              {filteredInventory.length}
            </span>{" "}
            variant
            {filteredInventory.length === 1
              ? ""
              : "s"}
          </p>


          {groupedInventory.length > 0 && (
            <div className="flex gap-4">
              <button
                type="button"
                onClick={openAll}
                className="
                  text-xs
                  underline
                  underline-offset-4
                "
              >
                Expand all
              </button>

              <button
                type="button"
                onClick={closeAll}
                className="
                  text-xs
                  underline
                  underline-offset-4
                "
              >
                Collapse all
              </button>
            </div>
          )}

        </div>
      </div>


      {/* EMPTY STATE */}

      {!groupedInventory.length ? (

        <div className="p-8">
          <p className="text-sm text-neutral-500">
            No inventory matches your filters.
          </p>
        </div>

      ) : (

        /* PRODUCT GROUPS */

        <div>

          {groupedInventory.map(
            ([productName, variants]) => {

              const isOpen =
                openProducts[productName] ??
                false;

              return (
                <div
                  key={productName}
                  className="
                    border-b
                    border-stone-200
                    last:border-0
                  "
                >

                  {/* PRODUCT ROW */}

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
                      px-6
                      py-5
                      text-left
                      transition
                      hover:bg-stone-50
                    "
                  >

                    <div className="min-w-0">

                      <p className="font-medium">
                        {productName}
                      </p>

                      <p className="mt-1 text-xs text-neutral-500">
                        {variants.length}{" "}
                        variant
                        {variants.length === 1
                          ? ""
                          : "s"}
                      </p>

                    </div>


                    <span
                      className="
                        ml-6
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
                      {isOpen ? "−" : "+"}
                    </span>

                  </button>


                  {/* VARIANTS */}

                  {isOpen && (

                    <div className="overflow-x-auto">

                      <table className="w-full min-w-[900px] text-sm">

                        <thead>
                          <tr
                            className="
                              border-t
                              border-stone-100
                              border-b
                              border-stone-100
                              text-left
                              text-xs
                              uppercase
                              tracking-wider
                              text-neutral-500
                            "
                          >

                            <th className="px-6 py-4 font-normal">
                              Color
                            </th>

                            <th className="px-6 py-4 font-normal">
                              Size
                            </th>

                            <th className="px-6 py-4 font-normal">
                              SKU
                            </th>

                            <th className="px-6 py-4 font-normal">
                              Price
                            </th>

                            <th className="px-6 py-4 font-normal">
                              Stock
                            </th>

                            <th className="px-6 py-4 font-normal">
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
                                  key={variant.id}
                                  className="
                                    border-b
                                    border-stone-100
                                    last:border-0
                                  "
                                >

                                  <td className="px-6 py-5">
                                    {variant.color}
                                  </td>

                                  <td className="px-6 py-5">
                                    {variant.size}
                                  </td>

                                  <td className="px-6 py-5 text-neutral-500">
                                    {variant.sku ??
                                      "—"}
                                  </td>

                                  <td className="px-6 py-5">
                                    {formatPrice(
                                      variant.price
                                    )}
                                  </td>

                                  <td className="px-6 py-5">

                                    <span className="font-medium">
                                      {variant.stock}
                                    </span>

                                  </td>

                                  <td className="px-6 py-5">

                                    <span
                                      className={`
                                        inline-flex
                                        rounded-full
                                        px-3
                                        py-1
                                        text-xs
                                        ${stock.className}
                                      `}
                                    >
                                      {stock.label}
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