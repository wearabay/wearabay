"use client";

import { useRouter } from "next/navigation";

import Button from "@/components/ui/Button";

import { useCart } from "@/context/CartContext";
import { useCheckout } from "@/context/CheckoutContext";

import { createOrder } from "@/lib/order";


export default function PlaceOrder() {

  const router = useRouter();


  const {
    items,
    subtotal,
    clearCart,
  } = useCart();


  const {
    contact,
    address,
    delivery,
    payment,
  } = useCheckout();

  async function handlePlaceOrder() {
  if (!items.length) {
    router.push("/cart");
    return;
  }

  try {
    const order = await createOrder({
      items,

      customer: {
        email: contact.email,
        phone: contact.phone,
      },

      address,

      delivery,

      payment,

      subtotal,

      shippingFee: 0,

      total: subtotal,

      status: "pending",

      paymentStatus: "pending",
    });

    router.push(
      `/checkout/payment?order=${order.id}`
    );

  } catch (error) {
    console.error(
      "Failed to create order:",
      error
    );

    alert(
      "Unable to place your order. Please try again."
    );
  }
}

  return (

    <section
      className="
        rounded-2xl
        border
        border-stone-200
        bg-white
        p-6
      "
    >

      <h2 className="mb-4 text-lg font-medium">
        Complete Order
      </h2>

      <p className="
        mb-6
        text-sm
        text-neutral-500
      ">
        By placing your order, you agree to our
        terms and conditions.
      </p>


      <Button
        fullWidth
        onClick={handlePlaceOrder}
      >
        Place Order
      </Button>
    </section>
  );
}