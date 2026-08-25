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

import {
  canUpdateOrderStatus,
  canUpdatePaymentStatus,
} from "@/lib/order-status";


type Props = {
  orderId: string;

  orderStatus: OrderStatus;

  paymentStatus: PaymentStatus;
};


/* =========================================================
   ORDER FLOW
========================================================= */

const orderFlow: Record<
  OrderStatus,
  OrderStatus[]
> = {

  pending: [
    "pending",
    "paid",
    "cancelled",
  ],

  paid: [
    "paid",
    "processing",
    "cancelled",
  ],

  processing: [
    "processing",
    "shipped",
    "cancelled",
  ],

  shipped: [
    "shipped",
    "delivered",
  ],

  delivered: [
    "delivered",
    "completed",
  ],

  completed: [
    "completed",
  ],

  cancelled: [
    "cancelled",
  ],

};


/* =========================================================
   PAYMENT FLOW
========================================================= */

const paymentFlow: Record<
  PaymentStatus,
  PaymentStatus[]
> = {

  pending: [
    "pending",
    "paid",
    "failed",
    "expired",
  ],

  paid: [
    "paid",
    "refunded",
  ],

  failed: [
    "failed",
    "pending",
  ],

  expired: [
    "expired",
    "pending",
  ],

  refunded: [
    "refunded",
  ],

};


/* =========================================================
   FORMAT LABEL
========================================================= */

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


/* =========================================================
   STATUS SELECT
========================================================= */

type StatusSelectProps = {
  value: string;

  options: string[];

  disabled?: boolean;

  open: boolean;

  onToggle: () => void;

  onSelect: (
    value: string
  ) => void;
};


function StatusSelect({
  value,
  options,
  disabled,
  open,
  onToggle,
  onSelect,
}: StatusSelectProps) {

  return (

    <div
      className="
        overflow-hidden
        rounded-xl
        border
        border-stone-300
        bg-white
      "
    >

      {/* =================================================
          SELECTED VALUE
      ================================================= */}

      <button
        type="button"
        disabled={disabled}
        onClick={onToggle}
        className="
          flex
          h-12
          w-full
          items-center
          justify-between
          bg-white
          px-4
          text-left
          outline-none
          transition
          hover:bg-stone-50
          disabled:cursor-not-allowed
          disabled:opacity-60
        "
      >

        <span
          className="
            text-sm
            font-medium
            text-black
          "
        >
          {formatLabel(value)}
        </span>


        <span
          className={`
            text-xs
            text-neutral-400
            transition-transform
            ${open ? "rotate-180" : ""}
          `}
        >
          ↓
        </span>

      </button>


      {/* =================================================
          INLINE OPTIONS
      ================================================= */}

      {open && (

        <div
          className="
            border-t
            border-stone-200
            bg-white
          "
        >

          {options.map(
            (option) => {

              const selected =
                option === value;


              return (

                <button
                  key={option}
                  type="button"
                  disabled={disabled}
                  onClick={() =>
                    onSelect(option)
                  }
                  className="
                    flex
                    min-h-12
                    w-full
                    items-center
                    justify-between
                    border-b
                    border-stone-100
                    px-4
                    text-left
                    last:border-b-0
                    transition
                    hover:bg-stone-50
                    disabled:cursor-not-allowed
                  "
                >

                  <span
                    className={`
                      transition-all
                      ${
                        selected
                          ? `
                            text-[15px]
                            font-extrabold
                            text-black
                          `
                          : `
                            text-sm
                            font-normal
                            text-neutral-600
                          `
                      }
                    `}
                  >
                    {formatLabel(option)}
                  </span>


                  {selected && (

                    <span
                      className="
                        text-base
                        font-extrabold
                        text-black
                      "
                    >
                      ✓
                    </span>

                  )}

                </button>

              );

            }
          )}

        </div>

      )}

    </div>

  );

}


/* =========================================================
   MAIN
========================================================= */

