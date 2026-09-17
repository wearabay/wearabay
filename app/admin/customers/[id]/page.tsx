import Link from "next/link";
import { notFound } from "next/navigation";

import Container from "@/components/ui/Container";

import {
  getAdminCustomerById,
} from "@/lib/admin-customers";


type Props = {
  params: Promise<{
    id: string;
  }>;
};


function formatDate(
  value: string
) {

  if (!value) {
    return "—";
  }


  return new Date(
    value
  ).toLocaleDateString(
    "id-ID",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }
  );

}


function formatPrice(
  value: number
) {

  return new Intl.NumberFormat(
    "id-ID",
    {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }
  ).format(
    value
  );

}


function formatStatus(
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


export default async function AdminCustomerDetailPage({
  params,
}: Props) {

  const {
    id,
  } =
    await params;


  const customer =
    await getAdminCustomerById(
      id
    );


  if (!customer) {
    notFound();
  }


  const latestOrder =
    customer.orders[0] ??
    null;


  return (

    <main>

      <Container className="py-24">

        <div className="space-y-8">

          {/* =================================================
              BACK
          ================================================= */}

          <div>

            <Link
              href="/admin/customers"
              className="
                text-[10px]
                uppercase
                tracking-[0.2em]
                text-neutral-500
                transition
                hover:text-black
              "
            >
              ← Customers
            </Link>

          </div>


          {/* =================================================
              HEADER
          ================================================= */}

          <div>

            <p
              className="
                text-xs
                uppercase
                tracking-[0.3em]
                text-neutral-500
              "
            >
              Customer
            </p>


            <div
              className="
                mt-4
                flex
                flex-col
                gap-5
                sm:flex-row
                sm:items-center
                sm:justify-between
              "
            >

              <div>

                <h1
                  className="
                    text-4xl
                    font-light
                  "
                >
                  {
                    customer.name
                  }
                </h1>


                <p
                  className="
                    mt-4
                    text-sm
                    text-neutral-500
                  "
                >
                  Customer account and order history.
                </p>

              </div>


              <span
                className="
                  inline-flex
                  w-fit
                  rounded-full
                  bg-neutral-100
                  px-4
                  py-2
                  text-[10px]
                  uppercase
                  tracking-[0.15em]
                  text-neutral-600
                "
              >
                {
                  customer.role
                }
              </span>

            </div>

          </div>


          {/* =================================================
              CUSTOMER INFORMATION
          ================================================= */}

          <section
            className="
              rounded-2xl
              border
              border-stone-200
              p-6
              sm:p-8
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
              Customer Information
            </p>


            <div
              className="
                mt-6
                grid
                gap-8
                sm:grid-cols-2
                lg:grid-cols-4
              "
            >

              <div>

                <p className="text-[10px] uppercase tracking-[0.15em] text-neutral-400">
                  Name
                </p>

                <p className="mt-2.5 text-sm text-neutral-900">
                  {
                    customer.name
                  }
                </p>

              </div>


              <div>

                <p className="text-[10px] uppercase tracking-[0.15em] text-neutral-400">
                  Email
                </p>

                <p className="mt-2.5 break-all text-sm text-neutral-600">
                  {
                    customer.email ||
                    "No email available"
                  }
                </p>

              </div>


              <div>

                <p className="text-[10px] uppercase tracking-[0.15em] text-neutral-400">
                  Phone
                </p>

                <p className="mt-2.5 text-sm text-neutral-600">
                  {
                    customer.phone ||
                    "—"
                  }
                </p>

              </div>


              <div>

                <p className="text-[10px] uppercase tracking-[0.15em] text-neutral-400">
                  Joined
                </p>

                <p className="mt-2.5 text-sm text-neutral-600">
                  {formatDate(
                    customer.joinedAt
                  )}
                </p>

              </div>

            </div>

          </section>


          {/* =================================================
              CUSTOMER SUMMARY
          ================================================= */}

          <section>

            <p
              className="
                text-xs
                uppercase
                tracking-[0.3em]
                text-neutral-500
              "
            >
              Customer Summary
            </p>


            <div
              className="
                mt-4
                grid
                gap-4
                sm:grid-cols-3
              "
            >

              <div
                className="
                  rounded-2xl
                  border
                  border-stone-200
                  p-6
                "
              >

                <p className="text-[10px] uppercase tracking-[0.15em] text-neutral-400">
                  Total Orders
                </p>

                <p className="mt-3 text-2xl font-light">
                  {
                    customer.orderCount
                  }
                </p>

              </div>


              <div
                className="
                  rounded-2xl
                  border
                  border-stone-200
                  p-6
                "
              >

                <p className="text-[10px] uppercase tracking-[0.15em] text-neutral-400">
                  Total Spent
                </p>

                <p className="mt-3 text-2xl font-light">
                  {formatPrice(
                    customer.totalSpent
                  )}
                </p>

              </div>


              <div
                className="
                  rounded-2xl
                  border
                  border-stone-200
                  p-6
                "
              >

                <p className="text-[10px] uppercase tracking-[0.15em] text-neutral-400">
                  Last Order
                </p>

                <p className="mt-3 text-sm text-neutral-900">
                  {
                    latestOrder
                      ? latestOrder.orderNumber ||
                        "Order"
                      : "No orders"
                  }
                </p>

                {latestOrder && (

                  <p className="mt-1 text-xs text-neutral-500">
                    {formatDate(
                      latestOrder.createdAt
                    )}
                  </p>

                )}

              </div>

            </div>

          </section>


          {/* =================================================
              ORDER HISTORY
          ================================================= */}

          <section>

            <div
              className="
                mb-6
                flex
                items-center
                justify-between
              "
            >

              <div>

                <p
                  className="
                    text-xs
                    uppercase
                    tracking-[0.3em]
                    text-neutral-500
                  "
                >
                  Order History
                </p>


                <p
                  className="
                    mt-2.5
                    text-sm
                    text-neutral-500
                  "
                >
                  {
                    customer.orders.length
                  }{" "}
                  {
                    customer.orders.length === 1
                      ? "order"
                      : "orders"
                  }
                </p>

              </div>

            </div>


            {customer.orders.length === 0 ? (

              <div
                className="
                  rounded-2xl
                  border
                  border-stone-200
                  p-10
                  text-center
                "
              >

                <p className="text-sm text-neutral-500">
                  This customer has no orders yet.
                </p>

              </div>

            ) : (

              <div
                className="
                  overflow-hidden
                  rounded-2xl
                  border
                  border-stone-200
                "
              >

                <div
                  className="
                    divide-y
                    divide-stone-200
                  "
                >

                  {customer.orders.map(
                    (order) => (

                      <div
                        key={
                          order.id
                        }
                        className="
                          flex
                          flex-col
                          gap-5
                          p-6
                          sm:flex-row
                          sm:items-center
                          sm:justify-between
                        "
                      >

                        <div>

                          <Link
                            href={`/admin/orders/${order.id}`}
                            className="
                              text-sm
                              font-medium
                              text-neutral-900
                              transition
                              hover:underline
                            "
                          >
                            {
                              order.orderNumber ||
                              "Order"
                            }
                          </Link>


                          <p
                            className="
                              mt-2
                              text-xs
                              text-neutral-500
                            "
                          >
                            {formatDate(
                              order.createdAt
                            )}
                          </p>

                        </div>


                        <div
                          className="
                            flex
                            flex-wrap
                            items-center
                            gap-3
                          "
                        >

                          <span
                            className="
                              rounded-full
                              bg-neutral-100
                              px-3
                              py-1
                              text-[10px]
                              uppercase
                              tracking-[0.12em]
                              text-neutral-600
                            "
                          >
                            {
                              formatStatus(
                                order.status
                              )
                            }
                          </span>


                          <span
                            className="
                              rounded-full
                              border
                              border-stone-200
                              px-3
                              py-1
                              text-[10px]
                              uppercase
                              tracking-[0.12em]
                              text-neutral-500
                            "
                          >
                            {
                              formatStatus(
                                order.paymentStatus
                              )
                            }
                          </span>


                          <span
                            className="
                              text-sm
                              text-neutral-900
                            "
                          >
                            {formatPrice(
                              order.total
                            )}
                          </span>

                        </div>

                      </div>

                    )
                  )}

                </div>

              </div>

            )}

          </section>

        </div>

      </Container>

    </main>

  );

}