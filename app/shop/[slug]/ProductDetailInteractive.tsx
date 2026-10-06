"use client";

import {
  useState,
} from "react";

import type { Product } from "@/types/product";

import ProductGallery from "@/components/product/gallery/ProductGallery";
import ProductInfo from "@/components/product/ProductInfo";


type Props = {
  product: Product;
};


export default function ProductDetailInteractive({
  product,
}: Props) {

  const [
    selectedColor,
    setSelectedColor,
  ] = useState(
    product.colors[0] ?? ""
  );


  const selectedColorImages =
    product.mediaByColor[
      selectedColor
    ] ?? [];


  const galleryImages =
    selectedColorImages.length > 0
      ? selectedColorImages
      : product.images;


  return (

    <div
      className="
        grid
        items-start
        gap-16
        lg:grid-cols-2
      "
    >

      <ProductGallery
        key={selectedColor}
        images={
          galleryImages
        }
        name={
          product.name
        }
      />


      <div
        className="
          self-start
        "
      >

        <div
          className="
            sticky
            top-28
          "
        >

          <ProductInfo
            product={
              product
            }
            selectedColor={
              selectedColor
            }
            onColorChange={
              setSelectedColor
            }
          />

        </div>

      </div>

    </div>

  );

}