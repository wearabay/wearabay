"use client";

import ProductCard from "../product/ProductCard";
import Container from "../ui/Container";

import type { Product } from "@/types/product";

import { useShop } from "./context/ShopContext";


type ProductGridProps = {
  products: Product[];
};


export default function ProductGrid({
  products,
}: ProductGridProps) {

  const {
    search,
    sort,
    category,
    colors,
    sizes,
  } = useShop();


  let filteredProducts = [...products];

  // Search
  if (search.trim()) {
    filteredProducts = filteredProducts.filter((product) =>
      product.name.toLowerCase().includes(search.toLowerCase())
    );
  }

  // Category Filter

  if (category.length > 0) {
  filteredProducts = filteredProducts.filter((product) =>
    category.includes(product.category)
  );
}
// Color Filter

  if (colors.length > 0) {
  filteredProducts = filteredProducts.filter((product) =>
    product.colors.some((color) => colors.includes(color))
  );
}
if (sizes.length > 0) {
  filteredProducts = filteredProducts.filter(
    (product) =>
      product.sizes.some((size) =>
        sizes.includes(size)
      )
  );
}

  // Sort
  switch (sort) {
    case "low-high":
      filteredProducts.sort((a, b) => a.price - b.price);
      break;

    case "high-low":
      filteredProducts.sort((a, b) => b.price - a.price);
      break;

    case "name-asc":
      filteredProducts.sort((a, b) =>
        a.name.localeCompare(b.name)
      );
      break;

    case "name-desc":
      filteredProducts.sort((a, b) =>
        b.name.localeCompare(a.name)
      );
      break;

    default:
      break;
  }

  if (filteredProducts.length === 0) {
    return (
      <section className="py-24">
        <Container>

          <div className="text-center">

            <h2 className="text-3xl font-light">
              No Products Found
            </h2>

            <p className="mt-4 text-neutral-500">
              Try another keyword.
            </p>

          </div>

        </Container>
      </section>
    );
  }

  return (
    <section className="py-10 lg:py-8">

      <Container>

        <div className="mb-10">

          <p className="text-sm text-neutral-500">
            Showing{" "}
            <span className="font-medium text-neutral-500">
              {filteredProducts.length}
            </span>{" "}
            Products
          </p>

        </div>

        <div className="grid grid-cols-2 gap-x-8 gap-y-14 lg:grid-cols-4">

          {filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
            />
          ))}

        </div>

      </Container>

    </section>
  );
}