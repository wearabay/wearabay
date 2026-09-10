"use client";

import type { Product } from "@/types/product";
import { RefObject } from "react";

import ColorSelector from "./ColorSelector";
import SizeSelector from "./SizeSelector";
import QuantitySelector from "./QuantitySelector";
import StockStatus from "./StockStatus";


type ProductVariantProps = {
  product: Product;

  selectedColor: string;
  onColorChange: (value: string) => void;

  selectedSize: string;
  onSizeChange: (value: string) => void;

  quantity: number;
  onIncrease: () => void;
  onDecrease: () => void;

  onAddToCart: () => void;

  addToBagRef?: RefObject<HTMLButtonElement | null>;
};


export default function ProductVariant({
  product,
  selectedColor,
  onColorChange,
  selectedSize,
  onSizeChange,
  quantity,
  onIncrease,
  onDecrease,
  onAddToCart,
  addToBagRef,
}: ProductVariantProps) {

  const colors =
    product.colors ?? [];

  const sizes =
    product.sizes ?? [];

  const stock =
    product.stock ?? 0;


  /*
   * A product is purchasable only when:
   *
   * - it has an active color option
   * - it has an active size option
   * - it has stock available
   * - a color and size are selected
   */

  const hasActiveVariant =
    colors.length > 0 &&
    sizes.length > 0;

  const hasStock =
    stock > 0;

  const hasValidSelection =
    selectedColor.trim().length > 0 &&
    selectedSize.trim().length > 0;

  const canAddToCart =
    hasActiveVariant &&
    hasStock &&
    hasValidSelection;


  return (

    <div
      className="
        mt-10
        mb-6
        space-y-6
      "
    >

      {/* COLOR */}

      {colors.length > 0 && (

        <ColorSelector
          colors={colors}
          selected={selectedColor}
          onChange={onColorChange}
        />

      )}


      {/* SIZE */}

      {sizes.length > 0 && (

        <SizeSelector
          sizes={sizes}
          selected={selectedSize}
          onChange={onSizeChange}
        />

      )}


      {/* NO VARIANT */}

      {!hasActiveVariant && (

        <div
          className="
            rounded-xl
            border
            border-neutral-200
            bg-neutral-50
            px-5
            py-4
            text-sm
            text-neutral-500
          "
        >
          This product is currently unavailable.
        </div>

      )}


      {/* QTY */}

      {hasStock && (

        <QuantitySelector
          quantity={quantity}
          stock={stock}
          onIncrease={onIncrease}
          onDecrease={onDecrease}
        />

      )}


      {/* STOCK */}

      {hasStock && (

        <StockStatus
          stock={stock}
        />

      )}


      {/* ADD TO BAG */}

      <div
        className="
          mt-10
          space-y-4
        "
      >

        <button
          ref={addToBagRef}
          type="button"
          onClick={onAddToCart}
          disabled={!canAddToCart}
          className="
            h-14
            w-full
            rounded-full
            bg-black
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
          {canAddToCart
            ? "Add to Bag"
            : "Not Available"}
        </button>

      </div>

    </div>

  );
}