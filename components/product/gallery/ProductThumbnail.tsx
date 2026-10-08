"use client";

import Image from "next/image";
import {
  useEffect,
  useRef,
  useState,
} from "react";

type ProductThumbnailProps = {
  images: string[];
  activeImage: string;
  onSelect: (image: string) => void;
};

const MAX_VISIBLE_THUMBNAILS = 4;

export default function ProductThumbnail({
  images,
  activeImage,
  onSelect,
}: ProductThumbnailProps) {
  const containerRef =
    useRef<HTMLDivElement | null>(null);

  const [isAtBottom, setIsAtBottom] =
    useState(
      images.length <= MAX_VISIBLE_THUMBNAILS,
    );

  const hasOverflow =
    images.length > MAX_VISIBLE_THUMBNAILS;

  useEffect(() => {
    const container =
      containerRef.current;

    if (!container) {
      return;
    }

    container.scrollTop = 0;
    setIsAtBottom(
      images.length <=
        MAX_VISIBLE_THUMBNAILS,
    );
  }, [images]);

  const handleScroll = () => {
    const container =
      containerRef.current;

    if (!container) {
      return;
    }

    const reachedBottom =
      container.scrollTop +
        container.clientHeight >=
      container.scrollHeight - 4;

    setIsAtBottom(reachedBottom);
  };

  return (
    <div className="relative">
      {/* Thumbnail viewport */}

      <div
        ref={containerRef}
        onScroll={handleScroll}
        className="
          flex
          max-h-[528px]
          flex-col
          gap-4
          overflow-y-auto
          overscroll-contain
          scrollbar-thin
          scrollbar-track-transparent
          scrollbar-thumb-neutral-300
          pr-1
        "
      >
        {images.map((image, index) => (
          <button
            key={`${image}-${index}`}
            type="button"
            aria-label={`Select product image ${
              index + 1
            }`}
            onClick={() =>
              onSelect(image)
            }
            className={`
              relative
              aspect-[3/4]
              w-[90px]
              shrink-0
              overflow-hidden
              rounded-sm
              border
              transition-all
              duration-300
              hover:scale-[1.02]
              focus-visible:outline-none
              focus-visible:ring-2
              focus-visible:ring-black
              ${
                activeImage === image
                  ? "border-black ring-1 ring-black"
                  : "border-neutral-200 hover:border-neutral-500"
              }
            `}
          >
            <Image
              src={image}
              alt=""
              fill
              sizes="90px"
              className={`
                object-cover
                transition-opacity
                duration-300
                ${
                  activeImage === image
                    ? "opacity-100"
                    : "opacity-70 hover:opacity-100"
                }
              `}
            />
          </button>
        ))}
      </div>

      {/* Scroll affordance */}

      {hasOverflow && !isAtBottom && (
        <div
          aria-hidden="true"
          className="
            pointer-events-none
            absolute
            inset-x-0
            bottom-0
            z-10
            flex
            h-24
            items-end
            justify-center
            bg-gradient-to-t
            from-white
            via-white/80
            to-transparent
            pb-2
          "
        >
          <span
            className="
              flex
              h-8
              w-8
              items-center
              justify-center
              rounded-full
              bg-white/90
              text-neutral-700
              shadow-sm
              ring-1
              ring-neutral-200
            "
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m6 9 6 6 6-6" />
            </svg>
          </span>
        </div>
      )}
    </div>
  );
}