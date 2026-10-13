import type { Product } from "@/types/product";
import type { ProductBadge } from "@/lib/product-badges";

let currentProduct: Product | null = null;
let currentBadges: ProductBadge[] = [];

export function openQuickView(
  product: Product,
  badges: ProductBadge[] = [],
) {
  currentProduct = product;
  currentBadges = badges;

  window.dispatchEvent(
    new CustomEvent("quick-view-open")
  );
}

export function closeQuickView() {
  currentProduct = null;
  currentBadges = [];
}

export function getQuickViewProduct() {
  return currentProduct;
}

export function getQuickViewBadges() {
  return currentBadges;
}
