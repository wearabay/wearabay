import { getAdminUser } from "@/lib/admin";
import { getAdminOrders } from "@/lib/admin-orders";

function escapeCsvValue(value: unknown): string {
  const text =
    value === null || value === undefined
      ? ""
      : String(value);

  // Prevent spreadsheet formula injection in exported cells.
  const safeText = /^[\s]*[=+@-]/.test(text)
    ? `'${text}`
    : text;

  return `"${safeText.replaceAll('"', '""')}"`;
}

function formatDate(value: string | null | undefined): string {
  if (!value) return "";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return date.toLocaleString("id-ID", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

function formatPrice(value: number): string {
  return new Intl.NumberFormat("id-ID", {
    maximumFractionDigits: 0,
  }).format(value);
}

export async function GET() {
  const admin = await getAdminUser();

  if (!admin) {
    return new Response("Unauthorized", {
      status: 401,
    });
  }

  const orders = await getAdminOrders();

  const headers = [
    "Order ID",
    "Order Number",
    "Order Date",
    "Customer Name",
    "Customer Email",
    "Customer Phone",
    "Country",
    "Province",
    "City",
    "Postal Code",
    "Street Address",
    "Items",
    "Subtotal",
    "Shipping Fee",
    "Total",
    "Order Status",
    "Payment Status",
    "Delivery Method",
    "Payment Method",
    "Courier",
    "Tracking Number",
    "Shipped At",
  ];

  const rows = orders.map((order) => {
    const items = order.items
      .map((item) => {
        const variant = [item.color, item.size]
          .filter(Boolean)
          .join(" / ");

        return [
          `${item.name} x${item.quantity}`,
          variant ? `(${variant})` : "",
        ]
          .filter(Boolean)
          .join(" ");
      })
      .join(" | ");

    return [
      order.id,
      order.orderNumber,
      formatDate(order.createdAt),
      [order.address.firstName, order.address.lastName]
        .filter(Boolean)
        .join(" "),
      order.customer.email,
      order.customer.phone,
      order.address.country,
      order.address.province,
      order.address.city,
      order.address.postalCode,
      order.address.street,
      items,
      formatPrice(order.subtotal),
      formatPrice(order.shippingFee),
      formatPrice(order.total),
      order.status,
      order.paymentStatus,
      order.delivery,
      order.payment,
      order.courier ?? "",
      order.trackingNumber ?? "",
      formatDate(order.shippedAt),
    ];
  });

  const csv = [headers, ...rows]
    .map((row) => row.map(escapeCsvValue).join(","))
    .join("\r\n");

  return new Response("\uFEFF" + csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition":
        'attachment; filename="wearabay-orders.csv"',
      "Cache-Control": "no-store",
    },
  });
}
