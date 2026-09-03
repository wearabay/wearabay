import { createClient } from "@/lib/supabase/server";

export type AdminInventoryVariant = {
  id: number;
  productId: number;
  productName: string;
  productSlug: string;
  color: string;
  size: string;
  sku: string | null;
  price: number;
  compareAtPrice: number | null;
  stock: number;
  status: "active" | "inactive";
};

export async function getAdminInventory(): Promise<
  AdminInventoryVariant[]
> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("product_variants")
    .select(
      `
        id,
        product_id,
        color,
        size,
        sku,
        price,
        compare_at_price,
        stock,
        status,
        products (
          id,
          name,
          slug
        )
      `
    )
    .order("product_id", { ascending: true })
    .order("color", { ascending: true })
    .order("size", { ascending: true });

  if (error) {
    console.error("getAdminInventory:", error);
    return [];
  }

  return (data ?? []).map((variant) => {
    const product = Array.isArray(variant.products)
      ? variant.products[0]
      : variant.products;

    return {
      id: variant.id,
      productId: variant.product_id,
      productName: product?.name ?? "Unknown Product",
      productSlug: product?.slug ?? "",
      color: variant.color,
      size: variant.size,
      sku: variant.sku,
      price: Number(variant.price),
      compareAtPrice:
        variant.compare_at_price === null
          ? null
          : Number(variant.compare_at_price),
      stock: variant.stock,
      status: variant.status,
    };
  });
}