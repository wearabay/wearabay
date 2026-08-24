"use client";

import {
  useEffect,
  useState,
} from "react";

import {
  getOrderById,
  type Order,
} from "@/lib/order";

import {
  BANK_TRANSFER_DETAILS,
} from "@/lib/payment";

import PaymentProofUpload from "@/app/account/orders/[id]/PaymentProofUpload";

import { formatPrice } from "@/lib/currency";


type Props = {
  orderId?: string;
};


export default function PaymentClient({
  orderId,
}: Props) {

  const [order, setOrder] =
    useState<Order | null>(null);


  const [copied, setCopied] =
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


    async function loadOrder(
      id: string
    ) {

      try {

        const data =
          await getOrderById(id);


        if (mounted) {

          setOrder(
            data ?? null
          );

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
     COPY ACCOUNT NUMBER
  ======================================================= */

  async function handleCopyAccountNumber() {

    try {

      await navigator.clipboard.writeText(
        BANK_TRANSFER_DETAILS.accountNumber
      );


      setCopied(true);


      window.setTimeout(
        () => setCopied(false),
        2000
      );

    } catch (error) {

      console.error(
        "Failed to copy account number:",
        error
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


        <div
          className="
            mt-6
            space-y-3
          "
        >

          <div>

            <p
              className="
                text-sm
                text-neutral-500
              "
            >
              Order Number
            </p>


            <p
              className="
                mt-1
                font-medium
              "
            >
              {order.orderNumber}
            </p>

          </div>


          <div>

            <p
              className="
                text-sm
                text-neutral-500
              "
            >
              Payment Status
            </p>


            <p
              className="
                mt-1
                font-medium
              "
            >
              {order.paymentStatus === "pending"
                ? "Awaiting Payment Verification"
                : order.paymentStatus}
            </p>

          </div>

        </div>

      </section>


      {/* ===================================================
          ORDER TOTAL
      =================================================== */}

      <section
        className="
          rounded-2xl
          border
          border-stone-200
          p-8
        "
      >

        <div
          className="
            flex
            items-center
            justify-between
          "
        >

          <span
            className="
              text-lg
              font-medium
            "
          >
            Total Payment
          </span>


          <span
            className="
              text-xl
              font-medium
            "
          >
            {formatPrice(order.total)}
          </span>

        </div>

      </section>


      {/* ===================================================
          BANK TRANSFER DETAILS
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
          Bank Transfer
        </p>


        <h2
          className="
            mt-3
            text-2xl
            font-light
          "
        >
          Transfer to the following account
        </h2>


        <div
          className="
            mt-6
            rounded-xl
            border
            border-stone-200
            bg-stone-50
            p-5
          "
        >

          {/* BANK */}

          <div>

            <p
              className="
                text-xs
                uppercase
                tracking-wider
                text-neutral-500
              "
            >
              Bank
            </p>


            <p
              className="
                mt-1
                text-lg
                font-medium
              "
            >
              {BANK_TRANSFER_DETAILS.bank}
            </p>

          </div>


          {/* ACCOUNT NUMBER */}

          <div
            className="
              mt-5
            "
          >

            <p
              className="
                text-xs
                uppercase
                tracking-wider
                text-neutral-500
              "
            >
              Account Number
            </p>


            <div
              className="
                mt-2
                flex
                items-center
                justify-between
                gap-4
                rounded-lg
                border
                border-stone-200
                bg-white
                px-4
                py-3
              "
            >

              <span
                className="
                  break-all
                  text-lg
                  font-medium
                  tracking-wider
                "
              >
                {BANK_TRANSFER_DETAILS.accountNumber}
              </span>


              <button
                type="button"
                onClick={
                  handleCopyAccountNumber
                }
                className="
                  shrink-0
                  rounded-full
                  border
                  border-stone-300
                  px-4
                  py-2
                  text-xs
                  font-medium
                  uppercase
                  tracking-wider
                  transition
                  hover:border-black
                "
              >
                {copied
                  ? "Copied"
                  : "Copy"}
              </button>

            </div>

          </div>


          {/* ACCOUNT NAME */}

          <div
            className="
              mt-5
            "
          >

            <p
              className="
                text-xs
                uppercase
                tracking-wider
                text-neutral-500
              "
            >
              Account Name
            </p>


            <p
              className="
                mt-1
                text-lg
                font-medium
              "
            >
              {BANK_TRANSFER_DETAILS.accountName}
            </p>

          </div>

        </div>


        {/* INSTRUCTION */}

        <div
          className="
            mt-6
            space-y-2
            text-sm
            leading-6
            text-neutral-500
          "
        >

          <p>
            Please transfer the exact total amount
            shown above.
          </p>


          <p>
            After completing the transfer, upload
            your payment receipt below.
          </p>


          <p>
            Your payment will remain pending until
            our team verifies the payment proof.
          </p>

        </div>

      </section>


      {/* ===================================================
          PAYMENT PROOF
      =================================================== */}

      <PaymentProofUpload
        orderId={order.id}
        paymentProofPath={
          order.paymentProofPath
        }
      />

    </div>

  );

}