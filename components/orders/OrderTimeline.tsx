import type {
  OrderStatus,
  PaymentStatus,
} from "@/lib/order";


type Props = {
  orderStatus: OrderStatus;
  paymentStatus: PaymentStatus;
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
}: Props) {



  const steps = [

    {
      title:
        "Order Placed",

      active:
        true,
    },


    {
      title:
        "Payment Confirmed",

      active:
        paymentStatus === "paid",
    },


    {
      title:
        "Processing",

      active:
        [
          "processing",
          "shipped",
          "completed",
        ].includes(
          orderStatus
        ),
    },


    {
      title:
        "Shipped",

      active:
        [
          "shipped",
          "completed",
        ].includes(
          orderStatus
        ),
    },


    {
      title:
        "Completed",

      active:
        orderStatus === "completed",
    },

  ];



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


        {
          steps.map(
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
                  items-center
                  gap-4
                "
              >


                <div
                  className={`
                    flex
                    h-8
                    w-8
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

                  {
                    step.active
                    ?
                    "✓"
                    :
                    index + 1
                  }

                </div>



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


              </div>


            )
          )
        }


      </div>



      <div
        className="
          mt-6
          border-t
          border-stone-200
          pt-4
          text-xs
          uppercase
          tracking-wider
          text-neutral-500
        "
      >

        Current Status:
        {" "}
        {label(orderStatus)}

      </div>


    </section>

  );

}