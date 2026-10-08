"use client";

import Image from "next/image";

import { useCart } from "@/context/CartContext";
import { formatPrice } from "@/lib/currency";

export default function OrderSummary() {
  const { items, subtotal } = useCart();

  return (
    <section className="rounded-2xl border border-neutral-200 bg-white p-6">
      <h2 className="text-xl font-light">
        Order Summary
      </h2>

      {/* Products */}

      <div className="mt-6 space-y-5">
        {items.map((item) => {
          const hasComparePrice =
            typeof item.compareAtPrice === "number" &&
            item.compareAtPrice > item.price;

          const linePrice =
            item.price *
            item.quantity;

          const lineComparePrice =
            hasComparePrice
              ? item.compareAtPrice! *
                item.quantity
              : null;

          return (
            <div
              key={`${item.id}-${item.color}-${item.size}`}
              className="flex gap-4"
            >
              <div className="relative h-20 w-16 overflow-hidden rounded-lg bg-stone-100">
                <Image
                  src={item.image}
                  alt={item.name}
                  fill
                  sizes="64px"
                  className="object-cover"
                />
              </div>

              <div className="flex flex-1 justify-between gap-4">
                <div>
                  <h3 className="text-sm font-medium text-neutral-900">
                    {item.name}
                  </h3>

                  <p className="mt-1 text-xs text-neutral-500">
                    {item.color}
                    {item.color && item.size
                      ? " • "
                      : ""}
                    {item.size}
                  </p>

                  <p className="mt-2 text-xs text-neutral-500">
                    Qty {item.quantity}
                  </p>
                </div>

                <div className="flex flex-col items-end">
                  {lineComparePrice !== null && (
                    <span className="text-xs text-neutral-400 line-through">
                      {formatPrice(
                        lineComparePrice,
                      )}
                    </span>
                  )}

                  <p className="whitespace-nowrap text-sm font-medium text-neutral-900">
                    {formatPrice(
                      linePrice,
                    )}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="my-6 border-t border-neutral-200" />

      {/* Totals */}

      <div className="space-y-3">
        <div className="flex justify-between text-sm">
          <span>Subtotal</span>

          <span>
            {formatPrice(subtotal)}
          </span>
        </div>

        <div className="flex justify-between text-sm">
          <span>Shipping</span>

          <span className="text-neutral-500">
            Calculated at checkout
          </span>
        </div>
      </div>

      <div className="my-6 border-t border-neutral-200" />

      <div className="flex items-center justify-between text-lg font-medium">
        <span>Total</span>

        <span>
          {formatPrice(subtotal)}
        </span>
      </div>
    </section>
  );
}