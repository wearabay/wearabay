"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Search, X } from "lucide-react";

import { formatPrice } from "@/lib/currency";

import type { Product } from "@/types/product";

import {
  getRecentSearches,
  saveRecentSearch,
  clearRecentSearches,
} from "@/lib/search";

type SearchDrawerProps = {
  open: boolean;
  onClose: () => void;
  products: Product[];
};

export default function SearchDrawer({
  open,
  onClose,
  products,
}: SearchDrawerProps) {
  const [query, setQuery] = useState("");
  const [recent, setRecent] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) {
      setQuery("");
    }
  }, [open]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    window.addEventListener("keydown", handler);

    return () =>
      window.removeEventListener("keydown", handler);
  }, [onClose]);

  useEffect(() => {
    if (!open) return;

    setRecent(getRecentSearches());

    setTimeout(() => {
      inputRef.current?.focus();
    }, 150);
  }, [open]);

  const results = useMemo(() => {
    if (!query.trim()) return [];

    const q = query.toLowerCase();

    return products.filter((product) => {
      const matchName =
        product.name.toLowerCase().includes(q);

      const matchCategory =
        product.category.toLowerCase().includes(q);

      const matchBadge =
        product.badge?.toLowerCase().includes(q);

      const matchColor =
        product.colors?.some((color) =>
          color.toLowerCase().includes(q)
        );

      const matchFeature =
        product.features?.some((feature) =>
          feature.toLowerCase().includes(q)
        ) ?? false;

      const matchDescription =
        product.description
          .toLowerCase()
          .includes(q);

      const matchSpecification =
        product.specifications?.some((item) =>
          `${item.label} ${item.value}`
            .toLowerCase()
            .includes(q)
        ) ?? false;

      return (
        matchName ||
        matchCategory ||
        matchBadge ||
        matchColor ||
        matchFeature ||
        matchDescription ||
        matchSpecification
      );
    });
  }, [query, products]);

  const popular = [
    "Abaya",
    "Dress",
    "Mukena",
    "Kids",
  ];

  return (
    <>
      <div
        onClick={onClose}
        className={`fixed inset-0 z-40 bg-black/15 backdrop-blur-[0.5px] transition-opacity duration-500 ${
          open
            ? "opacity-100 visible"
            : "opacity-0 invisible"
        }`}
      />

      <aside
        className={`fixed inset-x-0 top-0 z-50 max-h-[55dvh] overflow-y-auto rounded-b-3x1 bg-white shadow-2x1 transition-all duration-500 ease-out ${
          open
            ? "translate-y-0"
            : "-translate-y-full"
        }`}
      >
        <div className="mx-auto max-w-5xl px-5 pt-[max(2rem,env(safe-area-inset-top))] pb-8 md:px-8 md:py-10">

          <div className="flex items-center justify-between">

            <h2 className="text-2xl font-light text-black">
              Search
            </h2>

            <button
              onClick={onClose}
              className="rounded-full p-2 transition hover:bg-stone-100 text-neutral-400"
              aria-label="Close search"
            >
              <X size={22} />
            </button>

          </div>

          <div className="mt-8 flex items-center gap-4 border-b pb-4">

            <Search size={20} />

            <input
              ref={inputRef}
              value={query}
              onChange={(e) =>
                setQuery(e.target.value)
              }
              placeholder="Search for abaya..."
              className="w-full bg-transparent text-lg text-black placeholder:text-neutral-400 outline-none"
            />

          </div>

          {!query ? (

            <div className="mt-8">

              {recent.length > 0 && (

                <div className="mt-10">

                  <div className="mb-4 flex items-center justify-between">

                    <h3 className="text-xs uppercase tracking-[0.2em] text-neutral-700">
                      Recent Searches
                    </h3>

                    {recent.length > 1 && (
                      <button
                        onClick={() => {
                          clearRecentSearches();
                          setRecent([]);
                        }}
                        className="text-xs text-neutral-500 transition hover:text-black"
                      >
                        Clear
                      </button>
                    )}

                  </div>

                  <div className="flex flex-wrap gap-3">

                    {recent.map((item) => (
                      <button
                        key={item}
                        onClick={() => setQuery(item)}
                        className="rounded-full bg-stone-200 px-5 py-2 text-sm transition hover:bg-black hover:text-white text-neutral-500"
                      >
                        {item}
                      </button>
                    ))}

                  </div>

                </div>

              )}

              <div className="mt-5">

                <p className="mb-4 text-xs uppercase tracking-[0.2em] text-neutral-700">
                  Popular Searches
                </p>

                <div className="flex flex-wrap gap-2 md:gap-3">

                  {popular.map((item) => (

                    <button
                      key={item}
                      onClick={() => setQuery(item)}
                      className="rounded-full border border-stone-300 px-5 py-2.5 text-sm transition hover:border-black hover:bg-black hover:text-white text-neutral-500"
                    >
                      {item}
                    </button>

                  ))}

                </div>

              </div>

            </div>

          ) : (

            <div className="mt-8 animate-in fade-in duration-300">

              {results.length === 0 ? (

                <div className="py-14 text-center">

                  <Search
                    size={42}
                    className="mx-auto text-neutral-300"
                  />

                  <h3 className="mt-5 text-xl font-light">
                    No products found
                  </h3>

                  <p className="mt-2 text-neutral-500">
                    Try searching with another keyword.
                  </p>

                </div>

              ) : (

                <>

                  <p className="mb-6 text-xs uppercase tracking-[0.18em] text-neutral-500">
                    {results.length} Result
                    {results.length > 1 ? "s" : ""}
                  </p>

                  <div className="space-y-5">

                    {results.map((product) => (

                      <Link
                        key={product.id}
                        href={`/shop/${product.slug}`}
                        onClick={() => {
                          saveRecentSearch(query);
                          onClose();
                        }}
                        className="flex items-center gap-4 rounded-lg p-3 transition hover:bg-stone-50"
                      >

                        <div className="relative h-24 w-18 overflow-hidden rounded-md bg-stone-100 md:h-28 md:w-20">

                          <Image
                            src={product.image}
                            alt={product.name}
                            fill
                            sizes="80px"
                            className="object-cover"
                          />

                        </div>

                        <div className="flex-1">

                          <h3 className="font-medium">
                            {product.name}
                          </h3>

                          <p className="mt-1 text-xs uppercase tracking-[0.18em] text-neutral-400">
                            {product.category}
                          </p>

                          {product.badge && (
                            <span className="mt-2 inline-flex rounded-full bg-stone-900 px-3 py-1 text-[10px] font-medium uppercase tracking-[0.18em] text-white">
                              {product.badge}
                            </span>
                          )}

                          <p className="mt-3 text-sm font-medium">
                            {formatPrice(product.price)}
                          </p>

                        </div>

                      </Link>

                    ))}

                  </div>

                </>

              )}

            </div>

          )}

        </div>
      </aside>
    </>
  );
}