"use client";

import Image from "next/image";
import { Trash2 } from "lucide-react";

import { formatPrice } from "@/lib/currency";
import { type CartItem } from "@/lib/cart";

import { useCart } from "@/context/CartContext";

type Props = {
  item: CartItem;
};

export default function CartItemCard({
  item,
}: Props) {
  const {
    updateQuantity,
    removeItem,
  } = useCart();

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

        <p className="mt-1 text-sm text-neutral-500">
          {item.color}
          {item.color && item.size ? " • " : ""}
          {item.size}
        </p>

        <div className="mt-4 flex items-center gap-3">
          <button
            disabled={item.quantity === 1}
            onClick={() =>
              updateQuantity(
                item.id,
                item.color,
                item.size,
                item.quantity - 1
              )
            }
            className="flex h-8 w-8 items-center justify-center rounded-full border disabled:opacity-30"
          >
            −
          </button>

          <span>{item.quantity}</span>

          <button
            onClick={() =>
              updateQuantity(
                item.id,
                item.color,
                item.size,
                item.quantity + 1
              )
            }
            className="flex h-8 w-8 items-center justify-center rounded-full border"
          >
            +
          </button>
        </div>

        <div className="mt-4 flex items-center justify-between">
          <p className="font-medium">
            {formatPrice(item.price * item.quantity)}
          </p>

          <button
            aria-label="Remove item"
            onClick={() =>
              removeItem(
                item.id,
                item.color,
                item.size
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