import { notFound } from "next/navigation";

import Container from "@/components/ui/Container";

import {
  getOrderByIdServer,
} from "@/lib/order-server";

import { formatPrice } from "@/lib/currency";

import {
  formatPaymentMethod,
} from "@/lib/payment";

import PaymentProofUpload from "./PaymentProofUpload";

import OrderTimeline from "@/components/orders/OrderTimeline";
import PaymentCountdown from "@/components/orders/PaymentCountdown";

import ConfirmReceivedButton from "./ConfirmReceivedButton";

import {
  getOrderHistory,
} from "@/lib/order-history";

import OrderHistory from "@/components/orders/OrderHistory";

import OrderReviewSection from "@/components/account/reviews/OrderReviewSection";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

export default async function OrderDetailPage({
  params,
}: Props) {
  const { id } = await params;

  const order = await getOrderByIdServer(id);

  if (!order) {
    notFound();
  }

  const history = await getOrderHistory(id);

  const payment = formatPaymentMethod(
    order.payment
  );

  return (
    <main>
      <Container className="py-24">
        <div className="space-y-10">
          {/* =================================================
              HEADER
          ================================================= */}

          <div>
            <p
              className="
                text-xs
                uppercase
                tracking-[0.3em]
                text-neutral-500
              "
            >
              Order Status
            </p>

            <h1
              className="
                mt-3
                text-4xl
                font-light
                uppercase
              "
            >
              {order.status}
            </h1>

            <p
              className="
                mt-2
                text-sm
                text-neutral-500
              "
            >
              {order.orderNumber}
            </p>
          </div>

          {/* =================================================
              PAYMENT DEADLINE
          ================================================= */}

          <PaymentCountdown
            expiresAt={order.paymentExpiresAt}
            paymentStatus={order.paymentStatus}
            orderStatus={order.status}
          />

          {/* =================================================
              ORDER TIMELINE
          ================================================= */}

          <OrderTimeline
            orderStatus={order.status}
            paymentStatus={order.paymentStatus}
            paymentProofUploaded={
              Boolean(order.paymentProofPath)
            }
          />

          {/* =================================================
              ITEMS
          ================================================= */}

          <section
            className="
              rounded-2xl
              border
              border-stone-200
              p-6
            "
          >
            <h2 className="mb-6 text-lg">
              Items
            </h2>

            <div className="space-y-5">
              {order.items.map((item) => (
                <div
                  key={`
                    ${item.id}-
                    ${item.color ?? ""}-
                    ${item.size ?? ""}
                  `}
                  className="
                    flex
                    justify-between
                    text-sm
                  "
                >
                  <div>
                    <p>
                      {item.name}
                    </p>

                    <p
                      className="
                        text-neutral-500
                      "
                    >
                      {item.color}

                      {item.color &&
                      item.size
                        ? " • "
                        : ""}

                      {item.size}

                      {" x "}

                      {item.quantity}
                    </p>
                  </div>

                  <span>
                    {formatPrice(
                      item.price *
                        item.quantity
                    )}
                  </span>
                </div>
              ))}
            </div>
          </section>

          <OrderReviewSection
            orderId={order.id}
          />

          {/* =================================================
              SHIPPING ADDRESS
          ================================================= */}

          <section
            className="
              rounded-2xl
              border
              border-stone-200
              p-6
            "
          >
            <h2 className="mb-4">
              Shipping Address
            </h2>

            <div
              className="
                text-sm
                leading-7
                text-neutral-600
              "
            >
              <p
                className="
                  font-medium
                  text-black
                "
              >
                {order.address.firstName}

                {" "}

                {order.address.lastName}
              </p>

              <p>
                {order.address.street}
              </p>

              <p>
                {order.address.city}
                {", "}
                {order.address.province}
              </p>

              <p>
                {order.address.postalCode}
              </p>

              <p>
                {order.address.country}
              </p>
            </div>
          </section>

          {/* =================================================
              RECEIVED ORDER
          ================================================= */}

          {order.status === "delivered" && (
            <section
              className="
                rounded-2xl
                border
                border-stone-200
                p-6
              "
            >
              <h2 className="mb-4">
                Received your order?
              </h2>

              <p
                className="
                  mb-5
                  text-sm
                  text-neutral-500
                "
              >
                Confirm once your package has arrived.
              </p>

              <ConfirmReceivedButton
                orderId={order.id}
              />
            </section>
          )}

          {/* =================================================
              ORDER HISTORY
          ================================================= */}

          <OrderHistory
            history={history}
          />

          {/* =================================================
              SHIPMENT
          ================================================= */}

          {order.trackingNumber && (
            <section
              className="
                rounded-2xl
                border
                border-stone-200
                p-6
              "
            >
              <h2 className="mb-4">
                Shipment
              </h2>

              <div
                className="
                  text-sm
                  leading-7
                  text-neutral-600
                "
              >
                <div
                  className="
                    flex
                    justify-between
                  "
                >
                  <span>
                    Courier
                  </span>

                  <span
                    className="
                      font-medium
                      text-black
                    "
                  >
                    {order.courier}
                  </span>
                </div>

                <div
                  className="
                    mt-2
                    flex
                    justify-between
                  "
                >
                  <span>
                    Tracking Number
                  </span>

                  <span
                    className="
                      font-medium
                      text-black
                  "
                  >
                    {order.trackingNumber}
                  </span>
                </div>

                {order.shippedAt && (
                  <div
                    className="
                      mt-2
                      flex
                      justify-between
                    "
                  >
                    <span>
                      Shipped At
                    </span>

                    <span>
                      {new Date(
                        order.shippedAt
                      ).toLocaleDateString(
                        "id-ID"
                      )}
                    </span>
                  </div>
                )}
              </div>
            </section>
          )}

          {/* =================================================
              PAYMENT SUMMARY
          ================================================= */}

          <section
            className="
              rounded-2xl
              border
              border-stone-200
              p-6
            "
          >
            <div
              className="
                flex
                justify-between
                gap-6
              "
            >
              <span>
                Payment
              </span>

              <div className="text-right">
                <p>
                  {payment.title}
                </p>

                <p
                  className="
                    text-sm
                    text-neutral-500
                  "
                >
                  {payment.detail}
                </p>
              </div>
            </div>

            <div
              className="
                mt-4
                flex
                justify-between
                text-sm
              "
            >
              <span>
                Payment Status
              </span>

              <span
                className="
                  font-medium
                  uppercase
                "
              >
                {order.paymentStatus}
              </span>
            </div>

            <div
              className="
                mt-4
                flex
                justify-between
                text-sm
              "
            >
              <span>
                Shipping
              </span>

              <span>
                {formatPrice(
                  order.shippingFee
                )}
              </span>
            </div>

            <div
              className="
                mt-5
                flex
                justify-between
                border-t
                border-stone-200
                pt-5
                text-lg
                font-medium
              "
            >
              <span>
                Total
              </span>

              <span>
                {formatPrice(
                  order.total
                )}
              </span>
            </div>
          </section>

          {order.paymentStatus === "pending" &&
            order.status !== "cancelled" &&
            process.env.NEXT_PUBLIC_WHATSAPP_NUMBER && (
              <section className="rounded-2xl border border-stone-200 p-6">
                <h2 className="mb-2 text-lg font-medium">Konfirmasi via WhatsApp</h2>
                <p className="mb-5 text-sm leading-6 text-neutral-500">
                  Pesan konfirmasi tidak otomatis menyetujui pembayaran. Persetujuan tetap dilakukan admin dan batas waktu pembayaran tetap berjalan.
                </p>
                <a
                  href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER.replace(/\D/g, "")}?text=${encodeURIComponent(`Halo Wearabay, berikut bukti transfer untuk order no. ${order.orderNumber}. Mohon verifikasi pembayaran saya. Terima kasih.`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex w-full items-center justify-center rounded-full border border-stone-300 px-6 py-4 text-xs font-medium uppercase tracking-[0.2em] transition hover:bg-stone-50"
                >
                  Konfirmasi via WhatsApp
                </a>
              </section>
            )}

          {/* =================================================
              PAYMENT PROOF
          ================================================= */}

          {payment.title === "Bank Transfer" &&
            order.paymentStatus === "pending" && (
              <PaymentProofUpload
                orderId={order.id}
                paymentProofPath={
                  order.paymentProofPath
                }
              />
            )}
        </div>
      </Container>
    </main>
  );
}