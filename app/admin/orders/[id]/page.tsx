import { notFound, redirect } from "next/navigation";
import Link from "next/link";

import { getAdminUser } from "@/lib/admin";
import { getAdminOrderById } from "@/lib/admin-orders";
import { formatPrice } from "@/lib/currency";
import { createClient } from "@/lib/supabase/server";
import { getOrderHistory } from "@/lib/order-history";

import OrderHistory from "@/components/orders/OrderHistory";

import OrderStatusForm from "./OrderStatusForm";
import ShippingForm from "./ShippingForm";
import VerifyPaymentButton from "./VerifyPaymentButton";
import RefundPaymentButton from "./RefundPaymentButton";

import {
  verifyAdminPaymentProofAction,
  rejectAdminPaymentProofAction,
  refundAdminPaymentAction,
} from "./actions";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

function formatPaymentMethod(
  payment: string | null | undefined,
) {
  const value =
    typeof payment === "string"
      ? payment.trim().toLowerCase()
      : "";

  switch (value) {
    case "bank":
    case "bank_transfer":
    case "bank transfer":
      return "Bank Transfer";

    case "qris":
      return "QRIS";

    case "e-wallet":
    case "ewallet":
    case "e_wallet":
      return "E-Wallet";

    case "cod":
      return "Cash on Delivery";

    default:
      return payment || "—";
  }
}

function formatDateTime(value: string | null | undefined) {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "Mei",
    "Jun",
    "Jul",
    "Agu",
    "Sep",
    "Okt",
    "Nov",
    "Des",
  ];

  const day = String(date.getUTCDate()).padStart(2, "0");
  const month = months[date.getUTCMonth()];
  const year = date.getUTCFullYear();

  const hours = String(date.getUTCHours()).padStart(2, "0");
  const minutes = String(date.getUTCMinutes()).padStart(2, "0");

  return `${day} ${month} ${year}, ${hours}:${minutes} UTC`;
}

function StatusBadge({
  label,
  tone = "neutral",
}: {
  label: string;
  tone?: "neutral" | "dark" | "muted";
}) {
  const className =
    tone === "dark"
      ? "border-neutral-900 bg-neutral-900 text-white"
      : tone === "muted"
        ? "border-stone-200 bg-stone-100 text-neutral-500"
        : "border-stone-200 bg-white text-neutral-700";

  return (
    <span
      className={[
        "inline-flex items-center rounded-full border px-3 py-1",
        "text-[10px] uppercase tracking-[0.15em]",
        className,
      ].join(" ")}
    >
      {label}
    </span>
  );
}

