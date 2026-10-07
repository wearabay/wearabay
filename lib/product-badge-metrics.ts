import { createClient } from "@/lib/supabase/server";

const SALES_PAYMENT_STATUS = "paid";
const CANCELLED_ORDER_STATUS = "cancelled";

export type ProductBadgeMetrics = {
  productId: number;

  unitsSold30d: number;
  unitsSoldPrevious30d: number;

  unitsSold7d: number;
  unitsSoldPrevious7d: number;

  bestSellerRank: number | null;

  averageRating: number;
  approvedReviewCount: number;

  totalStock: number;
};

type ProductVariantMetricRow = {
  product_id: number;
  stock: number | null;
  status: "active" | "inactive";
};

type ReviewMetricRow = {
  product_id: number;
  rating: number | null;
  status: string;
};

type OrderItemMetricRow = {
  order_id: string;
  product_id: number;
  quantity: number | null;
  created_at: string;
};

type OrderMetricRow = {
  id: string;
  status: string;
  payment_status: string;
};

function isSalesOrder(
  order: OrderMetricRow | undefined,
): boolean {
  if (!order) {
    return false;
  }

  return (
    order.payment_status ===
      SALES_PAYMENT_STATUS &&
    order.status !==
      CANCELLED_ORDER_STATUS
  );
}

function getDateDaysAgo(
  days: number,
): Date {
  const date = new Date();

  date.setDate(
    date.getDate() - days,
  );

  return date;
}

function getSalesWindowCounts(
  items: OrderItemMetricRow[],
  ordersById: Map<string, OrderMetricRow>,
) {
  const now = Date.now();

  const start7d =
    getDateDaysAgo(7).getTime();

  const start14d =
    getDateDaysAgo(14).getTime();

  const start30d =
    getDateDaysAgo(30).getTime();

  const start60d =
    getDateDaysAgo(60).getTime();

  let unitsSold7d = 0;
  let unitsSoldPrevious7d = 0;
  let unitsSold30d = 0;
  let unitsSoldPrevious30d = 0;

  for (const item of items) {
    const order =
      ordersById.get(
        item.order_id,
      );

    if (!isSalesOrder(order)) {
      continue;
    }

    const createdAt =
      new Date(
        item.created_at,
      ).getTime();

    if (
      Number.isNaN(createdAt) ||
      createdAt > now
    ) {
      continue;
    }

    const quantity =
      Math.max(
        0,
        Number(
          item.quantity ?? 0,
        ),
      );

    if (
      createdAt >= start7d
    ) {
      unitsSold7d += quantity;
    }

    if (
      createdAt >= start14d &&
      createdAt < start7d
    ) {
      unitsSoldPrevious7d +=
        quantity;
    }

    if (
      createdAt >= start30d
    ) {
      unitsSold30d += quantity;
    }

    if (
      createdAt >= start60d &&
      createdAt < start30d
    ) {
      unitsSoldPrevious30d +=
        quantity;
    }
  }

  return {
    unitsSold7d,
    unitsSoldPrevious7d,
    unitsSold30d,
    unitsSoldPrevious30d,
  };
}

