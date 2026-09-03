import Link from "next/link";
import { redirect } from "next/navigation";

import Container from "@/components/ui/Container";

import { getAdminUser } from "@/lib/admin";

import {
  getAdminOrderStats,
  getAdminPaymentReviewOrders,
} from "@/lib/admin-orders";


export default async function AdminPage() {

  const admin =
    await getAdminUser();


  if (!admin) {
    redirect("/account");
  }


  const stats =
    await getAdminOrderStats();


  const paymentReviewOrders =
    await getAdminPaymentReviewOrders();


  return (

    <main>

      <Container className="py-24">

        <div className="space-y-10">


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
              Administration
            </p>


            <h1
              className="
                mt-3
                text-4xl
                font-light
              "
            >
              Admin Dashboard
            </h1>


            <p
              className="
                mt-3
                text-sm
                text-neutral-500
              "
            >
              Welcome back, {admin.fullName}.
            </p>

          </div>


          {/* =================================================
              SUMMARY CARDS
          ================================================= */}

          <div
            className="
              grid
              gap-6
              md:grid-cols-3
            "
          >


            {/* ORDERS */}

            <div
              className="
                rounded-2xl
                border
                border-stone-200
                p-6
              "
            >

              <p
                className="
                  text-xs
                  uppercase
                  tracking-widest
                  text-neutral-500
                "
              >
                Orders
              </p>


              <p
                className="
                  mt-3
                  text-3xl
                  font-light
                "
              >
                {stats?.total ?? 0}
              </p>


              <p
                className="
                  mt-2
                  text-xs
                  text-neutral-500
                "
              >
                Total orders
              </p>

            </div>


            {/* PAYMENT REVIEW */}

            <div
              className="
                rounded-2xl
                border
                border-stone-200
                p-6
              "
            >

              <p
                className="
                  text-xs
                  uppercase
                  tracking-widest
                  text-neutral-500
                "
              >
                Payment Review
              </p>


              <p
                className="
                  mt-3
                  text-3xl
                  font-light
                "
              >
                {stats?.needPaymentReview ?? 0}
              </p>


              <p
                className="
                  mt-2
                  text-xs
                  text-neutral-500
                "
              >
                Awaiting verification
              </p>

            </div>


            {/* SHIPPING */}

            <div
              className="
                rounded-2xl
                border
                border-stone-200
                p-6
              "
            >

              <p
                className="
                  text-xs
                  uppercase
                  tracking-widest
                  text-neutral-500
                "
              >
                Shipping
              </p>


              <p
                className="
                  mt-3
                  text-3xl
                  font-light
                "
              >
                {stats?.shipped ?? 0}
              </p>


              <p
                className="
                  mt-2
                  text-xs
                  text-neutral-500
                "
              >
                Orders shipped
              </p>

            </div>


          </div>


          {/* =================================================
              QUICK ACTIONS
          ================================================= */}

          <section
            className="
              rounded-2xl
              border
              border-stone-200
              p-6
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
              Quick Actions
            </p>


            <div
              className="
                mt-5
                flex
                flex-col
                gap-3
                sm:flex-row
                sm:flex-wrap
              "
            >


              {/* MANAGE ORDERS */}

              <Link
                href="/admin/orders"
                className="
                  rounded-full
                  bg-black
                  px-6
                  py-3
                  text-center
                  text-xs
                  uppercase
                  tracking-[0.15em]
                  text-white
                  transition
                  hover:bg-stone-800
                "
              >
                Manage Orders
              </Link>


              {/* REVIEW PAYMENTS */}

              <Link
                href="/admin/orders"
                className="
                  rounded-full
                  border
                  border-stone-300
                  px-6
                  py-3
                  text-center
                  text-xs
                  uppercase
                  tracking-[0.15em]
                  transition
                  hover:border-black
                "
              >
                Review Payments
              </Link>


              {/* MANAGE INVENTORY */}

              <Link
                href="/admin/inventory"
                className="
                  rounded-full
                  border
                  border-stone-300
                  px-6
                  py-3
                  text-center
                  text-xs
                  uppercase
                  tracking-[0.15em]
                  transition
                  hover:border-black
                "
              >
                Manage Inventory
              </Link>


            </div>


          </section>


          {/* =================================================
              PAYMENT REVIEW QUEUE
          ================================================= */}

          <section
            className="
              rounded-2xl
              border
              border-stone-200
              p-6
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
              Payment Verification
            </p>


            <div
              className="
                mt-6
                space-y-4
              "
            >


              {paymentReviewOrders.length === 0 && (

                <p
                  className="
                    text-sm
                    text-neutral-500
                  "
                >
                  No payment requires review.
                </p>

              )}


              {paymentReviewOrders.map(
                (order) => (

                  <div
                    key={order.id}
                    className="
                      flex
                      items-center
                      justify-between
                      rounded-xl
                      border
                      border-stone-200
                      p-4
                    "
                  >

                    <div>

                      <p
                        className="
                          text-sm
                          font-medium
                        "
                      >
                        {order.orderNumber}
                      </p>


                      <p
                        className="
                          text-xs
                          text-neutral-500
                        "
                      >
                        Bank Transfer
                      </p>

                    </div>


                    <Link
                      href={`/admin/orders/${order.id}`}
                      className="
                        rounded-full
                        border
                        border-stone-300
                        px-4
                        py-2
                        text-xs
                        uppercase
                        tracking-wider
                        transition
                        hover:border-black
                      "
                    >
                      Review
                    </Link>

                  </div>

                )
              )}


            </div>


          </section>


        </div>


      </Container>


    </main>

  );

}