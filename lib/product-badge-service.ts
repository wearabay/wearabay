import { createClient } from "@/lib/supabase/server";

import {
  getProductBadges,
  type ProductBadge,
} from "@/lib/product-badges";

import {
  getProductBadgeMetrics,
} from "@/lib/product-badge-metrics";

type ProductBadgeProductRow = {
  id: number;
  created_at: string;
  price: number | string | null;
  compare_at_price: number | string | null;
};

type ProductBadgeVariantRow = {
  product_id: number;
  price: number | string | null;
  compare_at_price: number | string | null;
  status: "active" | "inactive";
};

type ProductBadgeProductData =
  ProductBadgeProductRow & {
    product_variants:
      | ProductBadgeVariantRow[]
      | null;
  };

function toNumber(
  value: number | string | null | undefined,
): number {
  return Number(value ?? 0);
}

function getProductPriceData(
  product: ProductBadgeProductData,
) {
  const activeVariants = (
    product.product_variants ?? []
  ).filter(
    (variant) =>
      variant.status === "active",
  );

  const variantPrices =
    activeVariants
      .map((variant) =>
        toNumber(variant.price),
      )
      .filter((price) => price > 0);

  const variantCompareAtPrices =
    activeVariants
      .map((variant) =>
        variant.compare_at_price === null
          ? null
          : toNumber(
              variant.compare_at_price,
            ),
      )
      .filter(
        (
          price,
        ): price is number =>
          typeof price === "number" &&
          price > 0,
      );

  const price =
    variantPrices.length > 0
      ? Math.min(...variantPrices)
      : toNumber(product.price);

  const compareAtPrice =
    variantCompareAtPrices.length > 0
      ? Math.max(
          ...variantCompareAtPrices,
        )
      : product.compare_at_price === null
        ? null
        : toNumber(
            product.compare_at_price,
          );

  return {
    price,
    compareAtPrice,
  };
}

export async function getProductBadgesForProducts(
  productIds: number[],
): Promise<Map<number, ProductBadge[]>> {
  const uniqueProductIds = [
    ...new Set(productIds),
  ];

  const badgeMap = new Map<
    number,
    ProductBadge[]
  >();

  if (uniqueProductIds.length === 0) {
    return badgeMap;
  }

  const supabase = await createClient();

  const {
    data,
    error,
  } = await supabase
    .from("products")
    .select(
      `
        id,
        created_at,
        product_variants (
          product_id,
          price,
          compare_at_price,
          status
        )
      `,
    )
    .in(
      "id",
      uniqueProductIds,
    )
    .eq(
      "status",
      "published",
    );

  if (error) {
    throw new Error(
      `Failed to load product badge data: ${error.message}`,
    );
  }

  const products =
    (data ?? []) as unknown as ProductBadgeProductData[];

  const metrics =
    await getProductBadgeMetrics(
      uniqueProductIds,
    );

  const metricsByProductId =
    new Map(
      metrics.map(
        (item) => [
          item.productId,
          item,
        ],
      ),
    );

  for (const product of products) {
    const productMetrics =
      metricsByProductId.get(
        product.id,
      );

    if (!productMetrics) {
      continue;
    }

    const {
      price,
      compareAtPrice,
    } =
      getProductPriceData(
        product,
      );

    const badges =
      getProductBadges(
        {
          createdAt:
            product.created_at,

          price,

          compareAtPrice,

          totalStock:
            productMetrics.totalStock,

          unitsSold30d:
            productMetrics.unitsSold30d,

          unitsSoldPrevious30d:
            productMetrics.unitsSoldPrevious30d,

          unitsSold7d:
            productMetrics.unitsSold7d,

          unitsSoldPrevious7d:
            productMetrics.unitsSoldPrevious7d,

          bestSellerRank:
            productMetrics.bestSellerRank,

          averageRating:
            productMetrics.averageRating,

          approvedReviewCount:
            productMetrics.approvedReviewCount,
        },
        2,
      );

    badgeMap.set(
      product.id,
      badges,
    );
  }

  return badgeMap;
}

export async function getProductBadgesForProduct(
  productId: number,
): Promise<ProductBadge[]> {
  const badgeMap =
    await getProductBadgesForProducts([
      productId,
    ]);

  return (
    badgeMap.get(productId) ?? []
  );
}