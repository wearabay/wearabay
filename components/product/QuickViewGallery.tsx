"use client";

import Image from "next/image";
import {
  useEffect,
  useRef,
  useState,
} from "react";
import {
  ChevronDown,
  ChevronRight,
} from "lucide-react";

import type { Product } from "@/types/product";

type Props = {
  product: Product;
  selectedColor: string;
};

export default function QuickViewGallery({
  product,
  selectedColor,
}: Props) {
  const thumbnailRef =
    useRef<HTMLDivElement>(null);

  const colorImages =
    product.mediaByColor?.[selectedColor];

  const images =
    colorImages?.length
      ? colorImages
      : product.images?.length
        ? product.images
        : [product.image];

  const [active, setActive] =
    useState(0);

  const [hasMoreBelow, setHasMoreBelow] =
    useState(false);

  /*
   * Reset thumbnail scroll whenever
   * the selected color/media set changes.
   *
   * The active image itself is reset
   * through the component key in
   * QuickViewModal.
   */
  useEffect(() => {
    const container =
      thumbnailRef.current;

    if (!container) {
      return;
    }

    container.scrollTop = 0;

    const updateScrollAffordance = () => {
      const isScrollable =
        container.scrollHeight >
        container.clientHeight + 1;

      const hasScrolledToBottom =
        container.scrollTop +
          container.clientHeight >=
        container.scrollHeight - 2;

      setHasMoreBelow(
        isScrollable &&
          !hasScrolledToBottom,
      );
    };

    const frame =
      window.requestAnimationFrame(
        updateScrollAffordance,
      );

    container.addEventListener(
      "scroll",
      updateScrollAffordance,
      { passive: true },
    );

    return () => {
      window.cancelAnimationFrame(
        frame,
      );

      container.removeEventListener(
        "scroll",
        updateScrollAffordance,
      );
    };
  }, [
    selectedColor,
    images.length,
  ]);

  const hasScrollableThumbnails =
    images.length > 4;

  const handleThumbnailClick = (
    index: number,
  ) => {
    setActive(index);
  };

  return (
    <div className="flex flex-col gap-4 lg:flex-row">
      {/* Thumbnails */}

      <div
        className={`
          relative
          order-2
          lg:order-1
          ${
            hasScrollableThumbnails
              ? "lg:h-[356px] lg:max-h-[356px]"
              : ""
          }
        `}
      >
        <div
          ref={thumbnailRef}
          className={`
            flex
            max-w-full
            gap-3
            pb-1
            [scrollbar-width:none]
            [&::-webkit-scrollbar]:hidden

            lg:w-16
            lg:flex-col
            lg:pb-0

            ${
              hasScrollableThumbnails
                ? `
                  lg:h-full
                  lg:max-h-full
                  lg:overflow-y-auto
                  lg:overflow-x-hidden
                `
                : `
                  lg:h-auto
                  lg:overflow-visible
                `
            }

            overflow-x-auto
          `}
        >
          {images.map(
            (image, index) => (
              <button
                key={`${image}-${index}`}
                type="button"
                onClick={() =>
                  handleThumbnailClick(
                    index,
                  )
                }
                aria-label={`View image ${
                  index + 1
                }`}
                aria-current={
                  active === index
                    ? "true"
                    : undefined
                }
                className={`
                  relative
                  h-20
                  w-16
                  shrink-0
                  overflow-hidden
                  rounded-lg
                  border
                  transition
                  ${
                    active === index
                      ? "border-black"
                      : "border-stone-200"
                  }
                `}
              >
                <Image
                  src={image}
                  alt={`${product.name} image ${
                    index + 1
                  }`}
                  fill
                  sizes="64px"
                  className="object-cover"
                />
              </button>
            ),
          )}
        </div>

        {/* Desktop scroll affordance */}

        {hasScrollableThumbnails &&
          hasMoreBelow && (
            <div
              className="
                pointer-events-none
                absolute
                bottom-0
                left-0
                right-0
                z-10
                hidden
                h-16
                items-end
                justify-center
                rounded-b-lg
                bg-gradient-to-t
                from-white
                via-white/80
                to-transparent
                pb-1
                lg:flex
              "
            >
              <ChevronDown
                size={18}
                strokeWidth={1.5}
                className="text-neutral-500"
              />
            </div>
          )}

        {/* Mobile scroll affordance */}

        {hasScrollableThumbnails &&
          hasMoreBelow && (
            <div
              className="
                pointer-events-none
                absolute
                bottom-0
                right-0
                top-0
                flex
                w-12
                items-center
                justify-end
                rounded-r-lg
                bg-gradient-to-l
                from-white
                via-white/80
                to-transparent
                pr-1
                lg:hidden
              "
            >
              <ChevronRight
                size={18}
                strokeWidth={1.5}
                className="text-neutral-500"
              />
            </div>
          )}
      </div>

      {/* Main Image */}

      <div
        className="
          relative
          order-1
          aspect-[3/4]
          flex-1
          overflow-hidden
          rounded-2xl
          bg-stone-100
          lg:order-2
        "
      >
        <Image
          src={
            images[active] ??
            product.image
          }
          alt={product.name}
          fill
          sizes="
            (max-width:1024px)
            100vw,
            calc(100vw - 160px)
          "
          className="
            object-cover
            transition
            duration-500
            hover:scale-105
          "
        />
      </div>
    </div>
  );
}