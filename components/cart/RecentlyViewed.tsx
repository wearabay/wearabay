"use client";

import { useMemo, useSyncExternalStore } from "react";

import Container from "@/components/ui/Container";
import SectionTitle from "@/components/ui/SectionTitle";
import ProductCard from "@/components/product/ProductCard";

import type { Product } from "@/types/product";

const RECENTLY_VIEWED_KEY = "wearing-abaya-recent";
const EMPTY_SNAPSHOT = "[]";

type RecentlyViewedProps = {
  products: Product[];
  currentSlug?: string;
};

function subscribeToRecentlyViewed(onStoreChange: () => void) {
  window.addEventListener("storage", onStoreChange);

  return () => {
    window.removeEventListener("storage", onStoreChange);
  };
}

function getRecentlyViewedSnapshot() {
  return localStorage.getItem(RECENTLY_VIEWED_KEY) ?? EMPTY_SNAPSHOT;
}

function getServerSnapshot() {
  return EMPTY_SNAPSHOT;
}

export default function RecentlyViewed({
  products,
  currentSlug,
}: RecentlyViewedProps) {
  const recentlyViewedSnapshot = useSyncExternalStore(
    subscribeToRecentlyViewed,
    getRecentlyViewedSnapshot,
    getServerSnapshot,
  );

  const items = useMemo(() => {
    let slugs: string[];

    try {
      const parsed: unknown = JSON.parse(recentlyViewedSnapshot);
      slugs = Array.isArray(parsed)
        ? parsed.filter((slug): slug is string => typeof slug === "string")
        : [];
    } catch {
      slugs = [];
    }

    return slugs
      .filter((slug) => slug !== currentSlug)
      .map((slug) =>
        products.find((product) => product.slug === slug),
      )
      .filter((product): product is Product => Boolean(product));
  }, [currentSlug, products, recentlyViewedSnapshot]);

  if (!items.length) {
    return null;
  }

  return (
    <section className="mt-28 border-t border-neutral-200 pt-24">
      <Container>
        <SectionTitle
          eyebrow="Continue Shopping"
          title="Recently Viewed"
        />

        <div
          className="
            mt-16
            grid
            grid-cols-2
            gap-8
            lg:grid-cols-4
          "
        >
          {items.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
            />
          ))}
        </div>
      </Container>
    </section>
  );
}
