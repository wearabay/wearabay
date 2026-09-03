import type {
  OrderHistoryItem,
} from "@/lib/order-history";


type Props = {
  history: OrderHistoryItem[];
};


/* =========================================================
   LABEL HELPERS
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


function formatEventTitle(
  type: string
) {

  switch (type) {

    case "order_placed":
      return "Order Placed";

    case "payment_verified":
      return "Payment Confirmed";

    case "payment_rejected":
      return "Payment Proof Rejected";

    case "payment_status":
      return "Payment Status Updated";

    case "order_status":
      return "Order Status Updated";

    case "shipping":
      return "Shipping Information Updated";

    default:
      return formatLabel(type);

  }

}


/* =========================================================
   COMPONENT
========================================================= */

export default function OrderHistory({
  history,
}: Props) {

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
        Order History
      </h2>


      {history.length === 0 ? (

        <p
          className="
            text-sm
            text-neutral-500
          "
        >
          No history yet.
        </p>

      ) : (

        <div
          className="
            relative
            space-y-7
          "
        >

          {/* =================================================
              TIMELINE LINE
          ================================================= */}

          <div
            className="
              absolute
              left-[5px]
              top-2
              bottom-2
              w-px
              bg-stone-200
            "
          />


          {history.map(
            (
              item,
              index
            ) => (

              <div
                key={item.id}
                className="
                  relative
                  flex
                  gap-5
                "
              >

                {/* =================================================
                    DOT
                ================================================= */}

                <div
                  className="
                    relative
                    z-10
                    mt-1.5
                    h-3
                    w-3
                    shrink-0
                    rounded-full
                    border
                    border-white
                    bg-black
                    ring-1
                    ring-stone-300
                  "
                />


                {/* =================================================
                    CONTENT
                ================================================= */}

                <div
                  className="
                    min-w-0
                    flex-1
                    pb-1
                  "
                >

                  {/* EVENT TITLE */}

                  <p
                    className="
                      text-sm
                      font-semibold
                      text-black
                    "
                  >
                    {formatEventTitle(
                      item.type
                    )}
                  </p>


                  {/* STATUS TRANSITION */}

                  {(item.oldValue ||
                    item.newValue) && (

                    <p
                      className="
                        mt-1
                        text-sm
                        text-neutral-600
                      "
                    >

                      {item.oldValue && (

                        <span>
                          {formatLabel(
                            item.oldValue
                          )}
                        </span>

                      )}


                      {item.oldValue &&
                        item.newValue && (

                          <span
                            className="
                              mx-2
                              text-neutral-400
                            "
                          >
                            →
                          </span>

                        )}


                      {item.newValue && (

                        <span
                          className="
                            font-medium
                            text-black
                          "
                        >
                          {formatLabel(
                            item.newValue
                          )}
                        </span>

                      )}

                    </p>

                  )}


                  {/* NOTE */}

                  {item.note && (

                    <p
                      className="
                        mt-1.5
                        text-sm
                        leading-6
                        text-neutral-500
                      "
                    >
                      {item.note}
                    </p>

                  )}


                  {/* DATE */}

                  <p
                    className="
                      mt-2
                      text-xs
                      text-neutral-400
                    "
                  >
                    {new Date(
                      item.createdAt
                    ).toLocaleString(
                      "id-ID",
                      {
                        dateStyle:
                          "medium",

                        timeStyle:
                          "short",
                      }
                    )}
                  </p>

                </div>

              </div>

            )
          )}

        </div>

      )}

    </section>

  );

}