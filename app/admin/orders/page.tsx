import Link from "next/link";
import { redirect } from "next/navigation";

import Container from "@/components/ui/Container";

import { getAdminUser } from "@/lib/admin";
import { getAdminOrders } from "@/lib/admin-orders";
import { formatPrice } from "@/lib/currency";


export default async function AdminOrdersPage() {

  const admin = await getAdminUser();


  if (!admin) {
    redirect("/account");
  }


  const orders =
    await getAdminOrders();


  return (
    <main>

      <Container className="py-24">

        <div className="space-y-10">


          {/* Header */}

          <div>

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
                mt-3
                text-4xl
                font-light
              "
            >
              Orders
            </h1>


            <p className="mt-3 text-sm text-neutral-500">
              Manage customer orders and payment status.
            </p>

          </div>



          {/* Orders */}

          {!orders.length ? (

            <div
              className="
                rounded-2xl
                border
                border-stone-200
                p-8
              "
            >

              <p className="text-neutral-500">
                No orders yet.
              </p>

            </div>

          ) : (

            <div className="space-y-5">

              {orders.map(
                (order) => (

                  <div
                    key={order.id}
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
                        flex-col
                        gap-6
                        lg:flex-row
                        lg:items-center
                        lg:justify-between
                      "
                    >

                      {/* Order */}

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


                        <p className="mt-2 font-medium">
                          {order.orderNumber}
                        </p>


                        <p className="mt-1 text-xs text-neutral-500">
                          {new Date(
                            order.createdAt
                          ).toLocaleString(
                            "id-ID"
                          )}
                        </p>

                      </div>



                      {/* Customer */}

                      <div>

                        <p
                          className="
                            text-xs
                            uppercase
                            tracking-widest
                            text-neutral-500
                          "
                        >
                          Customer
                        </p>


                        <p className="mt-2 text-sm">
                          {order.customer.email}
                        </p>

                      </div>



                      {/* Payment */}

                      <div>

                        <p
                          className="
                            text-xs
                            uppercase
                            tracking-widest
                            text-neutral-500
                          "
                        >
                          Payment
                        </p>


                        <p className="mt-2 text-sm font-medium uppercase">
                          {order.payment}
                        </p>


                        <p className="mt-1 text-xs text-neutral-500">
                          {order.paymentStatus}
                        </p>

                      </div>



                      {/* Status */}

                      <div>

                        <p
                          className="
                            text-xs
                            uppercase
                            tracking-widest
                            text-neutral-500
                          "
                        >
                          Order Status
                        </p>


                        <p className="mt-2 text-sm font-medium uppercase">
                          {order.status}
                        </p>

                      </div>



                      {/* Total */}

                      <div>

                        <p
                          className="
                            text-xs
                            uppercase
                            tracking-widest
                            text-neutral-500
                          "
                        >
                          Total
                        </p>


                        <p className="mt-2 font-medium">
                          {formatPrice(
                            order.total
                          )}
                        </p>

                      </div>



                      {/* Detail */}

                      <Link
                        href={`/admin/orders/${order.id}`}
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
                        View
                      </Link>

                    </div>

                  </div>

                )
              )}

            </div>

          )}

        </div>

      </Container>

    </main>
  );
}