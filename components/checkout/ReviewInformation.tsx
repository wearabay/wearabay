
"use client";

import { useCheckout } from "@/context/CheckoutContext";

export default function ReviewInformation() {
  const { contact, address, delivery, payment, shippingSelection } =
    useCheckout();

  const isCOD = delivery === "cod_ongkir";

  const deliveryLabel = isCOD
    ? "COD — ongkir dibayar ke kurir saat paket tiba"
    : shippingSelection
      ? `${shippingSelection.courier} — ${shippingSelection.service}`
      : "Metode pengiriman belum dipilih";

  const paymentLabel =
    payment === "bank"
      ? "Bank Transfer"
      : payment === "ewallet"
        ? "E-Wallet"
        : payment === "qris"
          ? "QRIS"
          : "Cash on Delivery";

  return (
    <div className="space-y-8">
      <section className="rounded-2xl border border-stone-200 bg-white p-6">
        <h2 className="mb-5 text-lg font-medium">
          Contact Information
        </h2>

        <div className="space-y-3 text-sm">
          <div className="flex justify-between gap-4">
            <span className="text-neutral-500">Email</span>
            <span className="break-all text-right font-medium">
              {contact.email}
            </span>
          </div>

          <div className="flex justify-between gap-4">
            <span className="text-neutral-500">Phone</span>
            <span className="text-right font-medium">
              {contact.phone}
            </span>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-stone-200 bg-white p-6">
        <h2 className="mb-5 text-lg font-medium">
          Shipping Address
        </h2>

        <div className="space-y-3 text-sm">
          <p className="font-medium">
            {address.firstName} {address.lastName}
          </p>

          {address.company && <p>{address.company}</p>}

          <p>{address.street}</p>

          {address.apartment && <p>{address.apartment}</p>}

          <p>
            {[address.village, address.district, address.city, address.province]
              .filter(Boolean)
              .join(", ")}
          </p>

          <p>{address.postalCode}</p>
          <p>{address.country}</p>
        </div>
      </section>

      <section className="rounded-2xl border border-stone-200 bg-white p-6">
        <h2 className="mb-5 text-lg font-medium">
          Delivery Method
        </h2>

        <p className="text-sm font-medium">{deliveryLabel}</p>

        {!isCOD && shippingSelection && (
          <>
            {shippingSelection.description && (
              <p className="mt-1 text-sm text-neutral-500">
                {shippingSelection.description}
              </p>
            )}

            <p className="mt-2 text-sm">
              Ongkir:{" "}
              {new Intl.NumberFormat("id-ID", {
                style: "currency",
                currency: "IDR",
                maximumFractionDigits: 0,
              }).format(shippingSelection.price)}
            </p>
          </>
        )}

        {isCOD && (
          <p className="mt-1 text-sm text-neutral-500">
            Ongkir dibayarkan langsung kepada kurir saat paket tiba.
          </p>
        )}
      </section>

      <section className="rounded-2xl border border-stone-200 bg-white p-6">
        <h2 className="mb-5 text-lg font-medium">
          Payment Method
        </h2>

        <p className="text-sm font-medium">{paymentLabel}</p>
      </section>
    </div>
  );
}
