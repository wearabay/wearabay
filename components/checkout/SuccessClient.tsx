"use client";

import { useEffect, useState } from "react";

import Button from "@/components/ui/Button";

import {
  getOrderById,
  type Order,
} from "@/lib/order";

import { formatPrice } from "@/lib/currency";


type Props = {
  orderId?: string;
};


export default function SuccessClient({
  orderId,
}: Props) {

  const [order, setOrder] =
    useState<Order | null>(null);

  const [loading, setLoading] =
    useState(true);


  /* =======================================================
     LOAD ORDER
  ======================================================= */

  useEffect(() => {

    let mounted = true;


    async function loadOrder() {

      if (!orderId) {

        if (mounted) {
          setOrder(null);
          setLoading(false);
        }

        return;
      }


      try {

        const data =
          await getOrderById(orderId);


        if (mounted) {

          setOrder(
            data ?? null
          );

          setLoading(false);

        }

      } catch (error) {

        console.error(
          "Failed to load order:",
          error
        );


        if (mounted) {

          setOrder(null);
          setLoading(false);

        }

      }

    }


    loadOrder();


    return () => {
      mounted = false;
    };

  }, [orderId]);


  /* =======================================================
     LOADING
  ======================================================= */

  if (loading) {

    return (

      <div
        className="
          text-center
          text-neutral-500
        "
      >
        Loading order...
      </div>

    );

  }


  /* =======================================================
     ORDER NOT FOUND
  ======================================================= */

  if (!order) {

    return (

      <div
        className="
          mx-auto
          max-w-xl
          text-center
        "
      >

        <h1
          className="
            text-3xl
            font-light
          "
        >
          Order Not Found
        </h1>


        <p
          className="
            mt-4
            text-neutral-500
          "
        >
          This order may no longer exist.
        </p>


        <Button
          href="/shop"
          variant="outline"
          className="mt-8"
        >
          Back To Shop
        </Button>

      </div>

    );

  }


  /* =======================================================
     SUCCESS
  ======================================================= */

  return (

    <div
      className="
        mx-auto
        max-w-xl
        text-center
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
        Order Confirmed
      </p>


      <h1
        className="
          mt-6
          text-4xl
          font-light
        "
      >
        Thank You For Your Order
      </h1>


      <p
        className="
          mt-4
          text-sm
          leading-7
          text-neutral-500
        "
      >
        Your order has been received.
        We will prepare your order from
        wearabay.
      </p>


      {/* =================================================
          ORDER INFORMATION
      ================================================= */}

      <div
        className="
          mt-10
          space-y-5
          rounded-2xl
          border
          border-stone-200
          p-8
          text-left
        "
      >

        {/* Order Number */}

        <div>

          <p
            className="
              text-xs
              uppercase
              tracking-widest
              text-neutral-500
            "
          >
            Order Number
          </p>


          <p className="
  mt-2
  font-medium
">
  {order.orderNumber}
</p>

        </div>


        {/* Status */}

        <div
          className="
            flex
            justify-between
          "
        >

          <span className="text-neutral-500">
            Status
          </span>


          <span
            className="
              font-medium
              uppercase
            "
          >
            {order.status}
          </span>

        </div>


        {/* Total */}

        <div
          className="
            flex
            justify-between
          "
        >

          <span className="text-neutral-500">
            Total
          </span>


          <span className="font-medium">
            {formatPrice(order.total)}
          </span>

        </div>

      </div>


      {/* =================================================
          ACTIONS
      ================================================= */}

      <div
        className="
          mt-10
          flex
          flex-col
          gap-4
        "
      >

        <Button
          href={`/account/orders/${order.id}`}
          fullWidth
        >
          View Order
        </Button>


        <Button
          href="/shop"
          variant="outline"
          fullWidth
        >
          Continue Shopping
        </Button>

      </div>

    </div>

  );

}