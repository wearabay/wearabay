
"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/Button";
import { useCart } from "@/context/CartContext";
import { useCheckout } from "@/context/CheckoutContext";

type Voucher = {
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

type VoucherClaimsResponse = {
  claims?: VoucherClaim[];
};

type CreateOrderResponse = {
  order?: {
    id: string;
  };
  error?: string;
};

function getVoucher(claim: VoucherClaim): Voucher | null {
  return Array.isArray(claim.vouchers)
    ? claim.vouchers[0] ?? null
    : claim.vouchers;
}

function money(value: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);
}

function calculateDiscount(
  subtotal: number,
  voucher: Voucher | null,
): number {
  if (!voucher || subtotal < voucher.minimum_subtotal) {
    return 0;
  }

  let discount =
    voucher.discount_type === "percentage"
      ? Math.round(
          (subtotal * voucher.discount_value) / 100,
        )
      : voucher.discount_value;

  if (voucher.max_discount !== null) {
    discount = Math.min(discount, voucher.max_discount);
  }

  return Math.max(0, Math.min(subtotal, discount));
}

export default function PlaceOrder() {
  const router = useRouter();
  const { items, subtotal, clearCart } = useCart();

  const {
    contact,
    address,
    delivery,
    payment,
    shippingSelection,
    validateCheckout,
  } = useCheckout();

  const [loading, setLoading] = useState(false);
  const [voucherClaims, setVoucherClaims] = useState<VoucherClaim[]>([]);
  const [customerVoucherId, setCustomerVoucherId] = useState("");
  const [voucherLoading, setVoucherLoading] = useState(true);
  const [voucherLoadError, setVoucherLoadError] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function fetchClaims() {
      try {
        const response = await fetch("/api/my-vouchers", {
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error("Gagal memuat voucher.");
        }

        const result =
          (await response.json()) as VoucherClaimsResponse;

        if (!cancelled) {
          setVoucherClaims(result.claims ?? []);
          setVoucherLoadError(false);
        }
      } catch {
        if (!cancelled) {
          setVoucherClaims([]);
          setVoucherLoadError(true);
        }
      } finally {
        if (!cancelled) {
          setVoucherLoading(false);
        }
      }
    }

    void fetchClaims();

    return () => {
      cancelled = true;
    };
  }, []);

  const selectedClaim = useMemo(
    () =>
      voucherClaims.find(
        (claim) => claim.id === customerVoucherId,
      ) ?? null,
    [voucherClaims, customerVoucherId],
  );

  const selectedVoucher = selectedClaim
    ? getVoucher(selectedClaim)
    : null;

  const estimatedDiscount = calculateDiscount(
    subtotal,
    selectedVoucher,
  );

  const minimumNotMet =
    selectedVoucher !== null &&
    subtotal < selectedVoucher.minimum_subtotal;

  async function handlePlaceOrder() {
    if (loading) return;

    if (!items.length) {
      router.push("/cart");
      return;
    }

    if (!validateCheckout()) {
      alert(
        "Periksa kembali data kontak, alamat, dan pilihan pengiriman sebelum melanjutkan.",
      );
      return;
    }

    if (voucherLoadError) {
      alert(
        "Voucher belum berhasil dimuat. Muat ulang halaman sebelum membuat pesanan.",
      );
      return;
    }

    if (
      customerVoucherId &&
      !selectedClaim
    ) {
      alert(
        "Voucher yang dipilih tidak tersedia. Pilih voucher lain atau muat ulang halaman.",
      );
      return;
    }

    if (minimumNotMet) {
      alert(
        `Minimum belanja voucher adalah ${money(selectedVoucher.minimum_subtotal)}.`,
      );
      return;
    }

    const isCODShipping = delivery === "cod_ongkir";

    if (
      !shippingSelection ||
      !delivery ||
      (!isCODShipping &&
        `${shippingSelection.courierCode}:${shippingSelection.service}` !==
          delivery) ||
      (isCODShipping &&
        shippingSelection.courierCode !== "cod")
    ) {
      alert("Pilih layanan pengiriman terlebih dahulu.");
      return;
    }

    if (
      !isCODShipping &&
      (!Number.isFinite(shippingSelection.price) ||
        shippingSelection.price < 0)
    ) {
      alert(
        "Tarif pengiriman tidak valid. Pilih layanan lagi.",
      );
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        cache: "no-store",
        body: JSON.stringify({
          items: items.map((item) => ({
            id: item.id,
            quantity: item.quantity,
            color: item.color ?? null,
            size: item.size ?? null,
          })),
          customer: {
            email: contact.email,
            phone: contact.phone,
          },
          address,
          delivery,
          payment,
          shippingSelection: {
            courierCode: shippingSelection.courierCode,
            service: shippingSelection.service,
            destinationId: shippingSelection.destinationId,
          },
          customerVoucherId: customerVoucherId || null,
        }),
      });

      const result =
        (await response.json()) as CreateOrderResponse;

      if (!response.ok) {
        throw new Error(
          result.error ??
            "Gagal membuat pesanan. Silakan coba lagi.",
        );
      }

      if (!result.order?.id) {
        throw new Error(
          "Pesanan tidak mengembalikan ID yang valid.",
        );
      }

      await clearCart();
      window.dispatchEvent(new Event("cart-updated"));
      router.push(
        `/checkout/payment?order=${result.order.id}`,
      );
    } catch (error) {
      console.error("Failed to create order:", error);

      alert(
        error instanceof Error
          ? error.message
          : "Gagal membuat pesanan. Silakan coba lagi.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="rounded-2xl border border-stone-200 bg-white p-6">
      <h2 className="mb-4 text-lg font-medium">
        Complete Order
      </h2>

      <p className="mb-6 text-sm text-neutral-500">
        By placing your order, you agree to our terms and
        conditions.
      </p>

      <div className="mb-6 rounded-xl border border-stone-200 p-4">
        <label
          htmlFor="customer-voucher"
          className="mb-2 block text-sm font-medium text-neutral-800"
        >
          Voucher belanja
        </label>

        <select
          id="customer-voucher"
          value={customerVoucherId}
          onChange={(event) =>
            setCustomerVoucherId(event.target.value)
          }
          disabled={voucherLoading || loading}
          className="w-full rounded-xl border border-stone-300 bg-white px-3 py-3 text-sm text-neutral-800 outline-none focus:border-neutral-900 disabled:bg-stone-100"
        >
          <option value="">Tanpa voucher</option>

          {voucherClaims.map((claim) => {
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

        {voucherLoadError && (
          <p role="alert" className="mt-2 text-xs text-red-700">
            Gagal memuat voucher. Muat ulang halaman sebelum
            checkout.
          </p>
        )}

        {!voucherLoading &&
          !voucherLoadError &&
          voucherClaims.length === 0 && (
            <p className="mt-2 text-xs text-neutral-500">
              Belum ada voucher yang bisa digunakan. Klaim
              voucher terlebih dahulu di halaman Voucher.
            </p>
          )}

        {selectedVoucher && (
          <div className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between gap-4">
              <span className="text-neutral-500">
                Minimum belanja
              </span>
              <span className="text-right">
                {money(selectedVoucher.minimum_subtotal)}
              </span>
            </div>

            {minimumNotMet ? (
              <p className="text-xs text-red-700">
                Tambahkan belanja sebesar{" "}
                {money(
                  selectedVoucher.minimum_subtotal - subtotal,
                )}{" "}
                lagi untuk menggunakan voucher ini.
              </p>
            ) : (
              <div className="flex justify-between gap-4">
                <span className="text-neutral-500">
                  Estimasi diskon
                </span>
                <span className="font-medium text-green-700">
                  -{money(estimatedDiscount)}
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      {shippingSelection && (
        <div className="mb-6 rounded-xl bg-stone-50 p-4 text-sm">
          <div className="flex justify-between gap-4">
            <span className="text-neutral-600">
              Pengiriman
            </span>
            <span className="text-right font-medium">
              {delivery === "cod_ongkir"
                ? "COD"
                : shippingSelection.courier}
            </span>
          </div>

          <div className="mt-2 flex justify-between gap-4">
            <span className="text-neutral-600">
              Ongkir
            </span>
            <span className="text-right font-medium">
              {delivery === "cod_ongkir"
                ? "Dibayar ke kurir saat tiba"
                : money(shippingSelection.price)}
            </span>
          </div>

          <div className="mt-2 flex justify-between gap-4">
            <span className="text-neutral-600">
              Subtotal
            </span>
            <span className="font-medium">
              {money(subtotal)}
            </span>
          </div>

          {selectedVoucher && !minimumNotMet && (
            <div className="mt-2 flex justify-between gap-4">
              <span className="text-neutral-600">
                Diskon voucher (estimasi)
              </span>
              <span className="font-medium text-green-700">
                -{money(estimatedDiscount)}
              </span>
            </div>
          )}

          <p className="mt-3 text-xs text-neutral-500">
            Total akhir dihitung dan divalidasi oleh server
            saat pesanan dibuat.
          </p>
        </div>
      )}

      <Button
        fullWidth
        disabled={
          loading ||
          voucherLoading ||
          voucherLoadError ||
          minimumNotMet
        }
        onClick={handlePlaceOrder}
      >
        {loading ? "Memproses Pesanan..." : "Place Order"}
      </Button>
    </section>
  );
}
