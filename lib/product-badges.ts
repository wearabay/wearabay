export type ProductBadgeType =
  | "limited"
  | "sale"
  | "new"
  | "best_seller"
  | "trending"
  | "favorite"
  | "low_stock"
  | "featured";

export type ProductBadge = {
  type: ProductBadgeType;
  label: string;
  priority: number;
};

export type ProductBadgeInput = {
  createdAt: string;

  price: number;
  compareAtPrice?: number | null;

  totalStock: number;

  unitsSold30d: number;
  unitsSoldPrevious30d: number;

  unitsSold7d: number;
  unitsSoldPrevious7d: number;

  bestSellerRank: number | null;

  averageRating: number;
  approvedReviewCount: number;

  isLimited?: boolean;
  isFeatured?: boolean;
};

export const PRODUCT_BADGE_CONFIG = {
  newDays: 30,

  bestSellerTopCount: 3,

  favoriteMinRating: 4.5,
  favoriteMinReviews: 3,

  trendingMinUnits: 2,
  trendingGrowthMultiplier: 2,

  lowStockMin: 1,
  lowStockMax: 3,
} as const;

const BADGE_PRIORITY: Record<
  ProductBadgeType,
  number
> = {
  limited: 1,
  sale: 2,
  new: 3,
  best_seller: 4,
  trending: 5,
  favorite: 6,
  low_stock: 7,
  featured: 8,
};

const BADGE_LABELS: Record<
  ProductBadgeType,
  string
> = {
  limited: "Limited",
  sale: "Sale",
  new: "New",
  best_seller: "Best Seller",
  trending: "Trending",
  favorite: "Favorite",
  low_stock: "Low Stock",
  featured: "Featured",
};

function createBadge(
  type: ProductBadgeType,
): ProductBadge {
  return {
    type,
    label: BADGE_LABELS[type],
    priority: BADGE_PRIORITY[type],
  };
}

function isNewProduct(
  createdAt: string,
): boolean {
  const created = new Date(
    createdAt,
  );

  if (
    Number.isNaN(
      created.getTime(),
    )
  ) {
    return false;
  }

  const now = Date.now();

  const ageMs =
    now -
    created.getTime();

  const ageDays =
    ageMs /
    (1000 * 60 * 60 * 24);

  return (
    ageDays >= 0 &&
    ageDays <=
      PRODUCT_BADGE_CONFIG.newDays
  );
}

function isSaleProduct(
  price: number,
  compareAtPrice?: number | null,
): boolean {
  return (
    typeof compareAtPrice ===
      "number" &&
    compareAtPrice > 0 &&
    compareAtPrice > price
  );
}

function isBestSellerProduct(
  bestSellerRank: number | null,
): boolean {
  return (
    typeof bestSellerRank ===
      "number" &&
    bestSellerRank >= 1 &&
    bestSellerRank <=
      PRODUCT_BADGE_CONFIG.bestSellerTopCount
  );
}

function isTrendingProduct(
  unitsSold7d: number,
  unitsSoldPrevious7d: number,
): boolean {
  if (
    unitsSold7d <
    PRODUCT_BADGE_CONFIG.trendingMinUnits
  ) {
    return false;
  }

  if (
    unitsSoldPrevious7d === 0
  ) {
    return (
      unitsSold7d >=
      PRODUCT_BADGE_CONFIG.trendingMinUnits
    );
  }

  return (
    unitsSold7d >=
    unitsSoldPrevious7d *
      PRODUCT_BADGE_CONFIG.trendingGrowthMultiplier
  );
}

function isFavoriteProduct(
  averageRating: number,
  approvedReviewCount: number,
): boolean {
  return (
    averageRating >=
      PRODUCT_BADGE_CONFIG.favoriteMinRating &&
    approvedReviewCount >=
      PRODUCT_BADGE_CONFIG.favoriteMinReviews
  );
}

function isLowStockProduct(
  totalStock: number,
): boolean {
  return (
    totalStock >=
      PRODUCT_BADGE_CONFIG.lowStockMin &&
    totalStock <=
      PRODUCT_BADGE_CONFIG.lowStockMax
  );
}

export function getProductBadgeCandidates(
  product: ProductBadgeInput,
): ProductBadge[] {
  const candidates: ProductBadge[] = [];

  if (product.isLimited) {
    candidates.push(
      createBadge("limited"),
    );
  }

  if (
    isSaleProduct(
      product.price,
      product.compareAtPrice,
    )
  ) {
    candidates.push(
      createBadge("sale"),
    );
  }

  if (
    isNewProduct(
      product.createdAt,
    )
  ) {
    candidates.push(
      createBadge("new"),
    );
  }

  if (
    isBestSellerProduct(
      product.bestSellerRank,
    )
  ) {
    candidates.push(
      createBadge("best_seller"),
    );
  }

  if (
    isTrendingProduct(
      product.unitsSold7d,
      product.unitsSoldPrevious7d,
    )
  ) {
    candidates.push(
      createBadge("trending"),
    );
  }

  if (
    isFavoriteProduct(
      product.averageRating,
      product.approvedReviewCount,
    )
  ) {
    candidates.push(
      createBadge("favorite"),
    );
  }

  if (
    isLowStockProduct(
      product.totalStock,
    )
  ) {
    candidates.push(
      createBadge("low_stock"),
    );
  }

  if (product.isFeatured) {
    candidates.push(
      createBadge("featured"),
    );
  }

  return candidates.sort(
    (a, b) =>
      a.priority -
      b.priority,
  );
}

export function getProductBadges(
  product: ProductBadgeInput,
  maxBadges = 2,
): ProductBadge[] {
  return getProductBadgeCandidates(
    product,
  ).slice(
    0,
    maxBadges,
  );
}