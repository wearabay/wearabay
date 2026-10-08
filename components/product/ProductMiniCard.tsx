"use client";

import Link from "next/link";
import Image from "next/image";

import type { Product } from "@/types/product";
import { formatPrice } from "@/lib/currency";

import Badge from "@/components/ui/Badge";
import WishlistButton from "@/components/ui/WishlistButton";

type Props = {
  product: Product;
};

export default function ProductMiniCard({
  product,
}: Props) {
  const discountedVariant =
    product.variants.find(
      (variant) =>
        variant.price === product.price &&
        typeof variant.compareAtPrice === "number" &&
        variant.compareAtPrice > variant.price,
    ) ??
    product.variants.find(
      (variant) =>
        typeof variant.compareAtPrice === "number" &&
        variant.compareAtPrice > variant.price,
    );

  const compareAtPrice =
    discountedVariant?.compareAtPrice ?? null;

  const hasComparePrice =
    typeof compareAtPrice === "number" &&
    compareAtPrice > product.price;

  return (
    <Link
      href={`/shop/${product.slug}`}
      className="group block"
    >
      <div
        className="
          relative
          aspect-[4/5]
          overflow-hidden
          rounded-xl
          bg-stone-100
        "
      >
        {/* Badge */}

        {product.badge && (
          <div className="absolute left-3 top-3 z-20">
            <Badge>{product.badge}</Badge>
          </div>
        )}

        {/* Wishlist */}

        <div className="absolute right-3 top-3 z-20">
          <WishlistButton productId={product.id} />
        </div>

        {/* Main Image */}

        <Image
          src={product.images?.[0] ?? product.image}
          alt={product.name}
          fill
          sizes="(max-width:768px) 50vw, 25vw"
          className="
            object-cover
            transition-all
            duration-700
            group-hover:opacity-0
            group-hover:scale-105
          "
        />

        {/* Hover Image */}

        <Image
          src={
            product.images?.[1] ??
            product.images?.[0] ??
            product.image
          }
          alt={product.name}
          fill
          sizes="(max-width:768px) 50vw, 25vw"
          className="
            object-cover
            opacity-0
            transition-all
            duration-700
            group-hover:opacity-100
            group-hover:scale-[1.03]
          "
        />

        {/* Gradient */}

        <div
          className="
            absolute
            inset-x-0
            bottom-0
            h-20
            bg-gradient-to-t
            from-black/20
            to-transparent
            opacity-0
            transition
            duration-500
            group-hover:opacity-100
          "
        />
      </div>

      {/* Product Name */}

      <h3
        className="
          mt-4
          text-[15px]
          font-medium
          transition-colors
          duration-300
          group-hover:text-black
        "
      >
        {product.name}
      </h3>

      {/* Price */}

      <div className="mt-2 flex items-baseline gap-2">
        {hasComparePrice && (
          <span className="text-xs text-neutral-400 line-through">
            {formatPrice(compareAtPrice)}
          </span>
        )}

        <span
          className={
            hasComparePrice
              ? "text-sm font-semibold text-neutral-900"
              : "text-sm font-medium text-neutral-500"
          }
        >
          {formatPrice(product.price)}
        </span>
      </div>
    </Link>
  );
}