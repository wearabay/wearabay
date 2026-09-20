import Link from "next/link";

import ProductCard from "../product/ProductCard";
import QuickViewModal from "../product/QuickViewModal";

import type { Product } from "@/types/product";

type Props = {
  products: Product[];
};

export default function FeaturedProducts({
  products,
}: Props) {
  return (
    <>
      <section className="bg-white py-16 lg:py-32">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mx-auto mb-20 max-w-3xl text-center">
            <p className="text-[11px] uppercase tracking-[0.35em] text-gray-500">
              Featured Collection
            </p>

            <h2 className="mt-5 text-4xl font-light tracking-[0.02em] text-neutral-900 md:text-5xl">
              Featured Products
            </h2>

            <p className="mx-auto mt-4 max-w-xl text-base leading-8 text-neutral-500">
              Carefully selected pieces designed
              for timeless elegance and effortless
              sophistication.
            </p>

            <div className="mt-6">
              <Link
                href="/shop"
                className="inline-flex items-center gap-2 text-[12px] uppercase tracking-[0.28em] text-neutral-900 transition hover:opacity-60"
              >
                View All Collection →
              </Link>
            </div>
          </div>

          <div className="mt-14 grid grid-cols-2 gap-x-8 gap-y-14 text-neutral-900 lg:grid-cols-4">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
              />
            ))}
          </div>
        </div>
      </section>

      <QuickViewModal />
    </>
  );
}