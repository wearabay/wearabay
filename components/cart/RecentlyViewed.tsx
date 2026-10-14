
"use client";

import { useCallback, useMemo, useSyncExternalStore } from "react";

import Container from "@/components/ui/Container";
import SectionTitle from "@/components/ui/SectionTitle";
import ProductCard from "@/components/product/ProductCard";

import { useAuthUser } from "@/hooks/useAuthUser";
import {
  getRecentlyViewed,
  subscribeRecentlyViewed,
} from "@/lib/recently-viewed";

import type { Product } from "@/types/product";
import type { ProductBadge } from "@/lib/product-badges";

const EMPTY_SNAPSHOT = "[]";

type RecentlyViewedProps = {
  products: Product[];
  currentSlug?: string;
  badgesByProductId?: Record<number, ProductBadge[]>;
};

function getServerSnapshot() {
  return EMPTY_SNAPSHOT;
}

export default function RecentlyViewed({
  products,
  currentSlug,
  badgesByProductId = {},
}: RecentlyViewedProps) {
  const { user, loading } = useAuthUser();
  const userId = user?.id ?? null;

  const subscribe = useCallback(
    (onStoreChange: () => void) =>
      subscribeRecentlyViewed(userId, onStoreChange),
    [userId],
  );

  const getSnapshot = useCallback(
    () => JSON.stringify(userId ? getRecentlyViewed(userId) : []),
    [userId],
  );

  const snapshot = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );

  const items = useMemo(() => {
    let slugs: string[];

    try {
      const parsed: unknown = JSON.parse(snapshot);

      slugs = Array.isArray(parsed)
        ? parsed.filter(
            (slug): slug is string => typeof slug === "string",
          )
        : [];
    } catch {
      slugs = [];
    }

    const productBySlug = new Map(
      products.map((product) => [product.slug, product]),
    );

    return slugs
      .filter((slug) => slug !== currentSlug)
      .map((slug) => productBySlug.get(slug))
      .filter((product): product is Product => Boolean(product));
  }, [currentSlug, products, snapshot]);

  if (loading || !userId || items.length === 0) {
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
            <ProductCard key={product.id} product={product} badges={badgesByProductId[product.id] ?? []} />
          ))}
        </div>
      </Container>
    </section>
  );
}
