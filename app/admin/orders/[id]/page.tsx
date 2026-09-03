import Link from "next/link";
import { redirect } from "next/navigation";

import Container from "@/components/ui/Container";

import {
  getAdminUser,
} from "@/lib/admin";

import {
  getAdminOrderById,
} from "@/lib/admin-orders";

import { formatPrice } from "@/lib/currency";

import { createClient } from "@/lib/supabase/server";
import OrderStatusForm from "./OrderStatusForm";

import {
  verifyAdminPaymentProofAction,
  rejectAdminPaymentProofAction,
  refundAdminPaymentAction,
} from "./actions";

import ShippingForm from "./ShippingForm";

import {
  getOrderHistory,
} from "@/lib/order-history";

import OrderHistory from "@/components/orders/OrderHistory";

import VerifyPaymentButton from "./VerifyPaymentButton";

import RefundPaymentButton from "./RefundPaymentButton";


type Props = {
  params: Promise<{
    id: string;
  }>;
};


function formatPaymentMethod(
  payment: string | null | undefined
) {
  const value =
    typeof payment === "string"
      ? payment.trim().toLowerCase()
      : "";

  switch (value) {
    case "bank":
    case "bank_transfer":
    case "bank transfer":
      return "Bank Transfer";

    case "qris":
      return "QRIS";

    case "e-wallet":
    case "ewallet":
    case "e_wallet":
      return "E-Wallet";

    case "cod":
      return "Cash on Delivery";

    default:
      return payment || "—";
  }
}


