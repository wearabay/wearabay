import type { ProductBadge } from "@/lib/product-badges";

const AUTOMATIC_BADGE_LABELS = new Set([
  "limited",
  "sale",
  "new",
  "best seller",
  "trending",
  "favorite",
  "low stock",
  "featured",
]);

export function getCustomProductBadge(
  value: string | null | undefined,
): string | null {
  const badge = value?.trim();
  if (!badge) return null;

  const normalized = badge
    .toLowerCase()
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ");

  return AUTOMATIC_BADGE_LABELS.has(normalized)
    ? null
    : badge;
}

export function getDisplayProductBadges(
  customValue: string | null | undefined,
  automaticBadges: ProductBadge[] = [],
): { custom: string | null; automatic: ProductBadge[] } {
  const custom = getCustomProductBadge(customValue);
  const normalizedCustom = custom?.toLowerCase();
  const automatic = automaticBadges.filter(
    (badge) => badge.label.toLowerCase() !== normalizedCustom,
  );

  return { custom, automatic };
}
