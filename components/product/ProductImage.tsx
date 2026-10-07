"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";

import WishlistButton from "@/components/ui/WishlistButton";

import { openQuickView } from "@/lib/quick-view";

import type { Product } from "@/types/product";
import type { ProductBadge } from "@/lib/product-badges";

type Props = {
  product: Product;
  badges?: ProductBadge[];
};

export default function ProductImage({
  product,
  badges = [],
}: Props) {
  const router = useRouter();

  const visibleBadges = badges.slice(0, 2);

  const primaryImage =
    [product.images?.[0], product.image].find(
      (src) =>
        typeof src === "string" &&
        src.trim().length > 0,
    ) ?? null;

  const secondaryImage =
    [product.images?.[1], primaryImage].find(
      (src) =>
        typeof src === "string" &&
        src.trim().length > 0,
    ) ?? null;

  return (
    <div
      onClick={() =>
        router.push(`/shop/${product.slug}`)
      }
      className="
        group
        relative
        aspect-[3/4]
        overflow-hidden
        rounded-xl
        bg-[#ECE8E2]
        cursor-pointer
        transition-all
        duration-500
        hover:shadow-xl
      "
    >
      {/* Automatic Badges */}

      {visibleBadges.length > 0 && (
        <div
          className="
            absolute
            left-4
            top-4
            z-20
            flex
            flex-wrap
            gap-2
          "
        >
          {visibleBadges.map((badge) => (
            <span
              key={badge.type}
              className="
                rounded-full
                border
                border-white/70
                bg-white/90
                px-3
                py-1.5
                text-[10px]
                font-medium
                uppercase
                tracking-[0.12em]
                text-neutral-700
                shadow-sm
                backdrop-blur-sm
              "
            >
              {badge.label}
            </span>
          ))}
        </div>
      )}

      {/* Wishlist */}

      <div
        className="
          absolute
          right-4
          top-4
          z-20
        "
        onClick={(e) =>
          e.stopPropagation()
        }
      >
        <WishlistButton
          productId={product.id}
        />
      </div>

      {/* Main Image */}

      {primaryImage ? (
        <Image
          src={primaryImage}
          alt={product.name}
          fill
          sizes="
            (max-width:768px) 50vw,
            (max-width:1200px) 33vw,
            25vw
          "
          className="
            object-cover
            transition-all
            duration-700
            ease-out
            group-hover:opacity-0
            group-hover:scale-[1.03]
            group-hover:brightness-95
          "
        />
      ) : (
        <div
          className="
            absolute
            inset-0
            flex
            items-center
            justify-center
            bg-[#ECE8E2]
          "
        >
          <span
            className="
              text-[10px]
              font-medium
              tracking-[0.2em]
              text-neutral-400
            "
          >
            NO IMAGE
          </span>
        </div>
      )}

      {/* Hover Image */}

      {secondaryImage && (
        <Image
          src={secondaryImage}
          alt={product.name}
          fill
          sizes="
            (max-width:768px) 50vw,
            (max-width:1200px) 33vw,
            25vw
          "
          className="
            object-cover
            opacity-0
            scale-[1.08]
            transition-all
            duration-700
            ease-out
            group-hover:scale-100
            group-hover:opacity-100
          "
        />
      )}

      {/* Gradient */}

      <div
        className="
          absolute
          inset-x-0
          bottom-0
          h-24
          bg-gradient-to-t
          from-black/20
          via-black/5
          to-transparent
          opacity-0
          transition-all
          duration-500
          group-hover:opacity-100
        "
      />

      {/* Quick View */}

      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();

          openQuickView(product);
        }}
        className="
          absolute
          left-1/2
          bottom-2
          -translate-x-1/2
          translate-y-3
          scale-95
          rounded-full
          bg-white/95
          px-8
          py-3.5
          text-[11px]
          font-medium
          tracking-[0.22em]
          shadow-lg
          backdrop-blur-sm
          opacity-0
          transition-all
          duration-300
          hover:bg-black
          hover:text-white
          group-hover:bottom-6
          group-hover:translate-y-0
          group-hover:scale-100
          group-hover:opacity-100
        "
      >
        QUICK VIEW
      </button>
    </div>
  );
}