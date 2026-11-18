
"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";

import { useCart } from "@/context/CartContext";
import { useCheckout } from "@/context/CheckoutContext";
import { formatPrice } from "@/lib/currency";

type Voucher = {
  id: string;
  name: string;
  code: string;
  discount_type: "percentage" | "fixed";
  discount_value: number;
  max_discount: number | null;
  minimum_subtotal: number;
};

type VoucherClaim = {
  id: string;
  vouchers: Voucher | Voucher[] | null;
};

type VoucherResponse = {
  claims?: VoucherClaim[];
};

function getVoucher(claim: VoucherClaim): Voucher | null {
  return Array.isArray(claim.vouchers)
    ? claim.vouchers[0] ?? null
    : claim.vouchers;
}

function calculateDiscount(subtotal: number, voucher: Voucher | null) {
  if (!voucher || subtotal < voucher.minimum_subtotal) return 0;

  let discount =
    voucher.discount_type === "percentage"
      ? Math.round((subtotal * voucher.discount_value) / 100)
      : voucher.discount_value;

  if (voucher.max_discount !== null) {
    discount = Math.min(discount, voucher.max_discount);
  }

  return Math.max(0, Math.min(subtotal, discount));
}

export default function OrderSummary() {
  const { items, subtotal } = useCart();
  const {
    delivery,
    shippingSelection,
    customerVoucherId,
    setCustomerVoucherId,
  } = useCheckout();

  const [claims, setClaims] = useState<VoucherClaim[]>([]);
  const [voucherLoading, setVoucherLoading] = useState(true);
  const [voucherError, setVoucherError] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadVouchers() {
      try {
        const response = await fetch("/api/my-vouchers", {
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error("Gagal memuat voucher.");
        }

        const result = (await response.json()) as VoucherResponse;

        if (!cancelled) {
          const availableClaims = result.claims ?? [];
          setClaims(availableClaims);
          setVoucherError(false);

          if (
            customerVoucherId &&
            !availableClaims.some((claim) => claim.id === customerVoucherId)
          ) {
            setCustomerVoucherId("");
          }
        }
      } catch {
        if (!cancelled) {
          setClaims([]);
          setVoucherError(true);
        }
      } finally {
        if (!cancelled) setVoucherLoading(false);
      }
    }

    void loadVouchers();

    return () => {
      cancelled = true;
    };
  }, [customerVoucherId, setCustomerVoucherId]);

  const selectedClaim = useMemo(
    () => claims.find((claim) => claim.id === customerVoucherId) ?? null,
    [claims, customerVoucherId],
  );

  const selectedVoucher = selectedClaim ? getVoucher(selectedClaim) : null;
  const discount = calculateDiscount(subtotal, selectedVoucher);
  const minimumNotMet =
    selectedVoucher !== null &&
    subtotal < selectedVoucher.minimum_subtotal;

  const isCOD = delivery === "cod_ongkir";
  const shippingIsValid =
    Boolean(shippingSelection) &&
    (isCOD
      ? shippingSelection?.courierCode === "cod"
      : Boolean(delivery) &&
        Boolean(shippingSelection) &&
        `${shippingSelection?.courierCode}:${shippingSelection?.service}` === delivery);

  const shippingPrice =
    shippingIsValid && !isCOD ? shippingSelection?.price ?? 0 : 0;

  const total = Math.max(0, subtotal - (minimumNotMet ? 0 : discount)) + shippingPrice;

  return (
    <section className="rounded-2xl border border-neutral-200 bg-white p-6">
      <h2 className="text-xl font-light">Order Summary</h2>

      <div className="mt-6 space-y-5">
        {items.map((item) => {
          const hasComparePrice =
            typeof item.compareAtPrice === "number" &&
            item.compareAtPrice > item.price;

          const linePrice = item.price * item.quantity;
          const lineComparePrice = hasComparePrice
            ? item.compareAtPrice! * item.quantity
            : null;

          return (
            <div
              key={`${item.id}-${item.color}-${item.size}`}
              className="flex gap-4"
            >
              <div className="relative h-20 w-16 overflow-hidden rounded-lg bg-stone-100">
                <Image
                  src={item.image}
                  alt={item.name}
                  fill
                  sizes="64px"
                  className="object-cover"
                />
              </div>

              <div className="flex flex-1 justify-between gap-4">
                <div>
                  <h3 className="text-sm font-medium text-neutral-900">
                    {item.name}
                  </h3>

                  <p className="mt-1 text-xs text-neutral-500">
                    {item.color}
                    {item.color && item.size ? " • " : ""}
                    {item.size}
                  </p>

                  <p className="mt-2 text-xs text-neutral-500">
                    Qty {item.quantity}
                  </p>
                </div>

                <div className="flex flex-col items-end">
                  {lineComparePrice !== null && (
                    <span className="text-xs text-neutral-400 line-through">
                      {formatPrice(lineComparePrice)}
                    </span>
                  )}

                  <p className="whitespace-nowrap text-sm font-medium text-neutral-900">
                    {formatPrice(linePrice)}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="my-6 border-t border-neutral-200" />

      <div className="mb-6 rounded-xl border border-stone-200 p-4">
        <label
          htmlFor="summary-customer-voucher"
          className="mb-2 block text-sm font-medium text-neutral-800"
        >
          Voucher belanja
        </label>

        <select
          id="summary-customer-voucher"
          value={customerVoucherId}
          onChange={(event) => setCustomerVoucherId(event.target.value)}
          disabled={voucherLoading || voucherError}
          className="w-full rounded-xl border border-stone-300 bg-white px-3 py-3 text-sm text-neutral-800 outline-none focus:border-neutral-900 disabled:bg-stone-100"
        >
          <option value="">Tanpa voucher</option>
          {claims.map((claim) => {
            const voucher = getVoucher(claim);
            if (!voucher) return null;

            return (
              <option key={claim.id} value={claim.id}>
                {voucher.name} — {voucher.code}
              </option>
            );
          })}
        </select>

        {voucherLoading && (
          <p className="mt-2 text-xs text-neutral-500">
            Memuat voucher...
          </p>
        )}

        {voucherError && (
          <p role="alert" className="mt-2 text-xs text-red-700">
            Voucher gagal dimuat. Muat ulang halaman untuk mencoba lagi.
          </p>
        )}

        {!voucherLoading && !voucherError && claims.length === 0 && (
          <p className="mt-2 text-xs text-neutral-500">
            Belum ada voucher yang bisa digunakan.
          </p>
        )}

        {selectedVoucher && (
          <div className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between gap-4">
              <span className="text-neutral-500">Minimum belanja</span>
              <span>{formatPrice(selectedVoucher.minimum_subtotal)}</span>
            </div>

            {minimumNotMet ? (
              <p className="text-xs text-red-700">
                Tambahkan belanja {formatPrice(
                  selectedVoucher.minimum_subtotal - subtotal,
                )} lagi untuk menggunakan voucher ini.
              </p>
            ) : (
              <div className="flex justify-between gap-4">
                <span className="text-neutral-500">Estimasi diskon</span>
                <span className="font-medium text-green-700">
                  -{formatPrice(discount)}
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="space-y-3">
        <div className="flex justify-between text-sm">
          <span>Subtotal</span>
          <span>{formatPrice(subtotal)}</span>
        </div>

        <div className="flex justify-between text-sm">
          <span>Shipping</span>
          <span className="text-right text-neutral-500">
            {!shippingIsValid
              ? "Pilih metode pengiriman"
              : isCOD
                ? "COD — dibayar ke kurir saat tiba"
                : formatPrice(shippingPrice)}
          </span>
        </div>

        {selectedVoucher && !minimumNotMet && (
          <div className="flex justify-between text-sm">
            <span>Diskon voucher</span>
            <span className="text-green-700">
              -{formatPrice(discount)}
            </span>
          </div>
        )}
      </div>

      <div className="my-6 border-t border-neutral-200" />

      <div className="flex items-center justify-between text-lg font-medium">
        <span>Total estimasi</span>
        <span>{formatPrice(total)}</span>
      </div>

      <p className="mt-3 text-xs text-neutral-500">
        Total akhir akan divalidasi kembali oleh server saat pesanan dibuat.
      </p>
    </section>
  );
}
