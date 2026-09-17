"use client";

import type { Product } from "@/types/product";

import ProductAccordion from "./accordion/ProductAccordion";
import ProductSpecification from "./ProductSpecification";


type ProductDetailsProps = {
  product: Product;
};


function DetailText({
  content,
}: {
  content: string;
}) {

  const lines =
    content
      .split("\n")
      .map(
        (line) =>
          line.trim()
      )
      .filter(Boolean);


  return (
    <div className="space-y-1">
      {lines.map(
        (line, index) => (
          <p
            key={`${line}-${index}`}
          >
            {line}
          </p>
        )
      )}
    </div>
  );
}


export default function ProductDetails({
  product,
}: ProductDetailsProps) {

  const sizeGuide =
    product.sizeGuide?.trim() ?? "";

  const shippingReturns =
    product.shippingReturns?.trim() ?? "";

  const careInstructions =
    product.careInstructions?.trim() ?? "";

  const craftsmanship =
    product.craftsmanship?.trim() ?? "";


  return (
    <div className="mt-10 border-t border-neutral-200 pt-2">

      {/* Description */}

      <ProductAccordion
        title="Description"
        defaultOpen
      >
        {product.description}
      </ProductAccordion>


      {/* Specifications */}

      <ProductAccordion
        title="Specifications"
      >
        <ProductSpecification
          specifications={
            product.specifications
          }
        />
      </ProductAccordion>


      {/* Size Guide */}

      {sizeGuide && (
        <ProductAccordion
          title="Size Guide"
        >
          <DetailText
            content={sizeGuide}
          />
        </ProductAccordion>
      )}


      {/* Shipping & Returns */}

      {shippingReturns && (
        <ProductAccordion
          title="Shipping & Returns"
        >
          <DetailText
            content={shippingReturns}
          />
        </ProductAccordion>
      )}


      {/* Care Instructions */}

      {careInstructions && (
        <ProductAccordion
          title="Care Instructions"
        >
          <DetailText
            content={careInstructions}
          />
        </ProductAccordion>
      )}


      {/* Craftsmanship */}

      {craftsmanship && (
        <ProductAccordion
          title="Craftsmanship"
        >
          <DetailText
            content={craftsmanship}
          />
        </ProductAccordion>
      )}

    </div>
  );
}