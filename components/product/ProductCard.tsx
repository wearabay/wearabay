import Link from "next/link";
import type { Product } from "@/types/product";
import type { ProductBadge } from "@/lib/product-badges";

import ProductImage from "./ProductImage";
import ProductPrice from "./ProductPrice";

type ProductCardProps = {
  product: Product;
  badges?: ProductBadge[];
};

export default function ProductCard({
  product,
  badges = [],
}: ProductCardProps) {
  return (
    <div
      className="
        group
        block
        rounded-2xl
        transition-all
        duration-500
        hover:-translate-y-2
      "
    >
      {/* Image Area */}

      <ProductImage
        product={product}
        badges={badges}
      />

      {/* Product Information */}

      <Link
        href={`/shop/${product.slug}`}
        className="block"
      >
        <div className="mt-5 space-y-2">
          <h3
            className="
              line-clamp-2
              text-[17px]
              font-light
              leading-relaxed
              tracking-[0.01em]
              text-neutral-500
            "
          >
            {product.name}
          </h3>

          <ProductPrice
            price={product.price}
          />
        </div>
      </Link>
    </div>
  );
}