export async function getProductBadgeMetrics(
  productIds: number[],
): Promise<ProductBadgeMetrics[]> {
  if (
    productIds.length === 0
  ) {
    return [];
  }

  const supabase =
    await createClient();

  const [
    variantsResult,
    reviewsResult,
    orderItemsResult,
  ] = await Promise.all([
    supabase
      .from("product_variants")
      .select(
        `
          product_id,
          stock,
          status
        `,
      )
      .in(
        "product_id",
        productIds,
      ),

    supabase
      .from("reviews")
      .select(
        `
          product_id,
          rating,
          status
        `,
      )
      .in(
        "product_id",
        productIds,
      ),

    supabase
      .from("order_items")
      .select(
        `
          order_id,
          product_id,
          quantity,
          created_at
        `,
      )
      .in(
        "product_id",
        productIds,
      ),
  ]);

  if (
    variantsResult.error
  ) {
    throw new Error(
      `Failed to load product stock metrics: ${variantsResult.error.message}`,
    );
  }

  if (
    reviewsResult.error
  ) {
    throw new Error(
      `Failed to load product review metrics: ${reviewsResult.error.message}`,
    );
  }

  if (
    orderItemsResult.error
  ) {
    throw new Error(
      `Failed to load product sales metrics: ${orderItemsResult.error.message}`,
    );
  }

  const variants =
    (variantsResult.data ??
      []) as ProductVariantMetricRow[];

  const reviews =
    (reviewsResult.data ??
      []) as ReviewMetricRow[];

  const orderItems =
    (orderItemsResult.data ??
      []) as OrderItemMetricRow[];

  const orderIds = [
    ...new Set(
      orderItems.map(
        (item) =>
          item.order_id,
      ),
    ),
  ];

  const ordersResult =
    orderIds.length > 0
      ? await supabase
          .from("orders")
          .select(
            `
              id,
              status,
              payment_status
            `,
          )
          .in(
            "id",
            orderIds,
          )
      : {
          data: [],
          error: null,
        };

  if (ordersResult.error) {
    throw new Error(
      `Failed to load order sales metrics: ${ordersResult.error.message}`,
    );
  }

  const orders =
    (ordersResult.data ??
      []) as OrderMetricRow[];

  const ordersById =
    new Map(
      orders.map(
        (order) => [
          order.id,
          order,
        ],
      ),
    );

  const metricsByProduct =
    new Map<
      number,
      ProductBadgeMetrics
    >();

  for (const productId of productIds) {
    metricsByProduct.set(
      productId,
      {
        productId,

        unitsSold30d: 0,
        unitsSoldPrevious30d: 0,

        unitsSold7d: 0,
        unitsSoldPrevious7d: 0,

        bestSellerRank: null,

        averageRating: 0,
        approvedReviewCount: 0,

        totalStock: 0,
      },
    );
  }

  for (const variant of variants) {
    if (
      variant.status !==
        "active" ||
      !metricsByProduct.has(
        variant.product_id,
      )
    ) {
      continue;
    }

    const metrics =
      metricsByProduct.get(
        variant.product_id,
      );

    if (!metrics) {
      continue;
    }

    metrics.totalStock +=
      Math.max(
        0,
        Number(
          variant.stock ?? 0,
        ),
      );
  }

  const reviewsByProduct =
    new Map<
      number,
      number[]
    >();

  for (const review of reviews) {
    if (
      review.status !==
        "approved" ||
      !metricsByProduct.has(
        review.product_id,
      )
    ) {
      continue;
    }

    const rating =
      Number(
        review.rating ?? 0,
      );

    if (
      !Number.isFinite(
        rating,
      ) ||
      rating <= 0
    ) {
      continue;
    }

    const existing =
      reviewsByProduct.get(
        review.product_id,
      ) ?? [];

    existing.push(
      rating,
    );

    reviewsByProduct.set(
      review.product_id,
      existing,
    );
  }

  for (const [
    productId,
    ratings,
  ] of reviewsByProduct) {
    const metrics =
      metricsByProduct.get(
        productId,
      );

    if (
      !metrics ||
      ratings.length === 0
    ) {
      continue;
    }

    const totalRating =
      ratings.reduce(
        (
          sum,
          rating,
        ) =>
          sum + rating,
        0,
      );

    metrics.approvedReviewCount =
      ratings.length;

    metrics.averageRating =
      totalRating /
      ratings.length;
  }

  const salesItemsByProduct =
    new Map<
      number,
      OrderItemMetricRow[]
    >();

  for (const item of orderItems) {
    if (
      !metricsByProduct.has(
        item.product_id,
      )
    ) {
      continue;
    }

    const existing =
      salesItemsByProduct.get(
        item.product_id,
      ) ?? [];

    existing.push(
      item,
    );

    salesItemsByProduct.set(
      item.product_id,
      existing,
    );
  }

  for (const [
    productId,
    items,
  ] of salesItemsByProduct) {
    const metrics =
      metricsByProduct.get(
        productId,
      );

    if (!metrics) {
      continue;
    }

    const sales =
      getSalesWindowCounts(
        items,
        ordersById,
      );

    metrics.unitsSold7d =
      sales.unitsSold7d;

    metrics.unitsSoldPrevious7d =
      sales.unitsSoldPrevious7d;

    metrics.unitsSold30d =
      sales.unitsSold30d;

    metrics.unitsSoldPrevious30d =
      sales.unitsSoldPrevious30d;
  }

  /*
   * Best Seller:
   *
   * Rank products by valid paid units sold
   * in the last 30 days.
   *
   * Only the top three receive a rank.
   */

  const rankedProducts = [
    ...metricsByProduct.values(),
  ]
    .filter(
      (metrics) =>
        metrics.unitsSold30d >
        0,
    )
    .sort(
      (a, b) =>
        b.unitsSold30d -
          a.unitsSold30d ||
        a.productId -
          b.productId,
    );

  rankedProducts
    .slice(0, 3)
    .forEach(
      (
        metrics,
        index,
      ) => {
        metrics.bestSellerRank =
          index + 1;
      },
    );

  return productIds.map(
    (productId) =>
      metricsByProduct.get(
        productId,
      )!,
  );
}

export async function getProductBadgeMetricsMap(
  productIds: number[],
): Promise<
  Map<
    number,
    ProductBadgeMetrics
  >
> {
  const metrics =
    await getProductBadgeMetrics(
      productIds,
    );

  return new Map(
    metrics.map(
      (item) => [
        item.productId,
        item,
      ],
    ),
  );
}