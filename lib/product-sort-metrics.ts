import { createClient } from "@/lib/supabase/server";

export async function getProductSalesCounts(
  productIds: number[],
): Promise<Record<number, number>> {
  if (productIds.length === 0) return {};

  const supabase = await createClient();

  const { data: orderItems, error: itemsError } = await supabase
    .from("order_items")
    .select("product_id, quantity, order_id")
    .in("product_id", productIds);

  if (itemsError) {
    console.error("getProductSalesCounts items:", itemsError);
    return {};
  }

  if (!orderItems?.length) return {};

  const orderIds = [
    ...new Set(
      orderItems
        .map((item) => item.order_id)
        .filter((id): id is NonNullable<typeof id> => id !== null),
    ),
  ];

  if (orderIds.length === 0) return {};

  const { data: orders, error: ordersError } = await supabase
    .from("orders")
    .select("id, payment_status, status")
    .in("id", orderIds);

  if (ordersError) {
    console.error("getProductSalesCounts orders:", ordersError);
    return {};
  }

  const paidOrderIds = new Set(
    (orders ?? [])
      .filter(
        (order) =>
          order.payment_status === "paid" &&
          order.status !== "cancelled",
      )
      .map((order) => order.id),
  );

  const salesByProduct: Record<number, number> = {};

  for (const item of orderItems) {
    if (
      item.product_id === null ||
      !paidOrderIds.has(item.order_id)
    ) {
      continue;
    }

    const productId = Number(item.product_id);
    const quantity = Number(item.quantity);

    if (
      !Number.isFinite(productId) ||
      !Number.isFinite(quantity) ||
      quantity <= 0
    ) {
      continue;
    }

    salesByProduct[productId] =
      (salesByProduct[productId] ?? 0) + quantity;
  }

  return salesByProduct;
}
