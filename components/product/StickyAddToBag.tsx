"use client";

import {
  AnimatePresence,
  motion,
} from "framer-motion";

import { formatPrice } from "@/lib/currency";

type StickyAddToBagProps = {
  visible: boolean;
  name: string;
  price: number;
  compareAtPrice?: number | null;
  onAddToCart: () => void;
  disabled?: boolean;
};

export default function StickyAddToBag({
  visible,
  name,
  price,
  compareAtPrice,
  onAddToCart,
  disabled = false,
}: StickyAddToBagProps) {
  const hasComparePrice =
    typeof compareAtPrice === "number" &&
    compareAtPrice > price;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{
            y: 120,
          }}
          animate={{
            y: 0,
          }}
          exit={{
            y: 120,
          }}
          transition={{
            duration: 0.25,
            ease: "easeOut",
          }}
          className="
            fixed
            bottom-0
            left-0
            right-0
            z-[60]
            border-t
            border-neutral-200
            bg-white/95
            backdrop-blur-xl
            shadow-2xl
            lg:hidden
          "
        >
          <div
            className="
              mx-auto
              flex
              max-w-7xl
              items-center
              justify-between
              gap-4
              px-6
              py-4
            "
          >
            <div className="min-w-0">
              <p
                className="
                  truncate
                  text-sm
                  font-medium
                "
              >
                {name}
              </p>

              <div className="mt-1 flex items-baseline gap-2">
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
                  {formatPrice(price)}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={onAddToCart}
              disabled={disabled}
              className="
                rounded-full
                bg-black
                px-8
                py-3
                text-xs
                uppercase
                tracking-[0.25em]
                text-white
                transition
                hover:bg-neutral-900
                disabled:cursor-not-allowed
                disabled:bg-neutral-200
                disabled:text-neutral-400
              "
            >
              {disabled
                ? "Not Available"
                : "Add to Bag"}
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}