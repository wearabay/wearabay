"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/Button";
import { useCart } from "@/context/CartContext";
import { useCheckout } from "@/context/CheckoutContext";
type CreateOrderResponse = {
  order?: {
    id: string;
  };
  error?: string;
};
export default function PlaceOrder() {
  const router = useRouter();
  const { items, clearCart } = useCart();
  const {
    contact,
    address,
    delivery,
    payment,
    shippingSelection,
    validateCheckout,
  } = useCheckout();
  const [loading, setLoading] = useState(false);
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
    if (
      !shippingSelection ||
      !delivery ||
      `${shippingSelection.courierCode}:${shippingSelection.service}` !==
        delivery
    ) {
      alert("Pilih layanan JNE atau J&T terlebih dahulu.");
      return;
    }
    if (
      !Number.isFinite(shippingSelection.price) ||
      shippingSelection.price < 0
    ) {
      alert("Tarif pengiriman tidak valid. Pilih layanan lagi.");
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
        }),
      });
      const result =
        (await response.json()) as CreateOrderResponse;
      if (!response.ok) {
        throw new Error(
          result.error ?? "Gagal membuat pesanan. Silakan coba lagi.",
        );
      }
      if (!result.order?.id) {
        throw new Error(
          "Pesanan tidak mengembalikan ID yang valid.",
        );
      }
      await clearCart();
      window.dispatchEvent(new Event("cart-updated"));
      router.push(`/checkout/payment?order=${result.order.id}`);
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
      <p className="mb-4 text-sm text-neutral-500">
        By placing your order, you agree to our terms and conditions.
      </p>
      {shippingSelection && (
        <div className="mb-6 rounded-xl bg-stone-50 p-4 text-sm">
          <div className="flex justify-between gap-4">
            <span className="text-neutral-600">
              Pengiriman
            </span>
            <span className="text-right font-medium">
              {shippingSelection.courier} ·{" "}
              {shippingSelection.service}
            </span>
          </div>
          <div className="mt-2 flex justify-between gap-4">
            <span className="text-neutral-600">
              Ongkir tertera
            </span>
            <span className="font-medium">
              {new Intl.NumberFormat("id-ID", {
                style: "currency",
                currency: "IDR",
                maximumFractionDigits: 0,
              }).format(shippingSelection.price)}
            </span>
          </div>
        </div>
      )}
      <Button
        fullWidth
        disabled={loading}
        onClick={handlePlaceOrder}
      >
        {loading ? "Memproses Pesanan..." : "Place Order"}
      </Button>
    </section>
  );
}