export default function OrderStatusForm({
  orderId,
  orderStatus,
  paymentStatus,
}: Props) {


  /* =======================================================
     ORDER STATUS
  ======================================================= */

  const [
    currentOrderStatus,
    setCurrentOrderStatus,
  ] =
    useState<OrderStatus>(
      orderStatus
    );


  /* =======================================================
     PAYMENT STATUS
  ======================================================= */

  const [
    currentPaymentStatus,
    setCurrentPaymentStatus,
  ] =
    useState<PaymentStatus>(
      paymentStatus
    );


  /* =======================================================
     OPEN STATE
  ======================================================= */

  const [
    orderStatusOpen,
    setOrderStatusOpen,
  ] =
    useState(false);


  const [
    paymentStatusOpen,
    setPaymentStatusOpen,
  ] =
    useState(false);


  /* =======================================================
     SYNC SERVER VALUE
  ======================================================= */

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


  /* =======================================================
     TRANSITION
  ======================================================= */

  const [
    isPending,
    startTransition,
  ] =
    useTransition();


  /* =======================================================
     MESSAGE
  ======================================================= */

  const [
    message,
    setMessage,
  ] =
    useState("");


  /* =========================================================
     ORDER STATUS CHANGE
  ========================================================= */

  function handleOrderStatusSelect(
    value: string
  ) {

    const nextStatus =
      value as OrderStatus;


    /* -----------------------------------------------
       Same status
    ----------------------------------------------- */

    if (
      nextStatus ===
      currentOrderStatus
    ) {

      setOrderStatusOpen(
        false
      );

      return;

    }


    /* -----------------------------------------------
       Client-side transition guard

       Server validates this again.
    ----------------------------------------------- */

    if (
      !canUpdateOrderStatus(
        currentOrderStatus,
        nextStatus
      )
    ) {

      setOrderStatusOpen(
        false
      );

      setMessage(
        `Cannot move order status from ${formatLabel(
          currentOrderStatus
        )} to ${formatLabel(
          nextStatus
        )}.`
      );

      return;

    }


    /* -----------------------------------------------
       Close inline list first
    ----------------------------------------------- */

    setOrderStatusOpen(
      false
    );


    /* -----------------------------------------------
       Confirm
    ----------------------------------------------- */

    const confirmed =
  window.confirm(
    `Change order status from ${formatLabel(
      currentOrderStatus
    )} to ${formatLabel(
      nextStatus
    )}?`
  );

console.log(
  "STATUS CHANGE REQUEST",
  currentOrderStatus,
  nextStatus
);


    /* -----------------------------------------------
       CANCEL
    ----------------------------------------------- */

    if (!confirmed) {

      return;

    }


    setMessage("");


    startTransition(
      async () => {

        try {

          const result =
            await updateAdminOrderStatusAction(
              orderId,
              nextStatus
            );


          if (!result.success) {

            setMessage(
              result.message
            );

            return;

          }


          /*
            Update UI only after
            server succeeds.
          */

          setCurrentOrderStatus(
            nextStatus
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


  /* =========================================================
     PAYMENT STATUS CHANGE
  ========================================================= */

  function handlePaymentStatusSelect(
    value: string
  ) {

    const nextStatus =
      value as PaymentStatus;


    /* -----------------------------------------------
       Same status
    ----------------------------------------------- */

    if (
      nextStatus ===
      currentPaymentStatus
    ) {

      setPaymentStatusOpen(
        false
      );

      return;

    }


    /* -----------------------------------------------
       Client-side transition guard

       Server validates this again.
    ----------------------------------------------- */

    if (
      !canUpdatePaymentStatus(
        currentPaymentStatus,
        nextStatus
      )
    ) {

      setPaymentStatusOpen(
        false
      );

      setMessage(
        `Cannot move payment status from ${formatLabel(
          currentPaymentStatus
        )} to ${formatLabel(
          nextStatus
        )}.`
      );

      return;

    }


    setPaymentStatusOpen(
      false
    );


    /* -----------------------------------------------
       Confirm
    ----------------------------------------------- */

    const confirmed =
      window.confirm(
        `Change payment status from ${formatLabel(
          currentPaymentStatus
        )} to ${formatLabel(
          nextStatus
        )}?`
      );


    /* -----------------------------------------------
       CANCEL
    ----------------------------------------------- */

    if (!confirmed) {

      return;

    }


    setMessage("");


    startTransition(
      async () => {

        try {

          const result =
            await updateAdminPaymentStatusAction(
              orderId,
              nextStatus
            );


          if (!result.success) {

            setMessage(
              result.message
            );

            return;

          }


          setCurrentPaymentStatus(
            nextStatus
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


  /* =========================================================
     RENDER
  ========================================================= */

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


      <div
        className="
          space-y-6
        "
      >


        {/* =================================================
            ORDER STATUS
        ================================================= */}

        <div>

          <label
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


          <StatusSelect
            value={
              currentOrderStatus
            }

            options={
              orderFlow[
                currentOrderStatus
              ]
            }

            disabled={
              isPending
            }

            open={
              orderStatusOpen
            }

            onToggle={() => {

              if (
                isPending
              ) {

                return;

              }

              setPaymentStatusOpen(
                false
              );

              setOrderStatusOpen(
                (value) =>
                  !value
              );

            }}

            onSelect={
              handleOrderStatusSelect
            }
          />

        </div>


        {/* =================================================
            PAYMENT STATUS
        ================================================= */}

        <div>

          <label
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


          <StatusSelect
            value={
              currentPaymentStatus
            }

            options={
              paymentFlow[
                currentPaymentStatus
              ]
            }

            disabled={
              isPending
            }

            open={
              paymentStatusOpen
            }

            onToggle={() => {

              if (
                isPending
              ) {

                return;

              }

              setOrderStatusOpen(
                false
              );

              setPaymentStatusOpen(
                (value) =>
                  !value
              );

            }}

            onSelect={
              handlePaymentStatusSelect
            }
          />

        </div>


        {/* =================================================
            UPDATING
        ================================================= */}

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


        {/* =================================================
            MESSAGE
        ================================================= */}

        {!isPending &&
          message && (

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