"use client";

import { SlidersHorizontal } from "lucide-react";

import Container from "../ui/Container";
import Input from "../ui/Input";
import SortDropdown from "./SortDropdown";

import { useShop } from "./context/ShopContext";
import { useState } from "react";
import FilterDrawer from "./filter/FilterDrawer";

export default function ShopToolbar() {
  const {
  search,
  setSearch,
  category,
  colors,
  sizes,
  clearFilters,
} = useShop();

const [filterOpen, setFilterOpen] = useState(false);

const hasActiveFilters =
  category.length > 0 ||
  colors.length > 0 ||
  sizes.length > 0;

  return (
    <section className="sticky top-20 z-30 border-b border-neutral-200/80 bg-white/90 backdrop-blur-mx text-neutral-700">

      <Container>

        <div className="flex flex-col gap-4 py-4 lg:flex-row lg:items-center lg:justify-between">

          {/* Left */}
          <div className="flex items-center gap-4">

            <button
  onClick={() => setFilterOpen(true)}
  className="
    inline-flex
    items-center
    gap-2
    rounded-full
    border
    border-neutral-300
    px-5
    py-3
    text-xs
    uppercase
    tracking-[0.22em]
    transition
    hover:border-black
  "
>
  <SlidersHorizontal size={16} />

  <span>Filter</span>

  {hasActiveFilters && (
    <span
      className="
        flex
        h-5
        min-w-5
        items-center
        justify-center
        rounded-full
        bg-black
        px-1.5
        text-[10px]
        font-medium
        text-white
      "
    >
      {category.length + colors.length + sizes.length}
    </span>
  )}
</button>

          </div>

          {/* Search */}
          <div className="w-full lg:max-w-md">
  <Input
    placeholder="Search collection..."
    value={search}
    onChange={(e) => setSearch(e.target.value)}
  />
</div>

          {/* Sort */}
          <SortDropdown />

        </div>

        {/* Active Filters */}

        {hasActiveFilters && (
  <div className="flex flex-wrap items-center gap-2 border-t border-neutral-100 py-3">

    {category.map((item) => (
      <button
        key={item}
        className="
          rounded-full
          bg-neutral-100
          px-3
          py-1.5
          text-[11px]
          uppercase
          tracking-[0.18em]
        "
      >
        {item}
      </button>
    ))}

    {colors.map((item) => (
      <button
        key={item}
        className="rounded-full bg-neutral-100 px-3 py-1.5 text-[11px] uppercase tracking-[0.18em]"
      >
        {item}
      </button>
    ))}

    {sizes.map((item) => (
  <button
    key={item}
    className="
      rounded-full
      bg-neutral-100
      px-3
      py-1.5
      text-[11px]
      uppercase
      tracking-[0.18em]
    "
  >
    {item}
  </button>
))}

    <button
      onClick={clearFilters}
      className="text-[11px] uppercase tracking-[0.18em] text-neutral-500 hover:text-black"
    >
      Clear All
    </button>
  </div>
)}

            </Container>

      <FilterDrawer
        open={filterOpen}
        onClose={() => setFilterOpen(false)}
      />

    </section>
  );
}