import type {
  OrderHistoryItem,
} from "@/lib/order-history";


type Props = {
  history: OrderHistoryItem[];
};


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


      <div
        className="
          space-y-6
        "
      >

        {history.length === 0 && (

          <p
            className="
              text-sm
              text-neutral-500
            "
          >
            No history yet.
          </p>

        )}


        {history.map(
          (item) => (

            <div
              key={item.id}
              className="
                flex
                gap-4
              "
            >

              {/* Timeline dot */}

              <div
                className="
                  mt-1.5
                  h-3
                  w-3
                  shrink-0
                  rounded-full
                  bg-black
                "
              />


              <div
                className="
                  min-w-0
                  flex-1
                "
              >

                {/* Event type */}

                <p
                  className="
                    text-sm
                    font-semibold
                    text-black
                  "
                >
                  {formatLabel(
                    item.type
                  )}
                </p>


                {/* Status transition */}

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


                {/* Note */}

                {item.note && (

                  <p
                    className="
                      mt-1
                      text-sm
                      text-neutral-500
                    "
                  >
                    {item.note}
                  </p>

                )}


                {/* Date */}

                <p
                  className="
                    mt-1
                    text-xs
                    text-neutral-400
                  "
                >
                  {new Date(
                    item.createdAt
                  ).toLocaleString(
                    "id-ID"
                  )}
                </p>

              </div>

            </div>

          )
        )}

      </div>

    </section>

  );

}