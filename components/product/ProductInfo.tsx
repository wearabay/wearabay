"use client";

import {
  useState,
  useRef,
  useEffect,
} from "react";

import StickyAddToBag from "./StickyAddToBag";

import type { Product } from "@/types/product";
import type { ProductBadge } from "@/lib/product-badges";

import { formatPrice } from "@/lib/currency";

import Badge from "@/components/ui/Badge";
import Divider from "@/components/ui/Divider";

import ProductVariant from "./variants/ProductVariant";

import { addToCart } from "@/lib/cart";

import { useAuthUser } from "@/hooks/useAuthUser";

type ProductInfoProps = {
  product: Product;
  badges: ProductBadge[];
  selectedColor: string;
  onColorChange: (color: string) => void;
};

export default function ProductInfo({
  product,
  badges,
  selectedColor,
  onColorChange,
}: ProductInfoProps) {
  const {
    user,
    loading: authLoading,
  } = useAuthUser();

  const sizes =
    product.sizes ?? [];

  const variants =
    product.variants ?? [];

  const [
    selectedSize,
    setSelectedSize,
  ] = useState(
    sizes[0] ?? "",
  );

  const [
    quantity,
    setQuantity,
  ] = useState(1);

  const addToBagRef =
    useRef<HTMLButtonElement>(null);

  const [
    showSticky,
    setShowSticky,
  ] = useState(false);

  const [
    adding,
    setAdding,
  ] = useState(false);

  /*
   * Selected variant
   */

  const selectedVariant =
    variants.find(
      (variant) =>
        variant.color === selectedColor &&
        variant.size === selectedSize,
    ) ?? null;

  const selectedVariantStock =
    selectedVariant?.stock ?? 0;

  const selectedVariantPrice =
    selectedVariant?.price ??
    product.price;

  /*
   * Selected color image
   */

  const selectedColorImage =
    product.mediaByColor?.[
      selectedColor
    ]?.[0] ??
    product.image;

  /*
   * Purchasable state
   */

  const hasActiveVariant =
    variants.length > 0;

  const hasSelectedVariant =
    selectedVariant !== null;

  const hasStock =
    selectedVariantStock > 0;

  const canAddToCart =
    hasActiveVariant &&
    hasSelectedVariant &&
    hasStock;

  /*
   * Color change
   */

  const handleColorChange =
    (color: string) => {
      onColorChange(color);

      const currentCombinationExists =
        variants.some(
          (variant) =>
            variant.color === color &&
            variant.size === selectedSize,
        );

      if (
        currentCombinationExists
      ) {
        setQuantity(1);
        return;
      }

      const firstAvailableVariant =
        variants.find(
          (variant) =>
            variant.color === color &&
            variant.stock > 0,
        );

      const firstVariantForColor =
        variants.find(
          (variant) =>
            variant.color === color,
        );

      const nextVariant =
        firstAvailableVariant ??
        firstVariantForColor;

      if (nextVariant) {
        setSelectedSize(
          nextVariant.size,
        );
      } else {
        setSelectedSize("");
      }

      setQuantity(1);
    };

  /*
   * Size change
   */

  const handleSizeChange =
    (size: string) => {
      const combinationExists =
        variants.some(
          (variant) =>
            variant.color === selectedColor &&
            variant.size === size,
        );

      if (
        combinationExists
      ) {
        setSelectedSize(size);
        setQuantity(1);
      }
    };

  /*
   * Quantity
   */

  const increaseQuantity = () => {
    if (
      quantity <
      selectedVariantStock
    ) {
      setQuantity(
        (prev) =>
          prev + 1,
      );
    }
  };

  const decreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity(
        (prev) =>
          prev - 1,
      );
    }
  };

  /*
   * Add To Bag
   */

  const handleAddToCart =
    async () => {
      if (
        !canAddToCart ||
        adding ||
        authLoading ||
        !selectedVariant
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
            image:
              selectedColorImage,
            quantity,
            color:
              selectedVariant.color,
            size:
              selectedVariant.size,
          },
          user?.id,
        );

        window.dispatchEvent(
          new Event(
            "cart-open",
          ),
        );
      } catch (error) {
        console.error(
          "Failed to add product to cart:",
          error,
        );
      } finally {
        setAdding(false);
      }
    };

  /*
   * Sticky Add To Bag
   */

  useEffect(() => {
    if (
      !addToBagRef.current
    ) {
      return;
    }

    const observer =
      new IntersectionObserver(
        ([entry]) => {
          setShowSticky(
            !entry.isIntersecting,
          );
        },
        {
          threshold: 0.1,
        },
      );

    observer.observe(
      addToBagRef.current,
    );

    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <div>
      {/* Category */}

      <p
        className="
          text-sm
          uppercase
          tracking-[0.3em]
          text-gray-500
        "
      >
        {product.category}
      </p>

      {/* Automatic Badges */}

      {badges.length > 0 && (
        <div
          className="
            mt-4
            flex
            flex-wrap
            gap-2
          "
        >
          {badges
            .slice(0, 2)
            .map((badge) => (
              <Badge
                key={
                  badge.type
                }
              >
                {badge.label}
              </Badge>
            ))}
        </div>
      )}

      {/* Title */}

      <h1
        className="
          mt-4
          text-5xl
          font-light
        "
      >
        {product.name}
      </h1>

      {/* Price */}

      <p
        className="
          mt-6
          text-2xl
        "
      >
        {formatPrice(
          selectedVariantPrice,
        )}
      </p>

      <Divider
        className="
          my-10
        "
      />

      {/* Description */}

      <p
        className="
          leading-8
          text-gray-600
        "
      >
        {product.description}
      </p>

      {/* Features */}

      <div
        className="
          mt-10
          space-y-3
          text-sm
          text-neutral-600
        "
      >
        {product.features.map(
          (feature) => (
            <p
              key={feature}
            >
              ✓ {feature}
            </p>
          ),
        )}
      </div>

      {/* Variant */}

      <ProductVariant
        addToBagRef={
          addToBagRef
        }
        product={
          product
        }
        selectedColor={
          selectedColor
        }
        onColorChange={
          handleColorChange
        }
        selectedSize={
          selectedSize
        }
        onSizeChange={
          handleSizeChange
        }
        quantity={
          quantity
        }
        onIncrease={
          increaseQuantity
        }
        onDecrease={
          decreaseQuantity
        }
        onAddToCart={
          handleAddToCart
        }
      />

      {/* Sticky Add To Bag */}

      <StickyAddToBag
        visible={
          showSticky
        }
        name={
          product.name
        }
        price={
          selectedVariantPrice
        }
        onAddToCart={
          handleAddToCart
        }
        disabled={
          !canAddToCart ||
          adding ||
          authLoading
        }
      />
    </div>
  );
}