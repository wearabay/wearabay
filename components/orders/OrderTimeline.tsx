import type {
  OrderStatus,
  PaymentStatus,
} from "@/lib/order";


type Props = {
  orderStatus: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentProofUploaded?: boolean;
};


function label(
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


export default function OrderTimeline({
  orderStatus,
  paymentStatus,
  paymentProofUploaded = false,
}: Props) {


  /*
   * =======================================================
   * PAYMENT STATE
   *
   * pending + proof uploaded
   * means the customer has submitted payment proof
   * and is waiting for admin verification.
   * =======================================================
   */

  const paymentConfirmed =
    paymentStatus === "paid";


  const paymentUnderReview =
    paymentStatus === "pending" &&
    paymentProofUploaded;


  /*
   * =======================================================
   * ORDER PROGRESS
   * =======================================================
   */

  const processingActive =
    [
      "processing",
      "shipped",
      "delivered",
      "completed",
    ].includes(
      orderStatus
    );


  const shippedActive =
    [
      "shipped",
      "delivered",
      "completed",
    ].includes(
      orderStatus
    );


  const deliveredActive =
    [
      "delivered",
      "completed",
    ].includes(
      orderStatus
    );


  const completedActive =
    orderStatus === "completed";


  /*
   * =======================================================
   * STEPS
   * =======================================================
   */

  const steps = [

    {
      title:
        "Order Placed",

      active:
        true,

      status:
        "Order received",
    },


    {
      title:
        paymentConfirmed
          ? "Payment Confirmed"
          : paymentUnderReview
            ? "Payment Under Review"
            : "Payment Pending",

      active:
        paymentConfirmed,

      status:
        paymentConfirmed
          ? "Payment verified"
          : paymentUnderReview
            ? "Payment proof submitted"
            : "Waiting for payment",
    },


    {
      title:
        "Processing",

      active:
        processingActive,

      status:
        processingActive
          ? "Order is being prepared"
          : "Not started",
    },


    {
      title:
        "Shipped",

      active:
        shippedActive,

      status:
        shippedActive
          ? "Order has been shipped"
          : "Not shipped yet",
    },


    {
      title:
        "Delivered",

      active:
        deliveredActive,

      status:
        deliveredActive
          ? "Package delivered"
          : "Waiting for delivery",
    },


    {
      title:
        "Completed",

      active:
        completedActive,

      status:
        completedActive
          ? "Order completed"
          : "Waiting for confirmation",
    },

  ];


  /*
   * =======================================================
   * CURRENT STATUS LABEL
   * =======================================================
   */

  let currentStatus =
    label(orderStatus);


  if (
    orderStatus === "pending" &&
    paymentUnderReview
  ) {

    currentStatus =
      "Payment Under Review";

  }


  if (
    orderStatus === "pending" &&
    !paymentUnderReview &&
    paymentStatus === "pending"
  ) {

    currentStatus =
      "Payment Pending";

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
        Order Progress
      </h2>


      <div
        className="
          space-y-5
        "
      >

        {steps.map(
          (
            step,
            index
          ) => (

            <div
              key={
                step.title
              }
              className="
                flex
                items-start
                gap-4
              "
            >

              {/* =================================================
                  STEP ICON
              ================================================= */}

              <div
                className={`
                  flex
                  h-8
                  w-8
                  shrink-0
                  items-center
                  justify-center
                  rounded-full
                  border
                  text-xs

                  ${
                    step.active

                      ?

                      "border-black bg-black text-white"

                      :

                      "border-stone-300 text-neutral-400"
                  }
                `}
              >

                {step.active
                  ? "✓"
                  : index + 1}

              </div>


              {/* =================================================
                  STEP CONTENT
              ================================================= */}

              <div>

                <p
                  className={`
                    text-sm

                    ${
                      step.active

                        ?

                        "font-medium text-black"

                        :

                        "text-neutral-400"
                    }
                  `}
                >
                  {step.title}
                </p>


                <p
                  className="
                    mt-1
                    text-xs
                    text-neutral-500
                  "
                >
                  {step.status}
                </p>

              </div>

            </div>

          )
        )}

      </div>


      {/* =====================================================
          CURRENT STATUS
      ===================================================== */}

      <div
        className="
          mt-6
          border-t
          border-stone-200
          pt-4
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
          Current Status
        </p>


        <p
          className="
            mt-2
            text-sm
            font-medium
            uppercase
          "
        >
          {currentStatus}
        </p>

      </div>

    </section>

  );

}