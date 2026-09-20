"use client";

import { X } from "lucide-react";

import CategoryFilter from "./CategoryFilter";
import ColorFilter from "./ColorFilter";
import { useShop } from "../context/ShopContext";
import SizeFilter from "./SizeFilter";
import PriceFilter from "./PriceFilter";

type FilterDrawerProps = {
  open: boolean;
  onClose: () => void;
};

export default function FilterDrawer({
  open,
  onClose,
}: FilterDrawerProps) {
  const { clearFilters } = useShop();

  return (
    <>
      {/* Overlay */}

      <div
        onClick={onClose}
        className={`
          fixed
          inset-x-0
          top-20
          bottom-0
          z-40
          bg-black/40
          transition-all
          duration-300
          ${
            open
              ? "visible opacity-100"
              : "invisible opacity-0"
          }
        `}
      />

      {/* Drawer */}

      <aside
        className={`
          fixed
          left-0
          top-20
          bottom-0
          z-50
          flex
          w-full
          max-w-sm
          flex-col
          overflow-hidden
          bg-white
          shadow-2xl
          transition-transform
          duration-300
          ${
            open
              ? "translate-x-0"
              : "-translate-x-full"
          }
        `}
        aria-hidden={!open}
      >
        {/* Header */}

        <div className="flex shrink-0 items-center justify-between border-b border-neutral-200 px-6 py-5">
          <h2 className="text-lg font-medium uppercase tracking-[0.22em]">
            Filters
          </h2>

          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 transition hover:bg-neutral-100"
            aria-label="Close filters"
          >
            <X size={20} />
          </button>
        </div>

        {/* Scrollable Content */}

        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-6 pb-10">
          <div className="space-y-6">
            {/* Category */}

            <section className="border-b border-neutral-300 pb-4">
              <h3 className="mb-5 text-xs uppercase tracking-[0.25em] text-neutral-500">
                Category
              </h3>

              <CategoryFilter />
            </section>

            {/* Color */}

            <section className="border-b border-neutral-300 pb-4">
              <h3 className="mb-5 text-xs uppercase tracking-[0.25em] text-neutral-500">
                Color
              </h3>

              <ColorFilter />
            </section>

            {/* Size */}

            <section className="border-b border-neutral-300 pb-4">
              <h3 className="mb-5 text-xs uppercase tracking-[0.25em] text-neutral-500">
                Size
              </h3>

              <SizeFilter />
            </section>

            {/* Price */}

            <section>
              <h3 className="mb-5 text-xs uppercase tracking-[0.25em] text-neutral-500">
                Price
              </h3>

              <PriceFilter />
            </section>
          </div>
        </div>

        {/* Footer */}

        <div className="shrink-0 border-t border-neutral-300 px-6 py-4">
          <div className="flex gap-3">
            <button
              type="button"
              onClick={clearFilters}
              className="
                flex-1
                rounded-full
                border
                border-neutral-300
                py-3
                text-xs
                uppercase
                tracking-[0.22em]
                transition
                hover:border-black
              "
            >
              Reset
            </button>

            <button
              type="button"
              onClick={onClose}
              className="
                flex-1
                rounded-full
                bg-black
                py-3
                text-xs
                uppercase
                tracking-[0.22em]
                text-white
                transition
                hover:opacity-90
              "
            >
              Done
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}