export default async function AdminOrderDetailPage({
  params,
}: Props) {
  const { id } = await params;

  const admin = await getAdminUser();

  if (!admin) {
    redirect("/account");
  }

  const order = await getAdminOrderById(id);

  if (!order) {
    notFound();
  }

  const history = await getOrderHistory(id);

  const paymentLabel = formatPaymentMethod(order.payment);

  let paymentProofUrl: string | null = null;

  if (order.paymentProofPath) {
    const supabase = await createClient();

    const { data, error } = await supabase.storage
      .from("payment-proofs")
      .createSignedUrl(order.paymentProofPath, 60 * 60);

    if (!error) {
      paymentProofUrl = data.signedUrl;
    }
  }

  return (
    <main className="min-w-0 space-y-8 pt-2 lg:pt-8">
      {/* HEADER */}

      <div>
        <Link
          href="/admin/orders"
          className="
            inline-flex
            items-center
            text-[10px]
            uppercase
            tracking-[0.2em]
            text-neutral-500
            transition
            hover:text-neutral-900
          "
        >
          ← Back to Orders
        </Link>

        <div className="mt-6">
          <p className="text-[10px] uppercase tracking-[0.3em] text-neutral-400">
            Workspace / Orders
          </p>

          <div className="mt-3 flex min-w-0 flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="min-w-0">
              <h1 className="break-words text-3xl font-light tracking-tight sm:text-4xl">
                Order Detail
              </h1>

              <p className="mt-2 break-all text-sm font-medium text-neutral-900">
                {order.orderNumber}
              </p>

              <p className="mt-1 text-xs text-neutral-400">
                {formatDateTime(order.createdAt)}
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <StatusBadge
                label={order.status}
                tone="dark"
              />

              <StatusBadge
                label={order.paymentStatus}
              />
            </div>
          </div>
        </div>
      </div>

      {/* CUSTOMER + SHIPPING */}

      <section className="grid min-w-0 gap-6 lg:grid-cols-2">
        <div className="min-w-0 rounded-2xl border border-stone-200 bg-white p-5 sm:p-6">
          <p className="text-[10px] uppercase tracking-[0.3em] text-neutral-400">
            Customer
          </p>

          <div className="mt-5 space-y-2 text-sm leading-6 text-neutral-600">
            <p className="break-words font-medium text-neutral-900">
              {order.customer.email}
            </p>

            <p className="break-words">
              {order.customer.phone}
            </p>
          </div>
        </div>

        <div className="min-w-0 rounded-2xl border border-stone-200 bg-white p-5 sm:p-6">
          <p className="text-[10px] uppercase tracking-[0.3em] text-neutral-400">
            Shipping Address
          </p>

          <div className="mt-5 text-sm leading-7 text-neutral-600">
            <p className="font-medium text-neutral-900">
              {order.address.firstName}{" "}
              {order.address.lastName}
            </p>

            <p>{order.address.street}</p>

            <p>
              {order.address.city},{" "}
              {order.address.province}
            </p>

            <p>{order.address.postalCode}</p>

            <p>{order.address.country}</p>
          </div>
        </div>
      </section>

      {/* ITEMS */}

      <section className="min-w-0 overflow-hidden rounded-2xl border border-stone-200 bg-white">
        <div className="border-b border-stone-200 px-5 py-5 sm:px-6">
          <p className="text-[10px] uppercase tracking-[0.3em] text-neutral-400">
            Order Items
          </p>

          <p className="mt-2 text-sm text-neutral-500">
            {order.items.length}{" "}
            {order.items.length === 1 ? "item" : "items"}
          </p>
        </div>

        <div className="divide-y divide-stone-200">
          {order.items.map((item) => (
            <div
              key={`${item.id}-${item.color ?? ""}-${item.size ?? ""}`}
              className="flex min-w-0 items-start justify-between gap-4 px-5 py-5 sm:px-6"
            >
              <div className="min-w-0">
                <p className="break-words text-sm font-medium text-neutral-900">
                  {item.name}
                </p>

                <p className="mt-1 break-words text-xs leading-5 text-neutral-500">
                  {item.color}

                  {item.color && item.size ? " • " : ""}

                  {item.size}

                  {" • "}

                  Qty {item.quantity}
                </p>
              </div>

              <p className="shrink-0 text-sm font-medium text-neutral-900">
                {formatPrice(item.price * item.quantity)}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* PAYMENT */}

      <section className="min-w-0 rounded-2xl border border-stone-200 bg-white p-5 sm:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-[10px] uppercase tracking-[0.3em] text-neutral-400">
              Payment
            </p>

            <p className="mt-2 text-sm text-neutral-500">
              Payment and order totals.
            </p>
          </div>

          <StatusBadge
            label={order.paymentStatus}
            tone={
              order.paymentStatus === "paid"
                ? "dark"
                : "neutral"
            }
          />
        </div>

        <div className="mt-6 space-y-4">
          <div className="flex justify-between gap-6 text-sm">
            <span className="text-neutral-500">
              Payment Method
            </span>

            <span className="text-right font-medium text-neutral-900">
              {paymentLabel}
            </span>
          </div>

          <div className="flex justify-between gap-6 text-sm">
            <span className="text-neutral-500">
              Payment Status
            </span>

            <span className="text-right font-medium capitalize text-neutral-900">
              {order.paymentStatus}
            </span>
          </div>

          <div className="flex justify-between gap-6 text-sm">
            <span className="text-neutral-500">
              Order Status
            </span>

            <span className="text-right font-medium capitalize text-neutral-900">
              {order.status}
            </span>
          </div>

          <div className="flex justify-between gap-6 text-sm">
            <span className="text-neutral-500">
              Shipping
            </span>

            <span className="text-right text-neutral-900">
              {formatPrice(order.shippingFee)}
            </span>
          </div>

          <div className="border-t border-stone-200 pt-5">
            <div className="flex justify-between gap-6 text-base font-medium">
              <span>Total</span>

              <span>{formatPrice(order.total)}</span>
            </div>
          </div>
        </div>
      </section>

      {/* PAYMENT PROOF */}

      {order.paymentProofPath && (
        <section className="min-w-0 rounded-2xl border border-stone-200 bg-white p-5 sm:p-6">
          <div className="flex min-w-0 flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <p className="text-[10px] uppercase tracking-[0.3em] text-neutral-400">
                Payment Proof
              </p>

              <p className="mt-2 text-sm text-neutral-500">
                Customer payment proof.
              </p>

              {order.paymentProofUploadedAt && (
                <p className="mt-2 text-xs text-neutral-400">
                  Uploaded{" "}
                  {formatDateTime(
                    order.paymentProofUploadedAt,
                  )}
                </p>
              )}
            </div>

            <StatusBadge
              label={
                order.paymentProofVerifiedAt
                  ? "Verified"
                  : "Pending Review"
              }
              tone={
                order.paymentProofVerifiedAt
                  ? "dark"
                  : "neutral"
              }
            />
          </div>

          {paymentProofUrl ? (
            <div className="mt-6">
              <div className="w-fit max-w-full overflow-hidden rounded-xl border border-stone-200 bg-stone-50 p-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={paymentProofUrl}
                  alt="Customer payment proof"
                  className="
                    block
                    max-h-[220px]
                    max-w-full
                    w-auto
                    object-contain
                    sm:max-w-[320px]
                  "
                />
              </div>

              <div className="mt-3">
                <a
                  href={paymentProofUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="
                    text-xs
                    font-medium
                    uppercase
                    tracking-[0.15em]
                    underline
                    underline-offset-4
                    transition
                    hover:text-neutral-500
                  "
                >
                  View Full Payment Proof
                </a>
              </div>

              {!order.paymentProofVerifiedAt && (
                <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                  <form
                    action={
                      verifyAdminPaymentProofAction
                    }
                    className="w-full sm:w-auto"
                  >
                    <input
                      type="hidden"
                      name="orderId"
                      value={order.id}
                    />

                    <VerifyPaymentButton />
                  </form>

                  <form
                    action={
                      rejectAdminPaymentProofAction
                    }
                    className="w-full sm:w-auto"
                  >
                    <input
                      type="hidden"
                      name="orderId"
                      value={order.id}
                    />

                    <button
                      type="submit"
                      className="
                        inline-flex
                        h-11
                        w-full
                        items-center
                        justify-center
                        rounded-full
                        border
                        border-stone-300
                        bg-white
                        px-6
                        text-xs
                        font-medium
                        uppercase
                        tracking-[0.15em]
                        text-neutral-700
                        transition
                        hover:border-black
                        hover:text-black
                        sm:w-auto
                      "
                    >
                      Reject Payment Proof
                    </button>
                  </form>
                </div>
              )}
            </div>
          ) : (
            <p className="mt-6 text-sm text-neutral-500">
              Unable to generate preview.
            </p>
          )}
        </section>
      )}

      {/* ORDER HISTORY */}

      <section className="min-w-0">
        <OrderHistory history={history} />
      </section>

      {/* REFUND */}

      {order.paymentStatus === "paid" &&
        order.status === "processing" && (
          <section className="min-w-0 rounded-2xl border border-stone-200 bg-white p-5 sm:p-6">
            <p className="text-[10px] uppercase tracking-[0.3em] text-neutral-400">
              Payment Action
            </p>

            <h2 className="mt-3 text-lg font-medium">
              Refund Payment
            </h2>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-neutral-500">
              Mark this payment as refunded after the
              refund has been completed.
            </p>

            <form
              className="mt-6"
              action={refundAdminPaymentAction}
            >
              <input
                type="hidden"
                name="orderId"
                value={order.id}
              />

              <RefundPaymentButton />
            </form>
          </section>
        )}

      {/* ORDER MANAGEMENT */}

      <div className="grid min-w-0 gap-6 lg:grid-cols-2">
        <OrderStatusForm
          orderId={order.id}
          orderStatus={order.status}
          paymentStatus={order.paymentStatus}
        />

        <ShippingForm
          orderId={order.id}
          status={order.status}
          courier={order.courier ?? null}
          trackingNumber={order.trackingNumber ?? null}
        />
      </div>
    </main>
  );
}