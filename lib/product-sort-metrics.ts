import { createClient } from "@/lib/supabase/server";

type OrderItemRow = {
  product_id: number | null;
  quantity: number | string | null;
  order_id: string;
};

type OrderRow = {
  id: string;
  status: string;
  payment_status: string;
};

/**
 * Returns all-time paid units sold per product.
 * Cancelled and unpaid orders are excluded.
 */
export async function getProductSalesCounts(
  productIds: number[],
): Promise<Record<number, number>> {
  const counts: Record<number, number> = {};

  for (const id of productIds) {
    counts[id] = 0;
  }

  if (productIds.length === 0) {
    return counts;
  }

  const supabase = await createClient();

  const { data: itemData, error: itemError } = await supabase
    .from("order_items")
    .select("product_id, quantity, order_id")
    .in("product_id", productIds);

  if (itemError) {
    throw new Error(
      `Failed to load product sales counts: ${itemError.message}`,
    );
  }

  const items = (itemData ?? []) as OrderItemRow[];
  const orderIds = [...new Set(items.map((item) => item.order_id))];

  if (orderIds.length === 0) {
    return counts;
  }

  const { data: orderData, error: orderError } = await supabase
    .from("orders")
    .select("id, status, payment_status")
    .in("id", orderIds);

  if (orderError) {
    throw new Error(
      `Failed to load sales order statuses: ${orderError.message}`,
    );
  }

  const ordersById = new Map(
    ((orderData ?? []) as OrderRow[]).map((order) => [
      order.id,
      order,
    ]),
  );

  for (const item of items) {
    const order = ordersById.get(item.order_id);

    if (
      !order ||
      order.payment_status !== "paid" ||
      order.status === "cancelled" ||
      item.product_id === null
    ) {
      continue;
    }

    const quantity = Number(item.quantity ?? 0);

    if (!Number.isFinite(quantity) || quantity <= 0) {
      continue;
    }

    counts[item.product_id] =
      (counts[item.product_id] ?? 0) + quantity;
  }

  return counts;
}
