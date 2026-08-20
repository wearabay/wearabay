"use client";

import {
  useEffect,
  useState,
  useTransition,
} from "react";

import {
  updateAdminOrderStatusAction,
  updateAdminPaymentStatusAction,
} from "./actions";

import type {
  OrderStatus,
  PaymentStatus,
} from "@/lib/order";


type Props = {
  orderId: string;

  orderStatus: OrderStatus;

  paymentStatus: PaymentStatus;
};


const orderStatuses: OrderStatus[] = [
  "pending",
  "paid",
  "processing",
  "shipped",
  "completed",
  "cancelled",
];


const paymentStatuses: PaymentStatus[] = [
  "pending",
  "paid",
  "failed",
  "expired",
  "refunded",
];


function formatLabel(
  value: string
) {

  return value
    .replaceAll(
      "_",
      " "
    )
    .replace(
      /\b\w/g,
      (letter) =>
        letter.toUpperCase()
    );

}


export default function OrderStatusForm({
  orderId,
  orderStatus,
  paymentStatus,
}: Props) {

  const [
  currentOrderStatus,
  setCurrentOrderStatus,
] =
  useState<OrderStatus>(
    orderStatus
  );


const [
  currentPaymentStatus,
  setCurrentPaymentStatus,
] =
  useState<PaymentStatus>(
    paymentStatus
  );


useEffect(() => {

  setCurrentOrderStatus(
    orderStatus
  );

}, [
  orderStatus,
]);


useEffect(() => {

  setCurrentPaymentStatus(
    paymentStatus
  );

}, [
  paymentStatus,
]);

  const [
    isPending,
    startTransition,
  ] =
    useTransition();


  const [
    message,
    setMessage,
  ] =
    useState("");


  function handleOrderStatusChange(
    value: OrderStatus
  ) {

    setMessage("");


    startTransition(
      async () => {

        try {

          const result =
            await updateAdminOrderStatusAction(
              orderId,
              value
            );


          if (!result.success) {

            setMessage(
              result.message
            );

            return;

          }


          setCurrentOrderStatus(
            value
          );


          setMessage(
            "Order status updated."
          );

        } catch (error) {

          console.error(
            error
          );

          setMessage(
            "Failed to update order status."
          );

        }

      }
    );

  }


  function handlePaymentStatusChange(
    value: PaymentStatus
  ) {

    setMessage("");


    startTransition(
      async () => {

        try {

          const result =
            await updateAdminPaymentStatusAction(
              orderId,
              value
            );


          if (!result.success) {

            setMessage(
              result.message
            );

            return;

          }


          setCurrentPaymentStatus(
            value
          );


          setMessage(
            "Payment status updated."
          );

        } catch (error) {

          console.error(
            error
          );

          setMessage(
            "Failed to update payment status."
          );

        }

      }
    );

  }


  return (

    <section
      className="
        rounded-2xl
        border
        border-stone-200
        p-6
      "
    >

      <h2
        className="
          mb-6
          text-lg
          font-medium
        "
      >
        Manage Order
      </h2>


      <div className="space-y-6">


        {/* Order Status */}

        <div>

          <label
            htmlFor="order-status"
            className="
              mb-2
              block
              text-xs
              uppercase
              tracking-[0.2em]
              text-neutral-500
            "
          >
            Order Status
          </label>


          <select
            id="order-status"
            value={currentOrderStatus}
            disabled={isPending}
            onChange={(event) =>
              handleOrderStatusChange(
                event.target.value as OrderStatus
              )
            }
            className="
              h-12
              w-full
              rounded-xl
              border
              border-stone-300
              bg-white
              px-4
              text-sm
              outline-none
              focus:border-black
            "
          >

            {orderStatuses.map(
              (status) => (

                <option
                  key={status}
                  value={status}
                >
                  {formatLabel(status)}
                </option>

              )
            )}

          </select>

        </div>


        {/* Payment Status */}

        <div>

          <label
            htmlFor="payment-status"
            className="
              mb-2
              block
              text-xs
              uppercase
              tracking-[0.2em]
              text-neutral-500
            "
          >
            Payment Status
          </label>


          <select
            id="payment-status"
            value={currentPaymentStatus}
            disabled={isPending}
            onChange={(event) =>
              handlePaymentStatusChange(
                event.target.value as PaymentStatus
              )
            }
            className="
              h-12
              w-full
              rounded-xl
              border
              border-stone-300
              bg-white
              px-4
              text-sm
              outline-none
              focus:border-black
            "
          >

            {paymentStatuses.map(
              (status) => (

                <option
                  key={status}
                  value={status}
                >
                  {formatLabel(status)}
                </option>

              )
            )}

          </select>

        </div>


        {isPending && (

          <p
            className="
              text-sm
              text-neutral-500
            "
          >
            Updating...
          </p>

        )}


        {!isPending && message && (

          <p
            className="
              text-sm
              text-neutral-600
            "
          >
            {message}
          </p>

        )}

      </div>

    </section>

  );

}