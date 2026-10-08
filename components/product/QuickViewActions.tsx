"use client";

import {
  useMemo,
  useState,
} from "react";

import Link from "next/link";

import type { Product } from "@/types/product";

import {
  addToCart,
} from "@/lib/cart";

import {
  closeQuickView,
} from "@/lib/quick-view";

import {
  openCartWithBanner,
} from "@/lib/cart-drawer";

import {
  useAuthUser,
} from "@/hooks/useAuthUser";

type Props = {
  product: Product;
  selectedColor: string;
  onColorChange: (
    color: string,
  ) => void;
};

export default function QuickViewActions({
  product,
  selectedColor,
  onColorChange,
}: Props) {
  const {
    user,
    loading: authLoading,
  } = useAuthUser();

  const variants = useMemo(
    () => product.variants ?? [],
    [product.variants],
  );

  const hasVariants =
    variants.length > 0;

  const availableColors = useMemo(
    () =>
      Array.from(
        new Set(
          variants
            .filter(
              (variant) =>
                variant.stock > 0,
            )
            .map(
              (variant) =>
                variant.color,
            ),
        ),
      ),
    [variants],
  );

  const color =
    selectedColor ||
    availableColors[0] ||
    product.colors?.[0] ||
    "";

  const availableSizes = useMemo(
    () =>
      Array.from(
        new Set(
          variants
            .filter(
              (variant) =>
                variant.color ===
                  color &&
                variant.stock > 0,
            )
            .map(
              (variant) =>
                variant.size,
            ),
        ),
      ),
    [variants, color],
  );

  const initialSize =
    availableSizes[0] ??
    product.sizes?.[0] ??
    "";

  const [
    size,
    setSize,
  ] = useState(
    initialSize,
  );

  const selectedVariant = useMemo(
    () =>
      variants.find(
        (variant) =>
          variant.color ===
            color &&
          variant.size ===
            size,
      ) ?? null,
    [variants, color, size],
  );

  const selectedVariantStock =
    selectedVariant?.stock ?? 0;

  const hasValidVariant =
    Boolean(
      selectedVariant &&
        selectedVariantStock > 0,
    );

  const [
    qty,
    setQty,
  ] = useState(1);

  const [
    adding,
    setAdding,
  ] = useState(false);

  const handleColorChange = (
    nextColor: string,
  ) => {
    onColorChange(nextColor);

    const nextAvailableSizes =
      Array.from(
        new Set(
          variants
            .filter(
              (variant) =>
                variant.color ===
                  nextColor &&
                variant.stock > 0,
            )
            .map(
              (variant) =>
                variant.size,
            ),
        ),
      );

    const nextSize =
      nextAvailableSizes.includes(
        size,
      )
        ? size
        : nextAvailableSizes[0] ??
          "";

    setSize(nextSize);
    setQty(1);
  };

  const handleSizeChange = (
    nextSize: string,
  ) => {
    setSize(nextSize);
    setQty(1);
  };

  const handleIncreaseQuantity =
    () => {
      if (
        !hasVariants ||
        !selectedVariant
      ) {
        return;
      }

      setQty(
        (currentQty) =>
          Math.min(
            currentQty + 1,
            selectedVariantStock,
          ),
      );
    };

  const handleAddToCart =
    async (
      event: React.MouseEvent<HTMLButtonElement>,
    ) => {
      event.preventDefault();
      event.stopPropagation();

      if (
        authLoading ||
        adding ||
        !selectedVariant ||
        selectedVariantStock <= 0
      ) {
        return;
      }

      setAdding(true);

      try {
        await addToCart(
          {
            id: product.id,
            name: product.name,
            price:
              selectedVariant.price,
            compareAtPrice:
              selectedVariant.compareAtPrice,
            image: product.image,
            quantity: Math.min(
              qty,
              selectedVariantStock,
            ),
            color:
              selectedVariant.color,
            size:
              selectedVariant.size,
          },
          user?.id,
        );

        closeQuickView();
        openCartWithBanner();
      } catch (error) {
        console.error(
          "Failed to add product to cart:",
          error,
        );
      } finally {
        setAdding(false);
      }
    };

  const specifications =
    product.specifications?.filter(
      (spec) =>
        spec.label?.trim() &&
        spec.value?.trim(),
    ) ?? [];

  return (
    <div
      className="
        mt-10
        space-y-8
      "
    >
      {/* Color */}

      {product.colors?.length > 0 && (
        <div>
          <p
            className="
              mb-4
              text-xs
              uppercase
              tracking-[0.2em]
              text-neutral-500
            "
          >
            Color
          </p>

          <div
            className="
              flex
              flex-wrap
              gap-3
            "
          >
            {product.colors.map(
              (item) => {
                const isAvailable =
                  availableColors.includes(
                    item,
                  );

                return (
                  <button
                    type="button"
                    key={item}
                    disabled={
                      hasVariants &&
                      !isAvailable
                    }
                    onClick={() =>
                      handleColorChange(
                        item,
                      )
                    }
                    className={`
                      rounded-full
                      border
                      px-5
                      py-2
                      text-sm
                      transition
                      ${
                        color === item
                          ? "border-black bg-black text-white"
                          : isAvailable ||
                              !hasVariants
                            ? "border-stone-300 text-neutral-700 hover:border-black"
                            : "cursor-not-allowed border-stone-200 text-neutral-300 opacity-50"
                      }
                    `}
                  >
                    {item}
                  </button>
                );
              },
            )}
          </div>
        </div>
      )}

      {/* Size */}

      {product.sizes?.length > 0 && (
        <div>
          <p
            className="
              mb-4
              text-xs
              uppercase
              tracking-[0.2em]
              text-neutral-500
            "
          >
            Size
          </p>

          <div
            className="
              flex
              flex-wrap
              gap-3
            "
          >
            {product.sizes.map(
              (item) => {
                const isAvailable =
                  !hasVariants ||
                  availableSizes.includes(
                    item,
                  );

                return (
                  <button
                    type="button"
                    key={item}
                    disabled={
                      hasVariants &&
                      !isAvailable
                    }
                    onClick={() =>
                      handleSizeChange(
                        item,
                      )
                    }
                    className={`
                      h-11
                      min-w-[48px]
                      rounded-full
                      border
                      px-4
                      transition
                      ${
                        size === item
                          ? "border-black bg-black text-white"
                          : isAvailable
                            ? "border-stone-300 text-neutral-700 hover:border-black"
                            : "cursor-not-allowed border-stone-200 text-neutral-300 opacity-50"
                      }
                    `}
                  >
                    {item}
                  </button>
                );
              },
            )}
          </div>
        </div>
      )}

      {/* Quantity */}

      <div>
        <p
          className="
            mb-4
            text-xs
            uppercase
            tracking-[0.2em]
            text-neutral-500
          "
        >
          Quantity
        </p>

        <div
          className="
            flex
            w-fit
            items-center
            rounded-full
            border
            border-stone-300
          "
        >
          <button
            type="button"
            onClick={() =>
              setQty(
                (currentQty) =>
                  Math.max(
                    1,
                    currentQty - 1,
                  ),
              )
            }
            disabled={qty <= 1}
            className="
              h-11
              w-11
              text-neutral-700
              transition
              hover:bg-stone-100
              disabled:cursor-not-allowed
              disabled:opacity-40
            "
          >
            −
          </button>

          <span
            className="
              w-12
              text-center
              text-neutral-700
            "
          >
            {qty}
          </span>

          <button
            type="button"
            onClick={
              handleIncreaseQuantity
            }
            disabled={
              hasVariants &&
              (
                !selectedVariant ||
                qty >=
                  selectedVariantStock
              )
            }
            className="
              h-11
              w-11
              text-neutral-700
              transition
              hover:bg-stone-100
              disabled:cursor-not-allowed
              disabled:opacity-40
            "
          >
            +
          </button>
        </div>
      </div>

      {/* Buttons */}

      <div
        className="
          space-y-3
          pt-2
        "
      >
        <button
          type="button"
          onClick={
            handleAddToCart
          }
          disabled={
            adding ||
            authLoading ||
            (hasVariants &&
              !hasValidVariant)
          }
          className="
            w-full
            rounded-full
            bg-black
            py-4
            text-xs
            uppercase
            tracking-[0.22em]
            text-white
            transition
            hover:bg-neutral-900
            disabled:cursor-not-allowed
            disabled:opacity-60
          "
        >
          {authLoading
            ? "Loading..."
            : adding
              ? "Adding..."
              : hasVariants &&
                  !hasValidVariant
                ? "Select Option"
                : "Add To Bag"}
        </button>

        <Link
          href={`/shop/${product.slug}`}
          className="
            block
            w-full
            rounded-full
            border
            border-stone-300
            py-4
            text-center
            text-xs
            uppercase
            tracking-[0.22em]
            text-neutral-700
            transition
            hover:border-black
          "
        >
          View Full Details
        </Link>

        {/* Specifications */}

        {specifications.length > 0 && (
          <div
            className="
              border-t
              pt-8
            "
          >
            <p
              className="
                mb-5
                text-xs
                font-medium
                uppercase
                tracking-[0.22em]
                text-neutral-700
              "
            >
              Specifications
            </p>

            <div
              className="
                space-y-4
              "
            >
              {specifications.map(
                (spec) => (
                  <div
                    key={spec.label}
                    className="
                      flex
                      justify-between
                      gap-6
                      text-sm
                    "
                  >
                    <span
                      className="
                        text-neutral-500
                      "
                    >
                      {spec.label}
                    </span>

                    <span
                      className="
                        text-right
                        font-medium
                        text-neutral-900
                      "
                    >
                      {spec.value}
                    </span>
                  </div>
                ),
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}