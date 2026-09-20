"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import Image from "next/image";

import ProductImage from "./ProductImage";
import ProductThumbnail from "./ProductThumbnail";
import GalleryNavigation from "./GalleryNavigation";
import ProductLightbox from "./ProductLightbox";


type ProductGalleryProps = {
  images: string[];
  name: string;
};


export default function ProductGallery({
  images,
  name,
}: ProductGalleryProps) {

  /*
   * Only keep valid image URLs.
   *
   * Products are allowed to exist without media,
   * so the gallery must handle an empty image list safely.
   */

  const validImages = useMemo(
    () =>
      images.filter(
        (image) =>
          typeof image === "string" &&
          image.trim().length > 0
      ),
    [images]
  );


  const [currentIndex, setCurrentIndex] =
    useState(0);

  const [lightboxOpen, setLightboxOpen] =
    useState(false);

  const [touchStart, setTouchStart] =
    useState<number | null>(null);

  const [touchEnd, setTouchEnd] =
    useState<number | null>(null);


  /*
   * Keep the selected index valid without
   * synchronously updating state from an effect.
   *
   * When the image collection becomes shorter,
   * the displayed index falls back to 0.
   */

  const safeCurrentIndex =
    validImages.length === 0
      ? 0
      : currentIndex < validImages.length
        ? currentIndex
        : 0;


  const activeImage =
    validImages.length > 0
      ? validImages[safeCurrentIndex]
      : null;


  const nextIndex =
    validImages.length > 0
      ? safeCurrentIndex === validImages.length - 1
        ? 0
        : safeCurrentIndex + 1
      : 0;


  const previousIndex =
    validImages.length > 0
      ? safeCurrentIndex === 0
        ? validImages.length - 1
        : safeCurrentIndex - 1
      : 0;


  const handlePrevious = useCallback(() => {

    if (
      validImages.length <= 1
    ) {
      return;
    }

    setCurrentIndex(
      (prev) =>
        prev >= validImages.length
          ? validImages.length - 1
          : prev === 0
            ? validImages.length - 1
            : prev - 1
    );

  }, [
    validImages.length,
  ]);


  const handleNext = useCallback(() => {

    if (
      validImages.length <= 1
    ) {
      return;
    }

    setCurrentIndex(
      (prev) =>
        prev >= validImages.length - 1
          ? 0
          : prev + 1
    );

  }, [
    validImages.length,
  ]);


  // Keyboard Navigation

  useEffect(() => {

    if (!lightboxOpen) {
      return;
    }

    const handleKeyDown = (
      event: KeyboardEvent
    ) => {

      if (event.key === "Escape") {
        setLightboxOpen(false);
      }

      if (event.key === "ArrowLeft") {
        handlePrevious();
      }

      if (event.key === "ArrowRight") {
        handleNext();
      }

    };


    window.addEventListener(
      "keydown",
      handleKeyDown
    );


    return () =>
      window.removeEventListener(
        "keydown",
        handleKeyDown
      );

  }, [
    lightboxOpen,
    handleNext,
    handlePrevious,
  ]);


  // Swipe

  const minSwipeDistance = 50;


  function onTouchStart(
    e: React.TouchEvent
  ) {

    setTouchEnd(null);

    setTouchStart(
      e.targetTouches[0].clientX
    );

  }


  function onTouchMove(
    e: React.TouchEvent
  ) {

    setTouchEnd(
      e.targetTouches[0].clientX
    );

  }


  function onTouchEnd() {

    if (
      touchStart === null ||
      touchEnd === null
    ) {
      return;
    }


    const distance =
      touchStart - touchEnd;


    if (
      distance > minSwipeDistance
    ) {
      handleNext();
    }


    if (
      distance < -minSwipeDistance
    ) {
      handlePrevious();
    }

  }


  /*
   * Empty gallery state.
   *
   * Do not render ProductImage, ProductThumbnail,
   * navigation, lightbox, or preload images when
   * the product has no media.
   */

  if (
    validImages.length === 0
  ) {

    return (

      <div
        className="
          relative
          aspect-[3/4]
          overflow-hidden
          rounded-sm
          bg-[#ECE8E2]
        "
      >

        <div
          className="
            absolute
            inset-0
            flex
            items-center
            justify-center
          "
        >

          <span
            className="
              text-[10px]
              font-medium
              tracking-[0.2em]
              text-neutral-400
            "
          >
            NO IMAGE
          </span>

        </div>

      </div>

    );

  }


  return (

    <div
      className="
        grid
        gap-6
        lg:grid-cols-[90px_1fr]
      "
    >

      {/* Desktop Thumbnail */}

      <div
        className="
          hidden
          lg:block
        "
      >

        <ProductThumbnail
          images={validImages}
          activeImage={activeImage!}
          onSelect={(image) =>
            setCurrentIndex(
              validImages.indexOf(image)
            )
          }
        />

      </div>


      {/* Main Image */}

      <div
        className="relative"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >

        <ProductImage
          key={activeImage}
          src={activeImage!}
          alt={name}
          onClick={() =>
            setLightboxOpen(true)
          }
        />


        {/* Desktop Navigation */}

        {validImages.length > 1 && (

          <div
            className="
              hidden
              xl:block
            "
          >

            <GalleryNavigation
              onPrevious={handlePrevious}
              onNext={handleNext}
            />

          </div>

        )}


        {/* Mobile Indicator */}

        {validImages.length > 1 && (

          <div
            className="
              mt-5
              flex
              justify-center
              gap-2
              lg:hidden
            "
          >

            {validImages.map(
              (_, index) => (

                <button
                  key={index}
                  type="button"
                  onClick={() =>
                    setCurrentIndex(index)
                  }
                  aria-label={`Image ${
                    index + 1
                  }`}
                  className={`
                    h-2
                    rounded-full
                    transition-all
                    duration-300
                    ${
                      index === safeCurrentIndex
                        ? "w-8 bg-black"
                        : "w-2 bg-neutral-300"
                    }
                  `}
                />

              )
            )}

          </div>

        )}


        {/* Lightbox */}

        <ProductLightbox
          open={lightboxOpen}
          image={activeImage!}
          alt={name}
          onClose={() =>
            setLightboxOpen(false)
          }
          onPrevious={handlePrevious}
          onNext={handleNext}
        />

      </div>


      {/* Preload next & previous image */}

      {validImages.length > 1 && (

        <div
          aria-hidden
          className="
            absolute
            h-0
            w-0
            overflow-hidden
            opacity-0
          "
        >

          <Image
            src={validImages[nextIndex]}
            alt=""
            width={1}
            height={1}
            loading="eager"
          />


          <Image
            src={validImages[previousIndex]}
            alt=""
            width={1}
            height={1}
            loading="eager"
          />

        </div>

      )}

    </div>

  );
}