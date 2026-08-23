"use client";

import { useEffect, useState } from "react";

import Button from "@/components/ui/Button";

import { formatPrice } from "@/lib/currency";

import {
  getOrderById,
  type Order,
} from "@/lib/order";

import { useCart } from "@/context/CartContext";

import {
  confirmPaymentAction,
} from "@/app/account/orders/[id]/actions";


type Props = {
  orderId?: string;
};


export default function PaymentClient({
  orderId,
}: Props) {

  const {
    clearCart,
  } = useCart();

  const [order, setOrder] =
    useState<Order | null>(null);

  const [loading, setLoading] =
    useState(false);


  /* =======================================================
     LOAD ORDER
  ======================================================= */

  useEffect(() => {
  if (!orderId) {
    setOrder(null);
    return;
  }

  let mounted = true;

  async function loadOrder(id: string) {
    try {
      const data = await getOrderById(id);

      if (mounted) {
        setOrder(data ?? null);
      }
    } catch (error) {
      console.error(
        "Failed to load order:",
        error
      );

      if (mounted) {
        setOrder(null);
      }
    }
  }

  loadOrder(orderId);

  return () => {
    mounted = false;
  };
}, [orderId]);


  /* =======================================================
     PAYMENT SUCCESS
  ======================================================= */

  async function handlePaymentSuccess() {

  if (!order) {
    return;
  }


  setLoading(true);


  try {

    const result =
      await confirmPaymentAction(
        order.id
      );


    if (!result.success) {

      setLoading(false);

      alert(
        result.message
      );

      return;

    }


    /* =================================================
       CLEAR CART
    ================================================= */

    await clearCart();


    window.dispatchEvent(
      new Event("cart-updated")
    );


    /* =================================================
       REDIRECT
    ================================================= */

    window.location.href =
      `/checkout/success?order=${order.id}`;

  } catch (error) {

    console.error(
      "Failed to confirm payment:",
      error
    );


    setLoading(false);


    alert(
      "Unable to confirm payment. Please try again."
    );

  }

}


  /* =======================================================
     ORDER NOT FOUND
  ======================================================= */

  if (!order) {

    return (

      <div
        className="
          rounded-2xl
          border
          border-stone-200
          p-8
        "
      >

        <h1
          className="
            text-2xl
            font-light
          "
        >
          Order Not Found
        </h1>

        <p
          className="
            mt-3
            text-sm
            text-neutral-500
          "
        >
          This order may no longer exist.
        </p>

      </div>

    );

  }


  /* =======================================================
     PAYMENT LABEL
  ======================================================= */

  const paymentLabel =
    order.payment === "bank"
      ? "Bank Transfer"
      : order.payment === "ewallet"
        ? "E-Wallet"
        : order.payment === "qris"
          ? "QRIS"
          : "Cash on Delivery";


  /* =======================================================
     RENDER
  ======================================================= */

  return (

    <div
      className="
        mx-auto
        max-w-2xl
        space-y-8
      "
    >

      {/* ===================================================
          HEADER
      =================================================== */}

      <section
        className="
          rounded-2xl
          border
          border-stone-200
          p-8
        "
      >

        <p
          className="
            text-xs
            uppercase
            tracking-[0.3em]
            text-neutral-500
          "
        >
          Payment
        </p>


        <h1
          className="
            mt-4
            text-3xl
            font-light
          "
        >
          Complete Your Payment
        </h1>


        <div className="mt-6 space-y-2">

          <p
            className="
              text-sm
              text-neutral-500
            "
          >
            Order Number
          </p>


          <p className="font-medium">
            {order.id}
          </p>


          <p
            className="
              text-sm
              text-neutral-500
            "
          >
            Status: {order.status}
          </p>

        </div>

      </section>


      {/* ===================================================
          ITEMS
      =================================================== */}

      <section
        className="
          rounded-2xl
          border
          border-stone-200
          p-8
        "
      >

        <h2
          className="
            mb-6
            text-lg
            font-medium
          "
        >
          Order Summary
        </h2>


        <div className="space-y-5">

          {order.items.map(
            (item) => (

              <div
                key={`${item.id}-${item.color}-${item.size}`}
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

                    {" "}
                    x {item.quantity}

                  </p>

                </div>


                <p>

                  {formatPrice(
                    item.price *
                    item.quantity
                  )}

                </p>

              </div>

            )
          )}

        </div>


        <div
          className="
            mt-8
            flex
            justify-between
            border-t
            pt-6
            text-lg
            font-medium
          "
        >

          <span>
            Total
          </span>


          <span>

            {formatPrice(
              order.subtotal
            )}

          </span>

        </div>

      </section>


      {/* ===================================================
          PAYMENT METHOD
      =================================================== */}

      <section
        className="
          rounded-2xl
          border
          border-stone-200
          p-8
        "
      >

        <h2
          className="
            mb-4
            text-lg
            font-medium
          "
        >
          Payment Method
        </h2>


        <p className="text-sm font-medium">
          {paymentLabel}
        </p>

      </section>


      {/* ===================================================
          CONFIRM PAYMENT
      =================================================== */}

      <Button
        fullWidth
        disabled={loading}
        onClick={handlePaymentSuccess}
      >

        {loading
          ? "Processing..."
          : "Confirm Payment"}

      </Button>

    </div>

  );

}