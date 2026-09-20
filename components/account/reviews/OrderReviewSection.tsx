"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";

import {
  getOrderReviewItems,
  type OrderReviewItem,
} from "@/lib/reviews";

import ReviewForm from "./ReviewForm";

type Props = {
  orderId: string;
};

export default function OrderReviewSection({
  orderId,
}: Props) {
  const [items, setItems] = useState<OrderReviewItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [openItemId, setOpenItemId] = useState<string | null>(null);

  const loadItems = useCallback(async () => {
    try {
      const data = await getOrderReviewItems(orderId);

      setItems(data);
    } catch (error) {
      console.error(
        "Failed to load review items:",
        error,
      );

      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      void loadItems();
    }, 0);

    return () => {
      window.clearTimeout(timeout);
    };
  }, [loadItems]);

  if (loading) {
    return null;
  }

  const reviewableItems = items.filter(
    (item) => !item.reviewed,
  );

  if (
    items.length === 0 ||
    reviewableItems.length === 0
  ) {
    return null;
  }

  return (
    <section
      className="
        rounded-2xl
        border
        border-stone-200
        p-6
      "
    >
      <div>
        <h2 className="font-medium">
          Review Your Purchase
        </h2>

        <p className="mt-2 text-sm leading-6 text-neutral-500">
          Share your experience with the products
          you purchased.
        </p>
      </div>

      <div className="mt-6 space-y-4">
        {reviewableItems.map((item) => {
          const isOpen =
            openItemId === item.orderItemId;

          return (
            <div
              key={item.orderItemId}
              className="
                rounded-xl
                border
                border-neutral-200
                p-4
              "
            >
              <div className="flex items-start gap-4">
                <div
                  className="
                    relative
                    h-20
                    w-16
                    shrink-0
                    overflow-hidden
                    rounded-lg
                    bg-neutral-100
                  "
                >
                  {item.image && (
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      sizes="64px"
                      className="
                        object-cover
                      "
                    />
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <p className="font-medium">
                    {item.name}
                  </p>

                  {(item.color || item.size) && (
                    <p className="mt-1 text-sm text-neutral-500">
                      {item.color}

                      {item.color && item.size
                        ? " • "
                        : ""}

                      {item.size}
                    </p>
                  )}

                  <button
                    type="button"
                    onClick={() =>
                      setOpenItemId(
                        isOpen
                          ? null
                          : item.orderItemId,
                      )
                    }
                    className="
                      mt-4
                      text-xs
                      uppercase
                      tracking-[0.2em]
                      underline
                      underline-offset-4
                    "
                  >
                    {isOpen
                      ? "Close"
                      : "Write a Review"}
                  </button>
                </div>
              </div>

              {isOpen && (
                <ReviewForm
                  orderId={orderId}
                  orderItemId={item.orderItemId}
                  productId={item.productId}
                  variantId={item.variantId}
                  productName={item.name}
                  onSuccess={() => {
                    setItems((current) =>
                      current.map(
                        (currentItem) =>
                          currentItem.orderItemId ===
                          item.orderItemId
                            ? {
                                ...currentItem,
                                reviewed: true,
                              }
                            : currentItem,
                      ),
                    );

                    setOpenItemId(null);
                  }}
                />
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}