export default async function AdminOrderDetailPage({
  params,
}: Props) {

  const { id } =
    await params;


  /* =======================================================
     ADMIN AUTH
  ======================================================= */

  const admin =
    await getAdminUser();


  if (!admin) {
    redirect("/account");
  }


  /* =======================================================
     LOAD ORDER
  ======================================================= */

  const order =
    await getAdminOrderById(id);


  if (!order) {

    return (

      <main>

        <Container className="py-24">

          <div className="space-y-6">

            <p
              className="
                text-xs
                uppercase
                tracking-[0.3em]
                text-neutral-500
              "
            >
              Administration
            </p>


            <h1
              className="
                text-3xl
                font-light
              "
            >
              Order Not Found
            </h1>


            <Link
              href="/admin/orders"
              className="
                inline-flex
                h-12
                items-center
                justify-center
                rounded-full
                border
                border-black
                px-6
                text-xs
                uppercase
                tracking-[0.2em]
                transition
                hover:bg-black
                hover:text-white
              "
            >
              Back to Orders
            </Link>

          </div>

        </Container>

      </main>

    );

  }


  const history =
  await getOrderHistory(id);


  /* =======================================================
     PAYMENT LABEL
  ======================================================= */

  const paymentLabel =
    formatPaymentMethod(
      order.payment
    );


  /* =======================================================
     PAYMENT PROOF SIGNED URL
  ======================================================= */

  let paymentProofUrl:
    string | null = null;


  if (
    order.paymentProofPath
  ) {

    const supabase =
      await createClient();


    const {
      data,
      error,
    } =
      await supabase.storage

        .from("payment-proofs")

        .createSignedUrl(
          order.paymentProofPath,
          60 * 60
        );


    if (!error) {

      paymentProofUrl =
        data.signedUrl;

    }

  }


  return (

    <main>

      <Container className="py-24">

        <div className="space-y-10">


          {/* =================================================
              HEADER
          ================================================= */}

          <div>

            <Link
              href="/admin/orders"
              className="
                text-xs
                uppercase
                tracking-[0.2em]
                text-neutral-500
                transition
                hover:text-black
              "
            >
              ← Back to Orders
            </Link>


            <p
              className="
                mt-8
                text-xs
                uppercase
                tracking-[0.3em]
                text-neutral-500
              "
            >
              Administration
            </p>


            <h1
              className="
                mt-3
                text-4xl
                font-light
              "
            >
              Order Detail
            </h1>


            <p
              className="
                mt-2
                text-sm
                text-neutral-500
              "
            >
              {order.orderNumber}
            </p>


            <p
              className="
                mt-1
                text-xs
                text-neutral-400
              "
            >
              {new Date(
                order.createdAt
              ).toLocaleString(
                "id-ID"
              )}
            </p>

          </div>


          {/* =================================================
              CUSTOMER
          ================================================= */}

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
                mb-5
                text-lg
                font-medium
              "
            >
              Customer
            </h2>


            <div
              className="
                space-y-2
                text-sm
                text-neutral-600
              "
            >

              <p>
                {order.customer.email}
              </p>


              <p>
                {order.customer.phone}
              </p>

            </div>

          </section>


          {/* =================================================
              ITEMS
          ================================================= */}

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
              Items
            </h2>


            <div className="space-y-6">

              {order.items.map(
                (item) => (

                  <div
                    key={`
                      ${item.id}-
                      ${item.color ?? ""}-
                      ${item.size ?? ""}
                    `}
                    className="
                      flex
                      items-start
                      justify-between
                      gap-6
                      border-b
                      border-stone-100
                      pb-5
                      last:border-b-0
                      last:pb-0
                    "
                  >

                    <div>

                      <p className="font-medium">
                        {item.name}
                      </p>


                      <p
                        className="
                          mt-1
                          text-sm
                          text-neutral-500
                        "
                      >

                        {item.color}

                        {item.color &&
                        item.size
                          ? " • "
                          : ""}

                        {item.size}

                        {" • "}

                        Qty {item.quantity}

                      </p>

                    </div>


                    <p className="font-medium">

                      {formatPrice(
                        item.price *
                        item.quantity
                      )}

                    </p>

                  </div>

                )
              )}

            </div>

          </section>


          {/* =================================================
              SHIPPING ADDRESS
          ================================================= */}

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
                mb-5
                text-lg
                font-medium
              "
            >
              Shipping Address
            </h2>


            <div
              className="
                text-sm
                leading-7
                text-neutral-600
              "
            >

              <p className="font-medium text-black">

                {order.address.firstName}

                {" "}

                {order.address.lastName}

              </p>


              <p>
                {order.address.street}
              </p>


              <p>
                {order.address.city}
                {", "}
                {order.address.province}
              </p>


              <p>
                {order.address.postalCode}
              </p>


              <p>
                {order.address.country}
              </p>

            </div>

          </section>


          {/* =================================================
              PAYMENT & TOTAL
          ================================================= */}

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
              Payment
            </h2>


            <div className="space-y-4">


              <div
                className="
                  flex
                  justify-between
                  gap-6
                  text-sm
                "
              >

                <span>
                  Payment Method
                </span>


                <span className="font-medium">
                  {paymentLabel}
                </span>

              </div>


              <div
                className="
                  flex
                  justify-between
                  gap-6
                  text-sm
                "
              >

                <span>
                  Payment Status
                </span>


                <span
                  className="
                    font-medium
                    uppercase
                  "
                >
                  {order.paymentStatus}
                </span>

              </div>


              <div
                className="
                  flex
                  justify-between
                  gap-6
                  text-sm
                "
              >

                <span>
                  Order Status
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


              <div
                className="
                  flex
                  justify-between
                  gap-6
                  text-sm
                "
              >

                <span>
                  Shipping
                </span>


                <span>
                  {formatPrice(
                    order.shippingFee
                  )}
                </span>

              </div>


              <div
                className="
                  mt-5
                  border-t
                  border-stone-200
                  pt-5
                "
              >

                <div
                  className="
                    flex
                    justify-between
                    gap-6
                    text-lg
                    font-medium
                  "
                >

                  <span>
                    Total
                  </span>


                  <span>
                    {formatPrice(
                      order.total
                    )}
                  </span>

                </div>

              </div>

            </div>

          </section>


          {/* =================================================
              PAYMENT PROOF
          ================================================= */}

          {order.paymentProofPath && (

            <section
              className="
                rounded-2xl
                border
                border-stone-200
                p-6
              "
            >

              <div
                className="
                  flex
                  items-start
                  justify-between
                  gap-6
                "
              >

                <div>

                  <h2
                    className="
                      text-lg
                      font-medium
                    "
                  >
                    Payment Proof
                  </h2>


                  <p
                    className="
                      mt-1
                      text-sm
                      text-neutral-500
                    "
                  >
                    Customer payment proof
                  </p>

                </div>


                <span
                  className="
                    rounded-full
                    border
                    border-stone-300
                    px-3
                    py-1
                    text-xs
                    font-medium
                    uppercase
                    tracking-wider
                    text-neutral-600
                  "
                >
                  {order.paymentProofVerifiedAt
                    ? "Verified"
                    : "Pending Review"}
                </span>

              </div>


              {order.paymentProofUploadedAt && (

                <p
                  className="
                    mt-4
                    text-xs
                    text-neutral-500
                  "
                >
                  Uploaded{" "}
                  {new Date(
                    order.paymentProofUploadedAt
                  ).toLocaleString(
                    "id-ID"
                  )}
                </p>

              )}


{paymentProofUrl ? (

  <div className="mt-5">

    {/* ===================================================
        COMPACT PREVIEW
    =================================================== */}

    <div
      className="
        w-fit
        max-w-full
        overflow-hidden
        rounded-xl
        border
        border-stone-200
        bg-stone-50
        p-2
      "
    >

      <img
        src={paymentProofUrl}
        alt="Customer payment proof"
        className="
          block
          max-h-[220px]
          max-w-[260px]
          w-auto
          object-contain
        "
      />

    </div>


    {/* ===================================================
        VIEW FULL PROOF
    =================================================== */}

    <div className="mt-3">

      <a
        href={paymentProofUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="
          text-xs
          font-medium
          uppercase
          tracking-[0.15em]
          underline
          underline-offset-4
          transition
          hover:text-neutral-500
        "
      >
        View Full Payment Proof
      </a>

    </div>


    {/* ===================================================
        REVIEW ACTIONS
    =================================================== */}

    {!order.paymentProofVerifiedAt && (

      <div
        className="
          mt-6
          flex
          flex-col
          gap-3
          sm:flex-row
        "
      >

        {/* VERIFY */}

        <form
          action={
            verifyAdminPaymentProofAction
          }
        >

          <input
            type="hidden"
            name="orderId"
            value={order.id}
          />

          <VerifyPaymentButton />

        </form>


        {/* REJECT */}

        <form
          action={
            rejectAdminPaymentProofAction
          }
        >

          <input
            type="hidden"
            name="orderId"
            value={order.id}
          />

          <button
            type="submit"
            className="
              inline-flex
              h-11
              w-full
              items-center
              justify-center
              rounded-full
              border
              border-stone-300
              bg-white
              px-6
              text-xs
              font-medium
              uppercase
              tracking-[0.15em]
              text-neutral-700
              transition
              hover:border-black
              hover:text-black
              sm:w-auto
            "
          >
            Reject Payment Proof
          </button>

        </form>

      </div>

    )}

  </div>

) : (

  <p
className="
mt-5
text-sm
text-neutral-500
"
>
Unable to generate preview.
</p>

)}

            </section>

          )}

          <OrderHistory
  history={history}
/>

{/* =================================================
    REFUND PAYMENT
================================================= */}

{order.paymentStatus === "paid" &&
  order.status === "processing" && (

  <section
    className="
      rounded-2xl
      border
      border-stone-200
      p-6
    "
  >

    <div>

      <h2
        className="
          text-lg
          font-medium
        "
      >
        Refund Payment
      </h2>


      <p
        className="
          mt-2
          text-sm
          leading-6
          text-neutral-500
        "
      >
        Mark this payment as refunded after
        the refund has been completed.
      </p>

    </div>


    <form
      className="mt-6"
      action={refundAdminPaymentAction}
    >

      <input
        type="hidden"
        name="orderId"
        value={order.id}
      />


      <RefundPaymentButton />

    </form>

  </section>

)}

          {/* =================================================
              MANAGE ORDER
          ================================================= */}

          <OrderStatusForm
            orderId={order.id}
            orderStatus={order.status}
            paymentStatus={order.paymentStatus}
          />

          <ShippingForm
  orderId={order.id}
  status={order.status}
  courier={order.courier ?? null}
  trackingNumber={order.trackingNumber ?? null}
/>


        </div>

      </Container>

    </main>

  );

}