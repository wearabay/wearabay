"use client";

import Badge from "@/components/ui/Badge";
import { formatPrice } from "@/lib/currency";
import type { Product } from "@/types/product";

type Props = {
  product: Product;
};

export default function QuickViewInfo({
  product,
}: Props) {
  const discountedVariant =
    product.variants.find(
      (variant) =>
        variant.price === product.price &&
        typeof variant.compareAtPrice ===
          "number" &&
        variant.compareAtPrice >
          variant.price,
    ) ??
    product.variants.find(
      (variant) =>
        typeof variant.compareAtPrice ===
          "number" &&
        variant.compareAtPrice >
          variant.price,
    );

  const compareAtPrice =
    discountedVariant?.compareAtPrice ??
    null;

  const hasComparePrice =
    typeof compareAtPrice === "number" &&
    compareAtPrice > product.price;

  return (
    <div className="flex flex-col">
      {/* Badge */}

      {product.badge && (
        <div className="mb-5">
          <Badge>
            {product.badge}
          </Badge>
        </div>
      )}

      {/* Category */}

      <p className="text-xs uppercase tracking-[0.22em] text-neutral-500">
        {product.category}
      </p>

      {/* Name */}

      <h2 className="mt-3 text-3xl font-light leading-tight text-black">
        {product.name}
      </h2>

      {/* Price */}

      <div className="mt-6 flex items-baseline gap-3">
        {hasComparePrice && (
          <span className="text-base text-neutral-400 line-through">
            {formatPrice(compareAtPrice)}
          </span>
        )}

        <span className="text-2xl font-semibold text-black">
          {formatPrice(product.price)}
        </span>
      </div>

      {/* Description */}

      <p className="mt-6 leading-8 text-neutral-600">
        {product.description}
      </p>
    </div>
  );
}