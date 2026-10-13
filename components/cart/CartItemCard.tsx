"use client";

import Image from "next/image";
import { Trash2 } from "lucide-react";

import { formatPrice } from "@/lib/currency";
import { type CartItem } from "@/lib/cart";
import type { ProductBadge } from "@/lib/product-badges";
import { getDisplayProductBadges } from "@/lib/custom-product-badge";

import { useCart } from "@/context/CartContext";

type Props = {
  item: CartItem;
  customBadge?: string | null;
  badges?: ProductBadge[];
};

export default function CartItemCard({
  item,
  customBadge,
  badges = [],
}: Props) {
  const displayBadges = getDisplayProductBadges(customBadge, badges);
  const {
    updateQuantity,
    removeItem,
  } = useCart();

  const hasStockLimit =
    typeof item.stock === "number";

  const reachedStockLimit =
    hasStockLimit &&
    item.quantity >=
      (item.stock ?? 0);

  const hasComparePrice =
    typeof item.compareAtPrice ===
      "number" &&
    item.compareAtPrice >
      item.price;

  const linePrice =
    item.price *
    item.quantity;

  const lineComparePrice =
    hasComparePrice
      ? item.compareAtPrice! *
        item.quantity
      : null;

  return (
    <div className="flex gap-4 border-b pb-6">
      <div className="relative h-28 w-20 overflow-hidden rounded-xl bg-stone-100">
        <Image
          src={item.image}
          alt={item.name}
          fill
          sizes="80px"
          className="object-cover"
        />
      </div>

      <div className="flex flex-1 flex-col">
        <h3 className="font-medium text-neutral-900">
          {item.name}
        </h3>
        {(displayBadges.custom || displayBadges.automatic.length > 0) && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {displayBadges.custom && <span className="inline-flex rounded-full border border-neutral-900/10 bg-neutral-900 px-2.5 py-1 text-[9px] font-medium uppercase tracking-[0.12em] text-white">{displayBadges.custom}</span>}
            {displayBadges.automatic.map((badge) => <span key={badge.type} className="inline-flex rounded-full border border-stone-300 bg-white px-2.5 py-1 text-[9px] font-medium uppercase tracking-[0.12em] text-neutral-700">{badge.label}</span>)}
          </div>
        )}

        <p className="mt-1 text-sm text-neutral-500">
          {item.color}

          {item.color && item.size
            ? " • "
            : ""}

          {item.size}
        </p>

        <div className="mt-4 flex items-center gap-3">
          {/* DECREASE */}

          <button
            type="button"
            disabled={
              item.quantity === 1
            }
            onClick={() =>
              updateQuantity(
                item.id,
                item.color,
                item.size,
                item.quantity - 1,
              )
            }
            className="
              flex
              h-8
              w-8
              items-center
              justify-center
              rounded-full
              border
              disabled:opacity-30
            "
          >
            −
          </button>

          {/* QUANTITY */}

          <span>
            {item.quantity}
          </span>

          {/* INCREASE */}

          <button
            type="button"
            disabled={
              reachedStockLimit
            }
            aria-label={
              reachedStockLimit
                ? "Maximum available stock reached"
                : "Increase quantity"
            }
            onClick={() =>
              updateQuantity(
                item.id,
                item.color,
                item.size,
                item.quantity + 1,
              )
            }
            className="
              flex
              h-8
              w-8
              items-center
              justify-center
              rounded-full
              border
              disabled:cursor-not-allowed
              disabled:opacity-30
            "
          >
            +
          </button>
        </div>

        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-baseline gap-2">
            {lineComparePrice !== null && (
              <span className="text-sm text-neutral-400 line-through">
                {formatPrice(
                  lineComparePrice,
                )}
              </span>
            )}

            <p className="font-medium text-neutral-900">
              {formatPrice(linePrice)}
            </p>
          </div>

          <button
            type="button"
            aria-label="Remove item"
            onClick={() =>
              removeItem(
                item.id,
                item.color,
                item.size,
              )
            }
            className="
              rounded-full
              p-2
              text-neutral-500
              transition
              hover:bg-red-50
              hover:text-red-500
            "
          >
            <Trash2 size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}