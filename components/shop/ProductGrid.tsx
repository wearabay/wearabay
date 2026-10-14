"use client";

import ProductCard from "../product/ProductCard";
import Container from "../ui/Container";

import type { Product } from "@/types/product";
import type { ProductBadge } from "@/lib/product-badges";

import { useShop } from "./context/ShopContext";

type ProductGridProps = {
  products: Product[];
  badgesByProduct: Record<
    number,
    ProductBadge[]
  >;
  salesByProduct: Record<number, number>;
};

export default function ProductGrid({
  products,
  badgesByProduct,
  salesByProduct,
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
    filteredProducts =
      filteredProducts.filter((product) =>
        product.name
          .toLowerCase()
          .includes(
            search.toLowerCase(),
          ),
      );
  }

  // Category Filter
  if (category.length > 0) {
    filteredProducts =
      filteredProducts.filter((product) =>
        category.includes(
          product.category,
        ),
      );
  }

  // Color Filter
  if (colors.length > 0) {
    filteredProducts =
      filteredProducts.filter((product) =>
        product.colors.some((color) =>
          colors.includes(color),
        ),
      );
  }

  // Size Filter
  if (sizes.length > 0) {
    filteredProducts =
      filteredProducts.filter((product) =>
        product.sizes.some((size) =>
          sizes.includes(size),
        ),
      );
  }

  // Sort filtered products without mutating the original prop.
  switch (sort) {\n    case "newest":\n      filteredProducts.sort((a, b) => {\n        const dateA = Date.parse(a.createdAt);\n        const dateB = Date.parse(b.createdAt);\n        const validA = Number.isFinite(dateA) ? dateA : 0;\n        const validB = Number.isFinite(dateB) ? dateB : 0;\n        return validB - validA || b.id - a.id;\n      });\n      break;\n\n    case "featured":\n      filteredProducts.sort((a, b) => {\n        const featuredA = a.badge?.trim().toLowerCase() === "featured" ? 1 : 0;\n        const featuredB = b.badge?.trim().toLowerCase() === "featured" ? 1 : 0;\n        return featuredB - featuredA ||\n          Date.parse(b.createdAt) - Date.parse(a.createdAt) ||\n          b.id - a.id;\n      });\n      break;\n\n    case "best-selling":\n      filteredProducts.sort((a, b) =>\n        (salesByProduct[b.id] ?? 0) - (salesByProduct[a.id] ?? 0) ||\n        Date.parse(b.createdAt) - Date.parse(a.createdAt) ||\n        b.id - a.id,\n      );\n      break;
    case "low-high":
      filteredProducts.sort(
        (a, b) =>
          a.price - b.price,
      );
      break;

    case "high-low":
      filteredProducts.sort(
        (a, b) =>
          b.price - a.price,
      );
      break;

    case "name-asc":
      filteredProducts.sort((a, b) =>
        a.name.localeCompare(
          b.name,
        ),
      );
      break;

    case "name-desc":
      filteredProducts.sort((a, b) =>
        b.name.localeCompare(
          a.name,
        ),
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
          {filteredProducts.map(
            (product) => (
              <ProductCard
                key={product.id}
                product={product}
                badges={
                  badgesByProduct[
                    product.id
                  ] ?? []
                }
              />
            ),
          )}
        </div>
      </Container>
    </section>
  );
}