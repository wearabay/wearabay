
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import Button from "@/components/ui/Button";
import { useCheckout } from "@/context/CheckoutContext";
import { useCart } from "@/context/CartContext";
import { validateCheckout as validateCheckoutFields } from "@/lib/checkout-validation";

export default function CheckoutActions() {
  const router = useRouter();
  const { items } = useCart();

  const {
    contact,
    address,
    delivery,
    shippingSelection,
    setErrors,
  } = useCheckout();

  const [loading, setLoading] = useState(false);

  function handleContinue() {
    if (loading) return;

    if (items.length === 0) {
      router.push("/cart");
      return;
    }

    const errors = validateCheckoutFields(contact, address);

    const nextErrors: Record<string, string> = {
      ...errors,
    };

    const isCOD = delivery === "cod_ongkir";

    const validShipping =
      Boolean(shippingSelection) &&
      (isCOD
        ? shippingSelection?.courierCode === "cod"
        : Boolean(delivery) &&
          `${shippingSelection?.courierCode}:${shippingSelection?.service}` ===
            delivery &&
          Number.isFinite(shippingSelection?.price) &&
          (shippingSelection?.price ?? -1) >= 0 &&
          (shippingSelection?.courierCode === "jne" ||
            shippingSelection?.courierCode === "jnt"));

    if (!validShipping) {
      nextErrors.shipping =
        "Pilih COD atau jasa pengiriman yang tersedia terlebih dahulu.";
    }

    setErrors(nextErrors);

    const firstError = Object.keys(nextErrors).find(
      (key) => Boolean(nextErrors[key]),
    );

    if (firstError) {
      const element = document.getElementById(firstError);

      if (element) {
        element.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });

        if (
          element instanceof HTMLInputElement ||
          element instanceof HTMLSelectElement ||
          element instanceof HTMLTextAreaElement
        ) {
          element.focus();
        }
      } else if (firstError === "shipping") {
        document
          .querySelector('[data-checkout-shipping]')
          ?.scrollIntoView({
            behavior: "smooth",
            block: "center",
          });
      }

      return;
    }

    setLoading(true);
    router.push("/checkout/review");
  }

  return (
    <div className="mt-10 flex flex-col items-end gap-3">
      <Button onClick={handleContinue} disabled={loading}>
        {loading ? "Processing..." : "Continue to Payment"}
      </Button>

      {items.length === 0 && (
        <p className="text-sm text-red-700">
          Keranjang belanja kosong.
        </p>
      )}
    </div>
  );
}
