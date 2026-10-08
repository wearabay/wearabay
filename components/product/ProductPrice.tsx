import { formatPrice } from "@/lib/currency";

type Props = {
  price: number;
  compareAtPrice?: number | null;
};

export default function ProductPrice({
  price,
  compareAtPrice,
}: Props) {
  const hasComparePrice =
    typeof compareAtPrice === "number" &&
    compareAtPrice > price;

  return (
    <div className="mt-2 flex items-baseline gap-3">
      {hasComparePrice && (
        <span className="text-sm font-normal text-neutral-400 line-through">
          {formatPrice(compareAtPrice)}
        </span>
      )}

      <span className="text-base font-medium text-neutral-900">
        {formatPrice(price)}
      </span>
    </div>
  );
}