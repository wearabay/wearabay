"use client";

import Image from "next/image";
import { useState } from "react";
import type { Product } from "@/types/product";

type Props = {
  product: Product;
};

export default function QuickViewGallery({
  product,
}: Props) {
  const images =
    product.images?.length
      ? product.images
      : [product.image];

  const [active, setActive] = useState(0);

  return (
    <div className="flex flex-col gap-4 lg:flex-row">

      {/* Thumbnails */}

      <div className="order-2 flex gap-3 overflow-x-auto lg:order-1 lg:flex-col">

        {images.map((image, index) => (

          <button
            key={index}
            onClick={() => setActive(index)}
            className={`relative h-20 w-16 shrink-0 overflow-hidden rounded-lg border transition ${
              active === index
                ? "border-black"
                : "border-stone-200"
            }`}
          >

            <Image
              src={image}
              alt={product.name}
              fill
              sizes="64px"
              className="object-cover"
            />

          </button>

        ))}

      </div>

      {/* Main Image */}

      <div className="relative order-1 aspect-[3/4] flex-1 overflow-hidden rounded-2xl bg-stone-100 lg:order-2">

        <Image
          src={images[active]}
          alt={product.name}
          fill
          sizes="(max-width:1024px) 100vw, calc(100vw - 160px)"
          className="object-cover transition duration-500 hover:scale-105"
        />

      </div>

    </div>
  );
}