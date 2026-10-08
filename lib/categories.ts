import { createClient } from "@/lib/supabase/server";
import { getMediaUrl } from "@/lib/media";

export type StorefrontCategory = {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  coverImageUrl: string;
  sortOrder: number;
  productCount: number;
};

type ProductImageRow = {
  id: number;
  category_id: number | null;
  product_media: {
    id: number;
    type: "image" | "video";
    storage_path: string;
    sort_order: number;
    is_primary: boolean;
  }[];
};

export async function getStorefrontCategories(): Promise<
  StorefrontCategory[]
> {
  const supabase = await createClient();

  const [
    { data: categories, error: categoriesError },
    { data: products, error: productsError },
  ] = await Promise.all([
    supabase
      .from("categories")
      .select(
        "id, name, slug, description, cover_image, sort_order",
      )
      .eq("is_active", true)
      .order("sort_order", { ascending: true })
      .order("name", { ascending: true }),

    supabase
      .from("products")
      .select(
        `
          id,
          category_id,
          product_media (
            id,
            type,
            storage_path,
            sort_order,
            is_primary
          )
        `,
      )
      .eq("status", "published"),
  ]);

  if (categoriesError) {
    console.error(
      "Failed to load storefront categories:",
      categoriesError,
    );

    return [];
  }

  if (productsError) {
    console.error(
      "Failed to load storefront category products:",
      productsError,
    );

    return [];
  }

  const productCounts = new Map<number, number>();
  const fallbackImages = new Map<number, string>();

  for (const product of (products ?? []) as ProductImageRow[]) {
    if (product.category_id === null) {
      continue;
    }

    productCounts.set(
      product.category_id,
      (productCounts.get(product.category_id) ?? 0) + 1,
    );

    const images = [
      ...(product.product_media ?? []),
    ]
      .filter(
        (media) =>
          media.type === "image",
      )
      .sort((a, b) => {
        if (
          a.is_primary !==
          b.is_primary
        ) {
          return a.is_primary
            ? -1
            : 1;
        }

        return (
          a.sort_order -
          b.sort_order
        );
      });

    if (
      images.length > 0 &&
      !fallbackImages.has(
        product.category_id,
      )
    ) {
      fallbackImages.set(
        product.category_id,
        getMediaUrl(
          images[0].storage_path,
        ),
      );
    }
  }

  return (categories ?? [])
    .map((category) => {
      const coverImage =
        category.cover_image?.trim() ||
        fallbackImages.get(
          category.id,
        );

      if (!coverImage) {
        return null;
      }

      return {
        id: category.id,
        name: category.name,
        slug: category.slug,
        description:
          category.description,
        coverImageUrl: coverImage,
        sortOrder:
          category.sort_order,
        productCount:
          productCounts.get(
            category.id,
          ) ?? 0,
      };
    })
    .filter(
      (
        category,
      ): category is StorefrontCategory =>
        category !== null &&
        category.productCount > 0,
    );
}