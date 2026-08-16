import { getProductBySlug } from "@/lib/products";

export async function getProduct(slug: string) {
  return getProductBySlug(slug);
}