import { createClient } from "@/lib/supabase/client";
import { getMediaUrl } from "@/lib/media";

import type { Product } from "@/types/product";

type ProductRow = {
  id: number;
  slug: string;
  name: string;
  description: string | null;
  category: string | null;
  badge: string | null;
  features: string[];
  specifications: {
    label: string;
    value: string;
  }[];
  status: "draft" | "published" | "archived";
};

type ProductVariantRow = {
  id: number;
  product_id: number;
  sku: string | null;
  color: string;
  size: string;
  price: number | string;
  compare_at_price: number | string | null;
  stock: number;
  status: "active" | "inactive";
};

type ProductMediaRow = {
  id: number;
  product_id: number;
  type: "image" | "video";
  storage_path: string;
  alt_text: string | null;
  sort_order: number;
  is_primary: boolean;
};

type ProductData = ProductRow & {
  product_variants: ProductVariantRow[];
  product_media: ProductMediaRow[];
};

function toNumber(value: number | string | null | undefined) {
  return Number(value ?? 0);
}

function mapProduct(row: ProductData): Product {
  const variants = row.product_variants
    .filter((variant) => variant.status === "active")
    .sort((a, b) => a.id - b.id);

  const media = row.product_media
    .sort((a, b) => a.sort_order - b.sort_order);

  const images = media
    .filter((item) => item.type === "image")
    .map((item) => getMediaUrl(item.storage_path));

  const primaryMedia =
    media.find((item) => item.is_primary) ??
    media.find((item) => item.type === "image");

  const colors = [
    ...new Set(
      variants.map((variant) => variant.color)
    ),
  ];

  const sizes = [
    ...new Set(
      variants.map((variant) => variant.size)
    ),
  ];

  const prices = variants.map((variant) =>
    toNumber(variant.price)
  );

  const price =
    prices.length > 0
      ? Math.min(...prices)
      : 0;

  const stock = variants.reduce(
    (total, variant) =>
      total + Math.max(0, variant.stock),
    0
  );

  return {
    id: row.id,
    slug: row.slug,
    name: row.name,

    price,

    image:
      primaryMedia
        ? getMediaUrl(primaryMedia.storage_path)
        : images[0] ?? "",

    images,

    category:
      row.category ?? "",

    badge:
      row.badge ?? undefined,

    features:
      row.features ?? [],

    description:
      row.description ?? "",

    specifications:
      row.specifications ?? [],

    colors,

    sizes,

    stock,
  };
}

export async function getProducts(): Promise<Product[]> {
  const supabase = createClient();

  const {
    data,
    error,
  } = await supabase
    .from("products")
    .select(
      `
        id,
        slug,
        name,
        description,
        category,
        badge,
        features,
        specifications,
        status,
        product_variants (
          id,
          product_id,
          sku,
          color,
          size,
          price,
          compare_at_price,
          stock,
          status
        ),
        product_media (
          id,
          product_id,
          type,
          storage_path,
          alt_text,
          sort_order,
          is_primary
        )
      `
    )
    .eq("status", "published")
    .order("id", {
      ascending: true,
    });

  if (error) {
    throw new Error(
      `Failed to load products: ${error.message}`
    );
  }

  return (data ?? []).map((row) =>
    mapProduct(
      row as unknown as ProductData
    )
  );
}

export async function getProductBySlug(
  slug: string
): Promise<Product | undefined> {
  const supabase = createClient();

  const {
    data,
    error,
  } = await supabase
    .from("products")
    .select(
      `
        id,
        slug,
        name,
        description,
        category,
        badge,
        features,
        specifications,
        status,
        product_variants (
          id,
          product_id,
          sku,
          color,
          size,
          price,
          compare_at_price,
          stock,
          status
        ),
        product_media (
          id,
          product_id,
          type,
          storage_path,
          alt_text,
          sort_order,
          is_primary
        )
      `
    )
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();

  if (error) {
    throw new Error(
      `Failed to load product: ${error.message}`
    );
  }

  if (!data) {
    return undefined;
  }

  return mapProduct(
    data as unknown as ProductData
  );
}
